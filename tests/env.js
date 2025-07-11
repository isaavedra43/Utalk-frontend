/**
 * Variables de entorno para tests
 */

// Configurar variables de entorno antes de cargar los módulos
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-super-long-for-production-security-requirements';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-super-long-for-production-security-requirements';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.JWT_ISSUER = 'test-omnichannel-backend';
process.env.JWT_AUDIENCE = 'test-omnichannel-users';

process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n';
process.env.FIREBASE_CLIENT_EMAIL = 'firebase-adminsdk-test@test-project.iam.gserviceaccount.com';

process.env.TWILIO_ACCOUNT_SID = 'ACtest_account_sid_format_valid';
process.env.TWILIO_AUTH_TOKEN = 'test_auth_token_valid';
process.env.TWILIO_PHONE_NUMBER = '+1234567890';
process.env.TWILIO_WEBHOOK_SECRET = 'test_webhook_secret_valid';

process.env.PORT = '3001';
process.env.LOG_LEVEL = 'error';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Suprimir warnings de deprecación en tests
process.env.NODE_NO_WARNINGS = '1'; 