#!/usr/bin/env node

/**
 * =============================================================================
 * API INTEGRATION SCRIPT - PANACEA ICONO SA
 * =============================================================================
 * Script para integrar y probar todas las APIs de Heroku
 * =============================================================================
 */

const https = require('https');

class APIIntegration {
  constructor() {
    this.apis = {
      fibonacci: 'https://fibonacci-b33f2f33a8ad.herokuapp.com',
      kuchiuyasAlgorand:
        'https://kuchiuyas-algorand-d0bd2e62d823.herokuapp.com',
      backendDeveloper: 'https://backend-developer-d160b40c29bc.herokuapp.com',
      apiPanacea: 'https://api-panacea-638dc550fab6.herokuapp.com',
      tonTelegramOrquestador:
        'https://ton-telegram-orquestador-185e533131f8.herokuapp.com',
      kuchiuyasEmpresa: 'https://kuchiuyas-72a39bde11fc.herokuapp.com',
    };
  }

  async testAPI(url, endpoint = '/health') {
    try {
      const response = await this.makeRequest(url + endpoint);
      return {
        url: url,
        status: 'success',
        statusCode: response.statusCode,
        data: response.data,
      };
    } catch (error) {
      return {
        url: url,
        status: 'error',
        error: error.message,
      };
    }
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const req = https.request(
        {
          hostname: urlObj.hostname,
          port: urlObj.port || 443,
          path: urlObj.pathname + urlObj.search,
          method: 'GET',
          headers: {
            'User-Agent': 'Panas-Token-Ecosystem/1.0.0',
            Accept: 'application/json',
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({
                statusCode: res.statusCode,
                data: JSON.parse(data),
              });
            } catch (error) {
              resolve({
                statusCode: res.statusCode,
                data: data,
              });
            }
          });
        }
      );

      req.on('error', reject);
      req.end();
    });
  }

  async runIntegrationTests() {
    console.log('🧪 Ejecutando tests de integración de APIs...');
    console.log('='.repeat(60));

    const results = {};

    for (const [name, url] of Object.entries(this.apis)) {
      console.log(`🔍 Probando ${name}...`);
      results[name] = await this.testAPI(url);

      if (results[name].status === 'success') {
        console.log(`✅ ${name} - OK (${results[name].statusCode})`);
      } else {
        console.log(`❌ ${name} - Error: ${results[name].error}`);
      }
    }

    return results;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const integration = new APIIntegration();
  integration
    .runIntegrationTests()
    .then((results) => {
      console.log('\n📊 Resumen de resultados:');
      console.log(JSON.stringify(results, null, 2));
    })
    .catch((error) => {
      console.error('❌ Error en tests de integración:', error);
    });
}

module.exports = APIIntegration;
