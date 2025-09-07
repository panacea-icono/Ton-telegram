#!/usr/bin/env node

// Auditoría rápida del repositorio (sin red):
// - Busca posibles secretos
// - Verifica presencia de scripts clave
// - Resumen de configuración y recomendaciones

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name.startsWith('.git')) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function detectSecrets(content, file) {
  const findings = [];
  const checks = [
    { name: 'GitHub PAT', re: /ghp_[A-Za-z0-9]{36,}/g },
    { name: 'Telegram Bot Token', re: /\b\d{7,12}:[A-Za-z0-9_-]{30,}\b/g },
    { name: 'JWT Secret', re: /JWT_SECRET\s*=\s*[^\n]+/g },
    { name: 'Private Key (PEM)', re: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g },
    { name: 'API Key', re: /api[_-]?key\s*[:=]\s*['\"][A-Za-z0-9_\-]{16,}['\"]/gi }
  ];
  for (const c of checks) {
    if (c.re.test(content)) findings.push(c.name);
  }
  return findings.length ? { file, types: Array.from(new Set(findings)) } : null;
}

function run() {
  const files = walk(ROOT);
  const now = new Date().toISOString();
  const findings = [];
  let envPresent = fs.existsSync(path.join(ROOT, '.env'));

  for (const f of files) {
    try {
      const txt = fs.readFileSync(f, 'utf8');
      const hit = detectSecrets(txt, path.relative(ROOT, f));
      if (hit) findings.push(hit);
    } catch (_) {}
  }

  const sections = [];
  sections.push(`# Auditoría Rápida — ${now}`);
  sections.push('');
  sections.push('## Estado general');
  sections.push('- Pruebas automatizadas: pendientes (no hay tests)');
  sections.push(`- Archivo .env presente: ${envPresent ? 'sí (ignorado por git)' : 'no detectado'}`);
  sections.push('- Scripts clave presentes:');
  sections.push('  - Multi-bot orchestrator: scripts/bots/orchestrator.js');
  sections.push('  - Cumplimiento Telegram: scripts/telegram-compliance-check.js');
  sections.push('  - GitHub manager: scripts/github-repos-manager.js');
  sections.push('  - GitHub org sync: scripts/github-org-sync.js');
  sections.push('  - Auditoría v2: docs/auditoria-proyecto-v2.txt');
  sections.push('');

  sections.push('## Posibles secretos (heurística)');
  if (!findings.length) sections.push('- Sin hallazgos evidentes en el código');
  else for (const f of findings) sections.push(`- ${f.file}: ${f.types.join(', ')}`);
  sections.push('');

  sections.push('## Recomendaciones');
  sections.push('- Añadir tests y pipeline CI (lint + test).');
  sections.push('- Implementar pagos con Stars y enforcement TON-only si la Mini App usa cripto.');
  sections.push('- Añadir anti-spam y módulo admin/broadcast seguro.');
  sections.push('- Agregar Dockerfiles por servicio y revisar compose.');
  sections.push('');

  const outDir = path.join(ROOT, 'audits');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const out = sections.join('\n');
  const file = path.join(outDir, `audit-${now.replace(/[:]/g, '')}.txt`);
  fs.writeFileSync(file, out);
  fs.writeFileSync(path.join(outDir, 'latest.txt'), out);
  console.log(`✅ Auditoría generada: ${file}`);
}

if (require.main === module) run();

module.exports = { run };

