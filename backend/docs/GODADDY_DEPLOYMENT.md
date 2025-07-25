# GoDaddy Deployment Guide

## 🎯 Overview

This guide covers deploying the BoothieCall Backend API to GoDaddy shared hosting. GoDaddy has specific limitations that require configuration adjustments.

## 🚫 GoDaddy Limitations

### What's NOT Available on GoDaddy Shared Hosting:
- ❌ Docker containers
- ❌ Redis (use in-memory caching instead)
- ❌ PostgreSQL (use MySQL instead)
- ❌ MinIO/S3 (use local filesystem instead)
- ❌ Custom ports (uses standard HTTP/HTTPS ports)
- ❌ Background job queues
- ❌ WebSocket connections
- ❌ Root access or custom services

### What IS Available:
- ✅ Node.js applications
- ✅ MySQL databases
- ✅ File system access (limited)
- ✅ cPanel management
- ✅ SSL certificates
- ✅ Environment variables (via cPanel)

## 📋 Pre-Deployment Checklist

### 1. Database Setup
```bash
# In cPanel, create a MySQL database:
# - Database name: your_account_database_name
# - Database user: your_account_db_user
# - Grant all privileges to the user
```

### 2. Environment Configuration
```bash
# Copy the GoDaddy environment template
cp .env.godaddy .env

# Update with your actual values:
# - Database credentials from cPanel
# - Your domain name for CORS
# - Strong JWT secrets (generate new ones)
# - Session secrets (generate new ones)
```

### 3. Dependencies Adjustment
```bash
# Install production dependencies only
npm ci --production

# Remove development-only dependencies
npm prune --production
```

## 🚀 Deployment Steps

### Step 1: Prepare the Application

```bash
# Build the TypeScript application
npm run build

# Test the build locally
NODE_ENV=production npm start
```

### Step 2: Upload Files via cPanel File Manager

Upload these directories to your GoDaddy hosting:
```
public_html/api/          # Your API root
├── dist/                 # Compiled JavaScript
├── node_modules/         # Production dependencies
├── prisma/              # Database schema
├── package.json         # Package configuration
├── .env                 # Environment variables
└── uploads/             # File upload directory (create manually)
```

### Step 3: Database Migration

```bash
# Generate Prisma client for MySQL
npx prisma generate

# Run database migrations
npx prisma db push

# Seed initial data (optional)
npm run db:seed
```

### Step 4: Configure cPanel

#### Node.js App Setup:
1. Go to cPanel → Node.js Selector
2. Create new Node.js app:
   - **Node.js version**: 18.x or higher
   - **Application root**: `api`
   - **Application URL**: `yourdomain.com/api`
   - **Application startup file**: `dist/index.js`

#### Environment Variables:
Add in cPanel → Node.js → Environment Variables:
```
NODE_ENV=production
DATABASE_URL=mysql://user:pass@localhost:3306/dbname
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
SESSION_SECRET=your_session_secret_here
CORS_ORIGIN=https://yourdomain.com
```

#### SSL Certificate:
1. Go to cPanel → SSL/TLS
2. Enable "Force HTTPS Redirect"
3. Install SSL certificate (Let's Encrypt recommended)

### Step 5: File Permissions

Set correct permissions via cPanel File Manager:
```bash
# Application files
chmod 644 dist/*.js
chmod 644 package.json
chmod 644 .env

# Upload directory (writable)
chmod 755 uploads/
chmod 644 uploads/*

# Logs directory
chmod 755 logs/
chmod 644 logs/*
```

### Step 6: Start the Application

In cPanel → Node.js Selector:
1. Click "Restart" to start your application
2. Monitor logs for any errors
3. Test API endpoints

## 🔧 Configuration Differences

### Local Development vs GoDaddy Production

| Feature | Development | GoDaddy Production |
|---------|-------------|-------------------|
| Database | PostgreSQL | MySQL |
| Cache | Redis | In-memory (node-cache) |
| Storage | MinIO/S3 | Local filesystem |
| Port | 3001 | 80/443 (standard) |
| Process Manager | nodemon | cPanel Node.js |
| Logs | Console + file | File only |

### Code Adaptations

#### 1. Database Connection
```typescript
// Development (PostgreSQL)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Production (MySQL)
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

#### 2. Cache Service
```typescript
// Development (Redis)
import Redis from 'redis';
const client = Redis.createClient();

// Production (In-memory)
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 });
```

#### 3. File Storage
```typescript
// Development (MinIO)
import { Client } from 'minio';

// Production (Local filesystem)
import fs from 'fs/promises';
import path from 'path';
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Module not found" errors
```bash
# Ensure all dependencies are installed
npm ci --production

# Check Node.js version in cPanel
# Must be 18.x or higher
```

#### 2. Database connection errors
```bash
# Verify database credentials in .env
# Check database exists in cPanel → MySQL Databases
# Ensure user has all privileges
```

#### 3. File upload errors
```bash
# Check upload directory permissions
chmod 755 uploads/

# Verify file size limits in cPanel
# GoDaddy typically limits to 64MB
```

#### 4. CORS errors
```bash
# Update CORS_ORIGIN in .env with your actual domain
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Monitoring and Logs

#### Access Logs:
```bash
# In cPanel → Node.js → Logs
# Check application startup logs
# Monitor error logs for issues
```

#### Health Check:
```bash
# Test API health endpoint
curl https://yourdomain.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-07-24T19:00:00.000Z",
  "environment": "production"
}
```

## 📊 Performance Optimization

### For GoDaddy Shared Hosting:

1. **Enable Compression**
   - Already configured in Express app
   - Reduces bandwidth usage

2. **Optimize Images**
   - Use Sharp for image processing
   - Implement image resizing/compression

3. **Cache Static Assets**
   - Configure proper cache headers
   - Use CDN if available

4. **Database Optimization**
   - Add proper indexes
   - Optimize queries
   - Use connection pooling

## 🔒 Security Considerations

### Production Security:

1. **Environment Variables**
   - Never commit .env files
   - Use strong, unique secrets
   - Rotate secrets regularly

2. **File Permissions**
   - Restrict access to sensitive files
   - Secure upload directories

3. **Database Security**
   - Use strong database passwords
   - Limit database user privileges
   - Regular backups

4. **SSL/HTTPS**
   - Force HTTPS redirects
   - Use strong SSL certificates
   - Configure security headers

## 📞 Support

### GoDaddy Support Resources:
- cPanel documentation
- Node.js hosting guides
- Database management tutorials
- SSL certificate installation

### Application Support:
- Check application logs in cPanel
- Monitor API health endpoints
- Review error tracking
- Database query optimization

---

**Note**: This deployment guide is specific to GoDaddy shared hosting. For VPS or dedicated servers, you can use the full Docker setup with PostgreSQL and Redis.
