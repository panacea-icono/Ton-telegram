#!/usr/bin/env node

// Auditoría de Conexiones - Verifica conectividad de red, APIs y servicios externos
// Evalúa endpoints de blockchain, APIs de terceros y servicios de hosting

try {
  require('dotenv').config();
} catch (_) {}

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuración de endpoints para verificar
const ENDPOINTS = {
  blockchains: [
    { name: 'TON Mainnet', url: 'https://toncenter.com/api/v2/getStatus', timeout: 10000 },
    { name: 'TON Testnet', url: 'https://testnet.toncenter.com/api/v2/getStatus', timeout: 10000 },
    { name: 'Solana Mainnet', url: 'https://api.mainnet-beta.solana.com', timeout: 10000 },
    { name: 'Solana Devnet', url: 'https://api.devnet.solana.com', timeout: 10000 },
    { name: 'Algorand Mainnet', url: 'https://mainnet-api.algonode.cloud/health', timeout: 10000 },
    { name: 'BSC Mainnet', url: 'https://bsc-dataseed.binance.org', timeout: 10000 },
  ],
  apis: [
    { name: 'GitHub API', url: 'https://api.github.com/rate_limit', timeout: 5000 },
    { name: 'Telegram Bot API', url: 'https://api.telegram.org/bot', timeout: 5000 },
    { name: 'CoinGecko API', url: 'https://api.coingecko.com/api/v3/ping', timeout: 5000 },
    { name: 'Vercel API', url: 'https://api.vercel.com/v1/user', timeout: 5000 },
  ],
  hosting: [
    { name: 'Vercel Edge Network', url: 'https://vercel.com', timeout: 5000 },
    { name: 'Heroku Platform', url: 'https://api.heroku.com/status', timeout: 5000 },
    { name: 'HuggingFace Hub', url: 'https://huggingface.co/api/whoami', timeout: 5000 },
  ],
};

// Función para verificar conectividad HTTP/HTTPS
function checkConnection(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const isHttps = endpoint.url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const urlObj = new URL(endpoint.url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: endpoint.timeout || 5000,
      headers: {
        'User-Agent': 'Panas-Token-Ecosystem-Audit/1.0',
        'Accept': 'application/json',
      },
    };

    const req = client.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      resolve({
        name: endpoint.name,
        status: 'success',
        code: res.statusCode,
        responseTime: responseTime,
        message: `HTTP ${res.statusCode}`,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        status: 'timeout',
        responseTime: endpoint.timeout,
        message: 'Connection timeout',
      });
    });

    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      resolve({
        name: endpoint.name,
        status: 'error',
        responseTime: responseTime,
        message: error.message,
      });
    });

    req.end();
  });
}

// Verificar variables de entorno críticas
function checkEnvironmentConnections() {
  const connections = {
    database: {
      postgres: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
      redis: Boolean(process.env.REDIS_URL),
    },
    blockchains: {
      ton: Boolean(process.env.TON_RPC_URL),
      solana: Boolean(process.env.SOLANA_RPC_URL),
      algorand: Boolean(process.env.ALGORAND_RPC_URL),
      bsc: Boolean(process.env.BSC_RPC_URL),
    },
    external: {
      github: Boolean(process.env.GITHUB_TOKEN),
      telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      vercel: Boolean(process.env.VERCEL_TOKEN),
      heroku: Boolean(process.env.HEROKU_API_KEY),
    },
  };

  return connections;
}

// Verificar puertos locales en uso
function checkLocalPorts() {
  const { spawn } = require('child_process');
  
  return new Promise((resolve) => {
    const netstat = spawn('netstat', ['-tuln'], { stdio: 'pipe' });
    let output = '';
    
    netstat.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    netstat.on('close', (code) => {
      if (code !== 0) {
        resolve({ error: 'netstat command failed' });
        return;
      }
      
      const lines = output.split('\n');
      const ports = [];
      const commonPorts = [3000, 3001, 5000, 5432, 6379, 8080, 8000, 9000];
      
      for (const line of lines) {
        for (const port of commonPorts) {
          if (line.includes(`:${port} `)) {
            ports.push(port);
          }
        }
      }
      
      resolve({ activePorts: [...new Set(ports)] });
    });
    
    netstat.on('error', () => {
      resolve({ error: 'netstat not available' });
    });
  });
}

// Función principal de auditoría
async function runConnectionsAudit() {
  const now = new Date().toISOString();
  const results = {
    timestamp: now,
    environment: checkEnvironmentConnections(),
    connectivity: {},
    localPorts: await checkLocalPorts(),
  };

  console.log('🔍 Iniciando auditoría de conexiones...');

  // Verificar conectividad por categorías
  for (const [category, endpoints] of Object.entries(ENDPOINTS)) {
    console.log(`📡 Verificando ${category}...`);
    results.connectivity[category] = [];
    
    const checks = endpoints.map(endpoint => checkConnection(endpoint));
    const categoryResults = await Promise.all(checks);
    results.connectivity[category] = categoryResults;
    
    // Mostrar resultados inmediatos
    for (const result of categoryResults) {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`  ${status} ${result.name}: ${result.message} (${result.responseTime}ms)`);
    }
  }

  return results;
}

