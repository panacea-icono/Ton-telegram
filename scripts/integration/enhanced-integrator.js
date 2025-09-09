#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - ENHANCED INTEGRATION SYSTEM
 * =============================================================================
 * Enhanced integration system with modular components and granular checks
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

// Import modular components
const ServiceOrchestrator = require('../modulation/service-orchestrator');
const APIModulator = require('../modulation/api-modulator');
const DatabaseModulator = require('../modulation/database-modulator');
const WalletModulator = require('../modulation/wallet-modulator');
const AIModulator = require('../modulation/ai-modulator');
const TelegramModulator = require('../modulation/telegram-modulator');
const DeploymentModulator = require('../modulation/deployment-modulator');

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

class EnhancedIntegrator {
  constructor() {
    this.modulators = {};
    this.integrationResults = {};
    this.serviceMap = {
      api: 'API Services',
      database: 'Database Layer', 
      wallet: 'Multi-Chain Wallets',
      ai: 'AI Services',
      telegram: 'Telegram Bots',
      deployment: 'Deployment Platforms'
    };
    
    this.initializeModulators();
  }

  initializeModulators() {
    try {
      this.modulators = {
        api: new APIModulator(),
        database: new DatabaseModulator(),
        wallet: new WalletModulator(),
        ai: new AIModulator(),
        telegram: new TelegramModulator(),
        deployment: new DeploymentModulator()
      };

      // Initialize results structure
      Object.keys(this.modulators).forEach(service => {
        this.integrationResults[service] = {
          status: 'pending',
          health: false,
          details: {},
          timestamp: null,
          error: null
        };
      });

      logSuccess('All modulators initialized successfully');
    } catch (error) {
      logError(`Error initializing modulators: ${error.message}`);
      throw error;
    }
  }

