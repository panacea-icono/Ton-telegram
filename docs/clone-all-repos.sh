#!/bin/bash

# =============================================================================
# CLONE ALL REPOSITORIES - PANACEA ICONO SA
# =============================================================================
# Script para clonar todos los repositorios de la organización panacea-icono
# =============================================================================

set -e

echo "🚀 Iniciando clonación de repositorios de Panacea Icono SA..."
echo "📊 Total de repositorios: 5"
echo ""

# Crear directorio para repositorios
mkdir -p panacea-icono-repos
cd panacea-icono-repos

echo "🎯 Clonando repositorio principal: Ton-telegram"
git clone https://github.com/panacea-icono/Ton-telegram.git
cd Ton-telegram
echo "✅ Ton-telegram clonado exitosamente"
cd ..
echo ""
echo "📁 Clonando HUGGING_FACE..."
git clone https://github.com/panacea-icono/HUGGING_FACE.git
cd HUGGING_FACE
echo "✅ HUGGING_FACE clonado exitosamente"
cd ..
echo "📁 Clonando FIBONACCI-FINAL-MODULOS-API-MAESTRO..."
git clone https://github.com/panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO.git
cd FIBONACCI-FINAL-MODULOS-API-MAESTRO
echo "✅ FIBONACCI-FINAL-MODULOS-API-MAESTRO clonado exitosamente"
cd ..
echo "📁 Clonando tutor_academico_CIRUGIA_I-II-III..."
git clone https://github.com/panacea-icono/tutor_academico_CIRUGIA_I-II-III.git
cd tutor_academico_CIRUGIA_I-II-III
echo "✅ tutor_academico_CIRUGIA_I-II-III clonado exitosamente"
cd ..
echo "📁 Clonando kuchiuyas..."
git clone https://github.com/panacea-icono/kuchiuyas.git
cd kuchiuyas
echo "✅ kuchiuyas clonado exitosamente"
cd ..

echo ""
echo "🎉 ¡Todos los repositorios han sido clonados exitosamente!"
echo "📁 Ubicación: $(pwd)"
echo "📊 Total clonados: 5"
echo ""
echo "🔗 Repositorio principal: https://github.com/panacea-icono/Ton-telegram"
echo "📚 Lista completa: https://github.com/panacea-icono"
