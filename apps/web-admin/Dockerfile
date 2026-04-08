FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache \
    nginx \
    supervisor \
    libpng-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    && docker-php-ext-install \
    pdo_pgsql \
    pgsql \
    mbstring \
    zip \
    intl \
    gd \
    bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies
FROM base AS deps
COPY apps/web-admin/composer.json apps/web-admin/composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Build assets
FROM node:20-alpine AS assets
WORKDIR /app
COPY apps/web-admin/package.json apps/web-admin/package-lock.json ./
RUN npm ci
COPY apps/web-admin/ ./
RUN npm run build 2>/dev/null || true

# Production
FROM base AS runner
COPY apps/web-admin/ /var/www/html/
COPY --from=deps /var/www/html/vendor /var/www/html/vendor
RUN composer dump-autoload --optimize

# Nginx config
COPY apps/web-admin/docker/nginx.conf /etc/nginx/http.d/default.conf
COPY apps/web-admin/docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8000
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
