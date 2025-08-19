// Monitor de performance para logs críticos del sistema
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private startTime: number = Date.now();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Log de inicio de sesión exitoso
  logLoginSuccess(): void {
    const loginTime = Date.now() - this.startTime;
    console.log('✅ Login exitoso', {
      tiempoTotal: `${loginTime}ms`,
      timestamp: new Date().toISOString()
    });
  }

  // Log de conexión WebSocket establecida
  logWebSocketConnected(): void {
    console.log('🔌 WebSocket conectado', {
      timestamp: new Date().toISOString(),
      uptime: `${Date.now() - this.startTime}ms`
    });
  }

  // Log de sincronización de datos
  logDataSync(conversationsCount: number): void {
    console.log('📊 Datos sincronizados', {
      conversaciones: conversationsCount,
      timestamp: new Date().toISOString()
    });
  }

  // Log de error crítico del sistema
  logSystemError(error: string, context: string): void {
    console.error('🚨 Error crítico del sistema', {
      error,
      contexto: context,
      timestamp: new Date().toISOString(),
      uptime: `${Date.now() - this.startTime}ms`
    });
  }

  // Log de rate limiting
  logRateLimited(event: string, retryAfter: number): void {
    console.warn('⏸️ Rate limiting detectado', {
      evento: event,
      reintentarEn: `${retryAfter}s`,
      timestamp: new Date().toISOString()
    });
  }

  // Log de salud del sistema
  logSystemHealth(): void {
    const uptime = Date.now() - this.startTime;
    console.log('💚 Salud del sistema', {
      uptime: `${uptime}ms`,
      memoria: this.getMemoryUsage(),
      timestamp: new Date().toISOString()
    });
  }

  private getMemoryUsage(): string {
    if ('memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      return `${used}MB / ${total}MB`;
    }
    return 'No disponible';
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 