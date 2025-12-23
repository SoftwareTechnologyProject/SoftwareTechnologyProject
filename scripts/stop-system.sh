#!/bin/bash
# Stop all system services

echo "Stopping Bookstore System"
echo "========================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd "$(dirname "$0")/.." || exit 1

# Function to check if command was successful
check_success() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${YELLOW}⚠ $2${NC}"
    fi
}

# Stop frontend if running
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        check_success $? "Frontend stopped"
    fi
    rm -f .frontend.pid
fi

# Stop any npm dev servers
echo "Stopping any npm dev servers..."
pkill -f "npm run dev" || true
pkill -f "vite" || true

# Stop backend services
echo "Stopping backend services..."
cd backend
docker compose down
check_success $? "Backend services stopped"

echo ""
echo -e "${GREEN}All services stopped${NC}"

# Optional: Clean up volumes
read -p "Do you want to remove database volumes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose down -v
    check_success $? "Database volumes removed"
    echo -e "${YELLOW}Note: Sample data will be reloaded on next startup${NC}"
fi