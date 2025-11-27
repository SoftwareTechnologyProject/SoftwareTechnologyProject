<<<<<<< Updated upstream
# Bookstore Project – Software Technology

## 1. Giới thiệu dự án

**Bookstore** là hệ thống quản lý & bán sách trực tuyến với đầy đủ các chức năng:

* Quản lý sách, giỏ hàng, thanh toán
* Hồ sơ người dùng, đăng nhập/đăng ký
* Wishlist, forum thảo luận, voucher
* Quản lý đơn hàng
* Dashboard thống kê & quản lý kho (Admin)
* Hệ thống thông báo & hỗ trợ khách hàng

**Công nghệ triển khai:**
- **Frontend:** ReactJS + TailwindCSS
- **Backend:** Spring Boot (Java)
- **Database:** PostgreSQL
- **Triển khai:** Docker + AWS/Render
=======
# SoftwareTechnologyProject

```markdown
# Bookstore Project

## 1. Giới thiệu
Dự án Bookstore là hệ thống quản lý sách online với đầy đủ các tính năng:
- Quản lý sách, giỏ hàng, đơn hàng, thanh toán.
- Hồ sơ người dùng và đăng nhập/đăng ký.
- Wishlist, forum, voucher.
- Hỗ trợ khách hàng & thông báo.
- Dashboard thống kê kho và doanh thu (admin).

Ứng dụng được triển khai bằng **Frontend: ReactJS + TailwindCSS** và **Backend: Spring Boot (Java)**, kết nối với **PostgreSQL**. 

Docker được sử dụng để đóng gói và triển khai ứng dụng.
>>>>>>> Stashed changes

---

## 2. Công nghệ sử dụng

<<<<<<< Updated upstream
| Nhóm                | Công nghệ            | Mục đích                          |
| ------------------- | -------------------- | --------------------------------- |
| **Frontend**        | ReactJS, TailwindCSS | UI/UX responsive, component-based |
| **Backend**         | Spring Boot (Java)   | REST API, xử lý nghiệp vụ         |
| **Database**        | PostgreSQL           | Lưu trữ dữ liệu chính             |
| **Auth**            | JWT                  | Xác thực & phân quyền             |
| **API Docs**        | Swagger UI           | Kiểm thử, tài liệu API            |
| **Testing**         | Postman              | Test endpoint trước khi tích hợp  |
| **DevOps**          | Docker, AWS/Render   | Đóng gói, deploy                  |
| **IDE**             | IntelliJ, VSCode     | Phát triển FE/BE                  |
| **Version Control** | Git + GitHub         | Quản lý mã nguồn, nhánh           |
=======
| Nhóm         | Công nghệ                 | Mục đích sử dụng |
| ------------ | ------------------------ | ---------------- |
| Frontend     | ReactJS + TailwindCSS     | Xây dựng giao diện người dùng, component UI nhanh, responsive |
| Backend      | Spring Boot (Java)        | Tạo RESTful API, xử lý logic nghiệp vụ |
| Database     | PostgreSQL                | Lưu trữ dữ liệu chính (users, books, orders, ...) |
| Auth & Security | JWT (JSON Web Token)    | Xác thực & phân quyền user – admin |
| API Docs     | Swagger UI                | Tài liệu và kiểm thử API |
| Test API     | Postman                   | Kiểm thử các endpoint trước khi tích hợp Frontend |
| Dev & Deploy | Docker, AWS / Render      | Đóng gói và triển khai ứng dụng |
| IDE          | IntelliJ / VSCode         | Môi trường phát triển |
| Version Control | Git + GitHub            | Quản lý mã nguồn, chia nhánh theo module |
>>>>>>> Stashed changes

---

## 3. Phân công module

<<<<<<< Updated upstream
| STT | Module                   | FE/BE liên quan         | Owner        |
| --- | ------------------------ | ----------------------- | ------------ |
| 1   | Trang chủ & Hồ sơ        | HomePage, Search API    | Đức Thịnh    |
| 2   | Đăng nhập / Đăng ký      | Auth API                | Đức Toàn     |
| 3   | Quản lý sách             | Book List / Detail      | Tấn Lộc      |
| 4   | Giỏ hàng                 | Cart                    | Vũ Minh      |
| 5   | Thanh toán               | Checkout                | Tiến Đạt     |
| 6   | Đơn hàng                 | Order API               | Hữu Tâm      |
| 7   | Wishlist, Forum, Voucher | Wishlist Page           | Mai Thái     |
| 8   | Chi tiết SP & Filter     | Book List / Detail      | Hoàng Phương |
| 9   | Thống kê & Kho           | Dashboard               | Cao Thái     |
| 10  | Chat & Thông báo         | Chat API, Notifications | Ngọc Huy     |

> Mỗi module phát triển trên **feature branch riêng**.
=======
| STT | Module                         | FE + BE liên quan                 | Owner |
| --- | ------------------------------ | -------------------------------- | ----- |
| 1   | Trang chủ & Hồ sơ              | HomePage, Search API             | Đức Thịnh |
| 2   | Đăng nhập, Đăng ký             | Auth API, Profile UI             | Đức Toàn |
| 3   | Quản lý sách                   | Book List, Book Detail           | Tấn Lộc |
| 4   | Giỏ hàng & thanh toán sơ bộ    | Cart, Checkout Preview           | Vũ Minh |
| 5   | Thanh toán                     | Cart, Checkout Preview           | Tiến Đạt |
| 6   | Quản lý đơn hàng               | Orders API, Order Detail         | Hữu Tâm |
| 7   | Wishlist, Forum, Voucher       | Wishlist Page                    | Mai Thái |
| 8   | Chi tiết sản phẩm & Filter     | Book List, Book Detail           | Hoàng Phương |
| 9   | Quản lý kho & Thống kê         | Dashboard (Charts)               | Cao Thái |
| 10  | Hỗ trợ khách hàng & Thông báo | Chat UI, Chat API, Notifications API | Ngọc Huy |

> Mỗi module có **owner riêng**, phát triển trên **feature branch** của mình.
>>>>>>> Stashed changes

---

## 4. Quy tắc làm việc nhóm

<<<<<<< Updated upstream
### Git Flow chuẩn

```
main        →  nhánh deploy
└── develop →  nhánh tổng hợp
    ├── feature/home
    ├── feature/auth
    └── ...
