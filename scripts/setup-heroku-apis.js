#!/usr/bin/env node

/**
 * =============================================================================
 * SETUP HEROKU APIS - PANACEA ICONO SA
 * =============================================================================
 * Script para configurar e integrar todas las APIs de Heroku
 * =============================================================================
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class HerokuAPISetup {
  constructor() {
    this.herokuApps = {
      // Cuenta Personal
      personal: {
        fibonacci: {
          url: 'https://fibonacci-b33f2f33a8ad.herokuapp.com',
          app: 'fibonacci-b33f2f33a8ad',
          description: 'API Fibonacci para simulador médico',
        },
        kuchiuyasAlgorand: {
          url: 'https://kuchiuyas-algorand-d0bd2e62d823.herokuapp.com',
          app: 'kuchiuyas-algorand-d0bd2e62d823',
          description: 'Kuchiuyas con integración Algorand',
        },
        backendDeveloper: {
          url: 'https://backend-developer-d160b40c29bc.herokuapp.com',
          app: 'backend-developer-d160b40c29bc',
          description: 'Backend Developer API',
        },
        apiPanacea: {
          url: 'https://api-panacea-638dc550fab6.herokuapp.com',
          app: 'api-panacea-638dc550fab6',
          description: 'API Principal Panacea',
        },
      },
      // Cuenta Empresa
      empresa: {
        tonTelegramOrquestador: {
          url: 'https://ton-telegram-orquestador-185e533131f8.herokuapp.com',
          app: 'ton-telegram-orquestador-185e533131f8',
          description: 'Orquestador TON Telegram',
        },
        fibonacciEmpresa: {
          url: 'https://fibonacci-b33f2f33a8ad.herokuapp.com',
          app: 'fibonacci-b33f2f33a8ad',
          description: 'Fibonacci Empresa',
        },
        kuchiuyasEmpresa: {
          url: 'https://kuchiuyas-72a39bde11fc.herokuapp.com',
          app: 'kuchiuyas-72a39bde11fc',
          description: 'Kuchiuyas Empresa',
        },
      },
    };

    this.telegramConfig = {
      authToken:
        'your_telegram_auth_token_here',
      apiKey:
        'your_telegram_api_key_here',
    };

    this.sshKeys = [
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOK8SHT0XvZ7YwJb68UQU9amU3l57aNzBPWDVzRraUvR repositorios.panacea@gmail.com',
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM6RuBi2QkcWcaylOz1YXK7LKkEmnnCW+MONBMmgh9Ee repositorios.panacea@gmail.com',
    ];
  }

  /**
   * Realiza una petición HTTP
   */
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Panas-Token-Ecosystem/1.0.0',
          Accept: 'application/json',
          ...options.headers,
        },
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              statusCode: res.statusCode,
              data: jsonData,
              headers: res.headers,
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              data: data,
              headers: res.headers,
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request error: ${error.message}`));
      });

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  /**
   * Verifica el estado de una aplicación Heroku
   */
  async checkHerokuAppStatus(appUrl) {
    try {
      console.log(`🔍 Verificando estado de: ${appUrl}`);
      const response = await this.makeRequest(`${appUrl}/health`);

      if (response.statusCode === 200) {
        console.log(`✅ ${appUrl} - Activo`);
        return {
          status: 'active',
          response: response.data,
          url: appUrl,
        };
      } else {
        console.log(`⚠️ ${appUrl} - Estado: ${response.statusCode}`);
        return {
          status: 'warning',
          statusCode: response.statusCode,
          url: appUrl,
        };
      }
    } catch (error) {
      console.log(`❌ ${appUrl} - Error: ${error.message}`);
      return {
        status: 'error',
        error: error.message,
        url: appUrl,
      };
    }
  }

  /**
   * Verifica todas las aplicaciones Heroku
   */
  async checkAllHerokuApps() {
    console.log('🌐 Verificando estado de todas las aplicaciones Heroku...');
    console.log('='.repeat(60));

    const results = {
      personal: {},
      empresa: {},
    };

    // Verificar aplicaciones de cuenta personal
    console.log('\n📱 CUENTA PERSONAL:');
    for (const [key, app] of Object.entries(this.herokuApps.personal)) {
      results.personal[key] = await this.checkHerokuAppStatus(app.url);
    }

    // Verificar aplicaciones de cuenta empresa
    console.log('\n🏢 CUENTA EMPRESA:');
    for (const [key, app] of Object.entries(this.herokuApps.empresa)) {
      results.empresa[key] = await this.checkHerokuAppStatus(app.url);
    }

    return results;
  }

  /**
   * Genera configuración de Docker Compose
   */
  generateDockerCompose() {
    return `version: '3.8'

