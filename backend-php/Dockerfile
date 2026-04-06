FROM php:8.1-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libjpeg62-turbo-dev libfreetype6-dev \
    libonig-dev libxml2-dev libzip-dev zip unzip \
    && rm -rf /var/lib/apt/lists/*

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql mysqli mbstring exif pcntl bcmath gd zip opcache

# Enable Apache mod_rewrite
RUN a2enmod rewrite headers

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for layer caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy application code
COPY . .

# Create required directories
RUN mkdir -p uploads logs cache temp \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 777 uploads logs cache temp

# Copy Apache configuration
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

# Copy PHP configuration
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

EXPOSE 80
CMD ["apache2-foreground"]
