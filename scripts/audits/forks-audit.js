#!/usr/bin/env node

// Auditoría de Forks y Submódulos - Verifica estado de git submodules, forks y sincronización
// Analiza la estructura de repositorios vinculados y su estado de sincronización

try {
  require('dotenv').config();
} catch (_) {}

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Función para ejecutar comandos git de forma segura
function gitCommand(cmd, cwd = process.cwd()) {
  try {
    return execSync(`git ${cmd}`, { 
      encoding: 'utf8', 
      cwd,
      stdio: 'pipe'
    }).trim();
  } catch (error) {
    return { error: error.message };
  }
}

// Analizar archivo .gitmodules
function parseGitmodules() {
  const gitmodulesPath = path.resolve('.gitmodules');
  
  if (!fs.existsSync(gitmodulesPath)) {
    return { error: 'Archivo .gitmodules no encontrado' };
  }
  
  const content = fs.readFileSync(gitmodulesPath, 'utf8');
  const modules = [];
  const lines = content.split('\n');
  
  let currentModule = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('[submodule')) {
      if (currentModule) modules.push(currentModule);
      const nameMatch = trimmed.match(/\[submodule "([^"]+)"\]/);
      currentModule = { 
        name: nameMatch ? nameMatch[1] : 'unknown',
        path: '',
        url: '',
        branch: 'main'
      };
    } else if (currentModule && trimmed.includes('=')) {
      const [key, value] = trimmed.split('=').map(s => s.trim());
      if (key === 'path') currentModule.path = value;
      else if (key === 'url') currentModule.url = value;
      else if (key === 'branch') currentModule.branch = value;
    }
  }
  
  if (currentModule) modules.push(currentModule);
  
  return { modules, total: modules.length };
}

// Verificar estado de submódulos
function checkSubmoduleStatus() {
  const status = gitCommand('submodule status --recursive');
  
  if (status.error) {
    return { error: status.error };
  }
  
  const lines = status.split('\n').filter(line => line.trim());
  const submodules = lines.map(line => {
    const trimmed = line.trim();
    let statusChar = trimmed[0];
    let hash = '';
    let path = '';
    let branch = '';
    
    if (statusChar === '-' || statusChar === '+' || statusChar === 'U') {
      const parts = trimmed.slice(1).trim().split(/\s+/);
      hash = parts[0] || '';
      path = parts[1] || '';
      branch = parts[2] ? parts[2].replace(/[()]/g, '') : '';
    } else {
      const parts = trimmed.split(/\s+/);
      hash = parts[0] || '';
      path = parts[1] || '';
      branch = parts[2] ? parts[2].replace(/[()]/g, '') : '';
      statusChar = ' '; // normal
    }
    
    return {
      status: statusChar,
      hash,
      path,
      branch,
      description: getStatusDescription(statusChar)
    };
  });
  
  return { submodules, total: submodules.length };
}

function getStatusDescription(statusChar) {
  switch (statusChar) {
    case '-': return 'No inicializado';
    case '+': return 'Commit diferente al registrado';
    case 'U': return 'Conflicto de merge';
    case ' ': return 'Actualizado';
    default: return 'Estado desconocido';
  }
}

// Verificar directorios físicos vs configuración
function checkPhysicalDirectories() {
  const gitmodulesData = parseGitmodules();
  
  if (gitmodulesData.error) {
    return gitmodulesData;
  }
  
  const directories = {
    existing: [],
    missing: [],
    unexpected: []
  };
  
  // Verificar directorios esperados
  for (const module of gitmodulesData.modules) {
    const fullPath = path.resolve(module.path);
    if (fs.existsSync(fullPath)) {
      // Verificar si es un directorio git válido
      const gitDir = path.join(fullPath, '.git');
      const isGitRepo = fs.existsSync(gitDir);
      
      directories.existing.push({
        ...module,
        fullPath,
        isGitRepo,
        isEmpty: isDirectoryEmpty(fullPath)
      });
    } else {
      directories.missing.push(module);
    }
  }
  
  // Buscar directorios inesperados en rutas de submódulos
  const basePaths = ['apps', 'tokens', 'contracts', 'infra', 'labs'];
  for (const basePath of basePaths) {
    if (fs.existsSync(basePath)) {
      const items = fs.readdirSync(basePath, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          const fullPath = path.join(basePath, item.name);
          const isConfigured = gitmodulesData.modules.some(m => m.path === fullPath);
          
          if (!isConfigured) {
            directories.unexpected.push({
              path: fullPath,
              isGitRepo: fs.existsSync(path.join(fullPath, '.git')),
              isEmpty: isDirectoryEmpty(fullPath)
            });
          }
        }
      }
    }
  }
  
  return directories;
}

