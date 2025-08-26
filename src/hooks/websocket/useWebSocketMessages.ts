import { useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useRateLimiter } from '../../hooks/useRateLimiter';
import { useChatStore } from '../../stores/useChatStore';
import { infoLog } from '../../config/logger';
import type { Message, Conversation } from '../../types';

// Tipos para validación de mensajes
interface MessageData {
  conversationId: string;
  message: {
    id: string;
    content: string;
    senderIdentifier: string;
    recipientIdentifier?: string;
    timestamp: string;
    type?: string;
    metadata?: Record<string, unknown>;
    mediaUrl?: string;
  };
}

interface ContactInfo {
  profileName?: string;
  phoneNumber?: string;
}

interface SendMessageData {
  conversationId: string;
  content: string;
  type?: string;
  metadata?: Record<string, unknown>;
}

// Validación de mensajes
const validateMessage = (data: MessageData): boolean => {
  if (!data.conversationId || typeof data.conversationId !== 'string') {
    infoLog('❌ Mensaje inválido: conversationId faltante o inválido');
    return false;
  }

  if (!data.message || typeof data.message !== 'object') {
    infoLog('❌ Mensaje inválido: objeto message faltante');
    return false;
  }

  const { message } = data;
  
  if (!message.id || typeof message.id !== 'string') {
    infoLog('❌ Mensaje inválido: message.id faltante o inválido');
    return false;
  }

  if (!message.content || typeof message.content !== 'string') {
    infoLog('❌ Mensaje inválido: message.content faltante o inválido');
    return false;
  }

  // VALIDACIÓN CORREGIDA: Usar senderIdentifier en lugar de sender
  if (!message.senderIdentifier || typeof message.senderIdentifier !== 'string') {
    infoLog('❌ Mensaje inválido: message.senderIdentifier faltante o inválido');
    return false;
  }

  if (!message.timestamp || typeof message.timestamp !== 'string') {
    infoLog('❌ Mensaje inválido: message.timestamp faltante o inválido');
    return false;
  }

  return true;
};

// Validación de datos de envío
const validateSendData = (data: SendMessageData): boolean => {
  if (!data.conversationId || typeof data.conversationId !== 'string') {
    infoLog('❌ Datos de envío inválidos: conversationId faltante o inválido');
    return false;
  }

  if (!data.content || typeof data.content !== 'string') {
    infoLog('❌ Datos de envío inválidos: content faltante o inválido');
    return false;
  }

  if (data.content.trim().length === 0) {
    infoLog('❌ Datos de envío inválidos: content vacío');
    return false;
  }

  return true;
};

