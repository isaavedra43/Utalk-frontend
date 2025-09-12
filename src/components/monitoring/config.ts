// Configuración del módulo de monitoreo
export const MONITORING_CONFIG = {
  // Límites de entradas por tipo de dato
  MAX_ENTRIES: {
    apis: 1000,
    websockets: 1000,
    logs: 1000,
    errors: 500,
    performance: 500,
    states: 500,
    validations: 500
  },
  
  // Configuración de exportación
  EXPORT: {
    // Formatos soportados
    FORMATS: ['excel', 'csv', 'txt'] as const,
    
    // Rangos de fecha disponibles
    DATE_RANGES: {
      all: 'Todos los datos',
      today: 'Últimas 24 horas',
      hour: 'Última hora'
    }
  },
  
  // Configuración de interceptores
  INTERCEPTORS: {
    // APIs a excluir del monitoreo (por performance)
    EXCLUDED_APIS: [
      '/health',
      '/ping',
      '/metrics'
    ],
    
    // Campos sensibles a ocultar en logs
    SENSITIVE_FIELDS: [
      'password',
      'token',
      'secret',
      'key',
      'authorization'
    ],
    
    // Límite de tamaño de payload a capturar (en KB)
    MAX_PAYLOAD_SIZE: 100
  },
  
  // Configuración de UI
  UI: {
    // Posición inicial de la burbuja
    DEFAULT_POSITION: {
      x: -80, // Relativo al borde derecho
      y: -80  // Relativo al borde inferior
    },
    
    // Intervalos de actualización
    UPDATE_INTERVALS: {
      stats: 1000,      // Estadísticas cada 1 segundo
      performance: 5000, // Performance cada 5 segundos
      memory: 10000     // Memoria cada 10 segundos
    }
  },
  
  // Configuración de almacenamiento
  STORAGE: {
    // Clave para habilitar/deshabilitar
    ENABLED_KEY: 'utalk_monitoring_enabled',
    
    // Clave para configuración personalizada
    CONFIG_KEY: 'utalk_monitoring_config',
    
    // Tiempo de vida de datos en localStorage (en días)
    DATA_TTL_DAYS: 7
  }
};

// Tipo para configuración personalizada
export type MonitoringConfigOverrides = Partial<typeof MONITORING_CONFIG>;

// Función para obtener configuración con overrides
export function getMonitoringConfig(overrides?: MonitoringConfigOverrides) {
  const storedConfig = localStorage.getItem(MONITORING_CONFIG.STORAGE.CONFIG_KEY);
  const userConfig = storedConfig ? JSON.parse(storedConfig) : {};
  
  return {
    ...MONITORING_CONFIG,
    ...userConfig,
    ...overrides
  };
}

// Función para guardar configuración personalizada
export function saveMonitoringConfig(config: MonitoringConfigOverrides) {
  localStorage.setItem(
    MONITORING_CONFIG.STORAGE.CONFIG_KEY,
    JSON.stringify(config)
  );
}

// Función para resetear configuración
export function resetMonitoringConfig() {
  localStorage.removeItem(MONITORING_CONFIG.STORAGE.CONFIG_KEY);
}

// Utilidades para desarrollo
export const DEV_UTILS = {
  // Habilitar monitoreo
  enable: () => {
    localStorage.setItem(MONITORING_CONFIG.STORAGE.ENABLED_KEY, 'true');
    console.log('✅ Monitoreo habilitado. Recarga la página.');
  },
  
  // Deshabilitar monitoreo
  disable: () => {
    localStorage.removeItem(MONITORING_CONFIG.STORAGE.ENABLED_KEY);
    console.log('❌ Monitoreo deshabilitado. Recarga la página.');
  },
  
  // Verificar estado
  check: () => {
    const enabled = localStorage.getItem(MONITORING_CONFIG.STORAGE.ENABLED_KEY) === 'true';
    const isDev = import.meta.env.DEV;
    const active = enabled || isDev;
    
    console.log('📊 Estado del monitoreo:', {
      enabled,
      isDev,
      active
    });
    
    return active;
  },
  
  // Configurar límites personalizados
  setLimits: (limits: Partial<typeof MONITORING_CONFIG.MAX_ENTRIES>) => {
    const currentConfig = getMonitoringConfig();
    saveMonitoringConfig({
      ...currentConfig,
      MAX_ENTRIES: {
        ...currentConfig.MAX_ENTRIES,
        ...limits
      }
    });
    console.log('⚙️ Límites actualizados:', limits);
  },
  
  // Limpiar configuración
  reset: () => {
    resetMonitoringConfig();
    console.log('🔄 Configuración reseteada.');
  }
};

// Exponer utilidades globalmente en desarrollo
if (import.meta.env.DEV) {
  (window as any).monitoringUtils = DEV_UTILS;
}
