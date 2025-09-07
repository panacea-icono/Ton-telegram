#!/usr/bin/env node

/**
 * =============================================================================
 * UPDATE REPOS FROM GITHUB - PANACEA ICONO SA
 * =============================================================================
 * Script para actualizar la lista de repositorios con datos reales de GitHub
 * =============================================================================
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class GitHubReposUpdater {
  constructor() {
    this.organization = process.env.GITHUB_ORG || 'panacea-icono';
    this.apiBase = 'api.github.com';
    this.token = process.env.GITHUB_TOKEN || '';
    this.outputDir = './docs';
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
          Accept: 'application/vnd.github.v3+json',
        },
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
  async fetchAllRepositories() {
    try {
      console.log(
        `🔍 Obteniendo todos los repositorios de ${this.organization}...`
      );

      let allRepos = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const url = `/orgs/${this.organization}/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc`;
        const repos = await this.makeRequest(url);

        if (!Array.isArray(repos) || repos.length === 0) {
          break;
        }

        allRepos = allRepos.concat(repos);
        console.log(`📄 Página ${page}: ${repos.length} repositorios`);

        if (repos.length < perPage) {
          break;
        }

        page++;
      }

      console.log(`✅ Total encontrados: ${allRepos.length} repositorios`);
      return allRepos;
    } catch (error) {
      console.error(`❌ Error obteniendo repositorios: ${error.message}`);
      throw error;
    }
  }

  /**
   * Procesa los repositorios y los formatea
   */
  processRepositories(repos) {
    return repos.map((repo) => ({
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
      mainRepo: repo.name === 'Ton-telegram', // Marcar como principal
    }));
  }

  /**
   * Genera el README actualizado con todos los repositorios
   */
  generateUpdatedReadme(repos) {
    const mainRepo = repos.find((repo) => repo.mainRepo) || repos[0];
    const otherRepos = repos.filter((repo) => !repo.mainRepo);

    // Agrupar repositorios por categoría
    const categories = this.categorizeRepositories(repos);

    const readmeContent = `# 📚 Repositorios de Panacea Icono SA

> Lista completa de repositorios de la organización [panacea-icono](https://github.com/panacea-icono)

## 🏢 Organización

**Dr. Ignacio Tapia Vargas** - Cirujano plástico | Full Stack Developer | Fundador de Panacea Icono S.A.

- 🌐 **GitHub**: [@panacea-icono](https://github.com/panacea-icono)
- 🌍 **Web**: https://panacea-icono.org/
- 🏥 **Vaser Center**: https://vaserlipocenter.com/
- 💼 **Bolivia Chic**: https://boliviachic.com/
- 🌟 **Universo Life**: https://universolife.com/
- 📧 **Email**: info@iconosa.com

**Especialización**: WEB3 · IA médica · Biohacking · Software

---

## 🎯 Repositorio Principal

### [${mainRepo.name}](https://github.com/panacea-icono/${mainRepo.name})

> **${mainRepo.description}**

- **Lenguaje**: ${mainRepo.language}
- **Estrellas**: ⭐ ${mainRepo.stars} | **Forks**: 🍴 ${mainRepo.forks} | **Watchers**: 👀 ${mainRepo.watchers}
- **Última actualización**: ${new Date(mainRepo.updatedAt).toLocaleDateString('es-ES')}
- **Licencia**: ${mainRepo.license}
- **Temas**: ${mainRepo.topics.map((topic) => `\`${topic}\``).join(', ')}
- **URL**: [https://github.com/panacea-icono/${mainRepo.name}](https://github.com/panacea-icono/${mainRepo.name})

\`\`\`bash
# Clonar repositorio principal
git clone https://github.com/panacea-icono/${mainRepo.name}.git
cd ${mainRepo.name}
\`\`\`

---

## 📋 Repositorios por Categoría

${Object.entries(categories)
  .map(
    ([category, categoryRepos]) => `
### ${category}

${categoryRepos
  .map(
    (repo, index) => `
#### ${index + 1}. [${repo.name}](https://github.com/panacea-icono/${repo.name})

- **Descripción**: ${repo.description}
- **Lenguaje**: ${repo.language}
- **Estrellas**: ⭐ ${repo.stars} | **Forks**: 🍴 ${repo.forks} | **Watchers**: 👀 ${repo.watchers}
- **Última actualización**: ${new Date(repo.updatedAt).toLocaleDateString('es-ES')}
- **Licencia**: ${repo.license}
- **Temas**: ${repo.topics.length > 0 ? repo.topics.map((topic) => `\`${topic}\``).join(', ') : 'Ninguno'}
- **URL**: [https://github.com/panacea-icono/${repo.name}](https://github.com/panacea-icono/${repo.name})

\`\`\`bash
# Clonar repositorio
git clone https://github.com/panacea-icono/${repo.name}.git
cd ${repo.name}
\`\`\`
`
  )
  .join('\n')}
