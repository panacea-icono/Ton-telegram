# 🔍 Guía de Auditorías del Ecosistema Panas Token

Esta guía describe el sistema integral de auditorías implementado para evaluar **conexiones**, **forks** (submódulos) y **modulaciones** (arquitectura modular) del ecosistema.

## 📋 Visión General

El sistema de auditorías evalúa tres áreas críticas:

- **🔗 Conexiones**: Conectividad de red, APIs, bases de datos y servicios blockchain
- **🍴 Forks**: Estado de submódulos Git, sincronización y repositorios vinculados  
- **🗂️ Modulaciones**: Estructura modular, dependencias y configuración del proyecto

## 🚀 Comandos de Auditoría

### Auditorías Individuales

```bash
# Auditoría de conexiones (red, APIs, blockchain)
npm run audit:connections

# Auditoría de forks y submódulos
npm run audit:forks

# Auditoría de modulaciones y arquitectura
npm run audit:modulations

# Auditorías básicas existentes
npm run audit:run          # Auditoría básica (secretos, scripts)
npm run audit:github       # Auditoría de repositorios GitHub
npm run audit:integrations # Auditoría de integraciones
```

### Auditoría Integral

```bash
# Ejecutar todas las auditorías y generar reporte consolidado
npm run audit:all
# o
npm run audit:comprehensive
```

### Programación Automática

```bash
# Iniciar programador de auditorías automáticas
npm run audit:scheduler:start

# Ver tendencias de auditorías
npm run audit:scheduler:trends

# Ejecutar auditoría específica inmediatamente
node scripts/audits/audit-scheduler.js run-now comprehensive
```

## 📊 Tipos de Auditoría

### 1. 🔗 Auditoría de Conexiones

**Propósito**: Verificar conectividad y disponibilidad de servicios externos.

**Verifica**:
- **Blockchains**: TON, Solana, Algorand, BSC (mainnet y testnet)
- **APIs**: GitHub, Telegram, CoinGecko, Vercel
- **Hosting**: Vercel, Heroku, HuggingFace
- **Variables de entorno**: Configuración de conexiones
- **Puertos locales**: Servicios corriendo en el sistema

**Ejemplo de uso**:
```bash
npm run audit:connections
```

**Salida**: 
- `audits/connections-audit-TIMESTAMP.txt` - Reporte detallado
- `audits/connections-latest.txt` - Último reporte
- `audits/connections-audit-TIMESTAMP.json` - Datos estructurados

### 2. 🍴 Auditoría de Forks

**Propósito**: Evaluar estado de submódulos Git y repositorios vinculados.

**Verifica**:
- **Archivo .gitmodules**: Configuración de submódulos (58 configurados)
- **Estado de submódulos**: Inicialización y sincronización
- **Directorios físicos**: Existencia vs configuración
- **Conectividad remota**: Acceso a repositorios GitHub
- **Análisis de forks**: Repositorios organizacionales vs externos

**Ejemplo de uso**:
```bash
npm run audit:forks
```

**Problemas comunes detectados**:
- Submódulos no inicializados (requiere `git submodule update --init --recursive`)
- Repositorios inaccesibles por permisos o URLs incorrectas
- Directorios configurados pero vacíos

### 3. 🗂️ Auditoría de Modulaciones

**Propósito**: Analizar estructura modular, dependencias y configuración del proyecto.

**Verifica**:
- **Estructura de archivos**: Categorización por tipo (backend, frontend, contratos, etc.)
- **Archivos package.json**: Dependencias, scripts y configuración
- **Análisis de dependencias**: Conflictos de versión, dependencias externas
- **Configuración**: TypeScript, ESLint, Jest, Docker, GitHub Actions
- **Métricas de calidad**: Directorios vacíos, archivos grandes, ratios

**Ejemplo de uso**:
```bash
npm run audit:modulations
```

**Métricas clave**:
- 6 archivos package.json encontrados
- 9 conflictos de dependencias detectados
- 31 directorios, 150 archivos analizados
- Configuración faltante: TypeScript, ESLint

## 📈 Auditoría Integral

La auditoría integral combina todas las verificaciones individuales más las auditorías existentes:

```bash
npm run audit:comprehensive
```

**Genera**:
- **Dashboard ejecutivo**: Métricas de alto nivel y tasa de éxito
- **Análisis detallado**: Resultados por categoría
- **Recomendaciones críticas**: Acciones inmediatas requeridas
- **Próximos pasos**: Guía de mejoras sugeridas

**Formato de salida**: Markdown con tablas y emojis para fácil lectura.

## 🕐 Programación Automática

### Configuración por Defecto

El programador de auditorías utiliza expresiones cron:

```json
{
  "schedules": {
    "comprehensive": "0 0 * * 1",  // Cada lunes a medianoche
    "connections": "0 */6 * * *",   // Cada 6 horas
    "forks": "0 0 * * 0",          // Cada domingo
    "modulations": "0 0 */3 * *"   // Cada 3 días
  }
}
```

### Alertas Automáticas

Se generan alertas cuando se superan umbrales:

- **Conexiones**: >50% de fallos
- **Submódulos**: >30% faltantes  
- **Dependencias**: >5 conflictos

### Historial y Tendencias

```bash
# Ver tendencias de los últimos 30 días
npm run audit:scheduler:trends comprehensive 30

# Ver configuración actual
node scripts/audits/audit-scheduler.js config
```

## 📁 Estructura de Archivos de Auditoría

```
audits/
├── audit-TIMESTAMP.txt              # Auditoría básica
├── connections-audit-TIMESTAMP.txt  # Auditoría de conexiones
├── forks-audit-TIMESTAMP.txt        # Auditoría de forks
├── modulations-audit-TIMESTAMP.txt  # Auditoría de modulaciones
├── comprehensive-audit-TIMESTAMP.md # Auditoría integral
├── *-latest.*                      # Últimos reportes
├── *.json                          # Datos estructurados
└── history/                        # Historial automático
    ├── comprehensive-history.jsonl
    ├── connections-history.jsonl
    └── alerts.jsonl
```

## 🔧 Configuración

### Variables de Entorno Requeridas

Para obtener todos los beneficios de las auditorías, configure:

```bash
# Blockchains
TON_RPC_URL=https://toncenter.com/api/v2
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ALGORAND_RPC_URL=https://mainnet-api.algonode.cloud
BSC_RPC_URL=https://bsc-dataseed.binance.org

# APIs externas
GITHUB_TOKEN=ghp_...
TELEGRAM_BOT_TOKEN=123456789:ABC...
VERCEL_TOKEN=...
HEROKU_API_KEY=...

# Base de datos (opcional)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### Personalizar Programación

Edite `config/audit-scheduler.json`:

```json
{
  "schedules": {
    "comprehensive": "0 2 * * 1"  // Cambiar a las 2 AM del lunes
  },
  "alerts": {
    "thresholds": {
      "connectionFailureRate": 0.3  // Alerta con 30% de fallos
    }
  }
}
```

## 🚨 Interpretación de Resultados

### Estados de Conexión
- ✅ **Success**: Conexión exitosa
- ❌ **Error**: Fallo de conectividad o configuración
- ⏰ **Timeout**: Conexión lenta o sobrecargada

### Estados de Submódulos  
- ✅ **Actualizado**: Submódulo sincronizado
- ❌ **No inicializado**: Requiere `git submodule init`
- ⚠️ **Commit diferente**: Requiere `git submodule update`

### Calidad Modular
- **Conflictos de dependencias**: Requieren resolución manual
- **Directorios vacíos**: Posible estructura innecesaria
- **Configuración faltante**: Impacta calidad de código

## 📋 Checklist de Mantenimiento

### Diario
- [ ] Verificar auditorías automáticas ejecutadas
- [ ] Revisar alertas generadas

### Semanal  
- [ ] Ejecutar auditoría integral manual
- [ ] Revisar tendencias de conexiones
- [ ] Validar estado de submódulos

### Mensual
- [ ] Analizar patrones en historial de auditorías
- [ ] Actualizar umbrales de alertas si es necesario
- [ ] Revisar y actualizar configuración de programación
- [ ] Limpiar archivos de auditoría antiguos

## 🆘 Resolución de Problemas

### Conexiones Fallidas
1. Verificar conectividad de red
2. Validar URLs en configuración
3. Comprobar credenciales de APIs
4. Revisar firewalls o proxies

### Submódulos Faltantes
```bash
# Inicializar todos los submódulos
git submodule update --init --recursive

# Verificar URLs de repositorios
git submodule status

# Sincronizar submódulos
git submodule update --remote
```

### Conflictos de Dependencias
```bash
# Analizar dependencias duplicadas
npm ls

# Actualizar a versiones compatibles
npm update

# Usar resoluciones en package.json si es necesario
```

## 🔮 Próximas Mejoras

- **Integración con CI/CD**: Ejecutar auditorías en pipelines
- **Dashboard web**: Visualización interactiva de métricas
- **Alertas por email/Slack**: Notificaciones automáticas
- **Métricas de rendimiento**: Benchmarking de conexiones
- **Auditorías de seguridad**: Análisis de vulnerabilidades

---

**📚 Para más información**, consulte:
- [Documentación de Arquitectura](ARCHITECTURE.md)
- [Guía de Contribución](../CONTRIBUTING.md)
- [Configuración de Desarrollo](../SETUP-COMPLETO.md)