# GoDaddy Deployment Guide - PHP Backend

This guide will help you deploy the BoothieCall Elegancia PHP backend to your GoDaddy shared hosting account.

## Prerequisites

- GoDaddy shared hosting account with PHP 8.1+ support
- cPanel access
- MySQL database access
- Domain or subdomain configured

## Step 1: Prepare Your Files

### 1.1 Create Production Environment File

Create a `.env` file with your production settings:

```env
# Application Settings
APP_NAME="BoothieCall Elegancia"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database Configuration (from GoDaddy cPanel)
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# JWT Configuration (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Tenant-ID

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp
UPLOAD_PATH=uploads

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600

# Logging
LOG_LEVEL=error
LOG_PATH=logs/app.log

# Security
BCRYPT_ROUNDS=12
SESSION_LIFETIME=7200

# Multi-tenant Configuration
TENANT_HEADER_NAME=X-Tenant-ID
TENANT_DEFAULT_ID=default

# Image Processing
IMAGE_QUALITY=85
IMAGE_MAX_WIDTH=2048
IMAGE_MAX_HEIGHT=2048

# Cache Configuration
CACHE_DRIVER=file
CACHE_TTL=3600

# API Configuration
API_PREFIX=/api/v1
API_RATE_LIMIT=1000
```

### 1.2 Create .htaccess File

Create a `.htaccess` file in your `public` directory:

```apache
RewriteEngine On

# Handle Angular and React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /index.html [QSA,L]

# API Routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ /api/index.php [QSA,L]

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Prevent access to sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "composer.json">
    Order allow,deny
    Deny from all
</Files>

<Files "composer.lock">
    Order allow,deny
    Deny from all
</Files>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## Step 2: Database Setup

### 2.1 Create MySQL Database

1. Log into your GoDaddy cPanel
2. Go to **MySQL Databases**
3. Create a new database (e.g., `youruser_boothiecall`)
4. Create a database user with a strong password
5. Assign the user to the database with **ALL PRIVILEGES**
6. Note down the database name, username, and password

### 2.2 Import Database Schema

1. Go to **phpMyAdmin** in cPanel
2. Select your database
3. Go to the **Import** tab
4. Upload the `database/schema.sql` file
5. Click **Go** to execute

## Step 3: File Upload

### 3.1 Prepare Files for Upload

Create a deployment package with these files:

```
backend-php/
├── public/
│   ├── index.php
│   └── .htaccess
├── src/
├── config/
├── vendor/
├── .env (production version)
└── composer.json
```

### 3.2 Upload via cPanel File Manager

1. Log into cPanel
2. Open **File Manager**
3. Navigate to `public_html` (or your domain's document root)
4. Create an `api` folder
5. Upload all files to the `api` folder
6. Extract if you uploaded a zip file

### 3.3 Alternative: FTP Upload

Use an FTP client like FileZilla:

```
Host: ftp.yourdomain.com
Username: your_cpanel_username
Password: your_cpanel_password
Port: 21
```

Upload all files to `public_html/api/`

## Step 4: Set Permissions

### 4.1 Directory Permissions

Set the following permissions using cPanel File Manager:

```
api/ - 755
api/public/ - 755
api/src/ - 755
api/config/ - 755
api/vendor/ - 755
api/logs/ - 777 (create this directory)
api/uploads/ - 777 (create this directory)
```

### 4.2 File Permissions

```
.env - 644
.htaccess - 644
index.php - 644
composer.json - 644
All PHP files - 644
```

## Step 5: Test Your API

### 5.1 Health Check

Visit: `https://yourdomain.com/api/health`

You should see:
```json
{
    "status": "ok",
    "timestamp": "2024-01-01T12:00:00+00:00",
    "version": "1.0.0"
}
```

### 5.2 Test Authentication

```bash
curl -X POST https://yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Step 6: Frontend Configuration

Update your frontend to use the new API URL:

```javascript
// In your React app
const API_BASE_URL = 'https://yourdomain.com/api/v1';
```

## Troubleshooting

### Common Issues

#### 1. 500 Internal Server Error

- Check error logs in cPanel
- Verify `.env` file exists and has correct database credentials
- Ensure all directories have correct permissions
- Check PHP version (must be 8.1+)

#### 2. Database Connection Failed

- Verify database credentials in `.env`
- Ensure database user has proper privileges
- Check if database exists

#### 3. File Upload Issues

- Check `uploads/` directory exists and has 777 permissions
- Verify `UPLOAD_PATH` in `.env` is correct
- Check PHP upload limits in cPanel

#### 4. CORS Issues

- Update `CORS_ALLOWED_ORIGINS` in `.env`
- Ensure your frontend domain is included
- Check `.htaccess` headers configuration

### Debugging Steps

1. **Enable Debug Mode** (temporarily):
   ```env
   APP_DEBUG=true
   LOG_LEVEL=debug
   ```

2. **Check Error Logs**:
   - cPanel → Error Logs
   - `api/logs/app.log`

3. **Test Database Connection**:
   Create a test file `test-db.php`:
   ```php
   <?php
   require 'vendor/autoload.php';
   
   $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
   $dotenv->load();
   
   try {
       $pdo = new PDO(
           "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_DATABASE']}",
           $_ENV['DB_USERNAME'],
           $_ENV['DB_PASSWORD']
       );
       echo "Database connection successful!";
   } catch (Exception $e) {
       echo "Database connection failed: " . $e->getMessage();
   }
   ?>
   ```

## Security Considerations

### 1. Environment Variables

- Never commit `.env` to version control
- Use strong, unique passwords
- Change JWT secret regularly

### 2. File Permissions

- Keep sensitive files outside public directory
- Use minimal required permissions
- Regularly update dependencies

### 3. Database Security

- Use strong database passwords
- Limit database user privileges
- Regular backups

### 4. SSL/HTTPS

- Always use HTTPS in production
- Configure SSL certificate in cPanel
- Update CORS origins to use HTTPS

## Maintenance

### 1. Updates

- Keep PHP dependencies updated: `composer update`
- Monitor security advisories
- Regular database backups

### 2. Monitoring

- Check error logs regularly
- Monitor disk space usage
- Track API performance

### 3. Backups

- Database: Use cPanel backup tools
- Files: Regular FTP backups
- Configuration: Keep `.env` backup secure

## Support

If you encounter issues:

1. Check GoDaddy's PHP documentation
2. Verify hosting plan supports required PHP version
3. Contact GoDaddy support for server-specific issues
4. Check application logs for detailed error messages

---

**Note**: This deployment method is optimized for GoDaddy shared hosting limitations. For better performance and features, consider upgrading to VPS or dedicated hosting.