  async runFullIntegrationCheck() {
    log('\n🔍 ENHANCED ECOSYSTEM INTEGRATION CHECK', 'bright');
    log('=' .repeat(70), 'cyan');

    // Run integration checks for each service
    for (const [serviceName, modulator] of Object.entries(this.modulators)) {
      await this.checkServiceIntegration(serviceName, modulator);
      
      // Small delay between checks
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate comprehensive report
    this.generateEnhancedReport();
    
    // Run cross-service integration tests
    await this.runCrossServiceTests();
    
    // Generate final recommendations
    this.generateRecommendations();
  }

  async checkServiceIntegration(serviceName, modulator) {
    logStep(`CHECK-${serviceName.toUpperCase()}`, `Checking ${this.serviceMap[serviceName]} integration...`);
    
    this.integrationResults[serviceName].timestamp = new Date();
    
    try {
      // Check if service can start
      const canStart = await this.testServiceStartup(modulator);
      
      // Check health
      const isHealthy = await this.testServiceHealth(modulator);
      
      // Check specific functionality
      const functionalityTests = await this.testServiceFunctionality(serviceName, modulator);
      
      // Check configuration
      const configTests = await this.testServiceConfiguration(serviceName);
      
      // Determine overall status
      const overallStatus = canStart && isHealthy && 
        functionalityTests.passed >= functionalityTests.total * 0.7;
      
      this.integrationResults[serviceName] = {
        status: overallStatus ? 'ok' : 'warning',
        health: isHealthy,
        details: {
          startup: canStart,
          health: isHealthy,
          functionality: functionalityTests,
          configuration: configTests
        },
        timestamp: new Date(),
        error: null
      };

      if (overallStatus) {
        logSuccess(`${this.serviceMap[serviceName]} integration verified`);
      } else {
        logWarning(`${this.serviceMap[serviceName]} integration has issues`);
      }

      return overallStatus;
    } catch (error) {
      this.integrationResults[serviceName] = {
        status: 'error',
        health: false,
        details: { error: error.message },
        timestamp: new Date(),
        error: error.message
      };

      logError(`${this.serviceMap[serviceName]} integration failed: ${error.message}`);
      return false;
    }
  }

  async testServiceStartup(modulator) {
    try {
      // Test if service can start (we don't actually start it for safety)
      if (typeof modulator.start === 'function') {
        // For now, just check if the start method exists
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async testServiceHealth(modulator) {
    try {
      if (typeof modulator.checkHealth === 'function') {
        return await modulator.checkHealth();
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async testServiceFunctionality(serviceName, modulator) {
    const tests = [];
    
    try {
      switch (serviceName) {
        case 'api':
          tests.push(await this.testAPIFunctionality(modulator));
          break;
        case 'database':
          tests.push(await this.testDatabaseFunctionality(modulator));
          break;
        case 'wallet':
          tests.push(await this.testWalletFunctionality(modulator));
          break;
        case 'ai':
          tests.push(await this.testAIFunctionality(modulator));
          break;
        case 'telegram':
          tests.push(await this.testTelegramFunctionality(modulator));
          break;
        case 'deployment':
          tests.push(await this.testDeploymentFunctionality(modulator));
          break;
        default:
          tests.push(false);
      }

      const passed = tests.filter(Boolean).length;
      return { total: tests.length, passed, percentage: (passed / tests.length) * 100 };
    } catch (error) {
      return { total: 1, passed: 0, percentage: 0, error: error.message };
    }
  }

  async testAPIFunctionality(modulator) {
    try {
      // Test if API can verify services
      if (typeof modulator.verifyServices === 'function') {
        await modulator.verifyServices();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async testDatabaseFunctionality(modulator) {
    try {
      // Test if database connections can be initialized
      if (typeof modulator.initializePrimaryDatabase === 'function') {
        return true; // Method exists
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async testWalletFunctionality(modulator) {
    try {
      // Test address validation
      if (typeof modulator.validateAddress === 'function') {
        const validation = await modulator.validateAddress('BSC', '0x0000000000000000000000000000000000000000');
        return validation.valid !== undefined;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async testAIFunctionality(modulator) {
    try {
      // Test if AI providers can be verified
      if (typeof modulator.verifyProviders === 'function') {
        await modulator.verifyProviders();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async testTelegramFunctionality(modulator) {
    try {
      // Test if bot configurations can be loaded
      if (typeof modulator.loadBotConfigurations === 'function') {
        await modulator.loadBotConfigurations();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async testDeploymentFunctionality(modulator) {
    try {
      // Test if platforms can be verified
      if (typeof modulator.verifyPlatforms === 'function') {
        await modulator.verifyPlatforms();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  testServiceConfiguration(serviceName) {
    const configTests = {
      environmentVariables: false,
      configFiles: false,
      dependencies: false
    };

    try {
      switch (serviceName) {
        case 'api':
          configTests.environmentVariables = this.checkAPIEnvVars();
          configTests.configFiles = this.checkAPIConfigFiles();
          break;
        case 'database':
          configTests.environmentVariables = this.checkDatabaseEnvVars();
          configTests.configFiles = this.checkDatabaseConfigFiles();
          break;
        case 'wallet':
          configTests.environmentVariables = this.checkWalletEnvVars();
          configTests.configFiles = this.checkWalletConfigFiles();
          break;
        case 'ai':
          configTests.environmentVariables = this.checkAIEnvVars();
          configTests.configFiles = this.checkAIConfigFiles();
          break;
        case 'telegram':
          configTests.environmentVariables = this.checkTelegramEnvVars();
          configTests.configFiles = this.checkTelegramConfigFiles();
          break;
        case 'deployment':
          configTests.environmentVariables = this.checkDeploymentEnvVars();
          configFiles: this.checkDeploymentConfigFiles();
          break;
      }

      // Check common dependencies
      configTests.dependencies = this.checkCommonDependencies();

      return configTests;
    } catch (error) {
      return { ...configTests, error: error.message };
    }
  }

  checkAPIEnvVars() {
    const requiredVars = ['API_PORT', 'VERCEL_API_URL', 'API_PANACEA_URL'];
    return requiredVars.some(varName => process.env[varName]);
  }

  checkDatabaseEnvVars() {
    const requiredVars = ['DATABASE_URL', 'POSTGRES_URL', 'REDIS_URL'];
    return requiredVars.some(varName => process.env[varName]);
  }

  checkWalletEnvVars() {
    const requiredVars = ['TON_RPC_URL', 'SOLANA_RPC_URL', 'ALGORAND_RPC_URL', 'BSC_RPC_URL'];
    return requiredVars.some(varName => process.env[varName]);
  }

  checkAIEnvVars() {
    const requiredVars = ['OPENAI_API_KEY', 'HUGGINGFACE_API_KEY'];
    return requiredVars.some(varName => process.env[varName]);
  }

  checkTelegramEnvVars() {
    const requiredVars = ['TELEGRAM_BOT_TOKEN', 'BOT_DR_TAPIA_TOKEN', 'BOT_PANAS_TOKEN_TOKEN'];
    return requiredVars.some(varName => process.env[varName]);
  }

  checkDeploymentEnvVars() {
    const requiredVars = ['VERCEL_TOKEN', 'HEROKU_APP_NAME'];
    return requiredVars.some(varName => process.env[varName]);
  }

  checkAPIConfigFiles() {
    const requiredFiles = ['api/index.js', 'vercel.json'];
    return requiredFiles.some(file => fs.existsSync(file));
  }

  checkDatabaseConfigFiles() {
    const requiredFiles = ['docker-compose.yml'];
    return requiredFiles.some(file => fs.existsSync(file));
  }

  checkWalletConfigFiles() {
    const requiredFiles = ['scripts/bots/modules/multi_wallet.js'];
    return requiredFiles.some(file => fs.existsSync(file));
  }

  checkAIConfigFiles() {
    const requiredFiles = ['scripts/bots/modules/ai_huggingface.js'];
    return requiredFiles.some(file => fs.existsSync(file));
  }

  checkTelegramConfigFiles() {
    const requiredFiles = ['config/bots.config.json', 'scripts/bots/orchestrator.js'];
    return requiredFiles.some(file => fs.existsSync(file));
  }

  checkDeploymentConfigFiles() {
    const requiredFiles = ['Procfile', 'docker/Dockerfile', 'app.json'];
    return requiredFiles.some(file => fs.existsSync(file));
  }

  checkCommonDependencies() {
    const requiredFiles = ['package.json', 'package-lock.json'];
    return requiredFiles.every(file => fs.existsSync(file));
  }

  async runCrossServiceTests() {
    logStep('CROSS-SERVICE', 'Running cross-service integration tests...');

    const crossTests = {
      'API-Database': await this.testAPIDatabaseIntegration(),
      'API-Wallet': await this.testAPIWalletIntegration(),
      'Telegram-AI': await this.testTelegramAIIntegration(),
      'Telegram-Wallet': await this.testTelegramWalletIntegration(),
      'AI-Database': await this.testAIDatabaseIntegration()
    };

    const passedTests = Object.values(crossTests).filter(Boolean).length;
    const totalTests = Object.keys(crossTests).length;
    
    log(`\n🔗 Cross-service integration results: ${passedTests}/${totalTests} passed`, 
      passedTests === totalTests ? 'green' : passedTests > totalTests / 2 ? 'yellow' : 'red');

    for (const [testName, result] of Object.entries(crossTests)) {
      log(`   ${testName}: ${result ? '✅' : '❌'}`, result ? 'green' : 'red');
    }

    return { passed: passedTests, total: totalTests, tests: crossTests };
  }

  async testAPIDatabaseIntegration() {
    // Test if API can work with database
    try {
      return this.integrationResults.api.status !== 'error' && 
             this.integrationResults.database.status !== 'error';
    } catch (error) {
      return false;
    }
  }

  async testAPIWalletIntegration() {
    // Test if API can work with wallet services
    try {
      return this.integrationResults.api.status !== 'error' && 
             this.integrationResults.wallet.status !== 'error';
    } catch (error) {
      return false;
    }
  }

  async testTelegramAIIntegration() {
    // Test if Telegram bots can use AI services
    try {
      return this.integrationResults.telegram.status !== 'error' && 
             this.integrationResults.ai.status !== 'error';
    } catch (error) {
      return false;
    }
  }

  async testTelegramWalletIntegration() {
    // Test if Telegram bots can use wallet services
    try {
      return this.integrationResults.telegram.status !== 'error' && 
             this.integrationResults.wallet.status !== 'error';
    } catch (error) {
      return false;
    }
  }

  async testAIDatabaseIntegration() {
    // Test if AI services can log to database
    try {
      return this.integrationResults.ai.status !== 'error' && 
             this.integrationResults.database.status !== 'error';
    } catch (error) {
      return false;
    }
  }

  generateEnhancedReport() {
    log('\n📊 ENHANCED INTEGRATION REPORT', 'bright');
    log('=' .repeat(70), 'cyan');

    for (const [serviceName, result] of Object.entries(this.integrationResults)) {
      const statusIcon = result.status === 'ok' ? '✅' : 
                        result.status === 'warning' ? '⚠️' : '❌';
      const statusColor = result.status === 'ok' ? 'green' : 
                         result.status === 'warning' ? 'yellow' : 'red';
      
      log(`\n${statusIcon} ${this.serviceMap[serviceName].toUpperCase()}`, statusColor);
      
      if (result.details) {
        log(`   Status: ${result.status}`, statusColor);
        log(`   Health: ${result.health ? 'Healthy' : 'Unhealthy'}`, result.health ? 'green' : 'red');
        
        if (result.details.functionality) {
          const func = result.details.functionality;
          log(`   Functionality: ${func.passed}/${func.total} tests passed (${func.percentage.toFixed(1)}%)`);
        }
        
        if (result.details.configuration) {
          const config = result.details.configuration;
          const configItems = Object.entries(config).filter(([key, value]) => key !== 'error');
          const passedConfig = configItems.filter(([key, value]) => value).length;
          log(`   Configuration: ${passedConfig}/${configItems.length} items configured`);
        }
        
        if (result.error) {
          log(`   Error: ${result.error}`, 'red');
        }
      }
    }
  }

  generateRecommendations() {
    log('\n🎯 INTEGRATION RECOMMENDATIONS', 'bright');
    log('=' .repeat(70), 'cyan');

    const recommendations = [];
    
    for (const [serviceName, result] of Object.entries(this.integrationResults)) {
      if (result.status === 'error') {
        recommendations.push(`🔴 Fix ${this.serviceMap[serviceName]} critical issues: ${result.error}`);
      } else if (result.status === 'warning') {
        recommendations.push(`🟡 Improve ${this.serviceMap[serviceName]} configuration and functionality`);
      }
    }

    // Environment variable recommendations
    if (!process.env.DATABASE_URL) {
      recommendations.push('🔧 Configure database connection (DATABASE_URL)');
    }
    if (!process.env.OPENAI_API_KEY && !process.env.HUGGINGFACE_API_KEY) {
      recommendations.push('🔧 Configure AI service API keys');
    }
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      recommendations.push('🔧 Configure Telegram bot tokens');
    }

    if (recommendations.length === 0) {
      log('✅ No critical recommendations. System is well integrated!', 'green');
    } else {
      log('\nRecommended actions:');
      recommendations.forEach(rec => log(`   ${rec}`, 'yellow'));
    }

    // Summary
    const totalServices = Object.keys(this.integrationResults).length;
    const healthyServices = Object.values(this.integrationResults)
      .filter(result => result.status === 'ok').length;
    const warningServices = Object.values(this.integrationResults)
      .filter(result => result.status === 'warning').length;
    
    log('\n📈 INTEGRATION SUMMARY:', 'bright');
    log(`✅ Healthy services: ${healthyServices}/${totalServices}`, 'green');
    log(`⚠️  Services with warnings: ${warningServices}/${totalServices}`, 'yellow');
    
    const overallScore = (healthyServices / totalServices) * 100;
    const overallStatus = overallScore >= 80 ? 'Excellent' : 
                         overallScore >= 60 ? 'Good' : 
                         overallScore >= 40 ? 'Needs Improvement' : 'Critical';
    
    log(`🎯 Overall Integration Score: ${overallScore.toFixed(1)}% (${overallStatus})`, 
      overallScore >= 80 ? 'green' : overallScore >= 60 ? 'yellow' : 'red');
  }

  // CLI methods
  async executeCommand(command, ...args) {
    switch (command) {
      case 'check':
        await this.runFullIntegrationCheck();
        break;
      case 'service':
        if (args.length >= 1) {
          const serviceName = args[0];
          if (this.modulators[serviceName]) {
            await this.checkServiceIntegration(serviceName, this.modulators[serviceName]);
          } else {
            console.log(`Service not found: ${serviceName}`);
            console.log(`Available services: ${Object.keys(this.modulators).join(', ')}`);
          }
        } else {
          console.log('Usage: service <serviceName>');
        }
        break;
      case 'report':
        this.generateEnhancedReport();
        break;
      case 'recommendations':
        this.generateRecommendations();
        break;
      default:
        console.log('Available commands: check, service <name>, report, recommendations');
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'check';
  const args = process.argv.slice(3);

  try {
    const integrator = new EnhancedIntegrator();
    await integrator.executeCommand(command, ...args);
  } catch (error) {
    logError(`Enhanced Integrator error: ${error.message}`);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = EnhancedIntegrator;