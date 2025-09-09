#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - API MODULATOR
 * =============================================================================
 * Modular API endpoint management and configuration
 * =============================================================================
 */

// Conditional imports to avoid issues in test environments
let axios, fs, path;

try {
  axios = require('axios');
  fs = require('fs');
  path = require('path');
} catch (error) {
  // Module not available or failed to load
  console.warn('Some API modules failed to load:', error.message);
}

class APIModulator {
  constructor(config = {}) {
    this.config = {
      port: config.port || process.env.API_PORT || 3001,
      host: config.host || process.env.API_HOST || 'localhost',
      endpoints: config.endpoints || {},
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      ...config
    };
    
    this.services = {
      vercel: process.env.VERCEL_API_URL || 'https://www.panas.app',
      heroku: process.env.API_PANACEA_URL || 'https://api-panacea-638dc550fab6.herokuapp.com',
      fastapi: process.env.FASTAPI_URL || 'https://panacea-fastapi.herokuapp.com',
      local: `http://${this.config.host}:${this.config.port}`
    };

    this.endpoints = this.initializeEndpoints();
    this.isRunning = false;
  }

  initializeEndpoints() {
    return {
      health: '/api/health',
      status: '/api/status',
      
      // Wallet endpoints
      'ton/balance': '/api/ton/balance/:address',
      'solana/balance': '/api/solana/balance/:address',
      'algorand/balance': '/api/algorand/balance/:address',
      'bsc/balance': '/api/bsc/balance/:address',
      
      // Bot endpoints
      'bots/status': '/api/bots/status',
      'bots/analytics': '/api/bots/analytics',
      
      // AI endpoints
      'ai/models': '/api/ai/models',
      'ai/chat': '/api/ai/chat',
      
      // Analytics endpoints
      analytics: '/api/analytics',
      metrics: '/api/metrics',
      
      // Integration endpoints
      'integration/check': '/api/integration/check',
      'integration/status': '/api/integration/status'
    };
  }

  async start() {
    console.log('🚀 Starting API Modulator...');
    
    try {
      // Verify API services are reachable
      await this.verifyServices();
      
      // Initialize local API if needed
      if (this.config.startLocal) {
        await this.startLocalAPI();
      }
      
      this.isRunning = true;
      console.log('✅ API Modulator started successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to start API Modulator:', error.message);
      throw error;
    }
  }

  async stop() {
    console.log('🛑 Stopping API Modulator...');
    
    try {
      if (this.localServer) {
        await new Promise((resolve) => {
          this.localServer.close(resolve);
        });
      }
      
      this.isRunning = false;
      console.log('✅ API Modulator stopped successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to stop API Modulator:', error.message);
      throw error;
    }
  }

  async checkHealth() {
    if (!this.isRunning) return false;
    
    try {
      // Check main services
      const healthChecks = await Promise.allSettled([
        this.checkServiceHealth('vercel'),
        this.checkServiceHealth('heroku'),
        this.checkServiceHealth('fastapi')
      ]);

      const healthyServices = healthChecks.filter(result => 
        result.status === 'fulfilled' && result.value
      ).length;

      // Consider healthy if at least 2 out of 3 services are up
      return healthyServices >= 2;
    } catch (error) {
      console.error('Health check failed:', error.message);
      return false;
    }
  }

  async verifyServices() {
    console.log('🔍 Verifying API services...');
    
    for (const [name, url] of Object.entries(this.services)) {
      if (name === 'local' && !this.config.startLocal) continue;
      
      try {
        const isHealthy = await this.checkServiceHealth(name);
        if (isHealthy) {
          console.log(`✅ ${name}: ${url} - OK`);
        } else {
          console.log(`⚠️  ${name}: ${url} - Not responding`);
        }
      } catch (error) {
        console.log(`❌ ${name}: ${url} - Error: ${error.message}`);
      }
    }
  }

  async checkServiceHealth(serviceName) {
    const baseUrl = this.services[serviceName];
    if (!baseUrl) return false;

    try {
      const healthUrl = `${baseUrl}${this.endpoints.health}`;
      const response = await axios.get(healthUrl, {
        timeout: 10000,
        validateStatus: (status) => status < 500
      });

      return response.status < 400;
    } catch (error) {
      // Try alternative endpoints
      try {
        const response = await axios.get(baseUrl, {
          timeout: 10000,
          validateStatus: (status) => status < 500
        });
        return response.status < 400;
      } catch (altError) {
        return false;
      }
    }
  }

