# 🐳 Docker Development Environment

Guía completa para ejecutar BoothieCall Elegancia con Docker.

## Prerrequisitos

- [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/) instalado
- Docker Compose (incluido en Docker Desktop)

## Quick Start

```bash
# Setup completo en un comando
./scripts/docker-setup.sh
```

## URLs de Acceso

| Servicio     | URL                          | Descripción        |
| ------------ | ---------------------------- | ------------------ |
| Frontend     | http://localhost:3000        | React PWA          |
| Backend API  | http://localhost:8080        | PHP Slim Framework |
| phpMyAdmin   | http://localhost:8081        | Administración DB  |
| Health Check | http://localhost:8080/health | Estado del backend |

## Comandos Principales

### Iniciar/Detener

```bash
docker compose up -d          # Iniciar todos los servicios
docker compose down            # Detener todos los servicios
docker compose restart backend # Reiniciar solo el backend
```

### Logs

```bash
docker compose logs -f           # Todos los logs
docker compose logs -f backend   # Solo backend
docker compose logs -f mysql     # Solo MySQL
```

### Acceder a Containers

```bash
docker compose exec backend bash          # Shell en backend
docker compose exec mysql mysql -u boothiecall -ppassword boothiecall  # MySQL CLI
docker compose exec redis redis-cli       # Redis CLI
```

### Composer (Backend PHP)

```bash
docker compose exec backend composer install
docker compose exec backend composer require package/name
```

### Estado y Monitoreo

```bash
./scripts/docker-status.sh    # Estado de todos los servicios
docker compose ps              # Containers activos
docker stats                   # Uso de recursos en tiempo real
```

### Reset Completo

```bash
./scripts/docker-reset.sh         # Reset suave (mantiene datos)
./scripts/docker-reset.sh --full  # Reset completo (borra todo)
```

## Estructura de Archivos Docker

```
/
├── docker-compose.yml              # Orquestación de servicios
├── Dockerfile.frontend             # Build frontend React
├── .env.docker                     # Variables de entorno Docker
├── .dockerignore                   # Exclusiones frontend
├── docker/
│   └── nginx/
│       └── frontend.conf           # Nginx config para React
├── backend-php/
│   ├── Dockerfile                  # Build backend PHP
│   ├── .dockerignore               # Exclusiones backend
│   └── docker/
│       ├── apache/
│       │   └── 000-default.conf    # Apache virtual host
│       └── php/
│           └── php.ini             # Configuración PHP
└── scripts/
    ├── docker-setup.sh             # Setup inicial
    ├── docker-reset.sh             # Reset/cleanup
    └── docker-status.sh            # Monitoreo de estado
```

## Servicios

### Frontend (React + Vite)

- **Imagen:** node:18-alpine
- **Puerto:** 3000 → 5173 (Vite dev server)
- **Hot Reload:** Cambios en `src/` se reflejan automáticamente

### Backend (PHP 8.1 + Apache)

- **Imagen:** php:8.1-apache
- **Puerto:** 8080 → 80
- **Hot Reload:** Cambios en `backend-php/src/` se reflejan automáticamente
- **Extensiones:** PDO MySQL, GD, ZIP, mbstring, opcache

### MySQL 8.0

- **Puerto:** 3306
- **Base de datos:** boothiecall
- **Usuario:** boothiecall / password
- **Schema:** Se importa automáticamente en primer inicio

### Redis 7

- **Puerto:** 6379 (solo interno)
- **Persistencia:** AOF habilitado

### phpMyAdmin

- **Puerto:** 8081
- **Acceso:** Conectado automáticamente a MySQL

## Credenciales por Defecto

| Servicio   | Usuario               | Contraseña   |
| ---------- | --------------------- | ------------ |
| MySQL Root | root                  | rootpassword |
| MySQL App  | boothiecall           | password     |
| Admin API  | admin@boothiecall.net | admin123     |

## Troubleshooting

### MySQL no inicia

```bash
# Ver logs de MySQL
docker compose logs mysql

# Reiniciar con volumen limpio
docker compose down -v
docker compose up -d
```

### Backend devuelve errores de DB

```bash
# Verificar conexión
docker compose exec backend php -r "
try {
    new PDO('mysql:host=mysql;dbname=boothiecall', 'boothiecall', 'password');
    echo 'OK';
} catch (Exception \$e) {
    echo \$e->getMessage();
}
"
```

### Frontend no carga

```bash
# Verificar que el container está corriendo
docker compose ps frontend

# Rebuild del frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Puertos ocupados

```bash
# Verificar qué usa el puerto
lsof -i :8080
lsof -i :3000

# Cambiar puertos en docker-compose.yml
```

### Permisos de archivos

```bash
# Fix permisos en backend
docker compose exec backend chown -R www-data:www-data /var/www/html/uploads
docker compose exec backend chmod -R 777 /var/www/html/logs
```
