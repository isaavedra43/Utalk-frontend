/**
 * Console Exporter - Herramienta segura para exportar logs de la consola
 * No requiere plugins externos, usa APIs nativas del navegador
 */

interface LogEntry {
  timestamp: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: unknown[];
  stack?: string;
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

  constructor() {
    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    };
  }

  /**
   * Iniciar la captura de logs
   */
  startCapture(): void {
    console.log('🔍 ConsoleExporter: Iniciando captura de logs...');
    
    // Interceptar console.log
    console.log = (...args) => {
      this.captureLog('log', ...args);
      this.originalConsole.log(...args);
    };

    // Interceptar console.info
    console.info = (...args) => {
      this.captureLog('info', ...args);
      this.originalConsole.info(...args);
    };

    // Interceptar console.warn
    console.warn = (...args) => {
      this.captureLog('warn', ...args);
      this.originalConsole.warn(...args);
    };

    // Interceptar console.error
    console.error = (...args) => {
      this.captureLog('error', ...args);
      this.originalConsole.error(...args);
    };

    // Interceptar console.debug
    console.debug = (...args) => {
      this.captureLog('debug', ...args);
      this.originalConsole.debug(...args);
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
   * Capturar un log individual
   */
  private captureLog(level: LogEntry['level'], message: string, ...args: unknown[]): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      data: args.length > 0 ? args : undefined
    };

    // Agregar stack trace para errores
    if (level === 'error' && args.length > 0 && typeof args[0] === 'object' && args[0] !== null && 'stack' in args[0]) {
      entry.stack = (args[0] as { stack: string }).stack;
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
  getStats(): { total: number; byLevel: Record<string, number> } {
    const stats = {
      total: this.logs.length,
      byLevel: {
        log: 0,
        info: 0,
        warn: 0,
        error: 0,
        debug: 0
      }
    };

    this.logs.forEach(log => {
      stats.byLevel[log.level]++;
    });

    return stats;
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

// Función para exportar desde la consola del navegador
(window as typeof window & { exportLogs?: (format: 'json' | 'txt') => void }).exportLogs = (format: 'json' | 'txt' = 'json') => {
  consoleExporter.downloadLogs(format);
};

// Función para ver estadísticas desde la consola del navegador
(window as typeof window & { getLogStats?: () => { total: number; byLevel: Record<string, number> } }).getLogStats = () => {
  const stats = consoleExporter.getStats();
  console.table(stats.byLevel);
  console.log(`Total de logs: ${stats.total}`);
  return stats;
};

// Función para limpiar logs desde la consola del navegador
(window as typeof window & { clearLogs?: () => void }).clearLogs = () => {
  consoleExporter.clearLogs();
};

export default consoleExporter; 