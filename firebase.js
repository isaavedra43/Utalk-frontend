/**
 * Inicialización de Firebase Admin SDK
 * Configuración centralizada para Firestore y otros servicios de Firebase
 */

const admin = require('firebase-admin');
const config = require('./src/config');

// Inicializar Firebase Admin SDK si no está inicializado
if (!admin.apps.length) {
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

  console.log('Firebase Admin SDK inicializado correctamente');
} else {
  console.log('Firebase Admin SDK ya estaba inicializado');
}

// Exportar servicios de Firebase
const db = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();

module.exports = {
  admin,
  db,
  auth,
  messaging
}; 