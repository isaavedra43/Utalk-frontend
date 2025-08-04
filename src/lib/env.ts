/**
 * Validación y configuración de variables de entorno
 */

interface EnvConfig {
  VITE_API_URL: string;
  VITE_WS_URL: string;
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
}

/**
 * Valida que las variables de entorno requeridas estén presentes
 */
function validateEnv(): EnvConfig {
  const env = import.meta.env;

  // Variables requeridas
  const requiredVars = ['VITE_API_URL', 'VITE_WS_URL'] as const;
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    const errorMsg =
      `❌ Missing required environment variables: ${missing.join(', ')}\n\n` +
      `Please create a .env file with the following variables:\n` +
      missing.map(v => `${v}=your_value_here`).join('\n') +
      '\n\n' +
      `See .env.example for reference.`;

    // eslint-disable-next-line no-console
    console.error(errorMsg);
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  // Validar formato de URLs
  try {
    new URL(env['VITE_API_URL']);
  } catch {
    throw new Error(`Invalid VITE_API_URL: ${env['VITE_API_URL']}`);
  }

  // Validar WebSocket URL
  const wsUrl = env['VITE_WS_URL'];
  if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
    throw new Error(`Invalid VITE_WS_URL format: ${wsUrl}. Must start with ws:// or wss://`);
  }

  return {
    VITE_API_URL: env['VITE_API_URL'],
    VITE_WS_URL: env['VITE_WS_URL'],
    VITE_FIREBASE_API_KEY: env['VITE_FIREBASE_API_KEY'],
    VITE_FIREBASE_PROJECT_ID: env['VITE_FIREBASE_PROJECT_ID'],
    VITE_FIREBASE_APP_ID: env['VITE_FIREBASE_APP_ID'],
    VITE_FIREBASE_MESSAGING_SENDER_ID: env['VITE_FIREBASE_MESSAGING_SENDER_ID']
  };
}

// Validar al importar el módulo (desarrollo)
export const env = validateEnv();

// URLs ya validadas y tipadas
export const API_BASE_URL = env.VITE_API_URL;
export const WS_BASE_URL = env.VITE_WS_URL;

// Firebase config (opcional)
export const FIREBASE_CONFIG = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID
};

// Util para verificar si Firebase está configurado
export const isFirebaseConfigured = (): boolean => {
  return !!(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);
};
