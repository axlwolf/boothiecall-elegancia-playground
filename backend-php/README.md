# BoothieCall Elegancia - PHP Backend

A robust PHP REST API backend for the BoothieCall Elegancia photobooth application, built with Slim Framework 4 and designed for deployment on GoDaddy shared hosting.

## Features

- **Multi-tenant Architecture**: Support for multiple tenants with isolated data
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Photo Session Management**: Complete CRUD operations for photobooth sessions
- **Asset Management**: File upload, processing, and management with image optimization
- **Filter System**: Dynamic photo filters with CSS and custom effects
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Admin Panel**: Multi-level admin system with role-based permissions
- **Rate Limiting**: Built-in API rate limiting for security
- **Image Processing**: Automatic image resizing, thumbnails, and metadata extraction
- **CORS Support**: Configurable cross-origin resource sharing
- **Logging**: Comprehensive logging with Monolog
- **Error Handling**: Robust error handling and validation

## Tech Stack

- **Framework**: Slim Framework 4
- **Database**: MySQL/MariaDB
- **Authentication**: JWT with Firebase JWT PHP
- **Image Processing**: Intervention Image with GD Library
- **Logging**: Monolog
- **Validation**: Respect Validation
- **Dependency Injection**: PHP-DI
- **Environment**: PHP 8.1+

## Project Structure

```
backend-php/
├── public/                 # Web server document root
│   └── index.php          # Application entry point
├── src/                   # Application source code
│   ├── Application/       # Application factory and configuration
│   ├── Controllers/       # API controllers
│   ├── Middleware/        # Custom middleware
│   └── Routes/           # Route definitions
├── config/               # Configuration files
├── database/             # Database schema and migrations
├── docs/                 # Documentation
├── logs/                 # Application logs (auto-created)
├── uploads/              # File uploads (auto-created)
├── vendor/               # Composer dependencies
├── .env.example          # Environment variables template
└── composer.json         # PHP dependencies
```

## Quick Start

### 1. Clone and Install

```bash
cd backend-php
composer install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your database credentials and settings
```

### 3. Database Setup

Create a MySQL database and import the schema:

```bash
mysql -u username -p database_name < database/schema.sql
```

### 4. Development Server

```bash
# Using PHP built-in server
php -S localhost:8080 -t public

# Or using Apache/Nginx pointing to public/ directory
```

### 5. Test the API

```bash
curl http://localhost:8080/health
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - User logout

### Assets
- `GET /api/v1/assets` - List assets
- `POST /api/v1/assets` - Upload asset
- `GET /api/v1/assets/{id}` - Get asset details
- `PUT /api/v1/assets/{id}` - Update asset
- `DELETE /api/v1/assets/{id}` - Delete asset

### Sessions
- `GET /api/v1/sessions` - List photo sessions
- `POST /api/v1/sessions` - Create session
- `GET /api/v1/sessions/{id}` - Get session details
- `PUT /api/v1/sessions/{id}` - Update session
- `DELETE /api/v1/sessions/{id}` - Delete session
- `POST /api/v1/sessions/{id}/photos` - Upload photo to session
- `POST /api/v1/sessions/{id}/filters` - Apply filter to session
- `POST /api/v1/sessions/{id}/generate` - Generate session output

### Filters
- `GET /api/v1/filters` - List filters
- `POST /api/v1/filters` - Create filter
- `GET /api/v1/filters/categories` - Get filter categories
- `GET /api/v1/filters/{id}` - Get filter details
- `PUT /api/v1/filters/{id}` - Update filter
- `DELETE /api/v1/filters/{id}` - Delete filter

### Analytics
- `GET /api/v1/analytics/dashboard` - Analytics dashboard
- `GET /api/v1/analytics/sessions` - Session analytics
- `GET /api/v1/analytics/assets` - Asset analytics
- `GET /api/v1/analytics/filters` - Filter usage analytics

### Admin
- `GET /api/v1/admin/tenants` - List tenants (Super Admin)
- `POST /api/v1/admin/tenants` - Create tenant (Super Admin)
- `PUT /api/v1/admin/tenants/{id}` - Update tenant (Super Admin)
- `GET /api/v1/admin/users` - List users
- `PUT /api/v1/admin/users/{id}` - Update user
- `GET /api/v1/admin/stats` - System statistics
- `POST /api/v1/admin/cleanup` - System cleanup

## Configuration

### Environment Variables

Key environment variables in `.env`:

```env
# Application
APP_NAME="BoothieCall Elegancia"
APP_ENV=development
APP_DEBUG=true

