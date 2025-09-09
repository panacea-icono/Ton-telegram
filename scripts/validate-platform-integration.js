#!/usr/bin/env node

/**
 * =============================================================================
 * PLATFORM INTEGRATION VALIDATION - PANACEA ICONO SA
 * =============================================================================
 * Script de validación para verificar el funcionamiento de la integración
 * =============================================================================
 */

console.log('🧪 Validando Sistema de Integración de Plataformas...\n');

async function validatePlatformIntegration() {
  try {
    // Test 1: Verificar que los módulos se cargan correctamente
    console.log('📦 Test 1: Cargando módulos...');
    const { PlatformIntegrationOrchestrator } = require('../scripts/platform-integration-orchestrator');
    const { UnifiedPlatformManager } = require('../scripts/unified-platform-manager');
    console.log('✅ Módulos cargados correctamente\n');

    // Test 2: Inicializar orchestrator
    console.log('🔧 Test 2: Inicializando Orchestrator...');
    const orchestrator = new PlatformIntegrationOrchestrator();
    console.log(`✅ Orchestrator inicializado con ${orchestrator.integrationStats.totalPlatforms} plataformas\n`);

    // Test 3: Generar reporte de integración
    console.log('📄 Test 3: Generando reporte de integración...');
    const report = orchestrator.generateIntegrationReport();
    console.log(`✅ Reporte generado: ${report.summary.totalPlatforms} plataformas detectadas\n`);

    // Test 4: Verificar estructura de plataformas
    console.log('🏗️ Test 4: Verificando estructura de plataformas...');
    const categories = Object.keys(orchestrator.platforms);
    console.log(`✅ Categorías disponibles: ${categories.join(', ')}\n`);

    // Test 5: Inicializar unified manager
    console.log('🔄 Test 5: Inicializando Unified Manager...');
    const manager = new UnifiedPlatformManager();
    await manager.initialize();
    console.log(`✅ Manager inicializado con ${manager.activeConnections.size} conexiones activas\n`);

    // Test 6: Verificar APIs unificadas
    console.log('🌐 Test 6: Probando APIs unificadas...');
    const blockchainResults = await manager.blockchain('getBlock');
    const socialResults = await manager.social('getProfile');
    const hostingResults = await manager.hosting('listApps');
    console.log('✅ APIs unificadas funcionando correctamente\n');

    // Test 7: Operaciones cross-platform
    console.log('🔗 Test 7: Probando operaciones cross-platform...');
    const metrics = await manager.aggregateMetrics('1h');
    console.log(`✅ Métricas agregadas: ${metrics.summary.totalTransactions} transacciones simuladas\n`);

    // Test 8: Reporte de salud del sistema
    console.log('🏥 Test 8: Generando reporte de salud...');
    const health = await manager.getSystemHealth();
    console.log(`✅ Reporte de salud: ${health.overall.score}% de salud general\n`);

    // Test 9: Crear API REST
    console.log('🌐 Test 9: Creando API REST...');
    const app = manager.createRestAPI();
    console.log('✅ API REST creada correctamente\n');

    // Test 10: Guardar reportes
    console.log('💾 Test 10: Guardando reportes...');
    const reportFile = orchestrator.saveIntegrationReport(report);
    console.log(`✅ Reporte guardado en: ${reportFile}\n`);

    console.log('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE');
    console.log('\n📊 Resumen de Validación:');
    console.log(`• Plataformas configuradas: ${orchestrator.integrationStats.totalPlatforms}`);
    console.log(`• Conexiones activas: ${manager.activeConnections.size}`);
    console.log(`• Salud del sistema: ${health.overall.score}%`);
    console.log(`• Categorías de plataformas: ${categories.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error durante la validación:', error.message);
    console.error('📍 Stack trace:', error.stack);
    return false;
  }
}

// Ejecutar validación
if (require.main === module) {
  validatePlatformIntegration()
    .then((success) => {
      if (success) {
        console.log('\n✅ Validación completada exitosamente');
        process.exit(0);
      } else {
        console.log('\n❌ Validación falló');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { validatePlatformIntegration };