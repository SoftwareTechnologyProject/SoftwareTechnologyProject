import pandas as pd
import psycopg2
import os
import requests
import zipfile
import shutil
import time

DB_HOST = "db"
DB_NAME = os.environ.get("POSTGRES_DB", "bookstore")
DB_USER = os.environ.get("POSTGRES_USER", "postgres")
DB_PASS = os.environ.get("POSTGRES_PASSWORD", "123456")

SHARED_IMAGES_DIR = "/shared_data/images"
DOWNLOAD_URL = "https://github.com/MinhNguyen1510/testwebproject/releases/download/v1.0.0/book.zip"

def wait_for_db():
    while True:
        try:
            conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=5432)
            conn.close()
            break
        except psycopg2.OperationalError:
            time.sleep(2)

def download_and_extract():
    if not os.path.exists("book.zip"):
        r = requests.get(DOWNLOAD_URL)
        with open("book.zip", "wb") as f:
            f.write(r.content)

    print("--> [Seeder] Đang giải nén...")
    with zipfile.ZipFile("book.zip", 'r') as zip_ref:
        zip_ref.extractall("temp_data")

    base_path = "temp_data"
    if "Data" in os.listdir(base_path): base_path = os.path.join(base_path, "Data")
    elif "book" in os.listdir(base_path): base_path = os.path.join(base_path, "book")
    return base_path

def safe_val(x):
    return None if (x is None or (isinstance(x, float) and pd.isna(x))) else x

def main():
    wait_for_db()
    base_dir = download_and_extract()
    print(f"--> Thư mục dữ liệu gốc: {base_dir}")

    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST, port=5432)
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

        # import images
        images_root = os.path.join(base_dir, "images")
        if os.path.exists(images_root):
            print(f"--> [Import] Images từ: {images_root}")

            # Tạo thư mục shared nếu chưa có
            if not os.path.exists(SHARED_IMAGES_DIR):
                os.makedirs(SHARED_IMAGES_DIR, exist_ok=True)

            img_count = 0
            for folder in os.listdir(images_root):
                src_folder_path = os.path.join(images_root, folder)
                if not os.path.isdir(src_folder_path): continue

                tiki_id = folder.strip()
                # Tìm tên sách từ map
                book_title = tiki_id_to_title_map.get(tiki_id)
                if not book_title: continue

                # Tìm variant_id dựa trên tên sách
                cur.execute("SELECT bv.id FROM book_variants bv JOIN book b ON bv.book_id = b.id WHERE b.title = %s LIMIT 1", (book_title,))
                res = cur.fetchone()

                if res:
                    variant_id = res[0]

                    dest_folder_path = os.path.join(SHARED_IMAGES_DIR, tiki_id)
                    if not os.path.exists(dest_folder_path):
                        os.makedirs(dest_folder_path, exist_ok=True)

                    for fname in sorted(os.listdir(src_folder_path)):
                        if fname.lower().endswith(('.jpg', '.png', '.webp')):
                            src_file = os.path.join(src_folder_path, fname)
                            dest_file = os.path.join(dest_folder_path, fname)
                            shutil.copy2(src_file, dest_file)

                            # Đường dẫn lưu vào DB là relative path
                            img_rel_path = f"{tiki_id}/{fname}"

                            cur.execute("SELECT 1 FROM book_images WHERE book_variant_id=%s AND image_url=%s", (variant_id, img_rel_path))
                            if not cur.fetchone():
                                cur.execute("INSERT INTO book_images (book_variant_id, image_url) VALUES (%s, %s)", (variant_id, img_rel_path))
                                img_count += 1

                    conn.commit()
            print(f"--> Hoàn tất import {img_count} ảnh vào DB và Shared Volume!")
        else:
            print(f"--> Không tìm thấy folder images tại {images_root}")

    except Exception as e:
        print(f"!!! LỖI SEEDER: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()
        print("--> [Seeder] Kết thúc.")

if __name__ == "__main__":
    main()