#!/bin/bash
# Complete system startup script

echo "Bookstore System Startup"
echo "========================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if script is run from project root
if [ ! -f "backend/docker-compose.yml" ] || [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    echo "Expected structure:"
    echo "  project-root/"
    echo "    ├── backend/"
    echo "    ├── frontend/"
    echo "    └── scripts/"
    exit 1
fi

# Parse command line options
LOAD_SAMPLE_DATA=${LOAD_SAMPLE_DATA:-true}
SKIP_FRONTEND=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-data)
            LOAD_SAMPLE_DATA=false
            echo -e "${YELLOW}Sample data loading disabled${NC}"
            shift
            ;;
        --backend-only)
            SKIP_FRONTEND=true
            echo -e "${YELLOW}Frontend startup skipped${NC}"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --no-data        Skip loading sample data"
            echo "  --backend-only   Start only backend services"
            echo "  -h, --help       Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  LOAD_SAMPLE_DATA=false  Skip sample data (same as --no-data)"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Function to check if command was successful
check_success() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        exit 1
    fi
}

# Step 1: Start backend services
echo -e "${BLUE}Starting backend services...${NC}"
cd backend

if [ "$LOAD_SAMPLE_DATA" = "false" ]; then
    LOAD_SAMPLE_DATA=false docker compose up --build -d
else
    docker compose up --build -d
fi

check_success $? "Backend services started"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Backend failed to start in 60 seconds${NC}"
        echo "Check logs with: docker logs bookstore_app"
        exit 1
    fi
    echo -n "."
    sleep 2
done
echo ""

# Step 2: Start frontend (if not skipped)
if [ "$SKIP_FRONTEND" = "false" ]; then
    echo -e "${BLUE}Starting frontend...${NC}"
    cd ../frontend
    
    # Check if node_modules exists, if not run npm install
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
        check_success $? "Frontend dependencies installed"
    fi
    
    echo "Starting frontend development server..."
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait a bit for frontend to start
    sleep 3
    
    # Check if frontend is running
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${RED}✗ Frontend failed to start${NC}"
        exit 1
    fi
    
    cd ..
fi

# Display status
echo ""
echo -e "${GREEN}System started successfully!${NC}"
echo "=========================="
echo ""
echo "Services running:"
echo "  Backend API:    http://localhost:8080"
echo "  Swagger UI:     http://localhost:8080/swagger-ui/index.html"
echo "  Database:       localhost:5432 (postgres/123456)"
echo "  PgAdmin:        http://localhost:8085 (admin@admin.com/root)"

if [ "$SKIP_FRONTEND" = "false" ]; then
    echo "  Frontend:       http://localhost:5173"
fi

echo ""
echo "Quick tests:"
echo "  Backend health: curl http://localhost:8080/actuator/health"
echo "  Books API:      curl http://localhost:8080/books"
echo "  Vouchers API:   curl http://localhost:8080/vouchers"

if [ "$LOAD_SAMPLE_DATA" = "true" ]; then
    echo ""
    echo "Sample data loaded:"
    echo "  11,000+ books from CSV"
    echo "  Categories and vouchers"
    echo "  Test users (admin/customer/staff)"
fi

echo ""
echo "To stop services:"
echo "  Backend: cd backend && docker compose down"
if [ "$SKIP_FRONTEND" = "false" ]; then
    echo "  Frontend: kill $FRONTEND_PID (or Ctrl+C in terminal)"
fi

# Save PIDs for cleanup script
if [ "$SKIP_FRONTEND" = "false" ]; then
    echo $FRONTEND_PID > .frontend.pid
fi