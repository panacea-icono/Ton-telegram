#!/usr/bin/env node

/**
 * MULTI-BOT ORCHESTRATOR
 * Administra múltiples bots de Telegram con módulos habilitables.
 */

try {
  require('dotenv').config();
} catch (_) {}
const fs = require('fs');

function loadConfig() {
  const path = 'config/bots.config.json';
  if (fs.existsSync(path)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));
      return cfg && Array.isArray(cfg.bots) ? cfg.bots : [];
    } catch (e) {
      console.error('❌ Error leyendo config/bots.config.json:', e.message);
      return [];
    }
  }
  // Fallback: variables de entorno
  const list = (process.env.BOTS_LIST || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.map((name) => ({
    name,
    tokenEnv: `BOT_${name.toUpperCase()}_TOKEN`,
    mode: 'polling',
    modules: { core: true, paysupport: true, echo: false, publisher: false },
  }));
}

function buildBot(token) {
  const TelegramBot = require('node-telegram-bot-api');
  const bot = new TelegramBot(token, { polling: true });
  return bot;
}

function registerCore(bot) {
  bot.onText(/\/start/, async (msg) => {
    const name = (await bot.getMe()).username || 'bot';
    bot.sendMessage(
      msg.chat.id,
      `Hola, soy ${name}. Usa /help para ver funciones.`
    );
  });
  bot.onText(/\/help/, (msg) => {
    const lines = [
      'Comandos disponibles:',
      '/start - iniciar',
      '/help - ayuda',
      '/whoami - mostrar tu user ID',
      '/paysupport - soporte de pagos',
      '/delete_data - solicitar borrado de datos',
      '/echo <texto> - repetir texto (si está habilitado)',
    ];
    bot.sendMessage(msg.chat.id, lines.join('\n'));
  });
  bot.onText(/\/whoami/, (msg) => {
    const id = msg.from && msg.from.id;
    const username =
      msg.from && (msg.from.username ? `@${msg.from.username}` : '');
    bot.sendMessage(msg.chat.id, `Tu ID: ${id} ${username}`.trim());
  });
  bot.onText(/\/delete_data/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Tu solicitud de borrado ha sido registrada.');
  });
}

function registerPaySupport(bot) {
  bot.onText(/\/paysupport/, (msg) => {
    const text = [
      'Soporte de Pagos 🧾',
      '— Indica fecha y detalle del pago (Stars).',
      '— Incluye ID de transacción si lo tienes.',
      '— Te responderemos con el estado y resolución.',
    ].join('\n');
    bot.sendMessage(msg.chat.id, text);
  });
}

function registerEcho(bot) {
  bot.onText(/^\/echo\s+([\s\S]+)/, (msg, match) => {
    const text = match && match[1] ? match[1].trim() : '';
    if (text) bot.sendMessage(msg.chat.id, text);
  });
}

// IA: OpenAI Chat (/ask <pregunta>)
function registerAI_OpenAI(bot, options = {}) {
  const axios = require('axios');
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  const model = options.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) {
    console.warn(
      'ℹ️  AI(OpenAI): OPENAI_API_KEY no configurado. Módulo deshabilitado.'
    );
    return;
  }
  async function askOpenAI(prompt) {
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        },
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      const text = res.data?.choices?.[0]?.message?.content || 'Sin respuesta';
      return text.slice(0, 3500);
    } catch (e) {
      return `Error IA: ${e.response?.data?.error?.message || e.message}`;
    }
  }
  bot.onText(/^\/ask\s+([\s\S]+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const q = ((match && match[1]) || '').trim();
    if (!q) return bot.sendMessage(chatId, 'Uso: /ask <pregunta>');
    bot.sendMessage(chatId, '🤖 Pensando...');
    const ans = await askOpenAI(q);
    bot.sendMessage(chatId, ans);
  });
}

// IA: Llama endpoint (/ask <pregunta>)
function registerAI_Llama(bot, options = {}) {
  const axios = require('axios');
  const apiUrl = options.url || process.env.LLAMA_API_URL;
  const apiKey = options.apiKey || process.env.LLAMA_API_KEY;
  if (!apiUrl) {
    console.warn(
      'ℹ️  AI(Llama): LLAMA_API_URL no configurado. Módulo deshabilitado.'
    );
    return;
  }
  async function askLlama(prompt) {
    try {
      const res = await axios.post(
        apiUrl,
        { prompt },
        {
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        }
      );
      const text =
        res.data?.text || res.data?.completion || JSON.stringify(res.data);
      return String(text).slice(0, 3500);
    } catch (e) {
      return `Error IA(Llama): ${e.response?.data?.error || e.message}`;
    }
  }
  bot.onText(/^\/ask\s+([\s\S]+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const q = ((match && match[1]) || '').trim();
    if (!q) return bot.sendMessage(chatId, 'Uso: /ask <pregunta>');
    bot.sendMessage(chatId, '🦙 Pensando...');
    const ans = await askLlama(q);
    bot.sendMessage(chatId, ans);
  });
}

