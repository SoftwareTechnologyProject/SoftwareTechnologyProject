import pandas as pd
import psycopg2
import os
import requests
import zipfile
import shutil
import time
import boto3
from botocore.exceptions import NoCredentialsError, ClientError

# Database Config
DB_HOST = os.environ.get("DB_HOST", "db")
DB_NAME = os.environ.get("POSTGRES_DB", "bookstore")
DB_USER = os.environ.get("POSTGRES_USER", "postgres")
DB_PASS = os.environ.get("POSTGRES_PASSWORD", "123456")
DB_PORT = os.environ.get("DB_PORT", "5432")

# AWS S3 Config
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
AWS_BUCKET_NAME = os.environ.get("AWS_BUCKET_NAME")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

# Data Source
DOWNLOAD_URL = "https://github.com/MinhNguyen1510/testwebproject/releases/download/v1.0.0/book.zip"

def get_db_connection():
    return psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=DB_PORT)

def wait_for_db():
    print("--> [Seeder] Đang kết nối Database...")
    while True:
        try:
            conn = get_db_connection()
            conn.close()
            print("--> [Seeder] Kết nối Database thành công!")
            break
        except psycopg2.OperationalError:
            print("--> [Seeder] DB chưa sẵn sàng, chờ 2s...")
            time.sleep(2)

def download_and_extract():
    if not os.path.exists("book.zip"):
        print("--> [Seeder] Đang tải dữ liệu mẫu (book.zip)...")
        try:
            r = requests.get(DOWNLOAD_URL, timeout=30)
            with open("book.zip", "wb") as f:
                f.write(r.content)
        except Exception as e:
            print(f"!!! Lỗi tải file: {e}")
            exit(1)

    print("--> [Seeder] Đang giải nén...")
    with zipfile.ZipFile("book.zip", 'r') as zip_ref:
        zip_ref.extractall("temp_data")

    # Tìm thư mục gốc dữ liệu
    base_path = "temp_data"
    if "Data" in os.listdir(base_path): base_path = os.path.join(base_path, "Data")
    elif "book" in os.listdir(base_path): base_path = os.path.join(base_path, "book")
    return base_path

def safe_val(x):
    """Xử lý giá trị NaN của Pandas thành None cho SQL"""
    return None if (x is None or (isinstance(x, float) and pd.isna(x))) else x

def upload_to_s3_smart(local_file_path, s3_key):

    if not AWS_ACCESS_KEY or not AWS_BUCKET_NAME:
        print("!!! Thiếu cấu hình AWS, không thể upload ảnh.")
        return None

    s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY,
                      aws_secret_access_key=AWS_SECRET_KEY,
                      region_name=AWS_REGION)

    file_url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"

    try:
        s3.head_object(Bucket=AWS_BUCKET_NAME, Key=s3_key)
        # Nếu không văng lỗi nghĩa là file đã có
        # print(f"--> [Skip] Ảnh đã có trên S3: {s3_key}")
        return file_url

    except ClientError as e:
        if e.response['Error']['Code'] == "404":
            try:
                s3.upload_file(local_file_path, AWS_BUCKET_NAME, s3_key)
                print(f"--> [Upload] Đã đẩy lên S3: {s3_key}")
                return file_url
            except Exception as up_err:
                print(f"!!! Lỗi upload {s3_key}: {up_err}")
                return None
        else:
            print(f"!!! Lỗi kiểm tra S3: {e}")
            return None
    except NoCredentialsError:
        print("!!! Sai thông tin đăng nhập AWS")
        return None

