# Testing Guide - Bookstore Project

**Mục tiêu**: Test nhanh sau mỗi lần merge code mới để đảm bảo không có gì bị hỏng.

---

## Quick Test Workflow (10 phút)

### 1. Lấy code mới
```bash
git checkout develop
git pull origin develop

# Nếu test PR cụ thể
git fetch origin pull/10/head:pr10-test
git checkout pr10-test
```

### 2. Start services
```bash
# Option A: Docker (khuyến nghị)
cd backend && docker compose up --build -d

# Option B: Manual  
./mvnw spring-boot:run
cd ../frontend && npm run dev 
```

### 3. Test toàn bộ (chạy script)
```bash
# Đảm bảo ở root directory
./scripts/quick-test.sh
```

Hoặc test thủ công:

```bash
# Backend
curl http://localhost:8080/swagger-ui/index.html

# Database
docker exec bookstore_db pg_isready -U postgres

# API
curl http://localhost:8080/books

# Frontend (mở browser)
http://localhost:5173
```

---

## Chi tiết test từng phần

### Backend Test (3 phút)

**Step 1: Kiểm tra service chạy**
```bash
curl http://localhost:8080/swagger-ui/index.html
```
Expect: HTML page with "Swagger UI"

**Step 2: Test API endpoints**  
```bash
# Get books
curl -X GET http://localhost:8080/books
# Expect: [array of books] hoặc []

# Get vouchers
curl -X GET http://localhost:8080/vouchers  
# Expect: [array of vouchers] hoặc []

# Get orders
curl -X GET http://localhost:8080/orders
# Expect: [array of orders] hoặc []

# Create test book
curl -X POST http://localhost:8080/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Book", "variants": [{"price": 29.99, "quantity": 10, "status": "AVAILABLE"}]}'
# Expect: {"id": number, "title": "Test Book", ...} hoặc 401/403 if no auth

# Verify created
curl -X GET http://localhost:8080/books
# Expect: Array containing new book
```

**Kết quả mong đợi:**
- GET endpoints: Status 200, JSON array hoặc object  
- POST endpoints: Status 201 (created) hoặc 401/403 (unauthorized)
- Không có lỗi 500 (server error)
- **Lưu ý**: `/categories` endpoint chưa có (404 - thiếu CategoryController)

**Step 3: Database**
```bash
docker exec bookstore_db pg_isready -U postgres
docker exec bookstore_db psql -U postgres -d bookstore -c "SELECT count(*) FROM book;"
```

### Frontend Test (2 phút)

**Step 1: Check app loads**
- Open: http://localhost:5173
- Expect: Page loads with header/footer

**Step 2: Check console**  
- F12 → Console tab
- No red errors

**Step 3: Check API calls**
- F12 → Network tab  
- Refresh page
- See requests to backend

### Integration Test (2 phút)

1. Create book via API → Check appears in GET /books
2. Frontend loads → Check makes API calls
3. No errors in backend logs or frontend console

---

## Postman Testing

### Cách import collection:

**Import file duy nhất:**
1. Mở Postman
2. Click **Import** (top left)
3. Drag & drop file `scripts/Bookstore_API_Collection.json`
4. Click **Import**

**Copy-paste JSON:**
1. Mở Postman
2. Click **Import** → **Raw text**
3. Copy toàn bộ nội dung file `scripts/Bookstore_API_Collection.json` và paste vào
4. Click **Continue** → **Import**

### Cách test:
1. **Set Environment**: 
   - Click gear icon (⚙️) → **Manage Environments**
   - Add New → Name: "Bookstore Local"
   - Add variable: `baseUrl` = `http://localhost:8080`

2. **Run Tests**:
   - Select "Bookstore Local" environment
   - Click collection "Bookstore API Test Collection"
   - Click **Run** → **Run Collection**
   - Hoặc test từng request riêng lẻ

### Test sequence khuyến nghị:

**WORKING (Test these first):**
1. Health Checks → Backend Health
2. Health Checks → Swagger UI Access  
3. Books Management → GET All Books
4. Books Management → GET Book by ID
5. Vouchers Management → GET All Vouchers
6. Orders Management → GET All Orders

**KNOWN ISSUES (Test to confirm bugs):**
7. Users Management → POST Create User (500 error)
8. Cart Management → POST Add to Cart (400 error) 
9. Cart Management → PUT Update Cart (400 error)
10. Cart Management → DELETE Remove Cart (400 error)
11. Orders Management → GET Order by ID (404/hang)
12. Orders Management → POST Create Order (400 error)

**UNKNOWN STATUS (Test to discover):**
13. Books Management → POST Create Book
14. Books Management → PUT Update Book  
15. Books Management → DELETE Book
16. Books Management → GET Search Books
17. Users Management → GET All Users
18. Vouchers Management → GET by ID/Code/Active
19. Orders Management → GET by User, PUT Status

**Team Progress Tracking Result:**

Copy result này vào comment để track team progress:

```
ENDPOINT TESTING RESULTS:

WORKING (X/22):
- Health & System: X/2
- Books Management: X/6  
- Users Management: X/2
- Cart Management: X/3
- Orders Management: X/5
- Vouchers Management: X/4

CONFIRMED BUGS:
- Users endpoints: 500 Internal Server Error
- Cart endpoints: 400 Bad Request (missing userId)
- Orders CRUD: 404/timeout issues

NEED TESTING:
- [List untested endpoints]

OVERALL PROGRESS: X/22 endpoints working (X%)
Ready for production: YES/NO
```

---

## Common Issues

**Backend not starting:**
```bash
lsof -ti:8080 | xargs kill -9
cd backend && ./mvnw spring-boot:run
```

**Frontend not loading:**  
```bash
lsof -ti:5173 | xargs kill -9
cd frontend && npm run dev
```

**Database connection:**
```bash
cd backend && docker compose restart db
```

---

## Test Checklist - Copy for PR

```
TESTING RESULTS:

Backend: PASS/FAIL
- Swagger loads: YES/NO
- APIs respond: YES/NO  
- No errors in logs: YES/NO

Database: PASS/FAIL
- Connection ok: YES/NO
- Data persists: YES/NO

Frontend: PASS/FAIL  
- App loads: YES/NO
- No console errors: YES/NO

Integration: PASS/FAIL
- Frontend calls backend: YES/NO

Issues found: [None / List issues]
Ready to merge: YES/NO
```

---

## Cleanup

```bash
# After testing
git checkout develop
git branch -D pr10-test

# Stop services
docker compose down
# or Ctrl+C manual processes
```

---

## Quick Commands Summary

```bash
# Test everything
./scripts/quick-test.sh

# Backend only
curl http://localhost:8080/swagger-ui/index.html
curl http://localhost:8080/books

# Database only  
docker exec bookstore_db pg_isready -U postgres

# Frontend only
http://localhost:5173 (in browser)
```