#!/usr/bin/env node

// Orquestador de despliegues (dry-run por defecto)
// Soporta: Vercel, Heroku, Hugging Face Spaces, Hostinger (FTP/SFTP)

try { require('dotenv').config(); } catch (_) {}
const { execSync } = require('child_process');

function log(s) { console.log(s); }
function run(cmd) { execSync(cmd, { stdio: 'inherit', env: process.env }); }

async function deployVercel() {
  const { VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID } = process.env;
  if (!VERCEL_TOKEN || !VERCEL_ORG_ID || !VERCEL_PROJECT_ID) return log('Vercel: variables incompletas.');
  log('Vercel: usar `vercel --token` y `vercel deploy` con proyecto configurado.');
}

async function deployHeroku() {
  const { HEROKU_API_KEY, HEROKU_APP_NAME } = process.env;
  if (!HEROKU_API_KEY || !HEROKU_APP_NAME) return log('Heroku: variables incompletas.');
  log('Heroku: usar `heroku login` y `git push heroku main` con app configurada.');
}

async function deployHuggingFace() {
  const { HUGGINGFACE_TOKEN, HF_SPACE_ID } = process.env;
  if (!HUGGINGFACE_TOKEN || !HF_SPACE_ID) return log('Hugging Face: variables incompletas.');
  log('Hugging Face: usar `huggingface_hub`/`hf` CLI o API para actualizar Space.');
}

async function deployHostinger() {
  const { HOSTINGER_FTP_HOST, HOSTINGER_FTP_USER, HOSTINGER_FTP_PASS, HOSTINGER_FTP_PATH } = process.env;
  if (!HOSTINGER_FTP_HOST || !HOSTINGER_FTP_USER || !HOSTINGER_FTP_PASS) return log('Hostinger: variables incompletas.');
  log(`Hostinger: subir artefactos por FTP/SFTP a ${HOSTINGER_FTP_HOST}:${HOSTINGER_FTP_PATH || '/public_html'}.`);
}

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.log('Uso: node scripts/hosting/deploy.js <vercel|heroku|hf|hostinger>');
    process.exit(1);
  }
  switch (target) {
    case 'vercel': return deployVercel();
    case 'heroku': return deployHeroku();
    case 'hf': return deployHuggingFace();
    case 'hostinger': return deployHostinger();
    default: console.log('Destino desconocido');
  }
}

if (require.main === module) main();

