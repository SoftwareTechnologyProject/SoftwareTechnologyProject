# Book Management Module - Database Schema

## Mục đích

Module này quản lý sách trong hệ thống Bookstore với **normalized database schema** - tách riêng thông tin tác giả, nhà xuất bản, thể loại, giá cả và hình ảnh thành các bảng độc lập để tránh trùng lặp dữ liệu.

## Cấu trúc Database

### Các bảng chính:

```
book (Thông tin cơ bản của sách)
  ├─ id, title, description
  ├─ publisherId (FK) → Publisher
  ├─ publisherYear
  └─ publishedAt, updatedAt

author (Tác giả)
  └─ id, name

publisher (Nhà xuất bản)
  └─ id, name

category (Thể loại)
  └─ id, name

bookvariants (Phiên bản sách - giá, tồn kho)
  ├─ id, bookId (FK) → Book
  ├─ price, quantity, sold
  └─ status (AVAILABLE/OUT_OF_STOCK)

bookimages (Hình ảnh sách)
  ├─ id, bookVariantsId (FK) → BookVariants
  └─ imageUrl
```

### Bảng liên kết (Many-to-Many):

```
book_author: Liên kết Book ↔ Author
book_category: Liên kết Book ↔ Category
```

### Mối quan hệ:

```
Book ──┬── N:1 ──> Publisher
       ├── M:N ──> Author
       ├── M:N ──> Category
       └── 1:N ──> BookVariants ──1:N──> BookImages
```

**Giải thích:**
- 1 sách có **1 nhà xuất bản** (N:1)
- 1 sách có **nhiều tác giả** (M:N) - VD: sách do nhiều người cùng viết
- 1 sách thuộc **nhiều thể loại** (M:N) - VD: vừa là "Programming" vừa là "Java"
- 1 sách có **nhiều variants** (1:N) - VD: bìa cứng 500k, bìa mềm 350k
- 1 variant có **nhiều hình** (1:N) - VD: ảnh bìa, ảnh mặt sau, ảnh chi tiết

## API Endpoints

### GET /books
Lấy danh sách tất cả sách với đầy đủ thông tin

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
          "https://example.com/clean-code-1.jpg",
          "https://example.com/clean-code-2.jpg"
        ]
      }
    ]
  }
]
```

### GET /books/{id}
Lấy thông tin chi tiết 1 cuốn sách

### POST /books
Tạo sách mới

**Request Body:**
```json
{
  "title": "Effective Java",
  "description": "Best practices for Java programming",
  "publisherYear": 2018,
  "publisherName": "Addison-Wesley",
  "authorNames": ["Joshua Bloch"],
  "categoryNames": ["Java", "Programming"]
}
```

**Lưu ý:** 
- Hệ thống tự động tạo Author/Publisher/Category nếu chưa tồn tại
- BookVariants và BookImages cần tạo riêng sau

### PUT /books/{id}
Cập nhật thông tin sách

### DELETE /books/{id}
Xóa sách (cascade xóa luôn variants và images)

### GET /books/category/{categoryName}
Lọc sách theo thể loại

## Cấu trúc Code

### Models (Entity classes)
```
model/
  ├── Book.java - Entity chính
  ├── Author.java - Tác giả
  ├── Publisher.java - Nhà xuất bản
  ├── Category.java - Thể loại
  ├── BookVariants.java - Phiên bản sách
  └── BookImages.java - Hình ảnh
```

### Repositories (Data Access)
```
repository/
  ├── BookRepository.java
  ├── AuthorRepository.java
  ├── PublisherRepository.java
  ├── CategoryRepository.java
  ├── BookVariantsRepository.java
  └── BookImagesRepository.java
```

### DTOs (Data Transfer Objects)
```
dto/
  └── BookDTO.java - Định dạng dữ liệu cho API
       └── BookVariantDTO (nested class)
```

### Services & Controllers
```
service/impl/BookServiceImpl.java - Business logic + DTO conversion
controller/BookController.java - REST API endpoints
```

## Cách chạy

### 1. Khởi động PostgreSQL
```bash
cd backend
docker compose up -d db
```

### 2. Chạy Spring Boot
```bash
mvn spring-boot:run
```

### 3. Truy cập Swagger UI
http://localhost:8080/swagger-ui/index.html

## Ví dụ sử dụng

### Tạo sách mới qua Swagger:

1. Mở Swagger UI → `/books` → `POST`
2. Nhập dữ liệu:
```json
{
  "title": "Head First Java",
  "publisherName": "O'Reilly",
  "publisherYear": 2022,
  "authorNames": ["Kathy Sierra", "Bert Bates"],
  "categoryNames": ["Java", "Beginner"]
}
```
3. Execute → Sách được tạo với ID mới

### Xem kết quả:

`GET /books/{id}` sẽ trả về sách với đầy đủ thông tin author, publisher, category đã được liên kết.

## Cấu hình quan trọng

File: `src/main/resources/application.yaml`

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop  # ⚠️ XÓA data mỗi lần restart
```

**Lưu ý:** 
- `create-drop`: Xóa và tạo lại schema mỗi lần chạy -> Dùng khi dev/test
- `update`: Giữ nguyên data, chỉ update schema -> Dùng khi production

Sau khi test xong, **đổi lại thành `update`** để không mất dữ liệu!

## Ghi chú kỹ thuật

### Tại sao dùng Normalized Schema?

Ưu điểm:
- Không lưu trùng lặp (VD: "Robert C. Martin" chỉ lưu 1 lần trong bảng Author)
- Dễ cập nhật (sửa tên tác giả 1 lần, tất cả sách đều update)
- Hỗ trợ nhiều variants (1 sách nhiều giá)
- Hỗ trợ nhiều hình ảnh

Nhược điểm:
- Query phức tạp hơn (nhiều JOIN)
- API cần DTO để gộp dữ liệu
- Frontend phải xử lý nested objects
