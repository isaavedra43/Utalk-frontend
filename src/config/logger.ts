// Configuración de logging para desarrollo/producción
export const LOG_CONFIG = {
  // Habilitar logs de debug solo en desarrollo
  DEBUG: process.env.NODE_ENV === 'development',
  
  // Niveles de logging
  LEVELS: {
    ERROR: true,    // Siempre mostrar errores
    WARN: true,     // Siempre mostrar warnings
    INFO: process.env.NODE_ENV === 'development',  // Solo en desarrollo
    DEBUG: process.env.NODE_ENV === 'development', // Solo en desarrollo
  }
};

// Función helper para logging condicional
export const debugLog = (message: string, ...args: unknown[]) => {
  if (LOG_CONFIG.DEBUG && LOG_CONFIG.LEVELS.DEBUG) {
    infoLog(message, ...args);
  }
};

export const infoLog = (message: string, ...args: unknown[]) => {
  if (LOG_CONFIG.LEVELS.INFO) {
    infoLog(message, ...args);
  }
};

export const warnLog = (message: string, ...args: unknown[]) => {
  if (LOG_CONFIG.LEVELS.WARN) {
    console.warn(message, ...args);
  }
};

export const errorLog = (message: string, ...args: unknown[]) => {
  if (LOG_CONFIG.LEVELS.ERROR) {
    console.error(message, ...args);
  }
}; 