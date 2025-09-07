#!/usr/bin/env node

/**
 * =============================================================================
 * GITHUB REPOSITORIES MANAGER - PANACEA ICONO SA
 * =============================================================================
 * Script para gestionar y listar todos los repositorios de la organización
 * panacea-icono en GitHub
 * =============================================================================
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch (_) {}

class GitHubReposManager {
    constructor() {
        this.apiBase = 'api.github.com';
        this.repos = [];
        this.outputDir = './docs';

        // Configuración vía variables de entorno
        this.token = process.env.GITHUB_TOKEN || '';
        this.organization = process.env.GITHUB_ORG || 'panacea-icono';
        this.username = process.env.GITHUB_USERNAME || '';
        this.scope = (process.env.GITHUB_REPOS_SCOPE || '').toLowerCase(); // 'org' | 'user' | ''
    }

    /**
     * Realiza una petición HTTP a la API de GitHub
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

            // Autenticación opcional para ampliar rate limit y acceder a repos privados
            if (this.token) {
                options.headers.Authorization = `token ${this.token}`;
                // options.headers['X-GitHub-Api-Version'] = '2022-11-28'; // opcional
            }

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data || '{}');
                        // Adjuntar status para permitir fallbacks inteligentes
                        jsonData.__status = res.statusCode;
                        resolve(jsonData);
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
            const combined = [];
            const seen = new Set();

            const mapRepos = (arr) => arr.map(repo => ({
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
                license: repo.license ? repo.license.name : 'Sin licencia'
            }));

            const addUnique = (arr) => {
                for (const r of arr) {
                    const key = r.fullName || r.url || r.name;
                    if (!seen.has(key)) {
                        seen.add(key);
                        combined.push(r);
                    }
                }
            };

            // Intentar org primero salvo que se fuerce user
            let orgTried = false;
            if (this.scope !== 'user' && this.organization) {
                orgTried = true;
                console.log(`🔍 Obteniendo repositorios de la organización ${this.organization}...`);
                const orgUrl = `/orgs/${this.organization}/repos?per_page=100&sort=updated&direction=desc`;
                const orgResp = await this.makeRequest(orgUrl);
                if (Array.isArray(orgResp)) {
                    addUnique(mapRepos(orgResp));
                } else {
                    const status = orgResp && orgResp.__status;
                    console.log(`ℹ️  No se pudo listar org (${status || 'sin código'}). Probando usuario...`);
                }
            }

            // Usuario explícito
            let userListed = false;
            if (this.scope === 'user' && this.username) {
                console.log(`🔍 Obteniendo repositorios del usuario ${this.username}...`);
                const userResp = await this.makeRequest(`/users/${this.username}/repos?per_page=100&sort=updated&direction=desc`);
                if (Array.isArray(userResp)) {
                    addUnique(mapRepos(userResp));
                    userListed = true;
                }
            }

            // Usuario autenticado (si hay token) cuando no se listó usuario explícito
            if (!userListed && this.token) {
                console.log('🔍 Obteniendo repositorios del usuario autenticado...');
                const selfResp = await this.makeRequest(`/user/repos?per_page=100&sort=updated&direction=desc`);
                if (Array.isArray(selfResp)) {
                    addUnique(mapRepos(selfResp));
                }
            }

            if (combined.length === 0) {
                throw new Error('No se pudieron obtener repositorios (org y usuario fallaron)');
            }

            this.repos = combined;

            console.log(`✅ Se encontraron ${this.repos.length} repositorios`);
            return this.repos;

        } catch (error) {
            console.error(`❌ Error obteniendo repositorios: ${error.message}`);
            throw error;
        }
    }

    /**
     * Genera un archivo README con la lista de repositorios
     */
    generateRepositoriesList() {
        const owner = this.scope === 'user' && this.username ? this.username : this.organization;
        const ownerUrl = owner ? `https://github.com/${owner}` : 'https://github.com';
        const ownerLabel = this.scope === 'user' ? 'Usuario' : 'Organización';
        const displayName = owner || 'GitHub';

        const readmeContent = `# 📚 Repositorios de ${displayName}

> Lista de repositorios en [${displayName}](${ownerUrl})

## 🏢 ${ownerLabel}

**${displayName}**

- 🌐 GitHub: [${displayName}](${ownerUrl})

---

## 📋 Lista de Repositorios

${this.repos.map((repo, index) => `
### ${index + 1}. [${repo.name}](${repo.url})

- **Descripción**: ${repo.description}
- **Lenguaje**: ${repo.language}
- **Estrellas**: ⭐ ${repo.stars} | **Forks**: 🍴 ${repo.forks} | **Watchers**: 👀 ${repo.watchers}
- **Última actualización**: ${new Date(repo.updatedAt).toLocaleDateString('es-ES')}
- **Licencia**: ${repo.license}
- **Temas**: ${repo.topics.length > 0 ? repo.topics.map(topic => `\`${topic}\``).join(', ') : 'Ninguno'}
- **URL**: [${repo.url}](${repo.url})

\`\`\`bash
# Clonar repositorio
git clone ${repo.cloneUrl}
cd ${repo.name}
\`\`\`
`).join('\n')}

