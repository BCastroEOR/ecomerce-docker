-- =============================================================================
-- Script de inicialización de MySQL
-- Se ejecuta UNA sola vez, cuando el volumen de datos está vacío (primer arranque).
-- La base de datos y el usuario de la aplicación ya los crea la imagen oficial a
-- partir de MYSQL_DATABASE / MYSQL_USER / MYSQL_PASSWORD; aquí solo se ajustan
-- detalles. Las tablas las crean las migraciones de Laravel (php artisan migrate).
-- =============================================================================

-- Charset y collation alineados con config/database.php de Laravel (emojis y acentos).
SET @db := (SELECT DATABASE());
SET @sql := CONCAT('ALTER DATABASE `', IFNULL(@db, 'ecomerce'), '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