```

### Quy tắc tạo nhánh

```bash
git checkout develop
git pull origin develop
git checkout -b feature/name
```

Ví dụ:

```
feature/manage-books
```

### Quy tắc commit

```
[type]: mô tả ngắn
```

**Type thường dùng:**

* feat: thêm chức năng
* fix: sửa lỗi
* refactor: tối ưu code
* style: sửa UI/format
* docs: chỉnh tài liệu
* test: thêm test
* chore: config/script
=======
### 4.1. Git Flow (Cấu trúc nhánh)
```

main       -> Nhánh chính, deploy production
└── develop -> Nhánh tổng hợp, merge từ feature/*
├── feature/module1-home-search
├── feature/module2-auth
├── ...

````

- **feature/*:** nhánh phát triển riêng từng module.
- **hotfix/*:** sửa lỗi khẩn cấp sau deploy production.

### 4.2. Quy tắc tạo & đặt nhánh
```bash
git checkout develop
git pull origin develop
git checkout -b feature/moduleX-short-name
````

* Ví dụ: `feature/module3-books`

### 4.3. Quy tắc commit

```
[type]: [mô tả ngắn]
```

**Type thông dụng:**

* `feat:` thêm tính năng mới
* `fix:` sửa lỗi
* `refactor:` tối ưu code, không đổi chức năng
* `style:` chỉnh giao diện, format code
* `docs:` cập nhật tài liệu
* `test:` thêm/sửa test
* `chore:` config, script, v.v.
>>>>>>> Stashed changes

**Ví dụ:**

```
feat: add book CRUD API for admin
fix: update cart total calculation bug
style: adjust button color on login page
```

<<<<<<< Updated upstream
---

## 5. Quy trình làm việc chuẩn

### A. Làm việc trong nhánh riêng

```bash
git checkout feature/moduleX
# coding...
git commit -m "feat: ..."
git push origin feature/moduleX
```

### B. Tạo Pull Request (PR)

* PR từ **feature/moduleX → develop**
* Gắn label: `ready for review`
* Thành viên khác review → approve → merge
* Xoá nhánh sau khi merge

### C. Merge develop → main (khi release)
=======
### 4.4. Quy trình làm việc

#### A. Làm việc trong nhánh riêng

```bash
git checkout feature/moduleX
# code & commit nhỏ
git push origin feature/moduleX
```

#### B. Pull Request (PR)

* Tạo PR từ `feature/moduleX` → `develop`.
* Gắn label: `ready for review`.
* Thành viên khác review → approve → merge.
* Xóa nhánh `feature/moduleX` sau khi merge.

#### C. Merge develop → main

* Khi toàn bộ module ổn định & test OK:
>>>>>>> Stashed changes

```bash
git checkout main
git merge develop
git push origin main
```

<<<<<<< Updated upstream
---

## 6. Quy tắc code & .gitignore

### Không được push các thư mục sau:

**Frontend:**

* `node_modules/`
* `.env`
* `dist/`

**Backend:**

* `target/`
* `.idea/`, `.iml`

### Quy tắc code:

* camelCase: biến, hàm
* PascalCase: class
* RESTful API chuẩn: `/api/books/{id}`
* Test kỹ BE bằng Postman, FE chạy local

---

## 7. Triển khai

* Docker build FE & BE
* Deploy lên AWS / Render
* Dùng PostgreSQL chung

---

## 8. Tài liệu kỹ thuật

Các tài liệu chi tiết về API, database schema và hướng dẫn sử dụng được lưu trong thư mục `backend/docs/`:

* **API Documentation**: `backend/docs/MIGRATION_GUIDE.md` - Hướng dẫn sử dụng các API endpoints
* **Database Schema**: `backend/docs/MIGRATION_SUMMARY.md` - Cấu trúc database và mối quan hệ giữa các bảng

---

## 9. Hướng dẫn chạy dự án

### 9.1. Chạy bằng Docker (Khuyến nghị nhất)

### Yêu cầu:

* Docker Desktop
* Docker Compose

### Lệnh chạy dự án:

**Lần đầu tiên hoặc khi code thay đổi:**
```bash
docker compose up --build
```

**Lần sau (code không đổi):**
```bash
docker compose up
```

**Chạy ở background (không chiếm terminal):**
```bash
docker compose up -d
```

**Dừng containers:**
```bash
docker compose down
```

**Xem logs:**
```bash
docker compose logs -f
```

Docker sẽ tự động:

- Build backend → jar
- Build frontend → production build
- Tạo PostgreSQL container
- Kết nối toàn bộ service

---

### Sau khi chạy

| Service         | URL                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------ |
| **Frontend**    | [http://localhost:5173](http://localhost:5173)                                             |
| **Backend API** | [http://localhost:8080](http://localhost:8080)                                             |
| **Swagger UI**  | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) |
| **PostgreSQL**  | localhost:5432                                                                             |

---

## 9.2. Cấu trúc docker-compose.yml
=======
* Triển khai version lên AWS / Render.

### 4.5. Đồng bộ code (tránh conflict)

```bash
git checkout develop
git pull origin develop
git checkout feature/moduleX
git merge develop
# nếu conflict → fix → commit → push
git push origin feature/moduleX
```

---

## 5. Quy tắc code & .gitignore

* Không push thư mục build:

  * FE: `node_modules/`, `.env`, `dist/`
  * BE: `target/`, `.idea/`, `.iml/`
* Dùng `.gitignore` riêng cho FE & BE.
* Chuẩn hóa code:

  * `camelCase` cho biến, hàm
  * `PascalCase` cho class (Java)
  * RESTful API chuẩn: `/api/books/{id}`
* Test kỹ trước khi push:

  * Backend: Postman
  * Frontend: chạy local
  * Kiểm thử Docker local với DB chung

---

## 6. Triển khai

* Build Docker cho BE & FE.
* Deploy lên **AWS / Render**.
* Sử dụng DB PostgreSQL chung.

---

## 7. Liên hệ

* Mỗi module có owner riêng (tham khảo bảng phân công ở mục 3).
* Các vấn đề code, merge, conflict → trao đổi trực tiếp trên GitHub PR hoặc chat nhóm.

````markdown
# 8. Hướng dẫn chạy dự án

Dự án hỗ trợ chạy hoàn toàn bằng **Docker**, không cần cài Java, NodeJS hay PostgreSQL trên máy.

---

# 8.1. Chạy bằng Docker (Khuyến nghị)

### 📌 Yêu cầu:
- Docker Desktop
- Docker Compose

### 📌 Chạy project:

```bash
docker compose up --build
````

Docker sẽ tự động:

* Build backend (Spring Boot → JAR)
* Build frontend (React → Vite build)
* Tạo container PostgreSQL
* Liên kết các service với nhau

### 📌 Sau khi chạy xong:

| Service     | URL                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------ |
| Frontend    | [http://localhost:5173](http://localhost:5173)                                             |
| Backend API | [http://localhost:8080](http://localhost:8080)                                             |
| Swagger UI  | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) |
| PostgreSQL  | localhost:5432                                                                             |

---

# 8.2. Cấu trúc docker-compose
>>>>>>> Stashed changes

```yaml
version: '3.9'

services:
  app:
    build: .
    container_name: bookstore_app
    ports:
      - "${SERVER_PORT}:8080"
    environment:
      - SPRING_DATASOURCE_URL=${SPRING_DATASOURCE_URL}
      - SPRING_DATASOURCE_USERNAME=${SPRING_DATASOURCE_USERNAME}
      - SPRING_DATASOURCE_PASSWORD=${SPRING_DATASOURCE_PASSWORD}
      - SPRING_JPA_HIBERNATE_DDL_AUTO=${SPRING_JPA_HIBERNATE_DDL_AUTO}
      - SPRING_JPA_SHOW_SQL=${SPRING_JPA_SHOW_SQL}
    depends_on:
      - db

  db:
    image: postgres:15
    container_name: bookstore_db
    restart: always
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```
<<<<<<< Updated upstream

---

## 9.3. Chạy thủ công (Development Mode)

### Khuyến nghị khi đang phát triển (hot reload nhanh):

#### Bước 1: Chạy PostgreSQL (BẮT BUỘC)
```bash
cd backend
docker compose up -d db

# Kiểm tra PostgreSQL đã chạy chưa
docker compose ps
```

> Lưu ý: PostgreSQL phải chạy trước, nếu không backend sẽ báo lỗi kết nối!

#### Bước 2: Chạy Backend (Terminal 1)
```bash
cd backend
mvn spring-boot:run
# Hoặc nếu có mvnw
./mvnw spring-boot:run
```

**Kiểm tra backend đã chạy:**
- Mở: http://localhost:8080/swagger-ui/index.html
- Thấy Swagger UI -> Backend OK

#### Bước 3: Chạy Frontend (Terminal 2 - mở terminal mới)
```bash
cd frontend
npm install        # Chỉ lần đầu tiên
npm run dev
```

**Kiểm tra frontend đã chạy:**
- Terminal hiển thị: `Local: http://localhost:5173/`
- Mở: http://localhost:5173
- Thấy trang web với Header/Footer -> Frontend OK

---

### Sau khi chạy thủ công:

| Service | URL | Cách kiểm tra |
|---------|-----|---------------|
| **Frontend** | http://localhost:5173 | Mở trình duyệt thấy giao diện |
| **Backend API** | http://localhost:8080 | Swagger UI hoạt động |
| **PostgreSQL** | localhost:5432 | `docker compose ps` thấy bookstore_db running |

---

### Các lệnh hữu ích khi chạy thủ công:

```bash
# Xem PostgreSQL logs
docker compose logs -f db

# Dừng PostgreSQL
docker compose down

# Reset database (xóa toàn bộ data)
docker compose down -v

# Kiểm tra port đang được dùng
lsof -i :8080  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL
```

> Lưu ý: Backend hiện đang dùng **PostgreSQL** (không phải H2). Đảm bảo PostgreSQL đã chạy trước khi start backend, nếu không sẽ báo lỗi `Connection refused`.

---

## 9.4. Các lệnh Docker hữu ích

| Lệnh | Mô tả | Khi nào dùng |
|------|-------|--------------|
| `docker compose up --build` | Build lại và chạy | Lần đầu, code đổi |
| `docker compose up` | Chạy containers có sẵn | Code không đổi |
| `docker compose up -d` | Chạy ở background | Không muốn chiếm terminal |
| `docker compose down` | Dừng tất cả containers | Kết thúc làm việc |
| `docker compose down -v` | Dừng + xóa volumes | Reset database |
| `docker compose ps` | Xem containers đang chạy | Kiểm tra trạng thái |
| `docker compose logs -f` | Xem logs realtime | Debug lỗi |
| `docker compose logs -f app` | Xem logs backend | Debug backend |
| `docker compose restart app` | Restart backend | Sau khi sửa code nhỏ |

---

## 10. Liên hệ

* Mỗi module có **owner** rõ ràng (xem mục 3).
* Các vấn đề về **merge, conflict** → trao đổi qua GitHub PR hoặc nhóm chat.

---
=======
---

# 8.3. Nếu muốn chạy thủ công (Optional)

**Chỉ dùng nếu muốn dev mà không dùng Docker.**

→ Chạy backend bằng Java
→ Chạy frontend bằng Node
→ Chạy DB bằng PostgreSQL local

*(Chi tiết xem phần 8.3 – 8.4 trong README)*
>>>>>>> Stashed changes
