#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - ECOSYSTEM MANAGER
 * =============================================================================
 * Gestor maestro del ecosistema completo
 * =============================================================================
 */

const WebhookManager = require('./webhooks/webhook-manager');
const EnvironmentManager = require('./environments/environment-manager');
const WorkflowManager = require('./workflows/workflow-manager');
const EcosystemIntegrator = require('./integration/ecosystem-integrator');

class EcosystemManager {
  constructor() {
    this.webhookManager = new WebhookManager();
    this.environmentManager = new EnvironmentManager();
    this.workflowManager = new WorkflowManager();
    this.integrator = new EcosystemIntegrator();
  }

  showMenu() {
    console.log('🏥 PANACEA ECOSYSTEM MANAGER');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 Available Commands:');
    console.log('');
    console.log('🔗 WEBHOOKS & ENDPOINTS:');
    console.log('  webhooks:list     - List all webhooks and endpoints');
    console.log('  webhooks:start    - Start webhook manager');
    console.log('  webhooks:status   - Check webhook status');
    console.log('');
    console.log('🌍 ENVIRONMENTS:');
    console.log('  env:list          - List all environments');
    console.log('  env:switch <env>  - Switch to environment');
    console.log('  env:status        - Show current environment status');
    console.log('  env:deploy <env>  - Deploy environment');
    console.log('');
    console.log('🔄 WORKFLOWS:');
    console.log('  workflows:list    - List all workflows');
    console.log('  workflows:run <name> - Run specific workflow');
    console.log('  workflows:test    - Run all tests');
    console.log('  workflows:monitor - Monitor workflow status');
    console.log('');
    console.log('🔍 INTEGRATION:');
    console.log('  integration:check - Check ecosystem integration');
    console.log('  integration:status - Show integration status');
    console.log('');
    console.log('🚀 QUICK ACTIONS:');
    console.log('  start:all         - Start all services');
    console.log('  stop:all          - Stop all services');
    console.log('  restart:all       - Restart all services');
    console.log('  status:all        - Show all services status');
    console.log('  deploy:all        - Deploy to all platforms');
    console.log('');
    console.log('❓ HELP:');
    console.log('  help              - Show this menu');
    console.log('  version           - Show version info');
    console.log('');
  }

  async executeCommand(command, args = []) {
    const [mainCommand, subCommand] = command.split(':');

    try {
      switch (mainCommand) {
        case 'webhooks':
          await this.handleWebhookCommand(subCommand, args);
          break;
        case 'env':
          await this.handleEnvironmentCommand(subCommand, args);
          break;
        case 'workflows':
          await this.handleWorkflowCommand(subCommand, args);
          break;
        case 'integration':
          await this.handleIntegrationCommand(subCommand, args);
          break;
        case 'start':
          await this.startAllServices();
          break;
        case 'stop':
          await this.stopAllServices();
          break;
        case 'restart':
          await this.restartAllServices();
          break;
        case 'status':
          await this.showAllStatus();
          break;
        case 'deploy':
          await this.deployAll();
          break;
        case 'help':
          this.showMenu();
          break;
        case 'version':
          this.showVersion();
          break;
        default:
          console.log(`❌ Unknown command: ${command}`);
          this.showMenu();
      }
    } catch (error) {
      console.error(
        `❌ Error executing command '${command}': ${error.message}`
      );
    }
  }

  async handleWebhookCommand(subCommand, args) {
    switch (subCommand) {
      case 'list':
        this.webhookManager.showEndpoints();
        break;
      case 'start':
        this.webhookManager.start();
        break;
      case 'status':
        this.webhookManager.showStatus();
        break;
      default:
        console.log(`❌ Unknown webhook command: ${subCommand}`);
    }
  }

  async handleEnvironmentCommand(subCommand, args) {
    switch (subCommand) {
      case 'list':
        this.environmentManager.listEnvironments();
        break;
      case 'switch':
        if (args[0]) {
          this.environmentManager.switchEnvironment(args[0]);
        } else {
          console.log('❌ Please specify environment name');
        }
        break;
      case 'status':
        this.environmentManager.showStatus();
        break;
      case 'deploy':
        if (args[0]) {
          this.environmentManager.deployEnvironment(args[0]);
        } else {
          console.log('❌ Please specify environment name');
        }
        break;
      default:
        console.log(`❌ Unknown environment command: ${subCommand}`);
    }
  }

