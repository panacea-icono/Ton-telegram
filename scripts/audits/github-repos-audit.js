#!/usr/bin/env node

// Genera un informe de auditoría de repos GitHub basado en docs/repositories.json
// Si no existe, intenta generarlo invocando el manager.

try { require('dotenv').config(); } catch (_) {}
const fs = require('fs');
const path = require('path');

function ensureRepositoriesJson() {
  const p = path.resolve('docs/repositories.json');
  if (fs.existsSync(p)) return p;
  // Intentar generarlo
  try {
    const { spawnSync } = require('child_process');
    const res = spawnSync('node', ['scripts/github-repos-manager.js', 'json'], { encoding: 'utf8' });
    if (res.status === 0) {
      fs.writeFileSync(p, res.stdout);
      return p;
    }
  } catch (_) {}
  throw new Error('No se pudo obtener docs/repositories.json');
}

function main() {
  const jsonPath = ensureRepositoriesJson();
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const repos = data.repositories || [];
  const stats = data.statistics || {};

  // Lenguajes top (si viene como string, parsear)
  let topLangs = stats.languages || '';
  if (Array.isArray(topLangs)) topLangs = topLangs.join(', ');

  const recent = [...repos]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10)
    .map(r => `- ${r.fullName || r.name} | ${r.language || 'n/a'} | ⭐ ${r.stars} | ${r.isPrivate ? 'private' : 'public'} | ${new Date(r.updatedAt).toISOString()}`)
    .join('\n');

  const sizeTotal = repos.reduce((s, r) => s + (r.size || 0), 0);
  const priv = repos.filter(r => r.isPrivate).length;
  const pub = repos.length - priv;

  const out = [
    `# Auditoría de Repos GitHub — ${new Date().toISOString()}`,
    '',
    '## Resumen',
    `- Total repos: ${repos.length}`,
    `- Públicos: ${pub}`,
    `- Privados: ${priv}`,
    `- Estrellas totales: ${repos.reduce((s,r)=>s+(r.stars||0),0)}`,
    `- Forks totales: ${repos.reduce((s,r)=>s+(r.forks||0),0)}`,
    `- Tamaño total (KB aproximado API): ${sizeTotal}`,
    `- Lenguajes más usados: ${topLangs || 'n/a'}`,
    '',
    '## Repos recientes (actualizados)',
    recent || '- n/a',
    '',
    '## Recomendaciones',
    '- Revisar repos sin licencia o descripción y completarlos.',
    '- Archivar repos obsoletos; activar protección de ramas en repos críticos.',
    '- Habilitar CI en repos principales.'
  ].join('\n');

  const dir = path.resolve('audits');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `github-repos-audit-${new Date().toISOString().replace(/[:]/g,'')}.txt`);
  fs.writeFileSync(file, out);
  fs.writeFileSync(path.join(dir, 'github-latest.txt'), out);
  console.log(`✅ Auditoría de GitHub generada: ${file}`);
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌', e.message); process.exit(1); }
}

module.exports = { main };

