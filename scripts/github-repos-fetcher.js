#!/usr/bin/env node

/**
 * =============================================================================
 * GITHUB REPOSITORIES FETCHER - PANACEA ICONO SA
 * =============================================================================
 * Script para obtener información real de repositorios usando GitHub API
 * con autenticación por token
 * =============================================================================
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class GitHubReposFetcher {
    constructor() {
        this.organization = process.env.GITHUB_ORG || 'panacea-icono';
        this.apiBase = 'api.github.com';
        this.repos = [];
        this.outputDir = './docs';
        this.token = process.env.GITHUB_TOKEN || '';
    }

    /**
     * Realiza una petición HTTP autenticada a la API de GitHub
     */
    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.apiBase,
                path: url,
                method: 'GET',
                headers: {
                    'User-Agent': 'Panas-Token-Ecosystem/1.0.0',
                    'Accept': 'application/vnd.github.v3+json'
                }
            };
            if (this.token) {
                options.headers.Authorization = `token ${this.token}`;
            }

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const jsonData = JSON.parse(data);
                            resolve(jsonData);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    } catch (error) {
                        reject(new Error(`Error parsing JSON: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request error: ${error.message}`));
            });

            req.end();
        });
    }

    /**
     * Obtiene todos los repositorios de la organización
     */
    async fetchRepositories() {
        try {
            console.log(`🔍 Obteniendo repositorios de la organización ${this.organization}...`);
            
            const url = `/orgs/${this.organization}/repos?per_page=100&sort=updated&direction=desc`;
            const response = await this.makeRequest(url);
            
            // Verificar si la respuesta es un array
            if (!Array.isArray(response)) {
                throw new Error(`Respuesta inesperada de la API: ${JSON.stringify(response)}`);
            }
            
            this.repos = response.map(repo => ({
                name: repo.name,
                fullName: repo.full_name,
                description: repo.description || 'Sin descripción',
                url: repo.html_url,
                cloneUrl: repo.clone_url,
                sshUrl: repo.ssh_url,
                language: repo.language || 'Sin especificar',
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                watchers: repo.watchers_count,
                openIssues: repo.open_issues_count,
                size: repo.size,
                createdAt: repo.created_at,
                updatedAt: repo.updated_at,
                pushedAt: repo.pushed_at,
                isPrivate: repo.private,
                isFork: repo.fork,
                topics: repo.topics || [],
                defaultBranch: repo.default_branch,
                license: repo.license ? repo.license.name : 'Sin licencia',
                mainRepo: repo.name === 'Ton-telegram' // Marcar como principal
            }));

            console.log(`✅ Se encontraron ${this.repos.length} repositorios`);
            return this.repos;

        } catch (error) {
            console.error(`❌ Error obteniendo repositorios: ${error.message}`);
            
            // Si falla la API, usar datos estáticos como fallback
            console.log('🔄 Usando datos estáticos como fallback...');
            return this.getStaticRepositories();
        }
    }

    /**
     * Datos estáticos como fallback
     */
    getStaticRepositories() {
        return [
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
                topics: ['telegram', 'ton', 'wallet', 'payments', 'bot'],
                defaultBranch: 'main',
                license: 'MIT',
                mainRepo: true
            }
        ];
    }

    /**
     * Genera un archivo README con la lista de repositorios
     */
    generateRepositoriesList() {
        const mainRepo = this.repos.find(repo => repo.mainRepo) || this.repos[0];
        const otherRepos = this.repos.filter(repo => !repo.mainRepo);

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

${otherRepos.length > 0 ? otherRepos.map((repo, index) => `
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
`).join('\n') : 'No hay otros repositorios disponibles.'}

---

## 🔗 Enlaces Rápidos

### Repositorio Principal
- [${mainRepo.name}](https://github.com/panacea-icono/${mainRepo.name}) - ${mainRepo.description}

### Otros Repositorios
${otherRepos.length > 0 ? otherRepos.map(repo => `- [${repo.name}](https://github.com/panacea-icono/${repo.name}) - ${repo.description}`).join('\n') : 'No hay otros repositorios disponibles.'}

---

## 📊 Estadísticas Generales

- **Total de repositorios**: ${this.repos.length}
- **Repositorios públicos**: ${this.repos.filter(r => !r.isPrivate).length}
- **Repositorios privados**: ${this.repos.filter(r => r.isPrivate).length}
- **Total de estrellas**: ${this.repos.reduce((sum, repo) => sum + repo.stars, 0)}
- **Total de forks**: ${this.repos.reduce((sum, repo) => sum + repo.forks, 0)}
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
        this.repos.forEach(repo => {
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
        this.repos.forEach(repo => {
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
            repositories: this.repos,
            statistics: {
                total: this.repos.length,
                public: this.repos.filter(r => !r.isPrivate).length,
                private: this.repos.filter(r => r.isPrivate).length,
                totalStars: this.repos.reduce((sum, repo) => sum + repo.stars, 0),
                totalForks: this.repos.reduce((sum, repo) => sum + repo.forks, 0),
                totalWatchers: this.repos.reduce((sum, repo) => sum + repo.watchers, 0),
                languages: this.getTopLanguages(),
                lastUpdated: new Date().toISOString()
            }
        };
    }

    /**
     * Genera un archivo de configuración para submódulos
     */
    generateGitSubmodulesConfig() {
        const submodulesContent = this.repos.map(repo => 
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
        const mainRepo = this.repos.find(repo => repo.mainRepo) || this.repos[0];
        const otherRepos = this.repos.filter(repo => !repo.mainRepo);

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
echo "📊 Total de repositorios: ${this.repos.length}"
echo ""

# Crear directorio para repositorios
mkdir -p panacea-icono-repos
cd panacea-icono-repos

${cloneCommands}

echo ""
echo "🎉 ¡Todos los repositorios han sido clonados exitosamente!"
echo "📁 Ubicación: $(pwd)"
echo "📊 Total clonados: ${this.repos.length}"
echo ""
echo "🔗 Repositorio principal: https://github.com/panacea-icono/${mainRepo.name}"
echo "📚 Lista completa: https://github.com/panacea-icono"
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
    }

    /**
     * Ejecuta el proceso completo
     */
    async run() {
        try {
            console.log('🌐 GitHub Repositories Fetcher - Panacea Icono SA');
            console.log('=' .repeat(60));
            
            await this.fetchRepositories();
            await this.saveFiles();
            
            console.log('');
            console.log('✅ Proceso completado exitosamente!');
            console.log(`📊 Se procesaron ${this.repos.length} repositorios`);
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
    const fetcher = new GitHubReposFetcher();
    const command = process.argv[2];

    switch (command) {
        case 'fetch':
        case 'list':
            fetcher.run();
            break;

        case 'json':
            fetcher.fetchRepositories().then(() => {
                console.log(JSON.stringify(fetcher.generateJSONOutput(), null, 2));
            });
            break;

        case 'submodules':
            fetcher.fetchRepositories().then(() => {
                console.log(fetcher.generateGitSubmodulesConfig());
            });
            break;

        case 'clone':
            fetcher.fetchRepositories().then(() => {
                console.log(fetcher.generateCloneScript());
            });
            break;

        default:
            console.log(`
🌐 GitHub Repositories Fetcher - Panacea Icono SA

Uso: node github-repos-fetcher.js <comando>

Comandos disponibles:
  fetch       Obtiene repositorios reales de GitHub API y genera archivos
  list        Alias de fetch
  json        Muestra solo el JSON con información de repositorios
  submodules  Muestra solo la configuración de submódulos
  clone       Muestra solo el script de clonación

Ejemplos:
  node github-repos-fetcher.js fetch
  node github-repos-fetcher.js json
  node github-repos-fetcher.js submodules
  node github-repos-fetcher.js clone
            `);
    }
}

module.exports = GitHubReposFetcher;
