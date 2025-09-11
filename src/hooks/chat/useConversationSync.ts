import { useEffect, useCallback, useMemo } from 'react';
import { useWebSocketContext } from '../../contexts/useWebSocketContext';
import { useChatStore } from '../../stores/useChatStore';
import { useAuthContext } from '../../contexts/useAuthContext';
import { ConversationManager } from '../../services/ConversationManager';
import { assignmentService } from '../../services/assignments';
import { infoLog } from '../../config/logger';
import { createThrottledCallback, EVENT_THROTTLE_CONFIGS } from '../../utils/eventThrottler';
import type { Message, Conversation } from '../../types';

// Tipos para validación de mensajes de webhook
interface WebhookMessageData {
  conversationId?: string;
  message?: {
    id?: string;
    content?: string;
    senderIdentifier?: string;
    recipientIdentifier?: string;
    timestamp?: string;
    type?: string;
    metadata?: Record<string, unknown>;
    mediaUrl?: string;
  };
  isNewConversation?: boolean;
}

interface ContactInfo {
  profileName?: string;
  phoneNumber?: string;
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

  // VALIDACIÓN CORREGIDA: Usar senderIdentifier en lugar de sender
  if (!message.senderIdentifier || typeof message.senderIdentifier !== 'string') {
    infoLog('❌ Mensaje de webhook inválido: message.senderIdentifier faltante o inválido');
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
      agentId: message.senderIdentifier, // CORREGIDO: Usar senderIdentifier
      ip: 'unknown',
      requestId: 'unknown',
      sentBy: message.senderIdentifier, // CORREGIDO: Usar senderIdentifier
      source: 'web',
      timestamp: message.timestamp,
      ...message.metadata
    },
    status: 'received',
    recipientIdentifier: message.recipientIdentifier, // CORREGIDO: Usar recipientIdentifier del mensaje
    senderIdentifier: message.senderIdentifier, // CORREGIDO: Usar senderIdentifier
    userAgent: undefined
  };

  return transformedMessage;
};

export const useConversationSync = () => {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { on, off, isConnected, syncState } = useWebSocketContext();
  
  const { addMessage, updateConversation, addConversation } = useChatStore();

  // NUEVO: Función para asignar conversación a todos los agentes activos
  const assignToAllActiveAgents = useCallback(async (conversationId: string) => {
    try {
      infoLog(`🔄 Asignando conversación ${conversationId} a todos los agentes activos...`);
      
      // Obtener todos los agentes activos
      const activeAgents = await assignmentService.getAvailableAgents();
      
      if (activeAgents.length === 0) {
        infoLog('⚠️ No hay agentes activos disponibles para asignación');
        return;
      }
      
      infoLog(`👥 Encontrados ${activeAgents.length} agentes activos:`, activeAgents.map(agent => agent.name));
      
      // Asignar a cada agente activo
      const assignmentPromises = activeAgents.map(async (agent) => {
        try {
          const result = await assignmentService.assignConversation(
            conversationId, 
            agent.email, 
            agent.role
          );
          
          if (result.success) {
            infoLog(`✅ Agente ${agent.name} (${agent.email}) asignado exitosamente`);
          } else {
            infoLog(`❌ Error asignando agente ${agent.name}: ${result.message}`);
          }
          
          return result;
        } catch (error) {
          infoLog(`❌ Error asignando agente ${agent.name}:`, error);
          return { success: false, error };
        }
      });
      
      // Esperar a que todas las asignaciones se completen
      const results = await Promise.allSettled(assignmentPromises);
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      infoLog(`🎯 Asignación completada: ${successful}/${activeAgents.length} agentes asignados exitosamente`);
      
    } catch (error) {
      infoLog('❌ Error en asignación automática a agentes:', error);
    }
  }, []);

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
        
        // NUEVO: Extraer información del contacto del mensaje si está disponible
        const contactInfo = data.message.metadata?.contact as ContactInfo | undefined;
        const conversationUpdates: Partial<Conversation> = {
          lastMessage,
          lastMessageAt: validatedMessage.createdAt
        };

        // Actualizar información del contacto si está disponible en el mensaje
        if (contactInfo) {
          if (contactInfo.profileName) {
            conversationUpdates.customerName = contactInfo.profileName;
            conversationUpdates.contact = {
              name: contactInfo.profileName,
              phoneNumber: contactInfo.phoneNumber || data.message.senderIdentifier || 'unknown'
            };
          }
          if (contactInfo.phoneNumber) {
            conversationUpdates.customerPhone = contactInfo.phoneNumber;
          }
        }

        // SOLUCIONADO: NO crear conversaciones nuevas aquí para evitar duplicación
        // Solo actualizar conversaciones existentes
        if (!data.isNewConversation) {
          updateConversation(data.conversationId, conversationUpdates);
          infoLog(`📨 Mensaje de WebSocket procesado: ${data.conversationId} - ${validatedMessage.content.substring(0, 50)}...`);
        } else {
          infoLog(`🔄 Conversación nueva detectada en WebSocket, delegando a webhook handler: ${data.conversationId}`);
        }
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
      // NUEVO: Log específico para detectar mensajes de imagen
      if (data.message.type === 'image' || data.message.type === 'system') {
        console.log('🖼️ [useConversationSync] Mensaje de imagen recibido:', {
          type: data.message.type,
          content: data.message.content,
          mediaUrl: data.message.mediaUrl,
          metadata: data.message.metadata
        });
      }
      
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
        
        // NUEVO: Extraer información del contacto del mensaje si está disponible
        const contactInfo = data.message.metadata?.contact as ContactInfo | undefined;
        const conversationUpdates: Partial<Conversation> = {
          lastMessage,
          lastMessageAt: validatedMessage.createdAt
        };

        // Actualizar información del contacto si está disponible en el mensaje
        if (contactInfo) {
          if (contactInfo.profileName) {
            conversationUpdates.customerName = contactInfo.profileName;
            conversationUpdates.contact = {
              name: contactInfo.profileName,
              phoneNumber: contactInfo.phoneNumber || data.message.senderIdentifier || 'unknown'
            };
          }
          if (contactInfo.phoneNumber) {
            conversationUpdates.customerPhone = contactInfo.phoneNumber;
          }
        }

        // NUEVO: Si es una conversación nueva, crearla en lugar de actualizarla
        if (data.isNewConversation) {
          // Crear nueva conversación con los datos del mensaje
          const newConversation: Conversation = {
            id: data.conversationId,
            customerName: contactInfo?.profileName || 'Cliente sin nombre',
            customerPhone: contactInfo?.phoneNumber || data.message.senderIdentifier || 'unknown',
            contact: {
              name: contactInfo?.profileName || 'Cliente sin nombre',
              phoneNumber: contactInfo?.phoneNumber || data.message.senderIdentifier || 'unknown'
            },
            status: 'open',
            messageCount: 1,
            unreadCount: 1,
            participants: [data.message.senderIdentifier || 'unknown', 'admin@company.com'],
            tenantId: 'default_tenant',
            workspaceId: 'default_workspace',
            createdAt: validatedMessage.createdAt,
            updatedAt: validatedMessage.createdAt,
            lastMessageAt: validatedMessage.createdAt,
            lastMessage,
            priority: 'medium',
            tags: []
          };
          
          addConversation(newConversation);
          infoLog(`🆕 Nueva conversación creada: ${data.conversationId}`);
          
          // NUEVO: Asignar automáticamente a todos los agentes activos
          assignToAllActiveAgents(data.conversationId);
        } else {
          updateConversation(data.conversationId, conversationUpdates);
        }
        
        infoLog(`🎯 Mensaje de webhook procesado: ${data.conversationId} - ${validatedMessage.content.substring(0, 50)}...`);
      }
    }
  }, [addMessage, updateConversation, addConversation, assignToAllActiveAgents]);

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

    // Registrar listeners para eventos de conversación con throttling
    on('conversation-event', createThrottledCallback('conversation-event', handleConversationEvent, EVENT_THROTTLE_CONFIGS['conversation-event']));
    on('new-message', createThrottledCallback('new-message', handleNewMessage, EVENT_THROTTLE_CONFIGS['new-message']));
    on('message-read', createThrottledCallback('message-read', handleMessageRead, EVENT_THROTTLE_CONFIGS['message-read']));
    on('conversation-joined', createThrottledCallback('conversation-joined', handleConversationJoined, EVENT_THROTTLE_CONFIGS['conversation-joined']));
    on('conversation-left', createThrottledCallback('conversation-left', handleConversationLeft, EVENT_THROTTLE_CONFIGS['conversation-left']));
    on('state-synced', createThrottledCallback('state-synced', handleStateSynced, EVENT_THROTTLE_CONFIGS['state-synced']));
    
    // Registrar listeners para eventos de webhook con throttling
    on('webhook:conversation-created', createThrottledCallback('webhook:conversation-created', handleWebhookConversationCreated, EVENT_THROTTLE_CONFIGS['webhook:conversation-created']));
    on('webhook:new-message', createThrottledCallback('webhook:new-message', handleWebhookNewMessage, EVENT_THROTTLE_CONFIGS['webhook:new-message']));
    
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