export const useWebSocketMessages = (socket: Socket | null) => {
  const { addMessage, updateConversation } = useChatStore();
  
  // Rate limiter para mensajes
  const rateLimiter = useRateLimiter({
    maxRequests: 5,
    timeWindow: 3000,
    retryDelay: 1000
  });

  // Enviar mensaje con validación
  const sendMessage = useCallback((
    conversationId: string, 
    content: string, 
    type: string = 'text', 
    metadata?: Record<string, unknown>
  ): boolean => {
    if (!socket || !socket.connected) {
      infoLog('⚠️ WebSocket no conectado, no se puede enviar mensaje');
      return false;
    }

    const sendData: SendMessageData = {
      conversationId,
      content: content.trim(),
      type,
      metadata
    };

    if (!validateSendData(sendData)) {
      return false;
    }

    const success = rateLimiter.makeRequest(() => {
      socket.emit('new-message', {
        ...sendData,
        timestamp: new Date().toISOString()
      });
    });

    if (!success) {
      infoLog('⚠️ Rate limit alcanzado para envío de mensajes');
      return false;
    }

    infoLog(`📤 Mensaje enviado: ${conversationId} - ${content.substring(0, 50)}...`);
    return true;
  }, [socket, rateLimiter]);

  // Marcar mensajes como leídos
  const markMessagesAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    if (!socket || !socket.connected) {
      infoLog('⚠️ WebSocket no conectado, no se pueden marcar mensajes como leídos');
      return;
    }

    if (!conversationId || !messageIds || messageIds.length === 0) {
      infoLog('❌ Datos inválidos para marcar como leído');
      return;
    }

    const success = rateLimiter.makeRequest(() => {
      socket.emit('mark-read', {
        conversationId,
        messageIds,
        timestamp: new Date().toISOString()
      });
    });

    if (!success) {
      infoLog('⚠️ Rate limit alcanzado para marcar mensajes como leídos');
      return;
    }

    infoLog(`✅ Mensajes marcados como leídos: ${conversationId} - ${messageIds.length} mensajes`);
  }, [socket, rateLimiter]);

  // Procesar mensaje recibido con validación y integración con store
  const processReceivedMessage = useCallback((data: MessageData) => {
    if (!validateMessage(data)) {
      return;
    }

    const { conversationId, message } = data;
    
    // Convertir a formato del store
    const messageForStore: Message = {
      id: message.id,
      conversationId,
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

    // Agregar al store
    addMessage(conversationId, messageForStore);
    
    // Actualizar conversación con último mensaje
    const lastMessage = {
      messageId: message.id,
      sender: message.senderIdentifier, // CORREGIDO: Usar senderIdentifier
      content: message.content,
      type: (message.type as 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker') || 'text',
      timestamp: message.timestamp,
      direction: 'inbound' as const,
      status: 'received' as const
    };
    
    // NUEVO: Extraer información del contacto del mensaje si está disponible
    const contactInfo = message.metadata?.contact as ContactInfo | undefined;
    const conversationUpdates: Partial<Conversation> = {
      lastMessage,
      lastMessageAt: message.timestamp
      // Removido: unreadCount: 0 - esto causaba problemas de sincronización
    };

    // Actualizar información del contacto si está disponible en el mensaje
    if (contactInfo) {
      if (contactInfo.profileName) {
        conversationUpdates.customerName = contactInfo.profileName;
        conversationUpdates.contact = {
          name: contactInfo.profileName,
          phoneNumber: contactInfo.phoneNumber || message.senderIdentifier
        };
      }
      if (contactInfo.phoneNumber) {
        conversationUpdates.customerPhone = contactInfo.phoneNumber;
      }
    }

    // SOLUCIONADO: No resetear el unreadCount aquí, solo actualizar el último mensaje
    // El unreadCount se manejará correctamente cuando el usuario entre a la conversación
    updateConversation(conversationId, conversationUpdates);

    infoLog(`📨 Mensaje procesado: ${conversationId} - ${message.content.substring(0, 50)}...`);
  }, [addMessage, updateConversation]);

  // Escuchar eventos de mensajes del socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: MessageData) => {
      infoLog('📨 Nuevo mensaje recibido via WebSocket');
      
      // NUEVO: Log específico para detectar mensajes de imagen
      if (data.message.type === 'image' || data.message.type === 'system') {
        console.log('🖼️ [useWebSocketMessages] Mensaje de imagen recibido:', {
          type: data.message.type,
          content: data.message.content,
          mediaUrl: data.message.mediaUrl,
          metadata: data.message.metadata
        });
      }
      
      processReceivedMessage(data);
    };

    const handleMessageRead = (data: { conversationId: string; messageIds: string[] }) => {
      infoLog(`✅ Mensajes marcados como leídos via WebSocket: ${data.conversationId}`);
      // Aquí podrías actualizar el estado de los mensajes si es necesario
    };

    const handleMessageError = (error: { conversationId: string; error: string }) => {
      infoLog(`❌ Error en mensaje: ${error.conversationId} - ${error.error}`);
    };

    // Registrar listeners
    socket.on('new-message', handleNewMessage);
    socket.on('message-read', handleMessageRead);
    socket.on('message-error', handleMessageError);

    // Cleanup
    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-read', handleMessageRead);
      socket.off('message-error', handleMessageError);
    };
  }, [socket, processReceivedMessage]);

  return {
    sendMessage,
    markMessagesAsRead,
    processReceivedMessage
  };
}; 