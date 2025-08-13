import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { createSocket } from '../config/socket';

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);
  const eventListenersRef = useRef(new Map<string, (...args: unknown[]) => void>());

  // Conectar socket
  const connect = useCallback((token: string) => {
    if (socketRef.current?.connected) {
      console.log('🔌 Socket ya conectado, saltando...');
      return;
    }

    try {
      console.log('🔌 Iniciando conexión de socket...');
      const newSocket = createSocket(token);
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Configurar listeners de conexión
      newSocket.on('connect', () => {
        console.log('✅ Socket conectado:', newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log('❌ Socket desconectado:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Reconexión manual necesaria
          console.log('🔄 Intentando reconexión manual...');
          setTimeout(() => {
            if (token) connect(token);
          }, 1000);
        }
      });

      newSocket.on('connect_error', (error: Error) => {
        console.error('🔌 Error de conexión:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      newSocket.on('error', (error: Error) => {
        console.error('🚨 Error de socket:', error);
        setConnectionError(error.message);
      });

      // Conectar
      console.log('🔌 Conectando socket...');
      newSocket.connect();

    } catch (error: unknown) {
      console.error('Error creando socket:', error);
      setConnectionError(error instanceof Error ? error.message : 'Error desconocido');
    }
  }, []);

  // Desconectar socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setConnectionError(null);
    }
  }, []);

  // Registrar listener de evento
  const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    if (!socketRef.current) return;

    // Remover listener anterior si existe
    const existingCallback = eventListenersRef.current.get(event);
    if (existingCallback) {
      socketRef.current.off(event, existingCallback);
    }

    // Registrar nuevo listener
    socketRef.current.on(event, callback);
    eventListenersRef.current.set(event, callback);
  }, []);

  // Remover listener de evento
  const off = useCallback((event: string) => {
    if (!socketRef.current) return;

    const callback = eventListenersRef.current.get(event);
    if (callback) {
      socketRef.current.off(event, callback);
      eventListenersRef.current.delete(event);
    }
  }, []);

  // Emitir evento
  const emit = useCallback((event: string, data: unknown) => {
    if (!socketRef.current?.connected) {
      console.warn('Socket no conectado, no se puede emitir:', event);
      return false;
    }

    socketRef.current.emit(event, data);
    return true;
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    isConnected,
    connectionError,
    reconnectAttempts,
    connect,
    disconnect,
    on,
    off,
    emit
  };
}; 