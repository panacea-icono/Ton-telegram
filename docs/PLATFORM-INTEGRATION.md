# 🔗 Platform Integration System

## Descripción General

El **Sistema de Integración de Plataformas** de Panacea | Icono SA es un conjunto completo de herramientas que permite la integración, monitoreo y gestión unificada de múltiples plataformas en el ecosistema Panas Token.

## 🏗️ Arquitectura

### Componentes Principales

1. **Platform Integration Orchestrator** - Verificación y monitoreo de conectividad
2. **Unified Platform Manager** - API unificada para operaciones cross-platform
3. **Enhanced Health Check** - Monitoreo integrado de salud del sistema
4. **REST API** - Endpoints para integración externa

### Plataformas Soportadas

#### 🔗 Blockchains
- **TON Blockchain** - Plataforma principal
- **Solana** - Tokens SPL (GS, VASER)
- **Algorand** - ASA Tokens y NF Domains
- **BSC** - BEP-20 Tokens (KUCHI)

#### 📱 Redes Sociales
- **Telegram** - Bot principal del ecosistema
- **Twitter/X** - Publicación de contenido
- **Discord** - Comunidad y soporte
- **WhatsApp Business** - Comunicación directa

#### ☁️ Hosting & Cloud
- **Heroku** - Múltiples aplicaciones desplegadas
- **Vercel** - Frontend y aplicaciones web
- **Hugging Face** - Modelos de IA y deployment

#### 🤖 IA & Machine Learning
- **OpenAI** - GPT y modelos de lenguaje
- **Hugging Face Inference** - Modelos personalizados

#### 🗄️ Bases de Datos
- **PostgreSQL** - Base de datos principal
- **Redis** - Cache y sesiones
- **MongoDB** - Documentos y logs

## 🚀 Uso

### Comandos Disponibles

```bash
# Verificar estado de todas las plataformas
npm run platforms:check

# Iniciar el manager unificado con API REST
npm run platforms:manager

# Ejecutar API REST en puerto específico
PLATFORM_API_PORT=3333 npm run platforms:api

# Validar funcionamiento del sistema
npm run platforms:validate

# Health check completo con integración
npm run health
```

### API REST Endpoints

#### Salud del Sistema
```bash
GET /api/v1/health
```
Respuesta:
```json
{
  "timestamp": "2025-09-08T00:00:00.000Z",
  "overall": {
    "status": "healthy|unhealthy",
    "score": 85,
    "connectedPlatforms": 12,
    "totalPlatforms": 16
  },
  "categories": {
    "blockchain": {
      "status": "healthy",
      "connected": 3,
      "total": 4,
      "percentage": 75
    }
  }
}
```

#### Operaciones Blockchain
```bash
POST /api/v1/blockchain/getBalance
Content-Type: application/json

{
  "address": "0x1234..."
}
```

#### Operaciones Sociales
```bash
POST /api/v1/social/postMessage
Content-Type: application/json

{
  "message": "Mensaje a publicar",
  "platforms": ["telegram", "twitter"]
}
```

#### Operaciones Cross-Platform
```bash
POST /api/v1/cross-platform/broadcast_message
Content-Type: application/json

{
  "message": "Mensaje para todas las plataformas",
  "platforms": ["all"]
}
```

#### Métricas Agregadas
```bash
GET /api/v1/metrics?timeRange=24h
```

## 📊 Monitoreo y Reportes

### Reportes Automáticos

El sistema genera automáticamente reportes en:
- `audits/platform-integration/platform-integration-latest.json`
- `audits/integrations-latest.txt`

### Estructura de Reportes

```json
{
  "timestamp": "2025-09-08T00:00:00.000Z",
  "summary": {
    "totalPlatforms": 16,
    "connectedPlatforms": 12,
    "failedPlatforms": 4,
    "lastFullCheck": "2025-09-08T00:00:00.000Z"
  },
  "platforms": {
    "blockchain": {
      "ton": {
        "name": "TON Blockchain",
        "status": "connected",
        "health": {
          "lastCheck": "2025-09-08T00:00:00.000Z",
          "responseTime": 145,
          "isHealthy": true
        }
      }
    }
  },
  "recommendations": [
    {
      "platform": "Solana",
      "issue": "Conexión fallida",
      "action": "Verificar credenciales y conectividad"
    }
  ]
}
```