  async handleWorkflowCommand(subCommand, args) {
    switch (subCommand) {
      case 'list':
        this.workflowManager.listWorkflows();
        break;
      case 'run':
        if (args[0]) {
          this.workflowManager.runWorkflow(args[0], args[1]);
        } else {
          console.log('❌ Please specify workflow name');
        }
        break;
      case 'test':
        this.workflowManager.runTests();
        break;
      case 'monitor':
        this.workflowManager.monitorWorkflows();
        break;
      default:
        console.log(`❌ Unknown workflow command: ${subCommand}`);
    }
  }

  async handleIntegrationCommand(subCommand, args) {
    switch (subCommand) {
      case 'check':
        await this.integrator.runFullIntegrationCheck();
        break;
      case 'status':
        this.integrator.generateIntegrationReport();
        break;
      default:
        console.log(`❌ Unknown integration command: ${subCommand}`);
    }
  }

  async startAllServices() {
    console.log('🚀 STARTING ALL SERVICES...');
    console.log('='.repeat(50));

    try {
      // Start webhook manager
      console.log('🔗 Starting webhook manager...');
      this.webhookManager.start(3003);

      // Start environment services
      console.log('🌍 Starting environment services...');
      const currentEnv = this.environmentManager.getCurrentEnvironment();
      this.environmentManager.restartServices(currentEnv.name);

      console.log('✅ All services started successfully');
    } catch (error) {
      console.error(`❌ Error starting services: ${error.message}`);
    }
  }

  async stopAllServices() {
    console.log('🛑 STOPPING ALL SERVICES...');
    console.log('='.repeat(50));

    try {
      // Stop Docker services
      const { execSync } = require('child_process');
      execSync('docker-compose down', { stdio: 'inherit' });

      console.log('✅ All services stopped successfully');
    } catch (error) {
      console.error(`❌ Error stopping services: ${error.message}`);
    }
  }

  async restartAllServices() {
    console.log('🔄 RESTARTING ALL SERVICES...');
    console.log('='.repeat(50));

    await this.stopAllServices();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
    await this.startAllServices();
  }

  async showAllStatus() {
    console.log('📊 ALL SERVICES STATUS:');
    console.log('='.repeat(60));

    // Integration status
    console.log('\n🔍 INTEGRATION STATUS:');
    await this.integrator.runFullIntegrationCheck();

    // Environment status
    console.log('\n🌍 ENVIRONMENT STATUS:');
    this.environmentManager.showStatus();

    // Workflow status
    console.log('\n🔄 WORKFLOW STATUS:');
    this.workflowManager.showStatus();
  }

  async deployAll() {
    console.log('🚀 DEPLOYING TO ALL PLATFORMS...');
    console.log('='.repeat(50));

    try {
      // Deploy Vercel
      console.log('⚡ Deploying to Vercel...');
      const { execSync } = require('child_process');
      execSync('npm run vercel:deploy', { stdio: 'inherit' });

      // Deploy Heroku
      console.log('🚀 Deploying to Heroku...');
      execSync('npm run heroku:deploy', { stdio: 'inherit' });

      // Deploy Docker
      console.log('🐳 Deploying Docker images...');
      execSync('npm run docker:deploy', { stdio: 'inherit' });

      console.log('✅ All platforms deployed successfully');
    } catch (error) {
      console.error(`❌ Error deploying: ${error.message}`);
    }
  }

  showVersion() {
    const packageJson = require('../package.json');
    console.log('📦 PANACEA ECOSYSTEM MANAGER');
    console.log('='.repeat(50));
    console.log(`Version: ${packageJson.version}`);
    console.log(`Description: ${packageJson.description}`);
    console.log(`Author: ${packageJson.author}`);
    console.log(`License: ${packageJson.license}`);
    console.log('');
    console.log('🏥 Panacea Icono SA - Medical Blockchain Ecosystem');
    console.log('Dr. Ignacio Tapia Vargas');
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new EcosystemManager();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (!command) {
    manager.showMenu();
  } else {
    manager.executeCommand(command, args);
  }
}

module.exports = EcosystemManager;
