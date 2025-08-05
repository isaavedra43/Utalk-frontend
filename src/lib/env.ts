/**
 * Variables de entorno para UTalk Frontend
 * Configuración centralizada para URLs de API y WebSocket
 *
 * ⚠️ CORRECCIÓN CRÍTICA PARA VERCEL SERVERLESS:
 * - Cliente (browser): usa import.meta.env.VITE_*
 * - Servidor (SvelteKit en Vercel): usa process.env.* con fallbacks robustos
 * - URLs hardcodeadas de Railway como último recurso
 */

// ✅ FUNCIÓN CORREGIDA PARA VERCEL SERVERLESS - VERSION DEFINITIVA
function getEnvVar(clientVar: string, serverVar: string, fallback: string): string {
  // En el servidor (SvelteKit en Vercel)
  if (typeof window === 'undefined') {
    // ⚠️ CORRECCIÓN CRÍTICA: Verificar que process.env existe y contiene las variables
    const hasProcessEnv = typeof process !== 'undefined' && process.env;

    if (hasProcessEnv) {
      const serverValue = process.env[serverVar];
      const clientValue = process.env[clientVar];

      // Log detallado para debugging en Vercel
      // eslint-disable-next-line no-console
      console.log(`🔍 ENV DEBUG - ${serverVar}:`, {
        serverVar,
        clientVar,
        serverValue: serverValue ? `${serverValue.substring(0, 20)}...` : 'undefined',
        clientValue: clientValue ? `${clientValue.substring(0, 20)}...` : 'undefined',
        processEnvKeys: Object.keys(process.env).filter(
          k => k.includes('API') || k.includes('VITE')
        ),
        context: 'vercel-serverless'
      });

      if (serverValue && serverValue.trim() !== '') {
        return serverValue.trim();
      }
      if (clientValue && clientValue.trim() !== '') {
        return clientValue.trim();
      }
    }

    // ⚠️ FALLBACK CRÍTICO: URLs hardcodeadas de Railway si las variables fallan
    // eslint-disable-next-line no-console
    console.warn(
      `⚠️ Variables de entorno no disponibles para ${serverVar}, usando fallback hardcodeado`
    );

    if (serverVar === 'API_URL') {
      return 'https://utalk-backend-production.up.railway.app/api';
    }
    if (serverVar === 'WS_URL') {
      return 'wss://utalk-backend-production.up.railway.app';
    }

    // Último recurso
    return fallback;
  }

  // En el cliente (browser)
  const clientValue = import.meta.env[clientVar];

  // Log para debugging en cliente
  // eslint-disable-next-line no-console
  console.log(`🔍 CLIENT ENV DEBUG - ${clientVar}:`, {
    clientVar,
    value: clientValue ? `${clientValue.substring(0, 20)}...` : 'undefined',
    allViteVars: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')),
    context: 'browser'
  });

  return clientValue || fallback;
}

// ✅ CONFIGURACIÓN CON LOGS DETALLADOS Y FALLBACKS ROBUSTOS
export const API_BASE_URL = getEnvVar('VITE_API_URL', 'API_URL', 'http://localhost:3001/api');
export const WS_BASE_URL = getEnvVar('VITE_WS_URL', 'WS_URL', 'ws://localhost:3001');

// ✅ LOG CRÍTICO PARA VERCEL DEBUGGING
const isServer = typeof window === 'undefined';
// eslint-disable-next-line no-console
console.info('🌐 BACKEND CONFIG FINAL:', {
  API_BASE_URL,
  WS_BASE_URL,
  environment: isServer ? 'server' : 'client',
  context: isServer ? 'vercel-serverless' : 'browser',
  timestamp: new Date().toISOString(),
  processEnvAvailable: typeof process !== 'undefined' && !!process.env,
  processEnvVars:
    isServer && typeof process !== 'undefined'
      ? {
          API_URL: process.env['API_URL'] ? 'SET' : 'UNDEFINED',
          VITE_API_URL: process.env['VITE_API_URL'] ? 'SET' : 'UNDEFINED',
          NODE_ENV: process.env['NODE_ENV'],
          VERCEL: process.env['VERCEL']
        }
      : 'not-server'
});

// ✅ VALIDACIÓN CRÍTICA PARA DETECTAR PROBLEMAS
if (isServer) {
  if (!API_BASE_URL || API_BASE_URL.includes('localhost')) {
    // eslint-disable-next-line no-console
    console.error('🚨 PROBLEMA CRÍTICO: API_BASE_URL no está configurada correctamente en Vercel');
    // eslint-disable-next-line no-console
    console.error('📋 Debug info:', {
      API_BASE_URL,
      expectedUrl: 'https://utalk-backend-production.up.railway.app/api',
      vercelEnv: typeof process !== 'undefined' ? process.env['VERCEL'] : 'undefined',
      suggestion: 'Verificar variables de entorno en Vercel Dashboard'
    });
  } else {
    // eslint-disable-next-line no-console
    console.info('✅ API_BASE_URL configurada correctamente:', API_BASE_URL);
  }
}
