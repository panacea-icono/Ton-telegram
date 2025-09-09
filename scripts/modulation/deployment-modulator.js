#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - DEPLOYMENT MODULATOR
 * =============================================================================
 * Modular deployment service coordination
 * =============================================================================
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class DeploymentModulator {
  constructor(config = {}) {
    this.config = {
      platforms: config.platforms || ['vercel', 'heroku', 'docker'],
      environments: config.environments || ['development', 'staging', 'production'],
      ...config
    };

    this.deploymentHistory = [];
    this.platformStatus = {};
    this.isRunning = false;
  }

  async start() {
    console.log('🚀 Starting Deployment Modulator...');
    
    try {
      // Initialize platform connections
      await this.initializePlatforms();
      
      // Verify platform status
      await this.verifyPlatforms();
      
      this.isRunning = true;
      
      console.log('✅ Deployment Modulator started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start Deployment Modulator:', error.message);
      throw error;
    }
  }

  async stop() {
    console.log('🛑 Stopping Deployment Modulator...');
    
    try {
      this.isRunning = false;
      console.log('✅ Deployment Modulator stopped successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to stop Deployment Modulator:', error.message);
      throw error;
    }
  }

  async initializePlatforms() {
    console.log('🔧 Initializing deployment platforms...');
    
    for (const platform of this.config.platforms) {
      this.platformStatus[platform] = {
        initialized: false,
        healthy: false,
        lastCheck: null,
        error: null
      };
    }
  }

  async verifyPlatforms() {
    console.log('🔍 Verifying deployment platforms...');
    
    for (const platform of this.config.platforms) {
      try {
        const isHealthy = await this.checkPlatformHealth(platform);
        this.platformStatus[platform] = {
          ...this.platformStatus[platform],
          initialized: true,
          healthy: isHealthy,
          lastCheck: new Date()
        };
        
        if (isHealthy) {
          console.log(`✅ ${platform.toUpperCase()} - Ready`);
        } else {
          console.log(`⚠️  ${platform.toUpperCase()} - Not responding`);
        }
      } catch (error) {
        this.platformStatus[platform] = {
          ...this.platformStatus[platform],
          initialized: true,
          healthy: false,
          lastCheck: new Date(),
          error: error.message
        };
        console.log(`❌ ${platform.toUpperCase()} - Error: ${error.message}`);
      }
    }
  }

  async checkHealth() {
    if (!this.isRunning) return false;
    
    try {
      const healthyPlatforms = Object.values(this.platformStatus)
        .filter(status => status.healthy).length;
      
      // Consider healthy if at least one platform is working
      return healthyPlatforms > 0;
    } catch (error) {
      console.error('Deployment health check failed:', error.message);
      return false;
    }
  }

  async checkPlatformHealth(platform) {
    try {
      switch (platform) {
        case 'vercel':
          return await this.checkVercelHealth();
        case 'heroku':
          return await this.checkHerokuHealth();
        case 'docker':
          return await this.checkDockerHealth();
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  async checkVercelHealth() {
    try {
      // Check if Vercel CLI is available
      execSync('vercel --version', { stdio: 'pipe' });
      
      // Check if project is linked
      if (fs.existsSync('.vercel/project.json')) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  async checkHerokuHealth() {
    try {
      // Check if Heroku CLI is available
      execSync('heroku --version', { stdio: 'pipe' });
      
      // Check if we can list apps
      execSync('heroku apps', { stdio: 'pipe' });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkDockerHealth() {
    try {
      // Check if Docker is available
      execSync('docker --version', { stdio: 'pipe' });
      
      // Check if Docker daemon is running
      execSync('docker ps', { stdio: 'pipe' });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async deploy(platform, environment = 'production', options = {}) {
    console.log(`🚀 Deploying to ${platform} (${environment})...`);
    
    const deploymentId = `deploy_${Date.now()}`;
    const deployment = {
      id: deploymentId,
      platform,
      environment,
      status: 'starting',
      startTime: new Date(),
      endTime: null,
      logs: [],
      error: null
    };
    
    this.deploymentHistory.push(deployment);
    
    try {
      let result;
      switch (platform) {
        case 'vercel':
          result = await this.deployToVercel(environment, options);
          break;
        case 'heroku':
          result = await this.deployToHeroku(environment, options);
          break;
        case 'docker':
          result = await this.deployToDocker(environment, options);
          break;
        default:
          throw new Error(`Platform not supported: ${platform}`);
      }
      
      deployment.status = 'success';
      deployment.endTime = new Date();
      deployment.result = result;
      
      console.log(`✅ Deployment to ${platform} completed successfully`);
      return deployment;
    } catch (error) {
      deployment.status = 'failed';
      deployment.endTime = new Date();
      deployment.error = error.message;
      
      console.error(`❌ Deployment to ${platform} failed:`, error.message);
      throw error;
    }
  }

  async deployToVercel(environment, options) {
    const commands = [];
    
    // Build the project
    if (options.build !== false) {
      commands.push('npm run build:frontend');
    }
    
    // Deploy to Vercel
    if (environment === 'production') {
      commands.push('vercel --prod');
    } else {
      commands.push('vercel');
    }
    
    const results = [];
    for (const command of commands) {
      try {
        console.log(`Running: ${command}`);
        const result = execSync(command, { 
          encoding: 'utf8',
          cwd: process.cwd(),
          stdio: 'pipe'
        });
        results.push({ command, output: result, success: true });
      } catch (error) {
        results.push({ command, error: error.message, success: false });
        throw new Error(`Command failed: ${command} - ${error.message}`);
      }
    }
    
    return { platform: 'vercel', commands: results };
  }

  async deployToHeroku(environment, options) {
    const appName = options.appName || process.env.HEROKU_APP_NAME;
    if (!appName) {
      throw new Error('Heroku app name not specified');
    }
    
    const commands = [];
    
    // Build if needed
    if (options.build !== false) {
      commands.push('npm run build');
    }
    
    // Deploy to Heroku
    commands.push(`git push heroku main`);
    
    // Restart dynos
    commands.push(`heroku ps:restart -a ${appName}`);
    
    const results = [];
    for (const command of commands) {
      try {
        console.log(`Running: ${command}`);
        const result = execSync(command, { 
          encoding: 'utf8',
          cwd: process.cwd(),
          stdio: 'pipe'
        });
        results.push({ command, output: result, success: true });
      } catch (error) {
        results.push({ command, error: error.message, success: false });
        throw new Error(`Command failed: ${command} - ${error.message}`);
      }
    }
    
    return { platform: 'heroku', commands: results };
  }

  async deployToDocker(environment, options) {
    const imageName = options.imageName || 'panacea-ecosystem';
    const tag = options.tag || environment;
    
    const commands = [];
    
    // Build Docker image
    if (environment === 'production') {
      commands.push(`docker build -f docker/Dockerfile -t ${imageName}:${tag} .`);
    } else {
      commands.push(`docker build -f docker/Dockerfile.dev -t ${imageName}:${tag} .`);
    }
    
    // Tag as latest if production
    if (environment === 'production') {
      commands.push(`docker tag ${imageName}:${tag} ${imageName}:latest`);
    }
    
    // Run container
    if (options.run !== false) {
      commands.push(`docker-compose -f docker-compose.${environment === 'production' ? 'prod' : ''}.yml up -d`);
    }
    
    const results = [];
    for (const command of commands) {
      try {
        console.log(`Running: ${command}`);
        const result = execSync(command, { 
          encoding: 'utf8',
          cwd: process.cwd(),
          stdio: 'pipe'
        });
        results.push({ command, output: result, success: true });
      } catch (error) {
        results.push({ command, error: error.message, success: false });
        throw new Error(`Command failed: ${command} - ${error.message}`);
      }
    }
    
    return { platform: 'docker', commands: results };
  }

  async deployAll(environment = 'production', options = {}) {
    console.log(`🚀 Deploying to all platforms (${environment})...`);
    
    const results = [];
    
    for (const platform of this.config.platforms) {
      try {
        if (this.platformStatus[platform]?.healthy) {
          const result = await this.deploy(platform, environment, options);
          results.push(result);
        } else {
          console.log(`⏭️  Skipping ${platform} - not healthy`);
        }
      } catch (error) {
        console.error(`❌ Failed to deploy to ${platform}:`, error.message);
        results.push({
          platform,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    return results;
  }

  async rollback(platform, deploymentId) {
    console.log(`🔄 Rolling back ${platform} deployment ${deploymentId}...`);
    
    try {
      switch (platform) {
        case 'heroku':
          execSync(`heroku releases:rollback -a ${process.env.HEROKU_APP_NAME}`);
          break;
        case 'docker':
          execSync('docker-compose down && docker-compose up -d');
          break;
        default:
          throw new Error(`Rollback not implemented for ${platform}`);
      }
      
      console.log(`✅ Rollback completed for ${platform}`);
      return { success: true, platform, deploymentId };
    } catch (error) {
      console.error(`❌ Rollback failed for ${platform}:`, error.message);
      throw error;
    }
  }

  getDeploymentHistory(limit = 10) {
    return this.deploymentHistory
      .slice(-limit)
      .reverse()
      .map(deployment => ({
        id: deployment.id,
        platform: deployment.platform,
        environment: deployment.environment,
        status: deployment.status,
        duration: deployment.endTime ? 
          deployment.endTime.getTime() - deployment.startTime.getTime() : null,
        startTime: deployment.startTime.toISOString(),
        endTime: deployment.endTime?.toISOString(),
        error: deployment.error
      }));
  }

  // CLI methods
  async executeCommand(command, ...args) {
    switch (command) {
      case 'start':
        await this.start();
        break;
      case 'stop':
        await this.stop();
        break;
      case 'health':
        const health = await this.checkHealth();
        console.log(`Deployment Health: ${health ? '✅ Healthy' : '❌ Unhealthy'}`);
        break;
      case 'status':
        const status = {
          isRunning: this.isRunning,
          platforms: this.platformStatus,
          recentDeployments: this.getDeploymentHistory(5)
        };
        console.log(JSON.stringify(status, null, 2));
        break;
      case 'deploy':
        if (args.length >= 1) {
          const [platform, environment = 'production'] = args;
          const result = await this.deploy(platform, environment);
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Usage: deploy <platform> [environment]');
        }
        break;
      case 'deploy-all':
        const environment = args[0] || 'production';
        const results = await this.deployAll(environment);
        console.log(JSON.stringify(results, null, 2));
        break;
      case 'history':
        const limit = parseInt(args[0]) || 10;
        const history = this.getDeploymentHistory(limit);
        console.table(history);
        break;
      case 'rollback':
        if (args.length >= 1) {
          const [platform, deploymentId] = args;
          const result = await this.rollback(platform, deploymentId);
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('Usage: rollback <platform> [deploymentId]');
        }
        break;
      default:
        console.log('Available commands: start, stop, health, status, deploy <platform> [env], deploy-all [env], history [limit], rollback <platform> [id]');
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'status';
  const args = process.argv.slice(3);

  try {
    const modulator = new DeploymentModulator();
    await modulator.executeCommand(command, ...args);
  } catch (error) {
    console.error('❌ Deployment Modulator error:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DeploymentModulator;