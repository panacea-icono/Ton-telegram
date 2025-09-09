#!/usr/bin/env node

// Auditoría Integral - Combina auditorías de conexiones, forks y modulaciones
// Genera un reporte consolidado con análisis completo del ecosistema

try {
  require('dotenv').config();
} catch (_) {}

const fs = require('fs');
const path = require('path');

// Importar módulos de auditoría
const { runConnectionsAudit } = require('./connections-audit');
const { runForksAudit } = require('./forks-audit');
const { runModulationsAudit } = require('./modulations-audit');

// También ejecutar auditorías existentes
const { run: runBasicAudit } = require('./run-audit');
const { main: runGithubAudit } = require('./github-repos-audit');
const { main: runIntegrationsAudit } = require('./integrations-audit');

// Función para ejecutar todas las auditorías
async function runComprehensiveAudit() {
  const now = new Date().toISOString();
  console.log('🔍 Iniciando auditoría integral del ecosistema...');
  
  const results = {
    timestamp: now,
    summary: {
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warningChecks: 0
    },
    audits: {}
  };
  
  try {
    // 1. Auditoría básica (secretos y configuración general)
    console.log('\n📋 Ejecutando auditoría básica...');
    try {
      runBasicAudit();
      results.audits.basic = { status: 'completed', timestamp: new Date().toISOString() };
      results.summary.passedChecks++;
    } catch (error) {
      results.audits.basic = { status: 'error', error: error.message };
      results.summary.failedChecks++;
    }
    results.summary.totalChecks++;
    
    // 2. Auditoría de integraciones
    console.log('\n🔗 Ejecutando auditoría de integraciones...');
    try {
      await runIntegrationsAudit();
      results.audits.integrations = { status: 'completed', timestamp: new Date().toISOString() };
      results.summary.passedChecks++;
    } catch (error) {
      results.audits.integrations = { status: 'error', error: error.message };
      results.summary.failedChecks++;
    }
    results.summary.totalChecks++;
    
    // 3. Auditoría de GitHub repos
    console.log('\n🐙 Ejecutando auditoría de GitHub...');
    try {
      await runGithubAudit();
      results.audits.github = { status: 'completed', timestamp: new Date().toISOString() };
      results.summary.passedChecks++;
    } catch (error) {
      results.audits.github = { status: 'error', error: error.message };
      results.summary.failedChecks++;
    }
    results.summary.totalChecks++;
    
    // 4. Auditoría de conexiones
    console.log('\n📡 Ejecutando auditoría de conexiones...');
    try {
      results.audits.connections = await runConnectionsAudit();
      results.summary.passedChecks++;
    } catch (error) {
      results.audits.connections = { status: 'error', error: error.message };
      results.summary.failedChecks++;
    }
    results.summary.totalChecks++;
    
    // 5. Auditoría de forks y submódulos
    console.log('\n🍴 Ejecutando auditoría de forks...');
    try {
      results.audits.forks = await runForksAudit();
      results.summary.passedChecks++;
    } catch (error) {
      results.audits.forks = { status: 'error', error: error.message };
      results.summary.failedChecks++;
    }
    results.summary.totalChecks++;
    
    // 6. Auditoría de modulaciones
    console.log('\n🗂️  Ejecutando auditoría de modulaciones...');
    try {
      results.audits.modulations = await runModulationsAudit();
      results.summary.passedChecks++;
    } catch (error) {
      results.audits.modulations = { status: 'error', error: error.message };
      results.summary.failedChecks++;
    }
    results.summary.totalChecks++;
    
  } catch (error) {
    console.error('❌ Error crítico en auditoría integral:', error);
    results.summary.failedChecks++;
  }
  
  return results;
}