# Database
DB_HOST=localhost
DB_DATABASE=boothiecall
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=3600

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Multi-tenant Configuration

The application supports multi-tenancy through:
- Tenant header: `X-Tenant-ID`
- Database-level tenant isolation
- Tenant-specific settings and configurations

## Authentication & Authorization

### JWT Tokens

The API uses JWT tokens for authentication:
- Access tokens expire in 1 hour (configurable)
- Refresh tokens expire in 7 days (configurable)
- Tokens include user ID, tenant ID, and role information

### User Roles

- `USER`: Basic user access
- `EDITOR`: Can create and edit content
- `TENANT_ADMIN`: Full access within tenant
- `SUPER_ADMIN`: System-wide access

## Image Processing

The application includes comprehensive image processing:
- Automatic resizing and optimization
- Thumbnail generation
- Metadata extraction (EXIF data)
- Format conversion
- Quality optimization

## Rate Limiting

Built-in rate limiting protects the API:
- Configurable requests per time window
- IP-based limiting
- Bypass for authenticated admin users

## Error Handling

Comprehensive error handling includes:
- Structured JSON error responses
- Detailed logging
- Validation error messages
- HTTP status codes

## Security Features

- JWT token authentication
- CORS protection
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection headers
- Environment-based configuration

## Development

### Code Style

The project follows PSR-12 coding standards:

```bash
# Check code style
composer run-script cs-check

# Fix code style
composer run-script cs-fix
```

### Testing

```bash
# Run tests
composer run-script test

# Run tests with coverage
composer run-script test-coverage
```

### Debugging

Enable debug mode in `.env`:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

Check logs in `logs/app.log` for detailed information.

## Deployment

### GoDaddy Shared Hosting

See [GoDaddy Deployment Guide](docs/GODADDY_DEPLOYMENT.md) for detailed deployment instructions.

### General Deployment Steps

1. **Prepare Environment**:
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Configure production database
   - Set strong JWT secret

2. **Upload Files**:
   - Upload all files except `.env`
   - Create production `.env` file
   - Set proper file permissions

3. **Database Setup**:
   - Create production database
   - Import schema
   - Configure database user

4. **Web Server Configuration**:
   - Point document root to `public/`
   - Configure URL rewriting
   - Set up SSL/HTTPS

## Performance Optimization

### Caching

- File-based caching for configuration
- Database query optimization
- Image caching and optimization

### Database

- Proper indexing on frequently queried columns
- Connection pooling
- Query optimization

### File Handling

- Efficient file upload handling
- Image optimization
- CDN integration ready

## Monitoring & Maintenance

### Logging

Logs are written to `logs/app.log` with configurable levels:
- `debug`: Development debugging
- `info`: General information
- `warning`: Warning conditions
- `error`: Error conditions
- `critical`: Critical conditions

### Health Checks

Use the `/health` endpoint for monitoring:

```bash
curl https://yourdomain.com/api/health
```

### Database Maintenance

Regular maintenance tasks:
- Clean up old sessions
- Remove orphaned files
- Optimize database tables
- Monitor disk usage

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check database credentials in `.env`
   - Verify database server is running
   - Check network connectivity

2. **File Upload Issues**:
   - Check `uploads/` directory permissions (777)
   - Verify PHP upload limits
   - Check disk space

3. **JWT Token Issues**:
   - Verify JWT secret is set
   - Check token expiration
   - Validate token format

4. **CORS Issues**:
   - Update `CORS_ALLOWED_ORIGINS` in `.env`
   - Check preflight request handling
   - Verify headers configuration

### Debug Mode

Enable debug mode for detailed error messages:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow PSR-12 coding standards
4. Add tests for new features
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For technical support:
1. Check the troubleshooting section
2. Review application logs
3. Consult the deployment documentation
4. Contact the development team

---

**Note**: This backend is specifically optimized for GoDaddy shared hosting but can be deployed on any PHP-compatible hosting environment.
