#!/bin/bash
# Test script for sample data loading system

echo "Testing Sample Data Loading System"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
        return 1
    fi
}

# Change to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Check prerequisites
echo "Checking prerequisites..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    test_result 0 "Docker is installed"
else
    test_result 1 "Docker is not installed"
    exit 1
fi

# Check if CSV files exist
if [ -f "../datas/categories.csv" ]; then
    test_result 0 "Categories CSV exists"
else
    test_result 1 "Categories CSV missing"
fi

if [ -f "../datas/data.csv" ]; then
    test_result 0 "Books CSV exists"
    BOOK_COUNT=$(wc -l < "../datas/data.csv")
    echo "   Books in CSV: $((BOOK_COUNT-1)) records"
else
    test_result 1 "Books CSV missing"
fi

# Check init scripts
if [ -f "init-scripts/01-schema.sql" ]; then
    test_result 0 "Schema script exists"
else
    test_result 1 "Schema script missing"
fi

if [ -f "init-scripts/02-seed-data.sh" ] && [ -x "init-scripts/02-seed-data.sh" ]; then
    test_result 0 "Seed script exists and is executable"
else
    test_result 1 "Seed script missing or not executable"
fi

# Check docker-compose.yml configuration
if grep -q "LOAD_SAMPLE_DATA" docker-compose.yml; then
    test_result 0 "Docker compose has LOAD_SAMPLE_DATA configuration"
else
    test_result 1 "Docker compose missing LOAD_SAMPLE_DATA configuration"
fi

if grep -q "categories.csv" docker-compose.yml; then
    test_result 0 "Docker compose mounts categories.csv"
else
    test_result 1 "Docker compose missing categories.csv mount"
fi

if grep -q "data.csv" docker-compose.yml; then
    test_result 0 "Docker compose mounts data.csv"
else
    test_result 1 "Docker compose missing data.csv mount"
fi

# Check .env.example
if grep -q "LOAD_SAMPLE_DATA" .env.example; then
    test_result 0 ".env.example has LOAD_SAMPLE_DATA documentation"
else
    test_result 1 ".env.example missing LOAD_SAMPLE_DATA"
fi

# Validate script syntax
echo "Validating script syntax..."

# Check SQL syntax (basic)
if head -10 init-scripts/01-schema.sql | grep -q "CREATE TYPE\|CREATE TABLE"; then
    test_result 0 "Schema SQL syntax looks valid"
else
    test_result 1 "Schema SQL syntax issue"
fi

# Check bash script syntax
if bash -n init-scripts/02-seed-data.sh; then
    test_result 0 "Seed script syntax is valid"
else
    test_result 1 "Seed script syntax error"
fi

# Check documentation
if [ -f "SAMPLE_DATA_GUIDE.md" ]; then
    test_result 0 "Documentation exists"
    if grep -q "docker compose up --build -d" SAMPLE_DATA_GUIDE.md; then
        test_result 0 "Documentation has usage examples"
    else
        test_result 1 "Documentation missing usage examples"
    fi
else
    test_result 1 "Documentation missing"
fi

echo ""
echo "Manual Testing Instructions"
echo "=========================="

echo -e "${YELLOW}To test the system manually:${NC}"
echo ""
echo "1. Start Docker Desktop"
echo ""
echo "2. Test with sample data (default):"
echo "   cd backend && docker compose up --build -d"
echo ""
echo "3. Test without sample data:"
echo "   cd backend && LOAD_SAMPLE_DATA=false docker compose up --build -d"
echo ""
echo "4. Check database content:"
echo "   docker exec bookstore_db psql -U postgres -d bookstore -c \"SELECT COUNT(*) FROM Book;\""
echo ""
echo "5. View logs:"
echo "   docker logs bookstore_db"
echo ""

echo -e "${GREEN}System validation completed${NC}"
echo ""
echo "Next steps:"
echo "   1. Start Docker Desktop if not running"  
echo "   2. Run: cd backend && docker compose up --build -d"
echo "   3. Wait for data loading (2-3 minutes first time)"
echo "   4. Test API: curl http://localhost:8080/books"