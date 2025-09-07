#!/usr/bin/env node

/**
 * =============================================================================
 * UPDATE MAIN README - PANACEA ICONO SA
 * =============================================================================
 * Script para actualizar el README principal con información de repositorios
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

class MainReadmeUpdater {
    constructor() {
        this.mainReadmePath = './README.md';
        this.reposReadmePath = './docs/REPOSITORIES.md';
    }

    /**
     * Lee el contenido del README de repositorios
     */
    readReposReadme() {
        try {
            return fs.readFileSync(this.reposReadmePath, 'utf8');
        } catch (error) {
            console.error('❌ Error leyendo README de repositorios:', error.message);
            return null;
        }
    }

    /**
     * Lee el README principal actual
     */
    readMainReadme() {
        try {
            return fs.readFileSync(this.mainReadmePath, 'utf8');
        } catch (error) {
            console.error('❌ Error leyendo README principal:', error.message);
            return null;
        }
    }

    /**
     * Actualiza el README principal con la sección de repositorios
     */
    updateMainReadme() {
        const mainReadme = this.readMainReadme();
        const reposReadme = this.readReposReadme();

        if (!mainReadme || !reposReadme) {
            console.error('❌ No se pudo leer uno de los archivos README');
            return false;
        }

        // Extraer la sección de repositorios del README de repositorios
        const reposSection = this.extractReposSection(reposReadme);
        
        // Buscar y reemplazar la sección de repositorios en el README principal
        const updatedReadme = this.replaceReposSection(mainReadme, reposSection);

        // Guardar el README actualizado
        try {
            fs.writeFileSync(this.mainReadmePath, updatedReadme);
            console.log('✅ README principal actualizado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error guardando README principal:', error.message);
            return false;
        }
    }

    /**
     * Extrae la sección de repositorios del README de repositorios
     */
    extractReposSection(reposReadme) {
        const lines = reposReadme.split('\n');
        let startIndex = -1;
        let endIndex = -1;

        // Buscar el inicio de la sección de repositorios
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('## 🎯 Repositorio Principal')) {
                startIndex = i;
                break;
            }
        }

        // Buscar el final de la sección (antes de "## 🔗 Enlaces Rápidos")
        for (let i = startIndex; i < lines.length; i++) {
            if (lines[i].includes('## 🔗 Enlaces Rápidos')) {
                endIndex = i;
                break;
            }
        }

        if (startIndex === -1 || endIndex === -1) {
            console.warn('⚠️ No se encontró la sección de repositorios');
            return '';
        }

        return lines.slice(startIndex, endIndex).join('\n');
    }

    /**
     * Reemplaza la sección de repositorios en el README principal
     */
    replaceReposSection(mainReadme, reposSection) {
        const lines = mainReadme.split('\n');
        let startIndex = -1;
        let endIndex = -1;

        // Buscar la sección de repositorios existente
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('## 🎯 Repositorio Principal') || 
                lines[i].includes('## 📚 Repositorios')) {
                startIndex = i;
                break;
            }
        }

        if (startIndex === -1) {
            // Si no existe, agregar al final antes de la licencia
            const licenseIndex = lines.findIndex(line => line.includes('## 📄 Licencia'));
            if (licenseIndex !== -1) {
                lines.splice(licenseIndex, 0, '', reposSection, '');
            } else {
                lines.push('', reposSection);
            }
            return lines.join('\n');
        }

        // Buscar el final de la sección existente
        for (let i = startIndex + 1; i < lines.length; i++) {
            if (lines[i].startsWith('## ') && !lines[i].includes('Repositorio')) {
                endIndex = i;
                break;
            }
        }

        if (endIndex === -1) {
            endIndex = lines.length;
        }

        // Reemplazar la sección
        const beforeSection = lines.slice(0, startIndex);
        const afterSection = lines.slice(endIndex);
        
        return [...beforeSection, reposSection, ...afterSection].join('\n');
    }

    /**
     * Ejecuta la actualización
     */
    run() {
        console.log('🔄 Actualizando README principal con información de repositorios...');
        
        if (this.updateMainReadme()) {
            console.log('✅ Proceso completado exitosamente!');
        } else {
            console.error('❌ Error en el proceso de actualización');
            process.exit(1);
        }
    }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

if (require.main === module) {
    const updater = new MainReadmeUpdater();
    updater.run();
}

module.exports = MainReadmeUpdater;
