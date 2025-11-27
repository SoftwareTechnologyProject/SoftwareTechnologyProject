# Book Management Module - Tổng quan Database Schema

## Mục lục
- [Giới thiệu](#giới-thiệu)
- [Cấu trúc Database](#cấu-trúc-database)
- [API Endpoints](#api-endpoints)
- [Cấu trúc Code](#cấu-trúc-code)
- [Hướng dẫn chạy](#hướng-dẫn-chạy)

## Giới thiệu

Module này quản lý sách trong hệ thống Bookstore sử dụng **normalized database schema** - tách riêng thông tin tác giả, nhà xuất bản, thể loại, giá cả và hình ảnh thành các bảng độc lập để:
- **Tránh trùng lặp dữ liệu**: Mỗi tác giả chỉ lưu 1 lần
- **Dễ cập nhật**: Sửa tên tác giả 1 lần, tất cả sách đều cập nhật
- **Hỗ trợ nhiều variants**: 1 sách có nhiều giá (bìa cứng, bìa mềm...)
- **Hỗ trợ nhiều hình ảnh**: Mỗi variant có nhiều hình riêng

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
Book ──┬── N:1 ──> Publisher (1 sách có 1 nhà xuất bản)
       ├── M:N ──> Author (1 sách có nhiều tác giả)
       ├── M:N ──> Category (1 sách thuộc nhiều thể loại)
       └── 1:N ──> BookVariants (1 sách có nhiều variants)
                   └── 1:N ──> BookImages (1 variant có nhiều hình)
```

**Ví dụ thực tế:**
- Sách "Clean Code" của Robert C. Martin:
  - 1 nhà xuất bản: Prentice Hall
  - 1 tác giả: Robert C. Martin
  - 2 thể loại: Programming, Software Engineering
  - 2 variants: Bìa cứng (450k), Bìa mềm (350k)
  - Mỗi variant có 2-3 hình ảnh (ảnh bìa, ảnh lưng, ảnh chi tiết)

---

## API Endpoints

### Tổng quan

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/books` | Lấy danh sách sách (có phân trang) |
| GET | `/books/{id}` | Chi tiết 1 sách |
| POST | `/books` | Tạo sách mới |
| PUT | `/books/{id}` | Cập nhật sách |
| DELETE | `/books/{id}` | Xóa sách |
| GET | `/books/search` | Tìm kiếm theo title/category/author/publisher |

### Chi tiết Response Format
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
### Chi tiết Response Format

**GET /books hoặc GET /books/{id} trả về:**
```json
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
```

**Giải thích các field:**
- `publisherId`, `publisherName`: Thông tin nhà xuất bản
- `authorNames`: Mảng tên tác giả (có thể có nhiều người)
- `categoryNames`: Mảng thể loại (có thể thuộc nhiều thể loại)
- `variants`: Mảng các phiên bản giá khác nhau
  - `price`: Giá bán (VND)
  - `quantity`: Số lượng tồn kho
  - `sold`: Số lượng đã bán
  - `status`: Trạng thái (AVAILABLE/OUT_OF_STOCK)
  - `imageUrls`: Mảng URL hình ảnh của variant này

---

## Cấu trúc Code

### 1. Models (Entity classes)
### 1. Models (Entity classes)

**Vị trí:** `src/main/java/com/bookstore/backend/model/`

| File | Mô tả | Validation |
|------|-------|------------|
| `Book.java` | Entity chính quản lý sách | @NotBlank trên title |
| `Author.java` | Tác giả | @NotBlank trên name |
| `Publisher.java` | Nhà xuất bản | @NotBlank trên name |
| `Category.java` | Thể loại | @NotBlank trên name |
| `BookVariants.java` | Phiên bản sách (giá, tồn kho) | @NotNull price, @Min(0) price/quantity/sold |
| `BookImages.java` | Hình ảnh | @NotBlank trên imageUrl |

**Đặc điểm kỹ thuật:**
- Dùng Lombok (@Data, @Builder, @NoArgsConstructor, @AllArgsConstructor) để giảm boilerplate
- Dùng Bean Validation (@NotBlank, @NotNull, @Min) để validate dữ liệu
- Relationships sử dụng JPA annotations (@ManyToMany, @OneToMany, @ManyToOne)
- Cascade operations để tự động xóa dữ liệu liên quan

### 2. Repositories (Data Access)

**Vị trí:** `src/main/java/com/bookstore/backend/repository/`

| Repository | Mô tả |
|------------|-------|
| `BookRepository.java` | JPA repository với derived query methods |
| `AuthorRepository.java` | Tìm Author theo name |
| `PublisherRepository.java` | Tìm Publisher theo name |
| `CategoryRepository.java` | Tìm Category theo name |

**Đặc điểm:**
- 100% JPA derived query methods (không có @Query thủ công)
- Ví dụ: `findByCategoriesNameIgnoreCase(String, Pageable)`
- Hỗ trợ Pagination với Spring Data Pageable

### 3. DTOs (Data Transfer Objects)

**Vị trí:** `src/main/java/com/bookstore/backend/dto/`
### 3. DTOs (Data Transfer Objects)

**Vị trí:** `src/main/java/com/bookstore/backend/dto/`

| File | Mô tả |
|------|-------|
| `BookDTO.java` | Định dạng dữ liệu cho API response |
| `BookVariantDTO` | Nested class trong BookDTO cho variants |

**Tại sao cần DTO?**
- Tránh infinite recursion khi serialize Entity (Book → Author → Book → ...)
- Flatten nested relationships thành format dễ đọc
- Ẩn các field không cần thiết (createdAt, updatedAt...)
- Frontend nhận được nested objects thay vì chỉ IDs

### 4. Services & Controllers

**Vị trí:** `src/main/java/com/bookstore/backend/`

| File | Mô tả | Trách nhiệm |
|------|-------|-------------|
| `service/BookService.java` | Business logic | CRUD operations, Entity ↔ DTO conversion |
| `controller/BookController.java` | REST API endpoints | Nhận HTTP requests, trả về Response |

**Flow xử lý:**
1. Frontend gọi API → `BookController`
2. Controller validate request → gọi `BookService`
3. Service xử lý logic → gọi `Repository`
4. Repository query database → trả Entity
5. Service convert Entity → DTO
6. Controller trả DTO về Frontend

---

## Hướng dẫn chạy

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

**Chú ý:** Backend đã sẵn sàng khi thấy log `Started BackendApplication in X.XXX seconds`

---

## Ví dụ sử dụng thực tế

### Kịch bản 1: Tạo sách mới qua Swagger

**Bước 1:** Mở Swagger UI → `/books` → `POST`

**Bước 2:** Click "Try it out" và nhập:
**Bước 2:** Click "Try it out" và nhập:
```json
{
  "title": "Head First Java",
  "publisherName": "O'Reilly",
  "publisherYear": 2022,
  "authorNames": ["Kathy Sierra", "Bert Bates"],
  "categoryNames": ["Java", "Beginner"]
}
```

**Bước 3:** Click "Execute"

**Kết quả:**
- Response có `id: 1` (sách vừa tạo)
- Database tự động tạo:
  - 1 Publisher: O'Reilly
  - 2 Authors: Kathy Sierra, Bert Bates
  - 2 Categories: Java, Beginner
  - Liên kết trong bảng `book_author` và `book_category`

### Kịch bản 2: Xem chi tiết sách

**Bước 1:** Gọi `GET /books/1`

**Kết quả:**

**Kết quả:**
```json
{
  "id": 1,
  "title": "Head First Java",
  "publisherName": "O'Reilly",
  "authorNames": ["Kathy Sierra", "Bert Bates"],
  "categoryNames": ["Java", "Beginner"],
  "variants": []
}
```

Frontend nhận được **nested objects** thay vì chỉ IDs → Dễ hiển thị UI

---

## Cấu hình quan trọng

File: `src/main/resources/application.yaml`

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # ⚠️ QUAN TRỌNG
```

**Các giá trị có thể:**
- `create-drop`: Xóa + tạo lại schema mỗi lần restart → **Chỉ dùng khi dev/test ban đầu**
- `update`: Giữ data, chỉ update schema → **Khuyến nghị dùng khi development**
- `validate`: Chỉ kiểm tra schema, không sửa gì → **Dùng khi production**

**Lưu ý:** Sau khi test xong, **BẮT BUỘC** đổi thành `update` để không mất dữ liệu!

---

## So sánh với schema cũ

### Trước (Flat structure):
```
book: id, title, author, publisher, price, quantity, image_url
```

**Vấn đề:**
- Sách có nhiều tác giả → Lưu trùng lặp
- Sách có nhiều giá → Phải tạo nhiều records
- Không thể tìm tất cả sách của 1 tác giả hiệu quả

### Sau (Normalized structure):
```
book: id, title, description, publisherId, publisherYear
author: id, name
book_author: book_id, author_id
bookvariants: id, bookId, price, quantity
bookimages: id, bookVariantsId, imageUrl
```

**Lợi ích:**
- Mỗi tác giả chỉ lưu 1 lần
- 1 sách có nhiều variants (giá khác nhau)
- Mỗi variant có nhiều hình riêng
- Dễ query: "Tìm tất cả sách của Robert C. Martin"

---

## Ghi chú kỹ thuật

### Ưu điểm của Normalized Schema:
- **Không lưu trùng lặp**: "Robert C. Martin" chỉ lưu 1 lần trong bảng `author`
- **Dễ cập nhật**: Sửa tên tác giả 1 lần, tất cả sách đều update
- **Hỗ trợ nhiều variants**: 1 sách nhiều giá (bìa cứng, bìa mềm...)
- **Hỗ trợ nhiều hình ảnh**: Mỗi variant có riêng nhiều hình
- **Query linh hoạt**: Dễ dàng "Tìm tất cả sách của 1 tác giả/thể loại"

### Nhược điểm (trade-offs):
- **Query phức tạp hơn**: Nhiều JOIN giữa các bảng
- **Cần DTO**: API phải convert Entity → DTO để gộp dữ liệu
- **Frontend phải xử lý nested objects**: Không phải flat JSON đơn giản

### Khi nào nên dùng?
- ✅ Khi có nhiều sách cùng tác giả/nhà xuất bản
- ✅ Khi 1 sách có nhiều phiên bản giá
- ✅ Khi cần tìm kiếm/filter theo tác giả/thể loại
- ❌ Khi chỉ có ít sách và không có relationships phức tạp

---

## Tài liệu liên quan

- **MIGRATION_GUIDE.md**: Hướng dẫn chi tiết test API với Swagger
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html (khi backend đang chạy)
- **PostgreSQL**: Port 5433, username `postgres`, database `bookstore`