def main():
    wait_for_db()
    base_dir = download_and_extract()
    print(f"--> Thư mục dữ liệu gốc: {base_dir}")

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # import categories
        cat_path = os.path.join(base_dir, "tiki_categories.csv")
        if os.path.exists(cat_path):
            print(f"--> [Import] Categories...")
            categories = pd.read_csv(cat_path, dtype={"id": "Int64"})
            for _, r in categories.iterrows():
                cid = int(r["id"])
                name = safe_val(r.get("name"))

                cur.execute("SELECT id FROM category WHERE id = %s", (cid,))
                if cur.fetchone():
                    cur.execute("UPDATE category SET name = %s WHERE id = %s", (name, cid))
                else:
                    cur.execute("INSERT INTO category (id, name) VALUES (%s, %s)", (cid, name))
            conn.commit()

        # import books, authors, publishers, variants
        books_path = os.path.join(base_dir, "tiki_books_from_leaf.csv")
        if os.path.exists(books_path):
            print(f"--> [Import] Books, Authors, Publishers & Variants...")
            books = pd.read_csv(books_path, dtype={"id": str})
            books.columns = [c.strip() for c in books.columns]

            publisher_cache = {}
            author_cache = {}
            tiki_id_to_title_map = {}

            def upsert_publisher(name):
                if not name or pd.isna(name): return None
                name = str(name).strip()
                if name in publisher_cache: return publisher_cache[name]

                cur.execute("SELECT id FROM publisher WHERE name = %s", (name,))
                res = cur.fetchone()
                if res:
                    pid = res[0]
                else:
                    cur.execute("INSERT INTO publisher (name) VALUES (%s) RETURNING id", (name,))
                    pid = cur.fetchone()[0]

                publisher_cache[name] = pid
                return pid

            def upsert_author(name):
                if not name or pd.isna(name): return None
                name = str(name).strip()
                if name in author_cache: return author_cache[name]

                cur.execute("SELECT id FROM author WHERE name = %s", (name,))
                res = cur.fetchone()
                if res:
                    aid = res[0]
                else:
                    cur.execute("INSERT INTO author (name) VALUES (%s) RETURNING id", (name,))
                    aid = cur.fetchone()[0]

                author_cache[name] = aid
                return aid

            count = 0
            for i, row in books.iterrows():
                tiki_id = str(row["id"]).strip()
                title = safe_val(row.get("title")) or "Untitled"

                # Lưu map để dùng cho ảnh
                tiki_id_to_title_map[tiki_id] = title

                pub_name = safe_val(row.get("publisher"))
                publisher_id = upsert_publisher(pub_name) if pub_name else None

                description = safe_val(row.get("description"))

                pub_year = None
                if "publish_year" in row:
                    try: pub_year = int(row.get("publish_year"))
                    except: pass

                # Insert Book
                cur.execute("""
                    INSERT INTO book (title, publisher_id, publisher_year, description, published_at, updated_at)
                    VALUES (%s, %s, %s, %s, NOW(), NOW())
                    RETURNING id
                """, (title, publisher_id, pub_year, description))
                book_id = cur.fetchone()[0]

                # Insert Authors
                if "author" in row and pd.notna(row.get("author")):
                    authors = [a.strip() for a in str(row["author"]).split(",") if a.strip()]
                    for an in authors:
                        aid = upsert_author(an)
                        # Link Book-Author
                        cur.execute("SELECT 1 FROM book_author WHERE book_id=%s AND author_id=%s", (book_id, aid))
                        if not cur.fetchone():
                            cur.execute("INSERT INTO book_author (book_id, author_id) VALUES (%s, %s)", (book_id, aid))

                # Prepare Variant Data
                price = 0.0
                if "price" in row:
                    try: price = float(row.get("price"))
                    except: pass

                quantity = 0
                if "quantity" in row:
                    try: quantity = int(row.get("quantity"))
                    except: quantity = 0

                book_format = safe_val(row.get("format"))
                book_size = safe_val(row.get("size"))

                weight = None
                if "weight" in row:
                    try: weight = float(row.get("weight"))
                    except: pass

                edition = safe_val(row.get("edition"))

                sold = 0
                if "quantity_sold" in row:
                    try: sold = int(row.get("quantity_sold"))
                    except: pass

                isbn = safe_val(row.get("isbn13")) if "isbn13" in row else None

                # Insert Book Variant
                cur.execute("""
                    INSERT INTO book_variants (book_id, price, quantity, sold, status, isbn, format, size, weight, edition)
                    VALUES (%s, %s, %s, %s, 'AVAILABLE', %s, %s, %s, %s, %s)
                    RETURNING id
                """, (book_id, price, quantity, sold, isbn, book_format, book_size, weight, edition))

                # Link Book-Category
                if "category_id" in row and pd.notna(row.get("category_id")):
                    try:
                        cat_id = int(row.get("category_id"))
                        cur.execute("SELECT 1 FROM book_category WHERE book_id=%s AND category_id=%s", (book_id, cat_id))
                        if not cur.fetchone():
                            cur.execute("INSERT INTO book_category (book_id, category_id) VALUES (%s, %s)", (book_id, cat_id))
                    except: pass

                count += 1
                if count % 100 == 0:
                    conn.commit()
                    print(f"--> Đã import {count} sách...")

            conn.commit()
            print(f"--> Hoàn tất import {count} sách.")
        else:
            print(f"LỖI: Không tìm thấy file sách tại {books_path}")

        # Import Images to S3 & DB

        images_root = os.path.join(base_dir, "images")

        if os.path.exists(images_root) and AWS_BUCKET_NAME:
            print(f"--> [S3] Bắt đầu xử lý ảnh từ: {images_root}")

            tiki_id_to_title = {}
            if os.path.exists(books_path):
                df_map = pd.read_csv(books_path, dtype={"id": str}, usecols=["id", "title"])
                for _, row in df_map.iterrows():
                    tid = str(row["id"]).strip()
                    ttitle = safe_val(row.get("title"))
                    if ttitle:
                        tiki_id_to_title[tid] = ttitle

            img_processed = 0
            img_uploaded = 0

            for folder in os.listdir(images_root):
                tiki_id = folder.strip()

                # Tìm tên sách dựa vào tên thư mục (Tiki ID)
                book_title = tiki_id_to_title.get(tiki_id)

                # Nếu không tìm thấy tên sách trong CSV, bỏ qua folder này
                if not book_title:
                    continue

                # Tìm variant_id trong Database dựa vào Tên Sách
                # (Cách này an toàn nhất, lấy ID thực tế từ DB)
                cur.execute("""
                    SELECT bv.id
                    FROM book_variants bv
                    JOIN book b ON bv.book_id = b.id
                    WHERE b.title = %s
                    LIMIT 1
                """, (book_title,))

                res = cur.fetchone()

                if not res:
                    continue

                variant_id = res[0]
                src_folder_path = os.path.join(images_root, folder)
                if not os.path.isdir(src_folder_path): continue

                for fname in sorted(os.listdir(src_folder_path)):
                    if fname.lower().endswith(('.jpg', '.png', '.webp')):
                        local_path = os.path.join(src_folder_path, fname)

                        # Tạo key trên S3: images/{tiki_id}/{filename}
                        s3_key = f"images/{tiki_id}/{fname}"

                        # Gọi hàm upload thông minh (Idempotent)
                        s3_url = upload_to_s3_smart(local_path, s3_key)

                        if s3_url:
                            # Check xem ảnh này đã link vào sách chưa để tránh duplicate row
                            cur.execute("SELECT 1 FROM book_images WHERE book_variant_id=%s AND image_url=%s", (variant_id, s3_url))
                            if not cur.fetchone():
                                cur.execute("INSERT INTO book_images (book_variant_id, image_url) VALUES (%s, %s)", (variant_id, s3_url))
                                img_processed += 1
                                if "Đã đẩy lên S3" in str(s3_url):
                                    img_uploaded += 1

                conn.commit()

            print(f"--> Hoàn tất! Đã thêm {img_processed} ảnh vào Database.")

        elif not AWS_BUCKET_NAME:
            print("!!! [Warning] Không có cấu hình AWS BUCKET. Bỏ qua phần import ảnh.")
        else:
            print("!!! [Warning] Không tìm thấy thư mục ảnh.")

    except Exception as e:
        print(f"!!! LỖI SEEDER: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()
        print("--> [Seeder] Kết thúc chương trình.")

if __name__ == "__main__":
    main()