# ---------- Stage 0: freshmart.zip ko kholo ----------
FROM alpine:3.20 AS src
RUN apk add --no-cache unzip
COPY freshmart.zip /tmp/freshmart.zip
COPY admin-update.zip /tmp/admin-update.zip
RUN unzip -q /tmp/freshmart.zip -d /tmp && mv /tmp/freshmart /src \
    && unzip -q -o /tmp/admin-update.zip -d /src

# ---------- Stage 1: React + Tailwind build ----------
FROM node:22-alpine AS assets
WORKDIR /app
COPY --from=src /src/package.json /src/package-lock.json ./
RUN npm ci
COPY --from=src /src/vite.config.js ./
COPY --from=src /src/resources resources
COPY --from=src /src/public public
RUN npm run build

# ---------- Stage 2: Laravel (PHP) ----------
FROM php:8.3-cli
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libzip-dev unzip git \
    && docker-php-ext-install pdo_pgsql zip opcache \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY --from=src /src/composer.json ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction
COPY --from=src /src/ ./
COPY --from=assets /app/public/build public/build
RUN composer dump-autoload --optimize --no-dev --no-scripts \
    && chmod +x docker/start.sh \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

ENV PHP_CLI_SERVER_WORKERS=4
EXPOSE 10000
CMD ["./docker/start.sh"]
