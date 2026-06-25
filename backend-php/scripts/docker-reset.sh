#!/bin/bash

# BoothieCall Elegancia - Docker Reset Script
# This script completely resets the Docker environment

set -e

echo "🔄 BoothieCall Elegancia - Docker Reset"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Confirmation prompt
read -p "⚠️  This will destroy all containers, volumes, and data. Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Reset cancelled."
    exit 0
fi

print_status "Stopping all containers..."
docker-compose down --remove-orphans

print_status "Removing all volumes (this will delete all data)..."
docker-compose down -v

print_status "Removing Docker images..."
docker-compose down --rmi all 2>/dev/null || true

print_status "Pruning Docker system..."
docker system prune -f

print_status "Cleaning up local directories..."
rm -rf logs/* uploads/* cache/* temp/* 2>/dev/null || true

print_success "🧹 Docker environment completely reset!"
echo ""
print_status "To set up again, run: ./scripts/docker-setup.sh"