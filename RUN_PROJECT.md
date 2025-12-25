# 🚀 Hướng dẫn chạy dự án Bookstore

## ✅ Đã hoàn thành:

- ✅ PostgreSQL đã cài đặt và chạy (port 5432)
- ✅ Database `bookstore` đã được tạo  
- ✅ Java 21 đã cài đặt
- ✅ Maven 3.9.11 đã cài đặt
- ✅ Backend code đã build thành công

## ⚠️ Còn thiếu:

### **Bước 1: Cài đặt Node.js**

1. Download Node.js LTS từ: https://nodejs.org/en/download/
2. Chọn **Windows Installer (.msi)** - 64-bit
3. Chạy file cài đặt, click Next → Install
4. **Restart VS Code** sau khi cài xong
5. Kiểm tra cài đặt thành công:
   ```powershell
   node -v
   npm -v
   ```

---

## 📝 Cách chạy dự án sau khi cài Node.js:

### **Cách 1: Chạy thủ công (2 Terminal)**

#### Terminal 1 - Backend:
```powershell
cd d:\SWPJ\backend
java -jar .\target\bookstore.war
```

#### Terminal 2 - Frontend (mở terminal mới):
```powershell
cd d:\SWPJ\frontend
npm install
npm run dev
```

---

### **Cách 2: Sử dụng script tự động** (Khuyến nghị)

Tôi đã tạo sẵn 2 file script:

#### **1. run-backend.ps1** - Chạy Backend
```powershell
.\run-backend.ps1
```

#### **2. run-frontend.ps1** - Chạy Frontend  
```powershell
.\run-frontend.ps1
```

#### **3. run-all.ps1** - Chạy cả 2 cùng lúc
```powershell
.\run-all.ps1
```

---

## 🌐 Truy cập sau khi chạy:

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8080 |
| **Swagger UI** | http://localhost:8080/swagger-ui/index.html |

---

## 🔧 Lỗi thường gặp:

### 1. "npm: command not found"
**Nguyên nhân**: Chưa cài Node.js  
**Giải pháp**: Cài Node.js theo Bước 1 ở trên

### 2. "Port 8080 already in use"
**Nguyên nhân**: Backend đang chạy ở process khác  
**Giải pháp**:
```powershell
netstat -ano | findstr :8080
taskkill /PID <PID_number> /F
```

### 3. "Cannot connect to database"
**Nguyên nhân**: PostgreSQL chưa chạy  
**Giải pháp**: 
- Bấm Win+R → gõ `services.msc`
- Tìm `postgresql-x64-18` → Click Start

---

## 💡 Tips:

1. **Hot Reload**:
   - Backend: Tự động reload khi save file (Spring DevTools)
   - Frontend: Tự động reload khi save file (Vite)

2. **Dừng chạy**:
   - Nhấn `Ctrl+C` trong terminal đang chạy

3. **Build lại Backend** (khi thay đổi code):
   ```powershell
   cd d:\SWPJ\backend
   mvn clean install -DskipTests
   ```

4. **Clear cache Frontend** (khi lỗi lạ):
   ```powershell
   cd d:\SWPJ\frontend
   rm -r node_modules
   npm install
   ```

---

## 📞 Cần hỗ trợ?

Kiểm tra lại:
1. PostgreSQL service đang chạy
2. Database `bookstore` đã tồn tại
3. File `application.yaml` có password đúng
4. Node.js đã cài đặt và restart VS Code
