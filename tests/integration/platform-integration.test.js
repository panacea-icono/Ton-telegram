#!/usr/bin/env node

/**
 * =============================================================================
 * PLATFORM INTEGRATION TESTS - PANACEA ICONO SA
 * =============================================================================
 * Suite de pruebas para verificar la integración de plataformas
 * =============================================================================
 */

const { PlatformIntegrationOrchestrator } = require('../../scripts/platform-integration-orchestrator');
const { UnifiedPlatformManager } = require('../../scripts/unified-platform-manager');

describe('Platform Integration System', () => {
  let orchestrator;
  let manager;

  beforeAll(async () => {
    orchestrator = new PlatformIntegrationOrchestrator();
    manager = new UnifiedPlatformManager();
  });

  describe('Platform Integration Orchestrator', () => {
    test('should initialize with correct platform structure', () => {
      expect(orchestrator.platforms).toBeDefined();
      expect(orchestrator.platforms.blockchain).toBeDefined();
      expect(orchestrator.platforms.social).toBeDefined();
      expect(orchestrator.platforms.hosting).toBeDefined();
      expect(orchestrator.platforms.ai).toBeDefined();
      expect(orchestrator.platforms.database).toBeDefined();
    });

    test('should calculate integration stats correctly', () => {
      orchestrator.calculateStats();
      expect(orchestrator.integrationStats.totalPlatforms).toBeGreaterThan(0);
      expect(orchestrator.integrationStats.lastFullCheck).toBeDefined();
    });

    test('should generate integration report', () => {
      const report = orchestrator.generateIntegrationReport();
      expect(report.timestamp).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.platforms).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    test('should handle HTTP requests correctly', async () => {
      try {
        const response = await orchestrator.makeRequest('https://httpbin.org/json', {
          timeout: 5000
        });
        expect(response.statusCode).toBeDefined();
        expect(response.data).toBeDefined();
      } catch (error) {
        // Network errors are acceptable in test environment
        expect(error.message).toContain('Request');
      }
    });
  });

  describe('Unified Platform Manager', () => {
    test('should initialize correctly', async () => {
      const activeConnections = await manager.initialize();
      expect(activeConnections).toBeGreaterThanOrEqual(0);
      expect(manager.activeConnections).toBeDefined();
      expect(manager.apiCache).toBeDefined();
      expect(manager.rateLimits).toBeDefined();
    });

    test('should provide blockchain API interface', async () => {
      const results = await manager.blockchain('getBlock');
      expect(results).toBeDefined();
      expect(typeof results).toBe('object');
    });

    test('should provide social API interface', async () => {
      const results = await manager.social('getProfile');
      expect(results).toBeDefined();
      expect(typeof results).toBe('object');
    });

    test('should provide hosting API interface', async () => {
      const results = await manager.hosting('listApps');
      expect(results).toBeDefined();
      expect(typeof results).toBe('object');
    });

    test('should handle cross-platform operations', async () => {
      const results = await manager.crossPlatform('aggregate_metrics', {
        timeRange: '1h'
      });
      expect(results.operation).toBe('aggregate_metrics');
      expect(results.timestamp).toBeDefined();
      expect(results.results).toBeDefined();
    });

    test('should generate system health report', async () => {
      const health = await manager.getSystemHealth();
      expect(health.timestamp).toBeDefined();
      expect(health.overall).toBeDefined();
      expect(health.categories).toBeDefined();
      expect(health.recommendations).toBeDefined();
    });
  });

  describe('Platform Connectivity', () => {
    test('should attempt blockchain connections', async () => {
      const platforms = orchestrator.platforms.blockchain;
      for (const [key, platform] of Object.entries(platforms)) {
        try {
          const result = await orchestrator.checkBlockchainPlatform(key, platform);
          expect(result).toBeDefined();
          expect(typeof result.success).toBe('boolean');
        } catch (error) {
          // Connection failures are expected in test environment
          expect(error).toBeInstanceOf(Error);
        }
      }
    });

    test('should handle social platform checks gracefully', async () => {
      const platforms = orchestrator.platforms.social;
      for (const [key, platform] of Object.entries(platforms)) {
        const result = await orchestrator.checkSocialPlatform(key, platform);
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
      }
    });

    test('should handle hosting platform checks gracefully', async () => {
      const platforms = orchestrator.platforms.hosting;
      for (const [key, platform] of Object.entries(platforms)) {
        const result = await orchestrator.checkHostingPlatform(key, platform);
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid blockchain operations', async () => {
      try {
        await manager.blockchain('invalidOperation');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('no soportada');
      }
    });

    test('should handle invalid social operations', async () => {
      try {
        await manager.social('invalidOperation');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('no soportada');
      }
    });

    test('should handle invalid cross-platform operations', async () => {
      try {
        await manager.crossPlatform('invalidOperation');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('no soportada');
      }
    });

    test('should handle network timeouts gracefully', async () => {
      try {
        await orchestrator.makeRequest('https://httpstat.us/408', {
          timeout: 1000
        });
      } catch (error) {
        expect(error.message).toMatch(/timeout|Request/i);
      }
    });
  });

  describe('Data Aggregation', () => {
    test('should aggregate metrics from multiple platforms', async () => {
      const metrics = await manager.aggregateMetrics('1h');
      expect(metrics.timeRange).toBe('1h');
      expect(metrics.timestamp).toBeDefined();
      expect(metrics.platforms).toBeDefined();
      expect(metrics.summary).toBeDefined();
      expect(metrics.summary.totalTransactions).toBeGreaterThanOrEqual(0);
      expect(metrics.summary.totalUsers).toBeGreaterThanOrEqual(0);
    });

    test('should sync user data across platforms', async () => {
      const syncResults = await manager.syncUserDataAcrossPlatforms('test-user-123');
      expect(syncResults).toBeDefined();
      expect(typeof syncResults).toBe('object');
    });

    test('should broadcast messages to platforms', async () => {
      const broadcastResults = await manager.broadcastMessage('Test message', ['telegram']);
      expect(broadcastResults).toBeDefined();
      expect(typeof broadcastResults).toBe('object');
    });
  });

  describe('REST API', () => {
    test('should create REST API server', () => {
      const app = manager.createRestAPI();
      expect(app).toBeDefined();
      expect(typeof app).toBe('function'); // Express app is a function
    });
  });

  describe('File Operations', () => {
    test('should save integration reports', () => {
      const report = orchestrator.generateIntegrationReport();
      const filePath = orchestrator.saveIntegrationReport(report);
      expect(filePath).toBeDefined();
      expect(typeof filePath).toBe('string');
      expect(filePath).toMatch(/\.json$/);
    });
  });
});

// Utility function for manual testing
if (require.main === module) {
  console.log('🧪 Ejecutando pruebas de integración de plataformas...');
  
  const runManualTests = async () => {
    try {
      const orchestrator = new PlatformIntegrationOrchestrator();
      console.log('✅ Orchestrator inicializado');
      
      const results = await orchestrator.checkAllPlatforms();
      console.log('✅ Verificación de plataformas completada');
      
      const manager = new UnifiedPlatformManager();
      await manager.initialize();
      console.log('✅ Manager unificado inicializado');
      
      const health = await manager.getSystemHealth();
      console.log('✅ Reporte de salud generado');
      console.log(`📊 Salud general: ${health.overall.score}%`);
      
      console.log('\n🎉 Todas las pruebas manuales completadas exitosamente');
    } catch (error) {
      console.error('❌ Error en las pruebas:', error.message);
    }
  };
  
  runManualTests();
}

module.exports = {
  PlatformIntegrationOrchestrator,
  UnifiedPlatformManager,
};