// Generar reporte de auditoría
function generateReport(results) {
  const lines = [];
  
  lines.push(`# Auditoría de Conexiones — ${results.timestamp}`);
  lines.push('');
  
  // Resumen ejecutivo
  const totalEndpoints = Object.values(results.connectivity).reduce((sum, cat) => sum + cat.length, 0);
  const successfulConnections = Object.values(results.connectivity)
    .flat()
    .filter(r => r.status === 'success').length;
  
  lines.push('## Resumen Ejecutivo');
  lines.push(`- Total endpoints verificados: ${totalEndpoints}`);
  lines.push(`- Conexiones exitosas: ${successfulConnections}/${totalEndpoints}`);
  lines.push(`- Tasa de éxito: ${((successfulConnections / totalEndpoints) * 100).toFixed(1)}%`);
  lines.push('');

  // Variables de entorno
  lines.push('## Configuración de Conexiones');
  lines.push('### Base de Datos');
  lines.push(`- PostgreSQL: ${results.environment.database.postgres ? '✅' : '❌'}`);
  lines.push(`- Redis: ${results.environment.database.redis ? '✅' : '❌'}`);
  lines.push('');
  
  lines.push('### Blockchains');
  lines.push(`- TON: ${results.environment.blockchains.ton ? '✅' : '❌'}`);
  lines.push(`- Solana: ${results.environment.blockchains.solana ? '✅' : '❌'}`);
  lines.push(`- Algorand: ${results.environment.blockchains.algorand ? '✅' : '❌'}`);
  lines.push(`- BSC: ${results.environment.blockchains.bsc ? '✅' : '❌'}`);
  lines.push('');
  
  lines.push('### APIs Externas');
  lines.push(`- GitHub: ${results.environment.external.github ? '✅' : '❌'}`);
  lines.push(`- Telegram: ${results.environment.external.telegram ? '✅' : '❌'}`);
  lines.push(`- Vercel: ${results.environment.external.vercel ? '✅' : '❌'}`);
  lines.push(`- Heroku: ${results.environment.external.heroku ? '✅' : '❌'}`);
  lines.push('');

  // Conectividad detallada
  for (const [category, endpoints] of Object.entries(results.connectivity)) {
    lines.push(`## ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    
    for (const endpoint of endpoints) {
      const status = endpoint.status === 'success' ? '✅' : '❌';
      lines.push(`- ${status} **${endpoint.name}**: ${endpoint.message} (${endpoint.responseTime}ms)`);
    }
    lines.push('');
  }

  // Puertos locales
  lines.push('## Puertos Locales');
  if (results.localPorts.error) {
    lines.push(`- Error: ${results.localPorts.error}`);
  } else if (results.localPorts.activePorts?.length) {
    lines.push(`- Puertos activos: ${results.localPorts.activePorts.join(', ')}`);
  } else {
    lines.push('- No se detectaron puertos comunes activos');
  }
  lines.push('');

  // Recomendaciones
  lines.push('## Recomendaciones');
  
  const failedConnections = Object.values(results.connectivity)
    .flat()
    .filter(r => r.status !== 'success');
    
  if (failedConnections.length > 0) {
    lines.push('### Conexiones Fallidas');
    for (const failed of failedConnections) {
      lines.push(`- **${failed.name}**: ${failed.message}`);
    }
    lines.push('');
  }
  
  const missingEnvs = [];
  Object.entries(results.environment).forEach(([category, configs]) => {
    Object.entries(configs).forEach(([key, value]) => {
      if (!value) missingEnvs.push(`${category.toUpperCase()}_${key.toUpperCase()}`);
    });
  });
  
  if (missingEnvs.length > 0) {
    lines.push('### Variables de Entorno Faltantes');
    lines.push('Configure las siguientes variables para habilitar conexiones:');
    for (const env of missingEnvs) {
      lines.push(`- ${env}`);
    }
    lines.push('');
  }
  
  lines.push('### Acciones Sugeridas');
  lines.push('- Verificar conectividad de red si hay fallos en APIs públicas');
  lines.push('- Configurar variables de entorno faltantes según env.example');
  lines.push('- Implementar health checks automatizados para servicios críticos');
  lines.push('- Considerar timeouts y reintentos para conexiones blockchain');
  lines.push('- Documentar dependencias externas y sus SLAs');

  return lines.join('\n');
}

// Ejecutar auditoría
async function main() {
  try {
    const results = await runConnectionsAudit();
    const report = generateReport(results);
    
    // Guardar reporte
    const auditDir = path.resolve('audits');
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }
    
    const timestamp = results.timestamp.replace(/[:]/g, '');
    const filename = `connections-audit-${timestamp}.txt`;
    const filepath = path.join(auditDir, filename);
    
    fs.writeFileSync(filepath, report);
    fs.writeFileSync(path.join(auditDir, 'connections-latest.txt'), report);
    
    // Guardar datos JSON para procesamiento posterior
    const jsonFile = path.join(auditDir, `connections-audit-${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2));
    
    console.log(`\n✅ Auditoría de conexiones completada: ${filepath}`);
    
    // Mostrar resumen
    const totalEndpoints = Object.values(results.connectivity).reduce((sum, cat) => sum + cat.length, 0);
    const successfulConnections = Object.values(results.connectivity)
      .flat()
      .filter(r => r.status === 'success').length;
    
    console.log(`📊 Resumen: ${successfulConnections}/${totalEndpoints} conexiones exitosas`);
    
  } catch (error) {
    console.error('❌ Error en auditoría de conexiones:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runConnectionsAudit, generateReport };