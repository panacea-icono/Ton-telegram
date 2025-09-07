#!/usr/bin/env node

// Verificaciones básicas de cumplimiento con Telegram Bot Platform Terms
// - Política de privacidad presente
// - Comando /paysupport implementado
// - Cifrado seguro presente
// - TON-only flags (placeholder) cuando aplique Mini App con cripto

const fs = require('fs');

function checkFile(path, desc) {
  const ok = fs.existsSync(path);
  console.log(`${ok ? '✅' : '❌'} ${desc}: ${path}`);
  return ok;
}

function checkContains(path, needle, desc) {
  try {
    const txt = fs.readFileSync(path, 'utf8');
    const ok = txt.includes(needle);
    console.log(`${ok ? '✅' : '❌'} ${desc} en ${path} (${needle})`);
    return ok;
  } catch (_) {
    console.log(`❌ No se pudo leer ${path} para '${desc}'`);
    return false;
  }
}

async function main() {
  let ok = true;
  ok &= checkFile('docs/telegram/privacy-policy.md', 'Política de privacidad');
  ok &= checkFile(
    'docs/telegram/telegram-bot-compliance.md',
    'Checklist de cumplimiento'
  );
  ok &= checkContains(
    'frontend/telegram-bot/bot.js',
    '/paysupport',
    'Comando /paysupport'
  );
  ok &= checkContains(
    'scripts/secure-encrypt.js',
    'createCipheriv',
    'Cifrado AES-256-GCM seguro'
  );

  // Placeholder: TON-only señales (puede basarse en env/flag cuando Mini App cripto esté activa)
  // Sugerencia: usar TELEGRAM_MINIAPP_TON_ONLY=true para activar modo estricto en app.

  if (!ok) {
    process.exit(2);
  } else {
    console.log('🎉 Cumplimiento básico verificado');
  }
}

main().catch((e) => {
  console.error('❌ Error en compliance check:', e.message);
  process.exit(1);
});
