// Sistema centralizado de configuración de la aplicación
// Todas las variables de entorno se consolidan aquí para fácil acceso

// ===== CONFIGURACIÓN DE API =====
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const

// ===== CONFIGURACIÓN DE ENTORNO =====
export const ENV_CONFIG = {
  NODE_ENV: import.meta.env.MODE,
  VITE_ENV: import.meta.env.VITE_ENV || 'development',
  IS_DEVELOPMENT: import.meta.env.VITE_ENV === 'development',
  IS_STAGING: import.meta.env.VITE_ENV === 'staging',
  IS_PRODUCTION: import.meta.env.VITE_ENV === 'production'
} as const

// ===== CONFIGURACIÓN DE LOGGING =====
export const LOG_CONFIG = {
  LEVEL: import.meta.env.VITE_LOG_LEVEL || 'debug',
  ENABLE_CONSOLE: import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true',
  THROTTLE_TIME: 3000, // ms entre logs repetidos
  MAX_ENTRIES: 1000
} as const

// ===== CONFIGURACIÓN DE SEGURIDAD =====
export const SECURITY_CONFIG = {
  TOKEN_EXPIRY_MINUTES: parseInt(import.meta.env.VITE_TOKEN_EXPIRY_MINUTES || '60'),
  TOKEN_REFRESH_MINUTES: parseInt(import.meta.env.VITE_TOKEN_REFRESH_MINUTES || '50'),
  MAX_LOGIN_ATTEMPTS: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'),
  ENABLE_2FA: import.meta.env.VITE_ENABLE_2FA === 'true',
  SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutos en ms
} as const

// ===== CONFIGURACIÓN DE APLICACIÓN =====
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'UTalk',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'Development',
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'system',
  DEFAULT_LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE || 'es'
} as const

// ===== CONFIGURACIÓN DE DESARROLLO =====
export const DEV_CONFIG = {
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  MOCK_API: import.meta.env.VITE_MOCK_API === 'true',
  ENABLE_DEVTOOLS: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  HMR: import.meta.env.VITE_HMR !== 'false',
  PORT: parseInt(import.meta.env.VITE_PORT || '5173'),
  HOST: import.meta.env.VITE_HOST || 'localhost'
} as const

// ===== CONFIGURACIÓN DE INTEGRACIÓN =====
export const INTEGRATION_CONFIG = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  HOTJAR_ID: import.meta.env.VITE_HOTJAR_ID
} as const

// ===== CONFIGURACIÓN DE PERFORMANCE =====
export const PERFORMANCE_CONFIG = {
  ENABLE_MONITORING: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
  ENABLE_ERROR_REPORTING: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  CACHE_SIZE_MB: parseInt(import.meta.env.VITE_CACHE_SIZE_MB || '50'),
  ENABLE_ANIMATIONS: import.meta.env.VITE_ENABLE_ANIMATIONS !== 'false'
} as const

// ===== CONFIGURACIÓN DE WEBSOCKET =====
export const WS_CONFIG = {
  URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  HEARTBEAT_INTERVAL: parseInt(import.meta.env.VITE_WS_HEARTBEAT_INTERVAL || '30') * 1000,
  MAX_RETRIES: parseInt(import.meta.env.VITE_WS_MAX_RETRIES || '3'),
  RECONNECT_DELAY: 1000
} as const

// ===== CONFIGURACIÓN DE CDN =====
export const CDN_CONFIG = {
  URL: import.meta.env.VITE_CDN_URL,
  ASSETS_URL: import.meta.env.VITE_ASSETS_URL,
  ENABLE_SERVICE_WORKER: import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true'
} as const

// ===== VALIDACIÓN DE CONFIGURACIÓN =====
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validar URLs requeridas
  if (!API_CONFIG.BASE_URL) {
    errors.push('VITE_API_URL es requerida')
  }
  
  if (!WS_CONFIG.URL) {
    errors.push('VITE_WS_URL es requerida')
  }
  
  // Validar configuración de tokens
  if (SECURITY_CONFIG.TOKEN_REFRESH_MINUTES >= SECURITY_CONFIG.TOKEN_EXPIRY_MINUTES) {
    errors.push('VITE_TOKEN_REFRESH_MINUTES debe ser menor que VITE_TOKEN_EXPIRY_MINUTES')
  }
  
  // Validar entorno
  if (!['development', 'staging', 'production'].includes(ENV_CONFIG.VITE_ENV)) {
    errors.push('VITE_ENV debe ser: development, staging o production')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ===== CONFIGURACIÓN CONSOLIDADA =====
export const CONFIG = {
  API: API_CONFIG,
  ENV: ENV_CONFIG,
  LOG: LOG_CONFIG,
  SECURITY: SECURITY_CONFIG,
  APP: APP_CONFIG,
  DEV: DEV_CONFIG,
  INTEGRATION: INTEGRATION_CONFIG,
  PERFORMANCE: PERFORMANCE_CONFIG,
  WS: WS_CONFIG,
  CDN: CDN_CONFIG
} as const

// Validar configuración al inicio (solo en desarrollo)
if (ENV_CONFIG.IS_DEVELOPMENT) {
  const validation = validateConfig()
  if (!validation.isValid) {
    console.warn('⚠️ Configuración inválida:', validation.errors)
  }
} 