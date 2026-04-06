#!/bin/bash
# BoothieCall Elegancia - Docker Status Script

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🐳 BoothieCall Elegancia - Service Status"
echo "=========================================="

check_service() {
    local name=$1
    local url=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "  $name: ${GREEN}✅ Running${NC} ($url)"
    else
        echo -e "  $name: ${RED}❌ Down${NC} ($url)"
    fi
}

echo ""
echo "Services:"
check_service "Backend API" "http://localhost:8080/health"
check_service "Frontend   " "http://localhost:3000"
check_service "phpMyAdmin " "http://localhost:8081"

echo ""
echo "Containers:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  No containers running"

echo ""
echo "Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "  No containers running"
