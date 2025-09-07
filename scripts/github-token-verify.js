#!/usr/bin/env node

/**
 * =============================================================================
 * GITHUB TOKEN VERIFIER - PANACEA ICONO SA
 * =============================================================================
 * Verifica que el token de GitHub configurado funciona y reporta:
 * - Usuario asociado
 * - Alcances (scopes) del token
 * - Rate limits disponibles
 * - (Opcional) Membresía y acceso a organización configurada
 *
 * No imprime el token. Usa GITHUB_TOKEN del entorno o --token=...
 * =============================================================================
 */

try { require('dotenv').config(); } catch (_) {}
const https = require('https');

const CONFIG = {
  apiBase: 'api.github.com',
  token: getTokenFromArgs() || process.env.GITHUB_TOKEN || '',
  org: process.env.GITHUB_ORG || '',
  timeoutMs: 10000,
  requiredScopes: getRequiredScopes(),
};

function getTokenFromArgs() {
  const arg = process.argv.slice(2).find(a => a.startsWith('--token='));
  return arg ? arg.split('=')[1] : '';
}

function getRequiredScopes() {
  const fromArg = process.argv.slice(2).find(a => a.startsWith('--require-scopes='));
  const raw = fromArg ? fromArg.split('=')[1] : (process.env.GITHUB_REQUIRED_SCOPES || '');
  return raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toLowerCase());
}

function request(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: CONFIG.apiBase,
      path,
      method,
      headers: {
        'User-Agent': 'Panas-Token-Ecosystem/1.0.0',
        'Accept': 'application/vnd.github.v3+json',
      },
      timeout: CONFIG.timeoutMs,
    };
    if (CONFIG.token) {
      options.headers.Authorization = `token ${CONFIG.token}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(new Error('Request timeout')); });
    req.end();
  });
}

async function verifyToken() {
  if (!CONFIG.token) {
    console.error('❌ GITHUB_TOKEN no configurado. Usa .env o --token=...');
    process.exit(2);
  }

  try {
    console.log('🔍 Verificando token contra GitHub API...');

    // 1) User info
    const userResp = await request('/user');
    if (userResp.status !== 200) {
      console.error(`❌ Token inválido o sin permisos. /user → HTTP ${userResp.status}`);
      if (userResp.data && userResp.data.message) console.error(`   Detalle: ${userResp.data.message}`);
      process.exit(2);
    }

    const login = userResp.data.login;
    const scopes = (userResp.headers['x-oauth-scopes'] || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.toLowerCase());
    const accepted = userResp.headers['x-accepted-oauth-scopes'] || '';

    console.log(`✅ Token válido. Usuario: ${login}`);
    console.log(`🔏 Scopes: ${scopes.length ? scopes.join(', ') : '(sin scopes reportados)'}`);
    if (accepted) console.log(`🧩 Scopes aceptados por endpoint: ${accepted}`);

    // 1b) Validar scopes requeridos si se definieron
    if (CONFIG.requiredScopes.length) {
      const missing = CONFIG.requiredScopes.filter(rs => !scopes.includes(rs));
      if (missing.length) {
        console.error(`❌ Scopes faltantes: ${missing.join(', ')}`);
        console.error('   Define GITHUB_REQUIRED_SCOPES o usa --require-scopes=...');
        process.exit(3);
      } else {
        console.log('✔️  Scopes requeridos presentes');
      }
    }

    // 2) Rate limit
    const rate = await request('/rate_limit');
    if (rate.status === 200 && rate.data && rate.data.resources && rate.data.resources.core) {
      const core = rate.data.resources.core;
      console.log(`⏳ Rate limit: ${core.remaining}/${core.limit} (resetea en ${new Date(core.reset * 1000).toISOString()})`);
    }

    // 3) Organización (opcional)
    if (CONFIG.org) {
      // 3a) Membresía del usuario en org (requiere read:org)
      const membership = await request(`/user/memberships/orgs/${CONFIG.org}`);
      if (membership.status === 200) {
        console.log(`🏢 Membresía en ${CONFIG.org}: ${membership.data.state} (rol: ${membership.data.role})`);
      } else if (membership.status === 404) {
        console.log(`🏢 Membresía en ${CONFIG.org}: desconocida o sin scope read:org (HTTP 404)`);
      } else {
        console.log(`🏢 Membresía en ${CONFIG.org}: HTTP ${membership.status}`);
      }

      // 3b) Acceso a repos del org (públicos o privados según scopes)
      const repos = await request(`/orgs/${CONFIG.org}/repos?per_page=1&sort=updated&direction=desc`);
      if (repos.status === 200) {
        const count = Array.isArray(repos.data) ? repos.data.length : 0;
        console.log(`📚 Acceso a repos de ${CONFIG.org}: OK (ejemplo devuelto: ${count})`);
      } else if (repos.status === 404) {
        console.log(`📚 Acceso a repos de ${CONFIG.org}: org no encontrada (404)`);
      } else if (repos.status === 403) {
        console.log('📚 Acceso a repos de org: 403 (posible falta de permisos o rate limit)');
      } else {
        console.log(`📚 Acceso a repos de org: HTTP ${repos.status}`);
      }
    }

    console.log('🎉 Verificación completada sin errores');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Error de verificación: ${err.message}`);
    process.exit(4);
  }
}

if (require.main === module) {
  verifyToken();
}

module.exports = { verifyToken };
