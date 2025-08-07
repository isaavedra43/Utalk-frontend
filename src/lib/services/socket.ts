/**
 * Cliente Socket.io configurado para UTalk Frontend
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "🔌 EVENTOS SOCKET.IO ESPECÍFICOS"
 * 
 * Eventos implementados según documentación:
 * - join-conversation: Unirse a sala de conversación
 * - new-message: Recibir nuevos mensajes
 * - message-status-updated: Actualizar estado de mensajes
 * - user-typing: Indicador de escritura
 * - sync-state: Sincronización post-reconexión
 * - disconnect/reconnect: Manejo de reconexión automática
 */

import { logError, logErrorWithContext, logSocket, logWarn } from '$lib/utils/logger';
import { io, Socket } from 'socket.io-client';
import { environment } from '../config/environment';
import { conversationsStore } from '../stores/conversations.store';
import { messagesStore } from '../stores/messages.store';
import { notificationsStore } from '../stores/notifications.store';
import { presenceStore } from '../stores/presence.store';
import { typingStore } from '../stores/typing.store';

// Eventos Socket.IO según documentación - info/2.md línea 565
const SOCKET_EVENTS = {
  // Autenticación
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  AUTHENTICATION_ERROR: 'authentication_error',

  // Sincronización de estado
  SYNC_STATE: 'sync-state',
  STATE_SYNCED: 'state-synced',
  SYNC_REQUIRED: 'sync-required',

  // Conversaciones
  JOIN_CONVERSATION: 'join-conversation',
  LEAVE_CONVERSATION: 'leave-conversation',
  CONVERSATION_JOINED: 'conversation-joined',
  CONVERSATION_LEFT: 'conversation-left',

  // Mensajes
  NEW_MESSAGE: 'new-message',
  MESSAGE_SENT: 'message-sent',
  MESSAGE_READ: 'message-read',
  MESSAGE_DELIVERED: 'message-delivered',
  MESSAGE_STATUS_UPDATED: 'message-status-updated',

  // Escritura
  USER_TYPING: 'user-typing',
  USER_TYPING_STOP: 'user-typing-stop',
  TYPING_INDICATOR: 'typing-indicator',

  // Presencia
  USER_PRESENCE: 'user-presence',
  PRESENCE_UPDATED: 'presence-updated',
  USER_PRESENCE_CHANGE: 'user-presence-change',

  // Sistema
  SYSTEM_MESSAGE: 'system-message',
  ERROR: 'error',
  DISCONNECT: 'disconnect'
};

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = environment.VALIDATION_LIMITS.MAX_RECONNECT_ATTEMPTS;
  private isConnecting = false;
  private currentConversationId: string | null = null;
  private typingDebounce: { [conversationId: string]: number } = {};
  private lastTypingEvent: { [conversationId: string]: number } = {};

  // Conectar al socket - Documento: "Configuración de Socket.IO" - info/1.md línea 1276
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;

      this.socket = io(environment.SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token') || ''
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();

      this.socket.on('connect', () => {
        logSocket('🟢 Socket conectado');
        this.reconnectAttempts = 0;
        this.isConnecting = false;

        // Sincronizar estado - Documento: "Sincronización de estado post-reconexión" - info/1.md línea 634
        this.socket?.emit(SOCKET_EVENTS.SYNC_STATE);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        logErrorWithContext('🔴 Error de conexión del socket:', 'SOCKET', error instanceof Error ? error : new Error(String(error)));
        this.isConnecting = false;
        reject(error);
      });
    });
  }

  // Desconectar socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Configurar event listeners - Documento: "Eventos Socket.IO" - info/2.md línea 57
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Desconexión - Documento: "Reconexión de WebSocket" - info/1.md línea 634
    this.socket.on('disconnect', (reason) => {
      logWarn('⚠️ Socket desconectado:', reason);
      this.reconnect();
    });

    // Reconexión exitosa - Documento: "Sincronización de estado post-reconexión"
    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.socket?.emit(SOCKET_EVENTS.SYNC_STATE);

      // Re-join a la conversación actual si existe
      if (this.currentConversationId) {
        this.joinConversation(this.currentConversationId);
      }
    });

    // Eventos de mensajes - Documento: "Eventos Socket.IO" - info/2.md línea 57
    this.socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message: any) => {
      logSocket('📨 Nuevo mensaje recibido:', message);
      this.handleNewMessage(message);
    });

    this.socket.on(SOCKET_EVENTS.MESSAGE_STATUS_UPDATED, (data: any) => {
      logSocket('📊 Estado de mensaje actualizado:', data);
      this.handleMessageStatusUpdate(data);
    });

    // Eventos de escritura - Documento: "Eventos de Escritura" - info/1.md línea 648
    this.socket.on(SOCKET_EVENTS.TYPING_INDICATOR, (data: any) => {
      logSocket('✍️ Usuario escribiendo:', data);
      this.handleTypingIndicator(data);
    });

    // Eventos de presencia - Documento: info/1.md sección "🔌 EVENTOS SOCKET.IO ESPECÍFICOS"
    this.socket.on(SOCKET_EVENTS.USER_PRESENCE, (data: any) => {
      logSocket('👤 Usuario online:', data);
      this.handleUserPresence(data);
    });

    this.socket.on(SOCKET_EVENTS.PRESENCE_UPDATED, (data: any) => {
      logSocket('👤 Usuario offline:', data);
      this.handlePresenceUpdate(data);
    });

    this.socket.on(SOCKET_EVENTS.USER_PRESENCE_CHANGE, (data: any) => {
      logSocket('👤 Cambio de presencia:', data);
      this.handleUserPresenceChange(data);
    });

    // Eventos de conversación
    this.socket.on(SOCKET_EVENTS.CONVERSATION_JOINED, (data: any) => {
      logSocket('✅ Conversación unida:', data);
    });

    this.socket.on(SOCKET_EVENTS.CONVERSATION_LEFT, (data: any) => {
      logSocket('❌ Conversación abandonada:', data);
    });

    // Eventos de sistema
    this.socket.on(SOCKET_EVENTS.SYSTEM_MESSAGE, (data: any) => {
      logSocket('🔔 Mensaje del sistema:', data);
      notificationsStore.info(data.message);
    });

    this.socket.on(SOCKET_EVENTS.ERROR, (error: any) => {
      logError('🚨 Error del socket:', error);
      notificationsStore.error(error.message || 'Error de conexión');
    });
  }

  // Reconexión con exponential backoff - Documento: "Reconexión de WebSocket" - info/1.md línea 634
  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      logWarn(`🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect();
        this.reconnectAttempts++;
      }, delay);
    } else {
      logError('❌ Máximo número de intentos de reconexión alcanzado');
      notificationsStore.error('Error de conexión. Por favor, recarga la página.');
    }
  }

  // Unirse a una conversación - Documento: "Eventos Socket.IO" - info/2.md línea 565
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      logWarn('⚠️ Socket no conectado, no se puede unir a conversación');
      return;
    }

    // Salir de la conversación anterior si existe
    if (this.currentConversationId && this.currentConversationId !== conversationId) {
      this.leaveConversation(this.currentConversationId);
    }

    this.currentConversationId = conversationId;
    this.socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId });
    logSocket(`✅ Unido a conversación: ${conversationId}`);
  }

  // Salir de una conversación
  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, { conversationId });
    logSocket(`❌ Salido de conversación: ${conversationId}`);

    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
  }

  // Enviar evento de escritura - Documento: "Eventos de Escritura" - info/1.md línea 648
  sendTypingEvent(conversationId: string): void {
    if (!this.socket?.connected) return;

    const now = Date.now();
    const lastEvent = this.lastTypingEvent[conversationId] || 0;
    const debounceTime = 500; // 500ms debounce según documentación

    if (now - lastEvent > debounceTime) {
      this.socket.emit(SOCKET_EVENTS.USER_TYPING, { conversationId });
      this.lastTypingEvent[conversationId] = now;
      logSocket(`✍️ Enviando evento de escritura para conversación: ${conversationId}`);
    }
  }

  // Detener evento de escritura
  sendTypingStopEvent(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit(SOCKET_EVENTS.USER_TYPING_STOP, { conversationId });
    logSocket(`🛑 Deteniendo evento de escritura para conversación: ${conversationId}`);
  }

  // Manejar nuevo mensaje - Documento: "Estructura de Mensaje" - info/1.5.md línea 60
  private handleNewMessage(message: any): void {
    try {
      // Validar estructura del mensaje según documentación
      if (!message.id || !message.conversationId) {
        logError('❌ Mensaje recibido con estructura inválida:', message);
        return;
      }

      // Agregar mensaje al store
      messagesStore.addMessage(message);

      // Actualizar conversación en el store
      conversationsStore.addMessage(message.conversationId, message);

      // Notificar si es una conversación diferente a la actual
      if (this.currentConversationId !== message.conversationId) {
        notificationsStore.info(`Nuevo mensaje en conversación`);
      }

    } catch (error) {
      logErrorWithContext('❌ Error procesando nuevo mensaje:', 'SOCKET', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Manejar actualización de estado de mensaje
  private handleMessageStatusUpdate(data: any): void {
    try {
      if (!data.messageId || !data.status) {
        logError('❌ Datos de actualización de estado inválidos:', 'SOCKET', data);
        return;
      }

      // Actualizar el estado del mensaje en el store
      messagesStore.updateMessageStatus(data.messageId, data.status, data.metadata);

      // Si el mensaje falló, mostrar notificación
      if (data.status === 'failed') {
        notificationsStore.error(`Error al enviar mensaje: ${data.metadata?.failureReason || 'Error desconocido'}`);
      }

    } catch (error) {
      logErrorWithContext('❌ Error procesando actualización de estado:', 'SOCKET', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Manejar indicador de escritura
  private handleTypingIndicator(data: any): void {
    try {
      if (!data.conversationId || !data.userEmail) {
        logError('❌ Datos de indicador de escritura inválidos:', 'SOCKET', data);
        return;
      }

      // Agregar indicador de escritura al store
      typingStore.addTypingUser(data.conversationId, data.userEmail, data.userName || data.userEmail);
      logSocket(`✍️ ${data.userEmail} está escribiendo en conversación ${data.conversationId}`);

    } catch (error) {
      logErrorWithContext('❌ Error procesando indicador de escritura:', 'SOCKET', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Manejar presencia de usuario - Documento: info/1.md sección "USER_PRESENCE"
  private handleUserPresence(data: any): void {
    try {
      if (!data.userId || !data.status) {
        logError('❌ Datos de presencia inválidos:', 'SOCKET', data);
        return;
      }

      // Actualizar presencia en el store
      presenceStore.updateUserPresence({
        userId: data.userId,
        email: data.email || data.userId,
        name: data.name || data.email || data.userId,
        status: data.status,
        lastSeen: data.lastSeen,
        isTyping: data.isTyping || false,
        currentConversationId: data.conversationId
      });

      logSocket(`👤 ${data.email || data.userId} está ${data.status}`);
    } catch (error) {
      logErrorWithContext('❌ Error procesando presencia de usuario:', 'SOCKET', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Manejar actualización de presencia - Documento: info/1.md sección "PRESENCE_UPDATED"
  private handlePresenceUpdate(data: any): void {
    try {
      if (!data.userId || !data.status) {
        logError('❌ Datos de presencia inválidos:', 'SOCKET', data);
        return;
      }

      // Actualizar presencia en el store
      presenceStore.updateUserPresence({
        userId: data.userId,
        email: data.email || data.userId,
        name: data.name || data.email || data.userId,
        status: data.status,
        lastSeen: data.lastSeen,
        isTyping: data.isTyping || false,
        currentConversationId: data.conversationId
      });

      logSocket(`👤 ${data.email || data.userId} ahora está ${data.status}`);
    } catch (error) {
      logErrorWithContext('❌ Error procesando actualización de presencia:', 'SOCKET', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Manejar cambio de presencia - Documento: info/1.md sección "USER_PRESENCE_CHANGE"
  private handleUserPresenceChange(data: any): void {
    try {
      if (!data.userId || !data.status) {
        logError('❌ Datos de cambio de presencia inválidos:', 'SOCKET', data);
        return;
      }

      // Actualizar presencia en el store
      presenceStore.updateUserPresence({
        userId: data.userId,
        email: data.email || data.userId,
        name: data.name || data.email || data.userId,
        status: data.status,
        lastSeen: data.lastSeen,
        isTyping: data.isTyping || false,
        currentConversationId: data.conversationId
      });

      // Notificar cambio de presencia si es significativo
      if (data.status === 'offline') {
        notificationsStore.info(`${data.name || data.email} se ha desconectado`);
      } else if (data.status === 'online') {
        notificationsStore.info(`${data.name || data.email} está en línea`);
      }

      logSocket(`👤 ${data.email || data.userId} cambió a ${data.status}`);
    } catch (error) {
      logErrorWithContext('❌ Error procesando cambio de presencia:', 'SOCKET', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Obtener socket actual
  getSocket(): Socket | null {
    return this.socket;
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Obtener conversación actual
  getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }
}

// Instancia singleton del SocketManager
export const socketManager = new SocketManager();
