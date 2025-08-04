/**
 * Cliente Socket.io configurado para UTalk Frontend
 * Configuración centralizada para comunicación en tiempo real
 */

import { WS_BASE_URL } from '$lib/env';
import { io, type Socket } from 'socket.io-client';

// Configuración del cliente Socket.io
const socketConfig = {
  transports: ['websocket', 'polling'],
  autoConnect: false, // No conectar automáticamente
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  forceNew: true
};

// Crear instancia del socket
export const socket: Socket = io(WS_BASE_URL, socketConfig);

// Estado de conexión
let isConnected = false;
let connectionAttempts = 0;

// Eventos de conexión
socket.on('connect', () => {
  isConnected = true;
  connectionAttempts = 0;
  if (import.meta.env.DEV && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('🔌 Socket conectado:', socket.id);
  }
});

socket.on('disconnect', reason => {
  isConnected = false;
  if (import.meta.env.DEV && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('🔌 Socket desconectado:', reason);
  }

  if (reason === 'io server disconnect') {
    // Desconexión iniciada por el servidor
    if (import.meta.env.DEV && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('🔄 Intentando reconectar...');
    }
    socket.connect();
  }
});

socket.on('connect_error', error => {
  connectionAttempts++;
  if (import.meta.env.DEV && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error('❌ Error de conexión Socket:', error.message);
  }

  if (connectionAttempts >= 5) {
    if (import.meta.env.DEV && typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('🚫 Máximo de intentos de conexión alcanzado');
    }
  }
});

socket.on('reconnect', attemptNumber => {
  if (import.meta.env.DEV && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('✅ Socket reconectado después de', attemptNumber, 'intentos');
  }
});

socket.on('reconnect_error', error => {
  if (import.meta.env.DEV && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error('❌ Error de reconexión Socket:', error.message);
  }
});

socket.on('reconnect_failed', () => {
  if (import.meta.env.DEV && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error('🚫 Falló la reconexión del Socket');
  }
});

// Función para conectar manualmente
export const connectSocket = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isConnected) {
      resolve();
      return;
    }

    const timeout =
      typeof window !== 'undefined'
        ? window.setTimeout(() => {
            reject(new Error('Timeout al conectar Socket'));
          }, 10000)
        : null;

    socket.once('connect', () => {
      if (timeout && typeof window !== 'undefined') {
        window.clearTimeout(timeout);
      }
      resolve();
    });

    socket.once('connect_error', error => {
      if (timeout && typeof window !== 'undefined') {
        window.clearTimeout(timeout);
      }
      reject(error);
    });

    socket.connect();
  });
};

// Función para desconectar manualmente
export const disconnectSocket = (): void => {
  if (isConnected) {
    socket.disconnect();
    isConnected = false;
  }
};

// Función para emitir eventos con manejo de errores
export const emitEvent = <T = unknown>(event: string, data?: T): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isConnected) {
      reject(new Error('Socket no conectado'));
      return;
    }

    socket.emit(event, data, (response: unknown) => {
      if (response && typeof response === 'object' && 'error' in response) {
        reject(new Error(response.error as string));
      } else {
        resolve();
      }
    });
  });
};

// Función para escuchar eventos
export const onEvent = <T = unknown>(event: string, callback: (data: T) => void): void => {
  socket.on(event, callback);
};

// Función para dejar de escuchar eventos
export const offEvent = <T = unknown>(event: string, callback?: (data: T) => void): void => {
  if (callback) {
    socket.off(event, callback);
  } else {
    socket.off(event);
  }
};

// Función para escuchar eventos una sola vez
export const onceEvent = <T = unknown>(event: string, callback: (data: T) => void): void => {
  socket.once(event, callback);
};

// Getters para estado
export const getSocketId = (): string | undefined => socket.id;
export const getConnectionStatus = (): boolean => isConnected;

// Tipos útiles
export interface SocketEvent<T = unknown> {
  event: string;
  data: T;
  timestamp: number;
}

export interface SocketError {
  message: string;
  code?: string;
  details?: unknown;
}

// Exportar por defecto para compatibilidad
export default socket;
