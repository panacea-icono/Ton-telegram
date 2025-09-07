#!/bin/bash

# 🌐 Panas Token - Script de Inicialización de Submódulos
# Panacea | Icono SA
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
echo "║              Script de Inicialización de Submódulos         ║"
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

# Verificar si .gitmodules existe
if [ ! -f ".gitmodules" ]; then
    error "Archivo .gitmodules no encontrado"
    exit 1
fi

log "🔍 Verificando configuración de submódulos..."

# Mostrar submódulos configurados
echo -e "${CYAN}📋 Submódulos configurados:${NC}"
grep -E '^\s*\[submodule' .gitmodules | sed 's/\[submodule "//' | sed 's/"\]//' | while read -r submodule; do
    echo "  - $submodule"
done

log "🔗 Inicializando submódulos..."

# Inicializar submódulos
if git submodule init; then
    success "Submódulos inicializados"
else
    error "Error al inicializar submódulos"
    exit 1
fi

log "📥 Descargando submódulos..."

# Actualizar submódulos
if git submodule update --recursive --remote; then
    success "Submódulos actualizados"
else
    warning "Algunos submódulos no pudieron ser actualizados (esto es normal si los repositorios no existen aún)"
fi

log "📊 Verificando estado de submódulos..."

# Mostrar estado de submódulos
echo -e "${CYAN}📊 Estado de submódulos:${NC}"
git submodule status

# Verificar directorios de submódulos
log "🔍 Verificando directorios de submódulos..."

submodules=(
    "tokens/panas-token"
    "tokens/gs-token"
    "tokens/vaser-token"
    "tokens/kuchi-token"
    "backend/router"
    "backend/ton-connect"
    "frontend/dashboard"
    "frontend/telegram-bot"
    "contracts/ton"
    "contracts/solana"
    "contracts/algorand"
    "contracts/bsc"
    "infrastructure/docker"
    "infrastructure/ci-cd"
    "docs/api"
)

for submodule in "${submodules[@]}"; do
    if [ -d "$submodule" ]; then
        success "✓ $submodule"
    else
        warning "⚠ $submodule (no existe aún)"
    fi
done

# Crear directorios vacíos para submódulos que no existen
log "📁 Creando directorios para submódulos futuros..."

for submodule in "${submodules[@]}"; do
    if [ ! -d "$submodule" ]; then
        mkdir -p "$submodule"
        echo "# $submodule" > "$submodule/README.md"
        echo "Este submódulo será inicializado cuando el repositorio correspondiente esté disponible." >> "$submodule/README.md"
        success "✓ Directorio creado: $submodule"
    fi
done

# Mostrar resumen
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ INICIALIZACIÓN COMPLETA                ║"
echo "║                                                              ║"
echo "║  Los submódulos han sido configurados exitosamente          ║"
echo "║                                                              ║"
echo "║  Próximos pasos:                                            ║"
echo "║  1. Crear los repositorios correspondientes en GitHub       ║"
echo "║  2. Ejecutar: git submodule update --remote                 ║"
echo "║  3. Desarrollar cada componente por separado                ║"
echo "║                                                              ║"
echo "║  Para más información, consulta el README.md                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log "🎉 Inicialización de submódulos completada"
