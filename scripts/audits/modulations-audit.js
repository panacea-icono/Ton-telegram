#!/usr/bin/env node

// Auditoría de Modulaciones - Analiza estructura modular, dependencias y arquitectura
// Evalúa la organización del código, interdependencias y cohesión modular

try {
  require('dotenv').config();
} catch (_) {}

const fs = require('fs');
const path = require('path');

// Configuración de tipos de archivos y patrones
const FILE_PATTERNS = {
  config: ['package.json', 'tsconfig.json', 'jest.config.js', '.eslintrc*', 'webpack.config.js'],
  documentation: ['README.md', 'CHANGELOG.md', 'docs/**/*.md'],
  infrastructure: ['Dockerfile', 'docker-compose*.yml', '.github/**/*.yml', 'vercel.json'],
  scripts: ['scripts/**/*.js', 'scripts/**/*.ts', 'scripts/**/*.sh'],
  source: ['src/**/*.js', 'src/**/*.ts', 'lib/**/*.js', 'lib/**/*.ts'],
  frontend: ['frontend/**/*.js', 'frontend/**/*.jsx', 'frontend/**/*.ts', 'frontend/**/*.tsx'],
  backend: ['backend/**/*.js', 'backend/**/*.ts', 'api/**/*.js', 'api/**/*.ts'],
  contracts: ['contracts/**/*.sol', 'contracts/**/*.ts', 'contracts/**/*.js'],
  tests: ['tests/**/*.js', 'tests/**/*.ts', '**/*.test.js', '**/*.spec.js'],
};

// Función para encontrar archivos por patrón
function findFilesByPattern(baseDir, patterns) {
  const found = [];
  
  function walkDir(dir, relativePath = '') {
    if (!fs.existsSync(dir)) return;
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.name === 'node_modules' || item.name === '.git') continue;
        
        const fullPath = path.join(dir, item.name);
        const relPath = path.join(relativePath, item.name);
        
        if (item.isDirectory()) {
          walkDir(fullPath, relPath);
        } else {
          // Verificar si el archivo coincide con algún patrón
          for (const pattern of patterns) {
            if (matchesPattern(relPath, pattern)) {
              found.push({
                path: relPath,
                fullPath: fullPath,
                size: getFileSize(fullPath),
                lastModified: getLastModified(fullPath)
              });
              break;
            }
          }
        }
      }
    } catch (error) {
      // Ignorar errores de permisos
    }
  }
  
  walkDir(baseDir);
  return found;
}

function matchesPattern(filePath, pattern) {
  // Convertir patrón glob simple a regex
  const regexPattern = pattern
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\./g, '\\.');
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function getLastModified(filePath) {
  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return null;
  }
}

// Analizar package.json files para dependencias
function analyzePackageJsonFiles() {
  const packageFiles = [];
  
  function findPackageJson(dir, relativePath = '') {
    if (!fs.existsSync(dir)) return;
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.name === 'node_modules' || item.name === '.git') continue;
        
        const fullPath = path.join(dir, item.name);
        const relPath = path.join(relativePath, item.name);
        
        if (item.isDirectory()) {
          findPackageJson(fullPath, relPath);
        } else if (item.name === 'package.json') {
          try {
            const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            packageFiles.push({
              path: relPath,
              fullPath: fullPath,
              content: content,
              dependencies: Object.keys(content.dependencies || {}),
              devDependencies: Object.keys(content.devDependencies || {}),
              scripts: Object.keys(content.scripts || {}),
            });
          } catch (parseError) {
            packageFiles.push({
              path: relPath,
              fullPath: fullPath,
              error: parseError.message
            });
          }
        }
      }
    } catch (error) {
      // Ignorar errores de permisos
    }
  }
  
  findPackageJson(process.cwd());
  return packageFiles;
}

// Analizar estructura de directorios
function analyzeDirectoryStructure() {
  const structure = {
    apps: analyzeSubdirectories('apps'),
    backend: analyzeSubdirectories('backend'),
    frontend: analyzeSubdirectories('frontend'), 
    contracts: analyzeSubdirectories('contracts'),
    tokens: analyzeSubdirectories('tokens'),
    scripts: analyzeSubdirectories('scripts'),
    tests: analyzeSubdirectories('tests'),
    docs: analyzeSubdirectories('docs'),
    infrastructure: analyzeSubdirectories('infrastructure'),
    config: analyzeSubdirectories('config'),
  };
  
  // Calcular métricas generales
  const metrics = {
    totalDirectories: 0,
    totalFiles: 0,
    totalSize: 0,
    emptyDirectories: 0,
    largestFiles: []
  };
  
  for (const [category, data] of Object.entries(structure)) {
    if (data && !data.error) {
      metrics.totalDirectories += data.subdirectories?.length || 0;
      metrics.totalFiles += data.totalFiles || 0;
      metrics.totalSize += data.totalSize || 0;
      metrics.emptyDirectories += data.emptyDirectories || 0;
      
      if (data.largestFiles) {
        metrics.largestFiles.push(...data.largestFiles);
      }
    }
  }
  
  // Ordenar archivos más grandes
  metrics.largestFiles.sort((a, b) => b.size - a.size);
  metrics.largestFiles = metrics.largestFiles.slice(0, 20);
  
  return { structure, metrics };
}

function analyzeSubdirectories(basePath) {
  if (!fs.existsSync(basePath)) {
    return { error: `Directorio ${basePath} no existe` };
  }
  
  const result = {
    exists: true,
    subdirectories: [],
    files: [],
    totalFiles: 0,
    totalSize: 0,
    emptyDirectories: 0,
    largestFiles: []
  };
  
  try {
    const items = fs.readdirSync(basePath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(basePath, item.name);
      
      if (item.isDirectory()) {
        const subDirAnalysis = analyzeDirectoryRecursive(fullPath);
        result.subdirectories.push({
          name: item.name,
          path: fullPath,
          ...subDirAnalysis
        });
        
        result.totalFiles += subDirAnalysis.fileCount;
        result.totalSize += subDirAnalysis.totalSize;
        
        if (subDirAnalysis.fileCount === 0) {
          result.emptyDirectories++;
        }
        
        if (subDirAnalysis.largestFiles) {
          result.largestFiles.push(...subDirAnalysis.largestFiles);
        }
      } else {
        const fileStats = fs.statSync(fullPath);
        const fileInfo = {
          name: item.name,
          path: fullPath,
          size: fileStats.size,
          lastModified: fileStats.mtime
        };
        
        result.files.push(fileInfo);
        result.totalFiles++;
        result.totalSize += fileStats.size;
        result.largestFiles.push(fileInfo);
      }
    }
    
    // Ordenar archivos por tamaño
    result.largestFiles.sort((a, b) => b.size - a.size);
    result.largestFiles = result.largestFiles.slice(0, 10);
    
  } catch (error) {
    result.error = error.message;
  }
  
  return result;
}

function analyzeDirectoryRecursive(dirPath) {
  const result = {
    fileCount: 0,
    totalSize: 0,
    largestFiles: []
  };
  
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.git') {
        const subResult = analyzeDirectoryRecursive(fullPath);
        result.fileCount += subResult.fileCount;
        result.totalSize += subResult.totalSize;
        result.largestFiles.push(...subResult.largestFiles);
      } else if (item.isFile()) {
        const stats = fs.statSync(fullPath);
        result.fileCount++;
        result.totalSize += stats.size;
        result.largestFiles.push({
          path: fullPath,
          size: stats.size,
          lastModified: stats.mtime
        });
      }
    }
  } catch (error) {
    // Ignorar errores de acceso
  }
  
  return result;
}

// Analizar dependencias entre módulos
function analyzeDependencies(packageFiles) {
  const dependencies = {
    internal: [], // Referencias entre módulos del proyecto
    external: [], // Dependencias de terceros
    conflicts: [], // Versiones conflictivas
    unused: []     // Posibles dependencias no utilizadas
  };
  
  const allDependencies = new Map();
  
  // Recopilar todas las dependencias
  for (const pkg of packageFiles) {
    if (pkg.error) continue;
    
    const deps = [...pkg.dependencies, ...pkg.devDependencies];
    
    for (const dep of deps) {
      if (!allDependencies.has(dep)) {
        allDependencies.set(dep, []);
      }
      allDependencies.get(dep).push({
        package: pkg.path,
        version: pkg.content.dependencies?.[dep] || pkg.content.devDependencies?.[dep]
      });
    }
  }
  
  // Analizar conflictos de versión
  for (const [depName, usages] of allDependencies.entries()) {
    if (usages.length > 1) {
      const versions = [...new Set(usages.map(u => u.version))];
      if (versions.length > 1) {
        dependencies.conflicts.push({
          dependency: depName,
          versions: versions,
          usages: usages
        });
      }
    }
  }
  
  // Identificar dependencias externas más comunes
  const externalCounts = new Map();
  for (const [depName, usages] of allDependencies.entries()) {
    if (!depName.startsWith('@panacea') && !depName.startsWith('panas-')) {
      externalCounts.set(depName, usages.length);
    }
  }
  
  dependencies.external = Array.from(externalCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));
  
  return dependencies;
}

