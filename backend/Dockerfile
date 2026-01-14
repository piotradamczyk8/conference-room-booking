# ============================================
# Conference Room Booking System
# Backend Dockerfile (PHP 8.3 + Symfony 7.0)
# ============================================

# ====================
# Stage 1: Composer dependencies
# ====================
FROM composer:2.7 AS composer

# ====================
# Stage 2: Build
# ====================
FROM php:8.3-fpm-alpine AS builder

# Kopiowanie composera
COPY --from=composer /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Instalacja zależności systemowych i rozszerzeń PHP
RUN apk add --no-cache \
    # Wymagane dla pdo_pgsql
    postgresql-dev \
    # Wymagane dla intl
    icu-dev \
    # Wymagane dla amqp (RabbitMQ)
    rabbitmq-c-dev \
    # Narzędzia budowania
    $PHPIZE_DEPS \
    # Git dla composera
    git \
    && docker-php-ext-install \
    pdo_pgsql \
    intl \
    opcache \
    # Instalacja rozszerzenia amqp
    && pecl install amqp \
    && docker-php-ext-enable amqp \
    # Czyszczenie
    && apk del $PHPIZE_DEPS \
    && rm -rf /var/cache/apk/*

# Kopiowanie plików composera
COPY composer.json composer.lock* ./

# Instalacja zależności PHP (bez dev dla produkcji)
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-progress \
    --no-interaction

# Kopiowanie źródeł aplikacji
COPY . .

# Generowanie autoloadera z optymalizacją
RUN composer dump-autoload --optimize --classmap-authoritative

# ====================
# Stage 3: Production
# ====================
FROM php:8.3-fpm-alpine AS production

# Metadane obrazu
LABEL maintainer="Piotr Adamczyk"
LABEL description="Conference Room Booking System - Backend"

# Instalacja rozszerzeń PHP (runtime)
RUN apk add --no-cache \
    postgresql-dev \
    icu-dev \
    rabbitmq-c-dev \
    $PHPIZE_DEPS \
    && docker-php-ext-install \
    pdo_pgsql \
    intl \
    opcache \
    && pecl install amqp \
    && docker-php-ext-enable amqp \
    && apk del $PHPIZE_DEPS \
    && rm -rf /var/cache/apk/*

# Konfiguracja PHP dla produkcji
COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini

# Katalog roboczy
WORKDIR /var/www/html

# Kopiowanie aplikacji z buildera
COPY --from=builder /app /var/www/html

# Tworzenie katalogu var i ustawienie uprawnień
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var

# Użytkownik bez uprawnień root
USER www-data

# Ekspozycja portu PHP-FPM
EXPOSE 9000

# Domyślna komenda
CMD ["php-fpm"]

# ====================
# Stage 4: Development
# ====================
FROM production AS development

# Przełączenie na root dla instalacji
USER root

# Instalacja narzędzi deweloperskich
RUN apk add --no-cache \
    git \
    bash \
    vim

# Instalacja Xdebug dla debugowania
RUN apk add --no-cache $PHPIZE_DEPS \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && apk del $PHPIZE_DEPS

# Konfiguracja Xdebug
RUN echo "xdebug.mode=develop,debug,coverage" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini \
    && echo "xdebug.start_with_request=yes" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

# Powrót do www-data
USER www-data

CMD ["php-fpm"]
