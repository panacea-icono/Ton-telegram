#!/usr/bin/env node

/**
 * Sync the ecosystem master README into panacea-icono/panacea-icono.
 * Sources content from this repo's docs/REPOSITORIES.md and adds an overview.
 */

try { require('dotenv').config(); } catch (_) {}
const fs = require('fs');
const path = require('path');
const https = require('https');

const OWNER = 'panacea-icono';
const REPO = 'panacea-icono';
const TOKEN = process.env.GITHUB_TOKEN || '';

function http(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'Panas-Master-Readme/1.0',
      'Accept': 'application/vnd.github+json',
    };
    let data;
    if (TOKEN) headers.Authorization = `token ${TOKEN}`;
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

function b64encode(txt) { return Buffer.from(txt, 'utf8').toString('base64'); }
function b64decode(b64) { return Buffer.from(b64, 'base64').toString('utf8'); }

function buildMasterReadme() {
  const reposMdPath = path.resolve('docs/REPOSITORIES.md');
  const reposMd = fs.existsSync(reposMdPath) ? fs.readFileSync(reposMdPath, 'utf8') : '';
  const header = `# Panacea | Icono SA — Ecosistema

> Hub general del ecosistema. Este repositorio sirve como README maestro con enlaces, estado y documentación.

- Landing: https://panacea-icono.org
- Hub técnico: https://github.com/panacea-icono/Ton-telegram
- Canal oficial: https://t.me/drtapiavargas_of
- Sitio del CEO: https://drtapiavargas.com

---

## Repositorios del Ecosistema

`;
  const footer = `
---

## Automatización

- Releases coordinados, sincronización de READMEs y auditorías se gestionan desde el hub Ton-telegram.
- Para cambios: ver scripts en el hub (orchestrators, audits, sync).

`; 
  return header + (reposMd || '*Lista generada desde el hub.*') + '\n' + footer;
}

async function upsertMasterReadme() {
  const content = buildMasterReadme();
  const get = await http('GET', `/repos/${OWNER}/${REPO}/contents/README.md`);
  const body = {
    message: 'docs: sync ecosystem master README from hub',
    content: b64encode(content),
    branch: 'main'
  };
  if (get.status === 200 && get.data && get.data.sha) body.sha = get.data.sha;
  const put = await http('PUT', `/repos/${OWNER}/${REPO}/contents/README.md`, body);
  if (put.status === 200 || put.status === 201) {
    console.log('✅ Master README actualizado:', put.data && put.data.content && put.data.content.html_url ? put.data.content.html_url : 'OK');
  } else {
    console.error('❌ Error actualizando README:', put.status, put.data && put.data.message);
    process.exit(2);
  }
}

if (require.main === module) {
  if (!TOKEN) { console.error('❌ Requiere GITHUB_TOKEN en entorno'); process.exit(2); }
  upsertMasterReadme().catch(e => { console.error('❌', e.message); process.exit(1); });
}

module.exports = { upsertMasterReadme };

