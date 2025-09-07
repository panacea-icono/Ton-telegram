#!/usr/bin/env node

// Construye un reporte descriptivo por bot combinando config/bots.config.json
// y .env.telegram.local (no commit), sin exponer secretos.

const fs = require('fs');
const path = require('path');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function readEnvLocal() {
  const p = path.resolve('.env.telegram.local');
  if (!fs.existsSync(p)) return {};
  const map = {};
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  for (const l of lines) {
    if (!l || l.trim().startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i === -1) continue;
    const k = l.slice(0, i).trim();
    const v = l.slice(i + 1).trim();
    map[k] = v;
  }
  return map;
}

function maskToken(t) {
  if (!t) return '';
  return t.slice(0, 6) + '...' + t.slice(-4);
}

function tokenToBotId(t) {
  if (!t) return '';
  return t.split(':')[0];
}

function tokenEnvToHandle(tokenEnv) {
  const m = tokenEnv.match(/^BOT_(.*)_TOKEN$/);
  if (!m) return tokenEnv.toLowerCase();
  return m[1].toLowerCase();
}

function handleToLink(handle) {
  // asume handle ya lleva sufijo _bot
  const h = handle.replace(/_/g, '_');
  return `https://t.me/${h}`;
}

function modulesToList(mod) {
  return Object.entries(mod || {})
    .filter(([, v]) => !!v)
    .map(([k]) => k)
    .join(', ');
}

function main() {
  const cfgPath = path.resolve('config/bots.config.json');
  if (!fs.existsSync(cfgPath)) {
    console.error('❌ Falta config/bots.config.json');
    process.exit(2);
  }
  const cfg = readJSON(cfgPath);
  const bots = cfg.bots || [];
  const env = readEnvLocal();

  const rows = bots.map((b) => {
    const envVar = b.tokenEnv;
    const token = env[envVar] || '';
    const present = Boolean(token);
    const handle = tokenEnvToHandle(envVar);
    const link = handleToLink(handle);
    const botId = tokenToBotId(token);
    return {
      name: b.name,
      envVar,
      handle,
      link,
      botId,
      modules: modulesToList(b.modules),
      publisher: !!(b.modules && b.modules.publisher),
      tokenPresent: present,
      tokenMasked: maskToken(token),
    };
  });

  const now = new Date().toISOString();
  const md = [];
  md.push(`# Reporte de Bots de Telegram — ${now}`);
  md.push('');
  const total = rows.length;
  const withToken = rows.filter((r) => r.tokenPresent).length;
  const withPublisher = rows.filter((r) => r.publisher).length;
  md.push(`- Total bots: ${total}`);
  md.push(
    `- Bots con token cargado (.env.telegram.local): ${withToken}/${total}`
  );
  md.push(`- Bots con módulo publisher activo: ${withPublisher}/${total}`);
  md.push('');
  md.push(
    '| Bot | Handle | Env Var | Bot ID | Link | Módulos | Publisher | Token |'
  );
  md.push('|---|---|---|---:|---|---|:---:|---|');
  for (const r of rows) {
    md.push(
      `| ${r.name} | ${r.handle} | ${r.envVar} | ${r.botId} | ${r.link} | ${r.modules || '-'} | ${r.publisher ? '✔' : '—'} | ${r.tokenPresent ? '✔' : '—'} |`
    );
  }
  md.push('');
  md.push('> Nota: los tokens no se muestran; sólo se indica presencia.');

  const outDir = path.resolve('audits');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(
    outDir,
    `telegram-bots-report-${now.replace(/[:]/g, '')}.md`
  );
  fs.writeFileSync(outFile, md.join('\n'));
  fs.writeFileSync(
    path.join(outDir, 'telegram-bots-report-latest.md'),
    md.join('\n')
  );
  console.log(`✅ Reporte generado: ${outFile}`);
}

if (require.main === module) main();

module.exports = { main };
