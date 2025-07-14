/**
 * Validación de Variables de Entorno
 * Valida que todas las variables requeridas estén presentes y sean válidas
 * Previene errores de configuración en tiempo de ejecución
 */

const { cleanEnv, str, port, url, email, bool } = require('envalid');
const logger = require('./logger');

/**
 * Validar variables de entorno requeridas
 * Falla rápido si falta alguna configuración crítica
 */
function validateEnvironment() {
  try {
    const env = cleanEnv(process.env, {
      // Configuración del servidor
      NODE_ENV: str({
        choices: ['development', 'production', 'test'],
        default: 'development',
        desc: 'Entorno de ejecución'
      }),
      PORT: port({
        default: 3000,
        desc: 'Puerto del servidor'
      }),
      
      // Configuración de Firebase (CRÍTICAS)
      FIREBASE_PROJECT_ID: str({
        desc: 'ID del proyecto Firebase'
      }),
      FIREBASE_PRIVATE_KEY: str({
        desc: 'Clave privada de Firebase Admin SDK'
      }),
      FIREBASE_CLIENT_EMAIL: email({
        desc: 'Email del cliente Firebase Admin SDK'
      }),
      
      // Configuración de Twilio (CRÍTICAS)
      TWILIO_ACCOUNT_SID: str({
        desc: 'Account SID de Twilio'
      }),
      TWILIO_AUTH_TOKEN: str({
        desc: 'Auth Token de Twilio'
      }),
      TWILIO_PHONE_NUMBER: str({
        desc: 'Número de teléfono de Twilio'
      }),
      TWILIO_WEBHOOK_SECRET: str({
        desc: 'Secret para validar webhooks de Twilio'
      }),
      
      // Configuración de JWT (CRÍTICAS)
      JWT_SECRET: str({
        desc: 'Secret para firmar tokens JWT',
        example: 'your-super-secret-jwt-key-change-in-production'
      }),
      JWT_EXPIRES_IN: str({
        default: '24h',
        desc: 'Tiempo de expiración de tokens JWT'
      }),
      JWT_ISSUER: str({
        default: 'omnichannel-backend',
        desc: 'Emisor de tokens JWT'
      }),
      JWT_AUDIENCE: str({
        default: 'omnichannel-users',
        desc: 'Audiencia de tokens JWT'
      }),
      
      // Configuración de refresh tokens
      JWT_REFRESH_SECRET: str({
        desc: 'Secret para firmar refresh tokens',
        example: 'your-super-secret-refresh-key-change-in-production'
      }),
      JWT_ACCESS_TOKEN_EXPIRES_IN: str({
        default: '15m',
        desc: 'Tiempo de expiración de access tokens'
      }),
      JWT_REFRESH_TOKEN_EXPIRES_IN: str({
        default: '7d',
        desc: 'Tiempo de expiración de refresh tokens'
      }),
      
      // Configuración de CORS
      CORS_ORIGIN: str({
        default: '*',
        desc: 'Orígenes permitidos para CORS'
      }),
      
      // Configuración de logging
      LOG_LEVEL: str({
        choices: ['error', 'warn', 'info', 'debug'],
        default: 'info',
        desc: 'Nivel de logging'
      }),
      LOG_FILE: str({
        default: './logs/app.log',
        desc: 'Archivo de logs'
      }),
      
      // Configuración opcional para canales futuros
      FACEBOOK_PAGE_ACCESS_TOKEN: str({
        default: '',
        desc: 'Token de acceso de página Facebook (opcional)'
      }),
      FACEBOOK_VERIFY_TOKEN: str({
        default: '',
        desc: 'Token de verificación Facebook (opcional)'
      }),
      FACEBOOK_APP_SECRET: str({
        default: '',
        desc: 'Secret de aplicación Facebook (opcional)'
      }),
      
      SMTP_HOST: str({
        default: '',
        desc: 'Host SMTP para email (opcional)'
      }),
      SMTP_PORT: port({
        default: 587,
        desc: 'Puerto SMTP (opcional)'
      }),
      SMTP_USER: str({
        default: '',
        desc: 'Usuario SMTP (opcional)'
      }),
      SMTP_PASS: str({
        default: '',
        desc: 'Contraseña SMTP (opcional)'
      }),
      
      // Configuración de base de datos
      FIREBASE_DATABASE_URL: url({
        default: '',
        desc: 'URL de Firebase Realtime Database (opcional)'
      }),
      
      // Configuración de seguridad
      WEBHOOK_SECRET: str({
        default: 'your-webhook-secret-key',
        desc: 'Secret general para webhooks'
      }),
      RATE_LIMIT_WINDOW_MS: str({
        default: '900000',
        desc: 'Ventana de tiempo para rate limiting (ms)'
      }),
      RATE_LIMIT_MAX_REQUESTS: str({
        default: '100',
        desc: 'Máximo de requests por ventana'
      }),
      
      // Configuración de deployment
      TRUST_PROXY: bool({
        default: false,
        desc: 'Confiar en proxy para obtener IP real'
      })
    });

    // Validaciones adicionales personalizadas
    validateCustomRules(env);
    
    logger.info('Environment validation successful', {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      firebaseProject: env.FIREBASE_PROJECT_ID,
      twilioAccountSid: env.TWILIO_ACCOUNT_SID.substring(0, 10) + '...',
      jwtIssuer: env.JWT_ISSUER,
      corsOrigin: env.CORS_ORIGIN,
      logLevel: env.LOG_LEVEL
    });
    
    return env;
    
  } catch (error) {
    logger.error('Environment validation failed', error);
    console.error('❌ Environment validation failed:');
    console.error(error.message);
    console.error('\n📋 Required environment variables:');
    console.error('  FIREBASE_PROJECT_ID - Firebase project ID');
    console.error('  FIREBASE_PRIVATE_KEY - Firebase Admin SDK private key');
    console.error('  FIREBASE_CLIENT_EMAIL - Firebase Admin SDK client email');
    console.error('  TWILIO_ACCOUNT_SID - Twilio Account SID');
    console.error('  TWILIO_AUTH_TOKEN - Twilio Auth Token');
    console.error('  TWILIO_PHONE_NUMBER - Twilio phone number');
    console.error('  TWILIO_WEBHOOK_SECRET - Twilio webhook secret');
    console.error('  JWT_SECRET - JWT signing secret');
    console.error('\n💡 Create a .env file with these variables or set them in your environment.');
    
    process.exit(1);
  }
}

