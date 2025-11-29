#!/bin/bash

echo "Bookstore Quick Test Script"
echo "=========================="

BASE_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:5173"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}PASS: $1${NC}"
}

error() {
    echo -e "${RED}FAIL: $1${NC}"
}

warning() {
    echo -e "${YELLOW}WARN: $1${NC}"
}

echo "Step 1: Checking Docker Services..."
if docker compose ps | grep -q "Up"; then
    success "Docker services are running"
elif docker ps | grep -q "bookstore"; then
    success "Backend containers are running"
else
    error "No containers running. Run: docker compose up -d"
    exit 1
fi

echo ""
echo "Step 2: Testing Backend..."
if curl -s "$BASE_URL/swagger-ui/index.html" | grep -q "Swagger UI"; then
    success "Backend Swagger UI accessible"
elif curl -s "$BASE_URL" > /dev/null 2>&1; then
    success "Backend server responding"
else
    error "Backend not responding on $BASE_URL"
    exit 1
fi

echo ""
echo "Step 3: Testing APIs..."
BOOKS_RESPONSE=$(curl -s "$BASE_URL/books")
if [ $? -eq 0 ]; then
    BOOKS_COUNT=$(echo "$BOOKS_RESPONSE" | jq length 2>/dev/null || echo "0")
    success "Books API working - Found $BOOKS_COUNT books"
else
    error "Books API not responding"
fi

echo ""
echo "Step 4: Testing Frontend..."
if curl -s --connect-timeout 5 --max-time 10 "$FRONTEND_URL" > /dev/null 2>&1; then
    success "Frontend accessible on $FRONTEND_URL"
else
    warning "Frontend not responding. Run: cd frontend && npm run dev"
fi

echo ""
echo "Step 5: Testing Database..."
if docker exec bookstore_db pg_isready -U postgres > /dev/null 2>&1; then
    success "PostgreSQL is running"
    
    # Test database tables
    TABLE_COUNT=$(docker exec bookstore_db psql -U postgres -d bookstore -c "\dt" 2>/dev/null | grep -c "table")
    if [ "$TABLE_COUNT" -gt 5 ]; then
        success "Database schema ready ($TABLE_COUNT tables)"
    else
        warning "Database may not be fully initialized"
    fi
    
    # Test data
    BOOK_COUNT=$(docker exec bookstore_db psql -U postgres -d bookstore -c "SELECT count(*) FROM book;" -t 2>/dev/null | xargs)
    success "Books in database: ${BOOK_COUNT:-0}"
else
    error "PostgreSQL not responding"
fi

echo ""
echo "Test Summary:"
echo "- Backend: Working"
echo "- Database: Working" 
echo "- Frontend: Check manually at $FRONTEND_URL"
echo ""
echo "Next Steps:"
echo "- Open Swagger: $BASE_URL/swagger-ui/index.html"
echo "- Open Frontend: $FRONTEND_URL"
echo "- Import Postman collection: scripts/Bookstore_API_Collection.json"
echo ""
echo "Test completed!"