#!/usr/bin/env node

/**
 * GITHUB RELEASE ORCHESTRATOR – Panacea | Icono SA
 *
 * Planifica o crea lanzamientos coordinados en todos los repos accesibles
 * por el token (org o usuario autenticado).
 *
 * Modos:
 *  - plan (default): genera docs/releases/RELEASES_PLAN.md y docs/releases/MANIFEST.json
 *  - apply: crea los releases en GitHub con el tag propuesto (idempotente: si existe, lo omite)
 *  - gist (opcional): publica un gist con el resumen
 */

try {
  require('dotenv').config();
} catch (_) {}
const fs = require('fs');
const path = require('path');
const https = require('https');
const GitHubReposManager = require('./github-repos-manager');

const ORG = process.env.GITHUB_ORG || '';
const TOKEN = process.env.GITHUB_TOKEN || '';
const USERNAME = process.env.GITHUB_USERNAME || '';

function httpRequest(method, hostname, urlPath, body) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'Panas-Release-Orchestrator/1.0',
      Accept: 'application/vnd.github+json',
    };
    if (TOKEN) headers.Authorization = `token ${TOKEN}`;
    let data;
    if (body) {
      data = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const opts = { method, hostname, path: urlPath, headers };
    const req = https.request(opts, (res) => {
      let buf = '';
      res.on('data', (c) => (buf += c));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: buf ? JSON.parse(buf) : {},
          });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: buf });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function tagName() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `v0.1.0-ecosystem-${y}${m}${day}`;
}

function releaseBody(repo) {
  const lines = [];
  lines.push(`# Panacea | Icono SA — Ecosystem Release`);
  lines.push('');
  lines.push(`Repositorio: ${repo.fullName || repo.name}`);
  lines.push(
    `Parte del ecosistema: Ton-telegram (hub) → https://github.com/panacea-icono/Ton-telegram`
  );
  lines.push('');
  lines.push('Notas:');
  lines.push(
    '- Este release forma parte de una publicación coordinada del ecosistema.'
  );
  lines.push(`- Fork: ${repo.isFork ? 'sí' : 'no'}`);
  lines.push(`- Privado: ${repo.isPrivate ? 'sí' : 'no'}`);
  lines.push(`- Lenguaje principal: ${repo.language || 'n/a'}`);
  lines.push('');
  lines.push('Assets/paquetes:');
  lines.push('- (Opcional) Adjuntar binarios/artefactos en releases futuros.');
  return lines.join('\n');
}

async function createRelease(owner, repo, bodyText, tag, target) {
  // Verificar si existe release/tag
  const existing = await httpRequest(
    'GET',
    'api.github.com',
    `/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`
  );
  if (existing.status === 200) {
    return { created: false, reason: 'exists', url: existing.data.html_url };
  }
  // Crear release
  const payload = {
    tag_name: tag,
    target_commitish: target || 'main',
    name: `${repo} ${tag}`,
    body: bodyText,
    draft: false,
    prerelease: false,
    generate_release_notes: false,
  };
  const resp = await httpRequest(
    'POST',
    'api.github.com',
    `/repos/${owner}/${repo}/releases`,
    payload
  );
  if (resp.status === 201) return { created: true, url: resp.data.html_url };
  return {
    created: false,
    reason: `HTTP ${resp.status}: ${resp.data && resp.data.message}`,
  };
}

async function plan() {
  const mgr = new GitHubReposManager();
  const repos = await mgr.fetchRepositories();
  const tag = tagName();
  const manifest = repos.map((r) => ({
    name: r.name,
    fullName: r.fullName,
    private: r.isPrivate,
    fork: r.isFork,
    defaultBranch: r.defaultBranch,
    language: r.language,
    tag,
  }));
  const dir = path.resolve('docs/releases');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'MANIFEST.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        tag,
        count: manifest.length,
        items: manifest,
      },
      null,
      2
    )
  );
  const md = [
    `# Plan de Releases — ${new Date().toISOString()}`,
    `Tag propuesto: ${tag}`,
    '',
    ...manifest.map(
      (i) =>
        `- ${i.fullName || i.name} | branch: ${i.defaultBranch} | fork: ${i.fork ? 'sí' : 'no'} | private: ${i.private ? 'sí' : 'no'} | lang: ${i.language || 'n/a'}`
    ),
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'RELEASES_PLAN.md'), md);
  console.log(
    `✅ Plan generado para ${manifest.length} repos (tag ${tag}) → docs/releases/RELEASES_PLAN.md`
  );
}

async function apply() {
  if (!TOKEN) {
    console.error('❌ Requiere GITHUB_TOKEN en entorno.');
    process.exit(2);
  }
  const mgr = new GitHubReposManager();
  const repos = await mgr.fetchRepositories();
  const tag = tagName();
  const results = [];
  for (const r of repos) {
    const [owner, name] = (r.fullName || `/${r.name}`).split('/');
    if (!owner || !name) continue;
    const body = releaseBody(r);
    const res = await createRelease(owner, name, body, tag, r.defaultBranch);
    results.push({ repo: r.fullName, ...res });
    console.log(
      `${r.fullName}: ${res.created ? 'created' : 'skipped'} ${res.url || res.reason || ''}`
    );
  }
  // Guardar reporte
  const dir = path.resolve('audits');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(
      dir,
      `releases-apply-${new Date().toISOString().replace(/[:]/g, '')}.json`
    ),
    JSON.stringify({ tag, results }, null, 2)
  );
  console.log('✅ Proceso apply finalizado');
}

async function main() {
  const mode = process.argv[2] || 'plan';
  if (mode === 'plan') return plan();
  if (mode === 'apply') return apply();
  console.log('Uso: node scripts/github-release-orchestrator.js <plan|apply>');
}

if (require.main === module) {
  main().catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
  });
}

module.exports = { plan, apply };
