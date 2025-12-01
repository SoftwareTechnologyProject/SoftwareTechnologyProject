#!/bin/bash

echo "Frontend Test Script"
echo "==================="

FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:8080"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() { echo -e "${GREEN}PASS: $1${NC}"; }
error() { echo -e "${RED}FAIL: $1${NC}"; }
warning() { echo -e "${YELLOW}WARN: $1${NC}"; }

echo "Step 1: Checking Frontend Dependencies..."
cd frontend
if [ -d "node_modules" ]; then
    success "Node modules installed"
else
    error "Node modules not found. Run: npm install"
    exit 1
fi

echo ""
echo "Step 2: Testing Frontend Accessibility..."
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    success "Frontend is accessible at $FRONTEND_URL"
else
    error "Frontend not responding. Run: npm run dev"
    exit 1
fi

echo ""
echo "Step 3: Checking Frontend Build..."
echo "Testing production build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    success "Production build successful"
else
    warning "Production build failed - check for errors"
fi

echo ""
echo "Step 4: Testing API Integration..."
# Check if frontend can reach backend
BACKEND_REACHABLE=$(curl -s "$BACKEND_URL/books" -w "%{http_code}" -o /dev/null)
if [ "$BACKEND_REACHABLE" = "200" ]; then
    success "Backend API reachable from frontend"
else
    warning "Backend API not reachable (code: $BACKEND_REACHABLE)"
fi

echo ""
echo "Step 5: Frontend Smoke Tests..."
echo "Testing key routes (requires manual verification):"
echo ""
echo "Manual Test Checklist:"
echo "1. Open: $FRONTEND_URL"
echo "2. Check: Header/Footer loads"
echo "3. Check: Navigation works"
echo "4. Check: Books page loads"
echo "5. Check: No console errors"
echo "6. Check: API calls work"
echo ""

echo "Tips:"
echo "- Press F12 to open DevTools"
echo "- Check Console tab for errors"
echo "- Check Network tab for API calls"
echo "- Test responsive design with device toolbar"

echo ""
echo "Frontend Test Complete!"
echo "Remember to test manually in browser: $FRONTEND_URL"