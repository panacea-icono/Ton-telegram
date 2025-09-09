#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - SERVICE ORCHESTRATOR
 * =============================================================================
 * Modular service orchestrator for coordinating ecosystem components
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load other modulators
const APIModulator = require('./api-modulator');
const DatabaseModulator = require('./database-modulator');
const WalletModulator = require('./wallet-modulator');
const AIModulator = require('./ai-modulator');
const TelegramModulator = require('./telegram-modulator');
const DeploymentModulator = require('./deployment-modulator');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

class ServiceOrchestrator {
  constructor() {
    this.modulators = {};
    this.serviceStatus = {};
    this.config = this.loadConfiguration();
    
    this.initializeModulators();
  }

  loadConfiguration() {
    try {
      // Load environment variables
      require('dotenv').config({ path: '.env.local' });
      
      // Default configuration
      return {
        services: {
          api: { enabled: true, port: process.env.API_PORT || 3001 },
          database: { enabled: true, provider: 'postgresql' },
          wallet: { enabled: true, chains: ['TON', 'Solana', 'Algorand', 'BSC'] },
          ai: { enabled: true, providers: ['openai', 'huggingface'] },
          telegram: { enabled: true, mode: 'polling' },
          deployment: { enabled: true, platforms: ['vercel', 'heroku', 'docker'] }
        },
        orchestration: {
          startupOrder: ['database', 'api', 'wallet', 'ai', 'telegram'],
          healthCheckInterval: 30000, // 30 seconds
          autoRestart: true,
          maxRestarts: 3
        }
      };
    } catch (error) {
      logError(`Error loading configuration: ${error.message}`);
      return {};
    }
  }

  initializeModulators() {
    logStep('INIT', 'Initializing service modulators...');
    
    try {
      this.modulators = {
        api: new APIModulator(this.config.services.api),
        database: new DatabaseModulator(this.config.services.database),
        wallet: new WalletModulator(this.config.services.wallet),
        ai: new AIModulator(this.config.services.ai),
        telegram: new TelegramModulator(this.config.services.telegram),
        deployment: new DeploymentModulator(this.config.services.deployment)
      };

      // Initialize service status
      Object.keys(this.modulators).forEach(service => {
        this.serviceStatus[service] = {
          status: 'initialized',
          startTime: null,
          restartCount: 0,
          lastError: null
        };
      });

      logSuccess('All modulators initialized successfully');
    } catch (error) {
      logError(`Error initializing modulators: ${error.message}`);
      throw error;
    }
  }

