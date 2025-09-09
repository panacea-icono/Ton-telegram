/**
 * Test de integración para panas-app con Ton-telegram
 */

const PanasAppIntegrator = require('../../scripts/integration/panas-app-integrator');
const fs = require('fs');
const path = require('path');

describe('Panas-App Integration', () => {
  let integrator;
  const configPath = path.join(__dirname, '../../scripts/config/panas-app.config.json');

  beforeEach(() => {
    integrator = new PanasAppIntegrator();
  });

  afterEach(() => {
    // Limpiar configuración de test si existe
    const testConfigPath = path.join(__dirname, '../../scripts/config/panas-app.config.json');
    if (fs.existsSync(testConfigPath)) {
      const config = JSON.parse(fs.readFileSync(testConfigPath, 'utf8'));
      if (config.name === 'test-panas-app') {
        fs.unlinkSync(testConfigPath);
      }
    }
  });

  test('should initialize integration with placeholder structure', async () => {
    await integrator.initialize();
    
    expect(fs.existsSync(configPath)).toBe(true);
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    expect(config.name).toBe('panas-app');
    expect(config.status).toBe('pending');
    expect(config.requiredBy).toBe('ton-telegram');
  });

  test('should check integration health correctly', async () => {
    await integrator.initialize();
    
    const health = await integrator.checkIntegrationHealth();
    
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('panasAppAvailable');
    expect(health).toHaveProperty('configExists');
    expect(health).toHaveProperty('lastCheck');
    expect(health.configExists).toBe(true);
    expect(health.panasAppAvailable).toBe(false); // porque no está inicializado el submódulo
    expect(health.status).toBe('waiting');
  });

  test('should detect if panas-app is not available', async () => {
    const isAvailable = await integrator.isPanasAppAvailable();
    expect(isAvailable).toBe(false);
  });

  test('should create proper configuration structure', async () => {
    await integrator.createPlaceholderStructure();
    
    expect(fs.existsSync(configPath)).toBe(true);
    
    const config = integrator.getConfig();
    expect(config.integrationEndpoints).toHaveProperty('tokenization');
    expect(config.integrationEndpoints).toHaveProperty('wallet');
    expect(config.integrationEndpoints).toHaveProperty('sync');
  });

  test('should update configuration correctly', () => {
    const updates = {
      status: 'testing',
      testMode: true
    };
    
    integrator.updateConfig(updates);
    
    const config = integrator.getConfig();
    expect(config.status).toBe('testing');
    expect(config.testMode).toBe(true);
    expect(config.lastUpdated).toBeDefined();
  });

  test('should handle sync when panas-app is not available', async () => {
    const result = await integrator.syncWithPanasApp();
    expect(result).toBe(false);
  });
});