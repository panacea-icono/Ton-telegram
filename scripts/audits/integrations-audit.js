#!/usr/bin/env node

// Auditoría de integraciones: detecta variables de entorno relevantes
// y reporta estado (sin revelar secretos).

try {
  require('dotenv').config();
} catch (_) {}
const fs = require('fs');
const path = require('path');

function mask(val) {
  if (!val) return '(empty)';
  const s = String(val);
  if (s.length <= 8) return '********';
  return s.slice(0, 2) + '******' + s.slice(-2);
}

function hasEnv(name) {
  const v = process.env[name];
  return { name, present: Boolean(v), sample: v ? mask(v) : '' };
}

function section(title, keys) {
  const rows = keys.map(hasEnv);
  const present = rows.filter((r) => r.present).length;
  return { title, present, total: rows.length, rows };
}

function main() {
  const sections = [];
  sections.push(
    section('GitHub', ['GITHUB_TOKEN', 'GITHUB_ORG', 'GITHUB_USERNAME'])
  );
  sections.push(
    section('Telegram Bot Orchestrator', [
      'BOTS_LIST',
      'TELEGRAM_OFFICIAL_CHANNEL',
      'TELEGRAM_BOT_ADMINS',
    ])
  );
  sections.push(
    section('Telegram Optional', [
      'TELEGRAM_API_ID',
      'TELEGRAM_API_HASH',
      'TELEGRAM_GATEWAY_API_TOKEN',
    ])
  );
  sections.push(
    section('Hosting', [
      'VERCEL_TOKEN',
      'HEROKU_API_KEY',
      'HUGGINGFACE_TOKEN',
      'HOSTINGER_FTP_HOST',
    ])
  );
  sections.push(
    section('Social', [
      'TWITTER_BEARER_TOKEN',
      'FB_APP_ID',
      'FB_PAGE_ACCESS_TOKEN',
      'IG_APP_ID',
      'YOUTUBE_API_KEY',
      'TIKTOK_CLIENT_KEY',
      'LINKEDIN_CLIENT_ID',
      'REDDIT_CLIENT_ID',
      'DISCORD_BOT_TOKEN',
      'WHATSAPP_TOKEN',
      'TWILIO_ACCOUNT_SID',
    ])
  );
  sections.push(
    section('Blockchains', [
      'TON_RPC_URL',
      'SOLANA_RPC_URL',
      'ALGORAND_RPC_URL',
      'BSC_RPC_URL',
    ])
  );
  sections.push(section('Security', ['JWT_SECRET', 'ENCRYPTION_KEY']));

  // Wallets (nombres presentes en .env aunque los valores no se mostrarán)
  const walletVars = [];
  try {
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
      for (const l of lines) {
        if (
          /ADDRESS|WALLET/i.test(l) &&
          /=/.test(l) &&
          !l.trim().startsWith('#')
        ) {
          walletVars.push(l.split('=')[0]);
        }
      }
    }
  } catch (_) {}

  const now = new Date().toISOString();
  const out = [];
  out.push(`# Auditoría de Integraciones — ${now}`);
  out.push('');
  for (const s of sections) {
    out.push(`## ${s.title}`);
    out.push(`- Presentes: ${s.present}/${s.total}`);
    for (const r of s.rows)
      out.push(`  - ${r.name}: ${r.present ? '✔️' : '—'}`);
    out.push('');
  }
  out.push('## Wallets/Addresses (variables detectadas)');
  out.push(
    walletVars.length ? walletVars.map((v) => `- ${v}`).join('\n') : '- n/d'
  );

  const dir = path.resolve('audits');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(
    dir,
    `integrations-audit-${now.replace(/[:]/g, '')}.txt`
  );
  fs.writeFileSync(file, out.join('\n'));
  fs.writeFileSync(path.join(dir, 'integrations-latest.txt'), out.join('\n'));
  console.log(`✅ Auditoría de integraciones generada: ${file}`);
}

if (require.main === module) main();

module.exports = { main };
