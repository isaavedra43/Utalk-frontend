/**
 * Variables de entorno para UTalk Frontend
 * Configuración centralizada para URLs de API y WebSocket
 */

export const API_BASE_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:3001';
export const WS_BASE_URL = import.meta.env['VITE_WS_URL'] || 'ws://localhost:3001';

// Validación de variables de entorno críticas en desarrollo
if (import.meta.env.DEV && typeof window === 'undefined') {
  // Solo en desarrollo y servidor
  if (!import.meta.env['VITE_API_URL'] || !import.meta.env['VITE_WS_URL']) {
    throw new Error('❌ Faltan variables de entorno requeridas: VITE_API_URL, VITE_WS_URL');
  }
}
