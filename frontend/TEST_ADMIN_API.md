# Test Admin Book API

## Vấn đề phát hiện:

### 1. **Authentication Required**
- GET `/api/books` → OK (public)
- POST/PUT/DELETE `/api/books` → **Cần ROLE_ADMIN**
- Frontend chưa có JWT token trong localStorage

### 2. **Cách test:**

#### Bước 1: Login với tài khoản ADMIN
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

**Lưu lại `accessToken` từ response**

#### Bước 2: Test GET books (không cần token)
```bash
curl http://localhost:8080/api/books?page=0&size=5
```

#### Bước 3: Test POST book (cần token)
```bash
curl -X POST http://localhost:8080/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Book",
    "description": "Test Description",
    "publisherYear": 2024,
    "publisherId": 1,
    "authorIds": [1],
    "categoryIds": [1],
    "variants": [{
      "price": 100000,
      "quantity": 10,
      "sold": 0,
      "status": "AVAILABLE",
      "isbn": "1234567890123",
      "imageUrls": []
    }]
  }'
```

### 3. **Giải pháp:**

#### Option 1: Login trước khi dùng BookAdmin
1. Truy cập http://localhost:5173/login
2. Login với:
   - Username: `admin`
   - Password: `password123`
3. Sau đó vào http://localhost:5173/admin/books

#### Option 2: Thêm token test vào localStorage (development)
```javascript
// Mở Console trong browser (F12)
// Dán code này:
localStorage.setItem('accessToken', 'YOUR_TOKEN_FROM_LOGIN');
location.reload();
```

### 4. **Kiểm tra trong Browser:**

1. Mở http://localhost:5173/admin/books
2. Mở DevTools (F12)
3. Tab Console: Xem có lỗi gì không
4. Tab Network: 
   - Filter: XHR
   - Xem request `/api/books`
   - Kiểm tra Status Code:
     - 200 = OK
     - 401 = Unauthorized (chưa login)
     - 403 = Forbidden (không có quyền ADMIN)

### 5. **Tài khoản test:**

Từ database seed:
```sql
-- Admin account
Username: admin
Email: ndtoan.work@gmail.com
Password: password123
Role: ADMIN

-- Customer account
Username: customer
Email: customer@test.com
Password: password123
Role: USER
```

### 6. **Các lỗi thường gặp:**

1. **"Không thể tải danh sách sách"**
   - Kiểm tra backend có chạy không: `docker ps | grep bookstore_app`
   - Kiểm tra CORS: Xem Network tab có lỗi CORS không

2. **"Không thể thêm sách"** 
   - Chưa login → 401
   - Login nhưng không phải ADMIN → 403
   - Thiếu field required → 400

3. **"Không thể xóa sách"**
   - Sách đang trong giỏ hàng hoặc đơn hàng → 400 với message từ backend