  async startServices() {
    log('\n🚀 STARTING ECOSYSTEM SERVICES', 'bright');
    log('=' .repeat(60), 'cyan');

    const startOrder = this.config.orchestration?.startupOrder || Object.keys(this.modulators);
    
    for (const serviceName of startOrder) {
      await this.startService(serviceName);
      
      // Wait between service starts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    logSuccess('All services started successfully');
    this.startHealthCheck();
  }

  async startService(serviceName) {
    logStep(`START-${serviceName.toUpperCase()}`, `Starting ${serviceName} service...`);
    
    try {
      const modulator = this.modulators[serviceName];
      if (!modulator) {
        throw new Error(`Modulator not found: ${serviceName}`);
      }

      await modulator.start();
      
      this.serviceStatus[serviceName] = {
        ...this.serviceStatus[serviceName],
        status: 'running',
        startTime: new Date(),
        lastError: null
      };

      logSuccess(`${serviceName} service started successfully`);
      return true;
    } catch (error) {
      this.serviceStatus[serviceName] = {
        ...this.serviceStatus[serviceName],
        status: 'error',
        lastError: error.message
      };

      logError(`Failed to start ${serviceName}: ${error.message}`);
      return false;
    }
  }

  async stopServices() {
    log('\n🛑 STOPPING ECOSYSTEM SERVICES', 'bright');
    log('=' .repeat(60), 'cyan');

    // Stop in reverse order
    const stopOrder = [...(this.config.orchestration?.startupOrder || Object.keys(this.modulators))].reverse();
    
    for (const serviceName of stopOrder) {
      await this.stopService(serviceName);
    }

    logSuccess('All services stopped successfully');
  }

  async stopService(serviceName) {
    logStep(`STOP-${serviceName.toUpperCase()}`, `Stopping ${serviceName} service...`);
    
    try {
      const modulator = this.modulators[serviceName];
      if (!modulator) {
        throw new Error(`Modulator not found: ${serviceName}`);
      }

      await modulator.stop();
      
      this.serviceStatus[serviceName] = {
        ...this.serviceStatus[serviceName],
        status: 'stopped',
        startTime: null
      };

      logSuccess(`${serviceName} service stopped successfully`);
      return true;
    } catch (error) {
      logError(`Failed to stop ${serviceName}: ${error.message}`);
      return false;
    }
  }

  async restartServices() {
    log('\n🔄 RESTARTING ECOSYSTEM SERVICES', 'bright');
    log('=' .repeat(60), 'cyan');

    await this.stopServices();
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    await this.startServices();
  }

  async restartService(serviceName) {
    logStep(`RESTART-${serviceName.toUpperCase()}`, `Restarting ${serviceName} service...`);
    
    const currentRestarts = this.serviceStatus[serviceName]?.restartCount || 0;
    const maxRestarts = this.config.orchestration?.maxRestarts || 3;

    if (currentRestarts >= maxRestarts) {
      logError(`Maximum restart attempts (${maxRestarts}) reached for ${serviceName}`);
      return false;
    }

    await this.stopService(serviceName);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const started = await this.startService(serviceName);
    
    if (started) {
      this.serviceStatus[serviceName].restartCount = currentRestarts + 1;
    }

    return started;
  }

  async checkServiceHealth() {
    const healthResults = {};
    
    for (const [serviceName, modulator] of Object.entries(this.modulators)) {
      try {
        const isHealthy = await modulator.checkHealth();
        healthResults[serviceName] = {
          healthy: isHealthy,
          status: this.serviceStatus[serviceName]?.status || 'unknown'
        };

        // Auto-restart if enabled and service is unhealthy
        if (!isHealthy && this.config.orchestration?.autoRestart) {
          logWarning(`Service ${serviceName} is unhealthy, attempting restart...`);
          await this.restartService(serviceName);
        }
      } catch (error) {
        healthResults[serviceName] = {
          healthy: false,
          error: error.message,
          status: this.serviceStatus[serviceName]?.status || 'unknown'
        };
      }
    }

    return healthResults;
  }

  startHealthCheck() {
    if (!this.config.orchestration?.healthCheckInterval) return;

    setInterval(async () => {
      const health = await this.checkServiceHealth();
      
      // Log health status periodically
      const unhealthyServices = Object.entries(health)
        .filter(([, status]) => !status.healthy)
        .map(([name]) => name);

      if (unhealthyServices.length > 0) {
        logWarning(`Unhealthy services detected: ${unhealthyServices.join(', ')}`);
      }
    }, this.config.orchestration.healthCheckInterval);
  }

  async getServiceStatus() {
    const health = await this.checkServiceHealth();
    
    return Object.entries(this.serviceStatus).map(([name, status]) => ({
      name,
      ...status,
      healthy: health[name]?.healthy || false
    }));
  }

  generateStatusReport() {
    log('\n📊 SERVICE STATUS REPORT', 'bright');
    log('=' .repeat(60), 'cyan');

    Object.entries(this.serviceStatus).forEach(([name, status]) => {
      const statusIcon = status.status === 'running' ? '✅' : 
                        status.status === 'stopped' ? '⏹️' : 
                        status.status === 'error' ? '❌' : '⚪';
      
      log(`${statusIcon} ${name.toUpperCase()}: ${status.status}`);
      
      if (status.startTime) {
        log(`   Started: ${status.startTime.toLocaleString()}`);
      }
      if (status.restartCount > 0) {
        log(`   Restarts: ${status.restartCount}`);
      }
      if (status.lastError) {
        log(`   Last Error: ${status.lastError}`, 'red');
      }
    });
  }

  async executeCommand(command, ...args) {
    switch (command) {
      case 'start':
        await this.startServices();
        break;
      case 'stop':
        await this.stopServices();
        break;
      case 'restart':
        await this.restartServices();
        break;
      case 'status':
        const status = await this.getServiceStatus();
        console.table(status);
        break;
      case 'health':
        const health = await this.checkServiceHealth();
        console.table(health);
        break;
      case 'report':
        this.generateStatusReport();
        break;
      case 'service':
        if (args.length >= 2) {
          const [action, serviceName] = args;
          if (action === 'start') {
            await this.startService(serviceName);
          } else if (action === 'stop') {
            await this.stopService(serviceName);
          } else if (action === 'restart') {
            await this.restartService(serviceName);
          }
        }
        break;
      default:
        log('Available commands: start, stop, restart, status, health, report, service <action> <name>');
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'status';
  const args = process.argv.slice(3);

  try {
    const orchestrator = new ServiceOrchestrator();
    await orchestrator.executeCommand(command, ...args);
  } catch (error) {
    logError(`Orchestrator error: ${error.message}`);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ServiceOrchestrator;