// Aplica metadatos del bot (nombre, descripciones) vía Bot API
async function applyBotMetadata(token, persona) {
  const axios = require('axios');
  const base = `https://api.telegram.org/bot${token}`;
  if (persona?.displayName) {
    try {
      await axios.post(`${base}/setMyName`, { name: persona.displayName });
    } catch (_) {}
  }
  if (persona?.shortDescription) {
    try {
      await axios.post(`${base}/setMyShortDescription`, {
        short_description: persona.shortDescription,
      });
    } catch (_) {}
  }
  if (persona?.description) {
    try {
      await axios.post(`${base}/setMyDescription`, {
        description: persona.description,
      });
    } catch (_) {}
  }
  if (Array.isArray(persona?.commands) && persona.commands.length) {
    try {
      await axios.post(`${base}/setMyCommands`, { commands: persona.commands });
    } catch (_) {}
  }
}

function parseAdmins() {
  const raw = process.env.TELEGRAM_BOT_ADMINS || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));
}

function isAdmin(msg, admins) {
  const uid = msg.from && msg.from.id;
  return uid && admins.includes(Number(uid));
}

function resolveChannelId() {
  // Accept @username, -100123..., or t.me links
  const raw =
    process.env.TELEGRAM_OFFICIAL_CHANNEL ||
    process.env.TELEGRAM_OFFICIAL_CHANNEL_ID ||
    '';
  if (!raw) return null;
  if (raw.startsWith('http')) {
    // t.me/<username>
    const m = raw.match(/t\.me\/(.+)$/);
    return m ? `@${m[1]}` : raw;
  }
  if (raw.startsWith('@') || raw.startsWith('-100')) return raw;
  return `@${raw}`;
}

function registerPublisher(bot) {
  const channelId = resolveChannelId();
  const admins = parseAdmins();
  if (!channelId) {
    console.warn('ℹ️  Publisher: TELEGRAM_OFFICIAL_CHANNEL no configurado.');
    return;
  }
  bot.onText(/^\/post\s+([\s\S]+)/, async (msg, match) => {
    if (!isAdmin(msg, admins))
      return bot.sendMessage(msg.chat.id, '⛔ Solo admins');
    const text = ((match && match[1]) || '').trim();
    if (!text) return bot.sendMessage(msg.chat.id, 'Uso: /post <texto>');
    try {
      await bot.sendMessage(channelId, text, {
        disable_web_page_preview: false,
      });
      bot.sendMessage(msg.chat.id, '✅ Publicado');
    } catch (e) {
      bot.sendMessage(msg.chat.id, `❌ Error publicando: ${e.message}`);
    }
  });
  bot.onText(/^\/post_html\s+([\s\S]+)/, async (msg, match) => {
    if (!isAdmin(msg, admins))
      return bot.sendMessage(msg.chat.id, '⛔ Solo admins');
    const text = ((match && match[1]) || '').trim();
    if (!text) return bot.sendMessage(msg.chat.id, 'Uso: /post_html <html>');
    try {
      await bot.sendMessage(channelId, text, {
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      });
      bot.sendMessage(msg.chat.id, '✅ Publicado (HTML)');
    } catch (e) {
      bot.sendMessage(msg.chat.id, `❌ Error publicando: ${e.message}`);
    }
  });
  bot.onText(/^\/schedule\s+(\S+)\s+([\s\S]+)/, async (msg, match) => {
    if (!isAdmin(msg, admins))
      return bot.sendMessage(msg.chat.id, '⛔ Solo admins');
    const when = match && match[1];
    const text = match && match[2];
    const ts = Date.parse(when);
    if (!Number.isFinite(ts))
      return bot.sendMessage(msg.chat.id, 'Uso: /schedule <ISO8601> <texto>');
    const delay = ts - Date.now();
    if (delay <= 0)
      return bot.sendMessage(msg.chat.id, '⏱️ La fecha debe ser futura');
    setTimeout(async () => {
      try {
        await bot.sendMessage(channelId, text);
      } catch (_) {}
    }, delay);
    bot.sendMessage(
      msg.chat.id,
      `🗓️ Programado para ${new Date(ts).toISOString()}`
    );
  });
}

