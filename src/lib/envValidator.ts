// Validador de variables de entorno para backend EMAIL-FIRST
// ✅ Solo variables necesarias, sin Firebase

/**
 * ✅ Variables requeridas para funcionamiento EMAIL-FIRST
 */
const REQUIRED_VARS = [
  'VITE_API_URL',
  'VITE_WS_URL'
] as const

/**
 * ✅ Validar variables de entorno para backend EMAIL-FIRST
 */
export function validateEnvironment(): boolean {
  console.log('🔧 Validating environment variables for EMAIL-FIRST backend...')

  const missingVars: string[] = []

  // Validar variables requeridas
  for (const varName of REQUIRED_VARS) {
    if (!import.meta.env[varName]) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars)
    console.error('Please check your .env file configuration')
    return false
  }

  console.log('✅ Environment variables validated successfully', {
    apiUrl: import.meta.env.VITE_API_URL,
    wsUrl: import.meta.env.VITE_WS_URL,
    nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
    debug: import.meta.env.VITE_DEBUG || 'false'
  })

  return true
}

/**
 * ✅ Obtener configuración para desarrollo
 */
export function getEnvironmentConfig() {
  return {
    apiUrl: import.meta.env.VITE_API_URL,
    wsUrl: import.meta.env.VITE_WS_URL,
    nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
    debug: import.meta.env.VITE_DEBUG === 'true',
    appName: import.meta.env.VITE_APP_NAME || 'UTalk',
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
  }
}