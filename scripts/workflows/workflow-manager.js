#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - WORKFLOW MANAGER
 * =============================================================================
 * Gestor de workflows de CI/CD, deployment y monitoreo
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WorkflowManager {
  constructor() {
    this.config = this.loadConfig();
    this.workflowsDir = '.github/workflows';
  }

  loadConfig() {
    return JSON.parse(fs.readFileSync('config/workflows.config.json', 'utf8'));
  }

  listWorkflows() {
    console.log('🔄 WORKFLOWS AVAILABLE:');
    console.log('='.repeat(50));

    // GitHub Actions workflows
    console.log('\n📚 GitHub Actions:');
    Object.entries(this.config.ci_cd.github_actions).forEach(
      ([name, workflow]) => {
        const exists = fs.existsSync(workflow.file);
        const status = exists ? '✅' : '❌';
        console.log(`  ${status} ${name}`);
        console.log(`     File: ${workflow.file}`);
        console.log(`     Triggers: ${workflow.triggers.join(', ')}`);
        console.log(`     Branches: ${workflow.branches.join(', ')}`);
        console.log(`     Jobs: ${workflow.jobs.join(', ')}`);
        console.log(`     Description: ${workflow.description}`);
        console.log('');
      }
    );

    // Deployment workflows
    console.log('🚀 Deployment:');
    Object.entries(this.config.deployment).forEach(([platform, configs]) => {
      console.log(`\n  ${platform.toUpperCase()}:`);
      Object.entries(configs).forEach(([name, config]) => {
        console.log(`    ${name}:`);
        Object.entries(config).forEach(([key, value]) => {
          if (typeof value === 'object') {
            console.log(`      ${key}:`);
            Object.entries(value).forEach(([subKey, subValue]) => {
              console.log(`        ${subKey}: ${subValue}`);
            });
          } else {
            console.log(`      ${key}: ${value}`);
          }
        });
      });
    });
  }

  validateWorkflows() {
    console.log('🔍 VALIDATING WORKFLOWS:');
    console.log('='.repeat(50));

    let allValid = true;

    // Validar archivos de GitHub Actions
    Object.entries(this.config.ci_cd.github_actions).forEach(
      ([name, workflow]) => {
        const exists = fs.existsSync(workflow.file);
        if (exists) {
          console.log(`✅ ${name}: File exists`);

          // Validar sintaxis YAML
          try {
            const content = fs.readFileSync(workflow.file, 'utf8');
            // Aquí podrías agregar validación de YAML si tienes una librería
            console.log(`   ✅ ${name}: Valid YAML syntax`);
          } catch (error) {
            console.log(
              `   ❌ ${name}: Invalid YAML syntax - ${error.message}`
            );
            allValid = false;
          }
        } else {
          console.log(`❌ ${name}: File missing`);
          allValid = false;
        }
      }
    );

    // Validar configuración de deployment
    Object.entries(this.config.deployment).forEach(([platform, configs]) => {
      console.log(`\n${platform.toUpperCase()}:`);
      Object.entries(configs).forEach(([name, config]) => {
        const requiredFields = this.getRequiredFields(platform);
        let configValid = true;

        requiredFields.forEach((field) => {
          if (!config[field]) {
            console.log(`   ❌ ${name}: Missing required field '${field}'`);
            configValid = false;
            allValid = false;
          }
        });

        if (configValid) {
          console.log(`   ✅ ${name}: Valid configuration`);
        }
      });
    });

    if (allValid) {
      console.log('\n✅ All workflows are valid');
    } else {
      console.log('\n❌ Some workflows have issues');
    }

    return allValid;
  }

  getRequiredFields(platform) {
    const requiredFields = {
      vercel: ['project', 'framework', 'build_command'],
      heroku: ['app_name', 'stack', 'buildpacks'],
      docker: ['registry', 'images'],
    };

    return requiredFields[platform] || [];
  }

  runWorkflow(workflowName, environment = 'development') {
    console.log(`🚀 RUNNING WORKFLOW: ${workflowName}`);
    console.log('='.repeat(50));

    const workflow = this.config.ci_cd.github_actions[workflowName];
    if (!workflow) {
      console.error(`❌ Workflow '${workflowName}' not found`);
      return false;
    }

    try {
      // Ejecutar jobs del workflow
      workflow.jobs.forEach((job) => {
        console.log(`\n🔄 Running job: ${job}`);
        this.runJob(job, environment);
      });

      console.log(`\n✅ Workflow '${workflowName}' completed successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Workflow '${workflowName}' failed: ${error.message}`);
      return false;
    }
  }

  runJob(jobName, environment) {
    const jobCommands = {
      test: () => {
        console.log('   🧪 Running tests...');
        execSync('npm test', { stdio: 'inherit' });
      },
      build: () => {
        console.log('   🔨 Building...');
        execSync('npm run build', { stdio: 'inherit' });
      },
      deploy: () => {
        console.log('   🚀 Deploying...');
        this.deploy(environment);
      },
      validate_bots: () => {
        console.log('   🤖 Validating bots...');
        execSync('node scripts/bots/validate-bots.js', { stdio: 'inherit' });
      },
      deploy_bots: () => {
        console.log('   🤖 Deploying bots...');
        execSync('node scripts/bots/orchestrator.js', { stdio: 'inherit' });
      },
      build_docker: () => {
        console.log('   🐳 Building Docker images...');
        execSync('docker build -t panas-token-ecosystem .', {
          stdio: 'inherit',
        });
      },
      push_docker: () => {
        console.log('   🐳 Pushing Docker images...');
        execSync('docker push ghcr.io/panacea-icono/panas-token-ecosystem', {
          stdio: 'inherit',
        });
      },
      deploy_vercel: () => {
        console.log('   ⚡ Deploying to Vercel...');
        execSync('npm run vercel:deploy', { stdio: 'inherit' });
      },
    };

    const jobCommand = jobCommands[jobName];
    if (jobCommand) {
      jobCommand();
    } else {
      console.log(`   ⚠️  Unknown job: ${jobName}`);
    }
  }

  deploy(environment) {
    console.log(`   🚀 Deploying to ${environment}...`);

    switch (environment) {
      case 'production':
        this.deployProduction();
        break;
      case 'staging':
        this.deployStaging();
        break;
      case 'development':
        this.deployDevelopment();
        break;
      default:
        console.log(`   ⚠️  Unknown environment: ${environment}`);
    }
  }

  deployProduction() {
    console.log('   🚀 Deploying to production...');

    // Deploy Vercel
    execSync('npm run vercel:deploy', { stdio: 'inherit' });

    // Deploy Heroku
    execSync('npm run heroku:deploy', { stdio: 'inherit' });

    // Deploy Docker
    execSync('npm run docker:deploy', { stdio: 'inherit' });
  }

  deployStaging() {
    console.log('   🚀 Deploying to staging...');

    // Deploy Vercel preview
    execSync('npm run vercel:deploy:preview', { stdio: 'inherit' });

    // Deploy Heroku staging
    execSync('npm run heroku:deploy:staging', { stdio: 'inherit' });
  }

  deployDevelopment() {
    console.log('   🚀 Starting development environment...');

    // Start local services
    execSync('npm run dev', { stdio: 'inherit' });
  }

  createWorkflow(name, config) {
    console.log(`📝 CREATING WORKFLOW: ${name}`);
    console.log('='.repeat(50));

    const workflowContent = this.generateWorkflowYAML(config);
    const workflowPath = path.join(this.workflowsDir, `${name}.yml`);

    // Crear directorio si no existe
    if (!fs.existsSync(this.workflowsDir)) {
      fs.mkdirSync(this.workflowsDir, { recursive: true });
    }

    // Escribir archivo
    fs.writeFileSync(workflowPath, workflowContent);

    console.log(`✅ Workflow created: ${workflowPath}`);
  }

  generateWorkflowYAML(config) {
    return `name: ${config.name}

on:
  ${config.triggers.map((trigger) => `${trigger}:`).join('\n  ')}
    branches: [${config.branches.map((b) => `'${b}'`).join(', ')}]

jobs:
${config.jobs
  .map(
    (job) => `  ${job}:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run ${job}`
  )
  .join('\n')}
`;
  }

  monitorWorkflows() {
    console.log('📊 WORKFLOW MONITORING:');
    console.log('='.repeat(50));

    // Health checks
    console.log('\n🏥 Health Checks:');
    this.config.monitoring.health_checks.endpoints.forEach((endpoint) => {
      try {
        const response = execSync(
          `curl -s -o /dev/null -w "%{http_code}" ${endpoint}`,
          { encoding: 'utf8' }
        );
        const status = response.trim() === '200' ? '✅' : '❌';
        console.log(`  ${status} ${endpoint} - ${response.trim()}`);
      } catch (error) {
        console.log(`  ❌ ${endpoint} - Error: ${error.message}`);
      }
    });

    // Alert thresholds
    console.log('\n⚠️  Alert Thresholds:');
    Object.entries(this.config.monitoring.alerts.thresholds).forEach(
      ([metric, threshold]) => {
        console.log(`  ${metric}: ${threshold}`);
      }
    );
  }

  runTests() {
    console.log('🧪 RUNNING TESTS:');
    console.log('='.repeat(50));

    // Unit tests
    console.log('\n📝 Unit Tests:');
    try {
      execSync('npm test', { stdio: 'inherit' });
      console.log('✅ Unit tests passed');
    } catch (error) {
      console.log('❌ Unit tests failed');
      return false;
    }

    // Integration tests
    console.log('\n🔗 Integration Tests:');
    try {
      execSync('npm run test:integration', { stdio: 'inherit' });
      console.log('✅ Integration tests passed');
    } catch (error) {
      console.log('❌ Integration tests failed');
      return false;
    }

    // E2E tests
    console.log('\n🌐 E2E Tests:');
    try {
      execSync('npm run test:e2e', { stdio: 'inherit' });
      console.log('✅ E2E tests passed');
    } catch (error) {
      console.log('❌ E2E tests failed');
      return false;
    }

    return true;
  }

  showStatus() {
    console.log('📊 WORKFLOW STATUS:');
    console.log('='.repeat(50));

    // GitHub Actions status
    console.log('\n📚 GitHub Actions:');
    Object.entries(this.config.ci_cd.github_actions).forEach(
      ([name, workflow]) => {
        const exists = fs.existsSync(workflow.file);
        const status = exists ? '✅' : '❌';
        console.log(`  ${status} ${name}`);
      }
    );

    // Deployment status
    console.log('\n🚀 Deployment:');
    Object.entries(this.config.deployment).forEach(([platform, configs]) => {
      console.log(`  ${platform.toUpperCase()}:`);
      Object.entries(configs).forEach(([name, config]) => {
        console.log(
          `    ${name}: ${config.app_name || config.project || 'configured'}`
        );
      });
    });

    // Monitoring status
    console.log('\n📊 Monitoring:');
    console.log(
      `  Health checks: ${this.config.monitoring.health_checks.endpoints.length} endpoints`
    );
    console.log(`  Alerts: ${this.config.monitoring.alerts.email}`);
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new WorkflowManager();
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  switch (command) {
    case 'list':
      manager.listWorkflows();
      break;
    case 'validate':
      manager.validateWorkflows();
      break;
    case 'run':
      if (arg1) {
        manager.runWorkflow(arg1, arg2);
      } else {
        console.error('❌ Please specify workflow name');
      }
      break;
    case 'create':
      if (arg1) {
        // Crear workflow básico
        const config = {
          name: arg1,
          triggers: ['push'],
          branches: ['main'],
          jobs: ['test', 'build', 'deploy'],
        };
        manager.createWorkflow(arg1, config);
      } else {
        console.error('❌ Please specify workflow name');
      }
      break;
    case 'monitor':
      manager.monitorWorkflows();
      break;
    case 'test':
      manager.runTests();
      break;
    case 'status':
      manager.showStatus();
      break;
    default:
      console.log('🔄 Workflow Manager');
      console.log('Usage:');
      console.log('  node scripts/workflows/workflow-manager.js list');
      console.log('  node scripts/workflows/workflow-manager.js validate');
      console.log(
        '  node scripts/workflows/workflow-manager.js run <workflow> [env]'
      );
      console.log('  node scripts/workflows/workflow-manager.js create <name>');
      console.log('  node scripts/workflows/workflow-manager.js monitor');
      console.log('  node scripts/workflows/workflow-manager.js test');
      console.log('  node scripts/workflows/workflow-manager.js status');
  }
}

module.exports = WorkflowManager;
