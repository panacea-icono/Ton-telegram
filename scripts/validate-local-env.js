#!/usr/bin/env node

// Valida variables críticas del entorno local (sin imprimir valores)

try { require('dotenv').config(); } catch (_) {}
const fs = require('fs');
const path = require('path');

function ok(v) { return v && String(v).trim().length > 0; }

function checkEnv(names, title) {
  const rows = names.map(n => ({ name: n, present: ok(process.env[n]) }));
  const present = rows.filter(r => r.present).length;
  console.log(`\n## ${title}: ${present}/${rows.length}`);
  for (const r of rows) console.log(`- ${r.name}: ${r.present ? '✔' : '—'}`);
}

function main() {
  console.log('# Validación de entorno local (.env.local / .env.telegram.local)');
  // Telegram básicos
  checkEnv(['TELEGRAM_OFFICIAL_CHANNEL','TELEGRAM_BOT_ADMINS'], 'Telegram (canal y admins)');

  // OpenAI global
  checkEnv(['OPENAI_API_KEY','OPENAI_MODEL'], 'OpenAI (global)');

  // Claves por proyecto (opcionales)
  checkEnv([
    'OPENAI_API_KEY_KUCHIUYAS','OPENAI_API_KEY_FIBONACCI','OPENAI_API_KEY_CODIGO',
    'OPENAI_API_KEY_HF','OPENAI_API_KEY_CIRUGIAPLASTICA'
  ], 'OpenAI por proyecto (opc)');

  // Bots: verifica al menos uno configurado
  const envLocalTelegram = path.resolve('.env.telegram.local');
  if (fs.existsSync(envLocalTelegram)) {
    const lines = fs.readFileSync(envLocalTelegram,'utf8').split(/\r?\n/).filter(l=>/BOT_.*_TOKEN=/.test(l));
    console.log(`\n## Bots (.env.telegram.local): ${lines.length > 0 ? '✔' : '—'}`);
    console.log(`- Detectados: ${lines.length}`);
  } else {
    console.log('\n## Bots (.env.telegram.local): —');
    console.log('- Archivo no encontrado');
  }

  console.log('\nSugerencia: copia config/.env.local.template → .env.local y completa valores privados.');
}

if (require.main === module) main();

module.exports = { };

