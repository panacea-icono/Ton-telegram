#!/bin/bash

# 🌐 Panas Token - Script de Integración del Ecosistema
# Desarrollado por Panacea | Icono SA
# Versión: 1.0.0

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner de inicio
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🌐 PANAS TOKEN ECOSYSTEM                 ║"
echo "║                   Panacea | Icono SA                        ║"
echo "║              Script de Integración Multichain               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar dependencias
check_dependencies() {
    log "🔍 Verificando dependencias del sistema..."
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        error "Git no está instalado. Por favor instala Git primero."
        exit 1
    fi
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        warning "Node.js no está instalado. Algunas funcionalidades pueden no estar disponibles."
    fi
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        warning "Python3 no está instalado. Algunas funcionalidades pueden no estar disponibles."
    fi
    
    success "Dependencias verificadas"
}

# Crear estructura de directorios
create_directory_structure() {
    log "📁 Creando estructura de directorios..."
    
    # Directorios principales
    mkdir -p tokens
    mkdir -p backend
    mkdir -p frontend
    mkdir -p contracts
    mkdir -p infrastructure
    mkdir -p docs
    mkdir -p scripts
    mkdir -p config
    mkdir -p tests
    mkdir -p logs
    
    # Subdirectorios específicos
    mkdir -p contracts/{ton,solana,algorand,bsc}
    mkdir -p backend/{router,ton-connect,api}
    mkdir -p frontend/{dashboard,telegram-bot,web-app}
    mkdir -p infrastructure/{docker,ci-cd,monitoring}
    mkdir -p docs/{api,user-guide,technical}
    
    success "Estructura de directorios creada"
}

# Inicializar gitmodules
init_gitmodules() {
    log "🔗 Inicializando submódulos de Git..."
    
    # Verificar si .gitmodules existe
    if [ ! -f ".gitmodules" ]; then
        error "Archivo .gitmodules no encontrado"
        exit 1
    fi
    
    # Inicializar submódulos
    git submodule init
    git submodule update --recursive --remote
    
    success "Submódulos inicializados"
}

# Configurar variables de entorno
setup_environment() {
    log "⚙️  Configurando variables de entorno..."
    
    # Crear archivo .env si no existe
    if [ ! -f ".env" ]; then
        cp .env.example .env
        warning "Archivo .env creado desde .env.example. Por favor configura las variables necesarias."
    fi
    
    # Crear archivo .env.local para configuraciones locales
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF
# Configuraciones locales de desarrollo
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
EOF
    fi
    
    success "Variables de entorno configuradas"
}

# Instalar dependencias de cada submódulo
install_dependencies() {
    log "📦 Instalando dependencias de submódulos..."
    
    # Función para instalar dependencias en un directorio
    install_in_directory() {
        local dir=$1
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            log "Instalando dependencias en $dir..."
            cd "$dir"
            npm install
            cd - > /dev/null
        fi
    }
    
    # Instalar dependencias en cada submódulo
    for submodule in tokens/* backend/* frontend/* contracts/*; do
        if [ -d "$submodule" ]; then
            install_in_directory "$submodule"
        fi
    done
    
    success "Dependencias instaladas"
}

# Configurar scripts de desarrollo
setup_development_scripts() {
    log "🛠️  Configurando scripts de desarrollo..."
    
    # Script para ejecutar todos los servicios
    cat > scripts/start-all.sh << 'EOF'
#!/bin/bash
# Script para iniciar todos los servicios del ecosistema

echo "🚀 Iniciando ecosistema Panas Token..."

# Iniciar backend
if [ -d "backend/router" ]; then
    echo "Iniciando router backend..."
    cd backend/router && npm run dev &
fi

# Iniciar frontend
if [ -d "frontend/dashboard" ]; then
    echo "Iniciando dashboard..."
    cd frontend/dashboard && npm run dev &
fi

# Iniciar telegram bot
if [ -d "frontend/telegram-bot" ]; then
    echo "Iniciando telegram bot..."
    cd frontend/telegram-bot && npm run dev &
fi

echo "✅ Todos los servicios iniciados"
EOF
    
    chmod +x scripts/start-all.sh
    
    # Script para actualizar submódulos
    cat > scripts/update-submodules.sh << 'EOF'
#!/bin/bash
# Script para actualizar todos los submódulos

echo "🔄 Actualizando submódulos..."

git submodule update --remote --recursive

echo "✅ Submódulos actualizados"
EOF
    
    chmod +x scripts/update-submodules.sh
    
    success "Scripts de desarrollo configurados"
}

# Configurar Docker Compose
setup_docker() {
    log "🐳 Configurando Docker Compose..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Base de datos
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: panas_token
      POSTGRES_USER: panas
      POSTGRES_PASSWORD: panas_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis para cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Backend API
  api:
    build: ./backend/router
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://panas:panas_password@postgres:5432/panas_token
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Frontend Dashboard
  dashboard:
    build: ./frontend/dashboard
    ports:
      - "3001:3000"
    environment:
      - REACT_APP_API_URL=http://api:3000
    depends_on:
      - api

  # Telegram Bot
  telegram-bot:
    build: ./frontend/telegram-bot
    environment:
      - BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - API_URL=http://api:3000
    depends_on:
      - api

volumes:
  postgres_data:
EOF
    
    success "Docker Compose configurado"
}

# Función principal
main() {
    log "🚀 Iniciando configuración del ecosistema Panas Token..."
    
    check_dependencies
    create_directory_structure
    init_gitmodules
    setup_environment
    install_dependencies
    setup_development_scripts
    setup_docker
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ CONFIGURACIÓN COMPLETA                ║"
    echo "║                                                              ║"
    echo "║  El ecosistema Panas Token ha sido configurado exitosamente  ║"
    echo "║                                                              ║"
    echo "║  Próximos pasos:                                            ║"
    echo "║  1. Configura las variables en .env                         ║"
    echo "║  2. Ejecuta: ./scripts/start-all.sh                        ║"
    echo "║  3. Visita: http://localhost:3001 (Dashboard)               ║"
    echo "║                                                              ║"
    echo "║  Para más información, consulta el README.md                ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Ejecutar función principal
main "$@"
