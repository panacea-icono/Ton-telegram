#!/usr/bin/env node

// Lee .env.telegram.local (ignorado por git) y genera un inventario de bots
// con env var, bot_id (prefijo numérico del token) y handle inferido del nombre.

const fs = require('fs');
const path = require('path');

function parseEnvLines(txt) {
  const out = [];
  for (const line of txt.split(/\r?\n/)) {
    const l = line.trim();
    if (!l || l.startsWith('#')) continue;
    const i = l.indexOf('=');
    if (i === -1) continue;
    const key = l.slice(0, i).trim();
    const val = l.slice(i + 1).trim();
    if (!key || !val) continue;
    out.push({ key, val });
  }
  return out;
}

function maskToken(t) {
  return t ? t.slice(0, 6) + '...' + t.slice(-4) : '';
}

function inferHandleFromKey(key) {
  // BOT_<HANDLE>_TOKEN → <HANDLE>
  const m = key.match(/^BOT_(.*)_TOKEN$/);
  if (!m) return '';
  return m[1].toLowerCase();
}

function main() {
  const localPath = path.resolve('.env.telegram.local');
  if (!fs.existsSync(localPath)) {
    console.error(
      '❌ .env.telegram.local no encontrado (no se commitea). Crea este archivo con tus tokens.'
    );
    process.exit(2);
  }
  const txt = fs.readFileSync(localPath, 'utf8');
  const rows = parseEnvLines(txt);
  const items = rows.map((r) => {
    const id = r.val.split(':')[0];
    return {
      env: r.key,
      bot_id: id,
      handle_hint: inferHandleFromKey(r.key),
      token_masked: maskToken(r.val),
    };
  });
  const md = [];
  md.push(`# Inventario de Telegram Bots — ${new Date().toISOString()}`);
  md.push('');
  md.push('| Env Var | Bot ID | Handle (hint) | Token (masked) |');
  md.push('|---|---:|---|---|');
  for (const it of items) {
    md.push(
      `| ${it.env} | ${it.bot_id} | ${it.handle_hint} | ${it.token_masked} |`
    );
  }
  const dir = path.resolve('audits');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(
    dir,
    `telegram-bots-inventory-${new Date().toISOString().replace(/[:]/g, '')}.md`
  );
  fs.writeFileSync(file, md.join('\n'));
  fs.writeFileSync(
    path.join(dir, 'telegram-bots-inventory-latest.md'),
    md.join('\n')
  );
  console.log(`✅ Inventario generado: ${file}`);
}

if (require.main === module) main();

module.exports = { main };
