#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - ENVIRONMENT MANAGER
 * =============================================================================
 * Gestor de entornos de desarrollo, staging y producción
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EnvironmentManager {
  constructor() {
    this.config = this.loadConfig();
    this.currentEnv = process.env.NODE_ENV || 'development';
  }

  loadConfig() {
    return JSON.parse(
      fs.readFileSync('config/environments.config.json', 'utf8')
    );
  }

  getEnvironment(envName) {
    return this.config[envName] || this.config.development;
  }

  getCurrentEnvironment() {
    return this.getEnvironment(this.currentEnv);
  }

  listEnvironments() {
    console.log('🌍 ENVIRONMENTS AVAILABLE:');
    console.log('='.repeat(50));

    Object.keys(this.config).forEach((envName) => {
      const env = this.config[envName];
      const isCurrent = envName === this.currentEnv;
      const status = isCurrent ? '🟢 CURRENT' : '⚪';

      console.log(`\n${status} ${env.name.toUpperCase()}`);
      console.log(`   Description: ${env.description}`);
      console.log(`   Frontend: ${env.urls.frontend}`);
      console.log(`   API: ${env.urls.api}`);
      console.log(`   Database: ${env.urls.database ? '✅' : '❌'}`);
      console.log(`   Redis: ${env.urls.redis ? '✅' : '❌'}`);

      console.log(`   Services:`);
      Object.entries(env.services).forEach(([service, config]) => {
        const status = config.enabled ? '✅' : '❌';
        console.log(
          `     ${service}: ${status} ${config.enabled ? 'Enabled' : 'Disabled'}`
        );
      });

      console.log(`   Features:`);
      Object.entries(env.features).forEach(([feature, value]) => {
        const status = value ? '✅' : '❌';
        console.log(`     ${feature}: ${status}`);
      });
    });
  }

  switchEnvironment(envName) {
    if (!this.config[envName]) {
      console.error(`❌ Environment '${envName}' not found`);
      return false;
    }

    console.log(`🔄 Switching to ${envName} environment...`);

    // Actualizar variables de entorno
    this.updateEnvironmentVariables(envName);

    // Actualizar archivos de configuración
    this.updateConfigurationFiles(envName);

    // Reiniciar servicios si es necesario
    this.restartServices(envName);

    console.log(`✅ Switched to ${envName} environment`);
    return true;
  }

  updateEnvironmentVariables(envName) {
    const env = this.config[envName];

    // Crear archivo .env para el entorno específico
    const envContent = this.generateEnvContent(env);
    fs.writeFileSync(`.env.${envName}`, envContent);

    // Si es el entorno actual, copiar a .env
    if (envName === this.currentEnv) {
      fs.writeFileSync('.env', envContent);
    }

    console.log(`📝 Environment variables updated for ${envName}`);
  }

  generateEnvContent(env) {
    let content = `# =============================================================================\n`;
    content += `# PANACEA ICONO SA - ${env.name.toUpperCase()} ENVIRONMENT\n`;
    content += `# =============================================================================\n`;
    content += `# ${env.description}\n`;
    content += `# =============================================================================\n\n`;

    content += `NODE_ENV=${env.name}\n`;
    content += `ENVIRONMENT=${env.name}\n\n`;

    // URLs
    content += `# =============================================================================\n`;
    content += `# URLS\n`;
    content += `# =============================================================================\n`;
    Object.entries(env.urls).forEach(([key, value]) => {
      if (value) {
        content += `${key.toUpperCase()}_URL=${value}\n`;
      }
    });
    content += `\n`;

    // Services
    content += `# =============================================================================\n`;
    content += `# SERVICES\n`;
    content += `# =============================================================================\n`;
    Object.entries(env.services).forEach(([service, config]) => {
      content += `${service.toUpperCase()}_ENABLED=${config.enabled}\n`;
      if (config.webhook_url) {
        content += `${service.toUpperCase()}_WEBHOOK_URL=${config.webhook_url}\n`;
      }
      if (config.url) {
        content += `${service.toUpperCase()}_URL=${config.url}\n`;
      }
    });
    content += `\n`;

    // Features
    content += `# =============================================================================\n`;
    content += `# FEATURES\n`;
    content += `# =============================================================================\n`;
    Object.entries(env.features).forEach(([feature, value]) => {
      content += `${feature.toUpperCase()}=${value}\n`;
    });

    return content;
  }

  updateConfigurationFiles(envName) {
    const env = this.config[envName];

    // Actualizar vercel.json
    this.updateVercelConfig(env);

    // Actualizar docker-compose.yml
    this.updateDockerCompose(env);

    // Actualizar package.json scripts
    this.updatePackageScripts(env);

    console.log(`📁 Configuration files updated for ${envName}`);
  }

  updateVercelConfig(env) {
    const vercelConfig = {
      version: 2,
      name: `panacea-ton-wallet-${env.name}`,
      builds: [
        {
          src: 'frontend/dashboard/package.json',
          use: '@vercel/static-build',
          config: {
            distDir: 'build',
          },
        },
        {
          src: 'api/**/*.js',
          use: '@vercel/node',
        },
      ],
      routes: [
        {
          src: '/api/(.*)',
          dest: '/api/$1',
        },
        {
          src: '/(.*)',
          dest: '/frontend/dashboard/$1',
        },
      ],
      env: {
        NODE_ENV: env.name,
        REACT_APP_API_URL: env.urls.api,
        REACT_APP_ENVIRONMENT: env.name,
        REACT_APP_TON_NETWORK: env.name === 'production' ? 'mainnet' : 'testnet',
      },
      functions: {
        'api/**/*.js': {
          maxDuration: 30
        }
      },
      regions: ['iad1'],
      framework: 'create-react-app'
    };

    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  }

  updateDockerCompose(env) {
    const dockerCompose = {
      version: '3.8',
      services: {
        postgres: {
          image: 'postgres:15',
          environment: {
            POSTGRES_DB: `panas_token_${env.name}`,
            POSTGRES_USER: 'panas',
            POSTGRES_PASSWORD: 'panas_password',
          },
          ports: ['5432:5432'],
          volumes: [`postgres_data_${env.name}:/var/lib/postgresql/data`],
        },
        redis: {
          image: 'redis:7-alpine',
          ports: ['6379:6379'],
        },
        api: {
          build: './backend/router',
          ports: ['3001:3000'],
          environment: {
            NODE_ENV: env.name,
            DATABASE_URL: env.urls.database,
            REDIS_URL: env.urls.redis,
          },
          depends_on: ['postgres', 'redis'],
        },
        frontend: {
          build: './frontend/dashboard',
          ports: ['3000:3000'],
          environment: {
            REACT_APP_API_URL: env.urls.api,
            REACT_APP_ENVIRONMENT: env.name,
          },
          depends_on: ['api'],
        },
      },
      volumes: {
        [`postgres_data_${env.name}`]: {},
      },
    };

    fs.writeFileSync(
      'docker-compose.yml',
      JSON.stringify(dockerCompose, null, 2)
    );
  }

  updatePackageScripts(env) {
    const packagePath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Actualizar scripts según el entorno
    packageJson.scripts[`start:${env.name}`] = `NODE_ENV=${env.name} npm start`;
    packageJson.scripts[`dev:${env.name}`] = `NODE_ENV=${env.name} npm run dev`;
    packageJson.scripts[`build:${env.name}`] =
      `NODE_ENV=${env.name} npm run build`;

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  restartServices(envName) {
    const env = this.config[envName];

    if (env.features.hot_reload) {
      console.log(`🔄 Hot reload enabled for ${envName}, no restart needed`);
      return;
    }

    console.log(`🔄 Restarting services for ${envName}...`);

    try {
      // Detener servicios actuales
      execSync('docker-compose down', { stdio: 'inherit' });

      // Iniciar servicios con nueva configuración
      execSync('docker-compose up -d', { stdio: 'inherit' });

      console.log(`✅ Services restarted for ${envName}`);
    } catch (error) {
      console.error(`❌ Error restarting services: ${error.message}`);
    }
  }

  validateEnvironment(envName) {
    const env = this.getEnvironment(envName);
    const issues = [];

    // Validar URLs
    Object.entries(env.urls).forEach(([key, value]) => {
      if (!value) {
        issues.push(`Missing URL for ${key}`);
      }
    });

    // Validar servicios
    Object.entries(env.services).forEach(([service, config]) => {
      if (config.enabled && !config.url && !config.webhook_url) {
        issues.push(`Service ${service} is enabled but has no URL`);
      }
    });

    if (issues.length === 0) {
      console.log(`✅ Environment ${envName} is valid`);
      return true;
    } else {
      console.log(`❌ Environment ${envName} has issues:`);
      issues.forEach((issue) => console.log(`   - ${issue}`));
      return false;
    }
  }

  deployEnvironment(envName) {
    const env = this.getEnvironment(envName);

    if (!this.validateEnvironment(envName)) {
      console.error(`❌ Cannot deploy invalid environment ${envName}`);
      return false;
    }

    console.log(`🚀 Deploying ${envName} environment...`);

    try {
      // Cambiar a entorno
      this.switchEnvironment(envName);

      // Ejecutar tests
      console.log('🧪 Running tests...');
      execSync('npm test', { stdio: 'inherit' });

      // Build
      console.log('🔨 Building...');
      execSync('npm run build', { stdio: 'inherit' });

      // Deploy según el entorno
      if (envName === 'production') {
        this.deployProduction();
      } else if (envName === 'staging') {
        this.deployStaging();
      } else {
        this.deployDevelopment();
      }

      console.log(`✅ ${envName} environment deployed successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Error deploying ${envName}: ${error.message}`);
      return false;
    }
  }

  deployProduction() {
    console.log('🚀 Deploying to production...');

    // Deploy Vercel
    execSync('npm run vercel:deploy', { stdio: 'inherit' });

    // Deploy Heroku
    execSync('npm run heroku:deploy', { stdio: 'inherit' });

    // Deploy Docker
    execSync('npm run docker:deploy', { stdio: 'inherit' });
  }

  deployStaging() {
    console.log('🚀 Deploying to staging...');

    // Deploy Vercel preview
    execSync('npm run vercel:deploy:preview', { stdio: 'inherit' });

    // Deploy Heroku staging
    execSync('npm run heroku:deploy:staging', { stdio: 'inherit' });
  }

  deployDevelopment() {
    console.log('🚀 Starting development environment...');

    // Start local services
    execSync('npm run dev', { stdio: 'inherit' });
  }

  showStatus() {
    const currentEnv = this.getCurrentEnvironment();

    console.log('📊 ENVIRONMENT STATUS:');
    console.log('='.repeat(50));
    console.log(`Current Environment: ${currentEnv.name}`);
    console.log(`Description: ${currentEnv.description}`);
    console.log(`Frontend: ${currentEnv.urls.frontend}`);
    console.log(`API: ${currentEnv.urls.api}`);
    console.log(`Database: ${currentEnv.urls.database ? '✅' : '❌'}`);
    console.log(`Redis: ${currentEnv.urls.redis ? '✅' : '❌'}`);

    console.log('\nServices Status:');
    Object.entries(currentEnv.services).forEach(([service, config]) => {
      const status = config.enabled ? '✅' : '❌';
      console.log(
        `  ${service}: ${status} ${config.enabled ? 'Enabled' : 'Disabled'}`
      );
    });

    console.log('\nFeatures:');
    Object.entries(currentEnv.features).forEach(([feature, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`  ${feature}: ${status}`);
    });
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new EnvironmentManager();
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'list':
      manager.listEnvironments();
      break;
    case 'switch':
      if (arg) {
        manager.switchEnvironment(arg);
      } else {
        console.error('❌ Please specify environment name');
      }
      break;
    case 'validate':
      if (arg) {
        manager.validateEnvironment(arg);
      } else {
        manager.validateEnvironment(manager.currentEnv);
      }
      break;
    case 'deploy':
      if (arg) {
        manager.deployEnvironment(arg);
      } else {
        console.error('❌ Please specify environment name');
      }
      break;
    case 'status':
      manager.showStatus();
      break;
    default:
      console.log('🌍 Environment Manager');
      console.log('Usage:');
      console.log('  node scripts/environments/environment-manager.js list');
      console.log(
        '  node scripts/environments/environment-manager.js switch <env>'
      );
      console.log(
        '  node scripts/environments/environment-manager.js validate [env]'
      );
      console.log(
        '  node scripts/environments/environment-manager.js deploy <env>'
      );
      console.log('  node scripts/environments/environment-manager.js status');
  }
}

module.exports = EnvironmentManager;
