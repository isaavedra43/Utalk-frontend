/**
 * Sistema de throttling para eventos WebSocket
 * Previene el error "Too many events" limitando la frecuencia de eventos
 */

interface ThrottleConfig {
  maxEventsPerSecond: number;
  throttleWindowMs: number;
  burstLimit: number;
}

class EventThrottler {
  private eventCounts = new Map<string, number>();
  private lastResetTime = new Date().getTime();
  private burstCounts = new Map<string, number>();
  private burstResetTime = new Date().getTime();
  
  private config: ThrottleConfig = {
    maxEventsPerSecond: 10,
    throttleWindowMs: 1000,
    burstLimit: 5
  };

  constructor(config?: Partial<ThrottleConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Verifica si un evento puede ser procesado
   */
  canProcessEvent(eventType: string): boolean {
    const now = new Date().getTime();
    
    // Reset contadores cada segundo
    if (now - this.lastResetTime >= this.config.throttleWindowMs) {
      this.eventCounts.clear();
      this.lastResetTime = now;
    }
    
    // Reset contadores de burst cada 100ms
    if (now - this.burstResetTime >= 100) {
      this.burstCounts.clear();
      this.burstResetTime = now;
    }
    
    // Verificar límite por segundo
    const currentCount = this.eventCounts.get(eventType) || 0;
    if (currentCount >= this.config.maxEventsPerSecond) {
      return false;
    }
    
    // Verificar límite de burst (eventos rápidos)
    const burstCount = this.burstCounts.get(eventType) || 0;
    if (burstCount >= this.config.burstLimit) {
      return false;
    }
    
    return true;
  }

  /**
   * Registra un evento procesado
   */
  recordEvent(eventType: string): void {
    const currentCount = this.eventCounts.get(eventType) || 0;
    this.eventCounts.set(eventType, currentCount + 1);
    
    const burstCount = this.burstCounts.get(eventType) || 0;
    this.burstCounts.set(eventType, burstCount + 1);
  }

  /**
   * Procesa un evento con throttling
   */
  processEvent<T>(
    eventType: string, 
    eventData: T, 
    callback: (data: T) => void
  ): boolean {
    if (this.canProcessEvent(eventType)) {
      this.recordEvent(eventType);
      callback(eventData);
      return true;
    }
    
    // Log throttling solo en desarrollo
    if (import.meta.env.DEV) {
      console.debug(`🚫 Evento throttled: ${eventType}`);
    }
    
    return false;
  }

  /**
   * Obtiene estadísticas de throttling
   */
  getStats(): Record<string, { perSecond: number; burst: number }> {
    const stats: Record<string, { perSecond: number; burst: number }> = {};
    
    for (const [eventType, count] of this.eventCounts.entries()) {
      stats[eventType] = {
        perSecond: count,
        burst: this.burstCounts.get(eventType) || 0
      };
    }
    
    return stats;
  }

  /**
   * Limpia todos los contadores
   */
  reset(): void {
    this.eventCounts.clear();
    this.burstCounts.clear();
    this.lastResetTime = new Date().getTime();
    this.burstResetTime = new Date().getTime();
  }
}

// Instancia global del throttler
export const eventThrottler = new EventThrottler({
  maxEventsPerSecond: 15, // Aumentado para permitir más eventos
  throttleWindowMs: 1000,
  burstLimit: 8 // Aumentado para permitir más eventos en ráfaga
});

// Configuraciones específicas por tipo de evento
export const EVENT_THROTTLE_CONFIGS = {
  'typing': { maxEventsPerSecond: 5, burstLimit: 3 },
  'message-read': { maxEventsPerSecond: 10, burstLimit: 5 },
  'conversation-event': { maxEventsPerSecond: 8, burstLimit: 4 },
  'new-message': { maxEventsPerSecond: 20, burstLimit: 10 },
  'conversation-joined': { maxEventsPerSecond: 5, burstLimit: 2 },
  'conversation-left': { maxEventsPerSecond: 5, burstLimit: 2 },
  'state-synced': { maxEventsPerSecond: 3, burstLimit: 1 },
  'webhook:conversation-created': { maxEventsPerSecond: 5, burstLimit: 2 },
  'webhook:new-message': { maxEventsPerSecond: 10, burstLimit: 5 }
};

/**
 * Hook para usar el throttler en componentes React
 */
export const useEventThrottler = () => {
  return {
    canProcessEvent: (eventType: string) => eventThrottler.canProcessEvent(eventType),
    processEvent: <T>(eventType: string, eventData: T, callback: (data: T) => void) => 
      eventThrottler.processEvent(eventType, eventData, callback),
    getStats: () => eventThrottler.getStats(),
    reset: () => eventThrottler.reset()
  };
};

/**
 * Función helper para crear un callback throttled
 */
export const createThrottledCallback = <T>(
  eventType: string,
  callback: (data: T) => void,
  customConfig?: Partial<ThrottleConfig>
) => {
  const throttler = customConfig ? new EventThrottler(customConfig) : eventThrottler;
  
  return (data: T) => {
    throttler.processEvent(eventType, data, callback);
  };
};