async function start() {
  const defs = loadConfig();
  if (!defs.length) {
    console.warn(
      '⚠️  No hay bots configurados. Usa config/bots.config.json o variables de entorno (BOTS_LIST + BOT_<NAME>_TOKEN).'
    );
  }

  const running = [];
  for (const def of defs) {
    const token = process.env[def.tokenEnv];
    if (!token) {
      console.warn(
        `⚠️  Token no definido para ${def.name} (${def.tokenEnv}). Saltando.`
      );
      continue;
    }
    const bot = buildBot(token);
    const me = await bot.getMe().catch(() => ({ username: def.name }));
    console.log(`🤖 Iniciado bot @${me.username} (${def.name})`);

    // Aplicar metadatos de persona
    if (def.persona) {
      applyBotMetadata(token, def.persona).catch(() => {});
      if (def.persona.welcome) {
        bot.onText(/^\/start$/, (msg) => {
          bot.sendMessage(msg.chat.id, def.persona.welcome);
        });
      }
    }

    if (def.modules?.core) registerCore(bot);
    if (def.modules?.paysupport) registerPaySupport(bot);
    if (def.modules?.echo) registerEcho(bot);
    if (def.modules?.publisher) registerPublisher(bot);
    // AI providers
    if (def.ai?.provider === 'openai' || def.modules?.ai_openai) {
      const apiKey = def.ai?.apiKeyEnv
        ? process.env[def.ai.apiKeyEnv]
        : undefined;
      registerAI_OpenAI(bot, { model: def.ai?.model, apiKey });
    }
    if (def.ai?.provider === 'llama' || def.modules?.ai_llama) {
      registerAI_Llama(bot, {
        url: def.ai?.urlEnv
          ? process.env[def.ai.urlEnv]
          : process.env.LLAMA_API_URL,
        apiKey: def.ai?.apiKeyEnv
          ? process.env[def.ai.apiKeyEnv]
          : process.env.LLAMA_API_KEY,
      });
    }

    // Respuesta general con IA si se activa el modo chat
    if (def.ai?.chatFallback) {
      bot.on('message', async (msg) => {
        if (msg.text && !/^\//.test(msg.text)) {
          if (def.ai?.provider === 'openai' || def.modules?.ai_openai) {
            // reutiliza /ask pipeline
            const match = [msg.text, msg.text];
            const fake = { chat: { id: msg.chat.id } };
            bot.emit('text', msg.text);
          }
        }
      });
    }

    running.push({ def, bot });
  }

  if (!running.length) {
    console.log('ℹ️  Manteniendo proceso activo (sin bots).');
    setInterval(() => {}, 1 << 30);
  }
}

function registerTON_Wallet(bot, options = {}) {
  try {
    const TONWalletModule = require('./modules/ton_wallet');
    const tonModule = new TONWalletModule(bot, options);
    tonModule.registerCommands();

    // Validar configuración
    const validation = tonModule.validateConfig();
    if (!validation.valid) {
      console.log(
        '⚠️ Módulo TON_Wallet con problemas:',
        validation.issues.join(', ')
      );
    } else {
      console.log('✅ Módulo TON_Wallet registrado correctamente');
    }

    return tonModule;
  } catch (error) {
    console.error('❌ Error registrando módulo TON_Wallet:', error.message);
    return null;
  }
}

function registerMulti_Wallet(bot, options = {}) {
  try {
    const MultiWalletModule = require('./modules/multi_wallet');
    const multiWalletModule = new MultiWalletModule(bot, options);
    multiWalletModule.registerCommands();

    // Validar configuración
    const validation = multiWalletModule.validateConfig();
    if (!validation.valid) {
      console.log(
        '⚠️ Módulo Multi_Wallet con problemas:',
        validation.issues.join(', ')
      );
    } else {
      console.log('✅ Módulo Multi_Wallet registrado correctamente');
    }

    return multiWalletModule;
  } catch (error) {
    console.error('❌ Error registrando módulo Multi_Wallet:', error.message);
    return null;
  }
}

if (require.main === module) {
  start().catch((e) => {
    console.error('❌ Error iniciando orchestrator:', e.message);
    process.exit(1);
  });
}

module.exports = { start, registerTON_Wallet, registerMulti_Wallet };
