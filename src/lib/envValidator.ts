// Utilidad para validar y diagnosticar variables de entorno
// Ayuda a identificar problemas de configuración en desarrollo y producción

interface EnvValidationResult {
  isValid: boolean
  missingVars: string[]
  warnings: string[]
  config: Record<string, string | undefined>
}

/**
 * Valida todas las variables de entorno requeridas para UTalk
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const requiredVars = [
    'VITE_API_URL',
    'VITE_WS_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ]

  const optionalVars = [
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_NODE_ENV',
    'VITE_DEBUG',
    'VITE_APP_NAME',
    'VITE_APP_VERSION'
  ]

  const missingVars: string[] = []
  const warnings: string[] = []
  const config: Record<string, string | undefined> = {}

  // Validar variables requeridas
  for (const varName of requiredVars) {
    const value = import.meta.env[varName]
    config[varName] = value

    if (!value) {
      missingVars.push(varName)
    } else if (value.includes('your-') || value.includes('tu-')) {
      warnings.push(`${varName} appears to have placeholder value: ${value}`)
    }
  }

  // Validar variables opcionales
  for (const varName of optionalVars) {
    const value = import.meta.env[varName]
    config[varName] = value

    if (value && (value.includes('your-') || value.includes('tu-'))) {
      warnings.push(`${varName} appears to have placeholder value: ${value}`)
    }
  }

  // Validaciones específicas
  const apiUrl = import.meta.env.VITE_API_URL
  const wsUrl = import.meta.env.VITE_WS_URL

  if (apiUrl && !apiUrl.includes('/api')) {
    warnings.push('VITE_API_URL should end with /api')
  }

  if (wsUrl && wsUrl.startsWith('wss://')) {
    warnings.push('VITE_WS_URL should use https://, not wss:// (Socket.IO handles protocol)')
  }

  if (apiUrl && wsUrl) {
    const apiDomain = new URL(apiUrl).hostname
    const wsDomain = new URL(wsUrl).hostname
    
    if (apiDomain !== wsDomain) {
      warnings.push('VITE_API_URL and VITE_WS_URL should use the same domain')
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
    config
  }
}

/**
 * Imprime un reporte detallado de validación de variables de entorno
 */
export function printEnvironmentReport(): void {
  const result = validateEnvironmentVariables()
  
  console.group('🔍 Environment Variables Validation Report')
  
  if (result.isValid) {
    console.log('✅ All required environment variables are configured')
  } else {
    console.error('❌ Missing required environment variables:', result.missingVars)
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Configuration warnings:', result.warnings)
  }

  if (import.meta.env.DEV) {
    console.log('📋 Current configuration:', result.config)
  }

  console.groupEnd()
}

/**
 * Valida configuración específica de Firebase
 */
export function validateFirebaseConfig(): boolean {
  const firebaseVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ]

  for (const varName of firebaseVars) {
    if (!import.meta.env[varName]) {
      console.error(`❌ Firebase configuration missing: ${varName}`)
      return false
    }
  }

  console.log('✅ Firebase configuration validated')
  return true
}

/**
 * Valida configuración específica de API
 */
export function validateApiConfig(): boolean {
  const apiUrl = import.meta.env.VITE_API_URL
  const wsUrl = import.meta.env.VITE_WS_URL

  if (!apiUrl) {
    console.error('❌ VITE_API_URL not configured')
    return false
  }

  if (!wsUrl) {
    console.error('❌ VITE_WS_URL not configured')
    return false
  }

  console.log('✅ API configuration validated')
  return true
}

// Auto-ejecutar validación en desarrollo
if (import.meta.env.DEV) {
  setTimeout(() => {
    printEnvironmentReport()
  }, 1000)
} 