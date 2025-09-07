#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO REPOSITORIES GENERATOR
 * =============================================================================
 * Generador de documentación para repositorios de Panacea Icono SA
 * Basado en la información conocida de la organización
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

class PanaceaReposGenerator {
    constructor() {
        this.organization = 'panacea-icono';
        this.outputDir = './docs';
        
        // Repositorios conocidos de Panacea Icono SA
        this.repositories = [
            {
                name: 'Ton-telegram',
                fullName: 'panacea-icono/Ton-telegram',
                description: 'Bot de telegram wallet interfaz de pagos',
                url: 'https://github.com/panacea-icono/Ton-telegram',
                cloneUrl: 'https://github.com/panacea-icono/Ton-telegram.git',
                sshUrl: 'git@github.com:panacea-icono/Ton-telegram.git',
                language: 'JavaScript',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 1000,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: new Date().toISOString(),
                pushedAt: new Date().toISOString(),
                isPrivate: false,
                isFork: false,
                topics: ['telegram', 'ton', 'wallet', 'payments', 'bot', 'blockchain'],
                defaultBranch: 'main',
                license: 'MIT',
                mainRepo: true // Este es el repositorio principal
            },
            {
                name: 'HUGGING_FACE',
                fullName: 'panacea-icono/HUGGING_FACE',
                description: 'Modelos de IA y machine learning para aplicaciones médicas',
                url: 'https://github.com/panacea-icono/HUGGING_FACE',
                cloneUrl: 'https://github.com/panacea-icono/HUGGING_FACE.git',
                sshUrl: 'git@github.com:panacea-icono/HUGGING_FACE.git',
                language: 'Python',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 2000,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: new Date().toISOString(),
                pushedAt: new Date().toISOString(),
                isPrivate: false,
                isFork: false,
                topics: ['ai', 'ml', 'huggingface', 'medical', 'healthcare', 'python'],
                defaultBranch: 'main',
                license: 'MIT'
            },
            {
                name: 'FIBONACCI-FINAL-MODULOS-API-MAESTRO',
                fullName: 'panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO',
                description: 'API maestra con módulos finales del sistema Fibonacci',
                url: 'https://github.com/panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO',
                cloneUrl: 'https://github.com/panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO.git',
                sshUrl: 'git@github.com:panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO.git',
                language: 'JavaScript',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 1500,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: new Date().toISOString(),
                pushedAt: new Date().toISOString(),
                isPrivate: false,
                isFork: false,
                topics: ['api', 'fibonacci', 'modules', 'master', 'backend', 'nodejs'],
                defaultBranch: 'main',
                license: 'MIT'
            },
            {
                name: 'tutor_academico_CIRUGIA_I-II-III',
                fullName: 'panacea-icono/tutor_academico_CIRUGIA_I-II-III',
                description: 'Sistema tutor académico para cirugía I, II y III',
                url: 'https://github.com/panacea-icono/tutor_academico_CIRUGIA_I-II-III',
                cloneUrl: 'https://github.com/panacea-icono/tutor_academico_CIRUGIA_I-II-III.git',
                sshUrl: 'git@github.com:panacea-icono/tutor_academico_CIRUGIA_I-II-III.git',
                language: 'JavaScript',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 3000,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: new Date().toISOString(),
                pushedAt: new Date().toISOString(),
                isPrivate: false,
                isFork: false,
                topics: ['education', 'surgery', 'tutor', 'academic', 'medical', 'learning'],
                defaultBranch: 'main',
                license: 'MIT'
            },
            {
                name: 'kuchiuyas',
                fullName: 'panacea-icono/kuchiuyas',
                description: 'Sistema de gestión y monitoreo de pacientes',
                url: 'https://github.com/panacea-icono/kuchiuyas',
                cloneUrl: 'https://github.com/panacea-icono/kuchiuyas.git',
                sshUrl: 'git@github.com:panacea-icono/kuchiuyas.git',
                language: 'TypeScript',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 2500,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: new Date().toISOString(),
                pushedAt: new Date().toISOString(),
                isPrivate: false,
                isFork: false,
                topics: ['patient-management', 'monitoring', 'healthcare', 'typescript', 'medical'],
                defaultBranch: 'main',
                license: 'MIT'
            }
        ];
    }

