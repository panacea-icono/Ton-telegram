#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - WALLET MODULATOR
 * =============================================================================
 * Modular multi-chain wallet service management
 * =============================================================================
 */

// Conditional imports to avoid issues in test environments
let TonWeb, Connection, PublicKey, algosdk, ethers;

try {
  TonWeb = require('tonweb');
  const solanaWeb3 = require('@solana/web3.js');
  Connection = solanaWeb3.Connection;
  PublicKey = solanaWeb3.PublicKey;
  algosdk = require('algosdk');
  ethers = require('ethers');
} catch (error) {
  // Module not available or failed to load
  console.warn('Some wallet modules failed to load:', error.message);
}

class WalletModulator {
  constructor(config = {}) {
    this.config = {
      chains: config.chains || ['TON', 'Solana', 'Algorand', 'BSC'],
      rpcEndpoints: {
        ton: process.env.TON_RPC_URL || 'https://toncenter.com/api/v2/jsonRPC',
        solana: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        algorand: process.env.ALGORAND_RPC_URL || 'https://mainnet-api.algonode.cloud',
        bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/',
      },
      cacheTimeout: config.cacheTimeout || 30000, // 30 seconds
      ...config
    };

    this.providers = {};
    this.cache = new Map();
    this.isRunning = false;
  }

  async start() {
    console.log('🚀 Starting Wallet Modulator...');
    
    try {
      // Initialize blockchain providers
      await this.initializeProviders();
      
      // Verify connections
      await this.verifyConnections();
      
      this.isRunning = true;
      this.startCacheCleanup();
      
      console.log('✅ Wallet Modulator started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start Wallet Modulator:', error.message);
      throw error;
    }
  }

  async stop() {
    console.log('🛑 Stopping Wallet Modulator...');
    
    try {
      // Clear cache cleanup interval
      if (this.cacheCleanupInterval) {
        clearInterval(this.cacheCleanupInterval);
      }

      // Clear cache
      this.cache.clear();
      
      this.isRunning = false;
      console.log('✅ Wallet Modulator stopped successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to stop Wallet Modulator:', error.message);
      throw error;
    }
  }

  async initializeProviders() {
    console.log('🔗 Initializing blockchain providers...');

    // Initialize TON provider
    if (this.config.chains.includes('TON')) {
      try {
        this.providers.ton = new TonWeb(
          new TonWeb.HttpProvider(this.config.rpcEndpoints.ton, {
            apiKey: process.env.TON_API_KEY
          })
        );
        console.log('✅ TON provider initialized');
      } catch (error) {
        console.error('❌ Failed to initialize TON provider:', error.message);
      }
    }

    // Initialize Solana provider
    if (this.config.chains.includes('Solana')) {
      try {
        this.providers.solana = new Connection(
          this.config.rpcEndpoints.solana,
          'confirmed'
        );
        console.log('✅ Solana provider initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Solana provider:', error.message);
      }
    }

    // Initialize Algorand provider
    if (this.config.chains.includes('Algorand')) {
      try {
        this.providers.algorand = new algosdk.Algodv2(
          process.env.ALGORAND_API_KEY || '',
          this.config.rpcEndpoints.algorand,
          ''
        );
        console.log('✅ Algorand provider initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Algorand provider:', error.message);
      }
    }

    // Initialize BSC provider
    if (this.config.chains.includes('BSC')) {
      try {
        this.providers.bsc = new ethers.JsonRpcProvider(this.config.rpcEndpoints.bsc);
        console.log('✅ BSC provider initialized');
      } catch (error) {
        console.error('❌ Failed to initialize BSC provider:', error.message);
      }
    }
  }

  async verifyConnections() {
    console.log('🔍 Verifying blockchain connections...');
    
    for (const [chainName, provider] of Object.entries(this.providers)) {
      try {
        const isHealthy = await this.checkChainHealth(chainName);
        if (isHealthy) {
          console.log(`✅ ${chainName.toUpperCase()} connection verified`);
        } else {
          console.log(`⚠️  ${chainName.toUpperCase()} connection warning`);
        }
      } catch (error) {
        console.log(`❌ ${chainName.toUpperCase()} connection failed:`, error.message);
      }
    }
  }

