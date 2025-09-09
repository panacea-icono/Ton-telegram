#!/usr/bin/env node

/**
 * =============================================================================
 * PLATFORM INTEGRATION ORCHESTRATOR - PANACEA ICONO SA
 * =============================================================================
 * Orchestrador centralizado para integrar y gestionar todas las plataformas
 * del ecosistema Panas Token
 * =============================================================================
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config();
} catch (_) {
  console.warn('⚠️ dotenv no disponible, continuando sin variables de entorno');
}

class PlatformIntegrationOrchestrator {
  constructor() {
    this.platforms = {
      // Blockchain Platforms
      blockchain: {
        ton: {
          name: 'TON Blockchain',
          rpcUrl: process.env.TON_RPC_URL || 'https://toncenter.com/api/v2/jsonRPC',
          apiKey: process.env.TON_API_KEY,
          status: 'disconnected',
          health: {
            lastCheck: null,
            responseTime: null,
            isHealthy: false,
          },
        },
        solana: {
          name: 'Solana',
          rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
          status: 'disconnected',
          health: {
            lastCheck: null,
            responseTime: null,
            isHealthy: false,
          },
        },
        algorand: {
          name: 'Algorand',
          rpcUrl: process.env.ALGORAND_RPC_URL || 'https://mainnet-api.algonode.cloud',
          status: 'disconnected',
          health: {
            lastCheck: null,
            responseTime: null,
            isHealthy: false,
          },
        },
        bsc: {
          name: 'Binance Smart Chain',
          rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
          status: 'disconnected',
          health: {
            lastCheck: null,
            responseTime: null,
            isHealthy: false,
          },
        },
      },

      // Social Media Platforms
      social: {
        telegram: {
          name: 'Telegram',
          botToken: process.env.TELEGRAM_BOT_TOKEN,
          apiUrl: 'https://api.telegram.org/bot',
          status: 'disconnected',
        },
        twitter: {
          name: 'Twitter/X',
          bearerToken: process.env.TWITTER_BEARER_TOKEN,
          apiUrl: 'https://api.twitter.com/2',
          status: 'disconnected',
        },
        discord: {
          name: 'Discord',
          botToken: process.env.DISCORD_BOT_TOKEN,
          apiUrl: 'https://discord.com/api/v10',
          status: 'disconnected',
        },
        whatsapp: {
          name: 'WhatsApp Business',
          token: process.env.WHATSAPP_TOKEN,
          apiUrl: 'https://graph.facebook.com/v18.0',
          status: 'disconnected',
        },
      },

      // Cloud & Hosting Platforms
      hosting: {
        heroku: {
          name: 'Heroku',
          apiKey: process.env.HEROKU_API_KEY,
          apiUrl: 'https://api.heroku.com',
          status: 'disconnected',
          apps: [
            'fibonacci-b33f2f33a8ad',
            'kuchiuyas-algorand-d0bd2e62d823',
            'backend-developer-d160b40c29bc',
            'api-panacea-638dc550fab6',
            'ton-telegram-orquestador-185e533131f8',
            'kuchiuyas-72a39bde11fc',
          ],
        },
        vercel: {
          name: 'Vercel',
          token: process.env.VERCEL_TOKEN,
          apiUrl: 'https://api.vercel.com',
          status: 'disconnected',
        },
        huggingface: {
          name: 'Hugging Face',
          token: process.env.HUGGINGFACE_TOKEN,
          apiUrl: 'https://huggingface.co/api',
          status: 'disconnected',
        },
      },

      // AI Platforms
      ai: {
        openai: {
          name: 'OpenAI',
          apiKey: process.env.OPENAI_API_KEY,
          apiUrl: 'https://api.openai.com/v1',
          status: 'disconnected',
        },
        huggingface: {
          name: 'Hugging Face Inference',
          token: process.env.HUGGINGFACE_TOKEN,
          apiUrl: 'https://api-inference.huggingface.co',
          status: 'disconnected',
        },
      },

      // Database Platforms
      database: {
        postgresql: {
          name: 'PostgreSQL',
          url: process.env.DATABASE_URL,
          status: 'disconnected',
        },
        redis: {
          name: 'Redis',
          url: process.env.REDIS_URL,
          status: 'disconnected',
        },
        mongodb: {
          name: 'MongoDB',
          url: process.env.MONGODB_URL,
          status: 'disconnected',
        },
      },
    };

    this.integrationStats = {
      totalPlatforms: 0,
      connectedPlatforms: 0,
      failedPlatforms: 0,
      lastFullCheck: null,
    };

    this.calculateStats();
  }

  /**
   * Calcula estadísticas generales
   */
  calculateStats() {
    let total = 0;
    let connected = 0;
    let failed = 0;

    for (const category of Object.values(this.platforms)) {
      for (const platform of Object.values(category)) {
        total++;
        if (platform.status === 'connected') connected++;
        if (platform.status === 'failed') failed++;
      }
    }

    this.integrationStats = {
      totalPlatforms: total,
      connectedPlatforms: connected,
      failedPlatforms: failed,
      lastFullCheck: new Date().toISOString(),
    };
  }

  /**
   * Realiza una petición HTTP
   */
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      const startTime = Date.now();

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Panas-Token-Ecosystem/1.0.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
        timeout: options.timeout || 10000,
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const responseTime = Date.now() - startTime;
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers,
            responseTime,
          });
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }

      req.end();
    });
  }

  /**
   * Verifica conectividad de blockchain
   */
  async checkBlockchainPlatform(platformKey, platform) {
    try {
      const startTime = Date.now();
      let healthEndpoint = platform.rpcUrl;
      let options = {};

      // Configurar endpoint específico por blockchain
      switch (platformKey) {
        case 'ton':
          options.method = 'POST';
          options.body = {
            id: 1,
            jsonrpc: '2.0',
            method: 'getShards',
            params: { seqno: 1 },
          };
          break;
        case 'solana':
          options.method = 'POST';
          options.body = {
            jsonrpc: '2.0',
            id: 1,
            method: 'getHealth',
          };
          break;
        case 'algorand':
          healthEndpoint += '/health';
          break;
        case 'bsc':
          options.method = 'POST';
          options.body = {
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
            id: 1,
          };
          break;
      }

      const response = await this.makeRequest(healthEndpoint, options);
      const responseTime = Date.now() - startTime;
      const isHealthy = response.statusCode === 200;

      platform.status = isHealthy ? 'connected' : 'failed';
      platform.health = {
        lastCheck: new Date().toISOString(),
        responseTime,
        isHealthy,
        statusCode: response.statusCode,
      };

      return { success: isHealthy, responseTime, statusCode: response.statusCode };
    } catch (error) {
      platform.status = 'failed';
      platform.health = {
        lastCheck: new Date().toISOString(),
        responseTime: null,
        isHealthy: false,
        error: error.message,
      };
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifica conectividad de plataformas sociales
   */
  async checkSocialPlatform(platformKey, platform) {
    if (!platform.botToken && !platform.bearerToken && !platform.token) {
      platform.status = 'not_configured';
      return { success: false, error: 'Token no configurado' };
    }

    try {
      let healthEndpoint;
      let headers = {};

      switch (platformKey) {
        case 'telegram':
          healthEndpoint = `${platform.apiUrl}${platform.botToken}/getMe`;
          break;
        case 'twitter':
          healthEndpoint = `${platform.apiUrl}/users/me`;
          headers['Authorization'] = `Bearer ${platform.bearerToken}`;
          break;
        case 'discord':
          healthEndpoint = `${platform.apiUrl}/users/@me`;
          headers['Authorization'] = `Bot ${platform.botToken}`;
          break;
        case 'whatsapp':
          healthEndpoint = `${platform.apiUrl}/me`;
          headers['Authorization'] = `Bearer ${platform.token}`;
          break;
      }

      const response = await this.makeRequest(healthEndpoint, { headers });
      const isHealthy = response.statusCode === 200;

      platform.status = isHealthy ? 'connected' : 'failed';
      return { success: isHealthy, statusCode: response.statusCode };
    } catch (error) {
      platform.status = 'failed';
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifica conectividad de plataformas de hosting
   */
  async checkHostingPlatform(platformKey, platform) {
    if (!platform.apiKey && !platform.token) {
      platform.status = 'not_configured';
      return { success: false, error: 'Credenciales no configuradas' };
    }

    try {
      let healthEndpoint;
      let headers = {};

      switch (platformKey) {
        case 'heroku':
          healthEndpoint = `${platform.apiUrl}/account`;
          headers['Authorization'] = `Bearer ${platform.apiKey}`;
          headers['Accept'] = 'application/vnd.heroku+json; version=3';
          break;
        case 'vercel':
          healthEndpoint = `${platform.apiUrl}/v2/user`;
          headers['Authorization'] = `Bearer ${platform.token}`;
          break;
        case 'huggingface':
          healthEndpoint = `${platform.apiUrl}/whoami-v2`;
          headers['Authorization'] = `Bearer ${platform.token}`;
          break;
      }

      const response = await this.makeRequest(healthEndpoint, { headers });
      const isHealthy = response.statusCode === 200;

      platform.status = isHealthy ? 'connected' : 'failed';
      return { success: isHealthy, statusCode: response.statusCode };
    } catch (error) {
      platform.status = 'failed';
      return { success: false, error: error.message };
    }
  }

  /**
   * Ejecuta verificación completa de todas las plataformas
   */
  async checkAllPlatforms() {
    console.log('🔄 Iniciando verificación de plataformas...\n');

    const results = {
      blockchain: {},
      social: {},
      hosting: {},
      ai: {},
      database: {},
    };

    // Verificar blockchains
    console.log('⛓️ Verificando Blockchains...');
    for (const [key, platform] of Object.entries(this.platforms.blockchain)) {
      process.stdout.write(`  Verificando ${platform.name}... `);
      const result = await this.checkBlockchainPlatform(key, platform);
      results.blockchain[key] = result;
      console.log(result.success ? '✅' : '❌');
    }

    // Verificar plataformas sociales
    console.log('\n📱 Verificando Plataformas Sociales...');
    for (const [key, platform] of Object.entries(this.platforms.social)) {
      process.stdout.write(`  Verificando ${platform.name}... `);
      const result = await this.checkSocialPlatform(key, platform);
      results.social[key] = result;
      console.log(result.success ? '✅' : '❌');
    }

    // Verificar plataformas de hosting
    console.log('\n☁️ Verificando Plataformas de Hosting...');
    for (const [key, platform] of Object.entries(this.platforms.hosting)) {
      process.stdout.write(`  Verificando ${platform.name}... `);
      const result = await this.checkHostingPlatform(key, platform);
      results.hosting[key] = result;
      console.log(result.success ? '✅' : '❌');
    }

    this.calculateStats();
    return results;
  }

  /**
   * Genera reporte de integración
   */
  generateIntegrationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.integrationStats,
      platforms: {},
      recommendations: [],
    };

    // Generar reporte por categoría
    for (const [categoryName, category] of Object.entries(this.platforms)) {
      report.platforms[categoryName] = {};
      for (const [platformKey, platform] of Object.entries(category)) {
        report.platforms[categoryName][platformKey] = {
          name: platform.name,
          status: platform.status,
          health: platform.health || null,
          configured: Boolean(platform.botToken || platform.apiKey || platform.token || platform.url),
        };

        // Generar recomendaciones
        if (platform.status === 'failed') {
          report.recommendations.push({
            platform: platform.name,
            issue: 'Conexión fallida',
            action: 'Verificar credenciales y conectividad',
          });
        } else if (platform.status === 'not_configured') {
          report.recommendations.push({
            platform: platform.name,
            issue: 'No configurado',
            action: 'Configurar credenciales en variables de entorno',
          });
        }
      }
    }

    return report;
  }

  /**
   * Guarda el reporte de integración
   */
  saveIntegrationReport(report) {
    const reportsDir = path.join(process.cwd(), 'audits', 'platform-integration');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:]/g, '-');
    const reportFile = path.join(reportsDir, `platform-integration-${timestamp}.json`);
    const latestFile = path.join(reportsDir, 'platform-integration-latest.json');

    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    fs.writeFileSync(latestFile, JSON.stringify(report, null, 2));

    return reportFile;
  }

  /**
   * Muestra estadísticas en la consola
   */
  displayStats() {
    console.log('\n📊 Resumen de Integración de Plataformas:');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log(`│ Plataformas Totales:     ${this.integrationStats.totalPlatforms.toString().padStart(2)} de ${this.integrationStats.totalPlatforms}                    │`);
    console.log(`│ Plataformas Conectadas:  ${this.integrationStats.connectedPlatforms.toString().padStart(2)} de ${this.integrationStats.totalPlatforms}                    │`);
    console.log(`│ Plataformas Fallidas:    ${this.integrationStats.failedPlatforms.toString().padStart(2)} de ${this.integrationStats.totalPlatforms}                    │`);
    const percentage = Math.round((this.integrationStats.connectedPlatforms / this.integrationStats.totalPlatforms) * 100);
    console.log(`│ Porcentaje de Éxito:     ${percentage.toString().padStart(2)}%                        │`);
    console.log('└─────────────────────────────────────────────────────┘');
    
    if (percentage < 50) {
      console.log('\n⚠️ ATENCIÓN: Menos del 50% de plataformas están conectadas');
    } else if (percentage < 80) {
      console.log('\n⚠️ ADVERTENCIA: Menos del 80% de plataformas están conectadas');
    } else {
      console.log('\n✅ EXCELENTE: La mayoría de plataformas están conectadas');
    }
  }

  /**
   * Ejecuta el proceso completo de integración
   */
  async run() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║             PLATFORM INTEGRATION ORCHESTRATOR                ║');
    console.log('║                     Panacea | Icono SA                       ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');

    try {
      const results = await this.checkAllPlatforms();
      const report = this.generateIntegrationReport();
      const reportFile = this.saveIntegrationReport(report);
      
      this.displayStats();

      console.log(`\n📄 Reporte guardado en: ${reportFile}`);
      console.log('\n🔄 Para ejecutar nuevamente: npm run platforms:check');

      return report;
    } catch (error) {
      console.error('\n❌ Error durante la verificación de plataformas:', error.message);
      throw error;
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const orchestrator = new PlatformIntegrationOrchestrator();
  orchestrator.run().catch(console.error);
}

module.exports = { PlatformIntegrationOrchestrator };