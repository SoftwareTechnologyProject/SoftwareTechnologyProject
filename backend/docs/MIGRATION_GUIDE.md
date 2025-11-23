# Hướng dẫn sử dụng Book API

## Giới thiệu

API này quản lý sách trong hệ thống Bookstore với các tính năng:
- CRUD sách (Tạo, Đọc, Cập nhật, Xóa)
- Tự động quản lý tác giả, nhà xuất bản, thể loại
- Hỗ trợ nhiều phiên bản giá cho 1 cuốn sách
- Hỗ trợ nhiều hình ảnh cho mỗi phiên bản

## Chạy Project

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

## Chi tiết API Endpoints

### 1. GET /books - Lấy tất cả sách

**Mục đích:** Hiển thị danh sách sách trên trang chủ/catalog

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

**Ví dụ test qua Swagger:**
1. Mở Swagger UI
2. Chọn `POST /books`
3. Click "Try it out"
4. Paste JSON vào Request body
5. Click "Execute"

---

### 4. PUT /books/{id} - Cập nhật sách

**Mục đích:** Sửa thông tin sách (tiêu đề, mô tả, tác giả...)

**Example:** `PUT /books/1`

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

**Example:** `DELETE /books/1`

**Response:** `204 No Content` (thành công)

**Hành vi Cascade:**
- Xóa sách → Tự động xóa luôn:
  - Tất cả BookVariants của sách đó
  - Tất cả BookImages của các variants
  - Liên kết trong `book_author`, `book_category`
- **KHÔNG xóa:** Author, Publisher, Category (vì có thể được sách khác dùng)

---

### 6. GET /books/category/{categoryName} - Lọc theo thể loại

**Mục đích:** Hiển thị sách theo danh mục

**Example:** `GET /books/category/Programming`

**Response:** Array các sách thuộc category "Programming"

**Use case:** 
- User click vào category "Java" → Hiện tất cả sách Java
- Sidebar filter categories

---

## Kịch bản Test đầy đủ

### Test Case 1: Tạo sách đầu tiên

```bash
POST /books
{
  "title": "Head First Java",
  "publisherName": "O'Reilly Media",
  "publisherYear": 2022,
  "authorNames": ["Kathy Sierra", "Bert Bates"],
  "categoryNames": ["Java", "Beginner"]
}
```

**Kết quả mong đợi:**
- Response có `id: 1`
- Bảng `author` có 2 records: Kathy Sierra, Bert Bates
- Bảng `publisher` có 1 record: O'Reilly Media
- Bảng `category` có 2 records: Java, Beginner
- Bảng `book_author` có 2 records (liên kết book 1 với 2 authors)
- Bảng `book_category` có 2 records (liên kết book 1 với 2 categories)

### Test Case 2: Tạo sách thứ 2 cùng publisher

```bash
POST /books
{
  "title": "Learning Python",
  "publisherName": "O'Reilly Media",  # Trùng với sách trước
  "publisherYear": 2021,
  "authorNames": ["Mark Lutz"],
  "categoryNames": ["Python", "Beginner"]  # "Beginner" đã tồn tại
}
```

**Kết quả mong đợi:**
- Response có `id: 2`
- Bảng `publisher` **VẪN CHỈ CÓ 1 record** (không tạo trùng "O'Reilly Media")
- Bảng `category` thêm 1 record "Python", giữ nguyên "Beginner"

### Test Case 3: Update sách

```bash
PUT /books/1
{
  "title": "Head First Java (3rd Edition)",
  "publisherName": "O'Reilly Media",
  "publisherYear": 2023,
  "authorNames": ["Kathy Sierra"],  # Xóa "Bert Bates"
  "categoryNames": ["Java"]  # Xóa "Beginner"
}
```

**Kết quả mong đợi:**
- Title đổi thành "3rd Edition"
- `book_author` chỉ còn 1 record (Kathy Sierra)
- Bert Bates vẫn tồn tại trong bảng `author` (có thể sách khác dùng)

### Test Case 4: Lọc theo category

```bash
GET /books/category/Java
```

**Kết quả mong đợi:**
- Response có 1 sách: "Head First Java (3rd Edition)"

### Test Case 5: Xóa sách

```bash
DELETE /books/1
```

**Kết quả mong đợi:**
- Bảng `book` xóa record id=1
- Bảng `book_author`, `book_category` xóa liên kết của sách 1
- Bảng `author`, `publisher`, `category` **KHÔNG BỊ XÓA**

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
