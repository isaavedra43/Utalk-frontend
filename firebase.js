/**
 * Inicialización de Firebase Admin SDK
 * Configuración centralizada para Firestore y otros servicios de Firebase
 * FULLSTACK MONOREPO: Inicialización condicional según entorno
 */

const admin = require('firebase-admin');
const config = require('./src/config');

// Verificar si tenemos credenciales reales de Firebase
const isValidFirebaseConfig = () => {
  const { firebase } = config;
  
  // En desarrollo con credenciales dummy, no inicializar
  if (process.env.NODE_ENV === 'development') {
    const isDummyPrivateKey = firebase.privateKey.includes('example');
    const isDummyEmail = firebase.clientEmail.includes('firebase-dev@');
    
    if (isDummyPrivateKey || isDummyEmail) {
      console.log('🔧 DESARROLLO: Firebase deshabilitado (credenciales dummy)');
      return false;
    }
  }
  
  // Validar que tenemos credenciales mínimas
  return firebase.projectId && 
         firebase.privateKey && 
         firebase.clientEmail &&
         firebase.privateKey.includes('BEGIN PRIVATE KEY') &&
         firebase.clientEmail.includes('@');
};

// Inicializar Firebase Admin SDK solo si tenemos credenciales válidas
if (!admin.apps.length && isValidFirebaseConfig()) {
  try {
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

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: config.firebase.databaseURL
    });

    console.log('✅ Firebase Admin SDK inicializado correctamente');
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error.message);
    console.log('   Continuando sin Firebase...');
  }
} else if (!isValidFirebaseConfig()) {
  console.log('⚠️  Firebase no configurado (modo desarrollo sin credenciales)');
} else {
  console.log('✅ Firebase ya inicializado');
}

// Exportar servicios de Firebase solo si está inicializado
let db, auth, messaging;

if (admin.apps.length > 0) {
  db = admin.firestore();
  auth = admin.auth();
  messaging = admin.messaging();
} else {
  // Servicios mock para desarrollo
  console.log('🔧 DESARROLLO: Usando servicios Firebase mock');
  db = null;
  auth = null;
  messaging = null;
}

module.exports = {
  admin,
  db,
  auth,
  messaging,
  isInitialized: admin.apps.length > 0
}; 