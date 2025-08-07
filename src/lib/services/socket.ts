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

import { environment } from '$lib/config/environment';
import { conversationsStore } from '$lib/stores/conversations.store';
import { messagesStore } from '$lib/stores/messages.store';
import { notificationsStore } from '$lib/stores/notifications.store';
import { presenceStore } from '$lib/stores/presence.store';
import { typingStore } from '$lib/stores/typing.store';
import type {
  ConversationEvent,
  MessageStatusUpdate,
  SocketError,
  SocketMessage,
  SystemMessage,
  TypingIndicator,
  UserPresence
} from '$lib/types';
import { listenerManager } from '$lib/utils/listener-manager';
import { logError, logSocket, logWarn } from '$lib/utils/logger';
import { io, type Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 segundo inicial
  private maxReconnectDelay = 30000; // 30 segundos máximo
  private isConnecting = false;
  private isDisconnecting = false;
  private currentConversationId: string | null = null;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private lastHeartbeat = 0;

  constructor() {
    this.setupGlobalListeners();
  }

  /**
   * Configura listeners globales para el socket
   */
  private setupGlobalListeners(): void {
    if (typeof window === 'undefined') return;

    // Listener para cleanup al cerrar la ventana
    const beforeUnloadId = listenerManager.addListener(
      window,
      'beforeunload',
      () => {
        this.disconnect();
      }
    );

    // Listener para cambios de visibilidad (pausar/reanudar heartbeat)
    const visibilityChangeId = listenerManager.addListener(
      document,
      'visibilitychange',
      () => {
        if (document.hidden) {
          this.pauseHeartbeat();
        } else {
          this.resumeHeartbeat();
        }
      }
    );

    logSocket('socket-manager: listeners globales configurados', {
      beforeUnloadId,
      visibilityChangeId
    });
  }

  /**
   * Conecta al servidor de Socket.IO
   */
  async connect(): Promise<boolean> {
    if (this.socket?.connected || this.isConnecting) {
      logSocket('socket-manager: ya conectado o conectando');
      return true;
    }

    this.isConnecting = true;
    logSocket('socket-manager: iniciando conexión', {
      url: environment.SOCKET_URL,
      reconnectAttempts: this.reconnectAttempts
    });

    try {
      this.socket = io(environment.SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        reconnection: false, // Manejo manual de reconexión
        autoConnect: false,
        auth: {
          token: localStorage.getItem('accessToken')
        }
      });

      this.setupSocketListeners();
      await this.socket.connect();

      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;

      logSocket('socket-manager: conexión exitosa');
      this.startHeartbeat();
      return true;
    } catch (error) {
      this.isConnecting = false;
      logError('socket-manager: error en conexión', 'SOCKET', error as Error);
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Configura los listeners del socket
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on('connect', () => {
      logSocket('socket-manager: conectado al servidor');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.startHeartbeat();
    });

    this.socket.on('disconnect', (reason: string) => {
      logSocket('socket-manager: desconectado', { reason });
      this.stopHeartbeat();

      if (reason === 'io server disconnect') {
        // Desconexión iniciada por el servidor
        logSocket('socket-manager: desconexión iniciada por servidor');
      } else if (reason === 'io client disconnect') {
        // Desconexión iniciada por el cliente
        logSocket('socket-manager: desconexión iniciada por cliente');
      } else {
        // Desconexión inesperada, intentar reconectar
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      logError('socket-manager: error de conexión', 'SOCKET', error);
      this.scheduleReconnect();
    });

    // Eventos de mensajes
    this.socket.on('new-message', (data: SocketMessage) => {
      this.handleNewMessage(data);
    });

    this.socket.on('message-status-update', (data: MessageStatusUpdate) => {
      this.handleMessageStatusUpdate(data);
    });

    this.socket.on('typing-indicator', (data: TypingIndicator) => {
      this.handleTypingIndicator(data);
    });

    this.socket.on('user-presence', (data: UserPresence) => {
      this.handleUserPresence(data);
    });

    this.socket.on('conversation-event', (data: ConversationEvent) => {
      this.handleConversationEvent(data);
    });

    this.socket.on('system-message', (data: SystemMessage) => {
      this.handleSystemMessage(data);
    });

    this.socket.on('error', (error: SocketError) => {
      this.handleSocketError(error);
    });

    // Evento de sincronización de estado
    this.socket.on('sync-state', (data: any) => {
      this.handleSyncState(data);
    });
  }

  /**
   * Programa la reconexión con exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logWarn('socket-manager: máximo de intentos de reconexión alcanzado');
      notificationsStore.error('Error de conexión. Por favor, recarga la página.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

    logSocket('socket-manager: programando reconexión', {
      attempt: this.reconnectAttempts,
      delay,
      maxAttempts: this.maxReconnectAttempts
    });

    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Inicia el heartbeat para mantener la conexión activa
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = window.setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat', { timestamp: Date.now() });
        this.lastHeartbeat = Date.now();
      }
    }, 30000); // Heartbeat cada 30 segundos

    logSocket('socket-manager: heartbeat iniciado');
  }

  /**
   * Detiene el heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      logSocket('socket-manager: heartbeat detenido');
    }
  }

  /**
   * Pausa el heartbeat cuando la pestaña no está visible
   */
  private pauseHeartbeat(): void {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      logSocket('socket-manager: heartbeat pausado (pestaña oculta)');
    }
  }

  /**
   * Reanuda el heartbeat cuando la pestaña vuelve a estar visible
   */
  private resumeHeartbeat(): void {
    if (!this.heartbeatTimer && this.socket?.connected) {
      this.startHeartbeat();
      logSocket('socket-manager: heartbeat reanudado (pestaña visible)');
    }
  }

  /**
   * Une una conversación específica
   */
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      logWarn('socket-manager: intentando unirse a conversación sin conexión');
      return;
    }

    if (this.currentConversationId === conversationId) {
      logSocket('socket-manager: ya unido a la conversación', { conversationId });
      return;
    }

    // Salir de la conversación anterior si existe
    if (this.currentConversationId) {
      this.leaveConversation(this.currentConversationId);
    }

    this.socket.emit('join-conversation', { conversationId });
    this.currentConversationId = conversationId;

    logSocket('socket-manager: unido a conversación', { conversationId });
  }

  /**
   * Sale de una conversación específica
   */
  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('leave-conversation', { conversationId });

    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }

    logSocket('socket-manager: salido de conversación', { conversationId });
  }

  /**
   * Envía un mensaje de typing
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;

    this.socket.emit('typing', {
      conversationId,
      isTyping,
      timestamp: Date.now()
    });
  }

  /**
   * Desconecta el socket
   */
  disconnect(): void {
    if (this.isDisconnecting) return;

    this.isDisconnecting = true;
    logSocket('socket-manager: iniciando desconexión');

    // Limpiar timers
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    // Desconectar socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.currentConversationId = null;
    this.isDisconnecting = false;

    logSocket('socket-manager: desconexión completada');
  }

  /**
   * Obtiene el estado de conexión
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Obtiene el ID de la conversación actual
   */
  getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }

  // Handlers de eventos
  private handleNewMessage(data: SocketMessage): void {
    logSocket('socket-manager: nuevo mensaje recibido', {
      messageId: data.id,
      conversationId: data.conversationId,
      senderType: data.sender.type
    });

    messagesStore.addMessage(data);
    conversationsStore.addMessage(data.conversationId, data);
  }

  private handleMessageStatusUpdate(data: MessageStatusUpdate): void {
    logSocket('socket-manager: actualización de estado de mensaje', {
      messageId: data.messageId,
      newStatus: data.status
    });

    messagesStore.updateMessageStatus(data.messageId, data.status, data.metadata as Record<string, unknown>);
  }

  private handleTypingIndicator(data: TypingIndicator): void {
    logSocket('socket-manager: indicador de escritura', {
      conversationId: data.conversationId,
      userEmail: data.userEmail,
      isTyping: data.isTyping
    });

    if (data.isTyping) {
      typingStore.addTypingUser(data.conversationId, data.userEmail, data.userName);
    } else {
      typingStore.removeTypingUser(data.conversationId, data.userEmail);
    }
  }

  private handleUserPresence(data: UserPresence): void {
    logSocket('socket-manager: actualización de presencia', {
      userId: data.userId,
      status: data.status,
      isTyping: data.isTyping
    });

    presenceStore.updateUserPresence(data);
  }

  private handleConversationEvent(data: ConversationEvent): void {
    logSocket('socket-manager: evento de conversación', {
      conversationId: data.conversationId,
      userEmail: data.userEmail
    });

    // Por ahora solo logueamos el evento
    // La lógica específica se implementará según los tipos de eventos del backend
  }

  private handleSystemMessage(data: SystemMessage): void {
    logSocket('socket-manager: mensaje del sistema', {
      type: data.type,
      message: data.message
    });

    notificationsStore.info(data.message);
  }

  private handleSocketError(error: SocketError): void {
    logError('socket-manager: error del socket', 'SOCKET', new Error(error.message));
    notificationsStore.error(`Error de conexión: ${error.message}`);
  }

  private handleSyncState(data: any): void {
    logSocket('socket-manager: sincronización de estado', {
      hasConversations: !!data.conversations,
      hasMessages: !!data.messages,
      hasPresence: !!data.presence
    });

    // Sincronizar estado con los datos del servidor
    if (data.conversations) {
      // Actualizar conversaciones si es necesario
    }

    if (data.messages && this.currentConversationId) {
      // Actualizar mensajes de la conversación actual
    }

    if (data.presence) {
      // Actualizar estado de presencia
    }
  }

  /**
   * Solicita sincronización de estado al servidor
   */
  requestSyncState(): void {
    if (!this.socket?.connected) return;

    this.socket.emit('request-sync-state', {
      conversationId: this.currentConversationId,
      timestamp: Date.now()
    });

    logSocket('socket-manager: solicitando sincronización de estado');
  }
}

// Instancia global del gestor de socket
export const socketManager = new SocketManager();

// Exponer en window para acceso global (solo en desarrollo)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).socketManager = socketManager;
}
