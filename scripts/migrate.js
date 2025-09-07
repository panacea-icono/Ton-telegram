#!/usr/bin/env node

/**
 * PANAS TOKEN ECOSYSTEM - DATABASE MIGRATIONS
 * Panacea | Icono SA
 *
 * Ejecuta migraciones de base de datos para:
 * - PostgreSQL
 * - Redis
 * - Estructuras de datos
 */

try {
  require('dotenv').config();
} catch (_) {}

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const redis = require('redis');

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = {
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'panas_token',
    user: process.env.POSTGRES_USER || 'panas',
    password: process.env.POSTGRES_PASSWORD || 'panas_secure_2024',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
};

// =============================================================================
// MIGRATION FUNCTIONS
// =============================================================================

/**
 * Ejecutar migraciones de PostgreSQL
 */
async function migratePostgreSQL() {
  console.log('🔄 Running PostgreSQL migrations...');

  const client = new Client(config.database);

  try {
    await client.connect();

    // Crear tabla de migraciones si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Obtener migraciones ejecutadas
    const result = await client.query(
      'SELECT name FROM migrations ORDER BY id'
    );
    const executedMigrations = result.rows.map((row) => row.name);

    // Directorio de migraciones
    const migrationsDir = path.join(__dirname, 'migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('📁 Creating migrations directory...');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Leer archivos de migración
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const migrationName = file.replace('.sql', '');

      if (!executedMigrations.includes(migrationName)) {
        console.log(`📝 Executing migration: ${migrationName}`);

        const migrationSQL = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf8'
        );

        await client.query(migrationSQL);

        // Registrar migración ejecutada
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [
          migrationName,
        ]);

        console.log(`✅ Migration ${migrationName} executed successfully`);
      } else {
        console.log(`⏭️  Migration ${migrationName} already executed`);
      }
    }

    console.log('✅ PostgreSQL migrations completed');
  } catch (error) {
    console.error('❌ PostgreSQL migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Configurar Redis
 */
async function setupRedis() {
  console.log('🔄 Setting up Redis...');

  const client = redis.createClient(config.redis);

  try {
    await client.connect();

    // Configurar claves por defecto
    const defaultKeys = {
      'panas:config:version': '1.0.0',
      'panas:config:environment': process.env.NODE_ENV || 'development',
      'panas:stats:started_at': new Date().toISOString(),
    };

    for (const [key, value] of Object.entries(defaultKeys)) {
      await client.set(key, value);
    }

    console.log('✅ Redis setup completed');
  } catch (error) {
    console.error('❌ Redis setup failed:', error);
    throw error;
  } finally {
    await client.quit();
  }
}

/**
 * Crear estructura de directorios
 */
function createDirectories() {
  console.log('📁 Creating directory structure...');

  const directories = [
    'logs',
    'uploads',
    'cache',
    'backups',
    'scripts/migrations',
  ];

  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }

  console.log('✅ Directory structure created');
}

/**
 * Crear archivos de configuración por defecto
 */
function createDefaultConfigs() {
  console.log('⚙️  Creating default configurations...');

  // Crear archivo de migración inicial si no existe
  const migrationsDir = path.join(__dirname, 'migrations');
  const initialMigration = path.join(migrationsDir, '001_initial_schema.sql');

  if (!fs.existsSync(initialMigration)) {
    const initialSQL = `
-- Initial schema for Panas Token Ecosystem
-- Panacea | Icono SA

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  language_code VARCHAR(10),
  is_bot BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  blockchain VARCHAR(50) NOT NULL,
  tx_hash VARCHAR(255) UNIQUE,
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  amount DECIMAL(20, 8),
  token_symbol VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bot sessions table
CREATE TABLE IF NOT EXISTS bot_sessions (
  id SERIAL PRIMARY KEY,
  bot_name VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  session_data JSONB,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_bot_name ON bot_sessions(bot_name);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_user_id ON bot_sessions(user_id);
    `;

    fs.writeFileSync(initialMigration, initialSQL.trim());
    console.log('📝 Created initial migration file');
  }

  console.log('✅ Default configurations created');
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('🚀 Starting database migrations...');

  try {
    // Crear estructura de directorios
    createDirectories();

    // Crear configuraciones por defecto
    createDefaultConfigs();

    // Ejecutar migraciones de PostgreSQL
    await migratePostgreSQL();

    // Configurar Redis
    await setupRedis();

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { migratePostgreSQL, setupRedis, createDirectories };
