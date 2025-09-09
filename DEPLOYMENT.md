# 🚀 Panacea TON Wallet - Deployment Guide

## Despliegue a Vercel

### Prerrequisitos

1. **Cuenta de Vercel**: Registrarse en [vercel.com](https://vercel.com)
2. **Vercel CLI instalado**: 
   ```bash
   npm install -g vercel
   ```
3. **Variables de entorno configuradas**

### Variables de Entorno Requeridas

Copia `.env.vercel.example` a `.env.vercel` y configura:

```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_vercel_org_id_here  
VERCEL_PROJECT_ID=your_vercel_project_id_here

# Application
NODE_ENV=production
REACT_APP_API_URL=https://tu-dominio.vercel.app/api
REACT_APP_ENVIRONMENT=production

# TON Network
REACT_APP_TON_NETWORK=mainnet
REACT_APP_TON_API_URL=https://toncenter.com/api/v2
```

### Obtener Tokens y IDs de Vercel

1. **Token de Vercel**:
   - Ve a [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Crea un nuevo token
   - Guárdalo como `VERCEL_TOKEN`

2. **Organization ID**:
   ```bash
   vercel teams list
   ```

3. **Project ID**:
   ```bash
   vercel projects list
   ```

### Métodos de Despliegue

#### Método 1: Script Automático (Recomendado)

```bash
# Despliegue a producción
npm run vercel:deploy

# Despliegue a preview/staging
node scripts/deploy/vercel-deploy.js --staging
```

#### Método 2: Vercel CLI Manual

```bash
# Login
vercel login

# Link proyecto (primera vez)
vercel link

# Deploy
vercel --prod
```

#### Método 3: Git Integration

1. Conecta tu repositorio GitHub a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Los deploys serán automáticos en cada push a main

### Configuración del Proyecto

El archivo `vercel.json` está configurado para:

- **Frontend**: React app servido desde `/frontend/dashboard`
- **API**: Endpoints Node.js en `/api`
- **Rutas**: 
  - `/api/*` → API endpoints
  - `/*` → React frontend

### Estructura de Archivos para Vercel

```
/
├── api/                    # API endpoints (Vercel Functions)
│   └── index.js           # Main API handler
├── frontend/dashboard/     # React frontend
│   ├── build/             # Built files (generado)
│   ├── public/            # Static files
│   └── src/               # Source code
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies and scripts
```

### Endpoints API Disponibles

Una vez desplegado, tu API estará disponible en:

- `GET /api` - Documentación de la API
- `GET /api/health` - Health check
- `GET /api/ton/balance/:address` - Balance TON
- `POST /api/ton/send` - Enviar transacción TON
- `POST /api/ton/connect` - Conectar TON wallet
- `GET /api/analytics` - Analytics del ecosistema

### Verificación del Despliegue

1. **Frontend**: https://tu-dominio.vercel.app
2. **API Health**: https://tu-dominio.vercel.app/api/health
3. **API Docs**: https://tu-dominio.vercel.app/api

### Troubleshooting

#### Error de Build

```bash
# Instalar dependencias localmente
cd frontend/dashboard
npm install
npm run build
```

#### Error de Variables de Entorno

1. Verifica que todas las variables estén configuradas
2. En Vercel dashboard: Settings → Environment Variables
3. Redeploy después de cambiar variables

#### Error de CORS

- Actualiza `CORS_ORIGINS` en las variables de entorno
- Incluye tu dominio de Vercel

### Monitoreo y Logs

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Function Logs**: Ver logs de las funciones serverless
- **Analytics**: Métricas de uso y rendimiento

### Dominios Personalizados

1. En Vercel dashboard → Settings → Domains
2. Agregar dominio personalizado
3. Configurar DNS según instrucciones

### Rollback

```bash
# Ver deploys
vercel logs

# Rollback a versión anterior
vercel rollback [deployment-url]
```

## Configuración Avanzada

### Telegram Bot Integration

Si usas bots de Telegram, configura:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=https://tu-dominio.vercel.app/api/webhook
```

### Base de Datos

Para persistencia, conecta una base de datos:

- **Vercel Postgres**: Base de datos nativa
- **MongoDB Atlas**: Base de datos MongoDB
- **PlanetScale**: MySQL serverless

### Caching

Vercel automáticamente cachea:
- Static assets (frontend)
- API responses (configurables)

## Soporte

- 📖 [Documentación Vercel](https://vercel.com/docs)
- 🐛 [Issues GitHub](https://github.com/panacea-icono/Ton-telegram/issues)
- 💬 [Telegram Support](https://t.me/panacea_support)

---

¡Tu Panacea TON Wallet está listo para desplegarse! 🎉