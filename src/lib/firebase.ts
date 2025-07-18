// Configuración de Firebase para el frontend
// Autenticación con Firebase Auth para integrar con el backend
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'

// Singleton para Firebase App - Lazy Loading
let appInstance: FirebaseApp | null = null
let authInstance: Auth | null = null

/**
 * Obtiene la instancia de Firebase App con lazy loading
 * Valida variables de entorno en runtime, no en import
 */
export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    // ✅ Validación en runtime, NO en import
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }

    // Validar que todas las variables requeridas estén disponibles
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId']
    const missingKeys: string[] = []

    for (const key of requiredKeys) {
      if (!config[key as keyof typeof config]) {
        missingKeys.push(`VITE_FIREBASE_${key.toUpperCase()}`)
      }
    }

    if (missingKeys.length > 0) {
      throw new Error(
        `Firebase configuration missing required environment variables: ${missingKeys.join(', ')}`
      )
    }

    // ✅ Solo inicializar si todas las variables están disponibles
    appInstance = initializeApp(config)
    
    // Log de inicialización exitosa (solo en dev)
    if (import.meta.env.DEV) {
      console.log('✅ Firebase initialized successfully', {
        projectId: config.projectId,
        authDomain: config.authDomain
      })
    }
  }

  return appInstance
}

/**
 * Obtiene la instancia de Firebase Auth con lazy loading
 */
export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    const firebaseApp = getFirebaseApp()
    authInstance = getAuth(firebaseApp)
  }
  return authInstance
}

// ✅ Exportar instancias lazy para compatibilidad
export const app = getFirebaseApp()
export const auth = getFirebaseAuth()

// Export por defecto
export default { app, auth } 