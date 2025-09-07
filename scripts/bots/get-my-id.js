#!/usr/bin/env node

// Obtén tu ID numérico de Telegram en segundos.
// Usa un bot token (BOT_TOKEN) o toma el primero de .env.telegram.local.

try { require('dotenv').config(); } catch (_) {}
const fs = require('fs');
const path = require('path');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const map = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const l of lines) {
    const line = l.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    map[k] = v;
  }
  return map;
}

function pickAnyToken() {
  const local = path.resolve('.env.telegram.local');
  const envs = parseEnvFile(local);
  const key = Object.keys(envs).find((k) => /BOT_.*_TOKEN/.test(k));
  return key ? { key, token: envs[key] } : null;
}

async function main() {
  const explicit = process.env.BOT_TOKEN;
  let token = explicit;
  let source = explicit ? 'BOT_TOKEN' : '';
  if (!token) {
    const picked = pickAnyToken();
    if (picked) { token = picked.token; source = picked.key; }
  }
  if (!token) {
    console.error('❌ No se encontró BOT_TOKEN ni .env.telegram.local con BOT_*_TOKEN');
    console.error('   Exporta BOT_TOKEN o crea .env.telegram.local con BOT_<HANDLE>_TOKEN=...');
    process.exit(2);
  }

  const TelegramBot = require('node-telegram-bot-api');
  const bot = new TelegramBot(token, { polling: true });

  bot.getMe().then((me) => {
    console.log(`🤖 Bot @${me.username} listo (token de: ${source}).`);
    console.log('➡️  Envía un mensaje a este bot desde tu cuenta para capturar tu ID.');
    console.log('   (Puedes escribir /start o /whoami si lo tienes disponible)');
  }).catch((e) => {
    console.error('❌ Error al inicializar el bot:', e.message);
    process.exit(1);
  });

  const once = process.argv.includes('--once');

  bot.on('message', (msg) => {
    const user = msg.from || {};
    const id = user.id;
    const uname = user.username ? `@${user.username}` : '';
    console.log(`✅ Tu ID: ${id} ${uname}`.trim());
    if (once) {
      console.log('👋 Finalizando (modo --once).');
      process.exit(0);
    }
  });
}

if (require.main === module) {
  main().catch((e) => { console.error('❌', e.message); process.exit(1); });
}

module.exports = { };

