/**
 * Console Exporter - Herramienta segura para exportar logs de la consola
 * No requiere plugins externos, usa APIs nativas del navegador
 * MEJORADO: Captura todas las peticiones HTTP y WebSocket para detectar rate limit
 */

interface LogEntry {
  timestamp: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug' | 'http' | 'websocket';
  message: string;
  data?: unknown[];
  stack?: string;
  requestId?: string;
  url?: string;
  method?: string;
  status?: number;
  responseTime?: number;
}

class ConsoleExporter {
  private logs: LogEntry[] = [];
  private originalConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };
  private originalFetch: typeof window.fetch;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open;
  private originalXHRSend: typeof XMLHttpRequest.prototype.send;
  private requestCounter = 0;
  private isCapturingNetwork = false;

  constructor() {
    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };
    this.originalFetch = window.fetch;
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;
  }

  /**
   * Iniciar la captura de logs
   */
  startCapture(): void {
    console.log('🔍 ConsoleExporter: Iniciando captura de logs...');
    
    // Interceptar console.log
    console.log = (...args) => {
      const message = args.length > 0 ? String(args[0]) : '';
      const additionalData = args.length > 1 ? args.slice(1) : undefined;
      this.captureLog('log', message, additionalData);
      this.originalConsole.log.apply(console, args);
    };

    // Interceptar console.info
    console.info = (...args) => {
      const message = args.length > 0 ? String(args[0]) : '';
      const additionalData = args.length > 1 ? args.slice(1) : undefined;
      this.captureLog('info', message, additionalData);
      this.originalConsole.info.apply(console, args);
    };

    // Interceptar console.warn
    console.warn = (...args) => {
      const message = args.length > 0 ? String(args[0]) : '';
      const additionalData = args.length > 1 ? args.slice(1) : undefined;
      this.captureLog('warn', message, additionalData);
      this.originalConsole.warn.apply(console, args);
    };

    // Interceptar console.error
    console.error = (...args) => {
      const message = args.length > 0 ? String(args[0]) : '';
      const additionalData = args.length > 1 ? args.slice(1) : undefined;
      this.captureLog('error', message, additionalData);
      this.originalConsole.error.apply(console, args);
    };

    // Interceptar console.debug
    console.debug = (...args) => {
      const message = args.length > 0 ? String(args[0]) : '';
      const additionalData = args.length > 1 ? args.slice(1) : undefined;
      this.captureLog('debug', message, additionalData);
      this.originalConsole.debug.apply(console, args);
    };

    // Capturar errores no manejados
    window.addEventListener('error', (event) => {
      this.captureLog('error', `Error no manejado: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureLog('error', `Promesa rechazada: ${event.reason}`, {
        reason: event.reason
      });
    });

    // Log de inicio de captura
    this.captureLog('info', 'ConsoleExporter: Captura de logs iniciada automáticamente');
  }

  /**
   * Iniciar captura de peticiones de red
   */
  startNetworkCapture(): void {
    if (this.isCapturingNetwork) {
      console.warn('⚠️ ConsoleExporter: Captura de red ya está activa');
      return;
    }

    this.isCapturingNetwork = true;
    console.log('🌐 ConsoleExporter: Iniciando captura de peticiones de red...');

    // Interceptar fetch
    window.fetch = async (...args) => {
      const requestId = `fetch_${++this.requestCounter}`;
      const startTime = performance.now();
      const [url, options] = args;
      const method = (options?.method || 'GET').toUpperCase();

      this.captureLog('http', `🌐 FETCH REQUEST [${requestId}]`, {
        method,
        url: typeof url === 'string' ? url : url.toString(),
        requestId,
        timestamp: new Date().toISOString()
      });

      try {
        const response = await this.originalFetch.apply(window, args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        this.captureLog('http', `✅ FETCH RESPONSE [${requestId}]`, {
          method,
          url: typeof url === 'string' ? url : url.toString(),
          status: response.status,
          statusText: response.statusText,
          responseTime: Math.round(responseTime),
          requestId,
          timestamp: new Date().toISOString()
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        this.captureLog('error', `❌ FETCH ERROR [${requestId}]`, {
          method,
          url: typeof url === 'string' ? url : url.toString(),
          error: error instanceof Error ? error.message : String(error),
          responseTime: Math.round(responseTime),
          requestId,
          timestamp: new Date().toISOString()
        });

        throw error;
      }
    };

    // Interceptar XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const exporterInstance = this;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
      const requestId = `xhr_${++exporterInstance.requestCounter}`;
      const startTime = performance.now();

      // Agregar propiedades personalizadas al objeto XMLHttpRequest usando un Map
      const xhrData = new Map();
      xhrData.set('requestId', requestId);
      xhrData.set('startTime', startTime);
      xhrData.set('method', method);
      xhrData.set('url', url);
      
      // Almacenar el Map en el objeto XMLHttpRequest
      (this as unknown as { __xhrData: Map<string, unknown> }).__xhrData = xhrData;

      exporterInstance.captureLog('http', `🌐 XHR REQUEST [${requestId}]`, {
        method: method.toUpperCase(),
        url: url.toString(),
        requestId,
        timestamp: new Date().toISOString()
      });

      return originalXHROpen.call(this, method, url, async ?? true, username, password);
    };

    XMLHttpRequest.prototype.send = function(data?: Document | XMLHttpRequestBodyInit | null) {
      const xhrData = (this as unknown as { __xhrData: Map<string, unknown> }).__xhrData;
      const requestId = xhrData?.get('requestId') as string;
      const startTime = xhrData?.get('startTime') as number;
      const method = xhrData?.get('method') as string;
      const url = xhrData?.get('url') as string | URL;

      const originalOnReadyStateChange = this.onreadystatechange;

      this.onreadystatechange = function(this: XMLHttpRequest, ev: Event) {
        if (this.readyState === 4) {
          const endTime = performance.now();
          const responseTime = endTime - startTime;

          if (this.status >= 200 && this.status < 300) {
            exporterInstance.captureLog('http', `✅ XHR RESPONSE [${requestId}]`, {
              method: method.toUpperCase(),
              url: url.toString(),
              status: this.status,
              statusText: this.statusText,
              responseTime: Math.round(responseTime),
              requestId,
              timestamp: new Date().toISOString()
            });
          } else {
            exporterInstance.captureLog('error', `❌ XHR ERROR [${requestId}]`, {
              method: method.toUpperCase(),
              url: url.toString(),
              status: this.status,
              statusText: this.statusText,
              responseTime: Math.round(responseTime),
              requestId,
              timestamp: new Date().toISOString()
            });
          }
        }

        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.call(this, ev);
        }
      };

      return originalXHRSend.call(this, data || null);
    };

    this.captureLog('info', 'ConsoleExporter: Captura de peticiones de red iniciada');
  }

  /**
   * Detener la captura de logs
   */
  stopCapture(): void {
    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.debug = this.originalConsole.debug;
    
    console.log('🔍 ConsoleExporter: Captura de logs detenida');
  }

  /**
   * Detener captura de peticiones de red
   */
  stopNetworkCapture(): void {
    if (!this.isCapturingNetwork) {
      console.warn('⚠️ ConsoleExporter: Captura de red no está activa');
      return;
    }

    this.isCapturingNetwork = false;
    window.fetch = this.originalFetch;
    XMLHttpRequest.prototype.open = this.originalXHROpen;
    XMLHttpRequest.prototype.send = this.originalXHRSend;

    this.captureLog('info', 'ConsoleExporter: Captura de peticiones de red detenida');
  }

  /**
   * Capturar un log individual
   */
  captureLog(level: LogEntry['level'], message: string, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      data: data !== undefined ? [data] : undefined
    };

    // Agregar stack trace para errores
    if (level === 'error' && data && typeof data === 'object' && data !== null && 'stack' in data) {
      entry.stack = (data as { stack: string }).stack;
    }

    // Extraer información de peticiones HTTP
    if (level === 'http' && data && typeof data === 'object' && data !== null) {
      const httpData = data as Record<string, unknown>;
      entry.requestId = httpData.requestId as string;
      entry.url = httpData.url as string;
      entry.method = httpData.method as string;
      entry.status = httpData.status as number;
      entry.responseTime = httpData.responseTime as number;
    }

    this.logs.push(entry);
  }

  /**
   * Obtener todos los logs capturados
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Limpiar logs
   */
  clearLogs(): void {
    this.logs = [];
    console.log('🔍 ConsoleExporter: Logs limpiados');
  }

  /**
   * Exportar logs como JSON
   */
  exportAsJSON(): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Exportar logs como texto plano
   */
  exportAsText(): string {
    let text = `=== EXPORTE DE LOGS ===\n`;
    text += `Fecha: ${new Date().toLocaleString()}\n`;
    text += `Total de logs: ${this.logs.length}\n\n`;

    this.logs.forEach((log, index) => {
      text += `[${index + 1}] ${log.timestamp} [${log.level.toUpperCase()}] ${log.message}\n`;
      
      if (log.data && log.data.length > 0) {
        text += `    Datos: ${JSON.stringify(log.data, null, 2)}\n`;
      }
      
      if (log.stack) {
        text += `    Stack: ${log.stack}\n`;
      }
      
      text += '\n';
    });

    return text;
  }

  /**
   * Descargar logs como archivo
   */
  downloadLogs(format: 'json' | 'txt' = 'json'): void {
    const content = format === 'json' ? this.exportAsJSON() : this.exportAsText();
    const filename = `console-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format}`;
    
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`🔍 ConsoleExporter: Logs descargados como ${filename}`);
  }

  /**
   * Obtener estadísticas de logs
   */
  getStats(): { total: number; byLevel: Record<string, number>; httpRequests: number; errors: number } {
    const stats = {
      total: this.logs.length,
      byLevel: {
        log: 0,
        info: 0,
        warn: 0,
        error: 0,
        debug: 0,
        http: 0,
        websocket: 0
      },
      httpRequests: 0,
      errors: 0
    };

    this.logs.forEach(log => {
      stats.byLevel[log.level]++;
      if (log.level === 'http') {
        stats.httpRequests++;
      }
      if (log.level === 'error') {
        stats.errors++;
      }
    });

    return stats;
  }

  /**
   * Filtrar logs por tipo
   */
  filterLogs(level?: LogEntry['level'], url?: string): LogEntry[] {
    return this.logs.filter(log => {
      if (level && log.level !== level) return false;
      if (url && log.url && !log.url.includes(url)) return false;
      return true;
    });
  }

  /**
   * Obtener logs de peticiones HTTP
   */
  getHttpLogs(): LogEntry[] {
    return this.filterLogs('http');
  }

  /**
   * Obtener logs de errores
   */
  getErrorLogs(): LogEntry[] {
    return this.filterLogs('error');
  }
}

// Instancia global
const consoleExporter = new ConsoleExporter();

// Función para iniciar desde la consola del navegador
(window as typeof window & { startLogCapture?: () => void }).startLogCapture = () => {
  consoleExporter.startCapture();
  console.log('✅ Captura de logs iniciada. Usa stopLogCapture() para detener.');
};

// Función para detener desde la consola del navegador
(window as typeof window & { stopLogCapture?: () => void }).stopLogCapture = () => {
  consoleExporter.stopCapture();
  console.log('✅ Captura de logs detenida.');
};

// Función para iniciar captura de red desde la consola del navegador
(window as typeof window & { startNetworkCapture?: () => void }).startNetworkCapture = () => {
  consoleExporter.startNetworkCapture();
  console.log('✅ Captura de peticiones de red iniciada. Usa stopNetworkCapture() para detener.');
};

// Función para detener captura de red desde la consola del navegador
(window as typeof window & { stopNetworkCapture?: () => void }).stopNetworkCapture = () => {
  consoleExporter.stopNetworkCapture();
  console.log('✅ Captura de peticiones de red detenida.');
};

// Función para exportar desde la consola del navegador
(window as typeof window & { exportLogs?: (format: 'json' | 'txt') => void }).exportLogs = (format: 'json' | 'txt' = 'json') => {
  consoleExporter.downloadLogs(format);
};

// Función para ver estadísticas desde la consola del navegador
(window as typeof window & { getLogStats?: () => { total: number; byLevel: Record<string, number>; httpRequests: number; errors: number } }).getLogStats = () => {
  const stats = consoleExporter.getStats();
  console.table(stats.byLevel);
  console.log(`Total de logs: ${stats.total}`);
  console.log(`Peticiones HTTP: ${stats.httpRequests}`);
  console.log(`Errores: ${stats.errors}`);
  return stats;
};

// Función para limpiar logs desde la consola del navegador
(window as typeof window & { clearLogs?: () => void }).clearLogs = () => {
  consoleExporter.clearLogs();
};

// Función para filtrar logs desde la consola del navegador
(window as typeof window & { filterLogs?: (level?: string, url?: string) => LogEntry[] }).filterLogs = (level?: string, url?: string) => {
  const filtered = consoleExporter.filterLogs(level as LogEntry['level'], url);
  console.log(`Logs filtrados: ${filtered.length} resultados`);
  return filtered;
};

export default consoleExporter; 