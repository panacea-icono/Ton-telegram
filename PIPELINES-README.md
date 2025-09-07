# 🚀 Panas Token Ecosystem - CI/CD Pipelines

## 📋 Resumen

Sistema completo de CI/CD con pipelines automatizados para desarrollo, testing, build, deploy a Heroku y Docker.

## 🏗️ Arquitectura de Pipelines

### 1. **GitHub Actions Workflows**

#### 🔄 CI/CD Principal (`ci-cd.yml`)

- **Trigger**: Push a `main`/`develop`, PRs, manual dispatch
- **Jobs**:
  - Linting & Testing
  - Security Audit
  - Build & Docker
  - Deploy to Staging/Production
  - Telegram Bots Deployment
  - Cleanup

#### 🤖 Telegram Bots Pipeline (`telegram-bots.yml`)

- **Trigger**: Cambios en bots, manual dispatch
- **Jobs**:
  - Validate Bots
  - Deploy Bots
  - Restart Bots
  - Notifications

#### 🐳 Docker Build Pipeline (`docker-build.yml`)

- **Trigger**: Push, tags, manual dispatch
- **Jobs**:
  - Multi-arch Docker Build
  - Security Scan (Trivy)
  - Deploy to Staging/Production

### 2. **Docker Configuration**

#### 📦 Dockerfiles

- `docker/Dockerfile` - Producción optimizada
- `docker/Dockerfile.dev` - Desarrollo

#### 🐳 Docker Compose

- `docker-compose.yml` - Desarrollo completo
- `docker-compose.prod.yml` - Producción

#### 🔧 Servicios Incluidos

- App principal
- Telegram Bots
- Redis
- PostgreSQL
- Nginx
- Prometheus
- Grafana

### 3. **Scripts de Automatización**

#### 🚀 Deploy Script (`scripts/deploy/deploy.sh`)

```bash
# Deploy a Heroku
./scripts/deploy/deploy.sh -p heroku -e production

# Deploy con Docker
./scripts/deploy/deploy.sh -p docker -e staging

# Deploy local
./scripts/deploy/deploy.sh -p local
```

#### 🏗️ Build Script (`scripts/deploy/build.sh`)

```bash
# Build completo
./scripts/deploy/build.sh -p all -t production

# Build paralelo
./scripts/deploy/build.sh -j

# Build limpio
./scripts/deploy/build.sh -c
```

#### 🐛 Debug Script (`scripts/debug/debug.sh`)

```bash
# Debug completo
./scripts/debug/debug.sh

# Debug específico
./scripts/debug/debug.sh -t bots -v

# Debug con output
./scripts/debug/debug.sh -o debug.log
```

## 🎯 Comandos NPM Disponibles

### 🚀 Deploy

```bash
npm run deploy:heroku      # Deploy a Heroku
npm run deploy:docker      # Deploy con Docker
npm run deploy:local       # Deploy local
```

### 🏗️ Build

```bash
npm run build:dev          # Build desarrollo
npm run build:prod         # Build producción
npm run build:docker       # Build Docker
npm run build:all          # Build completo
```

### 🐛 Debug

```bash
npm run debug              # Debug completo
npm run debug:system       # Debug sistema
npm run debug:app          # Debug aplicación
npm run debug:bots         # Debug bots
npm run debug:verbose      # Debug verbose
```

### 🐳 Docker

```bash
npm run docker:build       # Build containers
npm run docker:up          # Levantar servicios
npm run docker:down        # Bajar servicios
npm run docker:logs        # Ver logs
npm run docker:restart     # Reiniciar
npm run docker:clean       # Limpiar
```

### 🚀 Heroku

```bash
npm run heroku:deploy      # Deploy a Heroku
npm run heroku:logs        # Ver logs
npm run heroku:restart     # Reiniciar
npm run heroku:config      # Ver configuración
```

### 🔧 Utilidades

```bash
npm run worker             # Iniciar worker
npm run migrate            # Ejecutar migraciones
```

## 🔐 Configuración de Secrets

### GitHub Secrets Requeridos