// Analizar configuración y consistencia
function analyzeConfiguration() {
  const configs = {
    typescript: analyzeTypeScriptConfig(),
    eslint: analyzeESLintConfig(),
    jest: analyzeJestConfig(),
    docker: analyzeDockerConfig(),
    github: analyzeGitHubConfig()
  };
  
  return configs;
}

function analyzeTypeScriptConfig() {
  const tsconfigFiles = ['tsconfig.json', 'tsconfig.base.json', 'tsconfig.build.json'];
  const found = [];
  
  for (const file of tsconfigFiles) {
    if (fs.existsSync(file)) {
      try {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        found.push({ file, content });
      } catch (error) {
        found.push({ file, error: error.message });
      }
    }
  }
  
  return found;
}

function analyzeESLintConfig() {
  const eslintFiles = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', '.eslintrc.yaml'];
  
  for (const file of eslintFiles) {
    if (fs.existsSync(file)) {
      try {
        let content;
        if (file.endsWith('.js')) {
          content = 'JavaScript config file';
        } else {
          content = JSON.parse(fs.readFileSync(file, 'utf8'));
        }
        return { file, content };
      } catch (error) {
        return { file, error: error.message };
      }
    }
  }
  
  return { found: false };
}

function analyzeJestConfig() {
  const jestFiles = ['jest.config.js', 'jest.config.json', 'jest.config.ts'];
  
  for (const file of jestFiles) {
    if (fs.existsSync(file)) {
      return { file, exists: true };
    }
  }
  
  return { found: false };
}

function analyzeDockerConfig() {
  const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'];
  const found = [];
  
  for (const file of dockerFiles) {
    if (fs.existsSync(file)) {
      found.push({ file, size: getFileSize(file) });
    }
  }
  
  return found;
}

function analyzeGitHubConfig() {
  const githubDir = '.github';
  const config = { workflows: [], templates: [] };
  
  if (fs.existsSync(githubDir)) {
    const workflowsDir = path.join(githubDir, 'workflows');
    if (fs.existsSync(workflowsDir)) {
      try {
        const workflows = fs.readdirSync(workflowsDir);
        config.workflows = workflows.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
      } catch (error) {
        config.workflowsError = error.message;
      }
    }
  }
  
  return config;
}

// Función principal de auditoría
async function runModulationsAudit() {
  const now = new Date().toISOString();
  
  console.log('🔍 Iniciando auditoría de modulaciones...');
  
  console.log('📁 Analizando estructura de archivos...');
  const fileStructure = {};
  for (const [category, patterns] of Object.entries(FILE_PATTERNS)) {
    fileStructure[category] = findFilesByPattern(process.cwd(), patterns);
  }
  
  console.log('📦 Analizando archivos package.json...');
  const packageFiles = analyzePackageJsonFiles();
  
  console.log('🗂️  Analizando estructura de directorios...');
  const directoryAnalysis = analyzeDirectoryStructure();
  
  console.log('🔗 Analizando dependencias...');
  const dependencyAnalysis = analyzeDependencies(packageFiles);
  
  console.log('⚙️  Analizando configuración...');
  const configAnalysis = analyzeConfiguration();
  
  return {
    timestamp: now,
    fileStructure,
    packageFiles,
    directoryAnalysis,
    dependencyAnalysis,
    configAnalysis
  };
}

