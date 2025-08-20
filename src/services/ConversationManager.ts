import { Socket } from 'socket.io-client';
import type { Conversation } from '../types';
import { infoLog } from '../config/logger';

// Función para normalizar conversaciones según la estructura del backend
const normalizeConversation = (conversation: Conversation): Conversation => {
  // CORREGIDO: Verificar si realmente no hay datos de contacto
  // El backend puede enviar contact con campos undefined, pero eso no significa que no haya datos
  const hasContactData = conversation.contact && (
    conversation.contact.name || 
    conversation.contact.profileName || 
    conversation.contact.phoneNumber || 
    conversation.contact.id ||
    conversation.contact.waId
  );

  if (!hasContactData) {
    // REDUCIR LOGS: Solo mostrar una vez por conversación
    if (import.meta.env.DEV && !conversation.needsContactData) {
      console.warn('⚠️ [DEBUG] Conversación sin datos de contacto:', conversation.id);
    }
    return {
      ...conversation,
      contact: null,
      needsContactData: true
    };
  }
  
  // CORREGIDO: Normalizar la estructura del contacto según el backend
  // Manejar casos donde algunos campos pueden ser undefined
  return {
    ...conversation,
    contact: {
      id: conversation.contact?.id || conversation.customerPhone,
      name: conversation.contact?.name || conversation.contact?.profileName || conversation.customerPhone,
      profileName: conversation.contact?.profileName || conversation.contact?.name,
      phoneNumber: conversation.contact?.phoneNumber || conversation.customerPhone,
      waId: conversation.contact?.waId,
      hasProfilePhoto: conversation.contact?.avatar ? true : false,
      avatar: conversation.contact?.avatar || null,
      channel: conversation.contact?.channel || 'whatsapp',
      lastSeen: conversation.contact?.lastSeen
    },
    needsContactData: false
  };
};

// Singleton mejorado con control de instancias y estabilidad
export class ConversationManager {
  private static instance: ConversationManager | null = null;
  private listenersRegistered = false;
  private initialSyncTriggered = false;
  private lastSyncTime = 0;
  private syncTimeout: NodeJS.Timeout | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private instanceCount = 0;
  private isStable = false;
  private isInitialized = false;
  private initializationTimeout: NodeJS.Timeout | null = null;

  static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  // Método de inicialización controlada
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    // Marcar como estable después de 1 segundo
    this.initializationTimeout = setTimeout(() => {
      this.isStable = true;
    }, 1000);
  }

  // Método para registrar instancia con control mejorado
  registerInstance(): void {
    this.instanceCount++;
    
    // Inicializar si es la primera instancia
    if (this.instanceCount === 1) {
      this.initialize();
    }
  }

  // Método para desregistrar instancia con control mejorado
  unregisterInstance(): void {
    this.instanceCount = Math.max(0, this.instanceCount - 1);
    
    // Solo limpiar si no hay instancias activas Y el estado es estable
    if (this.instanceCount === 0 && this.isStable) {
      this.cleanup();
    }
  }

  isStableState(): boolean {
    return this.isStable;
  }

  isInitializedState(): boolean {
    return this.isInitialized;
  }

  getInstanceCount(): number {
    return this.instanceCount;
  }

  isListenersRegistered(): boolean {
    return this.listenersRegistered;
  }

  setListenersRegistered(value: boolean): void {
    // Permitir registro de listeners siempre que no estén ya registrados
    if (this.listenersRegistered && value) {
      return;
    }
    
    this.listenersRegistered = value;
  }

  isInitialSyncTriggered(): boolean {
    return this.initialSyncTriggered;
  }

  setInitialSyncTriggered(value: boolean): void {
    // Permitir sincronización inicial siempre que no esté ya activada
    if (this.initialSyncTriggered && value) {
      return;
    }
    
    this.initialSyncTriggered = value;
  }

  canSync(): boolean {
    // Permitir sincronización siempre, solo controlar frecuencia
    const now = Date.now();
    if (now - this.lastSyncTime < 2000) {
      return false;
    }
    this.lastSyncTime = now;
    return true;
  }

  setSyncTimeout(timeout: NodeJS.Timeout | null): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = timeout;
  }

  setPollingInterval(interval: NodeJS.Timeout | null): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = interval;
  }

  hasPollingInterval(): boolean {
    return this.pollingInterval !== null;
  }

  cleanup(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout);
      this.initializationTimeout = null;
    }
    this.listenersRegistered = false;
    this.initialSyncTriggered = false;
    this.isStable = false;
    this.isInitialized = false;
  }

  // Método para registrar listeners de WebSocket
  registerListeners(
    socket: Socket, 
    handlers: {
      handleConversationEvent: (data: unknown) => void;
      handleNewMessage: (data: unknown) => void;
      handleMessageRead: (data: unknown) => void;
      handleConversationJoined: (data: unknown) => void;
      handleConversationLeft: (data: unknown) => void;
      handleStateSynced: (data: unknown) => void;
      handleWebhookConversationCreated: (data: unknown) => void;
      handleWebhookNewMessage: (data: unknown) => void;
    }
  ): void {
    if (this.listenersRegistered) {
      return;
    }

    // Registrar listeners para eventos de conversación
    socket.on('conversation-event', handlers.handleConversationEvent);
    socket.on('new-message', handlers.handleNewMessage);
    socket.on('message-read', handlers.handleMessageRead);
    socket.on('conversation-joined', handlers.handleConversationJoined);
    socket.on('conversation-left', handlers.handleConversationLeft);
    socket.on('state-synced', handlers.handleStateSynced);
    
    // Registrar listeners para eventos de webhook
    socket.on('webhook:conversation-created', handlers.handleWebhookConversationCreated);
    socket.on('webhook:new-message', handlers.handleWebhookNewMessage);
    
    // Registrar listeners para eventos personalizados del DOM
    const handleWebSocketStateSynced = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handlers.handleStateSynced(detail);
    };

    const handleWebSocketNewMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handlers.handleNewMessage(detail);
    };

    const handleWebhookConversationCreatedEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handlers.handleWebhookConversationCreated(detail);
    };

    const handleWebhookNewMessageEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handlers.handleWebhookNewMessage(detail);
    };

    window.addEventListener('websocket:state-synced', handleWebSocketStateSynced);
    window.addEventListener('new-message', handleWebSocketNewMessage);
    window.addEventListener('webhook:conversation-created', handleWebhookConversationCreatedEvent);
    window.addEventListener('webhook:new-message', handleWebhookNewMessageEvent);
    
    this.setListenersRegistered(true);
  }

  // Método para limpiar listeners de WebSocket
  unregisterListeners(socket: Socket): void {
    if (!this.listenersRegistered) {
      return;
    }

    socket.off('conversation-event');
    socket.off('new-message');
    socket.off('message-read');
    socket.off('conversation-joined');
    socket.off('conversation-left');
    socket.off('state-synced');
    socket.off('webhook:conversation-created');
    socket.off('webhook:new-message');
    
    // Limpiar listeners del DOM
    window.removeEventListener('websocket:state-synced', () => {});
    window.removeEventListener('new-message', () => {});
    window.removeEventListener('webhook:conversation-created', () => {});
    window.removeEventListener('webhook:new-message', () => {});
    
    this.setListenersRegistered(false);
  }

  // Método para sincronizar estado
  syncState(): void {
    if (!this.canSync()) {
      return;
    }

    // Lógica de sincronización
    infoLog('🔄 ConversationManager - Sincronizando estado...');
  }

  // Método para normalizar conversaciones
  normalizeConversation(conversation: Conversation): Conversation {
    return normalizeConversation(conversation);
  }
} 