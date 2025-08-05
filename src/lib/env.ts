/**
 * Variables de entorno para UTalk Frontend
 * Configuración centralizada para URLs de API y WebSocket
 *
 * ⚠️ CORRECCIÓN CRÍTICA PARA VERCEL SERVERLESS:
 * - Cliente (browser): usa import.meta.env.VITE_*
 * - Servidor (SvelteKit en Vercel): usa process.env.* directamente
 * - Fallback mejorado para contextos serverless
 */

// ✅ FUNCIÓN CORREGIDA PARA VERCEL SERVERLESS
function getEnvVar(clientVar: string, serverVar: string, fallback: string): string {
  // En el servidor (SvelteKit en Vercel)
  if (typeof window === 'undefined') {
    // ⚠️ CORRECCIÓN: Verificar AMBAS variables en server-side
    // En Vercel serverless, process.env siempre debe estar disponible
    const serverValue = process.env[serverVar];
    const clientValue = process.env[clientVar];

    // Priorizar la variable específica del servidor, luego la del cliente
    const resolvedValue = serverValue || clientValue || fallback;

    // Log crítico para debugging en Vercel
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log(`🔍 Resolviendo variable [${serverVar}|${clientVar}]:`, {
        serverVar,
        clientVar,
        serverValue: serverValue ? `${serverValue.substring(0, 30)}...` : 'undefined',
        clientValue: clientValue ? `${clientValue.substring(0, 30)}...` : 'undefined',
        resolved: resolvedValue ? `${resolvedValue.substring(0, 30)}...` : 'fallback',
        usingFallback: resolvedValue === fallback
      });
    }

    return resolvedValue;
  }

  // En el cliente (browser)
  const clientValue = import.meta.env[clientVar] || fallback;

  if (typeof console !== 'undefined' && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`🔍 Cliente resolviendo variable [${clientVar}]:`, {
      clientVar,
      resolved: clientValue ? `${clientValue.substring(0, 30)}...` : 'fallback',
      usingFallback: clientValue === fallback
    });
  }

  return clientValue;
}

// ✅ CONFIGURACIÓN CORREGIDA PARA VERCEL
export const API_BASE_URL = getEnvVar('VITE_API_URL', 'API_URL', 'http://localhost:3001/api');
export const WS_BASE_URL = getEnvVar('VITE_WS_URL', 'WS_URL', 'ws://localhost:3001');

// ✅ LOG CRÍTICO para debugging en Vercel
if (typeof console !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info('🌐 BACKEND CONFIG FINAL:', {
    API_BASE_URL,
    WS_BASE_URL,
    env: typeof window === 'undefined' ? 'server' : 'client',
    processEnvAvailable: typeof process !== 'undefined',
    serverEnv:
      typeof process !== 'undefined' && typeof window === 'undefined'
        ? {
            API_URL: process.env['API_URL'] ? 'SET' : 'undefined',
            VITE_API_URL: process.env['VITE_API_URL'] ? 'SET' : 'undefined',
            NODE_ENV: process.env['NODE_ENV']
          }
        : 'not-server',
    clientEnv:
      typeof window !== 'undefined'
        ? {
            VITE_API_URL: import.meta.env['VITE_API_URL'] ? 'SET' : 'undefined',
            VITE_WS_URL: import.meta.env['VITE_WS_URL'] ? 'SET' : 'undefined'
          }
        : 'not-client'
  });
}

// ✅ VALIDACIÓN MEJORADA para Vercel
if (typeof window === 'undefined') {
  // Solo en servidor - validación más estricta
  const isUsingFallback =
    API_BASE_URL === 'http://localhost:3001/api' || API_BASE_URL.includes('localhost');

  if (isUsingFallback) {
    // eslint-disable-next-line no-console
    console.error('🚨 VARIABLES DE ENTORNO NO RESUELTAS EN VERCEL:');
    // eslint-disable-next-line no-console
    console.error('📋 Variables disponibles en process.env:', {
      API_URL: process.env['API_URL'] || 'UNDEFINED',
      VITE_API_URL: process.env['VITE_API_URL'] || 'UNDEFINED',
      NODE_ENV: process.env['NODE_ENV'] || 'UNDEFINED',
      VERCEL: process.env['VERCEL'] || 'UNDEFINED',
      totalEnvVars: Object.keys(process.env).length
    });
    // eslint-disable-next-line no-console
    console.error('❌ API_BASE_URL resuelto como:', API_BASE_URL);
    // eslint-disable-next-line no-console
    console.error('⚠️ Esto causará error 500 al intentar conectar al backend');
  } else {
    // eslint-disable-next-line no-console
    console.info('✅ Variables de entorno resueltas correctamente en Vercel');
    // eslint-disable-next-line no-console
    console.info('✅ API_BASE_URL:', API_BASE_URL);
  }
}
