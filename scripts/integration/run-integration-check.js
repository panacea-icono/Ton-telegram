#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - INTEGRATION CHECK RUNNER
 * =============================================================================
 * Script para ejecutar la verificación de integración con variables de entorno
 * =============================================================================
 */

require('dotenv').config({ path: 'env.local' });
const EcosystemIntegrator = require('./ecosystem-integrator');

async function main() {
  console.log('🔧 Cargando variables de entorno desde env.local...');
  
  // Verificar que las variables se cargaron
  const requiredVars = [
    'TELEGRAM_BOT_TOKEN',
    'VERCEL_TOKEN',
    'VERCEL_ORG_ID',
    'VERCEL_PROJECT_ID',
    'FIBONACCI_HEROKU_URL',
    'KUCHIUYAS_ALGORAND_URL',
    'BACKEND_DEVELOPER_URL',
    'API_PANACEA_URL',
    'TON_RPC_URL',
    'SOLANA_RPC_URL',
    'ALGORAND_RPC_URL',
    'BSC_RPC_URL',
    'OPENAI_API_KEY',
    'HUGGINGFACE_API_KEY'
  ];

  console.log('\n📋 Variables de entorno cargadas:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${varName}: No encontrada`);
    }
  }

  console.log('\n🚀 Ejecutando verificación de integración...');
  
  const integrator = new EcosystemIntegrator();
  await integrator.runFullIntegrationCheck();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = main;
