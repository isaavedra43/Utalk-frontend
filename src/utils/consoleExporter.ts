// Función simple para exportar logs de la consola
interface LogEntry {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: unknown;
}

class ConsoleExporter {
  private logs: LogEntry[] = [];
  private originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    info: typeof console.info;
  };

  constructor() {
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };
    
    this.interceptConsole();
  }

  private interceptConsole() {
    const addLog = (level: LogEntry['level']) => {
      return (...args: unknown[]) => {
        // Llamar al console original
        this.originalConsole[level](...args);
        
        // Capturar el log
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        this.logs.push({
          timestamp: new Date().toISOString(),
          level,
          message,
          data: args.length > 1 ? args : undefined
        });
        
        // Mantener solo los últimos 1000 logs para evitar problemas de memoria
        if (this.logs.length > 1000) {
          this.logs = this.logs.slice(-1000);
        }
      };
    };

    console.log = addLog('log');
    console.warn = addLog('warn');
    console.error = addLog('error');
    console.info = addLog('info');
  }

  public exportLogs(format: 'json' | 'txt' = 'json'): void {
    if (this.logs.length === 0) {
      alert('No hay logs para exportar');
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify({
        exportDate: new Date().toISOString(),
        totalLogs: this.logs.length,
        logs: this.logs
      }, null, 2);
      filename = `utalk-logs-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else {
      content = this.logs.map(log => 
        `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
      ).join('\n');
      filename = `utalk-logs-${new Date().toISOString().split('T')[0]}.txt`;
      mimeType = 'text/plain';
    }

    // Crear y descargar el archivo
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

// Crear instancia global
const consoleExporter = new ConsoleExporter();

// Asignar al window object para que esté disponible globalmente
declare global {
  interface Window {
    exportLogs: (format?: 'json' | 'txt') => void;
    clearLogs: () => void;
    getLogs: () => LogEntry[];
  }
}

window.exportLogs = (format: 'json' | 'txt' = 'json') => {
  consoleExporter.exportLogs(format);
};

window.clearLogs = () => {
  consoleExporter.clearLogs();
};

window.getLogs = () => {
  return consoleExporter.getLogs();
};

export default consoleExporter; 