#!/bin/bash

# =============================================================================
# SETUP ECOSYSTEM - PANACEA ICONO SA
# =============================================================================
# Script maestro para configurar todo el ecosistema de repositorios
# =============================================================================

set -e

echo "🌐 Panacea Icono SA - Ecosystem Setup"
echo "============================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con color
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

print_status "Iniciando configuración del ecosistema..."

# 1. Generar documentación de repositorios
print_status "Generando documentación de repositorios..."
if node scripts/panacea-repos-generator.js generate; then
    print_success "Documentación de repositorios generada"
else
    print_error "Error generando documentación de repositorios"
    exit 1
fi

# 2. Actualizar .gitmodules
print_status "Actualizando configuración de submódulos..."
if node scripts/panacea-repos-generator.js submodules > .gitmodules; then
    print_success "Configuración de submódulos actualizada"
else
    print_error "Error actualizando configuración de submódulos"
    exit 1
fi

# 3. Actualizar README principal
print_status "Actualizando README principal..."
if node scripts/update-main-readme.js; then
    print_success "README principal actualizado"
else
    print_error "Error actualizando README principal"
    exit 1
fi

# 4. Crear directorio de scripts si no existe
print_status "Verificando estructura de directorios..."
mkdir -p scripts
mkdir -p docs

# 5. Hacer scripts ejecutables
print_status "Configurando permisos de scripts..."
chmod +x scripts/*.js
chmod +x scripts/*.sh
chmod +x docs/clone-all-repos.sh

# 6. Mostrar resumen
echo ""
print_success "¡Configuración del ecosistema completada!"
echo ""
echo "📁 Archivos generados:"
echo "  - docs/REPOSITORIES.md (Lista completa de repositorios)"
echo "  - docs/repositories.json (Datos en formato JSON)"
echo "  - docs/git-submodules.txt (Configuración de submódulos)"
echo "  - docs/clone-all-repos.sh (Script para clonar todos los repos)"
echo "  - docs/ecosystem-config.env (Configuración del ecosistema)"
echo "  - .gitmodules (Configuración actualizada de submódulos)"
echo ""

echo "🚀 Comandos disponibles:"
echo "  - ./docs/clone-all-repos.sh (Clonar todos los repositorios)"
echo "  - git submodule init (Inicializar submódulos)"
echo "  - git submodule update --recursive --remote (Actualizar submódulos)"
echo "  - node scripts/panacea-repos-generator.js generate (Regenerar documentación)"
echo ""

echo "🔗 Repositorios del ecosistema:"
echo "  - Ton-telegram (Principal) - https://github.com/panacea-icono/Ton-telegram"
echo "  - HUGGING_FACE - https://github.com/panacea-icono/HUGGING_FACE"
echo "  - FIBONACCI-FINAL-MODULOS-API-MAESTRO - https://github.com/panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO"
echo "  - tutor_academico_CIRUGIA_I-II-III - https://github.com/panacea-icono/tutor_academico_CIRUGIA_I-II-III"
echo "  - kuchiuyas - https://github.com/panacea-icono/kuchiuyas"
echo ""

print_success "¡Ecosistema configurado exitosamente! 🎉"
