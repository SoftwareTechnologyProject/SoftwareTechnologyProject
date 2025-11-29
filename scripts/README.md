# 🧪 Testing Scripts

Collection of automated testing scripts and tools for the Bookstore project.

## 📁 Files Overview

- `quick-test.sh` - Complete backend + frontend smoke test
- `test-frontend.sh` - Frontend-specific tests  
- `Bookstore_API_Collection.json` - Postman collection for API testing

## 🚀 Quick Start

### 1. Run Full System Test
```bash
./scripts/quick-test.sh
```
This will test:
- ✅ Docker services status
- ✅ Backend health & APIs
- ✅ Database connectivity  
- ✅ Frontend accessibility

### 2. Run Frontend Tests
```bash
./scripts/test-frontend.sh
```
This will test:
- ✅ Node modules installation
- ✅ Frontend build process
- ✅ API integration
- 📋 Manual test checklist

### 3. Import Postman Collection

1. Open Postman
2. Click "Import" 
3. Select `scripts/Bookstore_API_Collection.json`
4. Run individual requests or entire collection

## 📋 Collection Features

### 🏥 Health Checks
- Backend health endpoint
- Swagger UI accessibility

### 🔐 Authentication  
- User registration
- User login with token extraction

### 📚 Books API
- Get all books
- Get book details  
- Create new book (admin required)

### 🛒 Shopping Cart
- Get user cart
- Add items to cart

### 📦 Orders
- Get user orders
- Create new order

### 📊 Categories
- Get all categories

## ⚙️ Environment Variables

The Postman collection uses these variables:
- `baseUrl`: Backend URL (default: http://localhost:8080)
- `frontendUrl`: Frontend URL (default: http://localhost:5173) 
- `authToken`: JWT token (auto-populated after login)
- `userId`: User ID (auto-populated after registration)
- `bookId`: Book ID (auto-populated from book list)

## 🔧 Prerequisites

### For Scripts:
- Docker & Docker Compose running
- `curl` installed
- `jq` installed (optional, for JSON parsing)

### For Postman:
- Postman Desktop App
- Backend service running on localhost:8080

## 💡 Usage Tips

### Running Tests Before PR Merge:
```bash
# 1. Start services
docker compose up -d

# 2. Run quick test
./scripts/quick-test.sh

# 3. Import & run Postman collection

# 4. Run frontend test  
./scripts/test-frontend.sh
```

### Troubleshooting:
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Check if services are running
docker compose ps

# Check logs for errors
docker compose logs -f
```

## 📝 Test Results

Expected outputs:

### ✅ Success:
```
🚀 Bookstore Quick Test Script
✅ Docker services are running
✅ Backend health check passed
✅ Books API working - Found X books
✅ Frontend is accessible
✅ PostgreSQL is running
```

### ❌ Issues:
```
❌ Backend not responding on http://localhost:8080
❌ Frontend not responding on http://localhost:5173
❌ PostgreSQL not responding
```

## 🔄 Integration with PR Workflow

Use these scripts as part of your PR testing process:

1. **Checkout PR branch**
2. **Run `./scripts/quick-test.sh`**
3. **Import & run Postman collection**
4. **Document results in PR comment**

## 📞 Support

If scripts fail:
1. Check Docker services: `docker compose ps`
2. Check application logs: `docker compose logs -f`
3. Verify ports are not in use: `lsof -i :8080 -i :5173`
4. Restart services: `docker compose down && docker compose up -d`