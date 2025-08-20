import { useEffect, useCallback, useMemo } from 'react';
import { useWebSocketContext } from '../../contexts/useWebSocketContext';
import { useChatStore } from '../../stores/useChatStore';
import { useAuthContext } from '../../contexts/useAuthContext';
import { ConversationManager } from '../../services/ConversationManager';
import { infoLog } from '../../config/logger';
import type { Message } from '../../types';

// Tipos para validación de mensajes de webhook
interface WebhookMessageData {
  conversationId?: string;
  message?: {
    id?: string;
    content?: string;
    sender?: string;
    timestamp?: string;
    type?: string;
    metadata?: Record<string, unknown>;
  };
}

// Validación y transformación de mensajes de webhook
const validateAndTransformMessage = (data: WebhookMessageData): Message | null => {
  if (!data?.conversationId || typeof data.conversationId !== 'string') {
    infoLog('❌ Mensaje de webhook inválido: conversationId faltante o inválido');
    return null;
  }

  if (!data?.message || typeof data.message !== 'object') {
    infoLog('❌ Mensaje de webhook inválido: objeto message faltante');
    return null;
  }

  const { message } = data;
  
  if (!message.id || typeof message.id !== 'string') {
    infoLog('❌ Mensaje de webhook inválido: message.id faltante o inválido');
    return null;
  }

  if (!message.content || typeof message.content !== 'string') {
    infoLog('❌ Mensaje de webhook inválido: message.content faltante o inválido');
    return null;
  }

  if (!message.sender || typeof message.sender !== 'string') {
    infoLog('❌ Mensaje de webhook inválido: message.sender faltante o inválido');
    return null;
  }

  if (!message.timestamp || typeof message.timestamp !== 'string') {
    infoLog('❌ Mensaje de webhook inválido: message.timestamp faltante o inválido');
    return null;
  }

  // Transformar a formato del store
  const transformedMessage: Message = {
    id: message.id,
    conversationId: data.conversationId,
    content: message.content,
    direction: 'inbound',
    createdAt: message.timestamp,
    updatedAt: message.timestamp,
    type: (message.type as 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker') || 'text',
    metadata: {
      agentId: message.sender,
      ip: 'unknown',
      requestId: 'unknown',
      sentBy: message.sender,
      source: 'web',
      timestamp: message.timestamp,
      ...message.metadata
    },
    status: 'received',
    recipientIdentifier: undefined,
    senderIdentifier: message.sender,
    userAgent: undefined
  };

  return transformedMessage;
};

export const useConversationSync = () => {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { on, off, isConnected, syncState } = useWebSocketContext();
  
  const { addMessage, updateConversation } = useChatStore();

  // Usar singleton mejorado para controlar estado global
  const manager = useMemo(() => {
    const instance = ConversationManager.getInstance();
    instance.registerInstance();
    return instance;
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      manager.unregisterInstance();
    };
  }, [manager]);

  // Cleanup adicional para mantener estabilidad
  useEffect(() => {
    // Solo limpiar listeners si realmente se desconecta
    if (!isAuthenticated || !isConnected) {
      if (import.meta.env.DEV) {
        infoLog('🔌 useConversationSync - Cleanup por desconexión...');
      }
      manager.setListenersRegistered(false);
    }
  }, [isAuthenticated, isConnected, manager]);

  // Handlers para eventos de WebSocket
  const handleConversationEvent = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      infoLog('🔌 useConversationSync - Evento de conversación recibido:', eventData);
    }
    // Lógica de manejo de eventos de conversación
  }, []);

  const handleNewMessage = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      infoLog('🔌 useConversationSync - Nuevo mensaje recibido:', eventData);
      infoLog('🔌 useConversationSync - Timestamp del handler:', new Date().toISOString());
    }
    
    // Lógica de manejo de nuevos mensajes
    const data = eventData as WebhookMessageData;
    if (data?.conversationId && data?.message) {
      const validatedMessage = validateAndTransformMessage(data);
      if (validatedMessage) {
        addMessage(data.conversationId, validatedMessage);
        
        // Actualizar conversación con último mensaje
        const lastMessage = {
          messageId: validatedMessage.id,
          sender: validatedMessage.senderIdentifier || 'unknown',
          content: validatedMessage.content,
          type: validatedMessage.type,
          timestamp: validatedMessage.createdAt,
          direction: 'inbound' as const,
          status: 'received' as const
        };
        
        updateConversation(data.conversationId, {
          lastMessage,
          lastMessageAt: validatedMessage.createdAt
        });
        
        infoLog(`📨 Mensaje de WebSocket procesado: ${data.conversationId} - ${validatedMessage.content.substring(0, 50)}...`);
      }
    }
  }, [addMessage, updateConversation]);

  const handleMessageRead = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      infoLog('🔌 useConversationSync - Mensajes marcados como leídos:', eventData);
    }
    // Lógica de manejo de mensajes leídos
  }, []);

  const handleConversationJoined = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      infoLog('🔌 useConversationSync - Usuario se unió a conversación:', eventData);
    }
    // Lógica de manejo de unión a conversación
  }, []);

  const handleConversationLeft = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      infoLog('🔌 useConversationSync - Usuario salió de conversación:', eventData);
    }
    // Lógica de manejo de salida de conversación
  }, []);

  const handleStateSynced = useCallback((syncData: unknown) => {
    if (import.meta.env.DEV) {
      infoLog('🔌 useConversationSync - Estado sincronizado:', syncData);
    }
    // Lógica de sincronización de estado
  }, []);

  const handleWebhookConversationCreated = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      infoLog('🔌 useConversationSync - Nueva conversación desde webhook:', eventData);
    }
    // Lógica de manejo de conversación creada por webhook
  }, []);

  const handleWebhookNewMessage = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      infoLog('🎯 useConversationSync - Handler webhook:new-message llamado con datos:', eventData);
      infoLog('🎯 useConversationSync - Timestamp del handler:', new Date().toISOString());
    }
    
    // Lógica de manejo de nuevo mensaje por webhook
    const data = eventData as WebhookMessageData;
    if (data?.conversationId && data?.message) {
      const validatedMessage = validateAndTransformMessage(data);
      if (validatedMessage) {
        addMessage(data.conversationId, validatedMessage);
        
        // Actualizar conversación con último mensaje
        const lastMessage = {
          messageId: validatedMessage.id,
          sender: validatedMessage.senderIdentifier || 'unknown',
          content: validatedMessage.content,
          type: validatedMessage.type,
          timestamp: validatedMessage.createdAt,
          direction: 'inbound' as const,
          status: 'received' as const
        };
        
        updateConversation(data.conversationId, {
          lastMessage,
          lastMessageAt: validatedMessage.createdAt
        });
        
        infoLog(`🎯 Mensaje de webhook procesado: ${data.conversationId} - ${validatedMessage.content.substring(0, 50)}...`);
      }
    }
  }, [addMessage, updateConversation]);

  // ESCUCHAR EVENTOS DE CONVERSACIÓN - OPTIMIZADO PARA EVITAR RECONEXIONES
  useEffect(() => {
    if (!isAuthenticated || authLoading || !isConnected) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][ConversationSync] No registrando listeners', { 
          isAuthenticated, 
          authLoading, 
          isConnected 
        });
      }
      return;
    }

    // Usar singleton mejorado para evitar registro duplicado
    if (manager.isListenersRegistered()) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][ConversationSync] Listeners ya registrados, saltando');
      }
      return;
    }

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.debug('[DEBUG][ConversationSync] Registrando listeners de WS');
    }

    // Registrar listeners para eventos de conversación
    on('conversation-event', handleConversationEvent);
    on('new-message', handleNewMessage);
    on('message-read', handleMessageRead);
    on('conversation-joined', handleConversationJoined);
    on('conversation-left', handleConversationLeft);
    on('state-synced', handleStateSynced);
    
    // Registrar listeners para eventos de webhook
    on('webhook:conversation-created', handleWebhookConversationCreated);
    on('webhook:new-message', handleWebhookNewMessage);
    
    // Registrar listeners para eventos personalizados del DOM
    const handleWebSocketStateSynced = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handleStateSynced(detail);
    };

    const handleWebSocketNewMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handleNewMessage(detail);
    };

    const handleWebhookConversationCreatedEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handleWebhookConversationCreated(detail);
    };

    const handleWebhookNewMessageEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handleWebhookNewMessage(detail);
    };

    window.addEventListener('websocket:state-synced', handleWebSocketStateSynced);
    window.addEventListener('new-message', handleWebSocketNewMessage);
    window.addEventListener('webhook:conversation-created', handleWebhookConversationCreatedEvent);
    window.addEventListener('webhook:new-message', handleWebhookNewMessageEvent);
    
    // Marcar como registrado usando singleton mejorado
    manager.setListenersRegistered(true);

    // Cleanup solo cuando se desmonta el componente o cambia el estado de autenticación
    return () => {
      // Solo limpiar si realmente se está desmontando o desconectando
      if (!isAuthenticated || !isConnected) {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.debug('[DEBUG][ConversationSync] Limpiando listeners de WS (desconexión)');
        }
        off('conversation-event');
        off('new-message');
        off('message-read');
        off('conversation-joined');
        off('conversation-left');
        off('state-synced');
        off('webhook:conversation-created');
        off('webhook:new-message');
        
        // Limpiar listeners del DOM
        window.removeEventListener('websocket:state-synced', handleWebSocketStateSynced);
        window.removeEventListener('new-message', handleWebSocketNewMessage);
        window.removeEventListener('webhook:conversation-created', handleWebhookConversationCreatedEvent);
        window.removeEventListener('webhook:new-message', handleWebhookNewMessageEvent);
        
        manager.setListenersRegistered(false);
      }
    };
  }, [isAuthenticated, authLoading, isConnected, on, off, handleConversationEvent, handleNewMessage, handleMessageRead, handleConversationJoined, handleConversationLeft, handleStateSynced, handleWebhookConversationCreated, handleWebhookNewMessage, manager]);

  // Función para sincronizar con el servidor
  const syncWithServer = useCallback(() => {
    if (manager.canSync()) {
      syncState();
      infoLog('🔄 useConversationSync - Sincronizando con servidor...');
    }
  }, [manager, syncState]);

  return {
    // Estado de sincronización
    isSynced: manager.isInitialSyncTriggered(),
    canSync: manager.canSync(),
    
    // Acciones de sincronización
    syncWithServer,
    
    // Estado del manager
    manager
  };
}; 