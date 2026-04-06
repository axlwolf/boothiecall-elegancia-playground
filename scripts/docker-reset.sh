#!/bin/bash
# BoothieCall Elegancia - Docker Reset Script
# Stops all containers, cleans up, and optionally resets data

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔄 BoothieCall Elegancia - Docker Reset${NC}"
echo "=========================================="

RESET_DATA=false

if [ "$1" = "--full" ] || [ "$1" = "-f" ]; then
    RESET_DATA=true
    echo -e "${RED}⚠️  Full reset: ALL data (database, uploads, cache) will be deleted${NC}"
    read -p "Are you sure? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Cancelled."
        exit 0
    fi
fi

# Stop all containers
echo -e "${YELLOW}🛑 Stopping containers...${NC}"
docker compose down

if [ "$RESET_DATA" = true ]; then
    echo -e "${YELLOW}🗑️  Removing volumes and data...${NC}"
    docker compose down -v --remove-orphans
    
    # Clean local directories
    rm -rf backend-php/logs/*.log
    rm -rf backend-php/cache/*
    rm -rf backend-php/temp/*
    
    echo -e "${YELLOW}🧹 Pruning Docker build cache...${NC}"
    docker builder prune -f 2>/dev/null || true
fi

echo ""
echo -e "${GREEN}✅ Reset complete${NC}"
echo ""
echo "To start again:"
echo "  ./scripts/docker-setup.sh    # Full setup"
echo "  docker compose up -d         # Quick start"
