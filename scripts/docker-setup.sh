#!/bin/bash
# BoothieCall Elegancia - Docker Setup Script
# Initializes the complete development environment from scratch

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🐳 BoothieCall Elegancia - Docker Setup${NC}"
echo "=========================================="

# Check Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker Desktop first.${NC}"
    echo "   https://docs.docker.com/desktop/install/mac-install/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker found${NC}"

# Create .env.docker if it doesn't exist
if [ ! -f .env.docker ]; then
    echo -e "${YELLOW}📝 Creating .env.docker from template...${NC}"
    cp .env.docker.example .env.docker 2>/dev/null || echo "Using existing .env.docker"
fi

# Create required directories
echo -e "${YELLOW}📁 Creating required directories...${NC}"
mkdir -p backend-php/uploads backend-php/logs backend-php/cache backend-php/temp

# Build and start containers
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker compose build

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose up -d

# Wait for MySQL to be healthy
echo -e "${YELLOW}⏳ Waiting for MySQL to be ready...${NC}"
RETRIES=30
until docker compose exec -T mysql mysqladmin ping -h localhost -u root -prootpassword --silent 2>/dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        echo -e "${RED}❌ MySQL failed to start within timeout${NC}"
        docker compose logs mysql
        exit 1
    fi
    sleep 2
done
echo -e "${GREEN}✅ MySQL is ready${NC}"

# Wait for backend health check
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
RETRIES=15
until curl -sf http://localhost:8080/health > /dev/null 2>&1; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        echo -e "${YELLOW}⚠️  Backend health check not responding yet (may still be starting)${NC}"
        break
    fi
    sleep 2
done

if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is ready${NC}"
fi

echo ""
echo -e "${GREEN}🎉 BoothieCall Elegancia is running!${NC}"
echo "=========================================="
echo -e "  Frontend:    ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend API: ${GREEN}http://localhost:8080${NC}"
echo -e "  phpMyAdmin:  ${GREEN}http://localhost:8081${NC}"
echo -e "  Health:      ${GREEN}http://localhost:8080/health${NC}"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f        # View all logs"
echo "  docker compose logs -f backend # View backend logs"
echo "  docker compose restart backend # Restart backend"
echo "  docker compose down            # Stop all services"
echo "  ./scripts/docker-reset.sh      # Full reset"