/**
 * Validaciones personalizadas adicionales
 */
function validateCustomRules(env) {
  const errors = [];
  
  // Validar que JWT_SECRET no sea el valor por defecto en producción
  if (env.NODE_ENV === 'production' && 
      env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
    errors.push('JWT_SECRET must be changed from default value in production');
  }
  
  // Validar que JWT_SECRET tenga longitud mínima
  if (env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }
  
  // Validar que CORS no sea wildcard en producción
  if (env.NODE_ENV === 'production' && env.CORS_ORIGIN === '*') {
    errors.push('CORS_ORIGIN should not be "*" in production');
  }
  
  // Validar formato de número de Twilio
  if (!env.TWILIO_PHONE_NUMBER.startsWith('+')) {
    errors.push('TWILIO_PHONE_NUMBER must start with "+" (e.g., +1234567890)');
  }
  
  // Validar que Twilio Account SID tenga formato correcto
  if (!env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    errors.push('TWILIO_ACCOUNT_SID must start with "AC"');
  }
  
  // Validar que Firebase private key esté en formato correcto
  if (!env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
    errors.push('FIREBASE_PRIVATE_KEY must be a valid PEM private key');
  }
  
  // DESARROLLO: Relajar validación de Firebase para valores dummy
  if (env.NODE_ENV === 'production') {
    // En producción, validar formato estricto
    if (!env.FIREBASE_CLIENT_EMAIL.includes('firebase-adminsdk')) {
      errors.push('FIREBASE_CLIENT_EMAIL must be a Firebase Admin SDK email');
    }
  } else {
    // En desarrollo, permitir cualquier email con formato válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(env.FIREBASE_CLIENT_EMAIL)) {
      errors.push('FIREBASE_CLIENT_EMAIL must be a valid email format');
    }
  }
  
  if (errors.length > 0) {
    throw new Error('Environment validation errors:\n' + errors.map(e => `  - ${e}`).join('\n'));
  }
}

/**
 * Validar conectividad con servicios externos
 */
async function validateExternalServices(env) {
  const results = {
    firebase: false,
    twilio: false,
    overall: false
  };
  
  try {
    // Validar Firebase
    try {
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: env.FIREBASE_PROJECT_ID,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: env.FIREBASE_CLIENT_EMAIL
          })
        });
      }
      
      // Test básico de conectividad
      const db = admin.firestore();
      await db.collection('_health_check').limit(1).get();
      results.firebase = true;
      
      logger.info('Firebase connectivity validated');
    } catch (error) {
      logger.error('Firebase validation failed', error);
      results.firebase = false;
    }
    
    // Validar Twilio
    try {
      const twilio = require('twilio');
      const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      
      // Test básico de conectividad
      await client.api.accounts(env.TWILIO_ACCOUNT_SID).fetch();
      results.twilio = true;
      
      logger.info('Twilio connectivity validated');
    } catch (error) {
      logger.error('Twilio validation failed', error);
      results.twilio = false;
    }
    
    results.overall = results.firebase && results.twilio;
    
    return results;
    
  } catch (error) {
    logger.error('External services validation failed', error);
    return results;
  }
}

/**
 * Mostrar resumen de configuración (sin datos sensibles)
 */
function showConfigSummary(env) {
  console.log('\n🔧 Configuration Summary:');
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Port: ${env.PORT}`);
  console.log(`  Firebase Project: ${env.FIREBASE_PROJECT_ID}`);
  console.log(`  Twilio Account: ${env.TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
  console.log(`  JWT Issuer: ${env.JWT_ISSUER}`);
  console.log(`  CORS Origin: ${env.CORS_ORIGIN}`);
  console.log(`  Log Level: ${env.LOG_LEVEL}`);
  console.log(`  Log File: ${env.LOG_FILE}`);
  
  if (env.NODE_ENV === 'production') {
    console.log('\n⚠️  Production Environment Detected');
    console.log('  - Ensure all secrets are properly configured');
    console.log('  - Verify CORS settings are restrictive');
    console.log('  - Check that JWT_SECRET is strong and unique');
  }
  
  console.log('');
}

module.exports = {
  validateEnvironment,
  validateExternalServices,
  showConfigSummary
}; 