`
  )
  .join('\n')}

---

## 🔗 Enlaces Rápidos

### Repositorio Principal
- [${mainRepo.name}](https://github.com/panacea-icono/${mainRepo.name}) - ${mainRepo.description}

### Todos los Repositorios
${repos.map((repo) => `- [${repo.name}](https://github.com/panacea-icono/${repo.name}) - ${repo.description}`).join('\n')}

---

## 📊 Estadísticas Generales

- **Total de repositorios**: ${repos.length}
- **Repositorios públicos**: ${repos.filter((r) => !r.isPrivate).length}
- **Repositorios privados**: ${repos.filter((r) => r.isPrivate).length}
- **Total de estrellas**: ${repos.reduce((sum, repo) => sum + repo.stars, 0)}
- **Total de forks**: ${repos.reduce((sum, repo) => sum + repo.forks, 0)}
- **Lenguajes más usados**: ${this.getTopLanguages(repos)}

---

## 🏷️ Temas Populares

${this.getPopularTopics(repos)}

---

## 📅 Repositorios Recientes

${repos
  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  .slice(0, 10)
  .map(
    (repo) =>
      `- [${repo.name}](https://github.com/panacea-icono/${repo.name}) - ${new Date(repo.updatedAt).toLocaleDateString('es-ES')}`
  )
  .join('\n')}

---

## 🚀 Scripts de Gestión

### Clonar Todos los Repositorios

\`\`\`bash
# Ejecutar script de clonación
./docs/clone-all-repos.sh
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
- **Web**: https://panacea-icono.org/
- **LinkedIn**: in/drtapiavargas

---

*Última actualización: ${new Date().toLocaleString('es-ES')}*

*Generado automáticamente por el script de gestión de repositorios de Panas Token Ecosystem*
`;

    return readmeContent;
  }

  /**
   * Categoriza los repositorios por tipo
   */
  categorizeRepositories(repos) {
    const categories = {
      '🤖 IA y Machine Learning': [],
      '🏥 Aplicaciones Médicas': [],
      '💳 Pagos y Tokens': [],
      '🌐 Web y APIs': [],
      '📱 Aplicaciones Móviles': [],
      '🎓 Educación y Tutoriales': [],
      '🔧 Herramientas de Desarrollo': [],
      '📊 Otros': [],
    };

    repos.forEach((repo) => {
      const name = repo.name.toLowerCase();
      const description = repo.description.toLowerCase();
      const topics = repo.topics.map((t) => t.toLowerCase());

      if (
        name.includes('gpt') ||
        name.includes('ai') ||
        name.includes('ia') ||
        topics.includes('openai') ||
        topics.includes('ai') ||
        topics.includes('ml')
      ) {
        categories['🤖 IA y Machine Learning'].push(repo);
      } else if (
        name.includes('medic') ||
        name.includes('cirugia') ||
        name.includes('tutor') ||
        description.includes('médic') ||
        description.includes('cirugía') ||
        description.includes('salud') ||
        description.includes('health')
      ) {
        categories['🏥 Aplicaciones Médicas'].push(repo);
      } else if (
        name.includes('token') ||
        name.includes('pay') ||
        name.includes('panas') ||
        description.includes('pago') ||
        description.includes('token') ||
        description.includes('blockchain')
      ) {
        categories['💳 Pagos y Tokens'].push(repo);
      } else if (
        name.includes('api') ||
        name.includes('web') ||
        name.includes('fibonacci') ||
        description.includes('api') ||
        description.includes('web')
      ) {
        categories['🌐 Web y APIs'].push(repo);
      } else if (name.includes('app') || name.includes('mobile')) {
        categories['📱 Aplicaciones Móviles'].push(repo);
      } else if (
        name.includes('tutor') ||
        name.includes('academico') ||
        description.includes('enseñanza') ||
        description.includes('educación')
      ) {
        categories['🎓 Educación y Tutoriales'].push(repo);
      } else if (
        name.includes('codex') ||
        name.includes('script') ||
        name.includes('tool')
      ) {
        categories['🔧 Herramientas de Desarrollo'].push(repo);
      } else {
        categories['📊 Otros'].push(repo);
      }
    });

    // Remover categorías vacías
    Object.keys(categories).forEach((key) => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });

    return categories;
  }

  /**
   * Obtiene los lenguajes más utilizados
   */
  getTopLanguages(repos) {
    const languages = {};
    repos.forEach((repo) => {
      if (repo.language && repo.language !== 'Sin especificar') {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    return Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang, count]) => `${lang} (${count})`)
      .join(', ');
  }

  /**
   * Obtiene los temas más populares
   */
  getPopularTopics(repos) {
    const topics = {};
    repos.forEach((repo) => {
      repo.topics.forEach((topic) => {
        topics[topic] = (topics[topic] || 0) + 1;
      });
    });

    return Object.entries(topics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([topic, count]) => `- \`${topic}\` (${count} repositorios)`)
      .join('\n');
  }

  /**
   * Guarda los archivos actualizados
   */
  async saveUpdatedFiles(repos) {
    // Crear directorio de salida si no existe
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Generar y guardar README actualizado
    const readmeContent = this.generateUpdatedReadme(repos);
    const readmePath = path.join(this.outputDir, 'REPOSITORIES.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`📄 README actualizado: ${readmePath}`);

    // Generar y guardar JSON actualizado
    const jsonContent = {
      organization: {
        name: this.organization,
        displayName: 'Dr. Ignacio Tapia Vargas - Panacea Icono SA',
        description:
          'Cirujano plástico | Full Stack Developer | Fundador de Panacea Icono S.A.',
        url: `https://github.com/${this.organization}`,
        email: 'info@iconosa.com',
        website: 'https://panacea-icono.org/',
        specialization: 'WEB3 · IA médica · Biohacking · Software',
      },
      repositories: repos,
      statistics: {
        total: repos.length,
        public: repos.filter((r) => !r.isPrivate).length,
        private: repos.filter((r) => r.isPrivate).length,
        totalStars: repos.reduce((sum, repo) => sum + repo.stars, 0),
        totalForks: repos.reduce((sum, repo) => sum + repo.forks, 0),
        totalWatchers: repos.reduce((sum, repo) => sum + repo.watchers, 0),
        languages: this.getTopLanguages(repos),
        lastUpdated: new Date().toISOString(),
      },
    };

    const jsonPath = path.join(this.outputDir, 'repositories.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
    console.log(`📊 JSON actualizado: ${jsonPath}`);
  }

  /**
   * Ejecuta el proceso completo
   */
  async run() {
    try {
      console.log('🌐 GitHub Repositories Updater - Panacea Icono SA');
      console.log('='.repeat(60));

      const rawRepos = await this.fetchAllRepositories();
      const processedRepos = this.processRepositories(rawRepos);

      await this.saveUpdatedFiles(processedRepos);

      console.log('');
      console.log('✅ Proceso completado exitosamente!');
      console.log(`📊 Se procesaron ${processedRepos.length} repositorios`);
      console.log('📁 Archivos actualizados en: ./docs/');
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
  const updater = new GitHubReposUpdater();
  updater.run();
}

module.exports = GitHubReposUpdater;