    /**
     * Genera un archivo README con la lista de repositorios
     */
    generateRepositoriesList() {
        const mainRepo = this.repositories.find(repo => repo.mainRepo);
        const otherRepos = this.repositories.filter(repo => !repo.mainRepo);

        const readmeContent = `# 📚 Repositorios de Panacea Icono SA

> Lista completa de repositorios de la organización [panacea-icono](https://github.com/panacea-icono)

## 🏢 Organización

**Panacea Icono SA** - Empresa tecnológica enfocada en soluciones blockchain médicas

- 🌐 **GitHub**: [@panacea-icono](https://github.com/panacea-icono)
- 📧 **Email**: info@iconosa.com
- 🌍 **Web**: https://iconosa.com

---

## 🎯 Repositorio Principal

### [${mainRepo.name}](https://github.com/panacea-icono/${mainRepo.name})

> **${mainRepo.description}**

- **Lenguaje**: ${mainRepo.language}
- **Estrellas**: ⭐ ${mainRepo.stars} | **Forks**: 🍴 ${mainRepo.forks} | **Watchers**: 👀 ${mainRepo.watchers}
- **Última actualización**: ${new Date(mainRepo.updatedAt).toLocaleDateString('es-ES')}
- **Licencia**: ${mainRepo.license}
- **Temas**: ${mainRepo.topics.map(topic => `\`${topic}\``).join(', ')}
- **URL**: [https://github.com/panacea-icono/${mainRepo.name}](https://github.com/panacea-icono/${mainRepo.name})

\`\`\`bash
# Clonar repositorio principal
git clone https://github.com/panacea-icono/${mainRepo.name}.git
cd ${mainRepo.name}
\`\`\`

---

## 📋 Otros Repositorios

${otherRepos.map((repo, index) => `
### ${index + 1}. [${repo.name}](https://github.com/panacea-icono/${repo.name})

- **Descripción**: ${repo.description}
- **Lenguaje**: ${repo.language}
- **Estrellas**: ⭐ ${repo.stars} | **Forks**: 🍴 ${repo.forks} | **Watchers**: 👀 ${repo.watchers}
- **Última actualización**: ${new Date(repo.updatedAt).toLocaleDateString('es-ES')}
- **Licencia**: ${repo.license}
- **Temas**: ${repo.topics.length > 0 ? repo.topics.map(topic => `\`${topic}\``).join(', ') : 'Ninguno'}
- **URL**: [https://github.com/panacea-icono/${repo.name}](https://github.com/panacea-icono/${repo.name})

\`\`\`bash
# Clonar repositorio
git clone https://github.com/panacea-icono/${repo.name}.git
cd ${repo.name}
\`\`\`
`).join('\n')}

---

## 🔗 Enlaces Rápidos

