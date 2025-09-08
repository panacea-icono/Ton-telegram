#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - ECOSYSTEM INTEGRATOR
 * =============================================================================
 * Script para revisar y optimizar la integración completa del ecosistema
 * =============================================================================
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

class EcosystemIntegrator {
  constructor() {
    this.services = {
      vercel: 'https://www.panas.app',
      heroku: 'https://api-panacea-638dc550fab6.herokuapp.com',
      fastapi: 'https://panacea-fastapi.herokuapp.com',
      hostinger: 'https://panacea-icono.org',
      github: 'https://github.com/panacea-icono',
      docker: 'https://hub.docker.com/u/panacea-icono',
      telegram: 'https://t.me/panacea_icono_bot'
    };
    
    this.integrationStatus = {
      telegram: { status: 'unknown', details: {} },
      vercel: { status: 'unknown', details: {} },
      heroku: { status: 'unknown', details: {} },
      fastapi: { status: 'unknown', details: {} },
      hostinger: { status: 'unknown', details: {} },
      github: { status: 'unknown', details: {} },
      docker: { status: 'unknown', details: {} },
      databases: { status: 'unknown', details: {} },
      wallets: { status: 'unknown', details: {} },
      ai: { status: 'unknown', details: {} }
    };
  }

  async checkTelegramIntegration() {
    logStep('1', 'Verificando integración de Telegram...');
    
    try {
      // Verificar configuración del bot
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        this.integrationStatus.telegram.status = 'error';
        this.integrationStatus.telegram.details.error = 'Token no encontrado';
        logError('Token de Telegram no encontrado');
        return false;
      }

      // Verificar archivos de configuración
      const configFiles = [
        'scripts/bots/orchestrator.js',
        'scripts/bots/telegram-hub.js',
        'config/bots.config.json'
      ];

      let configStatus = true;
      for (const file of configFiles) {
        if (!fs.existsSync(file)) {
          logWarning(`Archivo de configuración faltante: ${file}`);
          configStatus = false;
        }
      }

      // Verificar módulos de bots
      const modules = [
        'scripts/bots/modules/ai_huggingface.js',
        'scripts/bots/modules/multi_wallet.js',
        'scripts/bots/modules/ton_wallet.js'
      ];

      let modulesStatus = true;
      for (const module of modules) {
        if (!fs.existsSync(module)) {
          logWarning(`Módulo faltante: ${module}`);
          modulesStatus = false;
        }
      }

      this.integrationStatus.telegram.status = configStatus && modulesStatus ? 'ok' : 'warning';
      this.integrationStatus.telegram.details = {
        configFiles: configStatus,
        modules: modulesStatus,
        tokenConfigured: !!botToken
      };

      if (this.integrationStatus.telegram.status === 'ok') {
        logSuccess('Integración de Telegram configurada correctamente');
      } else {
        logWarning('Integración de Telegram con problemas menores');
      }

      return true;
    } catch (error) {
      this.integrationStatus.telegram.status = 'error';
      this.integrationStatus.telegram.details.error = error.message;
      logError(`Error verificando Telegram: ${error.message}`);
      return false;
    }
  }

  async checkVercelIntegration() {
    logStep('2', 'Verificando integración de Vercel...');
    
    try {
      // Verificar archivos de configuración de Vercel
      const vercelFiles = [
        'vercel.json',
        'frontend/dashboard/vercel.json',
        'scripts/deploy/vercel-deploy.js'
      ];

      let configStatus = true;
      for (const file of vercelFiles) {
        if (!fs.existsSync(file)) {
          logWarning(`Archivo de Vercel faltante: ${file}`);
          configStatus = false;
        }
      }

      // Verificar variables de entorno de Vercel
      const vercelEnvVars = [
        'VERCEL_TOKEN',
        'VERCEL_ORG_ID',
        'VERCEL_PROJECT_ID'
      ];

      let envStatus = true;
      for (const envVar of vercelEnvVars) {
        if (!process.env[envVar]) {
          logWarning(`Variable de entorno faltante: ${envVar}`);
          envStatus = false;
        }
      }

      // Verificar frontend
      const frontendPath = 'frontend/dashboard';
      let frontendStatus = true;
      if (!fs.existsSync(frontendPath)) {
        logWarning('Directorio del frontend no encontrado');
        frontendStatus = false;
      }

      this.integrationStatus.vercel.status = configStatus && envStatus && frontendStatus ? 'ok' : 'warning';
      this.integrationStatus.vercel.details = {
        configFiles: configStatus,
        environmentVariables: envStatus,
        frontend: frontendStatus,
        url: this.services.vercel
      };

      if (this.integrationStatus.vercel.status === 'ok') {
        logSuccess('Integración de Vercel configurada correctamente');
      } else {
        logWarning('Integración de Vercel con problemas menores');
      }

      return true;
    } catch (error) {
      this.integrationStatus.vercel.status = 'error';
      this.integrationStatus.vercel.details.error = error.message;
      logError(`Error verificando Vercel: ${error.message}`);
      return false;
    }
  }

  async checkHerokuIntegration() {
    logStep('3', 'Verificando integración de Heroku...');
    
    try {
      // Verificar archivos de configuración de Heroku
      const herokuFiles = [
        'app.json',
        'Procfile',
        'scripts/setup-heroku-apis.js'
      ];

      let configStatus = true;
      for (const file of herokuFiles) {
        if (!fs.existsSync(file)) {
          logWarning(`Archivo de Heroku faltante: ${file}`);
          configStatus = false;
        }
      }

      // Verificar variables de entorno de Heroku
      const herokuEnvVars = [
        'FIBONACCI_HEROKU_URL',
        'KUCHIUYAS_ALGORAND_URL',
        'BACKEND_DEVELOPER_URL',
        'API_PANACEA_URL'
      ];

      let envStatus = true;
      for (const envVar of herokuEnvVars) {
        if (!process.env[envVar]) {
          logWarning(`Variable de entorno faltante: ${envVar}`);
          envStatus = false;
        }
      }

      // Verificar Docker para Heroku
      const dockerFiles = [
        'docker/Dockerfile',
        'docker-compose.yml',
        'docker-compose.prod.yml'
      ];

      let dockerStatus = true;
      for (const file of dockerFiles) {
        if (!fs.existsSync(file)) {
          logWarning(`Archivo de Docker faltante: ${file}`);
          dockerStatus = false;
        }
      }

      this.integrationStatus.heroku.status = configStatus && envStatus && dockerStatus ? 'ok' : 'warning';
      this.integrationStatus.heroku.details = {
        configFiles: configStatus,
        environmentVariables: envStatus,
        dockerFiles: dockerStatus,
        urls: {
          fibonacci: process.env.FIBONACCI_HEROKU_URL,
          kuchiuyas: process.env.KUCHIUYAS_ALGORAND_URL,
          backend: process.env.BACKEND_DEVELOPER_URL,
          api: process.env.API_PANACEA_URL
        }
      };

      if (this.integrationStatus.heroku.status === 'ok') {
        logSuccess('Integración de Heroku configurada correctamente');
      } else {
        logWarning('Integración de Heroku con problemas menores');
      }

      return true;
    } catch (error) {
      this.integrationStatus.heroku.status = 'error';
      this.integrationStatus.heroku.details.error = error.message;
      logError(`Error verificando Heroku: ${error.message}`);
      return false;
    }
  }

  async checkFastAPIIntegration() {
    logStep('4', 'Verificando integración de FastAPI...');
    
    try {
      // Verificar API endpoints
      const apiFiles = [
        'api/index.js',
        'api/package.json'
      ];

      let configStatus = true;
      for (const file of apiFiles) {
        if (!fs.existsSync(file)) {
          logWarning(`Archivo de API faltante: ${file}`);
          configStatus = false;
        }
      }

      // Verificar endpoints disponibles
      const endpoints = [
        '/api/health',
        '/api/ton/balance/:address',
        '/api/solana/balance/:address',
        '/api/algorand/balance/:address',
        '/api/bots/status',
        '/api/analytics'
      ];

      this.integrationStatus.fastapi.status = configStatus ? 'ok' : 'warning';
      this.integrationStatus.fastapi.details = {
        configFiles: configStatus,
        endpoints: endpoints,
        url: this.services.fastapi
      };

      if (this.integrationStatus.fastapi.status === 'ok') {
        logSuccess('Integración de FastAPI configurada correctamente');
      } else {
        logWarning('Integración de FastAPI con problemas menores');
      }

      return true;
    } catch (error) {
      this.integrationStatus.fastapi.status = 'error';
      this.integrationStatus.fastapi.details.error = error.message;
      logError(`Error verificando FastAPI: ${error.message}`);
      return false;
    }
  }

  async checkHostingerIntegration() {
    logStep('5', 'Verificando integración de Hostinger...');
    
    try {
      // Verificar configuración de Hostinger
      const hostingerFiles = [
        'scripts/hosting/deploy.js'
      ];

      let configStatus = true;
      for (const file of hostingerFiles) {
        if (!fs.existsSync(file)) {
          logWarning(`Archivo de Hostinger faltante: ${file}`);
          configStatus = false;
        }
      }

      this.integrationStatus.hostinger.status = configStatus ? 'ok' : 'warning';
      this.integrationStatus.hostinger.details = {
        configFiles: configStatus,
        url: this.services.hostinger
      };

      if (this.integrationStatus.hostinger.status === 'ok') {
        logSuccess('Integración de Hostinger configurada correctamente');
      } else {
        logWarning('Integración de Hostinger con problemas menores');
      }

      return true;
    } catch (error) {
      this.integrationStatus.hostinger.status = 'error';
      this.integrationStatus.hostinger.details.error = error.message;
      logError(`Error verificando Hostinger: ${error.message}`);
      return false;
    }
  }

  async checkGitHubIntegration() {
    logStep('6', 'Verificando integración de GitHub...');
    
    try {
      // Verificar archivos de GitHub
      const githubFiles = [
        '.github/workflows/ci-cd.yml',
        '.github/workflows/telegram-bots.yml',
        '.github/workflows/docker-build.yml',
        '.github/workflows/vercel-deploy.yml',
        '.gitmodules'
      ];

      let configStatus = true;
      for (const file of githubFiles) {
        if (!fs.existsSync(file)) {
          logWarning(`Archivo de GitHub faltante: ${file}`);
          configStatus = false;
        }
      }

      // Verificar submódulos
      let submodulesStatus = true;
      try {
        const submodulesOutput = execSync('git submodule status', { encoding: 'utf8' });
        const submodulesCount = submodulesOutput.split('\n').filter(line => line.trim()).length;
        if (submodulesCount === 0) {
          logWarning('No hay submódulos configurados');
          submodulesStatus = false;
        }
      } catch (error) {
        logWarning('Error verificando submódulos');
        submodulesStatus = false;
      }

      this.integrationStatus.github.status = configStatus && submodulesStatus ? 'ok' : 'warning';
      this.integrationStatus.github.details = {
        configFiles: configStatus,
        submodules: submodulesStatus,
        url: this.services.github
      };

      if (this.integrationStatus.github.status === 'ok') {
        logSuccess('Integración de GitHub configurada correctamente');
      } else {
        logWarning('Integración de GitHub con problemas menores');
      }

      return true;
    } catch (error) {
      this.integrationStatus.github.status = 'error';
      this.integrationStatus.github.details.error = error.message;
      logError(`Error verificando GitHub: ${error.message}`);
      return false;
    }
  }

  async checkDockerIntegration() {
    logStep('7', 'Verificando integración de Docker...');
    
    try {
      // Verificar archivos de Docker
      const dockerFiles = [
        'docker/Dockerfile',
        'docker/Dockerfile.dev',
        'docker-compose.yml',
        'docker-compose.prod.yml'
      ];

      let configStatus = true;
      for (const file of dockerFiles) {
        if (!fs.existsSync(file)) {
          logWarning(`Archivo de Docker faltante: ${file}`);
          configStatus = false;
        }
      }

      // Verificar Docker CLI
      let dockerCliStatus = true;
      try {
        execSync('docker --version', { stdio: 'pipe' });
      } catch (error) {
        logWarning('Docker CLI no disponible');
        dockerCliStatus = false;
      }

      this.integrationStatus.docker.status = configStatus && dockerCliStatus ? 'ok' : 'warning';
      this.integrationStatus.docker.details = {
        configFiles: configStatus,
        dockerCli: dockerCliStatus,
        url: this.services.docker
      };

      if (this.integrationStatus.docker.status === 'ok') {
        logSuccess('Integración de Docker configurada correctamente');
      } else {
        logWarning('Integración de Docker con problemas menores');
      }

      return true;
    } catch (error) {
      this.integrationStatus.docker.status = 'error';
      this.integrationStatus.docker.details.error = error.message;
      logError(`Error verificando Docker: ${error.message}`);
      return false;
    }
  }

  async checkDatabasesIntegration() {
    logStep('8', 'Verificando integración de bases de datos...');
    
    try {
      // Verificar variables de entorno de bases de datos
      const dbEnvVars = [
        'DATABASE_URL',
        'REDIS_URL',
        'POSTGRES_URL'
      ];

      let envStatus = true;
      for (const envVar of dbEnvVars) {
        if (!process.env[envVar]) {
          logWarning(`Variable de entorno faltante: ${envVar}`);
          envStatus = false;
        }
      }

      // Verificar configuración de Docker para bases de datos
      let dockerConfigStatus = true;
      if (fs.existsSync('docker-compose.yml')) {
        const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
        if (!dockerCompose.includes('postgres') || !dockerCompose.includes('redis')) {
          logWarning('Configuración de bases de datos en Docker incompleta');
          dockerConfigStatus = false;
        }
      }

      this.integrationStatus.databases.status = envStatus && dockerConfigStatus ? 'ok' : 'warning';
      this.integrationStatus.databases.details = {
        environmentVariables: envStatus,
        dockerConfiguration: dockerConfigStatus
      };

      if (this.integrationStatus.databases.status === 'ok') {
        logSuccess('Integración de bases de datos configurada correctamente');
      } else {
        logWarning('Integración de bases de datos con problemas menores');
      }

      return true;
    } catch (error) {
      this.integrationStatus.databases.status = 'error';
      this.integrationStatus.databases.details.error = error.message;
      logError(`Error verificando bases de datos: ${error.message}`);
      return false;
    }
  }

  async checkWalletsIntegration() {
    logStep('9', 'Verificando integración de wallets...');
    
    try {
      // Verificar módulos de wallets
      const walletModules = [
        'scripts/bots/modules/ton_wallet.js',
        'scripts/bots/modules/multi_wallet.js'
      ];

      let modulesStatus = true;
      for (const module of walletModules) {
        if (!fs.existsSync(module)) {
          logWarning(`Módulo de wallet faltante: ${module}`);
          modulesStatus = false;
        }
      }

      // Verificar variables de entorno de wallets
      const walletEnvVars = [
        'TON_RPC_URL',
        'SOLANA_RPC_URL',
        'ALGORAND_RPC_URL',
        'BSC_RPC_URL'
      ];

      let envStatus = true;
      for (const envVar of walletEnvVars) {
        if (!process.env[envVar]) {
          logWarning(`Variable de entorno faltante: ${envVar}`);
          envStatus = false;
        }
      }

      this.integrationStatus.wallets.status = modulesStatus && envStatus ? 'ok' : 'warning';
      this.integrationStatus.wallets.details = {
        modules: modulesStatus,
        environmentVariables: envStatus,
        supportedChains: ['TON', 'Solana', 'Algorand', 'BSC']
      };

      if (this.integrationStatus.wallets.status === 'ok') {
        logSuccess('Integración de wallets configurada correctamente');
      } else {
        logWarning('Integración de wallets con problemas menores');
      }

      return true;
    } catch (error) {
      this.integrationStatus.wallets.status = 'error';
      this.integrationStatus.wallets.details.error = error.message;
      logError(`Error verificando wallets: ${error.message}`);
      return false;
    }
  }

  async checkAIIntegration() {
    logStep('10', 'Verificando integración de IA...');
    
    try {
      // Verificar módulos de IA
      const aiModules = [
        'scripts/bots/modules/ai_huggingface.js'
      ];

      let modulesStatus = true;
      for (const module of aiModules) {
        if (!fs.existsSync(module)) {
          logWarning(`Módulo de IA faltante: ${module}`);
          modulesStatus = false;
        }
      }

      // Verificar variables de entorno de IA
      const aiEnvVars = [
        'OPENAI_API_KEY',
        'HUGGINGFACE_API_KEY'
      ];

      let envStatus = true;
      for (const envVar of aiEnvVars) {
        if (!process.env[envVar]) {
          logWarning(`Variable de entorno faltante: ${envVar}`);
          envStatus = false;
        }
      }

      this.integrationStatus.ai.status = modulesStatus && envStatus ? 'ok' : 'warning';
      this.integrationStatus.ai.details = {
        modules: modulesStatus,
        environmentVariables: envStatus,
        providers: ['OpenAI', 'Hugging Face']
      };

      if (this.integrationStatus.ai.status === 'ok') {
        logSuccess('Integración de IA configurada correctamente');
      } else {
        logWarning('Integración de IA con problemas menores');
      }

      return true;
    } catch (error) {
      this.integrationStatus.ai.status = 'error';
      this.integrationStatus.ai.details.error = error.message;
      logError(`Error verificando IA: ${error.message}`);
      return false;
    }
  }

  generateIntegrationReport() {
    log('\n📊 REPORTE DE INTEGRACIÓN DEL ECOSISTEMA', 'bright');
    log('=' .repeat(60), 'cyan');

    const services = [
      { name: 'Telegram', key: 'telegram', icon: '🤖' },
      { name: 'Vercel', key: 'vercel', icon: '⚡' },
      { name: 'Heroku', key: 'heroku', icon: '🚀' },
      { name: 'FastAPI', key: 'fastapi', icon: '🔧' },
      { name: 'Hostinger', key: 'hostinger', icon: '🌐' },
      { name: 'GitHub', key: 'github', icon: '📚' },
      { name: 'Docker', key: 'docker', icon: '🐳' },
      { name: 'Bases de Datos', key: 'databases', icon: '🗄️' },
      { name: 'Wallets', key: 'wallets', icon: '💰' },
      { name: 'IA', key: 'ai', icon: '🧠' }
    ];

    for (const service of services) {
      const status = this.integrationStatus[service.key];
      const statusIcon = status.status === 'ok' ? '✅' : status.status === 'warning' ? '⚠️' : '❌';
      const statusColor = status.status === 'ok' ? 'green' : status.status === 'warning' ? 'yellow' : 'red';
      
      log(`\n${service.icon} ${service.name}: ${statusIcon}`, statusColor);
      
      if (status.details) {
        for (const [key, value] of Object.entries(status.details)) {
          if (key !== 'error') {
            const valueIcon = value === true ? '✅' : value === false ? '❌' : 'ℹ️';
            log(`   ${key}: ${valueIcon} ${value}`, 'reset');
          }
        }
        
        if (status.details.error) {
          log(`   Error: ${status.details.error}`, 'red');
        }
      }
    }

    // Resumen general
    const totalServices = services.length;
    const okServices = services.filter(s => this.integrationStatus[s.key].status === 'ok').length;
    const warningServices = services.filter(s => this.integrationStatus[s.key].status === 'warning').length;
    const errorServices = services.filter(s => this.integrationStatus[s.key].status === 'error').length;

    log('\n📈 RESUMEN GENERAL:', 'bright');
    log(`✅ Servicios OK: ${okServices}/${totalServices}`, 'green');
    log(`⚠️  Servicios con advertencias: ${warningServices}/${totalServices}`, 'yellow');
    log(`❌ Servicios con errores: ${errorServices}/${totalServices}`, 'red');

    const overallStatus = errorServices === 0 ? (warningServices === 0 ? 'excelente' : 'bueno') : 'necesita atención';
    const overallColor = errorServices === 0 ? (warningServices === 0 ? 'green' : 'yellow') : 'red';
    
    log(`\n🎯 Estado general: ${overallStatus}`, overallColor);
  }

  async runFullIntegrationCheck() {
    log('🔍 INICIANDO VERIFICACIÓN COMPLETA DE INTEGRACIÓN', 'bright');
    log('=' .repeat(60), 'cyan');

    await this.checkTelegramIntegration();
    await this.checkVercelIntegration();
    await this.checkHerokuIntegration();
    await this.checkFastAPIIntegration();
    await this.checkHostingerIntegration();
    await this.checkGitHubIntegration();
    await this.checkDockerIntegration();
    await this.checkDatabasesIntegration();
    await this.checkWalletsIntegration();
    await this.checkAIIntegration();

    this.generateIntegrationReport();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const integrator = new EcosystemIntegrator();
  integrator.runFullIntegrationCheck().catch(console.error);
}

module.exports = EcosystemIntegrator;
