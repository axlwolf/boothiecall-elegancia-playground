# 🐳 Docker Roadmap - BoothieCall Elegancia

## 📋 Objetivo

Dockerizar completamente el proyecto BoothieCall Elegancia para crear un entorno de desarrollo unificado que incluya:

- Frontend React PWA
- Backend PHP API
- Base de datos MySQL
- Servicios auxiliares (Redis, phpMyAdmin)

## 🎯 Milestone: Dockerización Completa

**Estimación:** 2-3 días de desarrollo  
**Prioridad:** Alta  
**Estado:** 📋 Planificado

### **Fase 1: Dockerización del Backend PHP (Día 1)**

#### ✅ Tareas Principales

1. **Crear Dockerfile para PHP**

   - Base image: `php:8.1-apache` o `php:8.1-fpm-alpine`
   - Instalar extensiones PHP necesarias (PDO, MySQL, GD, etc.)
   - Configurar Apache/Nginx para Slim Framework
   - Copiar código fuente y configurar permisos

2. **Configurar Docker Compose**

   - Servicio PHP backend
   - Servicio MySQL database
   - Servicio Redis (cache)
   - Servicio phpMyAdmin (administración DB)
   - Networking entre servicios

3. **Variables de Entorno Docker**

   - Archivo `.env.docker` específico para containers
   - Configuración de conexiones entre servicios
   - Secrets y configuración de seguridad

4. **Volúmenes y Persistencia**
   - Volumen para uploads de archivos
   - Volumen para logs de aplicación
   - Volumen para datos de MySQL
   - Bind mounts para desarrollo

#### 📁 Archivos a Crear

```
backend-php/
├── Dockerfile                    # Imagen PHP con Apache
├── docker-compose.yml           # Orquestación completa
├── .env.docker                  # Variables para Docker
├── docker/
│   ├── php/
│   │   ├── php.ini             # Configuración PHP
│   │   └── apache.conf         # Configuración Apache
│   ├── mysql/
│   │   └── init.sql            # Script inicialización DB
│   └── nginx/                  # Alternativa a Apache
│       └── default.conf
└── scripts/
    ├── docker-setup.sh         # Script de configuración inicial
    └── docker-reset.sh         # Script para reset completo
```

### **Fase 2: Integración Frontend (Día 2)**

#### ✅ Tareas Principales

1. **Dockerfile para Frontend**

   - Multi-stage build (build + serve)
   - Nginx para servir archivos estáticos
   - Configuración de proxy para API calls

2. **Actualizar Docker Compose**

   - Servicio frontend React
   - Proxy reverso Nginx
   - Configuración de CORS y routing

3. **Configuración de Red**
   - Red interna para servicios
   - Exposición de puertos necesarios
   - Load balancing si es necesario

#### 📁 Archivos a Crear

```
/
├── Dockerfile.frontend          # Imagen React + Nginx
├── docker-compose.full.yml      # Stack completo
├── docker/
│   └── nginx/
│       ├── nginx.conf          # Configuración principal
│       └── frontend.conf       # Configuración frontend
└── scripts/
    ├── build-all.sh            # Build completo
    └── dev-setup.sh            # Setup desarrollo
```

### **Fase 3: Optimización y Documentación (Día 3)**

#### ✅ Tareas Principales

1. **Optimización de Imágenes**

   - Multi-stage builds para reducir tamaño
   - Cache layers para builds más rápidos
   - Imágenes Alpine para menor footprint

2. **Scripts de Automatización**

   - Setup inicial automatizado
   - Scripts de backup y restore
   - Health checks y monitoring

3. **Documentación Completa**

   - Guía de instalación Docker
   - Troubleshooting común
   - Comandos útiles de desarrollo

4. **Testing y Validación**
   - Verificar todos los servicios
   - Testing de conectividad
   - Performance benchmarks

## 🏗️ Arquitectura Docker Propuesta

### **Servicios del Stack**

```yaml
services:
  # Frontend React PWA
  frontend:
    build: ./Dockerfile.frontend
    ports: ["3000:80"]
    depends_on: [backend]

  # Backend PHP API
  backend:
    build: ./backend-php/Dockerfile
    ports: ["8080:80"]
    depends_on: [mysql, redis]
    volumes:
      - ./backend-php:/var/www/html
      - uploads:/var/www/html/uploads

  # Base de datos MySQL
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: boothiecall
      MYSQL_USER: boothiecall
      MYSQL_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql

  # Cache Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  # Administración DB
  phpmyadmin:
    image: phpmyadmin:latest
    ports: ["8081:80"]
    depends_on: [mysql]
```

### **Red y Comunicación**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │───▶│   Backend   │───▶│   MySQL     │
│  (React)    │    │   (PHP)     │    │ (Database)  │
│  Port: 3000 │    │  Port: 8080 │    │ Port: 3306  │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │    Redis    │
                   │   (Cache)   │
                   │ Port: 6379  │
                   └─────────────┘
