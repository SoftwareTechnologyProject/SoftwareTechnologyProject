# Hướng dẫn sử dụng Book API

## Mục lục
- [Giới thiệu](#giới-thiệu)
- [Khởi động hệ thống](#khởi-động-hệ-thống)
- [Danh sách API](#danh-sách-api)
- [Hướng dẫn test API](#hướng-dẫn-test-api)
- [Troubleshooting](#troubleshooting)

## Giới thiệu

API này quản lý sách trong hệ thống Bookstore với các tính năng:
- **CRUD sách**: Tạo, Đọc, Cập nhật, Xóa
- **Tự động quản lý**: Tác giả, nhà xuất bản, thể loại (không cần tạo trước)
- **Hỗ trợ nhiều phiên bản giá**: 1 cuốn sách có thể có nhiều giá (bìa cứng, bìa mềm...)
- **Hỗ trợ nhiều hình ảnh**: Mỗi phiên bản có nhiều hình ảnh riêng

## Khởi động hệ thống

### Bước 1: Khởi động PostgreSQL

```bash
cd backend
docker compose up -d db
```

Kiểm tra PostgreSQL đã chạy:
```bash
docker ps | grep bookstore_db
```

### Bước 2: Chạy Backend

```bash
mvn spring-boot:run
```

Hoặc nếu có Maven Wrapper:
```bash
./mvnw spring-boot:run
```

### Bước 3: Mở Swagger UI

Truy cập: **http://localhost:8080/swagger-ui/index.html**

Backend đã sẵn sàng khi thấy log:
```
Started BackendApplication in X.XXX seconds
```

---

## Danh sách API

| Method | Endpoint | Mục đích |
|--------|----------|----------|
| GET | `/books` | Lấy tất cả sách (có phân trang) |
| GET | `/books/{id}` | Lấy chi tiết 1 sách |
| POST | `/books` | Tạo sách mới |
| PUT | `/books/{id}` | Cập nhật sách |
| DELETE | `/books/{id}` | Xóa sách |
| GET | `/books/search` | Tìm kiếm sách theo title/category/author/publisher |

---

## Chi tiết API Endpoints

### 1. GET /books - Lấy tất cả sách

**Mục đích:** Hiển thị danh sách sách trên trang chủ/catalog

**URL:** `GET http://localhost:8080/books`

**Parameters (tùy chọn):**
- `page`: Số trang (mặc định 0)
- `size`: Số sách mỗi trang (mặc định 10)
- `sortBy`: Sắp xếp theo trường (title, publisherYear...)

**Ví dụ:** `GET http://localhost:8080/books?page=0&size=20&sortBy=title`

**Response Example:**
```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "description": "A Handbook of Agile Software Craftsmanship",
    "publisherYear": 2008,
    "publisherId": 1,
    "publisherName": "Prentice Hall",
    "authorNames": ["Robert C. Martin"],
    "categoryNames": ["Programming", "Software Engineering"],
    "variants": [
      {
        "id": 1,
        "price": 450000,
        "quantity": 100,
        "sold": 25,
        "status": "AVAILABLE",
        "imageUrls": [
          "https://example.com/clean-code-cover.jpg",
          "https://example.com/clean-code-back.jpg"
        ]
      },
      {
        "id": 2,
        "price": 350000,
        "quantity": 50,
        "sold": 10,
        "status": "AVAILABLE",
        "imageUrls": ["https://example.com/clean-code-paperback.jpg"]
      }
    ]
  }
]
```

**Giải thích:**
- `variants`: Mảng các phiên bản (VD: bìa cứng 450k, bìa mềm 350k)
- `imageUrls`: Mảng hình ảnh cho từng variant
- `authorNames`, `categoryNames`: Mảng vì 1 sách có thể có nhiều tác giả/thể loại

---

### 2. GET /books/{id} - Lấy chi tiết 1 sách

**Mục đích:** Hiển thị trang chi tiết sách

**Example:** `GET /books/1`

**Response:** Giống format trên, chỉ trả về 1 object thay vì array

**Use case:** Khi user click vào sách → Hiện trang detail với đầy đủ thông tin

---

### 3. POST /books - Tạo sách mới

**Mục đích:** Admin thêm sách vào hệ thống

**Request Body:**
```json
{
  "title": "Effective Java",
  "description": "Best practices for the Java platform",
  "publisherYear": 2018,
  "publisherName": "Addison-Wesley",
  "authorNames": ["Joshua Bloch"],
  "categoryNames": ["Java", "Programming"]
}
```

**Response:** Trả về sách vừa tạo với ID mới

**Lưu ý quan trọng:**
1. **Tự động tạo Author/Publisher/Category:**
   - Nếu "Addison-Wesley" chưa có trong bảng `publisher` → Tự động tạo mới
   - Nếu "Joshua Bloch" chưa có trong bảng `author` → Tự động tạo mới
   - Nếu "Java" chưa có trong bảng `category` → Tự động tạo mới

2. **BookVariants và BookImages:**
   - Endpoint này chỉ tạo thông tin cơ bản của sách
   - Giá, số lượng, hình ảnh cần tạo riêng sau (sẽ có API riêng)

---

### 4. PUT /books/{id} - Cập nhật sách

**Mục đích:** Sửa thông tin sách (tiêu đề, mô tả, tác giả...)

**URL:** `PUT http://localhost:8080/books/{id}`

**Request Body:**
```json
{
  "title": "Clean Code (Updated Edition)",
  "description": "New description here",
  "publisherYear": 2020,
  "publisherName": "Prentice Hall",
  "authorNames": ["Robert C. Martin", "New Co-author"],
  "categoryNames": ["Programming", "Best Practices"]
}
```

**Hành vi:**
- Cập nhật title, description, publisherYear
- Thay đổi relationships (authors, categories)
- Nếu thêm tác giả mới → Tự động tạo trong bảng `author`

---

### 5. DELETE /books/{id} - Xóa sách

**Mục đích:** Admin xóa sách khỏi hệ thống

**URL:** `DELETE http://localhost:8080/books/{id}`

**Response:** `204 No Content` (thành công)

**Hành vi Cascade:**
- Xóa sách → Tự động xóa luôn:
  - Tất cả BookVariants của sách đó
  - Tất cả BookImages của các variants
  - Liên kết trong `book_author`, `book_category`
- **KHÔNG xóa:** Author, Publisher, Category (vì có thể được sách khác dùng)

---

### 6. GET /books/search - Tìm kiếm sách

**Mục đích:** Tìm kiếm sách theo nhiều tiêu chí

**URL:** `GET http://localhost:8080/books/search`

**Parameters (chọn 1 trong các tùy chọn):**
- `title`: Tìm theo tên sách (VD: `title=Clean Code`)
- `category`: Tìm theo thể loại (VD: `category=Programming`)
- `author`: Tìm theo tác giả (VD: `author=Robert Martin`)
- `publisher`: Tìm theo nhà xuất bản (VD: `publisher=Prentice Hall`)

**Kết hợp với phân trang:**
- `page`: Số trang (mặc định 0)
- `size`: Số kết quả mỗi trang (mặc định 10)

**Ví dụ:**
```
GET /books/search?category=Java&page=0&size=20
GET /books/search?author=Joshua Bloch
GET /books/search?title=Effective
```

**Response:** Array các sách phù hợp với điều kiện tìm kiếm

**Use case:** 
- User gõ tìm kiếm → Frontend gọi `/books/search?title=...`
- User click vào category "Java" → Frontend gọi `/books/search?category=Java`
- Sidebar filter theo tác giả/thể loại

---

## Hướng dẫn test API

#### Test Case 1: Tạo sách đầu tiên

**Request:**
```json
POST /books
{
  "title": "Head First Java",
  "publisherName": "O'Reilly Media",
  "publisherYear": 2022,
  "authorNames": ["Kathy Sierra", "Bert Bates"],
  "categoryNames": ["Java", "Beginner"]
}
```

**Cách test qua Swagger:**
1. Mở Swagger UI → Chọn `POST /books`
2. Click "Try it out"
3. Copy JSON trên vào Request body
4. Click "Execute"

**Kết quả mong đợi:**
- Response có `id: 1`
- Bảng `author` có 2 records: Kathy Sierra, Bert Bates
- Bảng `publisher` có 1 record: O'Reilly Media
- Bảng `category` có 2 records: Java, Beginner
- Bảng `book_author` có 2 records (liên kết book 1 với 2 authors)
- Bảng `book_category` có 2 records (liên kết book 1 với 2 categories)

#### Test Case 2: Tạo sách thứ 2 cùng publisher

**Request:**
```json
POST /books
{
  "title": "Learning Python",
  "publisherName": "O'Reilly Media",
  "publisherYear": 2021,
  "authorNames": ["Mark Lutz"],
  "categoryNames": ["Python", "Beginner"]
}
```

**Lưu ý:** "O'Reilly Media" và "Beginner" đã tồn tại từ Test Case 1

**Kết quả mong đợi:**
- Response có `id: 2`
- Bảng `publisher` **VẪN CHỈ CÓ 1 record** (không tạo trùng "O'Reilly Media")
- Bảng `category` thêm 1 record "Python", giữ nguyên "Beginner"

#### Test Case 3: Update sách

**Request:**
```json
PUT /books/1
{
  "title": "Head First Java (3rd Edition)",
  "publisherName": "O'Reilly Media",
  "publisherYear": 2023,
  "authorNames": ["Kathy Sierra"],
  "categoryNames": ["Java"]
}
```

**Lưu ý:** Xóa "Bert Bates" và "Beginner" khỏi sách này

**Kết quả mong đợi:**
- Title đổi thành "3rd Edition"
- `book_author` chỉ còn 1 record (Kathy Sierra)
- Bert Bates vẫn tồn tại trong bảng `author` (có thể sách khác dùng)

#### Test Case 4: Tìm kiếm sách

**Request:**
```
GET /books/search?category=Java
```

**Cách test qua Swagger:**
1. Mở Swagger UI → Chọn `GET /books/search`
2. Click "Try it out"
3. Nhập "Java" vào ô `category`
4. Click "Execute"

**Kết quả mong đợi:**
- Response có 1 sách: "Head First Java (3rd Edition)"

#### Test Case 5: Xóa sách

**Request:**
```
DELETE /books/1
```

**Cách test qua Swagger:**
1. Mở Swagger UI → Chọn `DELETE /books/{id}`
2. Click "Try it out"
3. Nhập "1" vào ô `id`
4. Click "Execute"

**Kết quả mong đợi:**
- Response status code: `204 No Content`
- Bảng `book` xóa record id=1
- Bảng `book_author`, `book_category` xóa liên kết của sách 1
- Bảng `author`, `publisher`, `category` **KHÔNG BỊ XÓA**

---

## Kiểm tra kết quả test

### Cách 1: Qua Swagger UI
Sau mỗi test case, gọi `GET /books` hoặc `GET /books/{id}` để xem kết quả

### Cách 2: Qua Database (psql)
```bash
docker exec -it bookstore_db psql -U postgres -d bookstore
```

Các câu lệnh hữu ích:
```sql
-- Xem tất cả sách
SELECT * FROM book;

-- Xem tác giả
SELECT * FROM author;

-- Xem liên kết sách-tác giả
SELECT b.title, a.name 
FROM book b
JOIN book_author ba ON b.id = ba.book_id
JOIN author a ON ba.author_id = a.id;

-- Thoát psql
\q
```

### Cách 3: Qua log của Backend
Kiểm tra terminal đang chạy `mvn spring-boot:run` để xem SQL queries

---

## Configuration Quan trọng

### File: `application.yaml`

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop  # ⚠️ XÓA tất cả data khi restart
```

**Các giá trị có thể:**
- `create-drop`: Xóa + tạo lại schema mỗi lần restart → **Chỉ dùng khi dev/test**
- `update`: Giữ data, chỉ update schema → **Dùng khi production**
- `validate`: Chỉ kiểm tra schema, không sửa gì → **Dùng khi deploy**
- `none`: Không làm gì cả

**❗ Sau khi test xong, PHẢI đổi thành `update`:**
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

---

## Troubleshooting

### Lỗi: "Connection refused to localhost:5432"

**Nguyên nhân:** PostgreSQL chưa chạy

**Giải pháp:**
```bash
docker compose up -d db
docker ps | grep bookstore_db
```

### Lỗi: "Table 'books' doesn't exist"

**Nguyên nhân:** Hibernate chưa tạo bảng

**Giải pháp:**
1. Kiểm tra `application.yaml` có `ddl-auto: create-drop` hoặc `update`
2. Restart backend → Hibernate sẽ tự tạo bảng

### Data bị mất sau khi restart

**Nguyên nhân:** `ddl-auto: create-drop`

**Giải pháp:** Đổi thành `update`

### Lỗi: 400 Bad Request khi tạo sách

**Nguyên nhân:** Thiếu trường bắt buộc hoặc format JSON sai

**Giải pháp:**
- Kiểm tra `title` không được trống
- Kiểm tra JSON format đúng (có dấu ngoặc kép, dấu phẩy...)
- Xem thông báo lỗi chi tiết trong Response body

### Lỗi: 404 Not Found khi GET /books/{id}

**Nguyên nhân:** Sách với ID đó không tồn tại

**Giải pháp:**
- Gọi `GET /books` trước để xem danh sách ID có sẵn
- Tạo sách mới với `POST /books` rồi dùng ID được trả về

---

## Best Practices

### 1. Luôn dùng DTO khi trả về API

✅ **Đúng:**
```java
BookDTO dto = bookService.convertToDTO(book);
return ResponseEntity.ok(dto);
```

❌ **Sai:**
```java
return ResponseEntity.ok(book); // Có thể gây infinite recursion
```

### 2. Validation

API đã có validation sẵn:
- `title` không được trống (400 Bad Request nếu vi phạm)
- `price` phải >= 0
- `quantity`, `sold` phải >= 0

### 3. Pagination (TODO)

Hiện tại `GET /books` trả về **TẤT CẢ** sách → Có thể chậm nếu nhiều data.

**Cải tiến tương lai:**
```
GET /books?page=0&size=20
```

---

## Bước tiếp theo

1. Test tất cả API qua Swagger
2. Tạo API cho BookVariants (POST /books/{id}/variants)
3. Tạo API cho BookImages (POST /variants/{id}/images)
4. Tạo API quản lý Author/Publisher/Category riêng
5. Implement pagination cho GET /books
6. Update Frontend để call API mới