services:
  # API Principal Panacea
  api-panacea:
    image: registry.heroku.com/panacea-icono/api-panacea:latest
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
    networks:
      - panacea-network

  # Fibonacci API
  fibonacci:
    image: registry.heroku.com/panacea-icono/fibonacci:latest
    ports:
      - "3002:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_PANACEA_URL=\${API_PANACEA_URL}
    networks:
      - panacea-network

  # Kuchiuyas Algorand
  kuchiuyas-algorand:
    image: registry.heroku.com/panacea-icono/kuchiuyas-algorand:latest
    ports:
      - "3003:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - ALGORAND_RPC_URL=\${ALGORAND_RPC_URL}
    networks:
      - panacea-network

  # Backend Developer
  backend-developer:
    image: registry.heroku.com/panacea-icono/backend-developer:latest
    ports:
      - "3004:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_PANACEA_URL=\${API_PANACEA_URL}
    networks:
      - panacea-network

  # TON Telegram Orquestador
  ton-telegram-orquestador:
    image: registry.heroku.com/panacea-icono/ton-telegram-orquestador:latest
    ports:
      - "3005:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - TELEGRAM_BOT_TOKEN=\${TELEGRAM_BOT_TOKEN}
      - TON_RPC_URL=\${TON_RPC_URL}
    networks:
      - panacea-network

  # Kuchiuyas Empresa
  kuchiuyas-empresa:
    image: registry.heroku.com/panacea-icono/kuchiuyas-empresa:latest
    ports:
      - "3006:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_PANACEA_URL=\${API_PANACEA_URL}
    networks:
      - panacea-network

networks:
  panacea-network:
    driver: bridge

volumes:
  panacea-data:
    driver: local
`;
  }

  /**
   * Genera configuración de CI/CD Pipeline
   */
  generateCICDPipeline() {
    return `name: Panacea Icono CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Build Docker images
      run: |
        docker build -t panacea-icono/api-panacea .
        docker build -t panacea-icono/fibonacci ./fibonacci
        docker build -t panacea-icono/kuchiuyas-algorand ./kuchiuyas-algorand
        docker build -t panacea-icono/backend-developer ./backend-developer
        docker build -t panacea-icono/ton-telegram-orquestador ./ton-telegram-orquestador
        docker build -t panacea-icono/kuchiuyas-empresa ./kuchiuyas-empresa

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "panacea-icono"
        heroku_email: "repositorios.panacea@gmail.com"
        appdir: "."
        procfile: "web: npm start"
    
    - name: Deploy Fibonacci
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "fibonacci-b33f2f33a8ad"
        heroku_email: "repositorios.panacea@gmail.com"
        appdir: "./fibonacci"
    
    - name: Deploy Kuchiuyas Algorand
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "kuchiuyas-algorand-d0bd2e62d823"
        heroku_email: "repositorios.panacea@gmail.com"
        appdir: "./kuchiuyas-algorand"
    
    - name: Deploy Backend Developer
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "backend-developer-d160b40c29bc"
        heroku_email: "repositorios.panacea@gmail.com"
        appdir: "./backend-developer"
    
    - name: Deploy API Panacea
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "api-panacea-638dc550fab6"
        heroku_email: "repositorios.panacea@gmail.com"
        appdir: "./api-panacea"
    
    - name: Deploy TON Telegram Orquestador
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "ton-telegram-orquestador-185e533131f8"
        heroku_email: "repositorios.panacea@gmail.com"
        appdir: "./ton-telegram-orquestador"
    
    - name: Deploy Kuchiuyas Empresa
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "kuchiuyas-72a39bde11fc"
        heroku_email: "repositorios.panacea@gmail.com"
        appdir: "./kuchiuyas-empresa"

  health-check:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
    - name: Health Check API Panacea
      run: |
        curl -f https://api-panacea-638dc550fab6.herokuapp.com/health || exit 1
    
    - name: Health Check Fibonacci
      run: |
        curl -f https://fibonacci-b33f2f33a8ad.herokuapp.com/health || exit 1
    
    - name: Health Check Kuchiuyas Algorand
      run: |
        curl -f https://kuchiuyas-algorand-d0bd2e62d823.herokuapp.com/health || exit 1
    
    - name: Health Check Backend Developer
      run: |
        curl -f https://backend-developer-d160b40c29bc.herokuapp.com/health || exit 1
    
    - name: Health Check TON Telegram Orquestador
      run: |
        curl -f https://ton-telegram-orquestador-185e533131f8.herokuapp.com/health || exit 1
    
    - name: Health Check Kuchiuyas Empresa
      run: |
        curl -f https://kuchiuyas-72a39bde11fc.herokuapp.com/health || exit 1