  async makeRequest(serviceName, endpoint, options = {}) {
    const baseUrl = this.services[serviceName];
    if (!baseUrl) {
      throw new Error(`Service not found: ${serviceName}`);
    }

    const url = `${baseUrl}${endpoint}`;
    const requestOptions = {
      timeout: this.config.timeout,
      ...options
    };

    let lastError;
    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const response = await axios(url, requestOptions);
        return response.data;
      } catch (error) {
        lastError = error;
        if (attempt < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw new Error(`Request failed after ${this.config.retries} attempts: ${lastError.message}`);
  }

  async getBalance(chain, address) {
    const endpoint = this.endpoints[`${chain.toLowerCase()}/balance`];
    if (!endpoint) {
      throw new Error(`Chain not supported: ${chain}`);
    }

    const path = endpoint.replace(':address', address);
    
    // Try different services
    for (const serviceName of ['heroku', 'fastapi', 'vercel']) {
      try {
        const result = await this.makeRequest(serviceName, path);
        return result;
      } catch (error) {
        console.warn(`Failed to get balance from ${serviceName}:`, error.message);
      }
    }

    throw new Error(`Failed to get balance for ${chain} address ${address}`);
  }

  async getBotsStatus() {
    const endpoint = this.endpoints['bots/status'];
    
    for (const serviceName of ['heroku', 'fastapi']) {
      try {
        const result = await this.makeRequest(serviceName, endpoint);
        return result;
      } catch (error) {
        console.warn(`Failed to get bots status from ${serviceName}:`, error.message);
      }
    }

    throw new Error('Failed to get bots status from any service');
  }

  async getAnalytics() {
    const endpoint = this.endpoints.analytics;
    
    for (const serviceName of ['heroku', 'fastapi']) {
      try {
        const result = await this.makeRequest(serviceName, endpoint);
        return result;
      } catch (error) {
        console.warn(`Failed to get analytics from ${serviceName}:`, error.message);
      }
    }

    throw new Error('Failed to get analytics from any service');
  }

  async checkIntegration() {
    const endpoint = this.endpoints['integration/check'];
    
    for (const serviceName of ['heroku', 'fastapi']) {
      try {
        const result = await this.makeRequest(serviceName, endpoint);
        return result;
      } catch (error) {
        console.warn(`Failed to check integration from ${serviceName}:`, error.message);
      }
    }

    // Fallback to local integration check
    try {
      const EcosystemIntegrator = require('../integration/ecosystem-integrator');
      const integrator = new EcosystemIntegrator();
      await integrator.runFullIntegrationCheck();
      return { status: 'success', message: 'Integration check completed via local fallback' };
    } catch (error) {
      throw new Error('Failed to check integration from any service');
    }
  }

  async startLocalAPI() {
    if (this.localServer) return;

    const express = require('express');
    const cors = require('cors');
    
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Health endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Status endpoint
    app.get('/api/status', async (req, res) => {
      try {
        const status = await this.getSystemStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Balance endpoints
    app.get('/api/:chain/balance/:address', async (req, res) => {
      try {
        const { chain, address } = req.params;
        const balance = await this.getBalance(chain, address);
        res.json(balance);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Bots status endpoint
    app.get('/api/bots/status', async (req, res) => {
      try {
        const status = await this.getBotsStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Analytics endpoint
    app.get('/api/analytics', async (req, res) => {
      try {
        const analytics = await this.getAnalytics();
        res.json(analytics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Integration check endpoint
    app.get('/api/integration/check', async (req, res) => {
      try {
        const result = await this.checkIntegration();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    return new Promise((resolve, reject) => {
      this.localServer = app.listen(this.config.port, this.config.host, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`✅ Local API server started on ${this.config.host}:${this.config.port}`);
          resolve();
        }
      });
    });
  }

  async getSystemStatus() {
    const services = {};
    
    for (const [name, url] of Object.entries(this.services)) {
      services[name] = {
        url,
        healthy: await this.checkServiceHealth(name),
        endpoints: Object.values(this.endpoints)
      };
    }

    return {
      status: 'operational',
      timestamp: new Date().toISOString(),
      services,
      endpoints: this.endpoints
    };
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
        console.log(`API Health: ${health ? '✅ Healthy' : '❌ Unhealthy'}`);
        break;
      case 'verify':
        await this.verifyServices();
        break;
      case 'status':
        const status = await this.getSystemStatus();
        console.log(JSON.stringify(status, null, 2));
        break;
      case 'balance':
        if (args.length >= 2) {
          const [chain, address] = args;
          const balance = await this.getBalance(chain, address);
          console.log(JSON.stringify(balance, null, 2));
        } else {
          console.log('Usage: balance <chain> <address>');
        }
        break;
      default:
        console.log('Available commands: start, stop, health, verify, status, balance <chain> <address>');
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'status';
  const args = process.argv.slice(3);

  try {
    const modulator = new APIModulator();
    await modulator.executeCommand(command, ...args);
  } catch (error) {
    console.error('❌ API Modulator error:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = APIModulator;