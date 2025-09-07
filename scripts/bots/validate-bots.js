#!/usr/bin/env node

// Valida múltiples bot tokens de Telegram sin exponerlos.
// Obtiene getMe, getWebhookInfo y comandos configurados.

try {
  require('dotenv').config();
} catch (_) {}
const https = require('https');
const fs = require('fs');

function loadDefs() {
  const path = 'config/bots.config.json';
  let defs = [];
  if (fs.existsSync(path)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));
      if (cfg && Array.isArray(cfg.bots)) defs = cfg.bots;
    } catch (_) {}
  }
  if (!defs.length) {
    const list = (process.env.BOTS_LIST || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    defs = list.map((name) => ({
      name,
      tokenEnv: `BOT_${name.toUpperCase()}_TOKEN`,
    }));
  }
  return defs;
}

function apiCall(token, method, params) {
  const payload = params ? JSON.stringify(params) : undefined;
  return new Promise((resolve, reject) => {
    const urlPath = `/bot${token}/${method}`;
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: urlPath,
        method: payload ? 'POST' : 'GET',
        headers: payload
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
            }
          : {},
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ ok: false, error: 'parse_error', raw: data });
          }
        });
      }
    );
    req.on('error', (e) => reject(e));
    if (payload) req.write(payload);
    req.end();
  });
}

async function validateOne(def) {
  const token = process.env[def.tokenEnv];
  if (!token)
    return {
      name: def.name,
      tokenEnv: def.tokenEnv,
      ok: false,
      error: 'MISSING_TOKEN',
    };
  try {
    const me = await apiCall(token, 'getMe');
    const webhook = await apiCall(token, 'getWebhookInfo');
    const commands = await apiCall(token, 'getMyCommands');
    return {
      name: def.name,
      tokenEnv: def.tokenEnv,
      ok: me && me.ok === true,
      username: me && me.result && me.result.username,
      botId: me && me.result && me.result.id,
      webhookUrl: webhook && webhook.result && webhook.result.url,
      hasWebhook: webhook && webhook.result && Boolean(webhook.result.url),
      pendingUpdates:
        webhook && webhook.result && webhook.result.pending_update_count,
      commands: (commands && commands.result) || [],
    };
  } catch (e) {
    return {
      name: def.name,
      tokenEnv: def.tokenEnv,
      ok: false,
      error: e.message,
    };
  }
}

async function main() {
  const defs = loadDefs();
  if (!defs.length) {
    console.log(
      '⚠️  No hay bots declarados (config/bots.config.json o BOTS_LIST).'
    );
    process.exit(0);
  }
  const results = [];
  for (const def of defs) {
    results.push(await validateOne(def));
  }
  console.log(
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
  );
  const allOk = results.every((r) => r.ok);
  process.exit(allOk ? 0 : 2);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  });
}

module.exports = { validateOne };