`;
  }

  /**
   * Genera script de integración de APIs
   */
  generateAPIIntegrationScript() {
    return `#!/usr/bin/env node

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
            kuchiuyasAlgorand: 'https://kuchiuyas-algorand-d0bd2e62d823.herokuapp.com',
            backendDeveloper: 'https://backend-developer-d160b40c29bc.herokuapp.com',
            apiPanacea: 'https://api-panacea-638dc550fab6.herokuapp.com',
            tonTelegramOrquestador: 'https://ton-telegram-orquestador-185e533131f8.herokuapp.com',
            kuchiuyasEmpresa: 'https://kuchiuyas-72a39bde11fc.herokuapp.com'
        };
    }

    async testAPI(url, endpoint = '/health') {
        try {
            const response = await this.makeRequest(url + endpoint);
            return {
                url: url,
                status: 'success',
                statusCode: response.statusCode,
                data: response.data
            };
        } catch (error) {
            return {
                url: url,
                status: 'error',
                error: error.message
            };
        }
    }

    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const req = https.request({
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                path: urlObj.pathname + urlObj.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'Panas-Token-Ecosystem/1.0.0',
                    'Accept': 'application/json'
                }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({
                            statusCode: res.statusCode,
                            data: JSON.parse(data)
                        });
                    } catch (error) {
                        resolve({
                            statusCode: res.statusCode,
                            data: data
                        });
                    }
                });
            });

            req.on('error', reject);
            req.end();
        });
    }

    async runIntegrationTests() {
        console.log('🧪 Ejecutando tests de integración de APIs...');
        console.log('=' .repeat(60));

        const results = {};

        for (const [name, url] of Object.entries(this.apis)) {
            console.log(\`🔍 Probando \${name}...\`);
            results[name] = await this.testAPI(url);
            
            if (results[name].status === 'success') {
                console.log(\`✅ \${name} - OK (\${results[name].statusCode})\`);
            } else {
                console.log(\`❌ \${name} - Error: \${results[name].error}\`);
            }
        }

        return results;
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    const integration = new APIIntegration();
    integration.runIntegrationTests()
        .then(results => {
            console.log('\\n📊 Resumen de resultados:');
            console.log(JSON.stringify(results, null, 2));
        })
        .catch(error => {
            console.error('❌ Error en tests de integración:', error);
        });
}

module.exports = APIIntegration;
`;
  }

  /**
   * Guarda todos los archivos de configuración
   */
  async saveConfigurationFiles() {
    const configDir = './config';

    // Crear directorio de configuración
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Guardar Docker Compose
    const dockerCompose = this.generateDockerCompose();
    fs.writeFileSync(path.join(configDir, 'docker-compose.yml'), dockerCompose);
    console.log('🐳 Docker Compose generado: config/docker-compose.yml');

    // Guardar CI/CD Pipeline
    const cicdPipeline = this.generateCICDPipeline();
    fs.writeFileSync('.github/workflows/ci-cd.yml', cicdPipeline);
    console.log('🚀 CI/CD Pipeline generado: .github/workflows/ci-cd.yml');

    // Guardar script de integración
    const integrationScript = this.generateAPIIntegrationScript();
    fs.writeFileSync('scripts/api-integration.js', integrationScript);
    fs.chmodSync('scripts/api-integration.js', '755');
    console.log(
      '🔗 Script de integración generado: scripts/api-integration.js'
    );

    // Crear directorio .github/workflows si no existe
    if (!fs.existsSync('.github/workflows')) {
      fs.mkdirSync('.github/workflows', { recursive: true });
    }
  }

  /**
   * Genera configuración FastAPI para Docker Compose
   */
  generateFastAPIDockerService() {
    return `
  # FastAPI Backend Service
  fastapi:
    image: registry.heroku.com/panacea-icono/fastapi:latest
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - PORT=8000
      - HOST=0.0.0.0
      - HUGGINGFACE_API_KEY=\${HUGGINGFACE_API_KEY}
    networks:
      - panacea-network
    restart: unless-stopped
`;
  }

  /**
   * Genera configuración Heroku para FastAPI
   */
  generateFastAPIHerokuConfig() {
    return `
    # FastAPI Service Deploy
    - name: Deploy FastAPI Backend
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "panacea-fastapi-backend"
        heroku_email: "repositorios.panacea@gmail.com"
        appdir: "./backend/fastapi"
        procfile: "web: uvicorn main:app --host 0.0.0.0 --port \$PORT"
`;
  }

  /**
   * Ejecuta el proceso completo
   */
  async run() {
    try {
      console.log('🌐 Heroku APIs Setup - Panacea Icono SA');
      console.log('='.repeat(60));

      // Verificar estado de todas las APIs
      const statusResults = await this.checkAllHerokuApps();

      // Guardar archivos de configuración
      await this.saveConfigurationFiles();

      console.log('\n✅ Configuración completada exitosamente!');
      console.log('📁 Archivos generados:');
      console.log('  - config/docker-compose.yml');
      console.log('  - .github/workflows/ci-cd.yml');
      console.log('  - scripts/api-integration.js');
      console.log('  - env.production');

      console.log('\n🚀 Comandos disponibles:');
      console.log('  - docker-compose -f config/docker-compose.yml up');
      console.log('  - node scripts/api-integration.js');
      console.log('  - npm run deploy');
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
  const setup = new HerokuAPISetup();
  setup.run();
}

module.exports = HerokuAPISetup;
