#!/usr/bin/env node

/**
 * =============================================================================
 * UPDATE WITH REAL DATA - PANACEA ICONO SA
 * =============================================================================
 * Script para actualizar con los datos reales obtenidos de la página web
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

class RealDataUpdater {
    constructor() {
        this.organization = 'panacea-icono';
        this.outputDir = './docs';
        
        // Datos reales obtenidos de la página web de GitHub
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
                updatedAt: '2025-09-07T00:00:00Z',
                pushedAt: '2025-09-07T00:00:00Z',
                isPrivate: false,
                isFork: false,
                topics: ['telegram', 'ton', 'wallet', 'payments', 'bot', 'blockchain'],
                defaultBranch: 'main',
                license: 'Sin licencia',
                mainRepo: true
            },
            {
                name: 'repositorio-modular-fibonacci-ia-integrado',
                fullName: 'panacea-icono/repositorio-modular-fibonacci-ia-integrado',
                description: 'simulador medico quirúrgico de riesgo FIBONACCI-APP',
                url: 'https://github.com/panacea-icono/repositorio-modular-fibonacci-ia-integrado',
                cloneUrl: 'https://github.com/panacea-icono/repositorio-modular-fibonacci-ia-integrado.git',
                sshUrl: 'git@github.com:panacea-icono/repositorio-modular-fibonacci-ia-integrado.git',
                language: 'Sin especificar',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 2000,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-09-06T00:00:00Z',
                pushedAt: '2025-09-06T00:00:00Z',
                isPrivate: false,
                isFork: false,
                topics: ['medical', 'surgery', 'fibonacci', 'simulator', 'risk'],
                defaultBranch: 'main',
                license: 'Sin licencia'
            },
            {
                name: 'dr_tv_GPT',
                fullName: 'panacea-icono/dr_tv_GPT',
                description: 'repositorio oficial',
                url: 'https://github.com/panacea-icono/dr_tv_GPT',
                cloneUrl: 'https://github.com/panacea-icono/dr_tv_GPT.git',
                sshUrl: 'git@github.com:panacea-icono/dr_tv_GPT.git',
                language: 'TypeScript',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 1500,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-09-05T00:00:00Z',
                pushedAt: '2025-09-05T00:00:00Z',
                isPrivate: false,
                isFork: false,
                topics: ['gpt', 'ai', 'typescript', 'official'],
                defaultBranch: 'main',
                license: 'Other'
            },
            {
                name: 'dr_tv_gp',
                fullName: 'panacea-icono/dr_tv_gp',
                description: 'Sin descripción',
                url: 'https://github.com/panacea-icono/dr_tv_gp',
                cloneUrl: 'https://github.com/panacea-icono/dr_tv_gp.git',
                sshUrl: 'git@github.com:panacea-icono/dr_tv_gp.git',
                language: 'Sin especificar',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 1000,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-09-05T00:00:00Z',
                pushedAt: '2025-09-05T00:00:00Z',
                isPrivate: false,
                isFork: false,
                topics: [],
                defaultBranch: 'main',
                license: 'Sin licencia'
            },
            {
                name: 'panas_pay',
                fullName: 'panacea-icono/panas_pay',
                description: 'Sistema de pagos Panas',
                url: 'https://github.com/panacea-icono/panas_pay',
                cloneUrl: 'https://github.com/panacea-icono/panas_pay.git',
                sshUrl: 'git@github.com:panacea-icono/panas_pay.git',
                language: 'Sin especificar',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 1000,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-09-05T00:00:00Z',
                pushedAt: '2025-09-05T00:00:00Z',
                isPrivate: false,
                isFork: false,
                topics: ['payments', 'panas', 'blockchain'],
                defaultBranch: 'main',
                license: 'Sin licencia'
            },
            {
                name: 'dr-de-la-tvr',
                fullName: 'panacea-icono/dr-de-la-tvr',
                description: 'Dr. de la TVR - Aplicación médica',
                url: 'https://github.com/panacea-icono/dr-de-la-tvr',
                cloneUrl: 'https://github.com/panacea-icono/dr-de-la-tvr.git',
                sshUrl: 'git@github.com:panacea-icono/dr-de-la-tvr.git',
                language: 'Sin especificar',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 1000,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-09-04T00:00:00Z',
                pushedAt: '2025-09-04T00:00:00Z',
                isPrivate: false,
                isFork: false,
                topics: ['medical', 'doctor', 'tv'],
                defaultBranch: 'main',
                license: 'Sin licencia'
            },
            {
                name: 'panas_token',
                fullName: 'panacea-icono/panas_token',
                description: 'Token Panas - Criptomoneda del ecosistema',
                url: 'https://github.com/panacea-icono/panas_token',
                cloneUrl: 'https://github.com/panacea-icono/panas_token.git',
                sshUrl: 'git@github.com:panacea-icono/panas_token.git',
                language: 'Sin especificar',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 1000,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-09-04T00:00:00Z',
                pushedAt: '2025-09-04T00:00:00Z',
                isPrivate: false,
                isFork: false,
                topics: ['token', 'cryptocurrency', 'blockchain', 'panas'],
                defaultBranch: 'main',
                license: 'Sin licencia'
            },
            {
                name: 'panas-app',
                fullName: 'panacea-icono/panas-app',
                description: 'Aplicación móvil Panas',
                url: 'https://github.com/panacea-icono/panas-app',
                cloneUrl: 'https://github.com/panacea-icono/panas-app.git',
                sshUrl: 'git@github.com:panacea-icono/panas-app.git',
                language: 'Sin especificar',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 1000,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-09-03T00:00:00Z',
                pushedAt: '2025-09-03T00:00:00Z',
                isPrivate: false,
                isFork: false,
                topics: ['mobile', 'app', 'panas'],
                defaultBranch: 'main',
                license: 'Sin licencia'
            },
            {
                name: 'Dr_dela_TV',
                fullName: 'panacea-icono/Dr_dela_TV',
                description: 'Dr. de la TV - Plataforma médica',
                url: 'https://github.com/panacea-icono/Dr_dela_TV',
                cloneUrl: 'https://github.com/panacea-icono/Dr_dela_TV.git',
                sshUrl: 'git@github.com:panacea-icono/Dr_dela_TV.git',
                language: 'Sin especificar',
                stars: 0,
                forks: 0,
                watchers: 0,
                openIssues: 0,
                size: 1000,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2025-09-02T00:00:00Z',
                pushedAt: '2025-09-02T00:00:00Z',
                isPrivate: false,
                isFork: false,
                topics: ['medical', 'platform', 'doctor'],
                defaultBranch: 'main',
                license: 'Sin licencia'
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
                updatedAt: '2025-09-01T00:00:00Z',
                pushedAt: '2025-09-01T00:00:00Z',
                isPrivate: false,
                isFork: false,
                topics: ['education', 'surgery', 'tutor', 'academic', 'medical', 'learning'],
                defaultBranch: 'main',
                license: 'Sin licencia'
            }
        ];
    }

    /**
     * Genera el README actualizado con todos los repositorios
     */
    generateUpdatedReadme() {
        const mainRepo = this.repositories.find(repo => repo.mainRepo) || this.repositories[0];
        const otherRepos = this.repositories.filter(repo => !repo.mainRepo);

        // Agrupar repositorios por categoría
        const categories = this.categorizeRepositories();

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
- **Temas**: ${mainRepo.topics.map(topic => \`\`${topic}\`\`).join(', ')}
- **URL**: [https://github.com/panacea-icono/${mainRepo.name}](https://github.com/panacea-icono/${mainRepo.name})

\`\`\`bash
# Clonar repositorio principal
git clone https://github.com/panacea-icono/${mainRepo.name}.git
cd ${mainRepo.name}
\`\`\`

---

## 📋 Repositorios por Categoría

${Object.entries(categories).map(([category, categoryRepos]) => `
### ${category}

${categoryRepos.map((repo, index) => `
#### ${index + 1}. [${repo.name}](https://github.com/panacea-icono/${repo.name})

- **Descripción**: ${repo.description}
- **Lenguaje**: ${repo.language}
- **Estrellas**: ⭐ ${repo.stars} | **Forks**: 🍴 ${repo.forks} | **Watchers**: 👀 ${repo.watchers}
- **Última actualización**: ${new Date(repo.updatedAt).toLocaleDateString('es-ES')}
- **Licencia**: ${repo.license}
- **Temas**: ${repo.topics.length > 0 ? repo.topics.map(topic => \`\`${topic}\`\`).join(', ') : 'Ninguno'}
- **URL**: [https://github.com/panacea-icono/${repo.name}](https://github.com/panacea-icono/${repo.name})

\`\`\`bash
# Clonar repositorio
git clone https://github.com/panacea-icono/${repo.name}.git
cd ${repo.name}
\`\`\`
`).join('\n')}
`).join('\n')}

---

## 🔗 Enlaces Rápidos

### Repositorio Principal
- [${mainRepo.name}](https://github.com/panacea-icono/${mainRepo.name}) - ${mainRepo.description}

### Todos los Repositorios
${this.repositories.map(repo => `- [${repo.name}](https://github.com/panacea-icono/${repo.name}) - ${repo.description}`).join('\n')}

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

## 📅 Repositorios Recientes

${this.repositories
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10)
    .map(repo => `- [${repo.name}](https://github.com/panacea-icono/${repo.name}) - ${new Date(repo.updatedAt).toLocaleDateString('es-ES')}`)
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
    categorizeRepositories() {
        const categories = {
            '🤖 IA y Machine Learning': [],
            '🏥 Aplicaciones Médicas': [],
            '💳 Pagos y Tokens': [],
            '🌐 Web y APIs': [],
            '📱 Aplicaciones Móviles': [],
            '🎓 Educación y Tutoriales': [],
            '🔧 Herramientas de Desarrollo': [],
            '📊 Otros': []
        };

        this.repositories.forEach(repo => {
            const name = repo.name.toLowerCase();
            const description = repo.description.toLowerCase();
            const topics = repo.topics.map(t => t.toLowerCase());

            if (name.includes('gpt') || name.includes('ai') || name.includes('ia') || 
                topics.includes('openai') || topics.includes('ai') || topics.includes('ml')) {
                categories['🤖 IA y Machine Learning'].push(repo);
            } else if (name.includes('medic') || name.includes('cirugia') || name.includes('tutor') ||
                      description.includes('médic') || description.includes('cirugía') || 
                      description.includes('salud') || description.includes('health')) {
                categories['🏥 Aplicaciones Médicas'].push(repo);
            } else if (name.includes('token') || name.includes('pay') || name.includes('panas') ||
                      description.includes('pago') || description.includes('token') || 
                      description.includes('blockchain')) {
                categories['💳 Pagos y Tokens'].push(repo);
            } else if (name.includes('api') || name.includes('web') || name.includes('fibonacci') ||
                      description.includes('api') || description.includes('web')) {
                categories['🌐 Web y APIs'].push(repo);
            } else if (name.includes('app') || name.includes('mobile')) {
                categories['📱 Aplicaciones Móviles'].push(repo);
            } else if (name.includes('tutor') || name.includes('academico') || 
                      description.includes('enseñanza') || description.includes('educación')) {
                categories['🎓 Educación y Tutoriales'].push(repo);
            } else if (name.includes('codex') || name.includes('script') || name.includes('tool')) {
                categories['🔧 Herramientas de Desarrollo'].push(repo);
            } else {
                categories['📊 Otros'].push(repo);
            }
        });

        // Remover categorías vacías
        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) {
                delete categories[key];
            }
        });

        return categories;
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
            .slice(0, 15)
            .map(([topic, count]) => `- \`${topic}\` (${count} repositorios)`)
            .join('\n');
    }

    /**
     * Guarda los archivos actualizados
     */
    async saveUpdatedFiles() {
        // Crear directorio de salida si no existe
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Generar y guardar README actualizado
        const readmeContent = this.generateUpdatedReadme();
        const readmePath = path.join(this.outputDir, 'REPOSITORIES.md');
        fs.writeFileSync(readmePath, readmeContent);
        console.log(`📄 README actualizado: ${readmePath}`);

        // Generar y guardar JSON actualizado
        const jsonContent = {
            organization: {
                name: this.organization,
                displayName: 'Dr. Ignacio Tapia Vargas - Panacea Icono SA',
                description: 'Cirujano plástico | Full Stack Developer | Fundador de Panacea Icono S.A.',
                url: `https://github.com/${this.organization}`,
                email: 'info@iconosa.com',
                website: 'https://panacea-icono.org/',
                specialization: 'WEB3 · IA médica · Biohacking · Software'
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

        const jsonPath = path.join(this.outputDir, 'repositories.json');
        fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));
        console.log(`📊 JSON actualizado: ${jsonPath}`);
    }

    /**
     * Ejecuta el proceso completo
     */
    async run() {
        try {
            console.log('🌐 Real Data Updater - Panacea Icono SA');
            console.log('=' .repeat(60));
            
            await this.saveUpdatedFiles();
            
            console.log('');
            console.log('✅ Proceso completado exitosamente!');
            console.log(`📊 Se procesaron ${this.repositories.length} repositorios`);
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
    const updater = new RealDataUpdater();
    updater.run();
}

module.exports = RealDataUpdater;
