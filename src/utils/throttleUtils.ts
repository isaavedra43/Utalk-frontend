import { infoLog } from '../config/logger';

// Sistema de throttling para controlar frecuencia de operaciones

interface ThrottleConfig {
  delay: number; // Delay mínimo entre operaciones en ms
  maxCalls?: number; // Máximo número de llamadas en el período
  period?: number; // Período de tiempo para maxCalls en ms
}

class Throttler {
  private config: Required<ThrottleConfig>;
  private lastCall = 0;
  private callCount = 0;
  private periodStart = 0;

  constructor(config: ThrottleConfig) {
    this.config = {
      delay: config.delay,
      maxCalls: config.maxCalls || 10,
      period: config.period || 60000 // 1 minuto por defecto
    };
  }

  // Verificar si se puede ejecutar la operación
  canExecute(): boolean {
    const now = Date.now();

    // Resetear contador si ha pasado el período
    if (now - this.periodStart > this.config.period) {
      this.callCount = 0;
      this.periodStart = now;
    }

    // Verificar límite de llamadas por período
    if (this.callCount >= this.config.maxCalls) {
      return false;
    }

    // Verificar delay mínimo entre llamadas
    if (now - this.lastCall < this.config.delay) {
      return false;
    }

    return true;
  }

  // Ejecutar operación con throttling
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      const delay = this.config.delay - (Date.now() - this.lastCall);
      throw new Error(`Operación throttled. Espera ${delay}ms antes de reintentar.`);
    }

    this.lastCall = Date.now();
    this.callCount++;

    return operation();
  }

  // Obtener tiempo restante hasta poder ejecutar
  getTimeUntilNext(): number {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    const timeUntilPeriodReset = this.config.period - (now - this.periodStart);

    if (this.callCount >= this.config.maxCalls) {
      return Math.max(0, timeUntilPeriodReset);
    }

    return Math.max(0, this.config.delay - timeSinceLastCall);
  }

  // Resetear estado
  reset(): void {
    this.lastCall = 0;
    this.callCount = 0;
    this.periodStart = 0;
  }

  // Obtener estadísticas
  getStats() {
    return {
      lastCall: this.lastCall,
      callCount: this.callCount,
      periodStart: this.periodStart,
      config: this.config,
      timeUntilNext: this.getTimeUntilNext()
    };
  }
}

// Instancias específicas para diferentes tipos de operaciones
export const joinConversationThrottler = new Throttler({
  delay: 1000, // 1 segundo entre joins
  maxCalls: 5, // Máximo 5 joins por minuto
  period: 60000
});

export const leaveConversationThrottler = new Throttler({
  delay: 1000, // 1 segundo entre leaves
  maxCalls: 5, // Máximo 5 leaves por minuto
  period: 60000
});

export const syncStateThrottler = new Throttler({
  delay: 2000, // 2 segundos entre syncs
  maxCalls: 10, // Máximo 10 syncs por minuto
  period: 60000
});

export const sendMessageThrottler = new Throttler({
  delay: 500, // 500ms entre mensajes
  maxCalls: 20, // Máximo 20 mensajes por minuto
  period: 60000
});

// Función helper para throttling con retry automático
export const throttledExecute = async <T>(
  operation: () => Promise<T>,
  throttler: Throttler,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await throttler.execute(operation);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }

      // Si es un error de throttling, esperar y reintentar
      if (lastError.message.includes('throttled')) {
        const waitTime = throttler.getTimeUntilNext();
        infoLog(`⏳ Operación throttled, esperando ${waitTime}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // Si es otro tipo de error, no reintentar
      break;
    }
  }

  throw lastError || new Error('Operación falló después de múltiples intentos');
};

// Función helper para crear throttler personalizado
export const createThrottler = (config: ThrottleConfig): Throttler => {
  return new Throttler(config);
};

export default Throttler; 