// Generar reporte de auditoría
function generateReport(results) {
  const lines = [];
  
  lines.push(`# Auditoría de Modulaciones — ${results.timestamp}`);
  lines.push('');
  
  // Resumen ejecutivo
  const totalPackages = results.packageFiles.filter(p => !p.error).length;
  const totalFiles = Object.values(results.fileStructure).reduce((sum, files) => sum + files.length, 0);
  const totalDirectories = results.directoryAnalysis.metrics.totalDirectories;
  const totalSize = formatBytes(results.directoryAnalysis.metrics.totalSize);
  
  lines.push('## Resumen Ejecutivo');
  lines.push(`- Archivos analizados: ${totalFiles}`);
  lines.push(`- Directorios: ${totalDirectories}`);
  lines.push(`- Packages encontrados: ${totalPackages}`);
  lines.push(`- Tamaño total: ${totalSize}`);
  lines.push(`- Conflictos de dependencias: ${results.dependencyAnalysis.conflicts.length}`);
  lines.push('');
  
  // Estructura de archivos
  lines.push('## Estructura de Archivos por Categoría');
  for (const [category, files] of Object.entries(results.fileStructure)) {
    if (files.length > 0) {
      lines.push(`### ${category} (${files.length})`);
      const recentFiles = files
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 5);
      
      for (const file of recentFiles) {
        const size = formatBytes(file.size);
        lines.push(`- ${file.path} (${size})`);
      }
      
      if (files.length > 5) {
        lines.push(`- ... y ${files.length - 5} más`);
      }
      lines.push('');
    }
  }
  
  // Análisis de package.json
  lines.push('## Package.json Files');
  if (results.packageFiles.length > 0) {
    lines.push(`### Encontrados (${totalPackages})`);
    for (const pkg of results.packageFiles) {
      if (pkg.error) {
        lines.push(`❌ ${pkg.path}: ${pkg.error}`);
      } else {
        const deps = pkg.dependencies.length;
        const devDeps = pkg.devDependencies.length;
        const scripts = pkg.scripts.length;
        lines.push(`✅ ${pkg.path}: ${deps} deps, ${devDeps} devDeps, ${scripts} scripts`);
      }
    }
    lines.push('');
  }
  
  // Estructura de directorios
  lines.push('## Análisis de Directorios');
  for (const [category, data] of Object.entries(results.directoryAnalysis.structure)) {
    if (data && !data.error && data.exists) {
      lines.push(`### ${category}`);
      lines.push(`- Subdirectorios: ${data.subdirectories.length}`);
      lines.push(`- Archivos totales: ${data.totalFiles}`);
      lines.push(`- Tamaño: ${formatBytes(data.totalSize)}`);
      lines.push(`- Directorios vacíos: ${data.emptyDirectories}`);
      
      if (data.subdirectories.length > 0) {
        lines.push('**Subdirectorios principales:**');
        for (const subdir of data.subdirectories.slice(0, 5)) {
          lines.push(`  - ${subdir.name}: ${subdir.fileCount} archivos`);
        }
        if (data.subdirectories.length > 5) {
          lines.push(`  - ... y ${data.subdirectories.length - 5} más`);
        }
      }
      lines.push('');
    }
  }
  
  // Análisis de dependencias
  lines.push('## Análisis de Dependencias');
  
  if (results.dependencyAnalysis.conflicts.length > 0) {
    lines.push(`### Conflictos de Versión (${results.dependencyAnalysis.conflicts.length})`);
    for (const conflict of results.dependencyAnalysis.conflicts.slice(0, 10)) {
      lines.push(`⚠️  **${conflict.dependency}**: ${conflict.versions.join(', ')}`);
      for (const usage of conflict.usages) {
        lines.push(`   - ${usage.package}: ${usage.version}`);
      }
    }
    if (results.dependencyAnalysis.conflicts.length > 10) {
      lines.push(`... y ${results.dependencyAnalysis.conflicts.length - 10} más`);
    }
    lines.push('');
  }
  
  if (results.dependencyAnalysis.external.length > 0) {
    lines.push('### Dependencias Externas Más Usadas');
    for (const dep of results.dependencyAnalysis.external.slice(0, 15)) {
      lines.push(`- **${dep.name}**: usado en ${dep.count} packages`);
    }
    lines.push('');
  }
  
  // Configuración
  lines.push('## Análisis de Configuración');
  
  lines.push('### TypeScript');
  if (results.configAnalysis.typescript.length > 0) {
    for (const config of results.configAnalysis.typescript) {
      if (config.error) {
        lines.push(`❌ ${config.file}: ${config.error}`);
      } else {
        lines.push(`✅ ${config.file}: configurado`);
      }
    }
  } else {
    lines.push('❌ No se encontró configuración de TypeScript');
  }
  lines.push('');
  
  lines.push('### ESLint');
  if (results.configAnalysis.eslint.found === false) {
    lines.push('❌ No se encontró configuración de ESLint');
  } else {
    lines.push(`✅ ${results.configAnalysis.eslint.file}: configurado`);
  }
  lines.push('');
  
  lines.push('### Jest');
  if (results.configAnalysis.jest.found === false) {
    lines.push('❌ No se encontró configuración de Jest');
  } else {
    lines.push(`✅ ${results.configAnalysis.jest.file}: configurado`);
  }
  lines.push('');
  
  lines.push('### Docker');
  if (results.configAnalysis.docker.length > 0) {
    for (const docker of results.configAnalysis.docker) {
      lines.push(`✅ ${docker.file}: ${formatBytes(docker.size)}`);
    }
  } else {
    lines.push('❌ No se encontraron archivos Docker');
  }
  lines.push('');
  
  lines.push('### GitHub Actions');
  if (results.configAnalysis.github.workflows.length > 0) {
    lines.push(`✅ ${results.configAnalysis.github.workflows.length} workflows configurados:`);
    for (const workflow of results.configAnalysis.github.workflows) {
      lines.push(`  - ${workflow}`);
    }
  } else {
    lines.push('❌ No se encontraron workflows de GitHub Actions');
  }
  lines.push('');
  
  // Métricas de calidad
  lines.push('## Métricas de Calidad Modular');
  
  const emptyDirsRatio = results.directoryAnalysis.metrics.emptyDirectories / 
                        Math.max(results.directoryAnalysis.metrics.totalDirectories, 1);
  const packagesRatio = totalPackages / Math.max(totalDirectories, 1);
  
  lines.push(`- Ratio directorios vacíos: ${(emptyDirsRatio * 100).toFixed(1)}%`);
  lines.push(`- Packages por directorio: ${packagesRatio.toFixed(2)}`);
  lines.push(`- Archivos más grandes:`);
  
  for (const file of results.directoryAnalysis.metrics.largestFiles.slice(0, 5)) {
    lines.push(`  - ${file.path || file.name}: ${formatBytes(file.size)}`);
  }
  lines.push('');
  
  // Recomendaciones
  lines.push('## Recomendaciones');
  
  if (results.dependencyAnalysis.conflicts.length > 0) {
    lines.push('### Resolución de Conflictos');
    lines.push('- Standardizar versiones de dependencias compartidas');
    lines.push('- Usar herramientas como `npm ls` para detectar duplicados');
    lines.push('- Considerar usar workspaces para gestión unificada');
    lines.push('');
  }
  
  if (results.configAnalysis.eslint.found === false) {
    lines.push('### Configuración de Linting');
    lines.push('- Instalar y configurar ESLint para consistencia de código');
    lines.push('- Añadir Prettier para formateo automático');
    lines.push('- Configurar pre-commit hooks');
    lines.push('');
  }
  
  if (results.configAnalysis.jest.found === false) {
    lines.push('### Testing');
    lines.push('- Configurar Jest para testing unitario');
    lines.push('- Añadir tests para módulos críticos');
    lines.push('- Implementar coverage reporting');
    lines.push('');
  }
  
  lines.push('### Arquitectura Modular');
  lines.push('- Definir interfaces claras entre módulos');
  lines.push('- Implementar barrel exports para mejor encapsulación');
  lines.push('- Documentar arquitectura y flujo de datos');
  lines.push('- Considerar migración a monorepo con herramientas como Lerna o Nx');
  lines.push('- Implementar dependency injection para mejor testabilidad');
  
  return lines.join('\n');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Ejecutar auditoría
async function main() {
  try {
    const results = await runModulationsAudit();
    const report = generateReport(results);
    
    // Guardar reporte
    const auditDir = path.resolve('audits');
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }
    
    const timestamp = results.timestamp.replace(/[:]/g, '');
    const filename = `modulations-audit-${timestamp}.txt`;
    const filepath = path.join(auditDir, filename);
    
    fs.writeFileSync(filepath, report);
    fs.writeFileSync(path.join(auditDir, 'modulations-latest.txt'), report);
    
    // Guardar datos JSON para procesamiento posterior
    const jsonFile = path.join(auditDir, `modulations-audit-${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2));
    
    console.log(`\n✅ Auditoría de modulaciones completada: ${filepath}`);
    
    // Mostrar resumen
    const totalFiles = Object.values(results.fileStructure).reduce((sum, files) => sum + files.length, 0);
    const totalPackages = results.packageFiles.filter(p => !p.error).length;
    
    console.log(`📊 Resumen: ${totalFiles} archivos, ${totalPackages} packages analizados`);
    
  } catch (error) {
    console.error('❌ Error en auditoría de modulaciones:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runModulationsAudit, generateReport };