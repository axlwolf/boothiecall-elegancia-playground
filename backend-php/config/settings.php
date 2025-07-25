<?php

declare(strict_types=1);

return [
    // Application settings
    'app' => [
        'name' => 'BoothieCall Elegancia API',
        'version' => '1.0.0',
        'env' => $_ENV['APP_ENV'] ?? 'development',
        'debug' => filter_var($_ENV['APP_DEBUG'] ?? true, FILTER_VALIDATE_BOOLEAN),
        'timezone' => $_ENV['APP_TIMEZONE'] ?? 'UTC',
    ],

    // Database settings
    'database' => [
        'driver' => 'mysql',
        'host' => $_ENV['DB_HOST'] ?? 'localhost',
        'port' => (int)($_ENV['DB_PORT'] ?? 3306),
        'database' => $_ENV['DB_NAME'] ?? 'boothiecall',
        'username' => $_ENV['DB_USER'] ?? 'root',
        'password' => $_ENV['DB_PASS'] ?? '',
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ],
    ],

    // JWT settings
    'jwt' => [
        'secret' => $_ENV['JWT_SECRET'] ?? 'your-secret-key',
        'refresh_secret' => $_ENV['JWT_REFRESH_SECRET'] ?? 'your-refresh-secret-key',
        'expires_in' => (int)($_ENV['JWT_EXPIRES_IN'] ?? 900), // 15 minutes
        'refresh_expires_in' => (int)($_ENV['JWT_REFRESH_EXPIRES_IN'] ?? 604800), // 7 days
        'algorithm' => 'HS256',
    ],

    // CORS settings
    'cors' => [
        'origin' => explode(',', $_ENV['CORS_ORIGIN'] ?? 'http://localhost:5173'),
        'methods' => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        'headers' => ['Content-Type', 'Authorization', 'X-Tenant-ID'],
        'credentials' => filter_var($_ENV['CORS_CREDENTIALS'] ?? true, FILTER_VALIDATE_BOOLEAN),
    ],

    // File upload settings
    'upload' => [
        'max_size' => (int)($_ENV['MAX_FILE_SIZE'] ?? 10485760), // 10MB
        'allowed_types' => explode(',', $_ENV['ALLOWED_MIME_TYPES'] ?? 'image/jpeg,image/png,image/gif,image/webp'),
        'upload_path' => $_ENV['UPLOAD_PATH'] ?? __DIR__ . '/../uploads',
        'temp_path' => $_ENV['TEMP_PATH'] ?? sys_get_temp_dir(),
    ],

    // Rate limiting settings
    'rate_limit' => [
        'enabled' => filter_var($_ENV['RATE_LIMIT_ENABLED'] ?? true, FILTER_VALIDATE_BOOLEAN),
        'requests' => (int)($_ENV['RATE_LIMIT_REQUESTS'] ?? 100),
        'window' => (int)($_ENV['RATE_LIMIT_WINDOW'] ?? 3600), // 1 hour
    ],

    // Logging settings
    'logger' => [
        'name' => 'boothiecall-api',
        'level' => $_ENV['LOG_LEVEL'] ?? 'info',
        'path' => $_ENV['LOG_PATH'] ?? __DIR__ . '/../logs/app.log',
        'max_files' => (int)($_ENV['LOG_MAX_FILES'] ?? 7),
    ],

    // Security settings
    'security' => [
        'bcrypt_cost' => (int)($_ENV['BCRYPT_COST'] ?? 12),
        'session_name' => $_ENV['SESSION_NAME'] ?? 'boothiecall_session',
        'session_lifetime' => (int)($_ENV['SESSION_LIFETIME'] ?? 3600),
    ],

    // Multi-tenant settings
    'tenant' => [
        'default_id' => $_ENV['DEFAULT_TENANT_ID'] ?? 'default',
        'header_name' => $_ENV['TENANT_HEADER'] ?? 'X-Tenant-ID',
        'enabled' => filter_var($_ENV['MULTI_TENANT_ENABLED'] ?? true, FILTER_VALIDATE_BOOLEAN),
    ],

    // Image processing settings
    'image' => [
        'driver' => $_ENV['IMAGE_DRIVER'] ?? 'gd', // gd or imagick
        'quality' => (int)($_ENV['IMAGE_QUALITY'] ?? 85),
        'max_width' => (int)($_ENV['IMAGE_MAX_WIDTH'] ?? 2048),
        'max_height' => (int)($_ENV['IMAGE_MAX_HEIGHT'] ?? 2048),
        'thumbnail_size' => (int)($_ENV['THUMBNAIL_SIZE'] ?? 300),
    ],

    // Cache settings (file-based for GoDaddy)
    'cache' => [
        'enabled' => filter_var($_ENV['CACHE_ENABLED'] ?? true, FILTER_VALIDATE_BOOLEAN),
        'driver' => $_ENV['CACHE_DRIVER'] ?? 'file',
        'path' => $_ENV['CACHE_PATH'] ?? __DIR__ . '/../cache',
        'ttl' => (int)($_ENV['CACHE_TTL'] ?? 3600), // 1 hour
    ],

    // API settings
    'api' => [
        'version' => $_ENV['API_VERSION'] ?? 'v1',
        'prefix' => $_ENV['API_PREFIX'] ?? '/api/v1',
        'pagination' => [
            'default_limit' => (int)($_ENV['API_DEFAULT_LIMIT'] ?? 20),
            'max_limit' => (int)($_ENV['API_MAX_LIMIT'] ?? 100),
        ],
    ],
];