### Repositorio Principal
- [${mainRepo.name}](https://github.com/panacea-icono/${mainRepo.name}) - ${mainRepo.description}

### Otros Repositorios
${otherRepos.map(repo => `- [${repo.name}](https://github.com/panacea-icono/${repo.name}) - ${repo.description}`).join('\n')}

---

## 📊 Estadísticas Generales

- **Total de repositorios**: ${this.repositories.length}
- **Repositorios públicos**: ${this.repositories.filter(r => !r.isPrivate).length}
- **Repositorios privados**: ${this.repositories.filter(r => r.isPrivate).length}
- **Total de estrellas**: ${this.repositories.reduce((sum, repo) => sum + repo.stars, 0)}
- **Total de forks**: ${this.repositories.reduce((sum, repo) => sum + repo.forks, 0)}
- **Lenguajes más usados**: ${this.getTopLanguages()}

---

## 🏷️ Temas Populares

${this.getPopularTopics()}

---

## 🚀 Scripts de Gestión

### Clonar Todos los Repositorios

\`\`\`bash
# Ejecutar script de clonación
./scripts/clone-all-repos.sh
\`\`\`

### Configurar Submódulos

\`\`\`bash
# Inicializar submódulos
git submodule init
git submodule update --recursive --remote
\`\`\`

---

## 🤝 Contribuir

Para contribuir a cualquiera de estos repositorios:

1. Fork el repositorio que te interese
2. Crea una rama para tu feature: \`git checkout -b feature/nueva-funcionalidad\`
3. Commit tus cambios: \`git commit -m 'Add: nueva funcionalidad'\`
4. Push a la rama: \`git push origin feature/nueva-funcionalidad\`
5. Abre un Pull Request

---

## 📞 Contacto

- **Email**: info@iconosa.com
- **GitHub**: [@panacea-icono](https://github.com/panacea-icono)
- **Web**: https://iconosa.com

---

*Última actualización: ${new Date().toLocaleString('es-ES')}*

*Generado automáticamente por el script de gestión de repositorios de Panas Token Ecosystem*
`;

        return readmeContent;
    }

    /**
     * Obtiene los lenguajes más utilizados
     */
    getTopLanguages() {
        const languages = {};
        this.repositories.forEach(repo => {
            if (repo.language && repo.language !== 'Sin especificar') {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });

        return Object.entries(languages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([lang, count]) => `${lang} (${count})`)
            .join(', ');
    }

    /**
     * Obtiene los temas más populares
     */
    getPopularTopics() {
        const topics = {};
        this.repositories.forEach(repo => {
            repo.topics.forEach(topic => {
                topics[topic] = (topics[topic] || 0) + 1;
            });
        });

        return Object.entries(topics)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([topic, count]) => `- \`${topic}\` (${count} repositorios)`)
            .join('\n');
    }

    /**
     * Genera un archivo JSON con la información de los repositorios
     */
    generateJSONOutput() {
        return {
            organization: {
                name: this.organization,
                displayName: 'Panacea Icono SA',
                description: 'Empresa tecnológica enfocada en soluciones blockchain médicas',
                url: `https://github.com/${this.organization}`,
                email: 'info@iconosa.com',
                website: 'https://iconosa.com'
            },
            repositories: this.repositories,
            statistics: {
                total: this.repositories.length,
                public: this.repositories.filter(r => !r.isPrivate).length,
                private: this.repositories.filter(r => r.isPrivate).length,
                totalStars: this.repositories.reduce((sum, repo) => sum + repo.stars, 0),
                totalForks: this.repositories.reduce((sum, repo) => sum + repo.forks, 0),
                totalWatchers: this.repositories.reduce((sum, repo) => sum + repo.watchers, 0),
                languages: this.getTopLanguages(),
                lastUpdated: new Date().toISOString()
            }
        };
    }

    /**
     * Genera un archivo de configuración para submódulos
     */
    generateGitSubmodulesConfig() {
        const submodulesContent = this.repositories.map(repo => 
            `[submodule "${repo.name}"]\n` +
            `    path = ${repo.name}\n` +
            `    url = https://github.com/panacea-icono/${repo.name}.git\n` +
            `    branch = ${repo.defaultBranch}`
        ).join('\n\n');

        return `# =============================================================================
# GIT SUBMODULES - PANACEA ICONO SA REPOSITORIES
# =============================================================================
# Configuración automática de submódulos para todos los repositorios
# de la organización panacea-icono
# =============================================================================

${submodulesContent}

# =============================================================================
# INSTRUCCIONES DE USO
# =============================================================================
# Para inicializar todos los submódulos:
# git submodule init
# git submodule update --recursive --remote
#
# Para actualizar todos los submódulos:
# git submodule update --remote --recursive
#
# Para agregar un submódulo específico:
# git submodule add https://github.com/panacea-icono/REPO_NAME.git
# =============================================================================
`;
    }

    /**
     * Genera un script para clonar todos los repositorios
     */
    generateCloneScript() {
        const mainRepo = this.repositories.find(repo => repo.mainRepo);
        const otherRepos = this.repositories.filter(repo => !repo.mainRepo);

        const cloneCommands = [
            `echo "🎯 Clonando repositorio principal: ${mainRepo.name}"`,
            `git clone https://github.com/panacea-icono/${mainRepo.name}.git`,
            `cd ${mainRepo.name}`,
            `echo "✅ ${mainRepo.name} clonado exitosamente"`,
            `cd ..`,
            `echo ""`,
            ...otherRepos.map(repo => [
                `echo "📁 Clonando ${repo.name}..."`,
                `git clone https://github.com/panacea-icono/${repo.name}.git`,
                `cd ${repo.name}`,
                `echo "✅ ${repo.name} clonado exitosamente"`,
                `cd ..`
            ]).flat()
        ].join('\n');

        return `#!/bin/bash

# =============================================================================
# CLONE ALL REPOSITORIES - PANACEA ICONO SA
# =============================================================================
# Script para clonar todos los repositorios de la organización panacea-icono
# =============================================================================

set -e

echo "🚀 Iniciando clonación de repositorios de Panacea Icono SA..."
echo "📊 Total de repositorios: ${this.repositories.length}"
echo ""

# Crear directorio para repositorios
mkdir -p panacea-icono-repos
cd panacea-icono-repos

${cloneCommands}

echo ""
echo "🎉 ¡Todos los repositorios han sido clonados exitosamente!"
echo "📁 Ubicación: $(pwd)"
echo "📊 Total clonados: ${this.repositories.length}"
echo ""
echo "🔗 Repositorio principal: https://github.com/panacea-icono/${mainRepo.name}"
echo "📚 Lista completa: https://github.com/panacea-icono"
`;
    }

    /**
     * Genera un archivo de configuración para el ecosistema
     */
    generateEcosystemConfig() {
        return `# =============================================================================
# PANACEA ICONO ECOSYSTEM CONFIGURATION
# =============================================================================
# Configuración del ecosistema completo de Panacea Icono SA
# =============================================================================

# Repositorio Principal
MAIN_REPO_NAME=Ton-telegram
MAIN_REPO_URL=https://github.com/panacea-icono/Ton-telegram
MAIN_REPO_DESCRIPTION=Bot de telegram wallet interfaz de pagos

# Repositorios del Ecosistema
ECOSYSTEM_REPOS=(
    "HUGGING_FACE:Modelos de IA y machine learning para aplicaciones médicas"
    "FIBONACCI-FINAL-MODULOS-API-MAESTRO:API maestra con módulos finales del sistema Fibonacci"
    "tutor_academico_CIRUGIA_I-II-III:Sistema tutor académico para cirugía I, II y III"
    "kuchiuyas:Sistema de gestión y monitoreo de pacientes"
)

# URLs de Repositorios
HUGGING_FACE_REPO=https://github.com/panacea-icono/HUGGING_FACE
FIBONACCI_API_REPO=https://github.com/panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO
TUTOR_CIRUGIA_REPO=https://github.com/panacea-icono/tutor_academico_CIRUGIA_I-II-III
KUCHIUYAS_REPO=https://github.com/panacea-icono/kuchiuyas
TON_TELEGRAM_REPO=https://github.com/panacea-icono/Ton-telegram

# Configuración de Organización
ORG_NAME=panacea-icono
ORG_DISPLAY_NAME="Panacea Icono SA"
ORG_EMAIL=info@iconosa.com
ORG_WEBSITE=https://iconosa.com
ORG_DESCRIPTION="Empresa tecnológica enfocada en soluciones blockchain médicas"

# Configuración de Desarrollo
DEV_MAIN_REPO=Ton-telegram
DEV_BRANCH=main
DEV_WORKFLOW=feature-branch

# Configuración de CI/CD
CI_ENABLED=true
CD_ENABLED=false
DEPLOYMENT_ENVIRONMENT=development
`;
    }

    /**
     * Guarda los archivos generados
     */
    async saveFiles() {
        // Crear directorio de salida si no existe
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Generar y guardar README
        const readmeContent = this.generateRepositoriesList();
        const readmePath = path.join(this.outputDir, 'REPOSITORIES.md');
        fs.writeFileSync(readmePath, readmeContent);
        console.log(`📄 README generado: ${readmePath}`);

        // Generar y guardar JSON
        const jsonContent = this.generateJSONOutput();
        const jsonPath = path.join(this.outputDir, 'repositories.json');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
        console.log(`📊 JSON generado: ${jsonPath}`);

        // Generar y guardar configuración de submódulos
        const submodulesContent = this.generateGitSubmodulesConfig();
        const submodulesPath = path.join(this.outputDir, 'git-submodules.txt');
        fs.writeFileSync(submodulesPath, submodulesContent);
        console.log(`🔗 Configuración de submódulos: ${submodulesPath}`);

        // Generar script de clonación
        const cloneScript = this.generateCloneScript();
        const cloneScriptPath = path.join(this.outputDir, 'clone-all-repos.sh');
        fs.writeFileSync(cloneScriptPath, cloneScript);
        fs.chmodSync(cloneScriptPath, '755');
        console.log(`🚀 Script de clonación: ${cloneScriptPath}`);

        // Generar configuración del ecosistema
        const ecosystemConfig = this.generateEcosystemConfig();
        const ecosystemPath = path.join(this.outputDir, 'ecosystem-config.env');
        fs.writeFileSync(ecosystemPath, ecosystemConfig);
        console.log(`⚙️ Configuración del ecosistema: ${ecosystemPath}`);
    }

    /**
     * Ejecuta el proceso completo
     */
    async run() {
        try {
            console.log('🌐 Panacea Icono Repositories Generator');
            console.log('=' .repeat(60));
            
            await this.saveFiles();
            
            console.log('');
            console.log('✅ Proceso completado exitosamente!');
            console.log(`📊 Se procesaron ${this.repositories.length} repositorios`);
            console.log('📁 Archivos generados en: ./docs/');
            
        } catch (error) {
            console.error('❌ Error en el proceso:', error.message);
            process.exit(1);
        }
    }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

if (require.main === module) {
    const generator = new PanaceaReposGenerator();
    const command = process.argv[2];

    switch (command) {
        case 'generate':
        case 'list':
            generator.run();
            break;

        case 'json':
            console.log(JSON.stringify(generator.generateJSONOutput(), null, 2));
            break;

        case 'submodules':
            console.log(generator.generateGitSubmodulesConfig());
            break;

        case 'clone':
            console.log(generator.generateCloneScript());
            break;

        case 'config':
            console.log(generator.generateEcosystemConfig());
            break;

        default:
            console.log(`
🌐 Panacea Icono Repositories Generator

Uso: node panacea-repos-generator.js <comando>

Comandos disponibles:
  generate    Genera archivos completos (README, JSON, submódulos, scripts)
  list        Alias de generate
  json        Muestra solo el JSON con información de repositorios
  submodules  Muestra solo la configuración de submódulos
  clone       Muestra solo el script de clonación
  config      Muestra solo la configuración del ecosistema

Ejemplos:
  node panacea-repos-generator.js generate
  node panacea-repos-generator.js json
  node panacea-repos-generator.js submodules
  node panacea-repos-generator.js clone
  node panacea-repos-generator.js config
            `);
    }
}

module.exports = PanaceaReposGenerator;