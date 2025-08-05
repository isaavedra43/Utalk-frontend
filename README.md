# UTalk Frontend

Sistema de chat profesional tipo Slack construido con SvelteKit + TypeScript.

## 🚀 Características Principales

- ✅ **Autenticación segura** con JWT y HttpOnly cookies
- ✅ **Sistema de logging ultra robusto** basado en estándares de observabilidad moderna
- ✅ **Arquitectura limpia** con separación de responsabilidades
- ✅ **TypeScript estricto** con tipos robustos
- ✅ **UI moderna** con Tailwind CSS y shadcn-svelte
- ✅ **Testing** con Vitest y Testing Library
- ✅ **Validación automática** con ESLint, Prettier y Husky

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Desarrollo](#desarrollo)
- [Sistema de Logging](#sistema-de-logging)
- [Arquitectura](#arquitectura)
- [Testing](#testing)
- [Producción](#producción)

## 🛠️ Instalación

### Requisitos del Sistema

- **Node.js**: >= 20.0.0 (recomendado: 20.x LTS)
- **npm**: >= 8.0.0

```bash
# Verificar versión de Node.js
node --version  # Debe ser >= 20.0.0

# Clonar el repositorio
git clone https://github.com/tu-usuario/utalk-frontend.git
cd utalk-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

## 🏗️ Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Validación completa
npm run validate
```

## 📊 Sistema de Logging

UTalk Frontend incluye un **sistema de logging ultra robusto** basado en estándares de observabilidad moderna de empresas como Netflix, Google, Stripe y Vercel.

### Características del Logger

- **🎯 Logging estructurado** con niveles RFC5424 (FATAL, ERROR, WARN, INFO, DEBUG, TRACE, EVENT)
- **🚀 Múltiples transportes** (Console, LocalStorage, Remote endpoints)
- **⚡ Interceptores automáticos** para Axios, Fetch y Socket.io
- **📈 Performance monitoring** integrado
- **🍞 Error tracking** con breadcrumbs para trazabilidad
- **🔒 Sanitización automática** de datos sensibles
- **🛡️ Throttling** para prevenir spam de logs
- **📊 Métricas de observabilidad** en tiempo real
- **💾 Export/import** de logs para auditoría

### Uso Básico

```typescript
import { logger } from '$lib/logger';

// Logging básico
logger.info('Usuario autenticado', { userId: '123' });
logger.error('Error de login', error);
logger.warn('Respuesta lenta del servidor');
logger.debug('Datos de depuración', { data });

// Logging especializado
logger.logUserAction('login_attempt');
logger.logPerformance('api_call', 250);
logger.logNetwork('POST', '/api/auth/login', { status: 200 });

// Event logging para analytics
logger.event('button_click', {
  user: {
    action: 'cta_click',
    component: 'hero',
    metadata: { buttonText: 'Get Started' }
  }
});
```

### Configuración Avanzada

```typescript
import { configureLogger, LogLevel, setupAxiosInterceptors } from '$lib/logger';

// Configurar logger personalizado
const logger = configureLogger({
  level: LogLevel.DEBUG,
  enableStorage: true,
  enableRemote: true,
  remoteEndpoint: 'https://api.yourdomain.com/logs',
  batchSize: 20,
  flushInterval: 5000,
  sensitiveFields: ['password', 'token', 'apiKey']
});

// Configurar interceptores automáticos
setupAxiosInterceptors(axiosInstance);
setupPerformanceMonitor();
```

### Integración con Servicios Externos

El logger está preparado para integrarse con servicios de observabilidad:

#### Sentry

```typescript
// El logger incluye un transport para Sentry listo para usar
// Solo necesitas instalar e inicializar Sentry
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN'
});

// Los errores FATAL y ERROR se envían automáticamente a Sentry
```

#### Datadog, Elastic, Axiom

```typescript
// Configurar endpoint remoto
const logger = configureLogger({
  enableRemote: true,
  remoteEndpoint: 'https://http-intake.logs.datadoghq.com/v1/input/YOUR_API_KEY',
  batchSize: 50,
  flushInterval: 10000
});
```

### Métricas y Monitoreo

```typescript
import { logger } from '$lib/logger';

// Obtener métricas del logger
const metrics = logger.getMetrics();
console.log('Total logs:', metrics.totalLogs);
console.log('Error rate:', metrics.errorRate);
console.log('Logs por nivel:', metrics.logsByLevel);

// Exportar logs para auditoría
const logsBlob = await logger.export();
const url = URL.createObjectURL(logsBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'utalk-logs.json';
a.click();
```

### Configuración por Entorno

El logger se auto-configura según el entorno:

- **Development**: Logs DEBUG+, storage habilitado, console verbose
- **Staging**: Logs INFO+, storage habilitado, remote opcional
- **Production**: Logs WARN+, solo remote, optimizado para performance

### Interceptores Automáticos

```typescript
// Los interceptores se configuran automáticamente en desarrollo
// Para configuración manual:

// Axios
setupAxiosInterceptors(axiosInstance, {
  logRequests: true,
  logResponses: true,
  logErrors: true,
  excludeUrls: ['/ping', '/health']
});

// Fetch nativo
setupFetchInterceptor({
  logPerformance: true,
  maxBodySize: 1024
});

// Performance global
setupPerformanceMonitor(); // Auto-detecta Long Tasks, Page Load, etc.
```

### Logging de Seguridad

```typescript
// El logger automáticamente sanitiza datos sensibles
logger.info('Login attempt', {
  email: 'user@example.com',
  password: 'secret123', // Se convierte automáticamente en '[REDACTED]'
  token: 'jwt-token' // Se convierte automáticamente en '[REDACTED]'
});

// Campos sensibles configurables
const logger = configureLogger({
  sensitiveFields: ['password', 'token', 'apiKey', 'secret', 'ssn', 'creditCard']
});
```

## 🏛️ Arquitectura

### Estructura del Proyecto

```
src/
├── lib/
│   ├── logger/              # Sistema de logging
│   │   ├── index.ts         # Logger principal
│   │   ├── types.ts         # Tipos e interfaces
│   │   ├── utils.ts         # Utilidades y helpers
│   │   ├── transports.ts    # Transportes (console, storage, remote)
│   │   └── interceptors.ts  # Interceptores automáticos
│   ├── services/            # Servicios de negocio
│   │   ├── auth.service.ts  # Autenticación (con logging integrado)
│   │   ├── axios.ts         # Cliente HTTP
│   │   └── socket.ts        # WebSocket cliente
│   ├── stores/              # Stores de Svelte
│   │   ├── auth.store.ts    # Estado de autenticación
│   │   └── page.store.ts    # Estado de página
│   ├── types/               # Tipos TypeScript
│   │   ├── auth.ts          # Tipos de autenticación
│   │   ├── http.ts          # Tipos HTTP/API
│   │   └── ui.ts            # Tipos de UI
│   └── components/          # Componentes reutilizables
├── routes/                  # Rutas de SvelteKit
└── tests/                   # Tests
```

### Principios de Logging

1. **Estructurado**: Todos los logs son JSON estructurados
2. **Contextual**: Cada log incluye contexto relevante (módulo, función, usuario)
3. **Seguro**: Datos sensibles automáticamente sanitizados
4. **Performante**: Throttling y batching para no impactar performance
5. **Observable**: Métricas y trazabilidad completa
6. **Escalable**: Múltiples transportes y configuración por entorno

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

## 🚀 Producción

```bash
# Build optimizado
npm run build

# Validar antes de desplegar
npm run validate

# Desplegar (ejemplo con Vercel)
vercel --prod
```

### Configuración de Producción

En producción, el logger se optimiza automáticamente:

- Solo logs WARN+ para reducir volumen
- Remote transport habilitado para centralización
- Batching agresivo para performance
- Métricas de error rate y performance

## 📚 Recursos Adicionales

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn-svelte](https://www.shadcn-svelte.com/)
- [OpenTelemetry](https://opentelemetry.io/)
- [RFC5424 - Syslog Protocol](https://tools.ietf.org/html/rfc5424)

## 📝 Changelog

### 2025-01-04 - v1.0.0

- ✅ Sistema de autenticación completo
- ✅ **Sistema de logging ultra robusto implementado**
- ✅ Interceptores automáticos para monitoring
- ✅ Performance tracking integrado
- ✅ Error handling con breadcrumbs
- ✅ Sanitización de datos sensibles
- ✅ Métricas de observabilidad
- ✅ Integración lista para servicios externos
- ✅ Configuración automática por entorno
- ✅ Documentación completa del logger

---

**Desarrollado con ❤️ por el equipo de UTalk**
