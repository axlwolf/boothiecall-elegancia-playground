# Design Document - Docker Implementation

## Overview

This design document outlines the technical architecture and implementation approach for dockerizing the BoothieCall Elegancia project. The solution provides a complete development environment with frontend React app, PHP backend, MySQL database, Redis cache, and phpMyAdmin administration interface, all orchestrated through Docker Compose.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host                              │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │  Frontend   │───▶│   Backend   │───▶│   MySQL     │    │
│  │  (React)    │    │   (PHP)     │    │ (Database)  │    │
│  │  Port: 3000 │    │  Port: 8080 │    │ Port: 3306  │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│         │                   │                             │
│         │                   ▼                             │
│         │           ┌─────────────┐                       │
│         │           │    Redis    │                       │
│         │           │   (Cache)   │                       │
│         │           │ Port: 6379  │                       │
│         │           └─────────────┘                       │
│         │                                                 │
│         ▼                                                 │
│  ┌─────────────┐                                          │
│  │ phpMyAdmin  │                                          │
│  │   (Admin)   │                                          │
│  │ Port: 8081  │                                          │
│  └─────────────┘                                          │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

### Service Architecture

#### 1. Frontend Service (React + Nginx)

- **Base Image:** `node:18-alpine` (build stage) + `nginx:alpine` (serve stage)
- **Purpose:** Serve React application and proxy API requests
- **Port:** 3000 (external) → 80 (internal)
- **Features:** Hot reload in development, optimized build for production

#### 2. Backend Service (PHP + Apache)

- **Base Image:** `php:8.1-apache`
- **Purpose:** Run Slim Framework 4 API with all required extensions
- **Port:** 8080 (external) → 80 (internal)
- **Features:** Auto-reload code changes, comprehensive PHP extensions

#### 3. Database Service (MySQL)

- **Base Image:** `mysql:8.0`
- **Purpose:** Primary database with automatic schema initialization
- **Port:** 3306 (internal only)
- **Features:** Data persistence, automatic backup capabilities

#### 4. Cache Service (Redis)

- **Base Image:** `redis:7-alpine`
- **Purpose:** Session storage and application caching
- **Port:** 6379 (internal only)
- **Features:** Persistence configuration, memory optimization

#### 5. Admin Service (phpMyAdmin)

- **Base Image:** `phpmyadmin:latest`
- **Purpose:** Database administration interface
- **Port:** 8081 (external) → 80 (internal)
- **Features:** Secure access, MySQL integration

## Components and Interfaces

### Docker Compose Configuration

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
      target: development
    ports:
      - "3000:80"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    environment:
      - VITE_API_URL=http://localhost:8080/api/v1
    depends_on:
      - backend
    networks:
      - boothiecall-network

  backend:
    build:
      context: ./backend-php
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    volumes:
      - ./backend-php:/var/www/html
      - uploads:/var/www/html/uploads
      - logs:/var/www/html/logs
    environment:
      - DB_HOST=mysql
      - DB_NAME=boothiecall
      - DB_USER=boothiecall
      - DB_PASS=password
      - REDIS_HOST=redis
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - boothiecall-network

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=boothiecall
      - MYSQL_USER=boothiecall
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend-php/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
    networks:
      - boothiecall-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - boothiecall-network

  phpmyadmin:
    image: phpmyadmin:latest
    ports:
      - "8081:80"
    environment:
      - PMA_HOST=mysql
      - PMA_USER=boothiecall
      - PMA_PASSWORD=password
    depends_on:
      - mysql
    networks:
      - boothiecall-network

volumes:
  mysql_data:
  redis_data:
  uploads:
  logs:

networks:
  boothiecall-network:
    driver: bridge
```

### Dockerfile Specifications

#### Frontend Dockerfile (Multi-stage)

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Development stage
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend PHP Dockerfile

```dockerfile
FROM php:8.1-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    mysqli \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    opcache

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer*.json ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy application code
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 777 /var/www/html/uploads \
    && chmod -R 777 /var/www/html/logs

# Configure Apache
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["apache2-foreground"]
```

### Configuration Files

#### Apache Virtual Host Configuration

```apache
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /var/www/html/public

    <Directory /var/www/html/public>
        AllowOverride All
        Require all granted

        # Handle React Router
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ /index.php [QSA,L]
    </Directory>

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

#### Nginx Configuration for Frontend

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://backend:80/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Data Models

### Environment Variables Structure

