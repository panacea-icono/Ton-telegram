#!/usr/bin/env node

/**
 * =============================================================================
 * PANACEA ICONO SA - DATABASE MODULATOR
 * =============================================================================
 * Modular database connection and configuration management
 * =============================================================================
 */

// Conditional imports to avoid issues in test environments
let Client, redis, mongoose;

try {
  const pg = require('pg');
  Client = pg.Client;
  redis = require('redis');
  mongoose = require('mongoose');
} catch (error) {
  // Module not available or failed to load
  console.warn('Some database modules failed to load:', error.message);
}

class DatabaseModulator {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || 'postgresql',
      connections: {
        postgres: {
          url: process.env.DATABASE_URL || process.env.POSTGRES_URL,
          ssl: process.env.NODE_ENV === 'production',
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
        redis: {
          url: process.env.REDIS_URL,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
        },
        mongodb: {
          url: process.env.MONGODB_URL,
          options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
          }
        }
      },
      ...config
    };

    this.connections = {};
    this.isRunning = false;
    this.healthCheckInterval = null;
  }

  async start() {
    console.log('🚀 Starting Database Modulator...');
    
    try {
      // Initialize primary database
      await this.initializePrimaryDatabase();
      
      // Initialize cache layer
      await this.initializeCache();
      
      // Initialize additional databases if configured
      if (this.config.connections.mongodb?.url) {
        await this.initializeMongoDB();
      }

      this.isRunning = true;
      this.startHealthCheck();
      
      console.log('✅ Database Modulator started successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to start Database Modulator:', error.message);
      throw error;
    }
  }

  async stop() {
    console.log('🛑 Stopping Database Modulator...');
    
    try {
      // Stop health check
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      // Close all connections
      await this.closeAllConnections();
      
      this.isRunning = false;
      console.log('✅ Database Modulator stopped successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to stop Database Modulator:', error.message);
      throw error;
    }
  }

  async initializePrimaryDatabase() {
    const pgConfig = this.config.connections.postgres;
    
    if (!pgConfig.url) {
      console.warn('⚠️  No PostgreSQL URL configured, skipping PostgreSQL initialization');
      return;
    }

    try {
      const client = new Client(pgConfig.url);
      await client.connect();
      
      // Test connection
      const result = await client.query('SELECT NOW() as current_time');
      console.log('✅ PostgreSQL connected:', result.rows[0].current_time);
      
      this.connections.postgres = client;
      
      // Initialize tables if they don't exist
      await this.initializeTables();
      
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error.message);
      throw error;
    }
  }

  async initializeCache() {
    const redisConfig = this.config.connections.redis;
    
    if (!redisConfig.url) {
      console.warn('⚠️  No Redis URL configured, skipping Redis initialization');
      return;
    }

    try {
      const client = redis.createClient({
        url: redisConfig.url,
        ...redisConfig
      });

      client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      client.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      await client.connect();
      
      // Test connection
      await client.set('health_check', 'ok');
      const test = await client.get('health_check');
      
      if (test === 'ok') {
        console.log('✅ Redis cache layer operational');
        this.connections.redis = client;
      }
      
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      throw error;
    }
  }

  async initializeMongoDB() {
    const mongoConfig = this.config.connections.mongodb;
    
    if (!mongoConfig.url) {
      console.warn('⚠️  No MongoDB URL configured, skipping MongoDB initialization');
      return;
    }

    try {
      await mongoose.connect(mongoConfig.url, mongoConfig.options);
      
      console.log('✅ MongoDB connected successfully');
      this.connections.mongodb = mongoose.connection;
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  async initializeTables() {
    if (!this.connections.postgres) return;

    const tables = [
      {
        name: 'users',
        schema: `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            telegram_id BIGINT UNIQUE,
            username VARCHAR(255),
            wallet_addresses JSONB DEFAULT '{}',
            preferences JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'transactions',
        schema: `
          CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            chain VARCHAR(50),
            tx_hash VARCHAR(255),
            amount DECIMAL,
            currency VARCHAR(20),
            status VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'bot_analytics',
        schema: `
          CREATE TABLE IF NOT EXISTS bot_analytics (
            id SERIAL PRIMARY KEY,
            bot_name VARCHAR(100),
            user_id BIGINT,
            command VARCHAR(100),
            message_count INTEGER DEFAULT 1,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata JSONB DEFAULT '{}'
          )
        `
      },
      {
        name: 'system_logs',
        schema: `
          CREATE TABLE IF NOT EXISTS system_logs (
            id SERIAL PRIMARY KEY,
            service VARCHAR(100),
            level VARCHAR(20),
            message TEXT,
            metadata JSONB DEFAULT '{}',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      }
    ];

    for (const table of tables) {
      try {
        await this.connections.postgres.query(table.schema);
        console.log(`✅ Table '${table.name}' initialized`);
      } catch (error) {
        console.error(`❌ Failed to create table '${table.name}':`, error.message);
      }
    }
  }

  async checkHealth() {
    if (!this.isRunning) return false;

    const healthStatus = {
      postgres: false,
      redis: false,
      mongodb: false
    };

    // Check PostgreSQL
    if (this.connections.postgres) {
      try {
        await this.connections.postgres.query('SELECT 1');
        healthStatus.postgres = true;
      } catch (error) {
        console.error('PostgreSQL health check failed:', error.message);
      }
    }

    // Check Redis
    if (this.connections.redis) {
      try {
        await this.connections.redis.ping();
        healthStatus.redis = true;
      } catch (error) {
        console.error('Redis health check failed:', error.message);
      }
    }

    // Check MongoDB
    if (this.connections.mongodb) {
      try {
        healthStatus.mongodb = this.connections.mongodb.readyState === 1;
      } catch (error) {
        console.error('MongoDB health check failed:', error.message);
      }
    }

    // Consider healthy if primary database (PostgreSQL) is healthy
    return healthStatus.postgres;
  }

  startHealthCheck() {
    this.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        console.warn('⚠️  Database health check failed, attempting reconnection...');
        try {
          await this.reconnectFailedConnections();
        } catch (error) {
          console.error('❌ Failed to reconnect databases:', error.message);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  async reconnectFailedConnections() {
    // Reconnect PostgreSQL if needed
    if (this.connections.postgres) {
      try {
        await this.connections.postgres.query('SELECT 1');
      } catch (error) {
        console.log('🔄 Reconnecting PostgreSQL...');
        await this.connections.postgres.end();
        await this.initializePrimaryDatabase();
      }
    }

    // Reconnect Redis if needed
    if (this.connections.redis) {
      try {
        await this.connections.redis.ping();
      } catch (error) {
        console.log('🔄 Reconnecting Redis...');
        await this.connections.redis.quit();
        await this.initializeCache();
      }
    }
  }

  async closeAllConnections() {
    const promises = [];

    if (this.connections.postgres) {
      promises.push(this.connections.postgres.end());
    }

    if (this.connections.redis) {
      promises.push(this.connections.redis.quit());
    }

    if (this.connections.mongodb) {
      promises.push(mongoose.disconnect());
    }

    await Promise.allSettled(promises);
    this.connections = {};
  }

  // Database operation methods
  async query(sql, params = []) {
    if (!this.connections.postgres) {
      throw new Error('PostgreSQL connection not available');
    }

    try {
      const result = await this.connections.postgres.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Query failed:', error.message);
      throw error;
    }
  }

  async cacheGet(key) {
    if (!this.connections.redis) {
      throw new Error('Redis connection not available');
    }

    try {
      const value = await this.connections.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get failed:', error.message);
      return null;
    }
  }

  async cacheSet(key, value, ttl = 3600) {
    if (!this.connections.redis) {
      throw new Error('Redis connection not available');
    }

    try {
      await this.connections.redis.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set failed:', error.message);
      return false;
    }
  }

  async cacheDel(key) {
    if (!this.connections.redis) {
      throw new Error('Redis connection not available');
    }

    try {
      await this.connections.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete failed:', error.message);
      return false;
    }
  }

  // User management
  async createUser(telegramId, username, walletAddresses = {}) {
    const sql = `
      INSERT INTO users (telegram_id, username, wallet_addresses)
      VALUES ($1, $2, $3)
      ON CONFLICT (telegram_id) DO UPDATE SET
        username = EXCLUDED.username,
        wallet_addresses = EXCLUDED.wallet_addresses,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    return await this.query(sql, [telegramId, username, JSON.stringify(walletAddresses)]);
  }

  async getUser(telegramId) {
    const sql = 'SELECT * FROM users WHERE telegram_id = $1';
    const users = await this.query(sql, [telegramId]);
    return users[0] || null;
  }

  // Transaction logging
  async logTransaction(userId, chain, txHash, amount, currency, status = 'pending') {
    const sql = `
      INSERT INTO transactions (user_id, chain, tx_hash, amount, currency, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    return await this.query(sql, [userId, chain, txHash, amount, currency, status]);
  }

  // Analytics
  async logBotInteraction(botName, userId, command, metadata = {}) {
    const sql = `
      INSERT INTO bot_analytics (bot_name, user_id, command, metadata)
      VALUES ($1, $2, $3, $4)
    `;
    
    await this.query(sql, [botName, userId, command, JSON.stringify(metadata)]);
  }

  async getAnalytics(timeRange = '24 hours') {
    const sql = `
      SELECT 
        bot_name,
        command,
        COUNT(*) as usage_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM bot_analytics
      WHERE timestamp >= NOW() - INTERVAL '${timeRange}'
      GROUP BY bot_name, command
      ORDER BY usage_count DESC
    `;
    
    return await this.query(sql);
  }

  // System logging
  async logSystem(service, level, message, metadata = {}) {
    const sql = `
      INSERT INTO system_logs (service, level, message, metadata)
      VALUES ($1, $2, $3, $4)
    `;
    
    await this.query(sql, [service, level, message, JSON.stringify(metadata)]);
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
        console.log(`Database Health: ${health ? '✅ Healthy' : '❌ Unhealthy'}`);
        break;
      case 'status':
        const status = {
          isRunning: this.isRunning,
          connections: Object.keys(this.connections),
          health: await this.checkHealth()
        };
        console.log(JSON.stringify(status, null, 2));
        break;
      case 'analytics':
        const analytics = await this.getAnalytics(args[0] || '24 hours');
        console.table(analytics);
        break;
      case 'query':
        if (args[0]) {
          const result = await this.query(args[0]);
          console.table(result);
        } else {
          console.log('Usage: query "<SQL>"');
        }
        break;
      default:
        console.log('Available commands: start, stop, health, status, analytics [timeRange], query "<SQL>"');
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'status';
  const args = process.argv.slice(3);

  try {
    const modulator = new DatabaseModulator();
    await modulator.executeCommand(command, ...args);
  } catch (error) {
    console.error('❌ Database Modulator error:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseModulator;