// ⚠️ LOG CRÍTICO INMEDIATO - ENV.TS CARGADO
// eslint-disable-next-line no-console
console.log('🚨 LOG 25: ENV.TS - ARCHIVO CARGADO:', {
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
console.log('🌐 LOG 26: BACKEND CONFIG FINAL:', {
  API_BASE_URL,
  WS_BASE_URL,
  environment: typeof window === 'undefined' ? 'server' : 'client',
  context: typeof window === 'undefined' ? 'vercel-serverless' : 'browser',
  timestamp: new Date().toISOString(),
  note: 'URLs hardcodeadas para evitar conflictos con Vercel'
});

// ⚠️ LOG 27: VALIDACIÓN DE CONFIGURACIÓN
// eslint-disable-next-line no-console
console.log('🔍 LOG 27: Validando configuración de entorno:', {
  API_BASE_URL_Type: typeof API_BASE_URL,
  WS_BASE_URL_Type: typeof WS_BASE_URL,
  API_BASE_URL_Length: API_BASE_URL.length,
  WS_BASE_URL_Length: WS_BASE_URL.length,
  API_BASE_URL_IncludesRailway: API_BASE_URL.includes('railway'),
  WS_BASE_URL_IncludesRailway: WS_BASE_URL.includes('railway')
});
