import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

// Configuración de la aplicación
export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'UTALK',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  debug: import.meta.env.VITE_DEBUG === 'true',
  devMode: import.meta.env.VITE_DEV_MODE === 'true',
  mockMode: import.meta.env.VITE_MOCK_MODE === 'true',
  nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
};

// Validar configuración requerida
export const validateConfig = (): boolean => {
  const requiredVars = [
    'VITE_API_URL',
    'VITE_WS_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('Variables de entorno faltantes:', missingVars);
    return false;
  }

  return true;
}; 