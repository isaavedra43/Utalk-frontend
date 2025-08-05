// ⚠️ LOG CRÍTICO INMEDIATO - ENV.TS CARGADO
// eslint-disable-next-line no-console
console.log('🚨 ENV.TS - ARCHIVO CARGADO:', {
  timestamp: new Date().toISOString(),
  module: 'EnvironmentConfig',
  status: 'LOADED'
});

/**
 * Variables de entorno para UTalk Frontend
 * Configuración centralizada para URLs de API y WebSocket
 *
 * ⚠️ SIMPLIFICACIÓN CRÍTICA PARA VERCEL SERVERLESS
 */

// ✅ CONFIGURACIÓN SIMPLIFICADA PARA VERCEL
export const API_BASE_URL = 'https://utalk-backend-production.up.railway.app/api';
export const WS_BASE_URL = 'wss://utalk-backend-production.up.railway.app';

// ✅ LOG CRÍTICO PARA VERCEL DEBUGGING
// eslint-disable-next-line no-console
console.info('🌐 BACKEND CONFIG FINAL:', {
  API_BASE_URL,
  WS_BASE_URL,
  environment: typeof window === 'undefined' ? 'server' : 'client',
  context: typeof window === 'undefined' ? 'vercel-serverless' : 'browser',
  timestamp: new Date().toISOString(),
  note: 'URLs hardcodeadas para evitar conflictos con Vercel'
});
