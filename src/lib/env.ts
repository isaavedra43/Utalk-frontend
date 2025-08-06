/**
 * Variables de entorno para UTalk Frontend
 * Configuración centralizada para URLs de API y WebSocket
 *
 * ✅ CONFIGURACIÓN HARDCODEADA PARA MÁXIMA COMPATIBILIDAD CON VERCEL
 */

// ✅ URLs DEFINITIVAS DEL BACKEND (RAILWAY PRODUCTION)
export const API_BASE_URL = 'https://utalk-backend-production.up.railway.app/api';
export const WS_BASE_URL = 'wss://utalk-backend-production.up.railway.app';

// ✅ LOG SIMPLE Y LIMPIO (COMENTADO PARA ESLINT)
// console.log('🌐 ENV CONFIG:', {
//   apiUrl: API_BASE_URL,
//   wsUrl: WS_BASE_URL,
//   timestamp: new Date().toISOString()
// });
