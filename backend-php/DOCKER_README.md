# 🐳 BoothieCall Elegancia - Docker Development Environment

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Git (for cloning the repository)

### One-Command Setup

```bash
# Clone and setup (if not already done)
git clone <repository-url>
cd boothiecall-elegancia-playground/backend-php

# Start the complete stack
./scripts/docker-setup.sh
```

### Manual Setup

```bash
# Build and start services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

## 📋 Services

| Service          | URL                          | Description            |
| ---------------- | ---------------------------- | ---------------------- |
| **Backend API**  | http://localhost:8080        | PHP Slim Framework API |
| **Health Check** | http://localhost:8080/health | API health endpoint    |
| **phpMyAdmin**   | http://localhost:8081        | Database management    |
| **MySQL**        | localhost:3306               | Database server        |
| **Redis**        | localhost:6379               | Cache server           |

## 🔧 Development Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
```

### Development Workflow

```bash
# Access backend container
docker-compose exec backend bash

# Run Composer commands
docker-compose exec backend composer install
docker-compose exec backend composer update

# Run PHP commands
docker-compose exec backend php test-endpoints.php

# Access MySQL directly
docker-compose exec mysql mysql -u boothiecall -pboothiecall_password boothiecall
```

### Database Operations

```bash
# Import SQL file
docker-compose exec -T mysql mysql -u boothiecall -pboothiecall_password boothiecall < backup.sql

# Export database
docker-compose exec mysql mysqldump -u boothiecall -pboothiecall_password boothiecall > backup.sql

# Reset database
docker-compose down -v
docker-compose up -d
```

## 🗂️ Project Structure

```
backend-php/
├── docker/                     # Docker configuration files
│   ├── apache/
│   │   └── 000-default.conf   # Apache virtual host
│   ├── php/
│   │   └── php.ini            # PHP configuration
│   └── mysql/
│       └── init.sql           # Database initialization
├── scripts/
│   ├── docker-setup.sh        # Setup script
│   └── docker-reset.sh        # Reset script
├── Dockerfile                 # PHP backend image
├── docker-compose.yml         # Service orchestration
├── .env.docker               # Docker environment variables
└── .dockerignore             # Docker ignore file
```

## 🔧 Configuration

### Environment Variables

The Docker environment uses `.env.docker` as the template. Key variables:

```env
# Database
DB_HOST=mysql
DB_NAME=boothiecall
DB_USER=boothiecall
DB_PASS=boothiecall_password

# Cache
CACHE_HOST=redis
CACHE_PORT=6379

# CORS (for frontend integration)
CORS_ORIGIN=http://localhost:3000,http://frontend:3000
```

### Volumes

- **mysql_data**: Persistent database storage
- **redis_data**: Persistent cache storage
- **uploads_data**: File uploads
- **logs_data**: Application logs
- **cache_data**: Application cache

## 🧪 Testing

### Health Checks

```bash
# Test API health
curl http://localhost:8080/health

# Test database connection
docker-compose exec backend php -r "
try {
    \$pdo = new PDO('mysql:host=mysql;dbname=boothiecall', 'boothiecall', 'boothiecall_password');
    echo 'Database connection: OK\n';
} catch (Exception \$e) {
    echo 'Database connection: FAILED - ' . \$e->getMessage() . '\n';
}
"

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### Endpoint Testing

```bash
# Run the automated endpoint tests
docker-compose exec backend php test-endpoints.php

# Test specific endpoints
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
lsof -i :8080
lsof -i :3306

# Stop conflicting services
brew services stop mysql  # If you have local MySQL
```

#### 2. Permission Issues

```bash
# Fix file permissions
chmod -R 755 .
chmod -R 777 logs uploads cache temp
```

#### 3. Database Connection Issues

```bash
# Check MySQL container logs
docker-compose logs mysql

# Restart MySQL service
docker-compose restart mysql

# Wait for MySQL to be ready
docker-compose exec mysql mysqladmin ping -h localhost -u boothiecall -pboothiecall_password
```

#### 4. Container Build Issues

```bash
# Clean rebuild
docker-compose down --rmi all
docker-compose build --no-cache
docker-compose up -d
```

### Reset Everything

```bash
# Complete reset (destroys all data)
./scripts/docker-reset.sh

# Setup again
./scripts/docker-setup.sh
```

## 🔄 Integration with Frontend

When the frontend is also dockerized, the services will communicate through the Docker network:

```yaml
# Frontend service (future)
frontend:
  build: ../Dockerfile.frontend
  ports: ["3000:80"]
  environment:
    - VITE_API_URL=http://backend:80/api/v1
  depends_on: [backend]
```

## 📊 Monitoring

### Service Status

```bash
# Check all services
docker-compose ps

# Check service health
docker-compose exec backend curl -f http://localhost/health
docker-compose exec mysql mysqladmin ping -h localhost -u boothiecall -pboothiecall_password
docker-compose exec redis redis-cli ping
```

### Resource Usage

```bash
# Check resource usage
docker stats

# Check disk usage
docker system df
```

## 🚀 Production Considerations

This Docker setup is optimized for development. For production:

1. **Use production-ready images** (Alpine Linux, multi-stage builds)
2. **Configure proper secrets management**
3. **Set up SSL/TLS termination**
4. **Configure proper logging and monitoring**
5. **Use orchestration tools** (Docker Swarm, Kubernetes)

## 📝 Notes

- The backend container mounts the source code as a volume for development
- Database and cache data persist between container restarts
- All services are connected through a custom Docker network
- Health checks ensure services are ready before marking as healthy
- CORS is configured to allow frontend connections

---

**Happy Coding! 🎉**
