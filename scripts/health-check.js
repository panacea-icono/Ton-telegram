#!/usr/bin/env node

/**
 * 🌐 Panas Token - Health Check Script
 * Panacea | Icono SA
 * Versión: 1.0.0
 *
 * Script para verificar la salud de todos los servicios del ecosistema
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Colores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
};

// Configuración de servicios
const services = [
  {
    name: 'Backend API',
    url: 'http://localhost:3000/health',
    timeout: 5000,
    expectedStatus: 200,
  },
  {
    name: 'Frontend Dashboard',
    url: 'http://localhost:3001',
    timeout: 5000,
    expectedStatus: 200,
  },
  {
    name: 'Database (PostgreSQL)',
    url: 'http://localhost:3000/health/database',
    timeout: 5000,
    expectedStatus: 200,
  },
  {
    name: 'Redis Cache',
    url: 'http://localhost:3000/health/redis',
    timeout: 5000,
    expectedStatus: 200,
  },
];

// Función para logging
function log(message, color = 'white') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function error(message) {
  log(`[ERROR] ${message}`, 'red');
}

function success(message) {
  log(`[SUCCESS] ${message}`, 'green');
}

function warning(message) {
  log(`[WARNING] ${message}`, 'yellow');
}

function info(message) {
  log(`[INFO] ${message}`, 'blue');
}

// Función para hacer health check de un servicio
async function checkService(service) {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(service.url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        timeout: service.timeout,
      };

      const req = client.request(options, (res) => {
        const isHealthy = res.statusCode === service.expectedStatus;
        resolve({
          name: service.name,
          url: service.url,
          status: res.statusCode,
          healthy: isHealthy,
          responseTime: Date.now() - startTime,
        });
      });

      const startTime = Date.now();

      req.on('error', (err) => {
        resolve({
          name: service.name,
          url: service.url,
          status: null,
          healthy: false,
          error: err.message,
          responseTime: Date.now() - startTime,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          name: service.name,
          url: service.url,
          status: null,
          healthy: false,
          error: 'Timeout',
          responseTime: service.timeout,
        });
      });

      req.end();
    } catch (err) {
      resolve({
        name: service.name,
        url: service.url,
        status: null,
        healthy: false,
        error: err.message,
        responseTime: 0,
      });
    }
  });
}

// Función para verificar conectividad de red
async function checkNetworkConnectivity() {
  const testUrls = [
    'https://toncenter.com/api/v2/jsonRPC',
    'https://api.mainnet-beta.solana.com',
    'https://mainnet-api.algonode.cloud',
    'https://bsc-dataseed.binance.org',
  ];

  info('Verificando conectividad de red...');

  const results = [];
  for (const url of testUrls) {
    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const result = await new Promise((resolve) => {
        const req = client.request(url, { timeout: 10000 }, (res) => {
          resolve({
            url: url,
            status: res.statusCode,
            healthy: res.statusCode >= 200 && res.statusCode < 300,
          });
        });

        req.on('error', () => {
          resolve({
            url: url,
            status: null,
            healthy: false,
          });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({
            url: url,
            status: null,
            healthy: false,
          });
        });

        req.end();
      });

      results.push(result);
    } catch (err) {
      results.push({
        url: url,
        status: null,
        healthy: false,
        error: err.message,
      });
    }
  }

  return results;
}

// Función para mostrar el banner
function showBanner() {
  console.log(colors.purple);
  console.log(
    '╔══════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║                    🌐 PANAS TOKEN ECOSYSTEM                 ║'
  );
  console.log(
    '║                   Panacea | Icono SA                        ║'
  );
  console.log(
    '║                    Health Check System                      ║'
  );
  console.log(
    '╚══════════════════════════════════════════════════════════════╝'
  );
  console.log(colors.reset);
}

// Función para mostrar resultados
function showResults(serviceResults, networkResults) {
  console.log(
    '\n' + colors.blue + '📊 Resultados del Health Check:' + colors.reset
  );
  console.log(
    '┌─────────────────────────┬──────────┬──────────┬─────────────┐'
  );
  console.log(
    '│ Servicio                │ Estado   │ Código   │ Tiempo (ms) │'
  );
  console.log(
    '├─────────────────────────┼──────────┼──────────┼─────────────┤'
  );

  serviceResults.forEach((result) => {
    const status = result.healthy ? '✅ Saludable' : '❌ Error';
    const code = result.status || 'N/A';
    const time = result.responseTime || 0;

    console.log(
      `│ ${result.name.padEnd(23)} │ ${status.padEnd(8)} │ ${code.toString().padEnd(8)} │ ${time.toString().padEnd(11)} │`
    );

    if (result.error) {
      console.log(
        `│ └─ Error: ${result.error.padEnd(20)} │          │          │             │`
      );
    }
  });

  console.log(
    '└─────────────────────────┴──────────┴──────────┴─────────────┘'
  );

  // Mostrar resultados de red
  console.log('\n' + colors.blue + '🌐 Conectividad de Red:' + colors.reset);
  console.log(
    '┌─────────────────────────────────────────┬──────────┬──────────┐'
  );
  console.log(
    '│ URL                                    │ Estado   │ Código   │'
  );
  console.log(
    '├─────────────────────────────────────────┼──────────┼──────────┤'
  );

  networkResults.forEach((result) => {
    const status = result.healthy ? '✅ Conectado' : '❌ Error';
    const code = result.status || 'N/A';
    const url = result.url.replace('https://', '').substring(0, 30);

    console.log(
      `│ ${url.padEnd(39)} │ ${status.padEnd(8)} │ ${code.toString().padEnd(8)} │`
    );
  });

  console.log(
    '└─────────────────────────────────────────┴──────────┴──────────┘'
  );
}

// Función para mostrar resumen
function showSummary(serviceResults, networkResults, platformIntegration = null) {
  const healthyServices = serviceResults.filter((r) => r.healthy).length;
  const totalServices = serviceResults.length;
  const healthyNetworks = networkResults.filter((r) => r.healthy).length;
  const totalNetworks = networkResults.length;

  console.log('\n' + colors.cyan + '📈 Resumen:' + colors.reset);
  console.log(`Servicios: ${healthyServices}/${totalServices} saludables`);
  console.log(`Red: ${healthyNetworks}/${totalNetworks} conectados`);
  
  if (platformIntegration) {
    console.log(`Plataformas: ${platformIntegration.connectedPlatforms}/${platformIntegration.totalPlatforms} integradas`);
  }

  const overallHealth = platformIntegration 
    ? (healthyServices + healthyNetworks + platformIntegration.connectedPlatforms) / (totalServices + totalNetworks + platformIntegration.totalPlatforms)
    : (healthyServices + healthyNetworks) / (totalServices + totalNetworks);
    
  const healthPercentage = Math.round(overallHealth * 100);

  if (healthPercentage >= 90) {
    success(`Salud general: ${healthPercentage}% - Excelente`);
  } else if (healthPercentage >= 70) {
    warning(`Salud general: ${healthPercentage}% - Bueno`);
  } else {
    error(`Salud general: ${healthPercentage}% - Necesita atención`);
  }
}

// Función para mostrar recomendaciones
function showRecommendations(serviceResults, networkResults, platformIntegration = null) {
  const unhealthyServices = serviceResults.filter((r) => !r.healthy);
  const unhealthyNetworks = networkResults.filter((r) => !r.healthy);

  if (unhealthyServices.length > 0 || unhealthyNetworks.length > 0 || (platformIntegration && platformIntegration.recommendations.length > 0)) {
    console.log('\n' + colors.yellow + '💡 Recomendaciones:' + colors.reset);

    unhealthyServices.forEach((service) => {
      console.log(`- Verificar ${service.name}: ${service.url}`);
      if (service.error) {
        console.log(`  Error: ${service.error}`);
      }
    });

    unhealthyNetworks.forEach((network) => {
      console.log(`- Verificar conectividad a: ${network.url}`);
    });

    // Agregar recomendaciones de integración de plataformas
    if (platformIntegration && platformIntegration.recommendations.length > 0) {
      console.log('\n🔗 Integración de Plataformas:');
      platformIntegration.recommendations.forEach((rec) => {
        console.log(`- ${rec.platform}: ${rec.action}`);
      });
    }

    console.log('\nComandos útiles:');
    console.log('- npm run dev (iniciar servicios)');
    console.log('- npm run docker:up (iniciar con Docker)');
    console.log('- npm run platforms:check (verificar plataformas)');
    console.log('- npm run logs (ver logs)');
  }
}

// Función para mostrar ayuda
function showHelp() {
  console.log(colors.cyan);
  console.log('🌐 Panas Token - Health Check System');
  console.log(colors.reset);
  console.log('\nUso:');
  console.log('  node scripts/health-check.js [opciones]');
  console.log('\nOpciones:');
  console.log('  --help, -h          Mostrar esta ayuda');
  console.log('  --services, -s      Solo verificar servicios locales');
  console.log('  --network, -n       Solo verificar conectividad de red');
  console.log('  --verbose, -v       Modo verbose');
  console.log('  --json, -j          Salida en formato JSON');
  console.log('\nEjemplos:');
  console.log('  node scripts/health-check.js');
  console.log('  node scripts/health-check.js --services');
  console.log('  node scripts/health-check.js --json');
}

// Función principal
async function main() {
  const args = process.argv.slice(2);

  // Procesar argumentos
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const servicesOnly = args.includes('--services') || args.includes('-s');
  const networkOnly = args.includes('--network') || args.includes('-n');
  const verbose = args.includes('--verbose') || args.includes('-v');
  const jsonOutput = args.includes('--json') || args.includes('-j');

  if (jsonOutput) {
    // Modo JSON silencioso
    const results = {
      timestamp: new Date().toISOString(),
      services: [],
      network: [],
    };

    if (!networkOnly) {
      for (const service of services) {
        const result = await checkService(service);
        results.services.push(result);
      }
    }

    if (!servicesOnly) {
      results.network = await checkNetworkConnectivity();
    }

    console.log(JSON.stringify(results, null, 2));
    return;
  }

  showBanner();

  const serviceResults = [];
  const networkResults = [];

  // Verificar servicios locales
  if (!networkOnly) {
    info('Verificando servicios locales...');
    for (const service of services) {
      const result = await checkService(service);
      serviceResults.push(result);

      if (verbose) {
        if (result.healthy) {
          success(`${result.name}: OK (${result.responseTime}ms)`);
        } else {
          error(`${result.name}: ERROR - ${result.error || 'Unknown error'}`);
        }
      }
    }
  }

  // Verificar conectividad de red
  if (!servicesOnly) {
    networkResults.push(...(await checkNetworkConnectivity()));
  }

  // Verificar integración de plataformas
  let platformIntegration = null;
  try {
    const { PlatformIntegrationOrchestrator } = require('./platform-integration-orchestrator');
    const orchestrator = new PlatformIntegrationOrchestrator();
    
    info('Verificando integración de plataformas...');
    await orchestrator.checkAllPlatforms();
    
    const report = orchestrator.generateIntegrationReport();
    platformIntegration = {
      connectedPlatforms: report.summary.connectedPlatforms,
      totalPlatforms: report.summary.totalPlatforms,
      integrationPercentage: Math.round((report.summary.connectedPlatforms / report.summary.totalPlatforms) * 100),
      recommendations: report.recommendations,
    };
    
    console.log('\n🔗 Estado de Integración de Plataformas:');
    console.log(`Plataformas conectadas: ${platformIntegration.connectedPlatforms}/${platformIntegration.totalPlatforms}`);
    
    if (platformIntegration.integrationPercentage >= 70) {
      success(`Integración: ${platformIntegration.integrationPercentage}% - Buena conectividad`);
    } else if (platformIntegration.integrationPercentage >= 50) {
      warning(`Integración: ${platformIntegration.integrationPercentage}% - Conectividad moderada`);
    } else {
      error(`Integración: ${platformIntegration.integrationPercentage}% - Baja conectividad`);
    }
  } catch (err) {
    warning(`No se pudo verificar integración de plataformas: ${err.message}`);
  }

  // Mostrar resultados
  showResults(serviceResults, networkResults);
  showSummary(serviceResults, networkResults, platformIntegration);
  showRecommendations(serviceResults, networkResults, platformIntegration);

  // Exit code basado en salud general
  const healthyServices = serviceResults.filter((r) => r.healthy).length;
  const totalServices = serviceResults.length;
  const healthyNetworks = networkResults.filter((r) => r.healthy).length;
  const totalNetworks = networkResults.length;

  const overallHealth =
    (healthyServices + healthyNetworks) / (totalServices + totalNetworks);

  if (overallHealth < 0.5) {
    process.exit(1);
  } else if (overallHealth < 0.8) {
    process.exit(2);
  } else {
    process.exit(0);
  }
}

// Ejecutar función principal
if (require.main === module) {
  main().catch((err) => {
    error(`Error fatal: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main, checkService, checkNetworkConnectivity };
