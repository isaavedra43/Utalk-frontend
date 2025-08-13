import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { logger } from '../utils/logger';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validar configuración antes de inicializar
const validateFirebaseConfig = () => {
  logger.configInfo('Validando configuración de Firebase', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    hasStorageBucket: !!firebaseConfig.storageBucket,
    hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
    hasAppId: !!firebaseConfig.appId
  });

  const requiredFields = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];

  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

  if (missingFields.length > 0) {
    logger.configError('Configuración de Firebase incompleta', new Error(`Campos faltantes: ${missingFields.join(', ')}`), {
      missingFields,
      firebaseConfig: {
        hasApiKey: !!firebaseConfig.apiKey,
        hasAuthDomain: !!firebaseConfig.authDomain,
        hasProjectId: !!firebaseConfig.projectId
      }
    });
    return false;
  }

  // Validar que no sean valores mock
  const mockValues = ['mock-api-key', 'mock.firebaseapp.com', 'mock-project-id'];
  const hasMockValues = Object.values(firebaseConfig).some(value => 
    mockValues.some(mock => value?.includes(mock))
  );

  if (hasMockValues) {
    logger.configError('Configuración de Firebase contiene valores mock', new Error('Usa credenciales reales'), {
      firebaseConfig: {
        apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId
      }
    });
    return false;
  }

  logger.configInfo('Configuración de Firebase válida', {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    hasValidCredentials: true
  });
  return true;
};

// Inicializar Firebase solo si la configuración es válida
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  if (validateFirebaseConfig()) {
    logger.firebaseInfo('Inicializando Firebase con configuración válida');
    
    app = initializeApp(firebaseConfig);
    
    // Configuración de servicios
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    logger.firebaseInfo('Firebase inicializado correctamente', {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      services: ['auth', 'firestore', 'storage']
    });
  } else {
    throw new Error('Configuración de Firebase inválida');
  }
} catch (error) {
  logger.firebaseCritical('Error inicializando Firebase', error as Error, {
    firebaseConfig: {
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    }
  });
  
  // Crear objetos mock para evitar errores en desarrollo
  if (import.meta.env.DEV) {
    logger.configInfo('Usando configuración mock para desarrollo');
    app = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
  } else {
    throw error;
  }
}

// Configuración de Firestore
const firestoreConfig = {
  // Deshabilitar modo mock para usar backend real
  mockMode: false,
  // Configuración para desarrollo
  experimentalForceLongPolling: import.meta.env.DEV,
  useFetchStreams: false,
};

export { app, auth, db, storage, firestoreConfig };

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
  logger.configInfo('Validando configuración general de la aplicación');
  
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
    logger.configError('Variables de entorno faltantes', new Error(`Variables faltantes: ${missingVars.join(', ')}`), {
      missingVars,
      availableVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
    });
    return false;
  }

  logger.configInfo('Todas las variables de entorno están configuradas', {
    totalVars: requiredVars.length,
    allPresent: true
  });
  return true;
}; 