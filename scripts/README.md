# Testing & Automation Scripts

Collection of automated scripts and tools for the Bookstore project.

## Files Overview

### Development Scripts
- `start-system.sh` - Start complete system (backend + frontend)
- `stop-system.sh` - Stop all services cleanly
- `test-sample-data.sh` - Validate sample data loading

### Testing Scripts  
- `quick-test.sh` - Complete backend + frontend smoke test
- `test-frontend.sh` - Frontend-specific tests
- `Bookstore_API_Collection.json` - Postman collection for API testing

## Quick Start

### 1. Start Complete System
```bash
./scripts/start-system.sh
```
This will:
- Start backend services with Docker Compose
- Load sample data automatically  
- Start React frontend development server
- Validate system is ready

### 2. Stop System
```bash
./scripts/stop-system.sh
```
This will cleanly stop all services.

### 3. Test Sample Data
```bash
./scripts/test-sample-data.sh
```
This will validate that sample data was loaded correctly.

### 4. Run Full System Test
```bash
./scripts/quick-test.sh
```
This will test:
- Docker services status
- Backend health & APIs
- Database connectivity  
- Frontend accessibility

### 5. Run Frontend Tests
```bash
./scripts/test-frontend.sh
```
This will test:
- Node modules installation
- Frontend build process
- API integration
- Manual test checklist

### 6. Import Postman Collection

1. Open Postman
2. Click "Import" 
3. Select `scripts/Bookstore_API_Collection.json`
4. Run individual requests or entire collection

## Collection Features

### Health Checks
- Backend health endpoint
- Swagger UI accessibility

### Authentication  
- User registration
- User login with token extraction

### Books API
- Get all books
- Get book details  
- Create new book (admin required)

### Shopping Cart
- Get user cart
- Add items to cart

### Orders
- Get user orders
- Create new order

### Categories
- Get all categories

## Environment Variables

The Postman collection uses these variables:
- `baseUrl`: Backend URL (default: http://localhost:8080)
- `frontendUrl`: Frontend URL (default: http://localhost:5173) 
- `authToken`: JWT token (auto-populated after login)
- `userId`: User ID (auto-populated after registration)
- `bookId`: Book ID (auto-populated from book list)

## Prerequisites

### For Scripts:
- Docker & Docker Compose running
- `curl` installed
- `jq` installed (optional, for JSON parsing)
- Node.js & npm (for frontend)

### For Postman:
- Postman Desktop App
- Backend service running on localhost:8080

## Usage Tips

### Development Workflow:
```bash
# 1. Start complete system
./scripts/start-system.sh

# 2. Run tests
./scripts/test-sample-data.sh
./scripts/quick-test.sh

# 3. Development work...

# 4. Stop system
./scripts/stop-system.sh
```

### Team Workflow After Merge:
```bash
# 1. Pull latest changes
git pull origin main

# 2. Restart with latest code
./scripts/stop-system.sh
./scripts/start-system.sh

# 3. System ready with fresh sample data
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

## Test Results

Expected outputs:

### Success:
```
Bookstore Quick Test Script
✓ Docker services are running
✓ Backend health check passed
✓ Books API working - Found X books
✓ Frontend is accessible
✓ PostgreSQL is running
```

### Issues:
```
✗ Backend not responding on http://localhost:8080
✗ Frontend not responding on http://localhost:5173
✗ PostgreSQL not responding
```

## Integration with Development Workflow

These scripts streamline your development process:

1. **Start Development Session**: `./scripts/start-system.sh`
2. **Validate Setup**: `./scripts/test-sample-data.sh`
3. **Run Tests**: `./scripts/quick-test.sh`
4. **Development Work**
5. **End Session**: `./scripts/stop-system.sh`

## Support

If scripts fail:
1. Check Docker services: `docker compose ps`
2. Check application logs: `docker compose logs -f`
3. Verify ports are not in use: `lsof -i :8080 -i :5173`
4. Restart services: `./scripts/stop-system.sh && ./scripts/start-system.sh`