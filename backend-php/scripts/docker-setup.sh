#!/bin/bash

# BoothieCall Elegancia - Docker Setup Script
# This script sets up the complete Docker development environment

set -e

echo "🐳 BoothieCall Elegancia - Docker Setup"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Checking Docker installation..."
docker --version
docker-compose --version

# Create .env file for Docker if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from .env.docker template..."
    cp .env.docker .env
    print_success ".env file created"
else
    print_warning ".env file already exists, skipping creation"
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs uploads cache temp
chmod 777 logs uploads cache temp
print_success "Directories created and permissions set"

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Build and start services
print_status "Building and starting Docker services..."
docker-compose up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check MySQL
if docker-compose exec -T mysql mysqladmin ping -h localhost -u boothiecall -pboothiecall_password &>/dev/null; then
    print_success "MySQL is ready"
else
    print_warning "MySQL might still be starting up..."
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping &>/dev/null; then
    print_success "Redis is ready"
else
    print_warning "Redis might still be starting up..."
fi

# Check Backend API
sleep 5
if curl -f http://localhost:8080/health &>/dev/null; then
    print_success "Backend API is ready"
else
    print_warning "Backend API might still be starting up..."
fi

echo ""
print_success "🎉 Docker setup completed!"
echo ""
echo "📋 Service URLs:"
echo "   🔗 Backend API:    http://localhost:8080"
echo "   🔗 Health Check:   http://localhost:8080/health"
echo "   🔗 phpMyAdmin:     http://localhost:8081"
echo ""
echo "📋 Useful Commands:"
echo "   📊 View logs:       docker-compose logs -f"
echo "   🔄 Restart:         docker-compose restart"
echo "   🛑 Stop:            docker-compose down"
echo "   🗑️  Reset:           ./scripts/docker-reset.sh"
echo ""
echo "🧪 Test the API:"
echo "   curl http://localhost:8080/health"
echo "   curl http://localhost:8080/api/v1/auth/register"
echo ""

# Run endpoint tests if available
if [ -f "test-endpoints.php" ]; then
    print_status "Running endpoint tests..."
    sleep 5
    docker-compose exec -T backend php test-endpoints.php
fi