# E-commerce API

API REST para administrar productos, registrar clientes, crear órdenes y procesar pagos con Stripe. El proyecto está construido con Laravel 13, PHP, MySQL y autenticación JWT.

## Requisitos

- PHP 8.3 o superior.
- Composer.
- Node.js y npm.
- Docker Compose o Podman Compose.
- Git.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/BrandonC2003/ecomerce-api.git
cd ecomerce-api
```

### 2. Instalar dependencias

```bash
composer install
npm install
```

### 3. Crear y configurar `.env`

```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Edita `.env` y configura como mínimo:

```dotenv
APP_NAME=Ecommerce API
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecomerce
DB_USERNAME=ecomerce
DB_PASSWORD=ecomerce_password

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

`DB_HOST=127.0.0.1` es correcto cuando Laravel se ejecuta directamente en el equipo anfitrión y MySQL se ejecuta dentro del contenedor.

## MySQL con Docker

El archivo `compose.yml` define un contenedor MySQL 8.4 y publica el puerto `3306`.

```bash
docker compose up -d mysql
docker compose ps
```

El usuario, la base de datos y las contraseñas del contenedor se toman de `DB_DATABASE`, `DB_USERNAME` y `DB_PASSWORD` del archivo `.env`. Define una contraseña antes de iniciar el contenedor.

## MySQL con Podman

Si utilizas Podman con soporte Compose:

```bash
podman compose up -d mysql
podman compose ps
```

En algunas instalaciones el comando disponible es `podman-compose`:

```bash
podman-compose up -d mysql
podman-compose ps
```

## Migraciones y datos demo

Ejecuta las migraciones y carga los datos de demostración:

```bash
php artisan migrate --seed
```

Para borrar y reconstruir completamente la base de datos local:

```bash
php artisan migrate:fresh --seed
```

El seeder crea:

- Administrador: `admin@example.com` / `password`
- Cliente: `test@example.com` / `password`
- Productos de ejemplo.
- Una orden pendiente con pago pendiente.
- Una orden pagada con pago exitoso ficticio.

Los pagos creados por el seeder utilizan identificadores ficticios y no representan transacciones reales de Stripe.

## Roles y permisos

Los usuarios registrados mediante `POST /api/register` siempre reciben el rol `customer`. El rol `admin` no puede asignarse desde el registro público.

### Cliente

- Registrarse.
- Iniciar y cerrar sesión.
- Consultar productos.
- Crear órdenes y consultar sus propias órdenes.
- Consultar los pagos de sus órdenes.
- Iniciar un pago para sus propias órdenes, si Stripe está configurado.

### Administrador

Además de los permisos del cliente, puede:

- Crear productos.
- Actualizar productos.
- Eliminar productos.

Las operaciones de administración de productos requieren un token JWT de un usuario con `role=admin` y responden `403` para clientes.

## Ejecutar la aplicación

Construye los assets y levanta el servidor de desarrollo:

```bash
npm run build
php artisan serve
```

La API estará disponible en `http://localhost:8000/api`.

Durante el desarrollo frontend puedes usar:

```bash
npm run dev
```

## Endpoints principales

### Autenticación

```text
POST /api/register
POST /api/login
POST /api/logout
```

### Productos

```text
GET    /api/products
GET    /api/products/{id}
POST   /api/products       # Solo admin
PUT    /api/products/{id}  # Solo admin
PATCH  /api/products/{id}  # Solo admin
DELETE /api/products/{id}  # Solo admin
```

### Órdenes y pagos

```text
GET  /api/orders
POST /api/orders
GET  /api/orders/{id}
GET  /api/orders/{id}/payments
POST /api/orders/{id}/payments
POST /api/payments/stripe/webhook
```

Para las rutas protegidas, envía el token obtenido en el login:

```text
Authorization: Bearer <JWT_TOKEN>
```

## Probar el proyecto

Con la configuración de pruebas incluida, los tests utilizan SQLite en memoria y no requieren MySQL ni credenciales reales de Stripe:

```bash
php artisan test
```

También puede utilizarse el script de Composer:

```bash
composer test
```

## Documentación Swagger

La documentación OpenAPI se genera con L5 Swagger. Si la configuración del proyecto incluye la ruta publicada, puedes regenerarla con:

```bash
php artisan l5-swagger:generate
```

## Detener o limpiar MySQL

Detener el contenedor sin borrar los datos:

```bash
docker compose stop mysql
```

Detener y eliminar los contenedores:

```bash
docker compose down
```

Eliminar también el volumen de MySQL y todos sus datos:

```bash
docker compose down -v
```

Con Podman, reemplaza `docker compose` por `podman compose` o `podman-compose`, según la instalación disponible.

## Variables opcionales de Stripe

Para probar pagos reales o webhooks, configura en `.env`:

```dotenv
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Los tests no realizan llamadas externas a Stripe.
