#!/usr/bin/env node

try { require('dotenv').config(); } catch (_) {}
const fs = require('fs');
const path = require('path');
const https = require('https');
const GitHubReposManager = require('./github-repos-manager');

const TOKEN = process.env.GITHUB_TOKEN || '';

function http(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'Panas-Readme-Packages/1.0',
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

function b64decode(b64) { return Buffer.from(b64, 'base64').toString('utf8'); }
function b64encode(txt) { return Buffer.from(txt, 'utf8').toString('base64'); }

function sanitize(name) {
  return String(name || '').trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, '-');
}

function buildPackagesSection(repo, tag) {
  const pkg = sanitize(repo.name);
  const npm = `@panacea-icono/${pkg}`;
  const ghcr = `ghcr.io/panacea-icono/${pkg}`;
  const lines = [];
  lines.push('');
  lines.push('<!-- PANACEA_PACKAGES_SECTION -->');
  lines.push('## Packages');
  lines.push('');
  if ((repo.language || '').toLowerCase().includes('javascript') || (repo.language || '').toLowerCase().includes('typescript')) {
    lines.push('### NPM (GitHub Packages)');
    lines.push('```bash');
    lines.push(`# Requiere autenticación con GitHub Packages`);
    lines.push(`npm install ${npm}`);
    lines.push('```');
  }
  lines.push('### Docker (GHCR)');
  lines.push('```bash');
  lines.push(`docker pull ${ghcr}:${tag}`);
  lines.push('```');
  lines.push('');
  return lines.join('\n');
}

function packagesSectionExists(md) {
  return /<!--\s*PANACEA_PACKAGES_SECTION\s*-->/.test(md);
}

async function processRepo(repo, tag) {
  const full = repo.fullName || repo.name;
  const [owner, name] = full.split('/');
  const res = await http('GET', `/repos/${owner}/${name}/contents/README.md`);
  let base = '', sha = undefined;
  if (res.status === 200 && res.data && res.data.content) {
    base = b64decode(res.data.content);
    sha = res.data.sha;
  }
  if (packagesSectionExists(base)) return null;
  const section = buildPackagesSection(repo, tag);
  const updated = base ? base + '\n' + section : section;
  return { owner, name, sha, content: b64encode(updated) };
}

async function applyChange(ch) {
  const body = {
    message: 'docs: add Packages section (ecosystem sync)',
    content: ch.content,
    sha: ch.sha,
    branch: 'main'
  };
  const res = await http('PUT', `/repos/${ch.owner}/${ch.name}/contents/README.md`, body);
  return res.status === 200 || res.status === 201;
}

function ecosystemTag() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `v0.1.0-ecosystem-${y}${m}${day}`;
}

async function main() {
  const mode = process.argv[2] || 'plan';
  const mgr = new GitHubReposManager();
  const repos = await mgr.fetchRepositories();
  const tag = ecosystemTag();
  const changes = [];
  for (const r of repos) {
    const ch = await processRepo(r, tag);
    if (ch) changes.push(ch);
  }
  console.log(`🧩 Repos con Packages section a añadir: ${changes.length}`);
  if (mode === 'apply') {
    let ok = 0, fail = 0;
    for (const ch of changes) {
      try { const res = await applyChange(ch); if (res) ok++; else fail++; }
      catch { fail++; }
    }
    console.log(`✅ Packages section sync completado. OK=${ok} FAIL=${fail}`);
  } else {
    console.log('ℹ️  Ejecuta con `apply` para escribir cambios.');
  }
}

if (require.main === module) main();

module.exports = { main };

