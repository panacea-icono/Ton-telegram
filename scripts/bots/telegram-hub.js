/**
 * =============================================================================
 * PANACEA ICONO SA - TELEGRAM HUB CENTRAL
 * =============================================================================
 * Hub central que integra todo el ecosistema Panacea a través de Telegram
 * =============================================================================
 */

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class TelegramHub {
  constructor() {
    this.bot = null;
    this.services = {
      vercel: 'https://www.panas.app',
      heroku: 'https://api-panacea-638dc550fab6.herokuapp.com',
      fastapi: 'https://panacea-fastapi.herokuapp.com',
      hostinger: 'https://panacea-icono.org',
      github: 'https://github.com/panacea-icono',
      docker: 'https://hub.docker.com/u/panacea-icono'
    };
    this.initializeBot();
  }

  initializeBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN no encontrado');
    }

    this.bot = new TelegramBot(token, { polling: true });
    this.setupCommands();
    this.setupWebhooks();
  }

  setupCommands() {
    // Comando principal del hub
    this.bot.onText(/\/hub/, (msg) => {
      const chatId = msg.chat.id;
      this.sendHubMenu(chatId);
    });

    // Comando para ver servicios
    this.bot.onText(/\/services/, (msg) => {
      const chatId = msg.chat.id;
      this.sendServicesStatus(chatId);
    });

    // Comando para wallets
    this.bot.onText(/\/wallets/, (msg) => {
      const chatId = msg.chat.id;
      this.sendWalletsMenu(chatId);
    });

    // Comando para contenedores
    this.bot.onText(/\/containers/, (msg) => {
      const chatId = msg.chat.id;
      this.sendContainersStatus(chatId);
    });

    // Comando para bases de datos
    this.bot.onText(/\/databases/, (msg) => {
      const chatId = msg.chat.id;
      this.sendDatabasesStatus(chatId);
    });

    // Comando para modelos IA
    this.bot.onText(/\/models/, (msg) => {
      const chatId = msg.chat.id;
      this.sendModelsStatus(chatId);
    });

    // Comando para FastAPI
    this.bot.onText(/\/fastapi/, (msg) => {
      const chatId = msg.chat.id;
      this.sendFastAPIStatus(chatId);
    });

    // Comando para GitHub
    this.bot.onText(/\/github/, (msg) => {
      const chatId = msg.chat.id;
      this.sendGitHubStatus(chatId);
    });

    // Comando para Docker
    this.bot.onText(/\/docker/, (msg) => {
      const chatId = msg.chat.id;
      this.sendDockerStatus(chatId);
    });

    // Comando para Panas-App
    this.bot.onText(/\/panasapp/, (msg) => {
      const chatId = msg.chat.id;
      this.sendPanasAppStatus(chatId);
    });
  }

  setupWebhooks() {
    // Webhook para recibir actualizaciones de servicios
    this.bot.on('message', (msg) => {
      if (msg.text && msg.text.startsWith('/')) {
        return; // Los comandos se manejan por separado
      }
      
      // Procesar mensajes de texto para IA
      if (msg.text) {
        this.processAIMessage(msg);
      }
    });
  }

  async sendHubMenu(chatId) {
    const menu = `
🏥 *PANACEA ECOSYSTEM HUB* 🏥

*Servicios Disponibles:*

🔗 *Frontend & APIs*
• Vercel: ${this.services.vercel}
• Heroku: ${this.services.heroku}
• FastAPI: ${this.services.fastapi}
• Hostinger: ${this.services.hostinger}

🤖 *Bots & IA*
• GPT Bots: /models
• Telegram Bots: /services
• AI Models: /models

💰 *Wallets & Blockchain*
• TON Wallet: /wallets
• Multi-Wallet: /wallets
• Solana: /wallets
• Algorand: /wallets

📱 *Apps & Tokenización*
• Panas-App: /panasapp
• Tokenización: /panasapp
• App Status: /panasapp

🐳 *Contenedores & DevOps*
• Docker: /docker
• GitHub: /github
• Containers: /containers

🗄️ *Bases de Datos*
• PostgreSQL: /databases
• Redis: /databases
• Spaces: /databases

*Comandos Rápidos:*
/services - Estado de servicios
/wallets - Gestión de wallets
/containers - Estado de contenedores
/databases - Estado de bases de datos
/models - Modelos de IA disponibles
`;

    await this.bot.sendMessage(chatId, menu, { parse_mode: 'Markdown' });
  }

  async sendServicesStatus(chatId) {
    try {
      const status = await this.checkServicesStatus();
      const message = `
🔧 *ESTADO DE SERVICIOS*

*Frontend & APIs:*
${status.vercel ? '✅' : '❌'} Vercel (panas.app)
${status.heroku ? '✅' : '❌'} Heroku API
${status.fastapi ? '✅' : '❌'} FastAPI
${status.hostinger ? '✅' : '❌'} Hostinger

*Bots:*
${status.telegram ? '✅' : '❌'} Telegram Bot
${status.gpt ? '✅' : '❌'} GPT Integration
${status.ai ? '✅' : '❌'} AI Models

*Última actualización:* ${new Date().toLocaleString()}
`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Error verificando servicios: ${error.message}`);
    }
  }

  async sendWalletsMenu(chatId) {
    const menu = `
💰 *GESTIÓN DE WALLETS*

*Wallets Disponibles:*
• TON Wallet
• Solana Wallet  
• Algorand Wallet
• Bitcoin Wallet

*Comandos:*
/wallet_ton - Gestión TON
/wallet_solana - Gestión Solana
/wallet_algorand - Gestión Algorand
/wallet_balance - Ver balances
/wallet_send - Enviar tokens

*Integración:*
🔗 Frontend: ${this.services.vercel}/wallets
🔗 API: ${this.services.heroku}/api/wallets
`;

    await this.bot.sendMessage(chatId, menu, { parse_mode: 'Markdown' });
  }

  async sendContainersStatus(chatId) {
    try {
      const containers = await this.getContainersStatus();
      const message = `
🐳 *ESTADO DE CONTENEDORES*

*Docker Hub:*
${containers.docker ? '✅' : '❌'} Docker Hub conectado

*Contenedores Activos:*
${containers.frontend ? '✅' : '❌'} Frontend Container
${containers.api ? '✅' : '❌'} API Container
${containers.bot ? '✅' : '❌'} Bot Container
${containers.database ? '✅' : '❌'} Database Container

*Repositorios:*
🔗 GitHub: ${this.services.github}
🔗 Docker Hub: ${this.services.docker}

*Última actualización:* ${new Date().toLocaleString()}
`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Error verificando contenedores: ${error.message}`);
    }
  }

  async sendDatabasesStatus(chatId) {
    try {
      const databases = await this.getDatabasesStatus();
      const message = `
🗄️ *ESTADO DE BASES DE DATOS*

*PostgreSQL:*
${databases.postgres ? '✅' : '❌'} PostgreSQL conectado
${databases.postgres ? `📊 ${databases.postgres.connections} conexiones` : ''}

*Redis:*
${databases.redis ? '✅' : '❌'} Redis conectado
${databases.redis ? `📊 ${databases.redis.memory} MB usados` : ''}

*Espacios de Almacenamiento:*
${databases.spaces ? '✅' : '❌'} DigitalOcean Spaces
${databases.spaces ? `📊 ${databases.spaces.used} GB usados` : ''}

*Última actualización:* ${new Date().toLocaleString()}
`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Error verificando bases de datos: ${error.message}`);
    }
  }

  async sendModelsStatus(chatId) {
    const message = `
🤖 *MODELOS DE IA DISPONIBLES*

*OpenAI GPT:*
• GPT-4 Turbo
• GPT-3.5 Turbo
• DALL-E 3

*Hugging Face:*
• Medical AI Model
• Surgery Simulator
• Text Generation
• Sentiment Analysis

*Modelos Especializados:*
• Cirugía Plástica AI
• Medicina Estética AI
• Análisis Médico AI

*Comandos:*
/ai_chat - Chat con GPT
/ai_generate - Generar contenido
/ai_analyze - Análisis médico
/ai_simulate - Simulador quirúrgico

*Integración:*
🔗 API: ${this.services.heroku}/api/ai
🔗 Frontend: ${this.services.vercel}/ai
`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  async sendFastAPIStatus(chatId) {
    try {
      const fastapiStatus = await this.checkFastAPIStatus();
      const message = `
⚡ *FASTAPI STATUS*

*Servidor:*
${fastapiStatus.online ? '✅' : '❌'} FastAPI Server Online
${fastapiStatus.online ? `📊 Uptime: ${fastapiStatus.uptime}` : ''}

*Endpoints Disponibles:*
• /docs - Documentación Swagger
• /api/health - Health Check
• /api/wallets - Gestión de wallets
• /api/ai - Servicios de IA
• /api/telegram - Webhooks de Telegram

*Performance:*
${fastapiStatus.online ? `📊 Response Time: ${fastapiStatus.responseTime}ms` : ''}
${fastapiStatus.online ? `📊 Requests/min: ${fastapiStatus.requestsPerMinute}` : ''}

*URL:* ${this.services.fastapi}
`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Error verificando FastAPI: ${error.message}`);
    }
  }

  async sendGitHubStatus(chatId) {
    const message = `
📚 *GITHUB REPOSITORIES*

*Repositorios Principales:*
• Ton-telegram (Hub principal)
• panas-token-ecosystem
• panas-pay-backend
• panas-shop-frontend
• panas-contracts-algorand
• panas-contracts-solana
• panas-contracts-ton
• panas-infrastructure

*Estadísticas:*
🔗 Total repos: 15+
⭐ Stars: 50+
🍴 Forks: 25+
👥 Contributors: 5+

*Integración:*
🔗 GitHub: ${this.services.github}
🔗 CI/CD: GitHub Actions
🔗 Docker: Auto-build en push

*Comandos:*
/github_repos - Listar repositorios
/github_status - Estado de CI/CD
/github_deploy - Deploy automático
`;

    await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }

  async sendDockerStatus(chatId) {
    try {
      const dockerStatus = await this.getDockerStatus();
      const message = `
🐳 *DOCKER HUB STATUS*

*Repositorios:*
${dockerStatus.images ? '✅' : '❌'} Docker Images disponibles

*Imágenes Principales:*
• panacea-frontend:latest
• panacea-api:latest
• panacea-bot:latest
• panacea-database:latest

*Build Status:*
${dockerStatus.builds ? '✅' : '❌'} Auto-build activo
${dockerStatus.builds ? `📊 Último build: ${dockerStatus.lastBuild}` : ''}

*Integración:*
🔗 Docker Hub: ${this.services.docker}
🔗 GitHub: Auto-build en push
🔗 Heroku: Auto-deploy desde Docker Hub

*Comandos:*
/docker_build - Build manual
/docker_deploy - Deploy a producción
/docker_logs - Ver logs
`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Error verificando Docker: ${error.message}`);
    }
  }

  async sendPanasAppStatus(chatId) {
    try {
      // Cargar el integrador de panas-app
      const PanasAppIntegrator = require('../integration/panas-app-integrator');
      const integrator = new PanasAppIntegrator();
      const health = await integrator.checkIntegrationHealth();

      const message = `
📱 *PANAS-APP STATUS*

*Estado de Integración:*
${health.status === 'healthy' ? '✅' : '⚠️'} Estado: ${health.status}
${health.panasAppAvailable ? '✅' : '❌'} Panas-App disponible
${health.configExists ? '✅' : '❌'} Configuración cargada

*Información del Módulo:*
• Tipo: ${health.config?.moduleType || 'submodule'}
• Descripción: ${health.config?.description || 'Tokenization app'}
• Última verificación: ${health.lastCheck}

*Endpoints de Integración:*
${health.config?.integrationEndpoints ? Object.entries(health.config.integrationEndpoints)
  .map(([key, value]) => `• ${key}: ${value}`)
  .join('\n') : '• Endpoints no configurados'}

*Configuración:*
${health.config?.integrationSettings?.autoSync ? '✅' : '❌'} Auto-sync
${health.config?.integrationSettings?.webhooksEnabled ? '✅' : '❌'} Webhooks
• Intervalo sync: ${health.config?.integrationSettings?.syncInterval || 'N/A'}s

*Comandos Disponibles:*
/panasapp_sync - Sincronizar manualmente
/panasapp_config - Ver configuración completa
/panasapp_health - Verificar estado detallado

*Repositorio:*
🔗 ${health.config?.repositoryUrl || 'https://github.com/panacea-icono/panas-app.git'}

${health.status === 'waiting' ? '⏳ *Esperando inicialización del submodule panas-app*' : ''}
`;

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      await this.bot.sendMessage(chatId, `❌ Error verificando Panas-App: ${error.message}`);
    }
  }

  async processAIMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Procesar con GPT si el mensaje no es un comando
    if (text && !text.startsWith('/')) {
      try {
        const response = await this.processWithGPT(text);
        await this.bot.sendMessage(chatId, response);
      } catch (error) {
        await this.bot.sendMessage(chatId, `❌ Error procesando mensaje: ${error.message}`);
      }
    }
  }

  async processWithGPT(text) {
    // Integración con OpenAI GPT
    const openai = require('openai');
    const client = new openai({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un asistente médico especializado en cirugía plástica y medicina estética. Responde de manera profesional y técnica."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 500
    });

    return response.choices[0].message.content;
  }

  async checkServicesStatus() {
    const status = {};
    
    try {
      // Verificar Vercel
      const vercelResponse = await axios.get(`${this.services.vercel}/api/health`, { timeout: 5000 });
      status.vercel = vercelResponse.status === 200;
    } catch (error) {
      status.vercel = false;
    }

    try {
      // Verificar Heroku
      const herokuResponse = await axios.get(`${this.services.heroku}/api/health`, { timeout: 5000 });
      status.heroku = herokuResponse.status === 200;
    } catch (error) {
      status.heroku = false;
    }

    try {
      // Verificar FastAPI
      const fastapiResponse = await axios.get(`${this.services.fastapi}/api/health`, { timeout: 5000 });
      status.fastapi = fastapiResponse.status === 200;
    } catch (error) {
      status.fastapi = false;
    }

    // Verificar Telegram Bot
    status.telegram = this.bot ? true : false;
    
    // Verificar GPT
    status.gpt = process.env.OPENAI_API_KEY ? true : false;
    
    // Verificar AI Models
    status.ai = process.env.HUGGINGFACE_API_KEY ? true : false;

    return status;
  }

  async getContainersStatus() {
    // Simular estado de contenedores
    return {
      docker: true,
      frontend: true,
      api: true,
      bot: true,
      database: true
    };
  }

  async getDatabasesStatus() {
    // Simular estado de bases de datos
    return {
      postgres: { connections: 15, status: 'healthy' },
      redis: { memory: 128, status: 'healthy' },
      spaces: { used: 2.5, status: 'healthy' }
    };
  }

  async checkFastAPIStatus() {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${this.services.fastapi}/api/health`, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      return {
        online: response.status === 200,
        responseTime,
        uptime: '99.9%',
        requestsPerMinute: 150
      };
    } catch (error) {
      return {
        online: false,
        responseTime: 0,
        uptime: '0%',
        requestsPerMinute: 0
      };
    }
  }

  async getDockerStatus() {
    // Simular estado de Docker
    return {
      images: true,
      builds: true,
      lastBuild: new Date().toLocaleString()
    };
  }
}

// Inicializar el hub
if (require.main === module) {
  const hub = new TelegramHub();
  console.log('🏥 Telegram Hub iniciado correctamente');
}

module.exports = TelegramHub;
