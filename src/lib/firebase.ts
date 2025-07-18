// Configuración de Firebase para el frontend
// Autenticación con Firebase Auth para integrar con el backend
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validar que todas las variables de entorno estén configuradas
const requiredConfig = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID'
]

for (const key of requiredConfig) {
  if (!import.meta.env[key]) {
    throw new Error(`Variable de entorno requerida no configurada: ${key}`)
  }
}

// Inicializar Firebase
export const app = initializeApp(firebaseConfig)

// Inicializar Firebase Auth
export const auth = getAuth(app)

// Export por defecto
export default { app, auth } 