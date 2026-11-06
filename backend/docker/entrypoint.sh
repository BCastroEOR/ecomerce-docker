#!/bin/sh
# Prepara Laravel antes de iniciar PHP-FPM. Se ejecuta en cada arranque del contenedor.
set -e

: "${APP_KEY:?Falta APP_KEY. Genérala con: docker compose run --rm --no-deps --entrypoint php php artisan key:generate --show}"
: "${JWT_SECRET:?Falta JWT_SECRET. Genérala con: openssl rand -base64 48}"

# Cachés de producción: se generan en runtime porque dependen de las variables de entorno.
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migraciones (la BD ya está "healthy" gracias a depends_on en docker-compose).
php artisan migrate --force

exec "$@"