```bash
# Development Environment (.env.docker)
APP_ENV=development
APP_DEBUG=true

# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_NAME=boothiecall
DB_USER=boothiecall
DB_PASS=password

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=docker_dev_jwt_secret_key_32_chars_minimum
JWT_REFRESH_SECRET=docker_dev_refresh_secret_key_32_chars_minimum

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# File Upload Configuration
UPLOAD_PATH=/var/www/html/uploads
LOG_PATH=/var/www/html/logs
```

### Volume Mapping Strategy

```yaml
volumes:
  # Persistent data
  mysql_data:          # Database files
  redis_data:          # Cache data
  uploads:             # User uploaded files
  logs:                # Application logs

  # Development bind mounts
  ./backend-php:/var/www/html           # PHP code hot reload
  ./src:/app/src                        # React code hot reload
  ./public:/app/public                  # Static assets
```

## Error Handling

### Container Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Dependency Management

```yaml
depends_on:
  mysql:
    condition: service_healthy
  redis:
    condition: service_started
```

### Graceful Shutdown

```bash
# In docker-compose.yml
stop_grace_period: 30s

# In Dockerfile
STOPSIGNAL SIGTERM
```

### Error Recovery Strategies

1. **Automatic Restart Policies**

   ```yaml
   restart: unless-stopped
   ```

2. **Health Check Failures**

   - Container restart after 3 failed health checks
   - Exponential backoff for restart attempts
   - Logging of health check failures

3. **Volume Mount Issues**
   - Automatic directory creation
   - Permission fixing scripts
   - Fallback to container-local storage

## Testing Strategy

### Development Testing

1. **Container Build Testing**

   ```bash
   docker-compose build --no-cache
   docker-compose config --quiet
   ```

2. **Service Integration Testing**

   ```bash
   docker-compose up -d
   docker-compose exec backend curl http://localhost/health
   docker-compose exec frontend curl http://localhost:3000
   ```

3. **Database Connectivity Testing**
   ```bash
   docker-compose exec backend php -r "
   try {
       \$pdo = new PDO('mysql:host=mysql;dbname=boothiecall', 'boothiecall', 'password');
       echo 'Database connection successful\n';
   } catch (Exception \$e) {
       echo 'Database connection failed: ' . \$e->getMessage() . '\n';
   }
   "
   ```

### Performance Testing

1. **Container Resource Usage**

   ```bash
   docker stats --no-stream
   ```

2. **Application Response Times**

   ```bash
   curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/health
   ```

3. **Database Performance**
   ```bash
   docker-compose exec mysql mysql -u boothiecall -p -e "SHOW PROCESSLIST;"
   ```

### Security Testing

1. **Container Security Scanning**

   ```bash
   docker scout cves backend-php_backend
   ```

2. **Network Security**

   ```bash
   docker network inspect boothiecall_boothiecall-network
   ```

3. **File Permissions Audit**
   ```bash
   docker-compose exec backend find /var/www/html -type f -perm /o+w
   ```

## Implementation Phases

### Phase 1: Backend Containerization (Day 1)

1. Create PHP Dockerfile with all extensions
2. Configure Apache virtual host
3. Set up MySQL service with schema initialization
4. Add Redis service for caching
5. Configure phpMyAdmin for database management
6. Test backend API endpoints

### Phase 2: Frontend Integration (Day 2)

1. Create multi-stage Dockerfile for React
2. Configure Nginx for serving and proxying
3. Set up hot reload for development
4. Configure CORS between services
5. Test full-stack communication
6. Optimize build process

### Phase 3: Automation and Documentation (Day 3)

1. Create setup and reset scripts
2. Add comprehensive health checks
3. Optimize Docker images for size and security
4. Write troubleshooting documentation
5. Create development workflow guides
6. Performance testing and optimization

## Security Considerations

### Container Security

- Non-root user execution where possible
- Minimal base images (Alpine Linux)
- Regular security updates
- Secret management through environment variables

### Network Security

- Internal network isolation
- Minimal port exposure
- Secure service-to-service communication
- CORS configuration

### Data Security

- Volume encryption for sensitive data
- Secure database credentials
- JWT secret management
- File upload restrictions

## Performance Optimizations

### Image Optimization

- Multi-stage builds to reduce image size
- Layer caching for faster builds
- Minimal base images
- Dependency optimization

### Runtime Performance

- Resource limits for containers
- Connection pooling for database
- Redis caching strategy
- Static asset optimization

### Development Experience

- Hot reload for code changes
- Fast container startup times
- Efficient volume mounting
- Minimal resource usage
