import api from './api';
import { logger } from '../utils/logger';
import { io, Socket } from 'socket.io-client';

// Interfaz para mensajes
interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  senderId: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isOptimistic?: boolean;
}

// Interfaz para conversaciones
interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  participants: string[];
}

// Interfaz para usuario
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
}

// Manager de WebSocket
class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;

  constructor() {
    this.socket = null;
  }

  connect(): void {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      logger.authError('No token available for socket connection', new Error('Missing token'));
      return;
    }

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://utalk-backend-production.up.railway.app';
    
    logger.apiInfo('Conectando WebSocket', {
      url: backendUrl,
      hasToken: !!token
    });

    this.socket = io(backendUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      logger.apiInfo('WebSocket conectado exitosamente');
      this.reconnectAttempts = 0;
      
      // Notificar conexión exitosa
      window.dispatchEvent(new CustomEvent('socket:connected'));
    });

    this.socket.on('disconnect', (reason) => {
      logger.apiInfo('WebSocket desconectado', { reason });
      
      if (reason === 'io server disconnect') {
        // Server nos desconectó - posible problema de auth
        logger.authError('Servidor desconectó WebSocket', new Error('Server disconnect'));
        this.handleAuthError();
      } else {
        // Problema de red - intentar reconectar
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      logger.apiError('Error de conexión WebSocket', error as Error);
      
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        this.handleAuthError();
      } else {
        this.handleReconnect();
      }
    });

    // Escuchar mensajes en tiempo real
    this.socket.on('new_message', (message: Message) => {
      logger.apiInfo('Nuevo mensaje recibido vía WebSocket', {
        messageId: message.id,
        conversationId: message.conversationId
      });
      
      window.dispatchEvent(new CustomEvent('chat:new-message', {
        detail: { message }
      }));
    });

    this.socket.on('message_status_update', (status: { messageId: string; status: string }) => {
      logger.apiInfo('Actualización de estado de mensaje', status);
      
      window.dispatchEvent(new CustomEvent('chat:message-status-update', {
        detail: status
      }));
    });

    this.socket.on('typing_start', (data: { conversationId: string; userId: string }) => {
      window.dispatchEvent(new CustomEvent('chat:typing-start', {
        detail: data
      }));
    });

    this.socket.on('typing_stop', (data: { conversationId: string; userId: string }) => {
      window.dispatchEvent(new CustomEvent('chat:typing-stop', {
        detail: data
      }));
    });
  }

  private handleAuthError(): void {
    logger.authError('Error de autenticación en WebSocket', new Error('WebSocket auth error'));
    
    // Limpiar tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Notificar fallo de autenticación
    window.dispatchEvent(new CustomEvent('auth:authentication-failed'));
    
    // Redirigir al login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      
      logger.apiInfo(`Reintentando conexión WebSocket en ${delay}ms`, {
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts
      });
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      logger.apiError('Máximo de intentos de reconexión alcanzado', new Error('Max reconnection attempts'));
      
      // Notificar error de conexión
      window.dispatchEvent(new CustomEvent('socket:connection-failed'));
    }
  }

  joinConversation(conversationId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_conversation', { conversationId });
      logger.apiInfo('Unido a conversación', { conversationId });
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_conversation', { conversationId });
      logger.apiInfo('Salido de conversación', { conversationId });
    }
  }

  sendMessage(messageData: Partial<Message>): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('send_message', messageData);
      logger.apiInfo('Mensaje enviado vía WebSocket', {
        conversationId: messageData.conversationId,
        type: messageData.type
      });
    } else {
      logger.apiError('WebSocket no conectado, no se puede enviar mensaje', new Error('Socket not connected'));
      throw new Error('WebSocket no está conectado');
    }
  }

  startTyping(conversationId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      logger.apiInfo('WebSocket desconectado manualmente');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Clase principal del Chat
export class UTalkChat {
  private socketManager: SocketManager;
  private currentConversationId: string | null = null;
  private conversations: Conversation[] = [];
  private messages: Message[] = [];
  private user: User | null = null;
  private isInitialized = false;

  constructor() {
    this.socketManager = new SocketManager();
    this.setupEventListeners();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.apiInfo('Chat ya está inicializado');
      return;
    }

    try {
      logger.apiInfo('Inicializando UTalkChat...');

      // 1. Verificar autenticación
      await this.verifyAuthentication();

      // 2. Cargar usuario
      await this.loadUser();

      // 3. Conectar WebSocket
      this.socketManager.connect();

      // 4. Cargar conversaciones disponibles
      await this.loadConversations();

      this.isInitialized = true;
      logger.apiInfo('UTalkChat inicializado exitosamente');

      // Notificar que el chat está listo
      window.dispatchEvent(new CustomEvent('chat:initialized'));

    } catch (error) {
      logger.apiError('Error inicializando UTalkChat', error as Error);
      this.handleInitializationError(error as Error);
      throw error;
    }
  }

  private async verifyAuthentication(): Promise<void> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Verificar si el token está expirado
    const expiresAt = localStorage.getItem('token_expires_at');
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      logger.authInfo('Token expirado, intentando refresh...');
      
      try {
        // El interceptor se encargará del refresh automático
        await api.get('/api/auth/profile');
      } catch (error) {
        throw new Error('Token expired and refresh failed');
      }
    }

    logger.apiInfo('Autenticación verificada exitosamente');
  }

  private async loadUser(): Promise<void> {
    try {
      const response = await api.get('/api/auth/profile');
      this.user = response.data.data || response.data;
      
      logger.apiInfo('Usuario cargado exitosamente', {
        userId: this.user?.id,
        userName: this.user?.name
      });

      // Notificar que el usuario fue cargado
      window.dispatchEvent(new CustomEvent('chat:user-loaded', {
        detail: { user: this.user }
      }));

    } catch (error) {
      logger.apiError('Error cargando usuario', error as Error);
      
      if ((error as any).response?.status === 401) {
        throw new Error('Authentication failed while loading user');
      }
      
      throw error;
    }
  }

  async loadConversations(): Promise<void> {
    try {
      logger.apiInfo('Cargando lista de conversaciones...');
      
      const response = await api.get('/api/conversations');
      this.conversations = response.data.data || response.data || [];
      
      logger.apiInfo('Conversaciones cargadas exitosamente', {
        count: this.conversations.length,
        conversationIds: this.conversations.map(c => c.id)
      });

      // Validar que hay conversaciones
      if (!this.conversations || this.conversations.length === 0) {
        logger.apiInfo('No hay conversaciones disponibles');
        this.showNoConversationsMessage();
        return;
      }

      // Notificar que las conversaciones fueron cargadas
      window.dispatchEvent(new CustomEvent('chat:conversations-loaded', {
        detail: { conversations: this.conversations }
      }));

      // Solo cargar mensajes de la primera conversación válida si hay conversaciones
      if (this.conversations.length > 0) {
        await this.loadMessages(this.conversations[0].id);
      }

    } catch (error) {
      logger.apiError('Error cargando conversaciones', error as Error);
      
      // No mostrar error si es por autenticación (el interceptor se encarga)
      if ((error as any).response?.status !== 401) {
        this.showErrorMessage('Error cargando conversaciones');
      }
    }
  }

  async loadMessages(conversationId: string): Promise<void> {
    if (this.currentConversationId === conversationId) {
      logger.apiInfo('Conversación ya está cargada', { conversationId });
      return;
    }

    // Validar que la conversación existe en nuestra lista
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      logger.apiError('Intento de cargar conversación que no existe en la lista', new Error('Conversation not in list'), {
        requestedId: conversationId,
        availableIds: this.conversations.map(c => c.id)
      });
      
      this.showConversationNotFound();
      return;
    }

    // Salir de la conversación anterior
    if (this.currentConversationId) {
      this.socketManager.leaveConversation(this.currentConversationId);
    }

    this.currentConversationId = conversationId;

    try {
      logger.apiInfo('Cargando mensajes de conversación', { conversationId });
      
      const response = await api.get(`/api/messages`, {
        params: {
          conversationId: conversationId,
          limit: 50
        }
      });
      
      this.messages = response.data.data || response.data || [];
      
      logger.apiInfo('Mensajes cargados exitosamente', {
        conversationId,
        messageCount: this.messages.length
      });

      // Unirse al room de la conversación para recibir mensajes en tiempo real
      this.socketManager.joinConversation(conversationId);

      // Notificar que los mensajes fueron cargados
      window.dispatchEvent(new CustomEvent('chat:messages-loaded', {
        detail: { 
          conversationId,
          messages: this.messages 
        }
      }));

    } catch (error) {
      logger.apiError('Error cargando mensajes', error as Error, {
        conversationId,
        errorStatus: (error as any).response?.status
      });

      if ((error as any).response?.status === 404) {
        const errorCode = (error as any).response?.data?.error?.code;
        if (errorCode === 'CONVERSATION_NOT_FOUND') {
          logger.apiInfo('Conversación no encontrada en el backend', {
            conversationId,
            errorCode
          });
          this.showConversationNotFound();
        }
      } else if ((error as any).response?.status !== 401) {
        // No mostrar error si es por autenticación
        this.showErrorMessage('Error cargando mensajes');
      }
    }
  }

  async sendMessage(content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<void> {
    if (!this.currentConversationId) {
      this.showErrorMessage('No hay conversación seleccionada');
      return;
    }

    if (!this.user) {
      this.showErrorMessage('Usuario no cargado');
      return;
    }

    const messageData: Partial<Message> = {
      conversationId: this.currentConversationId,
      content: content,
      type: type,
      senderId: this.user.id,
      timestamp: new Date().toISOString()
    };

    // Agregar mensaje optimista a la UI
    const optimisticMessage = this.addOptimisticMessage(messageData);

    try {
      // Intentar enviar vía WebSocket primero
      if (this.socketManager.isConnected()) {
        this.socketManager.sendMessage(messageData);
        logger.apiInfo('Mensaje enviado vía WebSocket');
      } else {
        // Fallback a API REST
        logger.apiInfo('WebSocket no conectado, usando API REST como fallback');
        
        const response = await api.post('/api/messages', messageData);
        const sentMessage = response.data.data || response.data;
        
        // Actualizar mensaje optimista con datos reales
        this.updateOptimisticMessage(optimisticMessage.id, sentMessage);
        
        logger.apiInfo('Mensaje enviado vía API REST', {
          messageId: sentMessage.id
        });
      }

    } catch (error) {
      logger.apiError('Error enviando mensaje', error as Error);
      
      // Revertir mensaje optimista
      this.removeOptimisticMessage(optimisticMessage.id);
      
      if ((error as any).response?.status !== 401) {
        // No mostrar error si es por autenticación
        this.showErrorMessage('Error enviando mensaje');
      }
    }
  }

  private addOptimisticMessage(messageData: Partial<Message>): Message {
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}_${Math.random()}`,
      conversationId: messageData.conversationId!,
      content: messageData.content!,
      type: messageData.type!,
      senderId: messageData.senderId!,
      timestamp: messageData.timestamp!,
      status: 'sending',
      isOptimistic: true
    };

    this.messages.push(optimisticMessage);
    
    // Notificar cambio en mensajes
    window.dispatchEvent(new CustomEvent('chat:messages-updated', {
      detail: { 
        conversationId: this.currentConversationId,
        messages: this.messages 
      }
    }));

    return optimisticMessage;
  }

  private updateOptimisticMessage(tempId: string, realMessage: Message): void {
    const index = this.messages.findIndex(msg => msg.id === tempId);
    if (index !== -1) {
      this.messages[index] = { ...realMessage, status: 'sent' };
      
      // Notificar cambio en mensajes
      window.dispatchEvent(new CustomEvent('chat:messages-updated', {
        detail: { 
          conversationId: this.currentConversationId,
          messages: this.messages 
        }
      }));
    }
  }

  private removeOptimisticMessage(tempId: string): void {
    this.messages = this.messages.filter(msg => msg.id !== tempId);
    
    // Notificar cambio en mensajes
    window.dispatchEvent(new CustomEvent('chat:messages-updated', {
      detail: { 
        conversationId: this.currentConversationId,
        messages: this.messages 
      }
    }));
  }

  private updateMessageStatus(messageId: string, status: string): void {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message) {
      message.status = status as any;
      
      // Notificar cambio en mensajes
      window.dispatchEvent(new CustomEvent('chat:messages-updated', {
        detail: { 
          conversationId: this.currentConversationId,
          messages: this.messages 
        }
      }));
    }
  }

  private setupEventListeners(): void {
    // Escuchar refresh de tokens para reconectar WebSocket
    window.addEventListener('auth:token-refreshed', (event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.accessToken) {
        logger.apiInfo('Token refrescado, reconectando WebSocket...');
        
        // Reconectar WebSocket con nuevo token
        this.socketManager.disconnect();
        setTimeout(() => {
          this.socketManager.connect();
        }, 1000);
      }
    });

    // Escuchar nuevos mensajes
    window.addEventListener('chat:new-message', (event) => {
      const detail = (event as CustomEvent).detail;
      const message = detail.message as Message;
      
      this.handleNewMessage(message);
    });

    // Escuchar actualizaciones de estado de mensajes
    window.addEventListener('chat:message-status-update', (event) => {
      const detail = (event as CustomEvent).detail;
      this.updateMessageStatus(detail.messageId, detail.status);
    });

    // Escuchar fallos de autenticación
    window.addEventListener('auth:authentication-failed', () => {
      this.cleanup();
    });
  }

  private handleNewMessage(message: Message): void {
    // Verificar si el mensaje ya existe (evitar duplicados)
    const existingMessage = this.messages.find(msg => msg.id === message.id);
    
    if (!existingMessage) {
      // Si es de la conversación actual, agregarlo a los mensajes
      if (message.conversationId === this.currentConversationId) {
        this.messages.push(message);
        
        // Notificar cambio en mensajes
        window.dispatchEvent(new CustomEvent('chat:messages-updated', {
          detail: { 
            conversationId: this.currentConversationId,
            messages: this.messages 
          }
        }));
      }

      // Mostrar notificación si no es de la conversación activa o si el usuario no está viendo el chat
      if (message.conversationId !== this.currentConversationId || !document.hasFocus()) {
        this.showNotification('Nuevo mensaje', message.content, message.conversationId);
      }

      logger.apiInfo('Nuevo mensaje manejado', {
        messageId: message.id,
        conversationId: message.conversationId,
        isCurrentConversation: message.conversationId === this.currentConversationId
      });
    }
  }

  private showNotification(title: string, body: string, conversationId?: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: conversationId
      });

      notification.onclick = () => {
        window.focus();
        if (conversationId && conversationId !== this.currentConversationId) {
          this.loadMessages(conversationId);
        }
        notification.close();
      };

      // Auto-cerrar después de 5 segundos
      setTimeout(() => notification.close(), 5000);
    }
  }

  private showErrorMessage(message: string): void {
    logger.apiError('Mostrando mensaje de error al usuario', new Error(message));
    
    // Emitir evento para que la UI maneje el error
    window.dispatchEvent(new CustomEvent('chat:error', {
      detail: { message }
    }));
  }

  private showConversationNotFound(): void {
    logger.apiInfo('Mostrando mensaje de conversación no encontrada');
    
    // Emitir evento para que la UI maneje este caso
    window.dispatchEvent(new CustomEvent('chat:conversation-not-found'));
  }

  private showNoConversationsMessage(): void {
    logger.apiInfo('Mostrando mensaje de no conversaciones');
    
    // Emitir evento para que la UI maneje este caso
    window.dispatchEvent(new CustomEvent('chat:no-conversations'));
  }

  private handleInitializationError(error: Error): void {
    logger.apiError('Error de inicialización del chat', error);
    
    if (error.message.includes('Authentication') || error.message.includes('Token')) {
      // Error de autenticación - redirigir al login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else {
      // Otro error - mostrar mensaje
      this.showErrorMessage('Error inicializando el chat');
    }
  }

  // Métodos públicos para obtener datos
  getConversations(): Conversation[] {
    return this.conversations;
  }

  getMessages(): Message[] {
    return this.messages;
  }

  getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }

  getUser(): User | null {
    return this.user;
  }

  isSocketConnected(): boolean {
    return this.socketManager.isConnected();
  }

  // Método para limpiar recursos
  cleanup(): void {
    logger.apiInfo('Limpiando recursos del chat');
    
    this.socketManager.disconnect();
    this.currentConversationId = null;
    this.conversations = [];
    this.messages = [];
    this.user = null;
    this.isInitialized = false;
  }

  // Método para reinicializar
  async reinitialize(): Promise<void> {
    this.cleanup();
    await this.initialize();
  }
}

// Exportar instancia singleton
export const chatManager = new UTalkChat();
