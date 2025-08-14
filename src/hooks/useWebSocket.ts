import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { createSocket } from '../config/socket';
import { generateRoomId as generateRoomIdUtil } from '../utils/jwtUtils';

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);
  const eventListenersRef = useRef(new Map<string, (...args: unknown[]) => void>());
  const isConnectingRef = useRef(false);

  // Conectar socket
  const connect = useCallback((token: string, options?: { timeout?: number }) => {
    if (socketRef.current?.connected) {
      console.log('🔌 Socket ya conectado, saltando...');
      return;
    }

    if (isConnectingRef.current) {
      console.log('🔌 Ya hay una conexión en progreso, saltando...');
      return;
    }

    try {
      isConnectingRef.current = true;
      console.log('🔌 Iniciando conexión de socket...');
      const newSocket = createSocket(token, options);
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Configurar listeners de conexión
      newSocket.on('connect', () => {
        console.log('✅ Socket conectado:', newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
        isConnectingRef.current = false;
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log('❌ Socket desconectado:', reason);
        setIsConnected(false);
        isConnectingRef.current = false;
        
        // Solo intentar reconexión automática si no fue una desconexión manual
        if (reason === 'io server disconnect' || reason === 'transport close') {
          console.log('🔄 Intentando reconexión automática...');
          setTimeout(() => {
            if (token && !isConnectingRef.current) {
              setReconnectAttempts(prev => prev + 1);
              connect(token);
            }
          }, 1000);
        }
      });

      newSocket.on('connect_error', (error: Error) => {
        console.error('🔌 Error de conexión:', error);
        console.error('🔌 Detalles del error:', {
          message: error.message,
          name: error.name,
          type: error.constructor.name,
          stack: error.stack
        });
        
        // MEJORADO: Manejar errores específicos
        if (error.message.includes('AUTHENTICATION_REQUIRED') || 
            error.message.includes('JWT token required') ||
            error.message.includes('Unauthorized')) {
          console.error('🔐 Error de autenticación WebSocket');
          setConnectionError('Error de autenticación: Token inválido o expirado');
        } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          console.error('⏰ Timeout de conexión WebSocket');
          setConnectionError('Timeout de conexión: El servidor no responde');
        } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
          console.error('🌐 Error de red WebSocket');
          setConnectionError('Error de red: No se puede conectar al servidor');
        } else {
          setConnectionError(error.message);
        }
        
        setIsConnected(false);
        isConnectingRef.current = false;
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
      isConnectingRef.current = false;
    }
  }, []);

  // Desconectar socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Desconectando socket manualmente...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setConnectionError(null);
      isConnectingRef.current = false;
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

  // Función para generar roomId correcto según formato del backend
  const generateRoomId = useCallback((conversationId: string) => {
    // Usar la utilidad centralizada que maneja JWT y fallbacks
    return generateRoomIdUtil(conversationId);
  }, []);

  // Emitir evento
  const emit = useCallback((event: string, data: unknown) => {
    if (!socketRef.current?.connected) {
      console.warn('Socket no conectado, no se puede emitir:', event);
      return false;
    }

    // CORREGIDO: Agregar roomId para eventos de conversación
    if (event === 'join-conversation' || event === 'leave-conversation') {
      const eventData = data as { conversationId: string; [key: string]: unknown };
      if (eventData.conversationId && !eventData.roomId) {
        const roomId = generateRoomId(eventData.conversationId);
        console.log(`🔗 ${event} - Room ID generado:`, roomId);
        eventData.roomId = roomId;
      }
    }

    socketRef.current.emit(event, data);
    return true;
  }, [generateRoomId]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log('🔌 Limpiando socket al desmontar componente...');
        socketRef.current.disconnect();
      }
    };
  }, []);

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