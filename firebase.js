/**
 * Inicialización de Firebase Admin SDK
 * Configuración centralizada para Firestore y otros servicios de Firebase
 * ENTERPRISE: Inicialización robusta con fallbacks y error handling
 */

const admin = require('firebase-admin');
const config = require('./src/config');
const logger = require('./src/utils/logger');

// Estado de inicialización
let initializationStatus = {
  initialized: false,
  error: null,
  services: {
    firestore: false,
    auth: false,
    messaging: false
  }
};

// Verificar si tenemos credenciales válidas de Firebase
const validateFirebaseConfig = () => {
  const { firebase } = config;
  
  if (!firebase.projectId) {
    return { valid: false, reason: 'FIREBASE_PROJECT_ID not configured' };
  }
  
  if (!firebase.clientEmail) {
    return { valid: false, reason: 'FIREBASE_CLIENT_EMAIL not configured' };
  }
  
  if (!firebase.privateKey) {
    return { valid: false, reason: 'FIREBASE_PRIVATE_KEY not configured' };
  }
  
  // En desarrollo, detectar credenciales dummy
  if (config.server.env === 'development') {
    const isDummyEmail = firebase.clientEmail.includes('firebase-dev@') || 
                        firebase.clientEmail.includes('example.com');
    const isDummyKey = firebase.privateKey.includes('example') || 
                      firebase.privateKey.length < 100;
    
    if (isDummyEmail || isDummyKey) {
      return { valid: false, reason: 'Development dummy credentials detected' };
    }
  }
  
  // Validar formato de private key
  if (!firebase.privateKey.includes('BEGIN PRIVATE KEY')) {
    return { valid: false, reason: 'Invalid private key format' };
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(firebase.clientEmail)) {
    return { valid: false, reason: 'Invalid client email format' };
  }
  
  return { valid: true };
};

// Inicializar Firebase Admin SDK con manejo robusto de errores
const initializeFirebase = () => {
  try {
    // Verificar si ya está inicializado
    if (admin.apps.length > 0) {
      logger.info('✅ Firebase ya inicializado');
      initializationStatus.initialized = true;
      return true;
    }
    
    // Validar configuración
    const validation = validateFirebaseConfig();
    if (!validation.valid) {
      logger.warn(`⚠️ Firebase no inicializado: ${validation.reason}`);
      initializationStatus.error = validation.reason;
      return false;
    }
    
    // Preparar credenciales
    const serviceAccount = {
      type: 'service_account',
      project_id: config.firebase.projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: config.firebase.privateKey,
      client_email: config.firebase.clientEmail,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(config.firebase.clientEmail)}`
    };
    
    // Inicializar Firebase
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: config.firebase.databaseURL,
      projectId: config.firebase.projectId
    });
    
    logger.info('✅ Firebase Admin SDK inicializado correctamente');
    initializationStatus.initialized = true;
    return true;
    
  } catch (error) {
    logger.error(`❌ Error inicializando Firebase: ${error.message}`);
    initializationStatus.error = error.message;
    
    if (config.server.env === 'production') {
      logger.error('🚨 Firebase es requerido en producción');
      throw error;
    } else {
      logger.warn('⚠️ Continuando sin Firebase en desarrollo...');
      return false;
    }
  }
};

// Inicializar servicios con validación
const initializeServices = () => {
  if (!admin.apps.length) {
    return {
      db: null,
      auth: null,
      messaging: null,
      storage: null
    };
  }
  
  const services = {};
  
  try {
    services.db = admin.firestore();
    initializationStatus.services.firestore = true;
    logger.debug('✅ Firestore inicializado');
  } catch (error) {
    logger.error(`❌ Error inicializando Firestore: ${error.message}`);
    services.db = null;
  }
  
  try {
    services.auth = admin.auth();
    initializationStatus.services.auth = true;
    logger.debug('✅ Firebase Auth inicializado');
  } catch (error) {
    logger.error(`❌ Error inicializando Firebase Auth: ${error.message}`);
    services.auth = null;
  }
  
  try {
    services.messaging = admin.messaging();
    initializationStatus.services.messaging = true;
    logger.debug('✅ Firebase Messaging inicializado');
  } catch (error) {
    logger.error(`❌ Error inicializando Firebase Messaging: ${error.message}`);
    services.messaging = null;
  }
  
  try {
    services.storage = admin.storage();
    logger.debug('✅ Firebase Storage inicializado');
  } catch (error) {
    logger.error(`❌ Error inicializando Firebase Storage: ${error.message}`);
    services.storage = null;
  }
  
  return services;
};

// Ejecutar inicialización
const isInitialized = initializeFirebase();
const services = initializeServices();

// Funciones de utilidad para validar servicios
const requireService = (serviceName) => {
  const service = services[serviceName];
  if (!service) {
    const error = new Error(`Firebase ${serviceName} not available: ${initializationStatus.error || 'Service not initialized'}`);
    error.code = 'FIREBASE_SERVICE_UNAVAILABLE';
    throw error;
  }
  return service;
};

// Wrapper para operaciones de Firestore con fallback
const safeFirestoreOperation = async (operation, fallback = null) => {
  try {
    if (!services.db) {
      logger.warn('Firestore not available, using fallback');
      return fallback;
    }
    return await operation(services.db);
  } catch (error) {
    logger.error(`Firestore operation failed: ${error.message}`);
    if (config.server.env === 'production') {
      throw error;
    }
    return fallback;
  }
};

// Health check para Firebase
const getFirebaseHealth = () => {
  return {
    initialized: initializationStatus.initialized,
    error: initializationStatus.error,
    services: initializationStatus.services,
    projectId: config.firebase.projectId,
    environment: config.server.env
  };
};

module.exports = {
  admin,
  db: services.db,
  auth: services.auth,
  messaging: services.messaging,
  storage: services.storage,
  isInitialized,
  initializationStatus,
  requireService,
  safeFirestoreOperation,
  getFirebaseHealth
}; 