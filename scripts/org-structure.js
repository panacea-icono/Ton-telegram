#!/usr/bin/env node

/**
 * =============================================================================
 * ORG STRUCTURE SYNC - PANACEA ICONO SA
 * =============================================================================
 * Define y sincroniza una estructura óptima de submódulos (.gitmodules)
 * y genera documentación de la disposición de repos (docs/REPOS-STRUCTURE.md).
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

// Manifiesto de estructura recomendada
const STRUCTURE = [
  // Core apps/bots
  { name: 'Ton-telegram', url: 'https://github.com/panacea-icono/Ton-telegram.git', path: 'apps/ton-telegram-bot', branch: 'main', group: 'apps', desc: 'Bot Telegram TON (pagos)' },

  // Labs / académicos (no core)
  { name: 'HUGGING_FACE', url: 'https://github.com/panacea-icono/HUGGING_FACE.git', path: 'labs/HUGGING_FACE', branch: 'main', group: 'labs', desc: 'Modelos IA / ML' },
  { name: 'FIBONACCI-FINAL-MODULOS-API-MAESTRO', url: 'https://github.com/panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO.git', path: 'labs/FIBONACCI-FINAL-MODULOS-API-MAESTRO', branch: 'main', group: 'labs', desc: 'API Maestra Fibonacci' },
  { name: 'tutor_academico_CIRUGIA_I-II-III', url: 'https://github.com/panacea-icono/tutor_academico_CIRUGIA_I-II-III.git', path: 'labs/tutor_academico_CIRUGIA_I-II-III', branch: 'main', group: 'labs', desc: 'Tutor académico cirugía' },
  { name: 'kuchiuyas', url: 'https://github.com/panacea-icono/kuchiuyas.git', path: 'labs/kuchiuyas', branch: 'main', group: 'labs', desc: 'Gestión/monitoreo pacientes' },
];

function renderGitmodules(items) {
  const header = `# =============================================================================
# GIT SUBMODULES - ORGANIZED STRUCTURE
# =============================================================================
# Estructura recomendada por dominios (apps, libs, tokens, contracts, infra, labs)
# =============================================================================\n\n`;
  const blocks = items
    .map(it => `
[submodule "${it.path}"]
    path = ${it.path}
    url = ${it.url}
    branch = ${it.branch}
`.trim())
    .join('\n\n');
  return header + blocks + '\n\n# =============================================================================\n';
}

function renderDocs(items) {
  const groups = {};
  for (const it of items) {
    groups[it.group] = groups[it.group] || [];
    groups[it.group].push(it);
  }
  const order = ['apps', 'libs', 'tokens', 'contracts', 'infra', 'labs'];
  let out = '# 📦 Estructura de Repos – Panacea Icono SA\n\n';
  out += 'Estructura recomendada de repositorios organizada por dominios.\n\n';
  for (const g of order) {
    if (!groups[g] || !groups[g].length) continue;
    out += `## ${g.toUpperCase()}\n`;
    for (const it of groups[g]) {
      out += `- ${it.path} → ${it.url} — ${it.desc || ''}\n`;
    }
    out += '\n';
  }
  out += '\n---\n\nGenerado por scripts/org-structure.js';
  return out;
}

async function sync() {
  const gitmodules = renderGitmodules(STRUCTURE);
  fs.writeFileSync(path.resolve('.gitmodules'), gitmodules);
  fs.mkdirSync(path.resolve('docs'), { recursive: true });
  fs.writeFileSync(path.resolve('docs/REPOS-STRUCTURE.md'), renderDocs(STRUCTURE));
  console.log('✅ .gitmodules y docs/REPOS-STRUCTURE.md actualizados');
}

if (require.main === module) {
  sync().catch(err => {
    console.error('❌ Error sincronizando estructura:', err.message);
    process.exit(1);
  });
}

module.exports = { sync };

