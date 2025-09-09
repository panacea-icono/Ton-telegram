#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA TON WALLET - DEPLOYMENT VERIFICATION SCRIPT
 * =============================================================================
 * Verifica que todo esté listo para el despliegue a Vercel
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

function log(message, type = 'info') {
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} ${message}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`${description} exists`, 'success');
    return true;
  } else {
    log(`${description} missing: ${filePath}`, 'error');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log(`${description} exists`, 'success');
    return true;
  } else {
    log(`${description} missing: ${dirPath}`, 'error');
    return false;
  }
}

async function main() {
  log('🔍 Verificando configuración de despliegue...\n');
  
  let allChecksPass = true;
  
  // Verificar archivos de configuración principales
  log('📋 Archivos de configuración:');
  allChecksPass &= checkFile('vercel.json', 'Vercel configuration');
  allChecksPass &= checkFile('package.json', 'Package configuration');
  allChecksPass &= checkFile('.env.vercel.example', 'Environment variables template');
  allChecksPass &= checkFile('DEPLOYMENT.md', 'Deployment documentation');
  
  console.log();
  
  // Verificar estructura del frontend
  log('🎨 Frontend:');
  allChecksPass &= checkDirectory('frontend/dashboard', 'Frontend directory');
  allChecksPass &= checkFile('frontend/dashboard/package.json', 'Frontend package.json');
  allChecksPass &= checkFile('frontend/dashboard/public/index.html', 'Frontend index.html');
  allChecksPass &= checkFile('frontend/dashboard/public/manifest.json', 'Frontend manifest.json');
  
  console.log();
  
  // Verificar API
  log('🔧 API:');
  allChecksPass &= checkFile('api/index.js', 'Main API handler');
  
  console.log();
  
  // Verificar scripts de despliegue
  log('🚀 Scripts de despliegue:');
  allChecksPass &= checkFile('scripts/deploy/vercel-deploy.js', 'Vercel deployment script');
  
  console.log();
  
  // Verificar contenido del vercel.json
  log('⚙️ Configuración de Vercel:');
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    if (vercelConfig.name === 'panacea-ton-wallet') {
      log('Project name is correct', 'success');
    } else {
      log('Project name should be "panacea-ton-wallet"', 'warning');
    }
    
    if (vercelConfig.builds && vercelConfig.builds.length > 0) {
      log('Build configuration present', 'success');
    } else {
      log('Build configuration missing', 'error');
      allChecksPass = false;
    }
    
    if (vercelConfig.routes && vercelConfig.routes.length > 0) {
      log('Route configuration present', 'success');
    } else {
      log('Route configuration missing', 'error');
      allChecksPass = false;
    }
    
  } catch (error) {
    log(`Error reading vercel.json: ${error.message}`, 'error');
    allChecksPass = false;
  }
  
  console.log();
  
  // Test build
  log('🏗️ Build test:');
  try {
    const { execSync } = require('child_process');
    execSync('cd frontend/dashboard && npm run build', { stdio: 'pipe' });
    log('Frontend builds successfully', 'success');
  } catch (error) {
    log('Frontend build failed', 'error');
    allChecksPass = false;
  }
  
  console.log();
  
  // Test API syntax
  log('🔍 API validation:');
  try {
    const { execSync } = require('child_process');
    execSync('node -c api/index.js', { stdio: 'pipe' });
    log('API syntax is valid', 'success');
  } catch (error) {
    log(`API syntax error: ${error.message}`, 'error');
    allChecksPass = false;
  }
  
  console.log();
  
  // Resultado final
  if (allChecksPass) {
    log('🎉 ¡Todo listo para el despliegue!', 'success');
    log('\nPróximos pasos:');
    log('1. Configurar variables de entorno: cp .env.vercel.example .env.vercel');
    log('2. Editar .env.vercel con tus tokens de Vercel');
    log('3. Ejecutar: npm run vercel:deploy');
    console.log();
  } else {
    log('💥 Hay problemas que resolver antes del despliegue', 'error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}