---

## 🔗 Enlaces Rápidos

${this.repos.map(repo => `- [${repo.name}](${repo.url})`).join('\n')}

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

## 📅 Repositorios Recientes

${this.repos
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
    .map(repo => `- [${repo.name}](${repo.url}) - ${new Date(repo.updatedAt).toLocaleDateString('es-ES')}`)
    .join('\n')}

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
- GitHub: [${displayName}](${ownerUrl})
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
            `    url = ${repo.cloneUrl}\n` +
            `    branch = ${repo.defaultBranch}`
        ).join('\n\n');

        return `# =============================================================================
# GIT SUBMODULES - REPOSITORIES
# =============================================================================
# Configuración automática de submódulos para todos los repositorios
# de la organización o usuario configurado
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
# git submodule add <repo_url>
# =============================================================================
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
     * Genera un script para clonar todos los repositorios
     */
    generateCloneScript() {
        const cloneCommands = this.repos.map(repo => 
            `echo "📁 Clonando ${repo.name}..."\n` +
            `git clone ${repo.cloneUrl}\n` +
            `cd ${repo.name}\n` +
            `echo "✅ ${repo.name} clonado exitosamente"\n` +
            `cd ..\n`
        ).join('\n');

        return `#!/bin/bash

# =============================================================================
# CLONE ALL REPOSITORIES - PANACEA ICONO SA
# =============================================================================
# Script para clonar todos los repositorios del propietario configurado
# =============================================================================

set -e

echo "🚀 Iniciando clonación de repositorios de Panacea Icono SA..."
echo "📊 Total de repositorios: ${this.repos.length}"
echo ""

# Crear directorio para repositorios
mkdir -p owner-repos
cd owner-repos

${cloneCommands}

echo ""
echo "🎉 ¡Todos los repositorios han sido clonados exitosamente!"
echo "📁 Ubicación: $(pwd)"
echo "📊 Total clonados: ${this.repos.length}"
`;
    }

    /**
     * Ejecuta el proceso completo
     */
    async run() {
        try {
            console.log('🌐 GitHub Repositories Manager - Panacea Icono SA');
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
    const manager = new GitHubReposManager();
    const command = process.argv[2];

    switch (command) {
        case 'list':
            manager.run();
            break;

        case 'json':
            manager.fetchRepositories().then(() => {
                console.log(JSON.stringify(manager.generateJSONOutput(), null, 2));
            });
            break;

        case 'submodules':
            manager.fetchRepositories().then(() => {
                console.log(manager.generateGitSubmodulesConfig());
            });
            break;

        case 'clone':
            manager.fetchRepositories().then(() => {
                console.log(manager.generateCloneScript());
            });
            break;

        default:
            console.log(`
🌐 GitHub Repositories Manager - Panacea Icono SA

Uso: node github-repos-manager.js <comando>

Comandos disponibles:
  list        Genera archivos completos (README, JSON, submódulos, script)
  json        Muestra solo el JSON con información de repositorios
  submodules  Muestra solo la configuración de submódulos
  clone       Muestra solo el script de clonación

Ejemplos:
  node github-repos-manager.js list
  node github-repos-manager.js json
  node github-repos-manager.js submodules
  node github-repos-manager.js clone
            `);
    }
}

module.exports = GitHubReposManager;