function isDirectoryEmpty(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.length === 0 || (files.length === 1 && files[0] === '.git');
  } catch {
    return true;
  }
}

// Verificar conectividad de repositorios remotos
function checkRemoteConnectivity(modules) {
  return new Promise((resolve) => {
    const results = [];
    let completed = 0;
    
    if (modules.length === 0) {
      resolve([]);
      return;
    }
    
    modules.forEach((module, index) => {
      // Usar git ls-remote para verificar accesibilidad
      const child = spawn('git', ['ls-remote', '--heads', module.url], {
        stdio: 'pipe',
        timeout: 10000
      });
      
      let output = '';
      let error = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      child.on('close', (code) => {
        results[index] = {
          ...module,
          accessible: code === 0,
          error: code !== 0 ? (error || 'Connection failed') : null,
          branches: code === 0 ? parseBranches(output) : []
        };
        
        completed++;
        if (completed === modules.length) {
          resolve(results);
        }
      });
      
      child.on('error', (err) => {
        results[index] = {
          ...module,
          accessible: false,
          error: err.message,
          branches: []
        };
        
        completed++;
        if (completed === modules.length) {
          resolve(results);
        }
      });
    });
  });
}

function parseBranches(gitOutput) {
  const lines = gitOutput.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const parts = line.split('\t');
    const ref = parts[1] || '';
    const branch = ref.replace('refs/heads/', '');
    return branch;
  }).filter(branch => branch);
}

// Detectar repositorios fork
function detectForks(modules) {
  const forks = [];
  const orgRepos = [];
  
  for (const module of modules) {
    if (module.url.includes('github.com')) {
      const urlMatch = module.url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      if (urlMatch) {
        const [, owner, repo] = urlMatch;
        
        if (owner === 'panacea-icono') {
          orgRepos.push({ ...module, owner, repo });
        } else if (owner === 'https-panacea-icono-org') {
          // Posible fork o mirror
          forks.push({ ...module, owner, repo, type: 'potential-fork' });
        } else {
          forks.push({ ...module, owner, repo, type: 'external' });
        }
      }
    }
  }
  
  return { forks, orgRepos };
}

// Función principal de auditoría
async function runForksAudit() {
  const now = new Date().toISOString();
  const results = {
    timestamp: now,
    gitmodules: parseGitmodules(),
    submoduleStatus: checkSubmoduleStatus(),
    physicalDirectories: checkPhysicalDirectories(),
    remoteConnectivity: [],
    forkAnalysis: { forks: [], orgRepos: [] }
  };
  
  console.log('🔍 Iniciando auditoría de forks y submódulos...');
  
  // Análisis de conectividad remota
  if (!results.gitmodules.error && results.gitmodules.modules.length > 0) {
    console.log('📡 Verificando conectividad de repositorios remotos...');
    results.remoteConnectivity = await checkRemoteConnectivity(results.gitmodules.modules);
    
    // Análisis de forks
    results.forkAnalysis = detectForks(results.gitmodules.modules);
  }
  
  return results;
}