## 🔧 Configuración

### Variables de Entorno

#### Blockchains
```bash
# TON
TON_RPC_URL=https://toncenter.com/api/v2/jsonRPC
TON_API_KEY=your_ton_api_key

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Algorand
ALGORAND_RPC_URL=https://mainnet-api.algonode.cloud

# BSC
BSC_RPC_URL=https://bsc-dataseed.binance.org
```

#### Redes Sociales
```bash
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token

# Twitter
TWITTER_BEARER_TOKEN=your_bearer_token

# Discord
DISCORD_BOT_TOKEN=your_discord_token

# WhatsApp
WHATSAPP_TOKEN=your_whatsapp_token
```

#### Hosting
```bash
# Heroku
HEROKU_API_KEY=your_heroku_api_key

# Vercel
VERCEL_TOKEN=your_vercel_token

# Hugging Face
HUGGINGFACE_TOKEN=your_hf_token
```

### Configuración de API REST

```bash
# Puerto para API REST (default: 3333)
PLATFORM_API_PORT=3333

# Timeout para requests (default: 10000ms)
PLATFORM_REQUEST_TIMEOUT=10000
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Plataformas No Conectadas
```bash
# Verificar variables de entorno
npm run env:validate

# Revisar conectividad específica
npm run platforms:check

# Ver logs detallados
npm run health --verbose
```

#### 2. Timeouts de Red
```bash
# Aumentar timeout
PLATFORM_REQUEST_TIMEOUT=30000 npm run platforms:check
```

#### 3. APIs No Funcionan
```bash
# Validar sistema completo
npm run platforms:validate

# Revisar reportes
cat audits/platform-integration/platform-integration-latest.json
```

### Logs y Debugging

```bash
# Modo verbose para health check
npm run health -- --verbose

# Solo verificar servicios locales
npm run health -- --services

# Solo verificar conectividad de red
npm run health -- --network

# Salida en formato JSON
npm run health -- --json
```

## 🧪 Testing

### Validación del Sistema
```bash
# Ejecutar validación completa
npm run platforms:validate

# Test manual de componentes
node scripts/validate-platform-integration.js
```

### Tests de Integración
```bash
# Ejecutar tests específicos
npm test -- tests/integration/platform-integration.test.js

# Cobertura de tests
npm run test:coverage
```

## 📈 Métricas y Analytics

### Métricas Disponibles

- **Conectividad**: Porcentaje de plataformas conectadas
- **Tiempo de Respuesta**: Latencia promedio por plataforma
- **Disponibilidad**: Uptime de cada servicio
- **Transacciones**: Simulación de actividad cross-platform
- **Usuarios**: Agregación de usuarios por plataforma

### Dashboard de Métricas

```bash
# Iniciar API con métricas
npm run platforms:api

# Ver métricas en tiempo real
curl http://localhost:3333/api/v1/metrics
```

## 🔄 Automatización

### Health Checks Programados

Agregar a cron para monitoreo automático:
```bash
# Cada 5 minutos
*/5 * * * * cd /path/to/project && npm run platforms:check

# Cada hora
0 * * * * cd /path/to/project && npm run health >> logs/health.log
```

### Integración CI/CD

```yaml
# .github/workflows/platform-health.yml
name: Platform Health Check
on:
  schedule:
    - cron: '0 */4 * * *'  # Cada 4 horas

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run platforms:validate
      - run: npm run platforms:check
```

## 🚀 Próximas Funcionalidades

- [ ] Alertas automáticas por Telegram
- [ ] Dashboard web en tiempo real
- [ ] Integración con Grafana/Prometheus
- [ ] Recuperación automática de fallos
- [ ] Load balancing entre RPCs
- [ ] Cache inteligente de respuestas
- [ ] Métricas avanzadas de blockchain
- [ ] Auto-scaling basado en métricas

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: info@iconosa.com
- **Telegram**: @panas_token_bot
- **GitHub Issues**: [Ton-telegram/issues](https://github.com/panacea-icono/Ton-telegram/issues)

## 📄 Licencia

MIT License - Panacea | Icono SA