// Generar reporte consolidado
function generateConsolidatedReport(results) {
  const lines = [];
  
  lines.push('# 🔍 AUDITORÍA INTEGRAL DEL ECOSISTEMA PANAS TOKEN');
  lines.push(`**Fecha:** ${results.timestamp}`);
  lines.push(`**Versión:** v${require('../../package.json').version}`);
  lines.push('');
  
  // Executive Dashboard
  lines.push('## 📊 DASHBOARD EJECUTIVO');
  lines.push('');
  lines.push('### Resumen de Auditorías');
  lines.push(`| Métrica | Valor |`);
  lines.push(`|---------|-------|`);
  lines.push(`| **Total de verificaciones** | ${results.summary.totalChecks} |`);
  lines.push(`| **✅ Verificaciones exitosas** | ${results.summary.passedChecks} |`);
  lines.push(`| **❌ Verificaciones fallidas** | ${results.summary.failedChecks} |`);
  lines.push(`| **⚠️  Advertencias** | ${results.summary.warningChecks} |`);
  
  const successRate = ((results.summary.passedChecks / results.summary.totalChecks) * 100).toFixed(1);
  lines.push(`| **🎯 Tasa de éxito** | ${successRate}% |`);
  lines.push('');
  
  // Estado por categoría
  lines.push('### Estado por Categoría');
  lines.push('| Auditoría | Estado | Última ejecución |');
  lines.push('|-----------|--------|------------------|');
  
  for (const [auditName, auditData] of Object.entries(results.audits)) {
    const status = auditData.status === 'completed' ? '✅' : 
                   auditData.status === 'error' ? '❌' : 
                   auditData.timestamp ? '✅' : '⚠️';
    const timestamp = auditData.timestamp || 'No disponible';
    lines.push(`| **${auditName}** | ${status} | ${timestamp} |`);
  }
  lines.push('');
  
  // Análisis detallado por sección
  lines.push('## 🔬 ANÁLISIS DETALLADO');
  lines.push('');
  
  // Conexiones
  if (results.audits.connections && results.audits.connections.connectivity) {
    lines.push('### 📡 CONEXIONES Y CONECTIVIDAD');
    const connectivity = results.audits.connections.connectivity;
    
    for (const [category, endpoints] of Object.entries(connectivity)) {
      const successful = endpoints.filter(e => e.status === 'success').length;
      const total = endpoints.length;
      const rate = total > 0 ? ((successful / total) * 100).toFixed(1) : '0';
      
      lines.push(`**${category.toUpperCase()}**: ${successful}/${total} (${rate}%)`);
      
      // Mostrar fallos
      const failures = endpoints.filter(e => e.status !== 'success');
      if (failures.length > 0) {
        for (const failure of failures.slice(0, 3)) {
          lines.push(`  - ❌ ${failure.name}: ${failure.message}`);
        }
        if (failures.length > 3) {
          lines.push(`  - ... y ${failures.length - 3} más`);
        }
      }
      lines.push('');
    }
    
    // Variables de entorno críticas
    if (results.audits.connections.environment) {
      lines.push('**CONFIGURACIÓN DE ENTORNO:**');
      const env = results.audits.connections.environment;
      
      const dbConfigured = env.database.postgres || env.database.redis;
      const blockchainConfigured = Object.values(env.blockchains).some(Boolean);
      const externalConfigured = Object.values(env.external).some(Boolean);
      
      lines.push(`- Base de datos: ${dbConfigured ? '✅' : '❌'}`);
      lines.push(`- Blockchains: ${blockchainConfigured ? '✅' : '❌'}`);
      lines.push(`- APIs externas: ${externalConfigured ? '✅' : '❌'}`);
      lines.push('');
    }
  }
  
  // Forks y submódulos
  if (results.audits.forks && results.audits.forks.gitmodules) {
    lines.push('### 🍴 FORKS Y SUBMÓDULOS');
    const forks = results.audits.forks;
    
    if (!forks.gitmodules.error) {
      lines.push(`**SUBMÓDULOS CONFIGURADOS**: ${forks.gitmodules.total}`);
      
      if (forks.physicalDirectories) {
        const existing = forks.physicalDirectories.existing?.length || 0;
        const missing = forks.physicalDirectories.missing?.length || 0;
        
        lines.push(`- Directorios existentes: ${existing}`);
        lines.push(`- Directorios faltantes: ${missing}`);
        
        if (missing > 0) {
          lines.push('  - ⚠️  Ejecutar: `git submodule update --init --recursive`');
        }
      }
      
      if (forks.remoteConnectivity) {
        const accessible = forks.remoteConnectivity.filter(r => r.accessible).length;
        const total = forks.remoteConnectivity.length;
        lines.push(`- Repositorios accesibles: ${accessible}/${total}`);
      }
      
      if (forks.forkAnalysis) {
        lines.push(`- Repos organizacionales: ${forks.forkAnalysis.orgRepos.length}`);
        lines.push(`- Forks/externos: ${forks.forkAnalysis.forks.length}`);
      }
    } else {
      lines.push(`❌ Error: ${forks.gitmodules.error}`);
    }
    lines.push('');
  }
  
  // Modulaciones
  if (results.audits.modulations) {
    lines.push('### 🗂️  MODULACIONES Y ARQUITECTURA');
    const modulations = results.audits.modulations;
    
    if (modulations.packageFiles) {
      const validPackages = modulations.packageFiles.filter(p => !p.error).length;
      lines.push(`**PACKAGES**: ${validPackages} archivos package.json`);
      
      if (modulations.dependencyAnalysis?.conflicts?.length > 0) {
        lines.push(`- ⚠️  ${modulations.dependencyAnalysis.conflicts.length} conflictos de versión`);
      }
    }
    
    if (modulations.directoryAnalysis?.metrics) {
      const metrics = modulations.directoryAnalysis.metrics;
      lines.push(`**ESTRUCTURA**: ${metrics.totalDirectories} directorios, ${metrics.totalFiles} archivos`);
      
      if (metrics.emptyDirectories > 0) {
        lines.push(`- ⚠️  ${metrics.emptyDirectories} directorios vacíos`);
      }
    }
    
    if (modulations.configAnalysis) {
      const config = modulations.configAnalysis;
      lines.push('**CONFIGURACIÓN:**');
      lines.push(`- TypeScript: ${config.typescript.length > 0 ? '✅' : '❌'}`);
      lines.push(`- ESLint: ${config.eslint.found !== false ? '✅' : '❌'}`);
      lines.push(`- Jest: ${config.jest.found !== false ? '✅' : '❌'}`);
      lines.push(`- Docker: ${config.docker.length > 0 ? '✅' : '❌'}`);
    }
    lines.push('');
  }
  
  // Recomendaciones críticas
  lines.push('## 🚨 RECOMENDACIONES CRÍTICAS');
  lines.push('');
  
  const criticalIssues = [];
  
  // Verificar problemas críticos
  if (results.audits.connections?.environment) {
    const env = results.audits.connections.environment;
    if (!Object.values(env.blockchains).some(Boolean)) {
      criticalIssues.push('❌ **CRÍTICO**: No hay endpoints de blockchain configurados');
    }
    if (!Object.values(env.external).some(Boolean)) {
      criticalIssues.push('⚠️  **IMPORTANTE**: APIs externas no configuradas (GitHub, Telegram)');
    }
  }
  
  if (results.audits.forks?.physicalDirectories?.missing?.length > 0) {
    criticalIssues.push('⚠️  **IMPORTANTE**: Submódulos no inicializados - ejecutar `git submodule update --init --recursive`');
  }
  
  if (results.audits.modulations?.configAnalysis?.eslint?.found === false) {
    criticalIssues.push('⚠️  **CALIDAD**: ESLint no configurado - implementar linting');
  }
  
  if (criticalIssues.length > 0) {
    lines.push('### Acciones Inmediatas');
    for (const issue of criticalIssues) {
      lines.push(`${issue}`);
    }
    lines.push('');
  }
  
  lines.push('### Próximos Pasos Sugeridos');
  lines.push('1. **Configurar variables de entorno** según `env.example`');
  lines.push('2. **Inicializar submódulos** para completar la estructura');
  lines.push('3. **Implementar CI/CD** con GitHub Actions');
  lines.push('4. **Configurar linting y testing** para calidad de código');
  lines.push('5. **Documentar arquitectura** y flujo de datos entre módulos');
  lines.push('6. **Establecer monitoreo** de conexiones críticas');
  lines.push('');
  
  // Footer
  lines.push('---');
  lines.push('');
  lines.push('**🔍 Auditoría generada por:** Panas Token Ecosystem Audit Tool');
  lines.push('**📅 Próxima auditoría recomendada:** En 7 días o tras cambios significativos');
  lines.push('**📚 Documentación:** Consultar `/docs` para guías detalladas');
  lines.push('');
  lines.push('*Para regenerar este reporte: `npm run audit:comprehensive`*');
  
  return lines.join('\n');
}