```

## 🚀 Comandos de Desarrollo

### **Setup Inicial**

```bash
# Clonar y configurar
git clone <repo>
cd boothiecall-elegancia-playground

# Setup completo con Docker
./scripts/docker-setup.sh

# O manualmente
docker-compose up -d
```

### **Desarrollo Diario**

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar solo el backend
docker-compose restart backend

# Acceder al container PHP
docker-compose exec backend bash

# Ejecutar comandos Composer
docker-compose exec backend composer install
```

### **URLs de Desarrollo**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **phpMyAdmin:** http://localhost:8081
- **Health Check:** http://localhost:8080/health

## 📊 Beneficios de la Dockerización

### **Para Desarrolladores**

- ✅ **Setup en 1 comando** - No más instalación manual de dependencias
- ✅ **Entorno consistente** - Mismo ambiente en todos los equipos
- ✅ **Aislamiento** - No conflictos con otras instalaciones locales
- ✅ **Fácil reset** - Volver a estado limpio rápidamente

### **Para el Proyecto**

- ✅ **Onboarding rápido** - Nuevos desarrolladores productivos en minutos
- ✅ **CI/CD ready** - Fácil integración con pipelines
- ✅ **Deployment consistente** - Mismo container en dev/staging/prod
- ✅ **Escalabilidad** - Fácil agregar servicios adicionales

### **Para Producción**

- ✅ **Portabilidad** - Funciona en cualquier servidor con Docker
- ✅ **Rollback rápido** - Volver a versión anterior instantáneamente
- ✅ **Monitoring** - Health checks y logs centralizados
- ✅ **Backup/Restore** - Volúmenes persistentes fáciles de respaldar

## 🔧 Configuraciones Específicas

### **PHP Extensions Requeridas**

```dockerfile
RUN docker-php-ext-install \
    pdo_mysql \
    mysqli \
    gd \
    zip \
    opcache \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd
```

### **Apache Configuration**

```apache
<VirtualHost *:80>
    DocumentRoot /var/www/html/public
    <Directory /var/www/html/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### **Environment Variables**

```env
# Docker-specific environment
DB_HOST=mysql
DB_PORT=3306
DB_NAME=boothiecall
DB_USER=boothiecall
DB_PASS=password

REDIS_HOST=redis
REDIS_PORT=6379

# Frontend API URL
VITE_API_URL=http://localhost:8080/api/v1
```

## 📝 Checklist de Implementación

### **Fase 1: Backend PHP**

- [ ] Crear Dockerfile para PHP 8.1 + Apache
- [ ] Configurar docker-compose.yml básico
- [ ] Configurar MySQL service
- [ ] Configurar Redis service
- [ ] Configurar phpMyAdmin
- [ ] Crear .env.docker
- [ ] Configurar volúmenes para uploads y logs
- [ ] Testing de conectividad entre servicios

### **Fase 2: Frontend Integration**

- [ ] Crear Dockerfile.frontend
- [ ] Configurar Nginx para servir React build
- [ ] Actualizar docker-compose para incluir frontend
- [ ] Configurar proxy reverso para API calls
- [ ] Configurar CORS correctamente
- [ ] Testing de comunicación frontend-backend

### **Fase 3: Optimización**

- [ ] Optimizar Dockerfiles (multi-stage builds)
- [ ] Crear scripts de automatización
- [ ] Configurar health checks
- [ ] Documentar comandos útiles
- [ ] Testing completo del stack
- [ ] Performance optimization

## 🎯 Criterios de Éxito

### **Funcionalidad**

- ✅ Todo el stack corre con `docker-compose up`
- ✅ Frontend se comunica correctamente con backend
- ✅ Backend se conecta a MySQL y Redis
- ✅ Uploads de archivos funcionan correctamente
- ✅ Logs son accesibles y útiles

### **Desarrollo**

- ✅ Hot reload funciona para desarrollo
- ✅ Cambios en código se reflejan sin rebuild
- ✅ Debugging es posible
- ✅ Performance es aceptable para desarrollo

### **Documentación**

- ✅ README actualizado con instrucciones Docker
- ✅ Troubleshooting guide completo
- ✅ Scripts de automatización documentados
- ✅ Arquitectura claramente explicada

## 🔄 Próximos Pasos

1. **Implementar Fase 1** - Dockerización backend PHP
2. **Testing y validación** - Verificar funcionalidad completa
3. **Implementar Fase 2** - Integración frontend
4. **Optimización** - Performance y tamaño de imágenes
5. **Documentación** - Actualizar todas las guías
6. **CI/CD Integration** - Preparar para pipelines automáticos

---

**Fecha de creación:** Octubre 2025  
**Estimación total:** 2-3 días de desarrollo  
**Impacto:** Alto - Mejora significativa en developer experience
