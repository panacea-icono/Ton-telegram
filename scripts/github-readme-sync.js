#!/usr/bin/env node

/**
 * GITHUB README SYNC — Panacea | Icono SA
 *
 * Inserta un bloque de cabecera de ecosistema en los README.md de todos los
 * repos accesibles por el token (org o usuario autenticado). Idempotente.
 *
 * Modos:
 *  - plan (default): calcula los repos que cambiarían
 *  - apply: escribe los cambios via GitHub Contents API
 */

try { require('dotenv').config(); } catch (_) {}
const fs = require('fs');
const path = require('path');
const https = require('https');
const GitHubReposManager = require('./github-repos-manager');

const TOKEN = process.env.GITHUB_TOKEN || '';

function http(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'Panas-Readme-Sync/1.0',
      'Accept': 'application/vnd.github+json',
    };
    if (TOKEN) headers.Authorization = `token ${TOKEN}`;
    let data;
    if (body) {
      data = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = https.request({ method, hostname: 'api.github.com', path: urlPath, headers }, (res) => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: buf ? JSON.parse(buf) : {} }); }
        catch { resolve({ status: res.statusCode, data: buf }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function headerBlock(owner, name) {
  return (
`<!-- PANACEA_ECOSYSTEM_HEADER -->\n`+
`# ${name}\n\n`+
`> Parte del ecosistema Panacea | Icono SA. Hub: [Ton-telegram](https://github.com/panacea-icono/Ton-telegram)\n\n`+
`- Organización: [@${owner}](https://github.com/${owner})\n`+
`- Documentación de repos: [/docs/REPOSITORIES.md](https://github.com/panacea-icono/Ton-telegram/tree/main/docs/REPOSITORIES.md)\n`+
`- Estructura y submódulos: [/docs/REPOS-STRUCTURE.md](https://github.com/panacea-icono/Ton-telegram/tree/main/docs/REPOS-STRUCTURE.md)\n\n`
  );
}

function needsHeader(md) {
  return !/<!--\s*PANACEA_ECOSYSTEM_HEADER\s*-->/.test(md);
}

function b64decode(b64) { return Buffer.from(b64, 'base64').toString('utf8'); }
function b64encode(txt) { return Buffer.from(txt, 'utf8').toString('base64'); }

async function processRepo(fullName) {
  const [owner, repo] = fullName.split('/');
  const readmePath = `/repos/${owner}/${repo}/contents/README.md`;
  const res = await http('GET', readmePath);
  if (res.status === 200 && res.data && res.data.content) {
    const sha = res.data.sha;
    const current = b64decode(res.data.content);
    if (!needsHeader(current)) return { repo: fullName, action: 'skip' };
    const updated = headerBlock(owner, repo) + current;
    return { repo: fullName, action: 'update', sha, content: b64encode(updated) };
  }
  // Si no hay README, crear uno mínimo
  if (res.status === 404) {
    const content = headerBlock(owner, repo) + `\n_Este repositorio forma parte del ecosistema Panacea._\n`;
    return { repo: fullName, action: 'create', content: b64encode(content) };
  }
  return { repo: fullName, action: 'error', status: res.status };
}

async function applyChange(change) {
  const [owner, repo] = change.repo.split('/');
  const body = {
    message: 'chore(docs): sync ecosystem header',
    content: change.content,
    sha: change.sha,
    branch: 'main'
  };
  if (change.action === 'create') delete body.sha;
  const res = await http('PUT', `/repos/${owner}/${repo}/contents/README.md`, body);
  return res.status === 201 || res.status === 200;
}

async function main() {
  const mode = process.argv[2] || 'plan';
  const mgr = new GitHubReposManager();
  const repos = await mgr.fetchRepositories();
  const changes = [];
  for (const r of repos) {
    const ch = await processRepo(r.fullName || r.name);
    changes.push(ch);
  }
  const plan = changes.filter(c => c.action === 'update' || c.action === 'create').map(c => c.repo);
  const dir = path.resolve('docs/releases');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'README_SYNC_PLAN.md'), [
    `# Plan de sincronización de README — ${new Date().toISOString()}`,
    '',
    ...plan.map(r => `- ${r}`)
  ].join('\n'));
  console.log(`📝 Repos a modificar: ${plan.length}`);
  if (mode === 'apply') {
    if (!TOKEN) { console.error('❌ Requiere GITHUB_TOKEN'); process.exit(2); }
    let ok = 0, fail = 0;
    for (const ch of changes) {
      if (ch.action === 'update' || ch.action === 'create') {
        const res = await applyChange(ch);
        if (res) { ok++; console.log(`✔ ${ch.repo}`); } else { fail++; console.log(`✖ ${ch.repo}`); }
      }
    }
    console.log(`✅ README sync completado. OK=${ok} FAIL=${fail}`);
  } else {
    console.log('ℹ️  Ejecuta con `apply` para escribir cambios.');
  }
}

if (require.main === module) {
  main().catch(e => { console.error('❌', e.message); process.exit(1); });
}

module.exports = { main };