```bash
# Heroku
HEROKU_API_KEY=your_heroku_api_key
HEROKU_EMAIL=your_email@example.com
HEROKU_STAGING_APP_NAME=your-staging-app
HEROKU_PRODUCTION_APP_NAME=your-production-app
HEROKU_BOTS_APP_NAME=your-bots-app

# URLs
HEROKU_STAGING_URL=https://your-staging-app.herokuapp.com
HEROKU_PRODUCTION_URL=https://your-production-app.herokuapp.com

# Telegram
TELEGRAM_BOT_ADMINS=123456789,987654321
TELEGRAM_OFFICIAL_CHANNEL=@your_channel

# Notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/...
CODECOV_TOKEN=your_codecov_token
```

### Variables de Entorno

```bash
# Base
NODE_ENV=production
DEBUG=false

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=panas_token
POSTGRES_USER=panas
POSTGRES_PASSWORD=secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secure_password

# Telegram
TELEGRAM_BOT_ADMINS=123456789
TELEGRAM_OFFICIAL_CHANNEL=@your_channel

# AI
OPENAI_API_KEY=your_openai_key
```

## 🚀 Flujo de Deploy

### 1. **Desarrollo Local**

```bash
# Clonar repositorio
git clone https://github.com/panacea-icono/Ton-telegram.git
cd Ton-telegram

# Instalar dependencias
npm install

# Configurar entorno
cp env.example .env.local
# Editar .env.local con tus configuraciones

# Iniciar desarrollo
npm run dev
```

### 2. **Testing y Build**

```bash
# Ejecutar tests
npm test

# Linting
npm run lint

# Build
npm run build:prod
```

### 3. **Deploy a Staging**

```bash
# Deploy automático (GitHub Actions)
git push origin develop

# Deploy manual
npm run deploy:heroku -e staging
```

### 4. **Deploy a Producción**

```bash
# Deploy automático (GitHub Actions)
git push origin main

# Deploy manual
npm run deploy:heroku -e production
```

## 🔍 Monitoreo y Debug

### 1. **Logs**

```bash
# Ver logs de aplicación
npm run heroku:logs

# Ver logs de Docker
npm run docker:logs

# Debug completo
npm run debug
```

### 2. **Health Checks**

- **App**: `https://your-app.herokuapp.com/health`
- **Bots**: Verificar estado en logs
- **Database**: Verificar conexión

### 3. **Métricas**

- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001`
- **Logs**: `logs/` directory

## 🛠️ Troubleshooting

### Problemas Comunes

#### 1. **Build Falla**

```bash
# Limpiar y rebuild
npm run docker:clean
npm run build:all -c
```

#### 2. **Deploy Falla**

```bash
# Verificar configuración
npm run heroku:config

# Ver logs
npm run heroku:logs

# Debug
npm run debug:app
```

#### 3. **Bots No Funcionan**

```bash
# Validar bots
npm run bots:validate

# Debug bots
npm run debug:bots

# Reiniciar bots
npm run heroku:restart
```

### Comandos de Emergencia

```bash
# Rollback rápido
git revert HEAD
git push origin main

# Reiniciar todo
npm run docker:down
npm run docker:up

# Limpiar todo
npm run docker:clean
rm -rf node_modules
npm install
```

## 📊 Métricas y Alertas

### 1. **Métricas Clave**

- Uptime de aplicación
- Tiempo de respuesta
- Uso de memoria/CPU
- Errores por minuto
- Estado de bots

### 2. **Alertas Configuradas**

- Deploy fallido
- Health check fallido
- Bots offline
- Errores críticos

## 🔄 Mantenimiento

### 1. **Actualizaciones Regulares**

- Dependencias: Semanal
- Docker images: Mensual
- Security patches: Inmediato

### 2. **Backups**

- Database: Diario
- Configuraciones: Semanal
- Logs: Rotación automática

### 3. **Limpieza**

```bash
# Limpiar logs antiguos
find logs/ -name "*.log" -mtime +30 -delete

# Limpiar Docker
npm run docker:clean

# Limpiar cache
rm -rf .cache/
```

## 📚 Documentación Adicional

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Docs](https://docs.docker.com/)
- [Heroku Docs](https://devcenter.heroku.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## 🆘 Soporte

Para soporte técnico:

- **Email**: repositorios.panacea@gmail.com
- **GitHub Issues**: [Crear issue](https://github.com/panacea-icono/Ton-telegram/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/panacea-icono/Ton-telegram/wiki)

---

**Panacea | Icono SA** - Sistema de CI/CD para Panas Token Ecosystem
