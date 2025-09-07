#!/usr/bin/env node

try {
  require('dotenv').config();
} catch (_) {}
const fs = require('fs');
const path = require('path');

function loadRepos() {
  const p = path.resolve('docs/repositories.json');
  if (!fs.existsSync(p))
    throw new Error(
      'docs/repositories.json no encontrado. Ejecuta github:repos:list'
    );
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  return data.repositories || [];
}

function sanitizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, '-');
}

function packagePlan(repo) {
  const name = repo.name;
  const lang = (repo.language || '').toLowerCase();
  const pkg = sanitizeName(name);
  const scope = '@panacea-icono';
  const npm = `${scope}/${pkg}`;
  const ghcr = `ghcr.io/panacea-icono/${pkg}`;
  const type =
    lang.includes('javascript') || lang.includes('typescript')
      ? 'node'
      : 'container';
  return {
    name,
    fullName: repo.fullName,
    language: repo.language,
    type,
    npm,
    ghcr,
  };
}

function buildDocs(plans, tag) {
  const lines = [];
  lines.push(`# Plan de Publicación de Packages — ${new Date().toISOString()}`);
  lines.push(`Tag de ecosistema sugerido: ${tag}`);
  lines.push('');
  for (const p of plans) {
    lines.push(`## ${p.fullName}`);
    lines.push(`- Lenguaje: ${p.language || 'n/a'}`);
    lines.push(`- Tipo: ${p.type}`);
    lines.push('- NPM (GitHub Packages): `' + p.npm + '`');
    lines.push('- Docker (GHCR): `' + p.ghcr + '`');
    lines.push('Instalación (propuesta):');
    if (p.type === 'node') {
      lines.push('```bash');
      lines.push(`# NPM (GitHub Packages requiere auth con GITHUB_TOKEN)`);
      lines.push(`npm install ${p.npm}`);
      lines.push('```');
    }
    lines.push('```bash');
    lines.push(`# Docker (GHCR)`);
    lines.push(`docker pull ${p.ghcr}:${tag}`);
    lines.push('```');
    lines.push('');
  }
  return lines.join('\n');
}

function ecosystemTag() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `v0.1.0-ecosystem-${y}${m}${day}`;
}

function main() {
  const repos = loadRepos();
  const plans = repos.map(packagePlan);
  const tag = ecosystemTag();
  const dir = path.resolve('docs/releases');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'PACKAGES_MANIFEST.json'),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), tag, items: plans },
      null,
      2
    )
  );
  fs.writeFileSync(path.join(dir, 'PACKAGES_PLAN.md'), buildDocs(plans, tag));
  console.log(
    `✅ PACKAGES plan generado para ${plans.length} repos → docs/releases/PACKAGES_PLAN.md`
  );
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}

module.exports = { main };
