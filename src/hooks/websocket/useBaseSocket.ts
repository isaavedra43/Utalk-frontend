import { useState, useEffect, useRef, useCallback } from 'react';
import { infoLog } from '../../config/logger';
import { Socket } from 'socket.io-client';
import { createSocket } from '../../config/socket';
import { generateRoomId as generateRoomIdUtil } from '../../utils/jwtUtils';

export const useBaseSocket = () => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const [reconnectAttempts, setReconnectAttempts] = useState(0);
	
	const socketRef = useRef<Socket | null>(null);
	const eventListenersRef = useRef(new Map<string, (...args: unknown[]) => void>());
	const isConnectingRef = useRef(false);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Conectar socket
	const connect = useCallback((token: string, options?: { timeout?: number }) => {
		if (socketRef.current?.connected) {
			infoLog('🔌 Socket ya conectado, saltando...');
			return;
		}

		if (isConnectingRef.current) {
			infoLog('🔌 Ya hay una conexión en progreso, saltando...');
			return;
		}

		try {
			isConnectingRef.current = true;
			infoLog('🔌 Iniciando conexión de socket...');
			
			// NUEVO: Timeout más largo para dar tiempo al backend
			const timeout = options?.timeout || 60000;
			const newSocket = createSocket(token, { ...options, timeout });
			socketRef.current = newSocket;
			setSocket(newSocket);

			// NUEVO: Configurar listeners de conexión mejorados
			newSocket.on('connect', () => {
				infoLog('✅ Socket conectado exitosamente:', {
					socketId: newSocket.id,
					timestamp: new Date().toISOString(),
					reconnectAttempts
				});
				setIsConnected(true);
				setConnectionError(null);
				setReconnectAttempts(0);
				isConnectingRef.current = false;
				
				// Limpiar timeout de reconexión si existe
				if (reconnectTimeoutRef.current) {
					clearTimeout(reconnectTimeoutRef.current);
					reconnectTimeoutRef.current = null;
				}
			});

			newSocket.on('disconnect', (reason: string) => {
				infoLog('❌ Socket desconectado:', {
					reason,
					socketId: newSocket.id,
					timestamp: new Date().toISOString(),
					reconnectAttempts
				});
				setIsConnected(false);
				isConnectingRef.current = false;
				
				// NUEVO: Lógica de reconexión mejorada
				if (reason === 'io server disconnect' || reason === 'transport close') {
					// NUEVO: Solo reconectar si no hemos excedido el máximo de intentos
					if (reconnectAttempts < 5) {
						infoLog('🔄 Intentando reconexión automática...');
						
						// Limpiar timeout anterior si existe
						if (reconnectTimeoutRef.current) {
							clearTimeout(reconnectTimeoutRef.current);
						}
						
						// NUEVO: Backoff exponencial más agresivo
						const backoffDelay = Math.min(2000 * Math.pow(2, reconnectAttempts), 30000);
						infoLog(`🔄 Reconexión en ${backoffDelay}ms (intento ${reconnectAttempts + 1}/5)`);
						
						reconnectTimeoutRef.current = setTimeout(() => {
							if (token && !isConnectingRef.current) {
								setReconnectAttempts(prev => prev + 1);
								connect(token, { timeout: 60000 }); // NUEVO: Timeout aumentado para reconexión
							}
						}, backoffDelay);
					} else {
						console.error('❌ Máximo de intentos de reconexión alcanzado');
						setConnectionError('No se pudo establecer conexión después de 5 intentos');
					}
				} else if (reason === 'io client disconnect') {
					infoLog('🔌 Desconexión iniciada por el cliente');
					setConnectionError('Desconexión iniciada por el cliente');
				}
			});

			newSocket.on('connect_error', (error: Error) => {
				console.error('🔌 Error de conexión:', {
					message: error.message,
					name: error.name,
					timestamp: new Date().toISOString(),
					reconnectAttempts
				});
				
				// NUEVO: Clasificación mejorada de errores
				const msg = error.message.toLowerCase();
				const isAuthError = msg.includes('authentication_required') || msg.includes('jwt token required') || msg.includes('unauthorized');
				const isTimeout = msg.includes('timeout') || msg.includes('etimedout');
				const isTransport = msg.includes('transport');
				const isRefused = msg.includes('econnrefused') || msg.includes('enotfound');

				if (isAuthError) {
					console.error('🔐 Error de autenticación WebSocket');
					setConnectionError('Error de autenticación: Token inválido o expirado');
					isConnectingRef.current = false;
				} else if (isTimeout || isTransport || isRefused) {
					infoLog('🔄 Error transitorio, intentando reconexión...');
					// NUEVO: No establecer error para errores transitorios
					isConnectingRef.current = false;
				} else {
					console.error('❌ Error desconocido de conexión');
					setConnectionError(`Error de conexión: ${error.message}`);
					isConnectingRef.current = false;
				}
			});

	// NUEVO: Listener para errores de transporte con throttling
	newSocket.on('error', (error: Error) => {
		// Throttling para evitar spam de errores
		const now = Date.now();
		const lastErrorTime = (newSocket as any).lastErrorTime || 0;
		const errorThrottleMs = 5000; // 5 segundos entre errores del mismo tipo
		
		if (now - lastErrorTime < errorThrottleMs) {
			return; // Ignorar errores duplicados
		}
		
		(newSocket as any).lastErrorTime = now;
		
		console.error('🔌 Error de transporte:', {
			message: error.message,
			name: error.name,
			timestamp: new Date().toISOString()
		});
		
		// Manejar específicamente el error "Too many events"
		if (error.message.includes('Too many events')) {
			console.warn('⚠️ Demasiados eventos detectados, implementando throttling...');
			// Implementar throttling temporal
			setConnectionError('Demasiados eventos - Aplicando throttling');
			setTimeout(() => {
				setConnectionError(null);
			}, 10000); // Limpiar error después de 10 segundos
		}
	});

			// NUEVO: Listener para reconexión
			newSocket.on('reconnect', (attemptNumber: number) => {
				infoLog('✅ Socket reconectado exitosamente:', {
					attemptNumber,
					socketId: newSocket.id,
					timestamp: new Date().toISOString()
				});
				setIsConnected(true);
				setConnectionError(null);
				setReconnectAttempts(0);
			});

			// NUEVO: Listener para intento de reconexión
			newSocket.on('reconnect_attempt', (attemptNumber: number) => {
				infoLog('🔄 Intentando reconexión:', {
					attemptNumber,
					timestamp: new Date().toISOString()
				});
			});

			// NUEVO: Listener para fallo de reconexión
			newSocket.on('reconnect_failed', () => {
				console.error('❌ Fallo en la reconexión después de todos los intentos');
				setConnectionError('No se pudo reconectar después de múltiples intentos');
			});

			// NUEVO: El socket ya se conecta automáticamente en createSocket
			infoLog('🔌 Socket creado, conexión iniciada automáticamente');

		} catch (error) {
			console.error('❌ Error al crear socket:', error);
			setConnectionError(`Error al crear socket: ${error instanceof Error ? error.message : 'Error desconocido'}`);
			isConnectingRef.current = false;
		}
	}, [reconnectAttempts]);

	// Desconectar socket
	const disconnect = useCallback(() => {
		if (socketRef.current) {
			infoLog('🔌 Desconectando socket manualmente...');
			socketRef.current.disconnect();
			socketRef.current = null;
			setSocket(null);
			setIsConnected(false);
			setConnectionError(null);
			isConnectingRef.current = false;
			
			// Limpiar timeout de reconexión
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
		}
	}, []);

	// Registrar listener de evento con throttling
	const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
		if (!socketRef.current) return;

		// Remover listener anterior si existe
		const existingCallback = eventListenersRef.current.get(event);
		if (existingCallback) {
			socketRef.current.off(event, existingCallback);
		}

		// Crear callback con throttling para eventos críticos
		const throttledCallback = (...args: unknown[]) => {
			const now = Date.now();
			const lastEventTime = (callback as any).lastEventTime || 0;
			const eventThrottleMs = 100; // 100ms entre eventos del mismo tipo
			
			// Aplicar throttling solo a eventos de alta frecuencia
			const highFrequencyEvents = ['typing', 'message-read', 'conversation-event'];
			if (highFrequencyEvents.includes(event) && now - lastEventTime < eventThrottleMs) {
				return; // Ignorar eventos duplicados
			}
			
			(callback as any).lastEventTime = now;
			callback(...args);
		};

		// Registrar nuevo listener
		socketRef.current.on(event, throttledCallback);
		eventListenersRef.current.set(event, throttledCallback);
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

	// CORREGIDO: Función para generar roomId con validación de autenticación
	const generateRoomId = useCallback((conversationId: string) => {
		// Usar la utilidad centralizada que maneja JWT y fallbacks
		const roomId = generateRoomIdUtil(conversationId);
		
		// CORREGIDO: Verificar si se pudo generar el roomId
		if (!roomId) {
			infoLog('🔗 useBaseSocket - No se puede generar roomId (sin autenticación)');
			return null;
		}
		
		return roomId;
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
				
				// CORREGIDO: Verificar si se pudo generar el roomId
				if (!roomId) {
					infoLog(`🔗 ${event} - No se puede emitir (roomId null)`);
					return false;
				}
				
				infoLog(`🔗 ${event} - Room ID generado:`, roomId);
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
				infoLog('🔌 Limpiando socket al desmontar componente...');
				socketRef.current.disconnect();
			}
			
			// Limpiar timeout de reconexión
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
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