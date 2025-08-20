# 05 - TESTING QA OBSERVABILIDAD CI Y RUNBOOKS

## 1. Testing Strategy

### Stack de testing implementado
- **Unit/Integration**: Vitest 3.2.4 + Testing Library 16.3.0
- **E2E**: Playwright (configurado pero no implementado)
- **A11y**: jest-axe (pendiente de implementar)
- **MSW**: Para simular API y WebSocket

### Configuración de Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    }
  }
});

// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true
});

// Mock de WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Mock de crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123'
  }
});
```

### Tests unitarios de componentes
```typescript
// src/components/chat/__tests__/MessageBubble.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessageBubble } from '../MessageBubble';

const mockMessage = {
  id: 'msg-1',
  messageId: 'msg-1',
  conversationId: 'conv-1',
  type: 'text' as const,
  text: 'Hola mundo',
  createdAt: '2024-01-01T10:00:00Z',
  senderId: 'user-1',
  status: 'sent' as const
};

describe('MessageBubble', () => {
  it('renderiza mensaje de texto correctamente', () => {
    render(
      <MessageBubble
        message={mockMessage}
        customerName="Cliente Test"
      />
    );

    expect(screen.getByText('Hola mundo')).toBeInTheDocument();
    expect(screen.getByText('Cliente Test')).toBeInTheDocument();
  });

  it('muestra botón de reintentar cuando el mensaje falló', () => {
    const onRetry = vi.fn();
    const failedMessage = { ...mockMessage, status: 'failed' as const };

    render(
      <MessageBubble
        message={failedMessage}
        customerName="Cliente Test"
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByTitle('Reintentar envío');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledWith('msg-1');
  });

  it('muestra indicador de envío cuando el mensaje está enviando', () => {
    const sendingMessage = { ...mockMessage, status: 'sending' as const };

    render(
      <MessageBubble
        message={sendingMessage}
        customerName="Cliente Test"
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

### Tests de hooks
```typescript
// src/hooks/__tests__/useWebSocket.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWebSocket } from '../websocket/useWebSocket';
import { WebSocketProvider } from '../../contexts/WebSocketContext';

// Mock de socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  }))
}));

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicializa con estado desconectado', () => {
    const { result } = renderHook(() => useWebSocket(), {
      wrapper: WebSocketProvider
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);
  });

  it('conecta cuando el usuario está autenticado', async () => {
    // Mock de localStorage con token
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');

    const { result } = renderHook(() => useWebSocket(), {
      wrapper: WebSocketProvider
    });

    await waitFor(() => {
      expect(result.current.isConnecting).toBe(true);
    });
  });
});
```

### Tests de integración con MSW
```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'agent'
      }
    });
  }),

  http.get('/api/auth/profile', () => {
    return HttpResponse.json({
      id: 'user-1',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'agent'
    });
  }),

  // Conversations endpoints
  http.get('/api/conversations', () => {
    return HttpResponse.json({
      items: [
        {
          id: 'conv-1',
          status: 'open',
          lastMessageAt: '2024-01-01T10:00:00Z',
          participants: ['user-1'],
          customerName: 'Cliente Test'
        }
      ],
      nextCursor: null
    });
  }),

  // Messages endpoints
  http.get('/api/messages', () => {
    return HttpResponse.json({
      items: [
        {
          id: 'msg-1',
          messageId: 'msg-1',
          conversationId: 'conv-1',
          type: 'text',
          text: 'Hola',
          createdAt: '2024-01-01T10:00:00Z',
          senderId: 'user-1',
          status: 'sent'
        }
      ],
      nextCursor: null
    });
  }),

  http.post('/api/messages', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'msg-2',
      messageId: body.messageId,
      conversationId: body.conversationId,
      type: body.type,
      text: body.text,
      createdAt: new Date().toISOString(),
      senderId: 'user-1',
      status: 'sent'
    });
  })
];

// src/test/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// src/test/setup.ts (continuación)
if (process.env.NODE_ENV === 'test') {
  worker.start({
    onUnhandledRequest: 'bypass'
  });
}
```

## 2. Observabilidad

### ErrorBoundary implementado
```typescript
// src/components/dashboard/ErrorBoundary.tsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Enviar a servicio de monitoreo (Sentry, LogRocket, etc.)
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // Implementar reporte a servicio externo
    if (import.meta.env.VITE_SENTRY_DSN) {
      // Sentry.captureException(error, { extra: errorInfo });
    }
    
    // Log local para debugging
    console.group('🚨 Error Boundary Report');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('User Agent:', navigator.userAgent);
    console.error('URL:', window.location.href);
    console.error('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReport = () => {
    const { error, errorInfo } = this.state;
    if (error) {
      // Abrir email con detalles del error
      const subject = encodeURIComponent('Error Report - Utalk Frontend');
      const body = encodeURIComponent(`
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
      `);
      
      window.open(`mailto:support@utalk.com?subject=${subject}&body=${body}`);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Algo salió mal
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </button>
                
                <button
                  onClick={this.handleReport}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reportar problema
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Logger centralizado
```typescript
// src/utils/logger.ts
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export enum LogCategory {
  API = 'API',
  AUTH = 'AUTH',
  WEBSOCKET = 'WEBSOCKET',
  UI = 'UI',
  PERFORMANCE = 'PERFORMANCE'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel = LogLevel.INFO;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, category: LogCategory, message: string, data?: any, error?: Error) {
    if (level < this.currentLevel) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      error
    };

    this.logs.push(entry);

    // Mantener solo los últimos maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const prefix = `[${category}]`;
    const timestamp = new Date().toLocaleTimeString();
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${prefix} ${timestamp} ${message}`, data);
        break;
      case LogLevel.INFO:
        console.info(`${prefix} ${timestamp} ${message}`, data);
        break;
      case LogLevel.WARN:
        console.warn(`${prefix} ${timestamp} ${message}`, data);
        break;
      case LogLevel.ERROR:
        console.error(`${prefix} ${timestamp} ${message}`, error || data);
        break;
    }

    // Enviar a servicio externo en producción
    if (import.meta.env.PROD && level >= LogLevel.ERROR) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // Implementar envío a Sentry, LogRocket, etc.
    if (import.meta.env.VITE_SENTRY_DSN) {
      // Sentry.captureMessage(entry.message, {
      //   level: this.getSentryLevel(entry.level),
      //   extra: { ...entry.data, category: entry.category }
      // });
    }
  }

  debug(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: LogCategory, message: string, error?: Error, data?: any) {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = Logger.getInstance();

// Helpers específicos por categoría
export const apiLogger = {
  info: (message: string, data?: any) => logger.info(LogCategory.API, message, data),
  error: (message: string, error?: Error, data?: any) => logger.error(LogCategory.API, message, error, data),
  warn: (message: string, data?: any) => logger.warn(LogCategory.API, message, data)
};

export const authLogger = {
  info: (message: string, data?: any) => logger.info(LogCategory.AUTH, message, data),
  error: (message: string, error?: Error, data?: any) => logger.error(LogCategory.AUTH, message, error, data)
};

export const wsLogger = {
  info: (message: string, data?: any) => logger.info(LogCategory.WEBSOCKET, message, data),
  error: (message: string, error?: Error, data?: any) => logger.error(LogCategory.WEBSOCKET, message, error, data)
};
```

### Performance monitoring
```typescript
// src/utils/performanceMonitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private marks: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }

  markStart(name: string): void {
    this.marks.set(name, performance.now());
  }

  markEnd(name: string): number | null {
    const start = this.marks.get(name);
    if (!start) return null;

    const duration = performance.now() - start;
    this.marks.delete(name);
    this.recordMetric(name, duration);
    return duration;
  }

  recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(value);
  }

  getAverage(operation: string): number {
    const values = this.metrics.get(operation) || [];
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [operation, values] of this.metrics) {
      if (values.length === 0) continue;
      
      result[operation] = {
        avg: this.getAverage(operation),
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      };
    }
    
    return result;
  }

  logMetrics(): void {
    console.group('📊 Performance Metrics');
    const metrics = this.getMetrics();
    
    for (const [operation, stats] of Object.entries(metrics)) {
      console.log(
        `${operation}: avg=${stats.avg.toFixed(2)}ms, ` +
        `min=${stats.min.toFixed(2)}ms, ` +
        `max=${stats.max.toFixed(2)}ms, ` +
        `count=${stats.count}`
      );
    }
    console.groupEnd();
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.marks.clear();
  }
}

// Hook para usar en componentes
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  const measureOperation = useCallback((operation: string, fn: () => void) => {
    const endTimer = monitor.startTimer(operation);
    try {
      fn();
    } finally {
      endTimer();
    }
  }, [monitor]);

  const measureAsyncOperation = useCallback(async (operation: string, fn: () => Promise<void>) => {
    const endTimer = monitor.startTimer(operation);
    try {
      await fn();
    } finally {
      endTimer();
    }
  }, [monitor]);

  return { measureOperation, measureAsyncOperation };
};
```

## 3. QA Checklist por release

### Checklist de funcionalidades críticas
```markdown
## ✅ QA Checklist - Release v1.0.0

### 🔐 Autenticación
- [ ] Login con email/password funciona
- [ ] Logout limpia sesión correctamente
- [ ] Token refresh automático funciona
- [ ] Redirección a login cuando token expira
- [ ] Protección de rutas funciona

### 💬 Chat y Mensajería
- [ ] Lista de conversaciones carga correctamente
- [ ] Selección de conversación funciona
- [ ] Envío de mensajes de texto funciona
- [ ] Recepción de mensajes en tiempo real
- [ ] Indicadores de estado (enviando, enviado, entregado, leído)
- [ ] Reintento de mensajes fallidos
- [ ] Subida de archivos funciona
- [ ] Preview de archivos antes de enviar
- [ ] Límites de tamaño de archivo respetados

### 🔄 WebSocket
- [ ] Conexión automática al cargar app
- [ ] Reconexión automática en pérdida de conexión
- [ ] Recepción de mensajes en tiempo real
- [ ] Indicadores de estado de conexión
- [ ] Cola de mensajes offline funciona

### 📊 Dashboard y KPIs
- [ ] Métricas se cargan correctamente
- [ ] Filtros por rango de tiempo funcionan
- [ ] Gráficos se renderizan sin errores
- [ ] Datos se actualizan en tiempo real

### 👥 Gestión de Equipo
- [ ] Lista de miembros del equipo carga
- [ ] Filtros de búsqueda funcionan
- [ ] Estadísticas de rendimiento se muestran
- [ ] Permisos se aplican correctamente

### 👤 Gestión de Clientes
- [ ] Lista de clientes con paginación
- [ ] Búsqueda y filtros funcionan
- [ ] Detalles del cliente se muestran
- [ ] Historial de conversaciones accesible

### 📱 Responsividad
- [ ] Funciona en desktop (1920x1080)
- [ ] Funciona en tablet (768x1024)
- [ ] Funciona en móvil (375x667)
- [ ] Sidebar se colapsa en móvil
- [ ] Menús se adaptan a pantalla pequeña

### ♿ Accesibilidad
- [ ] Navegación por teclado funciona
- [ ] Focus visible en elementos interactivos
- [ ] Contraste de colores adecuado
- [ ] ARIA labels en componentes críticos
- [ ] Screen reader compatible

### 🚀 Performance
- [ ] Tiempo de carga inicial < 3s
- [ ] Transiciones suaves sin lag
- [ ] Scroll en listas largas fluido
- [ ] No memory leaks detectados
- [ ] Bundle size < 2MB

### 🔧 Configuración
- [ ] Variables de entorno configuradas
- [ ] Build de producción funciona
- [ ] Deploy en Vercel/Netlify exitoso
- [ ] Logs de error se capturan
```

## 4. CI/CD Pipeline

### GitHub Actions workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run type check
      run: npm run type-check
    
    - name: Run tests
      run: npm test
      env:
        NODE_ENV: test
    
    - name: Run tests with coverage
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        VITE_BACKEND_URL: ${{ secrets.VITE_BACKEND_URL }}
        VITE_SOCKET_URL: ${{ secrets.VITE_SOCKET_URL }}
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/
    
    - name: Deploy to Vercel (Staging)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/
    
    - name: Deploy to Vercel (Production)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

### Scripts de package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "build": "tsc -b && vite build",
    "build:analyze": "tsc -b && vite build --mode analyze",
    "preview": "vite preview",
    "clean:logs": "node scripts/clean-console-logs.js",
    "optimize-imports": "node scripts/optimize-imports.js",
    "analyze-bundle": "node scripts/bundle-analyzer.js"
  }
}
```

## 5. Runbooks (paso a paso)

### Runbook: No aparecen mensajes en el chat

```markdown
## 🚨 Problema: No aparecen mensajes en el chat

### 1. Verificar conexión WebSocket
```bash
# Abrir DevTools → Console
# Buscar logs de conexión WebSocket
```

**Logs esperados:**
- "WebSocket connected"
- "Joining conversation room: conv-123"

**Si no hay logs de conexión:**
1. Verificar `VITE_SOCKET_URL` en variables de entorno
2. Verificar que el backend esté corriendo
3. Verificar token de autenticación

### 2. Verificar autenticación
```bash
# En DevTools → Application → Local Storage
# Verificar que exista:
- access_token
- refresh_token
- user (JSON válido)
```

**Si faltan tokens:**
1. Hacer logout y login nuevamente
2. Verificar que el backend responda en `/api/auth/profile`

### 3. Verificar suscripción a room
```javascript
// En DevTools → Console
// Verificar que el socket esté en la room correcta
window.__WEBSOCKET_DEBUG__?.getRooms()
```

**Si no está en la room:**
1. Verificar que `conversationId` sea válido
2. Verificar permisos del usuario para esa conversación
3. Revisar logs del backend para errores de autorización

### 4. Forzar refetch de mensajes
```javascript
// En DevTools → Console
// Invalidar cache de React Query
window.__REACT_QUERY_DEBUG__?.invalidateQueries(['messages', 'conv-123'])
```

### 5. Verificar API REST
```bash
# Probar endpoint directamente
curl -H "Authorization: Bearer TOKEN" \
  "https://backend.com/api/messages?conversationId=conv-123"
```

**Si la API falla:**
1. Verificar que el backend esté funcionando
2. Verificar que el `conversationId` exista
3. Verificar permisos del usuario

### 6. Verificar logs del backend
```bash
# En el servidor del backend
tail -f logs/app.log | grep "conv-123"
```

**Buscar:**
- Errores de autenticación
- Errores de base de datos
- Errores de WebSocket

### 7. Solución temporal
Si el problema persiste:
1. Recargar la página
2. Cambiar de conversación y volver
3. Hacer logout/login
4. Limpiar cache del navegador
```

### Runbook: Mensajes duplicados

```markdown
## 🚨 Problema: Mensajes duplicados

### 1. Verificar deduplicación en frontend
```javascript
// En DevTools → Console
// Verificar deduplicador
window.__DEDUP_DEBUG__?.getProcessedMessages()
```

**Si hay duplicados en el deduplicador:**
1. Limpiar cache del deduplicador
2. Recargar la página

### 2. Verificar messageId único
```javascript
// En DevTools → Console
// Verificar que cada mensaje tenga messageId único
window.__MESSAGES_DEBUG__?.getMessageIds()
```

**Si hay messageIds duplicados:**
1. Verificar generación de UUID
2. Verificar que no se reenvíe el mismo mensaje

### 3. Verificar WebSocket vs REST
```javascript
// En DevTools → Console
// Verificar si se están enviando por ambos canales
window.__WEBSOCKET_DEBUG__?.getSentMessages()
window.__API_DEBUG__?.getSentMessages()
```

**Si se envían por ambos:**
1. Verificar lógica de fallback
2. Verificar que no se active fallback innecesariamente

### 4. Verificar backend
```bash
# En el servidor
# Verificar logs de duplicados
grep "duplicate" logs/app.log
```

**Si el backend reporta duplicados:**
1. Verificar deduplicación en base de datos
2. Verificar índices únicos en tabla de mensajes

### 5. Solución
1. Limpiar cache local
2. Recargar página
3. Verificar que no se reenvíen mensajes manualmente
```

### Runbook: Envío de media falla

```markdown
## 🚨 Problema: Envío de media falla

### 1. Verificar validación de archivo
```javascript
// En DevTools → Console
// Verificar restricciones de archivo
console.log('File validation:', {
  maxSize: '10MB',
  allowedTypes: ['image/*', 'audio/*', '.pdf', '.doc', '.docx']
})
```

**Verificar:**
- Tamaño del archivo < 10MB
- Tipo de archivo permitido
- Archivo no corrupto

### 2. Verificar upload a servidor
```bash
# En DevTools → Network
# Buscar request a /api/media/upload
# Verificar:
- Status code (200, 413, 415)
- Response body
- Headers (Content-Type, Authorization)
```

**Si falla upload:**
1. Verificar que el backend esté funcionando
2. Verificar permisos de escritura en storage
3. Verificar límites de tamaño en backend

### 3. Verificar firma/URL
```javascript
// En DevTools → Console
// Verificar respuesta del upload
window.__UPLOAD_DEBUG__?.getLastUpload()
```

**Verificar:**
- `mediaId` se genera correctamente
- `url` es válida y accesible
- `expiresAt` es futuro

### 4. Verificar envío de mensaje con media
```javascript
// En DevTools → Console
// Verificar payload del mensaje
window.__MESSAGE_DEBUG__?.getLastMessage()
```

**Verificar:**
- `mediaId` está presente
- `type` es correcto
- `metadata` contiene info del archivo

### 5. Verificar storage
```bash
# En el servidor
# Verificar que el archivo se guardó
ls -la /path/to/storage/
```

**Si el archivo no está:**
1. Verificar permisos de directorio
2. Verificar espacio en disco
3. Verificar configuración de storage

### 6. Solución temporal
1. Intentar con archivo más pequeño
2. Intentar con tipo de archivo diferente
3. Verificar conexión a internet
4. Limpiar cache del navegador
```

### Runbook: Socket se desconecta constantemente

```markdown
## 🚨 Problema: Socket se desconecta constantemente

### 1. Verificar logs de reconexión
```javascript
// En DevTools → Console
// Verificar intentos de reconexión
window.__WEBSOCKET_DEBUG__?.getReconnectAttempts()
```

**Si hay muchos intentos:**
1. Verificar estabilidad de red
2. Verificar que el backend no esté reiniciándose
3. Verificar configuración de timeout

### 2. Verificar expiración de token
```javascript
// En DevTools → Console
// Verificar token
const token = localStorage.getItem('access_token');
console.log('Token expires:', new Date(JSON.parse(atob(token.split('.')[1])).exp * 1000));
```

**Si el token está próximo a expirar:**
1. Verificar refresh automático
2. Verificar que el backend no esté rechazando tokens válidos

### 3. Verificar configuración de WebSocket
```javascript
// En DevTools → Console
// Verificar configuración
window.__WEBSOCKET_DEBUG__?.getConfig()
```

**Verificar:**
- `reconnectionAttempts: Infinity`
- `reconnectionDelay: 1000`
- `timeout: 20000`

### 4. Verificar red y proxy
```bash
# Verificar conectividad
ping backend.com
telnet backend.com 443
```

**Si hay problemas de red:**
1. Verificar firewall
2. Verificar proxy corporativo
3. Verificar DNS

### 5. Verificar backend
```bash
# En el servidor
# Verificar logs de WebSocket
tail -f logs/websocket.log | grep "disconnect"
```

**Buscar patrones:**
- Desconexiones masivas (problema de servidor)
- Desconexiones específicas (problema de cliente)
- Errores de autenticación

### 6. Solución
1. Verificar estabilidad de red
2. Aumentar timeout si es necesario
3. Implementar exponential backoff
4. Verificar que el backend no tenga rate limiting agresivo
```

## 6. Matriz de compatibilidad con BACK

### Endpoints críticos
```markdown
| Endpoint | Método | Status | Notas |
|----------|--------|--------|-------|
| `/api/auth/login` | POST | ✅ | Funcional |
| `/api/auth/profile` | GET | ✅ | Funcional |
| `/api/auth/refresh` | POST | ✅ | Funcional |
| `/api/conversations` | GET | ✅ | Funcional |
| `/api/conversations/:id` | GET | ✅ | Funcional |
| `/api/messages` | GET | ✅ | Funcional |
| `/api/messages` | POST | ✅ | Funcional |
| `/api/media/upload` | POST | ✅ | Funcional |
| `/api/media/:id/url` | GET | ✅ | Funcional |
| `/api/clients` | GET | ✅ | Funcional |
| `/api/team/members` | GET | ✅ | Funcional |
| `/api/kpis` | GET | ✅ | Funcional |
```

### Eventos WebSocket críticos
```markdown
| Evento | Dirección | Status | Notas |
|--------|-----------|--------|-------|
| `message:send` | Client → Server | ✅ | Funcional |
| `message:new` | Server → Client | ✅ | Funcional |
| `message:delivered` | Server → Client | ✅ | Funcional |
| `message:read` | Server → Client | ✅ | Funcional |
| `conversation:updated` | Server → Client | ✅ | Funcional |
| `typing:start` | Client → Server | ✅ | Funcional |
| `typing:stop` | Client → Server | ✅ | Funcional |
| `conversation:read` | Client → Server | ✅ | Funcional |
| `escalation:started` | Server → Client | ✅ | Funcional |
| `escalation:ended` | Server → Client | ✅ | Funcional |
```

### Códigos de error estándar
```markdown
| Código | Descripción | Manejo en Frontend |
|--------|-------------|-------------------|
| `VALIDATION_ERROR` | Datos inválidos | Mostrar errores de validación |
| `AUTH_REQUIRED` | Token expirado | Redirigir a login |
| `RATE_LIMITED` | Demasiadas peticiones | Mostrar mensaje de espera |
| `NOT_FOUND` | Recurso no encontrado | Mostrar 404 |
| `FORBIDDEN` | Sin permisos | Mostrar error de permisos |
| `INTERNAL_ERROR` | Error del servidor | Mostrar error genérico |
```

### Versiones compatibles
```markdown
| Componente | Versión Frontend | Versión Backend | Compatible |
|------------|------------------|-----------------|------------|
| API REST | v1.0.0 | v1.0.0 | ✅ |
| WebSocket | v1.0.0 | v1.0.0 | ✅ |
| Auth | v1.0.0 | v1.0.0 | ✅ |
| Media | v1.0.0 | v1.0.0 | ✅ |
| KPIs | v1.0.0 | v1.0.0 | ✅ |
``` 