  async checkHealth() {
    if (!this.isRunning) return false;
    
    try {
      const healthChecks = await Promise.allSettled(
        Object.keys(this.providers).map(chain => this.checkChainHealth(chain))
      );

      const healthyChains = healthChecks.filter(result => 
        result.status === 'fulfilled' && result.value
      ).length;

      // Consider healthy if at least half of the chains are working
      return healthyChains >= Math.ceil(Object.keys(this.providers).length / 2);
    } catch (error) {
      console.error('Wallet health check failed:', error.message);
      return false;
    }
  }

  async checkChainHealth(chainName) {
    const provider = this.providers[chainName];
    if (!provider) return false;

    try {
      switch (chainName) {
        case 'ton':
          await provider.getBalance('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
          return true;
        
        case 'solana':
          await provider.getSlot();
          return true;
        
        case 'algorand':
          await provider.status().do();
          return true;
        
        case 'bsc':
          await provider.getBlockNumber();
          return true;
        
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  // Cache management
  getCacheKey(chain, operation, address) {
    return `${chain}:${operation}:${address}`;
  }

  getFromCache(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  startCacheCleanup() {
    this.cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.config.cacheTimeout) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }

  // Wallet operations
  async getBalance(chain, address) {
    const cacheKey = this.getCacheKey(chain, 'balance', address);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    let balance;
    try {
      switch (chain.toLowerCase()) {
        case 'ton':
          balance = await this.getTonBalance(address);
          break;
        case 'solana':
          balance = await this.getSolanaBalance(address);
          break;
        case 'algorand':
          balance = await this.getAlgorandBalance(address);
          break;
        case 'bsc':
          balance = await this.getBscBalance(address);
          break;
        default:
          throw new Error(`Chain not supported: ${chain}`);
      }

      this.setCache(cacheKey, balance);
      return balance;
    } catch (error) {
      throw new Error(`Failed to get ${chain} balance for ${address}: ${error.message}`);
    }
  }

  async getTonBalance(address) {
    const provider = this.providers.ton;
    if (!provider) throw new Error('TON provider not initialized');

    try {
      const balance = await provider.getBalance(address);
      const tonBalance = TonWeb.utils.fromNano(balance);
      
      return {
        chain: 'TON',
        address,
        balance: tonBalance,
        currency: 'TON',
        raw: balance.toString(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`TON balance query failed: ${error.message}`);
    }
  }

  async getSolanaBalance(address) {
    const provider = this.providers.solana;
    if (!provider) throw new Error('Solana provider not initialized');

    try {
      const publicKey = new PublicKey(address);
      const balance = await provider.getBalance(publicKey);
      const solBalance = balance / 1000000000; // Convert lamports to SOL
      
      return {
        chain: 'Solana',
        address,
        balance: solBalance.toString(),
        currency: 'SOL',
        raw: balance.toString(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Solana balance query failed: ${error.message}`);
    }
  }

  async getAlgorandBalance(address) {
    const provider = this.providers.algorand;
    if (!provider) throw new Error('Algorand provider not initialized');

    try {
      const accountInfo = await provider.accountInformation(address).do();
      const algoBalance = accountInfo.amount / 1000000; // Convert microAlgos to ALGO
      
      return {
        chain: 'Algorand',
        address,
        balance: algoBalance.toString(),
        currency: 'ALGO',
        raw: accountInfo.amount.toString(),
        assets: accountInfo.assets || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Algorand balance query failed: ${error.message}`);
    }
  }

  async getBscBalance(address) {
    const provider = this.providers.bsc;
    if (!provider) throw new Error('BSC provider not initialized');

    try {
      const balance = await provider.getBalance(address);
      const bnbBalance = ethers.formatEther(balance);
      
      return {
        chain: 'BSC',
        address,
        balance: bnbBalance,
        currency: 'BNB',
        raw: balance.toString(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`BSC balance query failed: ${error.message}`);
    }
  }

  async validateAddress(chain, address) {
    try {
      switch (chain.toLowerCase()) {
        case 'ton':
          return this.validateTonAddress(address);
        case 'solana':
          return this.validateSolanaAddress(address);
        case 'algorand':
          return this.validateAlgorandAddress(address);
        case 'bsc':
          return this.validateBscAddress(address);
        default:
          return { valid: false, error: `Chain not supported: ${chain}` };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  validateTonAddress(address) {
    try {
      // Basic TON address validation
      if (!address || typeof address !== 'string') {
        return { valid: false, error: 'Invalid address format' };
      }
      
      // TON addresses typically start with EQ or UQ and are 48 characters
      if (!/^[EU]Q[A-Za-z0-9_-]{46}$/.test(address)) {
        return { valid: false, error: 'Invalid TON address format' };
      }
      
      return { valid: true, chain: 'TON', address };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  validateSolanaAddress(address) {
    try {
      const publicKey = new PublicKey(address);
      return { valid: true, chain: 'Solana', address: publicKey.toBase58() };
    } catch (error) {
      return { valid: false, error: 'Invalid Solana address format' };
    }
  }

  validateAlgorandAddress(address) {
    try {
      if (!address || typeof address !== 'string') {
        return { valid: false, error: 'Invalid address format' };
      }
      
      // Algorand addresses are 58 characters long and base32 encoded
      if (!/^[A-Z2-7]{58}$/.test(address)) {
        return { valid: false, error: 'Invalid Algorand address format' };
      }
      
      return { valid: true, chain: 'Algorand', address };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  validateBscAddress(address) {
    try {
      if (!ethers.isAddress(address)) {
        return { valid: false, error: 'Invalid BSC address format' };
      }
      
      return { valid: true, chain: 'BSC', address: ethers.getAddress(address) };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async getTransactionHistory(chain, address, limit = 10) {
    // This would require additional API integrations for each chain
    // For now, returning a placeholder structure
    return {
      chain,
      address,
      transactions: [],
      message: 'Transaction history feature not yet implemented',
      timestamp: new Date().toISOString()
    };
  }

  async getMultiChainBalance(address) {
    const results = {};
    
    for (const chain of this.config.chains) {
      try {
        // Try to validate and get balance for each chain
        const validation = await this.validateAddress(chain, address);
        if (validation.valid) {
          results[chain] = await this.getBalance(chain, address);
        } else {
          results[chain] = { error: validation.error };
        }
      } catch (error) {
        results[chain] = { error: error.message };
      }
    }

    return {
      address,
      balances: results,
      timestamp: new Date().toISOString()
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
        console.log(`Wallet Health: ${health ? '✅ Healthy' : '❌ Unhealthy'}`);
        break;
      case 'status':
        const status = {
          isRunning: this.isRunning,
          chains: this.config.chains,
          providers: Object.keys(this.providers),
          cacheSize: this.cache.size
        };
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
      case 'validate':
        if (args.length >= 2) {
          const [chain, address] = args;
          const validation = await this.validateAddress(chain, address);
          console.log(JSON.stringify(validation, null, 2));
        } else {
          console.log('Usage: validate <chain> <address>');
        }
        break;
      case 'multi-balance':
        if (args.length >= 1) {
          const [address] = args;
          const balances = await this.getMultiChainBalance(address);
          console.log(JSON.stringify(balances, null, 2));
        } else {
          console.log('Usage: multi-balance <address>');
        }
        break;
      default:
        console.log('Available commands: start, stop, health, status, balance <chain> <address>, validate <chain> <address>, multi-balance <address>');
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'status';
  const args = process.argv.slice(3);

  try {
    const modulator = new WalletModulator();
    await modulator.executeCommand(command, ...args);
  } catch (error) {
    console.error('❌ Wallet Modulator error:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = WalletModulator;