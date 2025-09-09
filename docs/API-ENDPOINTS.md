# 🔗 API ENDPOINTS - PANACEA ECOSYSTEM

## 📋 Índice de Endpoints

### 🤖 Telegram Bot Endpoints
- [Callbacks](#telegram-callbacks)
- [Webhooks](#telegram-webhooks)
- [Commands](#telegram-commands)

### 🌐 Frontend Endpoints
- [Vercel Frontend](#vercel-frontend)
- [React Dashboard](#react-dashboard)

### 🔧 Backend Endpoints
- [Heroku APIs](#heroku-apis)
- [FastAPI](#fastapi-endpoints)
- [Health Checks](#health-checks)

### 💰 Wallet Endpoints
- [Multi-Chain Wallets](#wallet-endpoints)
- [Blockchain Integration](#blockchain-endpoints)

---

## 🤖 Telegram Callbacks

### Bot Hub Central
```
Endpoint: https://t.me/panacea_icono_bot
Webhook: https://www.panas.app/webhook/telegram
```

#### Callbacks Disponibles
```javascript
// Comandos principales
/hub          - Menú principal del ecosistema
/services     - Estado de todos los servicios
/wallets      - Gestión de wallets multi-chain
/containers   - Estado de contenedores Docker
/databases    - Estado de bases de datos
/models       - Modelos de IA disponibles
/fastapi      - Estado de FastAPI
/github       - Estado de GitHub
/docker       - Estado de Docker Hub

// Gestión de wallets
/wallet_ton      - Gestión TON Wallet
/wallet_solana   - Gestión Solana Wallet
/wallet_algorand - Gestión Algorand Wallet
/wallet_balance  - Ver balances
/wallet_send     - Enviar tokens

// IA y GPT
/ai_chat         - Chat con GPT
/ai_generate     - Generar contenido
/ai_analyze      - Análisis médico
/ai_simulate     - Simulador quirúrgico

// Hugging Face
/hf              - Comandos Hugging Face
/generate        - Generación de texto
/sentiment       - Análisis de sentimientos
/summarize       - Resumen de texto
/translate       - Traducción
/ask             - Preguntas y respuestas
/code            - Generación de código
/classify        - Clasificación
/entities        - Detección de entidades
/similar         - Similitud de texto
/zeroshot        - Clasificación zero-shot
/fill            - Fill mask
```

---

## 🌐 Telegram Webhooks

### Webhook Principal
```
URL: https://www.panas.app/webhook/telegram
Method: POST
Content-Type: application/json
```

#### Estructura del Webhook
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 7145826810,
      "is_bot": false,
      "first_name": "Dr. Ignacio",
      "last_name": "Tapia Vargas",
      "username": "drtapiavargas"
    },
    "chat": {
      "id": 7145826810,
      "first_name": "Dr. Ignacio",
      "last_name": "Tapia Vargas",
      "username": "drtapiavargas",
      "type": "private"
    },
    "date": 1694217600,
    "text": "/hub"
  }
}
```

#### Webhooks por Servicio
```javascript
// Webhook para Heroku
https://api-panacea-638dc550fab6.herokuapp.com/webhook/telegram

// Webhook para FastAPI
https://panacea-fastapi.herokuapp.com/webhook/telegram

// Webhook para Vercel
https://www.panas.app/api/webhook/telegram
```

---

## 🔧 Backend Endpoints

### Heroku APIs

#### API Principal
```
Base URL: https://api-panacea-638dc550fab6.herokuapp.com
```

#### Endpoints Disponibles
```javascript
// Health Check
GET /api/health
Response: {
  "status": "ok",
  "service": "panacea-api",
  "version": "1.0.0",
  "timestamp": "2024-09-08T23:49:33.011Z"
}

// TON Wallet
GET /api/ton/balance/:address
POST /api/ton/send
POST /api/ton/generate

// Solana Wallet
GET /api/solana/balance/:address
POST /api/solana/send
POST /api/solana/generate

// Algorand Wallet
GET /api/algorand/balance/:address
POST /api/algorand/send
POST /api/algorand/generate

// Bot Status
GET /api/bots/status
Response: {
  "bots": {
    "core": { "status": "active", "uptime": "99.9%" },
    "paysupport": { "status": "active", "uptime": "99.8%" },
    "echo": { "status": "active", "uptime": "99.9%" },
    "publisher": { "status": "active", "uptime": "99.7%" },
    "ai": { "status": "active", "uptime": "99.6%" }
  }
}

// Analytics
GET /api/analytics
Response: {
  "users": { "total": 1250, "active": 890, "new": 45 },
  "transactions": { "total": 5670, "volume": "125,450.50", "currency": "USD" },
  "bots": { "messages": 12500, "commands": 3400, "uptime": "99.8%" }
}
```

### FastAPI Endpoints

#### Base URL
```
https://panacea-fastapi.herokuapp.com
```

#### Endpoints Especializados
```python
# Documentación Swagger
GET /docs

# Health Check
GET /api/health

# Wallets Multi-Chain
GET /api/wallets/balance/{chain}/{address}
POST /api/wallets/send
POST /api/wallets/generate

# AI Services
POST /api/ai/chat
POST /api/ai/generate
POST /api/ai/analyze

# Telegram Integration
POST /api/telegram/webhook
GET /api/telegram/status
```

---

## 💰 Wallet Endpoints

### Multi-Chain Wallet API
```javascript
// TON Wallet
GET /api/wallets/ton/balance/:address
POST /api/wallets/ton/send
POST /api/wallets/ton/generate
POST /api/wallets/ton/import

// Solana Wallet
GET /api/wallets/solana/balance/:address
POST /api/wallets/solana/send
POST /api/wallets/solana/generate
POST /api/wallets/solana/import

// Algorand Wallet
GET /api/wallets/algorand/balance/:address
POST /api/wallets/algorand/send
POST /api/wallets/algorand/generate
POST /api/wallets/algorand/import

// Bitcoin Wallet
GET /api/wallets/bitcoin/balance/:address
POST /api/wallets/bitcoin/send
POST /api/wallets/bitcoin/generate
POST /api/wallets/bitcoin/import
```

### Wallet Management
```javascript
// Listar wallets
GET /api/wallets/list

// Crear wallet
POST /api/wallets/create
Body: {
  "chain": "ton|solana|algorand|bitcoin",
  "name": "wallet_name",
  "mnemonic": "optional_mnemonic"
}

// Importar wallet
POST /api/wallets/import
Body: {
  "chain": "ton|solana|algorand|bitcoin",
  "mnemonic": "matrix zero girl brave okay...",
  "name": "imported_wallet"
}

// Exportar wallet
GET /api/wallets/export/:walletId
```

---

## 🌐 Frontend Endpoints

### Vercel Frontend
```
Base URL: https://www.panas.app
```

#### Rutas Principales
```javascript
// Dashboard Principal
GET /
GET /dashboard

// Gestión de Bots
GET /bots
GET /bots/:botId
POST /bots/:botId/start
POST /bots/:botId/stop

// Analytics
GET /analytics
GET /analytics/bots
GET /analytics/wallets
GET /analytics/transactions

// Wallets
GET /wallets
GET /wallets/ton
GET /wallets/solana
GET /wallets/algorand
GET /wallets/bitcoin

// Configuración
GET /settings
POST /settings/update
```

### React Dashboard API
```javascript
// API Interna del Frontend
GET /api/health
GET /api/bots/status
GET /api/wallets/status
GET /api/analytics/data
POST /api/bots/command
POST /api/wallets/action
```

---

## 🔍 Health Checks

### Servicios Principales
```javascript
// Vercel Frontend
GET https://www.panas.app/api/health

// Heroku API
GET https://api-panacea-638dc550fab6.herokuapp.com/api/health

// FastAPI
GET https://panacea-fastapi.herokuapp.com/api/health

// Telegram Bot
GET https://api.telegram.org/bot<TOKEN>/getMe

// Docker Hub
GET https://hub.docker.com/v2/repositories/panacea-icono/
```

### Health Check Response
```json
{
  "status": "ok",
  "service": "panacea-ecosystem",
  "version": "1.0.0",
  "timestamp": "2024-09-08T23:49:33.011Z",
  "environment": "production",
  "services": {
    "telegram": { "status": "ok", "uptime": "99.9%" },
    "vercel": { "status": "ok", "uptime": "99.8%" },
    "heroku": { "status": "ok", "uptime": "99.7%" },
    "fastapi": { "status": "ok", "uptime": "99.6%" },
    "databases": { "status": "ok", "uptime": "99.9%" }
  }
}
```

---

## 🔐 Autenticación

### API Keys
```javascript
// Headers requeridos
{
  "Authorization": "Bearer <API_KEY>",
  "Content-Type": "application/json",
  "X-Panacea-Version": "1.0.0"
}
```

### Rate Limiting
```javascript
// Límites por endpoint
{
  "telegram": "1000 requests/hour",
  "wallets": "100 requests/hour",
  "ai": "50 requests/hour",
  "analytics": "200 requests/hour"
}
```

---

## 📊 Monitoreo

### Métricas Disponibles
```javascript
// Endpoint de métricas
GET /api/metrics

// Métricas por servicio
GET /api/metrics/telegram
GET /api/metrics/wallets
GET /api/metrics/ai
GET /api/metrics/analytics
```

### Logs
```javascript
// Logs del sistema
GET /api/logs
GET /api/logs/telegram
GET /api/logs/wallets
GET /api/logs/errors
```

---

**Desarrollado por**: Dr. Ignacio Tapia Vargas - Panacea Icono SA  
**Fecha**: 8 de Septiembre, 2024  
**Versión**: 1.0.0
