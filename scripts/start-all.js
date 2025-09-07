#!/usr/bin/env node

/**
 * 🌐 Panas Token - Script de Inicio del Ecosistema
 * Panacea | Icono SA
 * Versión: 1.0.0
 *
 * Script para iniciar todos los servicios del ecosistema Panas Token
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// Configuración
const config = {
  services: [
    {
      name: 'Backend Router',
      path: 'backend/router',
      command: 'npm',
      args: ['run', 'dev'],
      port: 3000,
      healthCheck: '/health',
    },
    {
      name: 'Frontend Dashboard',
      path: 'frontend/dashboard',
      command: 'npm',
      args: ['run', 'dev'],
      port: 3001,
      healthCheck: '/',
    },
    {
      name: 'Telegram Bot',
      path: 'frontend/telegram-bot',
      command: 'npm',
      args: ['run', 'dev'],
      port: null,
      healthCheck: null,
    },
  ],
  timeout: 30000, // 30 segundos
  retries: 3,
};

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

// Función para verificar si un directorio existe
function directoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

// Función para verificar si package.json existe
function hasPackageJson(dirPath) {
  return fs.existsSync(path.join(dirPath, 'package.json'));
}

// Función para verificar si un puerto está en uso
function isPortInUse(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();

    server.listen(port, () => {
      server.once('close', () => {
        resolve(false);
      });
      server.close();
    });

    server.on('error', () => {
      resolve(true);
    });
  });
}

// Función para hacer health check
async function healthCheck(url, serviceName) {
  try {
    const https = require('https');
    const http = require('http');
    const { URL } = require('url');

    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    return new Promise((resolve) => {
      const req = client.request(url, { timeout: 5000 }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => resolve(false));
      req.end();
    });
  } catch (err) {
    return false;
  }
}

// Función para iniciar un servicio
async function startService(service) {
  return new Promise((resolve, reject) => {
    const servicePath = path.resolve(process.cwd(), service.path);

    // Verificar si el directorio existe
    if (!directoryExists(servicePath)) {
      warning(`Directorio no encontrado: ${service.path}`);
      resolve({ success: false, reason: 'Directory not found' });
      return;
    }

    // Verificar si tiene package.json
    if (!hasPackageJson(servicePath)) {
      warning(`package.json no encontrado en: ${service.path}`);
      resolve({ success: false, reason: 'No package.json found' });
      return;
    }

    // Verificar si el puerto está en uso
    if (service.port) {
      isPortInUse(service.port).then((inUse) => {
        if (inUse) {
          warning(`Puerto ${service.port} ya está en uso para ${service.name}`);
          resolve({ success: false, reason: 'Port in use' });
          return;
        }

        startProcess(service, servicePath, resolve, reject);
      });
    } else {
      startProcess(service, servicePath, resolve, reject);
    }
  });
}

// Función para iniciar el proceso
function startProcess(service, servicePath, resolve, reject) {
  info(`Iniciando ${service.name}...`);

  const child = spawn(service.command, service.args, {
    cwd: servicePath,
    stdio: 'pipe',
    shell: true,
  });

  let output = '';
  let errorOutput = '';

  child.stdout.on('data', (data) => {
    const message = data.toString();
    output += message;
    process.stdout.write(
      `${colors.cyan}[${service.name}]${colors.reset} ${message}`
    );
  });

  child.stderr.on('data', (data) => {
    const message = data.toString();
    errorOutput += message;
    process.stderr.write(
      `${colors.yellow}[${service.name}]${colors.reset} ${message}`
    );
  });

  child.on('close', (code) => {
    if (code === 0) {
      success(`${service.name} iniciado exitosamente`);
      resolve({ success: true, process: child, output, errorOutput });
    } else {
      error(`${service.name} falló con código ${code}`);
      resolve({
        success: false,
        reason: `Process exited with code ${code}`,
        output,
        errorOutput,
      });
    }
  });

  child.on('error', (err) => {
    error(`Error al iniciar ${service.name}: ${err.message}`);
    resolve({ success: false, reason: err.message, output, errorOutput });
  });

  // Timeout
  setTimeout(() => {
    if (!child.killed) {
      warning(`Timeout al iniciar ${service.name}`);
      child.kill();
      resolve({ success: false, reason: 'Timeout', output, errorOutput });
    }
  }, config.timeout);
}

// Función para verificar la salud de los servicios
async function checkServicesHealth(services) {
  info('Verificando salud de los servicios...');

  for (const service of services) {
    if (service.port && service.healthCheck) {
      const url = `http://localhost:${service.port}${service.healthCheck}`;
      const isHealthy = await healthCheck(url, service.name);

      if (isHealthy) {
        success(`${service.name} está saludable`);
      } else {
        warning(`${service.name} no responde en ${url}`);
      }
    }
  }
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
  console.log('║              Script de Inicio de Servicios                 ║');
  console.log(
    '╚══════════════════════════════════════════════════════════════╝'
  );
  console.log(colors.reset);
}

// Función para mostrar el estado de los servicios
function showServicesStatus(services) {
  console.log(
    '\n' + colors.blue + '📊 Estado de los Servicios:' + colors.reset
  );
  console.log(
    '┌─────────────────────────┬──────────┬──────────┬─────────────┐'
  );
  console.log(
    '│ Servicio                │ Estado   │ Puerto   │ URL         │'
  );
  console.log(
    '├─────────────────────────┼──────────┼──────────┼─────────────┤'
  );

  services.forEach((service) => {
    const status = service.success ? '✅ Activo' : '❌ Error';
    const port = service.port || 'N/A';
    const url = service.port ? `http://localhost:${service.port}` : 'N/A';

    console.log(
      `│ ${service.name.padEnd(23)} │ ${status.padEnd(8)} │ ${port.toString().padEnd(8)} │ ${url.padEnd(11)} │`
    );
  });

  console.log(
    '└─────────────────────────┴──────────┴──────────┴─────────────┘'
  );
}

// Función para mostrar ayuda
function showHelp() {
  console.log(colors.cyan);
  console.log('🌐 Panas Token - Script de Inicio del Ecosistema');
  console.log(colors.reset);
  console.log('\nUso:');
  console.log('  node scripts/start-all.js [opciones]');
  console.log('\nOpciones:');
  console.log('  --help, -h          Mostrar esta ayuda');
  console.log('  --services, -s      Listar servicios disponibles');
  console.log('  --health, -c        Solo verificar salud de servicios');
  console.log('  --verbose, -v       Modo verbose');
  console.log('\nEjemplos:');
  console.log('  node scripts/start-all.js');
  console.log('  node scripts/start-all.js --health');
  console.log('  node scripts/start-all.js --verbose');
}

// Función para listar servicios
function listServices() {
  console.log(colors.cyan);
  console.log('📋 Servicios Disponibles:');
  console.log(colors.reset);

  config.services.forEach((service, index) => {
    console.log(`${index + 1}. ${service.name}`);
    console.log(`   Ruta: ${service.path}`);
    console.log(`   Comando: ${service.command} ${service.args.join(' ')}`);
    if (service.port) {
      console.log(`   Puerto: ${service.port}`);
      console.log(`   URL: http://localhost:${service.port}`);
    }
    console.log('');
  });
}

// Función principal
async function main() {
  const args = process.argv.slice(2);

  // Procesar argumentos
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--services') || args.includes('-s')) {
    listServices();
    return;
  }

  const verbose = args.includes('--verbose') || args.includes('-v');
  const healthOnly = args.includes('--health') || args.includes('-c');

  showBanner();

  if (healthOnly) {
    await checkServicesHealth(config.services);
    return;
  }

  info('Iniciando ecosistema Panas Token...');

  // Iniciar servicios
  const results = [];
  for (const service of config.services) {
    const result = await startService(service);
    results.push({ ...service, ...result });
  }

  // Mostrar estado
  showServicesStatus(results);

  // Verificar salud después de un breve delay
  setTimeout(async () => {
    await checkServicesHealth(results);
  }, 5000);

  // Mostrar URLs útiles
  console.log('\n' + colors.green + '🔗 URLs Útiles:' + colors.reset);
  console.log('Dashboard: http://localhost:3001');
  console.log('API: http://localhost:3000');
  console.log('API Docs: http://localhost:3000/api-docs');
  console.log('Health Check: http://localhost:3000/health');

  console.log('\n' + colors.yellow + '💡 Consejos:' + colors.reset);
  console.log('- Usa Ctrl+C para detener todos los servicios');
  console.log('- Revisa los logs para debugging');
  console.log('- Configura las variables de entorno en .env');

  // Manejar señales de terminación
  process.on('SIGINT', () => {
    console.log(
      '\n' + colors.yellow + '🛑 Deteniendo servicios...' + colors.reset
    );
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log(
      '\n' + colors.yellow + '🛑 Deteniendo servicios...' + colors.reset
    );
    process.exit(0);
  });
}

// Ejecutar función principal
if (require.main === module) {
  main().catch((err) => {
    error(`Error fatal: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { main, startService, checkServicesHealth };
