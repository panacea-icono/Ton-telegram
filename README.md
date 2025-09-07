<!-- PANACEA_ECOSYSTEM_HEADER -->

# Ton-telegram

> Parte del ecosistema Panacea | Icono SA. Hub: [Ton-telegram](https://github.com/panacea-icono/Ton-telegram)

- Organización: [@panacea-icono](https://github.com/panacea-icono)
- Documentación de repos: [/docs/REPOSITORIES.md](https://github.com/panacea-icono/Ton-telegram/tree/main/docs/REPOSITORIES.md)
- Estructura y submódulos: [/docs/REPOS-STRUCTURE.md](https://github.com/panacea-icono/Ton-telegram/tree/main/docs/REPOS-STRUCTURE.md)

# 🌐 Panas Token — Ecosistema Multichain & Telegram TON Wallet

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)

> **Ecosistema de pagos médicos descentralizado** con soporte multichain (TON, Solana, Algorand, BSC) e integración directa con **Telegram Wallet**.

---

## 📖 Descripción General

**Panas Token** es el activo central del ecosistema **Panacea | Icono SA**, diseñado para ser el **medio de pago confiable y multichain** en el sector médico, estético y de cirugía plástica.

El proyecto integra directamente **Telegram Wallet (TON)** como canal de pagos, con espejos en **Solana**, **Algorand (NF Domains)** y **BSC**, garantizando **rapidez, transparencia e identidad digital**.

---

## 🎯 Misión

Ofrecer una infraestructura de pagos descentralizada y accesible para clínicas, doctores y pacientes, con soporte multichain y experiencia de usuario simple vía **Telegram**.

---

## 🌍 Visión

Convertirse en el **hub de pagos médicos global** con identidad digital legible (NF Domains), liquidez garantizada y transparencia en cada transacción.

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git** >= 2.30.0
- **Docker** (opcional, para contenedores)
- **PostgreSQL** >= 13.0 (opcional, para desarrollo local)
- **Redis** >= 6.0 (opcional, para cache)

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/panacea-icono/Ton-telegram.git
   cd Ton-telegram
   ```

2. **Configurar el ecosistema completo**

   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configurar variables de entorno**

   ```bash
   cp env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar todos los servicios**

   ```bash
   npm run dev
   ```

### Estructura del Proyecto

```text
Ton-telegram/
├── 📁 tokens/                    # Repositorios de tokens
│   ├── panas-token/             # Token principal (Jetton TON)
│   ├── gs-token/                # Token GS (Solana)
│   ├── vaser-token/             # Token VASER (Solana)
│   └── kuchi-token/             # Token KUCHI (BSC)
├── 📁 backend/                   # Servicios backend
│   ├── router/                  # Router de intercambios
│   ├── ton-connect/             # Integración TON Connect
│   └── api/                     # API REST
├── 📁 frontend/                  # Interfaces de usuario
│   ├── dashboard/               # Dashboard web
│   ├── telegram-bot/            # Bot de Telegram
│   └── web-app/                 # Aplicación web
├── 📁 contracts/                 # Contratos inteligentes
│   ├── ton/                     # Contratos TON
│   ├── solana/                  # Contratos Solana
│   ├── algorand/                # Contratos Algorand
│   └── bsc/                     # Contratos BSC
├── 📁 infrastructure/            # Infraestructura
│   ├── docker/                  # Configuración Docker
│   ├── ci-cd/                   # Pipelines CI/CD
│   └── monitoring/              # Monitoreo
├── 📁 docs/                      # Documentación
│   └── api/                     # Documentación API
├── 📁 scripts/                   # Scripts de utilidad
├── 📁 config/                    # Archivos de configuración
├── 📁 tests/                     # Tests automatizados
├── 📁 logs/                      # Logs del sistema
├── .gitmodules                  # Configuración submódulos
├── setup.sh                     # Script de configuración
├── docker-compose.yml           # Orquestación de servicios
├── package.json                 # Dependencias Node.js
└── README.md                    # Este archivo
```

---

## 🔑 Componentes Principales

### 1. **Panas Token**

- **TON (Jetton):** principal → pagos directos en Telegram Wallet
- **Solana (SPL):** interoperabilidad con Phantom, Raydium, Meteora
- **Algorand (ASA):** integración con **NF Domains** (ej: `panas.algo`, `clinic.algo`)
- **BSC (ERC-20 opcional):** rampas de liquidez vía PancakeSwap

### 2. **NF Domains en Algorand**

- Identidad legible para wallets → `panas.algo`, `treasury.algo`, `doctor.algo`
- Simplifica pagos médicos → `/pay clinic.algo`
- Dashboard mostrará balances y dominios vinculados

### 3. **Router Backend**

- Entrada: GS, VASER, KUCHI, TON, ALGO, USDC/USDT
- Acción: swap en DEX (Raydium, Meteora, Pancake, Tinyman, DeDust/STON.fi)
- Salida: PANAS (Jetton TON) o USDC

### 4. **Dashboard**

- Métricas clave: supply, holders, pools, tesorería
- Identidad: dominios NF, TON DNS (`panas.ton`), Solana Name Service (`panas.sol`)
- Branding corporativo: **Panacea | Icono SA**

---

## 🪙 Tokens Integrados

| Token        | Blockchain   | Propósito           | Liquidez         |
| ------------ | ------------ | ------------------- | ---------------- |
| **🟣 GS**    | Solana (SPL) | Colateral principal | Dexlab, Raydium  |
| **🔵 VASER** | Solana (SPL) | Pool PANAS-VASER    | Raydium, Meteora |
| **🟡 KUCHI** | BSC (BEP-20) | Liquidez auxiliar   | PancakeSwap      |
| **🟢 PANAS** | TON (Jetton) | Token principal     | DeDust, STON.fi  |

---

## 📍 Pools Iniciales

- **PANAS-USDC** (Solana & TON)
- **PANAS-VASER** (Solana)
- **PANAS-KUCHI** (BSC)
- **PANAS-ALGO** (Algorand)

---

## 🛠️ Scripts Disponibles

### Desarrollo

```bash
npm run dev                 # Iniciar todos los servicios
npm run dev:backend         # Solo backend
npm run dev:frontend        # Solo frontend
npm run dev:bot            # Solo bot de Telegram
```

### Construcción

```bash
npm run build              # Construir todo
npm run build:backend      # Solo backend
npm run build:frontend     # Solo frontend
```

### Testing

```bash
npm run test               # Ejecutar tests
npm run test:watch         # Tests en modo watch
npm run test:coverage      # Tests con cobertura
```

### Calidad de Código

```bash
npm run lint               # Linter
npm run lint:fix           # Linter con auto-fix
npm run format             # Formatear código
npm run format:check       # Verificar formato
```

### Docker

```bash
npm run docker:build       # Construir imágenes
npm run docker:up          # Iniciar contenedores
npm run docker:down        # Detener contenedores
npm run docker:logs        # Ver logs
```

### Submódulos

```bash
npm run submodules:init    # Inicializar submódulos
npm run submodules:update  # Actualizar submódulos
npm run submodules:status  # Estado de submódulos
```

### Utilidades

```bash
npm run clean              # Limpiar node_modules
npm run install:all        # Instalar todas las dependencias
npm run health             # Verificar salud del sistema
npm run github:repos:list  # Generar docs/ con lista de repos
npm run github:repos:json  # Mostrar JSON de repos en consola
npm run github:repos:clone # Mostrar script de clonación
npm run github:repos:submodules # Mostrar config de submódulos
npm run github:token:check # Verificar token y permisos de GitHub
npm run org:sync           # Sincronizar submódulos desde GitHub (auto)
npm run bots:start         # Iniciar múltiples bots (config o entorno)
```

Para validar permisos mínimos de tu token:

```bash
GITHUB_REQUIRED_SCOPES="repo,read:org" npm run github:token:check
# o
node scripts/github-token-verify.js --require-scopes=repo,read:org
```

Cómo generar un nuevo PAT (fine-grained recomendado):

- GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate
- Owner: tu usuario u organización
- Repository permissions: Metadata: Read, Contents: Read
- Organization permissions: Members: Read (para listar repos privados de la org)
- Copia el token y configúralo como `GITHUB_TOKEN`

---

## 🔧 Configuración

### Variables de Entorno

Copia `env.example` a `.env` y configura las siguientes variables. Para ajustes locales que no deseas commitear, usa `.env.local` (ver `.env.local.example`).

#### Blockchain

- `TON_RPC_URL` - URL del nodo TON
- `SOLANA_RPC_URL` - URL del nodo Solana
- `ALGORAND_RPC_URL` - URL del nodo Algorand
- `BSC_RPC_URL` - URL del nodo BSC

#### Telegram

- `TELEGRAM_BOT_TOKEN` - Token del bot de Telegram
- `TELEGRAM_WEBHOOK_URL` - URL del webhook
- `BOTS_LIST` y `BOT_<NAME>_TOKEN` - Orquestador multi‑bot (alternativa a config/bots.config.json)
- `TELEGRAM_OFFICIAL_CHANNEL` - Canal destino (ej.: `@drtapiavargas_of` o `https://t.me/drtapiavargas_of`)
- `TELEGRAM_BOT_ADMINS` - IDs de administradores permitidos (coma‑separados)

#### Base de Datos

- `DATABASE_URL` - URL de PostgreSQL
- `REDIS_URL` - URL de Redis

#### Seguridad

- `JWT_SECRET` - Secreto para JWT
- `ENCRYPTION_KEY` - Clave de encriptación

#### GitHub (para listar repositorios)

- `GITHUB_TOKEN` - Token de acceso (PAT o token de instalación). No lo publiques.
- `GITHUB_ORG` - Organización a consultar (ej.: `panacea-icono`).
- `GITHUB_USERNAME` - Usuario a consultar si no usas organización.
- `GITHUB_REPOS_SCOPE` - Opcional: `org` o `user` para forzar el ámbito.
- `GITHUB_REQUIRED_SCOPES` - Opcional: scopes esperados (coma-separados) para validar el token.

Comportamiento del script:

- Si defines `GITHUB_ORG`, lista los repos de la organización.
- Si no defines `GITHUB_ORG` pero defines `GITHUB_USERNAME`, lista los del usuario.
- Si no defines ninguno, lista los del usuario autenticado (requiere `GITHUB_TOKEN`).

### Configuración de Submódulos

El proyecto utiliza Git submódulos para integrar todos los repositorios del ecosistema:

```bash
# Inicializar submódulos
git submodule init
git submodule update --recursive --remote

# Actualizar submódulos
git submodule update --remote --recursive
```

---

## 🐳 Docker

### Desarrollo Local

```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Servicios Incluidos

- **PostgreSQL** - Base de datos principal
- **Redis** - Cache y sesiones
- **API** - Backend REST
- **Dashboard** - Frontend web
- **Telegram Bot** - Bot de Telegram

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Tests específicos
npm run test -- --grep "TON"

# Tests con cobertura
npm run test:coverage
```

### Estructura de Tests

```text
tests/
├── unit/                   # Tests unitarios
├── integration/            # Tests de integración
├── e2e/                   # Tests end-to-end
├── fixtures/              # Datos de prueba
└── setup.js              # Configuración de tests
```

---

## 📊 Monitoreo

### Health Checks

```bash
# Verificar salud del sistema
npm run health

# Health check endpoint
curl http://localhost:3000/health
```

### Métricas

- **API Response Time** - Tiempo de respuesta de la API
- **Database Connections** - Conexiones a la base de datos
- **Blockchain Sync** - Estado de sincronización con blockchains
- **Token Balances** - Balances de tokens en pools

---

## 🚀 Despliegue

### Staging

```bash
npm run deploy:staging
```

### Producción

```bash
npm run deploy:production
```

### Variables de Producción

Asegúrate de configurar las siguientes variables para producción:

- `NODE_ENV=production`
- `DEBUG=false`
- `LOG_LEVEL=info`
- URLs de producción para todas las blockchains
- Tokens y claves de producción

---

## 🛡️ Seguridad

### Mejores Prácticas

- **Nunca** commitees archivos `.env` con claves reales
- Usa variables de entorno para todas las configuraciones sensibles
- Implementa rate limiting en todas las APIs
- Valida todas las entradas de usuario
- Usa HTTPS en producción
- Implementa logging de seguridad

### Auditorías

- Revisa regularmente las dependencias con `npm audit`
- Mantén actualizadas las versiones de Node.js y dependencias
- Implementa monitoreo de seguridad en producción

---

## 🤝 Contribución

### Flujo de Trabajo

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add: nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código

- Usa TypeScript para todo el código nuevo
- Sigue las reglas de ESLint configuradas
- Escribe tests para nuevas funcionalidades
- Documenta APIs y funciones complejas
- Usa commits semánticos

---

## 📚 Documentación

### API Documentation

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: `http://localhost:3000/api-docs.json`

### Guías Adicionales

- [Guía de Desarrollo](docs/development.md)
- [Guía de Despliegue](docs/deployment.md)
- [Guía de Contribución](docs/contributing.md)
- [Arquitectura del Sistema](docs/architecture.md)

---

## 🗺️ Roadmap

### Q1 2024

- [x] Deploy Panas Token (Jetton TON + SPL Solana + ASA Algorand)
- [x] Reserva dominios oficiales: `panas.ton`, `panas.sol`, `panas.algo`
- [x] Integración con Telegram Bot + TonConnect

### Q2 2024

- [ ] Pools iniciales de liquidez bloqueados
- [ ] Dashboard público → métricas de supply, holders, LP
- [ ] Vinculación de clínicas y doctores vía dominios `.algo`

### Q3 2024

- [ ] Expansión regional en clínicas asociadas
- [ ] Integración con rampas fiat
- [ ] Mobile app nativa

### Q4 2024

- [ ] Integración con más blockchains
- [ ] Sistema de reputación avanzado
- [ ] Marketplace médico

---

## 🏢 Panacea | Icono SA

El proyecto **Panas Token** es desarrollado y respaldado por **Icono SA**, empresa tecnológica enfocada en soluciones **blockchain médicas** bajo la marca **Panacea**.

- **Panacea** → Ecosistema médico digital
- **Panas Token** → Medio de pago multichain
- **NF Domains** → Identidad digital de doctores y clínicas

---

## 📞 Contacto

- 🌐 **Web**: [próximamente]
- 💬 **Telegram**: [Bot oficial Panas Token — en desarrollo]
- ✉️ **Email**: <info@iconosa.com>
- 🐦 **Twitter**: [@PanaceaIcono](https://twitter.com/PanaceaIcono)
- 📱 **LinkedIn**: [Panacea Icono SA](https://linkedin.com/company/panacea-icono)

---

## 🎯 Repositorio Principal

### [Ton-telegram](https://github.com/panacea-icono/Ton-telegram)

> **Bot de telegram wallet interfaz de pagos**

- **Lenguaje**: JavaScript
- **Estrellas**: ⭐ 0 | **Forks**: 🍴 0 | **Watchers**: 👀 0
- **Última actualización**: 7/9/2025
- **Licencia**: MIT
- **Temas**: `telegram`, `ton`, `wallet`, `payments`, `bot`, `blockchain`
- **URL**: [https://github.com/panacea-icono/Ton-telegram](https://github.com/panacea-icono/Ton-telegram)

```bash
# Clonar repositorio principal
git clone https://github.com/panacea-icono/Ton-telegram.git
cd Ton-telegram
```

---

## 📋 Otros Repositorios

### 1. [HUGGING_FACE](https://github.com/panacea-icono/HUGGING_FACE)

- **Descripción**: Modelos de IA y machine learning para aplicaciones médicas
- **Lenguaje**: Python
- **Estrellas**: ⭐ 0 | **Forks**: 🍴 0 | **Watchers**: 👀 0
- **Última actualización**: 7/9/2025
- **Licencia**: MIT
- **Temas**: `ai`, `ml`, `huggingface`, `medical`, `healthcare`, `python`
- **URL**: [https://github.com/panacea-icono/HUGGING_FACE](https://github.com/panacea-icono/HUGGING_FACE)

```bash
# Clonar repositorio
git clone https://github.com/panacea-icono/HUGGING_FACE.git
cd HUGGING_FACE
```

### 2. [FIBONACCI-FINAL-MODULOS-API-MAESTRO](https://github.com/panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO)

- **Descripción**: API maestra con módulos finales del sistema Fibonacci
- **Lenguaje**: JavaScript
- **Estrellas**: ⭐ 0 | **Forks**: 🍴 0 | **Watchers**: 👀 0
- **Última actualización**: 7/9/2025
- **Licencia**: MIT
- **Temas**: `api`, `fibonacci`, `modules`, `master`, `backend`, `nodejs`
- **URL**: [https://github.com/panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO](https://github.com/panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO)

```bash
# Clonar repositorio
git clone https://github.com/panacea-icono/FIBONACCI-FINAL-MODULOS-API-MAESTRO.git
cd FIBONACCI-FINAL-MODULOS-API-MAESTRO
```

### 3. [tutor_academico_CIRUGIA_I-II-III](https://github.com/panacea-icono/tutor_academico_CIRUGIA_I-II-III)

- **Descripción**: Sistema tutor académico para cirugía I, II y III
- **Lenguaje**: JavaScript
- **Estrellas**: ⭐ 0 | **Forks**: 🍴 0 | **Watchers**: 👀 0
- **Última actualización**: 7/9/2025
- **Licencia**: MIT
- **Temas**: `education`, `surgery`, `tutor`, `academic`, `medical`, `learning`
- **URL**: [https://github.com/panacea-icono/tutor_academico_CIRUGIA_I-II-III](https://github.com/panacea-icono/tutor_academico_CIRUGIA_I-II-III)

```bash
# Clonar repositorio
git clone https://github.com/panacea-icono/tutor_academico_CIRUGIA_I-II-III.git
cd tutor_academico_CIRUGIA_I-II-III
```

### 4. [kuchiuyas](https://github.com/panacea-icono/kuchiuyas)

- **Descripción**: Sistema de gestión y monitoreo de pacientes
- **Lenguaje**: TypeScript
- **Estrellas**: ⭐ 0 | **Forks**: 🍴 0 | **Watchers**: 👀 0
- **Última actualización**: 7/9/2025
- **Licencia**: MIT
- **Temas**: `patient-management`, `monitoring`, `healthcare`, `typescript`, `medical`
- **URL**: [https://github.com/panacea-icono/kuchiuyas](https://github.com/panacea-icono/kuchiuyas)

```bash
# Clonar repositorio
git clone https://github.com/panacea-icono/kuchiuyas.git
cd kuchiuyas
```

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- **TON Foundation** por la infraestructura TON
- **Solana Foundation** por el ecosistema Solana
- **Algorand Foundation** por la tecnología Algorand
- **Binance Smart Chain** por la red BSC
- **Comunidad de desarrolladores** que contribuyen al proyecto

---

**Desarrollado con ❤️ por [Panacea | Icono SA](https://iconosa.com)**

[![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Powered by Node.js](https://img.shields.io/badge/Powered%20by-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Built with Docker](https://img.shields.io/badge/Built%20with-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
