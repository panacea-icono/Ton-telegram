/**
 * =============================================================================
 * PANACEA ICONO SA - VERCEL API HANDLER
 * =============================================================================
 * API principal para el ecosistema Panacea en Vercel
 * =============================================================================
 */

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'https://t.me'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'panacea-ton-wallet-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Panacea TON Wallet API',
    version: '1.0.0',
    description: 'API para el ecosistema Panacea TON Wallet',
    endpoints: {
      health: 'GET /api/health',
      ton: {
        balance: 'GET /api/ton/balance/:address',
        transactions: 'GET /api/ton/transactions/:address',
        send: 'POST /api/ton/send',
        connect: 'POST /api/ton/connect'
      },
      solana: {
        balance: 'GET /api/solana/balance/:address'
      },
      algorand: {
        balance: 'GET /api/algorand/balance/:address'
      },
      bots: {
        status: 'GET /api/bots/status'
      },
      analytics: 'GET /api/analytics'
    },
    timestamp: new Date().toISOString()
  });
});

// TON Wallet endpoints
app.get('/api/ton/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Simular consulta de balance TON
    res.json({
      address,
      balance: '0.0',
      currency: 'TON',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TON Transaction History
app.get('/api/ton/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Simular historial de transacciones TON
    res.json({
      address,
      transactions: [],
      total: 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TON Send Transaction (simulado)
app.post('/api/ton/send', async (req, res) => {
  try {
    const { from, to, amount, message } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: from, to, amount' 
      });
    }

    // Simular envío de transacción TON
    const txHash = 'ton_' + Math.random().toString(36).substr(2, 16);
    
    res.json({
      success: true,
      txHash,
      from,
      to,
      amount,
      message: message || '',
      fee: '0.005',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TON Connect Integration
app.post('/api/ton/connect', async (req, res) => {
  try {
    const { walletAddress, publicKey } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ 
        error: 'Missing wallet address' 
      });
    }

    // Simular conexión TON Connect
    res.json({
      success: true,
      walletAddress,
      publicKey,
      connected: true,
      network: 'mainnet',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Solana Wallet endpoints
app.get('/api/solana/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Simular consulta de balance Solana
    res.json({
      address,
      balance: '0.0',
      currency: 'SOL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Algorand Wallet endpoints
app.get('/api/algorand/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Simular consulta de balance Algorand
    res.json({
      address,
      balance: '0.0',
      currency: 'ALGO',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bot status endpoint
app.get('/api/bots/status', (req, res) => {
  res.json({
    bots: {
      core: { status: 'active', uptime: '99.9%' },
      paysupport: { status: 'active', uptime: '99.8%' },
      echo: { status: 'active', uptime: '99.9%' },
      publisher: { status: 'active', uptime: '99.7%' },
      ai: { status: 'active', uptime: '99.6%' }
    },
    timestamp: new Date().toISOString()
  });
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
  res.json({
    users: {
      total: 1250,
      active: 890,
      new: 45
    },
    transactions: {
      total: 5670,
      volume: '125,450.50',
      currency: 'USD'
    },
    bots: {
      messages: 12500,
      commands: 3400,
      uptime: '99.8%'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

module.exports = app;
