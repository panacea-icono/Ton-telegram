#!/usr/bin/env node

/**
 * =============================================================================
 * GITHUB ORG SYNC - PANACEA ICONO SA
 * =============================================================================
 * Sincroniza automáticamente la estructura de submódulos (.gitmodules)
 * y documentación (docs/REPOS-STRUCTURE.md) a partir de los repos
 * accesibles por el token (org o usuario autenticado).
 * =============================================================================
 */

try { require('dotenv').config(); } catch (_) {}
const fs = require('fs');
const path = require('path');
const GitHubReposManager = require('./github-repos-manager');

// Reglas simples de clasificación por nombre/tema
function classifyRepo(repo) {
  const name = (repo.name || '').toLowerCase();
  const topics = (repo.topics || []).map(t => t.toLowerCase());

  const has = (s) => name.includes(s) || topics.includes(s);

  if (has('bot') || has('telegram') || has('dashboard') || has('frontend') || has('backend') || has('app')) {
    return { group: 'apps', path: `apps/${repo.name}` };
  }
  if (has('token') && !has('bot')) {
    return { group: 'tokens', path: `tokens/${repo.name}` };
  }
  if (has('contract') || has('ton') || has('solana') || has('algorand') || has('bsc') || has('evm')) {
    return { group: 'contracts', path: `contracts/${repo.name}` };
  }
  if (has('infra') || has('docker') || has('ci') || has('cd') || has('pipeline')) {
    return { group: 'infra', path: `infra/${repo.name}` };
  }
  if (has('lib') || has('sdk') || has('utils')) {
    return { group: 'libs', path: `libs/${repo.name}` };
  }
  return { group: 'labs', path: `labs/${repo.name}` };
}

function buildGitmodules(items) {
  let out = `# =============================================================================\n`;
  out += `# GIT SUBMODULES - AUTO SYNC\n`;
  out += `# =============================================================================\n`;
  out += `# Generado automáticamente por scripts/github-org-sync.js\n\n`;

  for (const it of items) {
    out += `[submodule "${it.path}"]\n`;
    out += `    path = ${it.path}\n`;
    out += `    url = ${it.url}\n`;
    out += `    branch = ${it.branch}\n\n`;
  }
  out += `# =============================================================================\n`;
  return out;
}

function buildDocs(groups) {
  let out = '# 📦 Estructura de Repos – Panacea Icono SA\n\n';
  out += 'Estructura generada automáticamente.\n\n';
  const order = ['apps', 'libs', 'tokens', 'contracts', 'infra', 'labs'];
  for (const g of order) {
    const items = groups[g] || [];
    if (!items.length) continue;
    out += `## ${g.toUpperCase()}\n`;
    for (const it of items) {
      out += `- ${it.path} → ${it.url} — ${it.desc || ''}\n`;
    }
    out += '\n';
  }
  out += '\n---\n\nGenerado por scripts/github-org-sync.js\n';
  return out;
}

async function run() {
  const mgr = new GitHubReposManager();
  const repos = await mgr.fetchRepositories();

  const entries = [];
  const groups = { apps: [], libs: [], tokens: [], contracts: [], infra: [], labs: [] };

  for (const repo of repos) {
    const cls = classifyRepo(repo);
    const entry = {
      path: cls.path,
      url: repo.cloneUrl,
      branch: repo.defaultBranch || 'main',
      group: cls.group,
      desc: repo.description || ''
    };
    entries.push(entry);
    groups[cls.group].push(entry);
  }

  // Ordenar alfabéticamente por path para consistencia
  entries.sort((a, b) => a.path.localeCompare(b.path));
  for (const g of Object.keys(groups)) {
    groups[g].sort((a, b) => a.path.localeCompare(b.path));
  }

  // Escribir .gitmodules
  fs.writeFileSync(path.resolve('.gitmodules'), buildGitmodules(entries));

  // Escribir docs
  fs.mkdirSync(path.resolve('docs'), { recursive: true });
  fs.writeFileSync(path.resolve('docs/REPOS-STRUCTURE.md'), buildDocs(groups));

  console.log('✅ Estructura sincronizada (.gitmodules + docs/REPOS-STRUCTURE.md)');
}

if (require.main === module) {
  run().catch((e) => {
    console.error('❌ Error en org sync:', e.message);
    process.exit(1);
  });
}

module.exports = { run };