// Generar reporte de auditoría
function generateReport(results) {
  const lines = [];
  
  lines.push(`# Auditoría de Forks y Submódulos — ${results.timestamp}`);
  lines.push('');
  
  // Resumen ejecutivo
  const totalModules = results.gitmodules.modules?.length || 0;
  const existingDirs = results.physicalDirectories.existing?.length || 0;
  const missingDirs = results.physicalDirectories.missing?.length || 0;
  const accessibleRepos = results.remoteConnectivity.filter(r => r.accessible).length;
  
  lines.push('## Resumen Ejecutivo');
  lines.push(`- Submódulos configurados: ${totalModules}`);
  lines.push(`- Directorios existentes: ${existingDirs}`);
  lines.push(`- Directorios faltantes: ${missingDirs}`);
  lines.push(`- Repositorios accesibles: ${accessibleRepos}/${totalModules}`);
  lines.push('');
  
  // Configuración de submódulos
  lines.push('## Configuración de Submódulos (.gitmodules)');
  if (results.gitmodules.error) {
    lines.push(`❌ Error: ${results.gitmodules.error}`);
  } else {
    lines.push(`✅ Archivo .gitmodules encontrado con ${totalModules} submódulos`);
    
    // Agrupar por categoría
    const categories = {};
    for (const module of results.gitmodules.modules) {
      const category = module.path.split('/')[0];
      if (!categories[category]) categories[category] = [];
      categories[category].push(module);
    }
    
    for (const [category, modules] of Object.entries(categories)) {
      lines.push(`### ${category} (${modules.length})`);
      for (const module of modules.slice(0, 5)) { // Mostrar solo los primeros 5
        lines.push(`- ${module.name}: ${module.path}`);
      }
      if (modules.length > 5) {
        lines.push(`- ... y ${modules.length - 5} más`);
      }
      lines.push('');
    }
  }
  
  // Estado de submódulos
  lines.push('## Estado de Submódulos');
  if (results.submoduleStatus.error) {
    lines.push(`❌ Error: ${results.submoduleStatus.error}`);
  } else if (results.submoduleStatus.total === 0) {
    lines.push('⚠️  No hay submódulos inicializados');
  } else {
    lines.push(`✅ ${results.submoduleStatus.total} submódulos detectados`);
    
    const statusCounts = {};
    for (const sub of results.submoduleStatus.submodules) {
      const desc = sub.description;
      statusCounts[desc] = (statusCounts[desc] || 0) + 1;
    }
    
    for (const [status, count] of Object.entries(statusCounts)) {
      lines.push(`- ${status}: ${count}`);
    }
  }
  lines.push('');
  
  // Directorios físicos
  lines.push('## Análisis de Directorios');
  const dirs = results.physicalDirectories;
  
  if (dirs.existing?.length > 0) {
    lines.push(`### Directorios Existentes (${dirs.existing.length})`);
    for (const dir of dirs.existing.slice(0, 10)) {
      const status = dir.isGitRepo ? '📁' : '📂';
      const empty = dir.isEmpty ? ' (vacío)' : '';
      lines.push(`${status} ${dir.path}${empty}`);
    }
    if (dirs.existing.length > 10) {
      lines.push(`... y ${dirs.existing.length - 10} más`);
    }
    lines.push('');
  }
  
  if (dirs.missing?.length > 0) {
    lines.push(`### Directorios Faltantes (${dirs.missing.length})`);
    for (const dir of dirs.missing.slice(0, 10)) {
      lines.push(`❌ ${dir.path} (${dir.name})`);
    }
    if (dirs.missing.length > 10) {
      lines.push(`... y ${dirs.missing.length - 10} más`);
    }
    lines.push('');
  }
  
  if (dirs.unexpected?.length > 0) {
    lines.push(`### Directorios No Configurados (${dirs.unexpected.length})`);
    for (const dir of dirs.unexpected) {
      const status = dir.isGitRepo ? '📁' : '📂';
      lines.push(`${status} ${dir.path}`);
    }
    lines.push('');
  }
  
  // Conectividad remota
  lines.push('## Conectividad de Repositorios');
  if (results.remoteConnectivity.length > 0) {
    const accessible = results.remoteConnectivity.filter(r => r.accessible);
    const inaccessible = results.remoteConnectivity.filter(r => !r.accessible);
    
    lines.push(`### Accesibles (${accessible.length})`);
    for (const repo of accessible.slice(0, 5)) {
      const branches = repo.branches.slice(0, 3).join(', ');
      lines.push(`✅ ${repo.name}: ${branches || 'sin branches'}`);
    }
    if (accessible.length > 5) {
      lines.push(`... y ${accessible.length - 5} más`);
    }
    lines.push('');
    
    if (inaccessible.length > 0) {
      lines.push(`### Inaccesibles (${inaccessible.length})`);
      for (const repo of inaccessible.slice(0, 10)) {
        lines.push(`❌ ${repo.name}: ${repo.error}`);
      }
      if (inaccessible.length > 10) {
        lines.push(`... y ${inaccessible.length - 10} más`);
      }
      lines.push('');
    }
  } else {
    lines.push('⚠️  No se verificó conectividad remota');
    lines.push('');
  }
  
  // Análisis de forks
  const forkAnalysis = results.forkAnalysis;
  lines.push('## Análisis de Forks');
  lines.push(`- Repositorios de la organización: ${forkAnalysis.orgRepos.length}`);
  lines.push(`- Posibles forks/externos: ${forkAnalysis.forks.length}`);
  
  if (forkAnalysis.forks.length > 0) {
    lines.push('### Repositorios Externos/Forks');
    for (const fork of forkAnalysis.forks) {
      lines.push(`- **${fork.name}** (${fork.owner}): ${fork.type}`);
    }
  }
  lines.push('');
  
  // Recomendaciones
  lines.push('## Recomendaciones');
  
  if (results.submoduleStatus.total === 0 && totalModules > 0) {
    lines.push('### Inicialización de Submódulos');
    lines.push('```bash');
    lines.push('git submodule init');
    lines.push('git submodule update --recursive');
    lines.push('```');
    lines.push('');
  }
  
  if (missingDirs > 0) {
    lines.push('### Directorios Faltantes');
    lines.push('- Ejecutar `git submodule update --init --recursive`');
    lines.push('- Verificar permisos de acceso a repositorios privados');
    lines.push('');
  }
  
  const inaccessibleCount = results.remoteConnectivity.filter(r => !r.accessible).length;
  if (inaccessibleCount > 0) {
    lines.push('### Conectividad');
    lines.push('- Verificar configuración de SSH keys para repositorios privados');
    lines.push('- Validar URLs de repositorios en .gitmodules');
    lines.push('- Considerar usar HTTPS en lugar de SSH si hay problemas de conectividad');
    lines.push('');
  }
  
  lines.push('### Mantenimiento General');
  lines.push('- Implementar CI/CD para sincronización automática de submódulos');
  lines.push('- Configurar hooks para validar estado de submódulos antes de commits');
  lines.push('- Documentar proceso de actualización de submódulos');
  lines.push('- Considerar usar Git LFS para assets grandes en submódulos');
  
  return lines.join('\n');
}

// Ejecutar auditoría
async function main() {
  try {
    const results = await runForksAudit();
    const report = generateReport(results);
    
    // Guardar reporte
    const auditDir = path.resolve('audits');
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }
    
    const timestamp = results.timestamp.replace(/[:]/g, '');
    const filename = `forks-audit-${timestamp}.txt`;
    const filepath = path.join(auditDir, filename);
    
    fs.writeFileSync(filepath, report);
    fs.writeFileSync(path.join(auditDir, 'forks-latest.txt'), report);
    
    // Guardar datos JSON para procesamiento posterior
    const jsonFile = path.join(auditDir, `forks-audit-${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2));
    
    console.log(`\n✅ Auditoría de forks y submódulos completada: ${filepath}`);
    
    // Mostrar resumen
    const totalModules = results.gitmodules.modules?.length || 0;
    const accessibleRepos = results.remoteConnectivity.filter(r => r.accessible).length;
    
    console.log(`📊 Resumen: ${accessibleRepos}/${totalModules} repositorios accesibles`);
    
  } catch (error) {
    console.error('❌ Error en auditoría de forks:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runForksAudit, generateReport };