// Ejecutar auditoría integral
async function main() {
  try {
    console.log('🚀 Iniciando Auditoría Integral del Ecosistema Panas Token');
    console.log('=' .repeat(60));
    
    const results = await runComprehensiveAudit();
    const report = generateConsolidatedReport(results);
    
    // Guardar reporte consolidado
    const auditDir = path.resolve('audits');
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }
    
    const timestamp = results.timestamp.replace(/[:]/g, '');
    const filename = `comprehensive-audit-${timestamp}.md`;
    const filepath = path.join(auditDir, filename);
    
    fs.writeFileSync(filepath, report);
    fs.writeFileSync(path.join(auditDir, 'comprehensive-latest.md'), report);
    
    // Guardar datos JSON completos
    const jsonFile = path.join(auditDir, `comprehensive-audit-${timestamp}.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2));
    
    console.log('');
    console.log('✅ AUDITORÍA INTEGRAL COMPLETADA');
    console.log('=' .repeat(60));
    console.log(`📄 Reporte: ${filepath}`);
    console.log(`📊 Datos: ${jsonFile}`);
    
    // Mostrar resumen ejecutivo
    const successRate = ((results.summary.passedChecks / results.summary.totalChecks) * 100).toFixed(1);
    console.log('');
    console.log('📊 RESUMEN EJECUTIVO:');
    console.log(`   ✅ ${results.summary.passedChecks}/${results.summary.totalChecks} verificaciones exitosas (${successRate}%)`);
    console.log(`   ❌ ${results.summary.failedChecks} fallos`);
    console.log(`   ⚠️  ${results.summary.warningChecks} advertencias`);
    
    // Mostrar estado crítico si hay problemas
    if (results.summary.failedChecks > 0) {
      console.log('');
      console.log('🚨 ATENCIÓN: Se detectaron problemas críticos');
      console.log('   Revisar el reporte completo para detalles y recomendaciones');
    }
    
  } catch (error) {
    console.error('❌ Error crítico en auditoría integral:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runComprehensiveAudit, generateConsolidatedReport };