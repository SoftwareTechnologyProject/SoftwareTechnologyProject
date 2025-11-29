**PR Testing & Release Checklist**

Mục đích: Tài liệu này hướng dẫn cách lấy pull request về máy local để kiểm thử, và checklist các bước kiểm thử chức năng (backend + frontend) trước khi merge về `develop`/`main`.

---

## 1. Thu thập code từ PR để test nhanh

- Chuyển về `develop` và cập nhật:

```bash
git checkout develop
git pull origin develop
```

- Lấy PR (ví dụ PR #10) về một nhánh cục bộ `pr10-test` để kiểm thử:

```bash
git fetch origin pull/10/head:pr10-test
git checkout pr10-test
```

- Sau khi test xong, quay về `develop` và xóa nhánh tạm:

```bash
git checkout develop
git branch -D pr10-test
git pull origin develop
```

Ghi chú: thay `10` bằng số PR thực tế. Nếu remote tên khác (ví dụ `upstream`), đổi `origin` tương ứng.

---

## 2. Chuẩn bị môi trường (lần đầu lấy code mới)

- Khuyến nghị dùng Docker Compose để dựng đầy đủ service (DB + app). Trong thư mục root (hoặc `backend/`) chạy:

```bash
# build và chạy (lần đầu hoặc khi có thay đổi)
docker compose up --build

# chạy nền
docker compose up -d --build

# xem logs
docker compose logs -f
```

- Nếu muốn chạy thủ công (dev hot-reload):

Backend (terminal A):
```bash
cd backend
# nếu có mvnw
./mvnw spring-boot:run
# hoặc (nếu dùng local mvn)
mvn spring-boot:run
```

Frontend (terminal B):
```bash
cd frontend
npm install        # lần đầu
npm run dev
```

Ghi chú ports mặc định:
- Frontend (Vite): `http://localhost:5173`
- Backend (Spring Boot): `http://localhost:8080` (kiểm tra `backend/src/main/resources/application.yaml`)
- PostgreSQL (docker-compose trong repo): host port `5433` → container `5432`

---

## 3. Checklist kiểm thử nhanh (Smoke test) — làm mỗi lần có PR

Mục tiêu: kiểm tra các chức năng chính không bị hỏng sau khi merge.

### 3.1 Pre-test Setup

- [ ] Copy `backend/.env.example` thành `.env` và điều chỉnh nếu cần:
```bash
cd backend
cp .env.example .env
```
- [ ] Kiểm tra dependencies:
  - [ ] Backend: Java 17+, Maven 3.6+
  - [ ] Frontend: Node.js 18+, npm
  - [ ] Docker & Docker Compose (nếu dùng containerized)

### 3.2 Backend - Build & Startup

- [ ] Backend build thành công:
```bash
cd backend
./mvnw clean compile  # hoặc mvn clean compile
./mvnw package -DskipTests  # tạo JAR/WAR
```
- [ ] Khởi động backend (hoặc docker compose) thành công, không có lỗi startup trong logs.
- [ ] Truy cập Swagger UI: `http://localhost:8080/swagger-ui/index.html` → xác nhận danh sách endpoint.
- [ ] Kiểm tra database connection: log không có lỗi "Connection refused" hoặc "Authentication failed".

### 3.3 Backend - Core API Tests

- [ ] **Health/Status endpoints:**
  - [ ] GET `/actuator/health` → 200 (nếu có Spring Actuator)
  - [ ] GET `/api/status` hoặc tương tự → 200
  
- [ ] **Authentication endpoints (nếu có):**
  - [ ] POST `/api/auth/register` với data hợp lệ → 201 hoặc 200
  - [ ] POST `/api/auth/login` với user vừa tạo → 200 + JWT token
  - [ ] GET protected endpoint với token → 200, không token → 401/403

- [ ] **Books CRUD:**
  - [ ] GET `/api/books` → 200 và trả JSON array (có thể rỗng)
  - [ ] POST `/api/books` (với auth admin nếu cần) → 201 và data được tạo
  - [ ] GET `/api/books/{id}` với ID vừa tạo → 200 và đúng thông tin
  - [ ] PUT `/api/books/{id}` → 200 và data được cập nhật
  - [ ] DELETE `/api/books/{id}` → 204 hoặc 200

- [ ] **Categories/Search (nếu có):**
  - [ ] GET `/api/categories` → 200
  - [ ] GET `/api/books/search?q=keyword` → 200

- [ ] **Cart & Orders (nếu có):**
  - [ ] POST `/api/cart/add` → 200/201
  - [ ] GET `/api/cart` → 200 và hiển thị items
  - [ ] POST `/api/orders` → 201 và tạo order

### 3.4 Backend - Data Persistence

- [ ] Kết nối database hoạt động: tạo 1 book → kiểm tra trong DB (psql/pgAdmin):
```sql
SELECT * FROM books ORDER BY created_at DESC LIMIT 5;
```
- [ ] Transactions hoạt động: thực hiện operation phức tạp (tạo order + update stock) → kiểm tra consistency.

### 3.5 Frontend - Build & Startup

- [ ] Frontend dependencies install thành công:
```bash
cd frontend
npm install --force  # nếu có dependency conflicts
```
- [ ] Frontend build dev mode thành công:
```bash
npm run dev
```
- [ ] Production build test:
```bash
npm run build   # tạo dist/
npm run preview # test production build locally
```
- [ ] Không có lỗi TypeScript/ESLint (nếu enable):
```bash
npm run lint    # nếu có script lint
```

### 3.6 Frontend - Core UI Flows

- [ ] **Trang chủ & Navigation:**
  - [ ] Mở `http://localhost:5173` → trang chủ load (header/footer hiển thị)
  - [ ] Navigation menu hoạt động (Home, Books, Account, etc.)
  - [ ] Search bar có response (nếu có)

- [ ] **Authentication UI (nếu có):**
  - [ ] Form đăng ký: điền data hợp lệ → submit thành công
  - [ ] Form đăng nhập: login với account vừa tạo → redirect/token lưu localStorage
  - [ ] Logout: xóa token và redirect về login page

- [ ] **Books Listing & Details:**
  - [ ] Trang danh sách sách: GET `/books` và render cards/list
  - [ ] Pagination hoặc infinite scroll (nếu có)
  - [ ] Click vào 1 book → trang chi tiết load đúng thông tin
  - [ ] Add to Cart button hoạt động (nếu có)

- [ ] **Shopping Cart (nếu có):**
  - [ ] Thêm sách vào cart → số lượng cart icon tăng
  - [ ] Mở cart page → hiển thị items đúng
  - [ ] Update quantity, remove items → total price cập nhật
  - [ ] Checkout flow cơ bản (không cần payment thật)

- [ ] **User Account:**
  - [ ] Profile page hiển thị thông tin user
  - [ ] Update profile form (nếu có)
  - [ ] Order history (nếu có)

### 3.7 Frontend - Technical Checks

- [ ] **Browser Console:** 
  - [ ] Không có JavaScript errors trong console
  - [ ] Không có 404s cho static assets (images, CSS, JS)
  - [ ] API calls có response codes hợp lệ (200, 201, 401, etc.)

- [ ] **Network Tab:**
  - [ ] API requests đi đến đúng backend URL
  - [ ] Response times hợp lý (<2s cho data requests)
  - [ ] Proper HTTP status codes

- [ ] **Mobile/Responsive:**
  - [ ] Test ở mobile viewport (Chrome DevTools)
  - [ ] Navigation menu responsive
  - [ ] Forms usable trên mobile

### 3.8 Integration & E2E Tests

- [ ] **End-to-End User Journey:**
  - [ ] Register → Login → Browse books → Add to cart → Checkout → View order
  - [ ] Admin login → Manage books (CRUD) → View orders/users

- [ ] **Cross-browser Testing (nếu có thời gian):**
  - [ ] Chrome: tất cả functions work
  - [ ] Firefox: core functions work
  - [ ] Safari (macOS): basic navigation work

- [ ] **Performance Basic Check:**
  - [ ] Trang chủ load < 3s
  - [ ] Book detail page load < 2s
  - [ ] Large data operations (search 100+ books) responsive

### 3.9 Security Basic Check

- [ ] **Authentication:**
  - [ ] Protected routes redirect to login when not authenticated
  - [ ] JWT tokens expire correctly (test với expired token)
  - [ ] Admin routes block non-admin users

- [ ] **Input Validation:**
  - [ ] Forms validate required fields
  - [ ] API returns 400 for invalid data
  - [ ] XSS basic check: input `<script>alert('xss')</script>` không execute

- [ ] **Data Exposure:**
  - [ ] API responses không chứa sensitive data (passwords, internal IDs)
  - [ ] Error messages không leak system info

---

## 4. Test chi tiết theo module/PR type

### 4.1 Khi PR thay đổi Database Schema

- [ ] Migration script chạy thành công:
```bash
# kiểm tra migration logs
docker compose logs db | grep -i migration
```
- [ ] Backup database trước khi test:
```bash
docker exec bookstore_db pg_dump -U postgres bookstore > backup.sql
```
- [ ] Test rollback scenario (nếu có downgrade migration)
- [ ] Kiểm tra performance: query có index cần thiết không

### 4.2 Khi PR thay đổi Authentication/Security

- [ ] **Token Management:**
  - [ ] Login multiple devices → logout one → others vẫn active (hoặc logout all tùy logic)
  - [ ] Token refresh mechanism (nếu có)
  - [ ] Password reset flow (email + link)

- [ ] **Role-based Access:**
  - [ ] Admin user: access admin endpoints ✓
  - [ ] Regular user: access admin endpoints → 403 ✓
  - [ ] Guest: access protected endpoints → 401 ✓

### 4.3 Khi PR thay đổi Payment/Orders

- [ ] **Order Flow:**
  - [ ] Create order → inventory giảm đúng số lượng
  - [ ] Payment success → order status = 'completed'
  - [ ] Payment failed → order status = 'failed', inventory restore

- [ ] **Edge Cases:**
  - [ ] Concurrent orders same item → inventory không oversell
  - [ ] Invalid payment method → proper error message

### 4.4 Khi PR thay đổi UI Components

- [ ] **Visual Regression:**
  - [ ] Screenshot key pages trước và sau PR
  - [ ] Responsive design không bị break

- [ ] **Accessibility:**
  - [ ] Forms có proper labels
  - [ ] Keyboard navigation work
  - [ ] Color contrast đủ (nếu đổi theme)

---

## 5. Automated Testing Integration

### 5.1 Unit Tests

```bash
# Backend unit tests
cd backend
./mvnw test

# Frontend unit tests (nếu có)
cd frontend
npm test
```

### 5.2 Integration Tests

```bash
# Spring Boot integration tests với TestContainers
./mvnw verify -Dspring.profiles.active=test

# E2E tests với Playwright (nếu setup)
npx playwright test
```

### 5.3 Performance Tests (optional)

```bash
# Load test API endpoints với k6 hoặc Apache Bench
ab -n 100 -c 10 http://localhost:8080/api/books

# Frontend performance với Lighthouse
npx lighthouse http://localhost:5173 --output json
```

---

## 6. Công cụ hỗ trợ test & Debugging

### 6.1 API Testing Tools

- **Postman/Insomnia**: Tạo collection test các endpoint chính. Template collection:
```json
{
  "info": { "name": "Bookstore API Tests" },
  "item": [
    {
      "name": "Auth",
      "item": [
        { "name": "Register", "request": { "method": "POST", "url": "{{baseUrl}}/api/auth/register" }},
        { "name": "Login", "request": { "method": "POST", "url": "{{baseUrl}}/api/auth/login" }}
      ]
    },
    {
      "name": "Books",
      "item": [
        { "name": "Get All Books", "request": { "method": "GET", "url": "{{baseUrl}}/api/books" }},
        { "name": "Get Book Detail", "request": { "method": "GET", "url": "{{baseUrl}}/api/books/{{bookId}}" }}
      ]
    }
  ],
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:8080" },
    { "key": "authToken", "value": "" }
  ]
}
```

- **cURL Scripts**: Tạo quick smoke test script:
```bash
#!/bin/bash
# test-api.sh
BASE_URL="http://localhost:8080"

echo "Testing API health..."
curl -s "$BASE_URL/actuator/health" | jq .

echo "Testing books endpoint..."
curl -s "$BASE_URL/api/books" | jq 'length'

echo "Testing auth..."
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  "$BASE_URL/api/auth/login"
```

### 6.2 Database Tools

- **PostgreSQL CLI**:
```bash
# Connect to containerized DB
docker exec -it bookstore_db psql -U postgres -d bookstore

# Common queries
\dt                     # list tables
SELECT count(*) FROM books;
SELECT * FROM users WHERE created_at > NOW() - INTERVAL '1 hour';
```

- **PgAdmin**: Truy cập `http://localhost:8085` (từ docker-compose)
  - Login: admin@admin.com / root
  - Connect: Host=bookstore_db, Port=5432

### 6.3 Frontend Debugging

- **Browser DevTools:**
```javascript
// Console debugging
localStorage.getItem('authToken')        // check JWT
sessionStorage.clear()                   // clear session
window.location.reload()                 // reload after clear

// Network tab: filter by API calls
// Application tab: check localStorage/sessionStorage
```

- **React DevTools**: Install browser extension để inspect components state

### 6.4 Logging & Monitoring

- **Backend Logs**:
```bash
# Docker logs
docker compose logs -f app

# Specific log patterns
docker compose logs app | grep -i error
docker compose logs app | grep -E "POST|PUT|DELETE"
```

- **Frontend Console**:
```javascript
// Enable debug mode (nếu app có)
localStorage.setItem('debug', 'true')

// Monitor API calls
window.addEventListener('fetch', (e) => console.log('API Call:', e))
```

---

## 7. Xử lý lỗi & Troubleshooting

### 7.1 Backend Common Issues

- **Database Connection Failed:**
```bash
# Check postgres container
docker compose ps
docker compose logs db

# Check connection string in application.yaml
# Default: jdbc:postgresql://localhost:5433/bookstore
```

- **Port Already in Use:**
```bash
# Kill process using port 8080
lsof -ti:8080 | xargs kill -9

# Or change port in application.yaml
server.port: 8081
```

- **Build Failures:**
```bash
# Clear Maven cache
./mvnw dependency:purge-local-repository
./mvnw clean compile

# Check Java version
java -version  # should be 17+
```

### 7.2 Frontend Common Issues

- **Node Modules Issues:**
```bash
rm -rf node_modules package-lock.json
npm install --force

# Check Node version
node --version  # should be 18+
```

- **Port 5173 in Use:**
```bash
# Kill Vite dev server
pkill -f "vite"

# Or use different port
npm run dev -- --port 5174
```

- **CORS Errors:**
```javascript
// Check backend CORS config in SecurityConfig.java
// Ensure frontend URL is in allowedOrigins
```

### 7.3 Docker Issues

- **Build Failures:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up
```

- **Volume Permission Issues:**
```bash
# Fix PostgreSQL data permissions
sudo chown -R $(whoami) ./data
```

### 7.4 Test Data Setup

- **Create Test Users:**
```sql
-- Connect to DB and insert test data
INSERT INTO users (username, password, email, role) 
VALUES 
  ('admin', '$2a$10$...', 'admin@test.com', 'ADMIN'),
  ('user', '$2a$10$...', 'user@test.com', 'USER');
```

- **Create Test Books:**
```sql
INSERT INTO books (title, author, price, stock_quantity) 
VALUES 
  ('Test Book 1', 'Author 1', 29.99, 100),
  ('Test Book 2', 'Author 2', 19.99, 50);
```

---

## 8. Lưu kết quả test & Documentation

- Nếu phát hiện lỗi: tạo issue hoặc comment trực tiếp vào PR với steps to reproduce, logs và đề xuất fix.
- Ghi lại bước test đã chạy và kết quả (pass/fail) trong comment PR, ví dụ:

```
Smoke tests (local):
- Backend startup: PASS
- Auth endpoints: FAIL - POST /api/auth/login trả 500 (stacktrace attached)
- Book list GET /api/books: PASS

Action: rollback PR -> fix -> retest
```

---

## 7. Cleanup sau test

- Nếu bạn lấy PR bằng `git fetch origin pull/ID/head:prID-test`, sau khi test xong hãy xóa nhánh local:

```bash
git checkout develop
git branch -D prID-test
```

- Nếu bạn dùng Docker Compose và chạy ở chế độ background, dừng và xoá volumes nếu cần reset DB:

```bash
docker compose down
docker compose down -v   # xóa volumes (reset DB)
```

---

## 8. Gợi ý CI / Tự động hóa

- Thiết lập pipeline CI để chạy automated smoke tests (unit tests, integration tests, lint). Nếu CI pass, giảm công việc manual.
- Thêm Postman/Newman or Playwright/E2E tests để tự động chạy trên PR.

---

## 9. Mẫu checklist ngắn (copy vào PR comment trước khi merge)

```
Manual pre-merge checklist:
- [ ] Backend: build success (mvn package) or Docker up --build
- [ ] Backend: Swagger reachable
- [ ] Auth endpoints smoke test
- [ ] Books CRUD smoke test
- [ ] Frontend: npm run dev và UI flows OK
- [ ] No console errors, no server exceptions in logs
- [ ] DB: data persistence OK
```

---

## 10. Templates & Checklists

### 10.1 PR Comment Template (Copy/Paste)

```markdown
## PR Testing Report

**Environment:** Local Docker / Manual setup
**Tester:** [Your Name]
**Date:** [Date]

### Backend Tests
- [ ] Build success: ✅/❌
- [ ] Startup: ✅/❌  
- [ ] Swagger UI: ✅/❌
- [ ] Auth endpoints: ✅/❌
- [ ] CRUD operations: ✅/❌
- [ ] Database persistence: ✅/❌

### Frontend Tests  
- [ ] Build/dev mode: ✅/❌
- [ ] UI navigation: ✅/❌
- [ ] API integration: ✅/❌
- [ ] Browser console: ✅/❌ (no errors)

### Integration Tests
- [ ] End-to-end user flow: ✅/❌
- [ ] Cross-browser (if tested): ✅/❌

**Issues Found:**
[List any bugs, performance issues, or concerns]

**Recommendation:** ✅ Merge / ❌ Needs fixes / ⚠️ Merge with caution
```

### 10.2 Quick Test Script

Tạo file `scripts/quick-test.sh`:
```bash
#!/bin/bash
echo "🚀 Starting Bookstore Quick Test..."

echo "📦 Checking Docker setup..."
docker compose ps

echo "🔧 Testing Backend API..."
curl -s http://localhost:8080/actuator/health || echo "❌ Backend not responding"

echo "🌐 Testing Frontend..."
curl -s http://localhost:5173 > /dev/null && echo "✅ Frontend OK" || echo "❌ Frontend not responding"

echo "📚 Testing Books API..."
BOOKS_COUNT=$(curl -s http://localhost:8080/api/books | jq length 2>/dev/null)
echo "Books in database: ${BOOKS_COUNT:-'Error'}"

echo "✨ Quick test completed!"
```

### 10.3 Environment Health Check

```bash
#!/bin/bash
# health-check.sh
echo "=== Environment Health Check ==="

echo "📋 System Requirements:"
echo "Java: $(java -version 2>&1 | head -1)"
echo "Node: $(node --version 2>/dev/null || echo 'Not installed')"
echo "Docker: $(docker --version 2>/dev/null || echo 'Not installed')"

echo "🐳 Docker Services:"
docker compose ps 2>/dev/null || echo "Docker Compose not running"

echo "🌐 Service Status:"
curl -s http://localhost:8080/actuator/health >/dev/null && echo "✅ Backend UP" || echo "❌ Backend DOWN"
curl -s http://localhost:5173 >/dev/null && echo "✅ Frontend UP" || echo "❌ Frontend DOWN"

echo "💾 Database:"
docker exec bookstore_db pg_isready -U postgres 2>/dev/null && echo "✅ PostgreSQL UP" || echo "❌ PostgreSQL DOWN"
```

Sử dụng:
```bash
chmod +x scripts/*.sh
./scripts/health-check.sh
```
