/**
 * Variables de entorno para UTalk Frontend
 * Configuración centralizada para URLs de API y WebSocket
 *
 * ⚠️ CORRECCIÓN CRÍTICA PARA VERCEL:
 * - Cliente (browser): usa import.meta.env.VITE_*
 * - Servidor (SvelteKit): usa process.env.*
 */

// ✅ FUNCIÓN PARA OBTENER VARIABLES SEGÚN EL ENTORNO
function getEnvVar(clientVar: string, serverVar: string, fallback: string): string {
  // En el servidor (SvelteKit en Vercel)
  if (typeof window === 'undefined' && typeof process !== 'undefined') {
    return process.env[serverVar] || process.env[clientVar] || fallback;
  }

  // En el cliente (browser)
  return import.meta.env[clientVar] || fallback;
}

// ✅ CONFIGURACIÓN CORREGIDA PARA VERCEL
export const API_BASE_URL = getEnvVar('VITE_API_URL', 'API_URL', 'http://localhost:3001');
export const WS_BASE_URL = getEnvVar('VITE_WS_URL', 'WS_URL', 'ws://localhost:3001');

// ✅ LOG CRÍTICO para debugging
if (typeof console !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info('🌐 BACKEND CONFIG:', {
    API_BASE_URL,
    WS_BASE_URL,
    env: typeof window === 'undefined' ? 'server' : 'client',
    serverEnv:
      typeof process !== 'undefined'
        ? {
            API_URL: process.env['API_URL'],
            VITE_API_URL: process.env['VITE_API_URL']
          }
        : 'not-available',
    clientEnv:
      typeof window !== 'undefined'
        ? {
            VITE_API_URL: import.meta.env['VITE_API_URL'],
            VITE_WS_URL: import.meta.env['VITE_WS_URL']
          }
        : 'not-available'
  });
}

// Validación de variables de entorno críticas
if (typeof window === 'undefined') {
  // Solo en servidor
  if (!API_BASE_URL || API_BASE_URL === 'http://localhost:3001') {
    // eslint-disable-next-line no-console
    console.warn('⚠️ Variables de entorno no configuradas correctamente en Vercel');
    // eslint-disable-next-line no-console
    console.warn('📋 Variables disponibles:', {
      process_env_API_URL: typeof process !== 'undefined' ? process.env['API_URL'] : 'undefined',
      process_env_VITE_API_URL:
        typeof process !== 'undefined' ? process.env['VITE_API_URL'] : 'undefined'
    });
  }
}
