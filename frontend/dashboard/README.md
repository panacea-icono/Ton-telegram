# Panas Token Dashboard

Dashboard React moderno para el ecosistema Panas Token, proporcionando una interfaz intuitiva para gestionar bots de Telegram, analizar métricas y configurar el sistema.

## 🚀 Características

- **Dashboard Interactivo**: Vista general del ecosistema con métricas en tiempo real
- **Gestión de Bots**: Administración completa de bots de Telegram
- **Analytics Avanzados**: Gráficos y métricas detalladas de rendimiento
- **Configuración Centralizada**: Panel de configuración para APIs y ajustes
- **Diseño Responsivo**: Optimizado para desktop, tablet y móvil
- **Tema Moderno**: Interfaz limpia con Tailwind CSS

## 🛠️ Tecnologías

- **React 18**: Framework principal
- **Tailwind CSS**: Estilos y diseño
- **Recharts**: Gráficos y visualizaciones
- **Lucide React**: Iconografía moderna
- **Axios**: Cliente HTTP
- **React Router**: Navegación
- **Context API**: Gestión de estado

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test

# Linting
npm run lint
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.js       # Layout principal
│   ├── Sidebar.js      # Barra lateral de navegación
│   ├── Header.js       # Cabecera de la aplicación
│   ├── StatsCard.js    # Tarjetas de métricas
│   ├── BotCard.js      # Tarjetas de bots
│   └── ActivityChart.js # Gráfico de actividad
├── pages/              # Páginas principales
│   ├── Dashboard.js    # Página principal
│   ├── Bots.js         # Gestión de bots
│   ├── Analytics.js    # Analytics y métricas
│   └── Settings.js     # Configuración
├── services/           # Servicios y APIs
│   ├── BotContext.js   # Contexto de bots
│   └── botService.js   # Servicio de bots
├── styles/             # Estilos globales
└── utils/              # Utilidades
```

## 🎨 Componentes Principales

### Dashboard
- Métricas generales del ecosistema
- Actividad reciente de bots
- Gráficos de rendimiento
- Acciones rápidas

### Gestión de Bots
- Lista de todos los bots
- Filtros y búsqueda
- Estados en tiempo real
- Acciones de control (start/stop)

### Analytics
- Gráficos interactivos
- Métricas de rendimiento
- Análisis de usuarios
- Tiempo de respuesta

### Configuración
- API Keys y tokens
- Preferencias de notificación
- Configuración de seguridad
- Ajustes generales

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Environment
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
```

### API Integration

El dashboard se conecta con el backend a través de:

- **Bot Service**: Gestión de bots y métricas
- **Analytics API**: Datos de rendimiento
- **Settings API**: Configuración del sistema

## 🐳 Docker

```bash
# Construir imagen
docker build -t panas-dashboard .

# Ejecutar con docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 📱 Responsive Design

El dashboard está optimizado para:

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🎯 Características Técnicas

- **Lazy Loading**: Carga diferida de componentes
- **Code Splitting**: División automática del código
- **PWA Ready**: Preparado para Progressive Web App
- **SEO Optimized**: Meta tags y estructura semántica
- **Accessibility**: Cumple estándares WCAG 2.1

## 🚀 Deployment

### Heroku
```bash
# Build para Heroku
npm run build

# Deploy
git push heroku main
```

### Docker
```bash
# Build y push
docker build -t panas-dashboard .
docker push your-registry/panas-dashboard
```

### Nginx
El proyecto incluye configuración de Nginx optimizada para:
- Compresión gzip
- Cache de assets estáticos
- Headers de seguridad
- Proxy para API

## 🔍 Testing

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📊 Performance

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico:
- 📧 Email: support@panastoken.com
- 💬 Telegram: @panassupport_bot
- 📖 Documentación: [docs.panastoken.com](https://docs.panastoken.com)

---

**Panas Token Ecosystem** - Construyendo el futuro de la medicina digital 🚀