# syntax=docker/dockerfile:1.7
# =============================================================================
# API Laravel 13 — build multi-stage con dos imágenes finales (targets):
#   base   -> PHP-FPM 8.4 Alpine + extensiones requeridas (compartida)
#   vendor -> instala dependencias de Composer (solo producción)
#   php    -> TARGET: runtime PHP-FPM con el código + vendor/ (sin Composer)
#   nginx  -> TARGET: proxy inverso Nginx que reenvía a PHP-FPM por FastCGI
# =============================================================================

ARG PHP_VERSION=8.4
ARG NGINX_VERSION=1.27-alpine

# -----------------------------------------------------------------------------
# Etapa base: PHP-FPM + extensiones
# -----------------------------------------------------------------------------
FROM php:${PHP_VERSION}-fpm-alpine AS base

# mbstring, openssl, tokenizer, xml, ctype y json ya vienen compiladas en la imagen oficial.
# Solo se compilan pdo_mysql y opcache; las herramientas de compilación ($PHPIZE_DEPS) se
# instalan como paquete virtual y se eliminan en la MISMA capa para no inflar la imagen.
RUN set -eux; \
    apk add --no-cache --virtual .build-deps $PHPIZE_DEPS; \
    docker-php-ext-install -j"$(nproc)" pdo_mysql opcache; \
    apk del .build-deps; \
    rm -rf /tmp/* /var/cache/apk/*

# Configuración de producción de PHP + OPcache.
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php/php.ini $PHP_INI_DIR/conf.d/zz-app.ini

WORKDIR /var/www/html

# -----------------------------------------------------------------------------
# Etapa vendor: dependencias de Composer
# -----------------------------------------------------------------------------
FROM base AS vendor

# Composer se copia desde su imagen oficial: existe solo en esta etapa, nunca en la final.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN apk add --no-cache unzip

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1

# 1) Solo los manifiestos -> esta capa (la más lenta) se reutiliza mientras composer.lock no cambie.
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/root/.composer/cache \
    composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-progress

# 2) El código fuente -> autoloader optimizado (classmap autoritativo, sin paquetes dev).
COPY . .
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative --no-scripts

# -----------------------------------------------------------------------------
# TARGET php: runtime PHP-FPM
# -----------------------------------------------------------------------------
FROM base AS php

# Código de la aplicación (el .dockerignore excluye vendor, .env, tests, node_modules, etc.)
COPY --chown=www-data:www-data . .
# Desde la etapa de build se copia ÚNICAMENTE la carpeta vendor/.
COPY --from=vendor --chown=www-data:www-data /var/www/html/vendor ./vendor
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/entrypoint.sh

# Registra los service providers de los paquetes instalados (bootstrap/cache/packages.php).
RUN set -eux; \
    mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views \
             storage/logs bootstrap/cache; \
    php artisan package:discover --ansi; \
    chown -R www-data:www-data storage bootstrap/cache

# Sin privilegios de root en tiempo de ejecución.
USER www-data

EXPOSE 9000

# PHP-FPM escucha en TCP 9000; busybox `nc` verifica que el puerto responda.
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
  CMD nc -z 127.0.0.1 9000 || exit 1

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]

# -----------------------------------------------------------------------------
# TARGET nginx: proxy inverso
# -----------------------------------------------------------------------------
FROM nginx:${NGINX_VERSION} AS nginx

# Nginx solo necesita los archivos públicos (favicon, robots.txt); todo lo demás va a PHP-FPM.
COPY public /var/www/html/public
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1/up >/dev/null || exit 1
