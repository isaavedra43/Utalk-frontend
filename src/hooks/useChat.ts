import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import api from '../services/api';
import { sanitizeConversationId, logConversationId, encodeConversationIdForUrl } from '../utils/conversationUtils';
import { messagesCache, generateCacheKey } from '../utils/cacheUtils';
import { retryWithBackoff, generateOperationKey, rateLimitBackoff } from '../utils/retryUtils';

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker';
  direction: 'inbound' | 'outbound';
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  readAt?: string;
  metadata?: Record<string, unknown>;
}

interface Conversation {
  id: string;
  title: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export const useChat = (conversationId: string) => {
  const {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    sendMessage: socketSendMessage,
    markMessagesAsRead,
    typingUsers,
    on,
    off
  } = useWebSocketContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optimisticMessagesRef = useRef<Set<string>>(new Set());
  const joinAttemptedRef = useRef(false); // NUEVO: Flag para evitar múltiples intentos de join
  const cleanupRef = useRef(false); // NUEVO: Flag para evitar cleanup múltiple
  
  // Cargar mensajes iniciales con cache y retry
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      setError(`ID de conversación inválido: ${conversationId}`);
      return;
    }

    // CORREGIDO: Codificar conversationId para URL
    const encodedId = encodeConversationIdForUrl(sanitizedId);

    // Verificar cache primero
    const cacheKey = generateCacheKey('messages', { conversationId: sanitizedId, limit: 50 });
    const cachedMessages = messagesCache.get<Message[]>(cacheKey);
    
    if (cachedMessages) {
      console.log('📋 useChat - Mensajes cargados desde cache:', cachedMessages.length);
      const filteredMessages = cachedMessages.filter((msg: Message) => !optimisticMessagesRef.current.has(msg.id));
      setMessages(filteredMessages);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      logConversationId(sanitizedId, 'loadMessages');
      
      // Usar retry con backoff para la carga de mensajes
      const operationKey = generateOperationKey('loadMessages', { conversationId: sanitizedId });
      const response = await retryWithBackoff(
        () => api.get(`/api/messages?conversationId=${encodedId}&limit=50`),
        operationKey,
        rateLimitBackoff
      );
      
      const loadedMessages = response.data.data.messages || [];
      
      // Guardar en cache
      messagesCache.set(cacheKey, loadedMessages, 60000); // 1 minuto de cache
      
      // SOLUCIONADO: Agregar log para verificar que los mensajes se cargaron
      console.log('📋 useChat - Mensajes cargados desde API:', {
        totalMessages: loadedMessages.length,
        conversationId: sanitizedId,
        cacheKey
      });
      
      // Filtrar mensajes optimistas que ya fueron confirmados
      const filteredMessages = loadedMessages.filter((msg: Message) => !optimisticMessagesRef.current.has(msg.id));
      
      // SOLUCIONADO: Agregar log para verificar el filtrado
      console.log('📋 useChat - Mensajes después del filtrado:', {
        originalCount: loadedMessages.length,
        filteredCount: filteredMessages.length,
        optimisticCount: optimisticMessagesRef.current.size
      });
      
      setMessages(filteredMessages);
      
      // Scroll al final después de cargar mensajes
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      console.error('Error cargando mensajes:', err);
      setError(err instanceof Error ? err.message : 'Error cargando mensajes');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Cargar conversación con cache y retry
  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      setError(`ID de conversación inválido: ${conversationId}`);
      return;
    }

    // CORREGIDO: Codificar conversationId para URL
    const encodedId = encodeConversationIdForUrl(sanitizedId);

    // Verificar cache primero
    const cacheKey = generateCacheKey('conversation', { conversationId: sanitizedId });
    const cachedConversation = messagesCache.get<Conversation>(cacheKey);
    
    if (cachedConversation) {
      console.log('📋 useChat - Conversación cargada desde cache');
      setConversation(cachedConversation);
      return;
    }

    try {
      logConversationId(sanitizedId, 'loadConversation');
      
      // Usar retry con backoff para la carga de conversación
      const operationKey = generateOperationKey('loadConversation', { conversationId: sanitizedId });
      const response = await retryWithBackoff(
        () => api.get(`/api/conversations/${encodedId}`),
        operationKey,
        rateLimitBackoff
      );
      
      const conversationData = response.data;
      
      // Guardar en cache
      messagesCache.set(cacheKey, conversationData, 300000); // 5 minutos de cache
      
      setConversation(conversationData);
    } catch (err: unknown) {
      console.error('Error cargando conversación:', err);
      setError(err instanceof Error ? err.message : 'Error cargando conversación');
    }
  }, [conversationId]);

  // SOLUCIONADO: Unirse a conversación solo una vez cuando se conecta
  useEffect(() => {
    // Solo ejecutar si está conectado, hay conversationId, no está unido y no se ha intentado antes
    if (isConnected && conversationId && !isJoined && !joinAttemptedRef.current) {
      // Validar y sanitizar el ID de conversación
      const sanitizedId = sanitizeConversationId(conversationId);
      if (!sanitizedId) {
        console.error('❌ useChat - ID de conversación inválido:', conversationId);
        setError(`ID de conversación inválido: ${conversationId}`);
        return;
      }

      joinAttemptedRef.current = true; // Marcar como intentado

      const joinOperation = async () => {
        try {
          console.log('🔗 useChat - Uniéndose a conversación:', sanitizedId);
          logConversationId(sanitizedId, 'joinConversation');
          
          // Unirse sin throttling para evitar el ciclo
          joinConversation(sanitizedId);
          
          // Cargar datos después de unirse
          await loadMessages();
          await loadConversation();
          
          // SOLUCIONADO: Establecer isJoined después de cargar los mensajes exitosamente
          // Esto asegura que el componente se renderice correctamente
          console.log('✅ useChat - Mensajes cargados, estableciendo isJoined como true');
          setIsJoined(true);
          
        } catch (error) {
          console.error('❌ useChat - Error uniéndose a conversación:', error);
          setError('Error uniéndose a conversación');
          joinAttemptedRef.current = false; // Resetear flag en caso de error
        }
      };

      joinOperation();
    }
  }, [isConnected, conversationId, isJoined, joinConversation, loadMessages, loadConversation]);

  // NUEVO: Mejorar el manejo de estado cuando los mensajes se cargan exitosamente
  useEffect(() => {
    // Si los mensajes se cargaron correctamente pero isJoined sigue siendo false,
    // establecer isJoined como true para permitir el renderizado
    if (messages.length > 0 && !isJoined && !loading) {
      console.log('✅ useChat - Mensajes cargados exitosamente, estableciendo isJoined como true');
      setIsJoined(true);
    }
  }, [messages.length, isJoined, loading]);

  // NUEVO: Log para monitorear cambios en el estado de mensajes
  useEffect(() => {
    console.log('📊 useChat - Estado de mensajes actualizado:', {
      messagesCount: messages.length,
      isJoined,
      loading,
      conversationId
    });
  }, [messages.length, isJoined, loading, conversationId]);

  // SOLUCIONADO: Salir de conversación solo al desmontar
  useEffect(() => {
    return () => {
      if (conversationId && isConnected && !cleanupRef.current) {
        cleanupRef.current = true; // Marcar como que ya se limpió
        
        // Validar y sanitizar el ID de conversación
        const sanitizedId = sanitizeConversationId(conversationId);
        if (sanitizedId) {
          const leaveOperation = async () => {
            try {
              console.log('🔌 useChat - Saliendo de conversación:', sanitizedId);
              logConversationId(sanitizedId, 'leaveConversation');
              setIsJoined(false);
              
              // Salir sin throttling para evitar el ciclo
              leaveConversation(sanitizedId);
            } catch (error) {
              console.error('❌ useChat - Error saliendo de conversación:', error);
            }
          };

          leaveOperation();
        }
      }
    };
  }, [conversationId, leaveConversation, isConnected]);

  // ESCUCHAR CONFIRMACIONES DE CONVERSACIÓN - CRÍTICO
  useEffect(() => {
    const handleConversationJoined = (e: CustomEvent) => {
      const eventData = e.detail as { conversationId: string; roomId: string; onlineUsers: string[]; timestamp: string };
      if (eventData.conversationId === conversationId) {
        console.log('✅ useChat - Confirmado unido a conversación:', conversationId);
        setIsJoined(true);
      }
    };

    const handleConversationLeft = (e: CustomEvent) => {
      const eventData = e.detail as { conversationId: string; timestamp: string };
      if (eventData.conversationId === conversationId) {
        console.log('✅ useChat - Confirmado salido de conversación:', conversationId);
        setIsJoined(false);
      }
    };

    const handleWebSocketError = (e: CustomEvent) => {
      const errorData = e.detail as { error: string; message: string; conversationId?: string };
      if (errorData.conversationId === conversationId) {
        console.error('❌ useChat - Error del servidor:', errorData);
        setError(errorData.message);
      }
    };

    // Registrar listeners de eventos personalizados
    window.addEventListener('conversation:joined', handleConversationJoined as EventListener);
    window.addEventListener('conversation:left', handleConversationLeft as EventListener);
    window.addEventListener('websocket:error', handleWebSocketError as EventListener);

    return () => {
      // Limpiar listeners
      window.removeEventListener('conversation:joined', handleConversationJoined as EventListener);
      window.removeEventListener('conversation:left', handleConversationLeft as EventListener);
      window.removeEventListener('websocket:error', handleWebSocketError as EventListener);
    };
  }, [conversationId]);

  // Configurar listeners de socket para esta conversación
  useEffect(() => {
    if (!socket || !conversationId || !isConnected) return;

    console.log('🎧 useChat - Configurando listeners para conversación:', conversationId);

    const handleNewMessage = (data: unknown) => {
      const messageData = data as { conversationId: string; message: Message };
      console.log('📨 useChat - Nuevo mensaje recibido:', messageData);
      
      if (messageData.conversationId === conversationId) {
        setMessages(prev => {
          // Evitar duplicados
          const exists = prev.some(msg => msg.id === messageData.message.id);
          if (exists) {
            console.log('📨 useChat - Mensaje duplicado, ignorando:', messageData.message.id);
            return prev;
          }
          
          console.log('📨 useChat - Agregando nuevo mensaje:', messageData.message);
          return [...prev, messageData.message];
        });
        // Scroll al final después de nuevo mensaje
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    const handleMessageSent = (data: unknown) => {
      const sentData = data as { conversationId: string; message: { id: string; status: string } };
      console.log('✅ useChat - Mensaje enviado confirmado:', sentData);
      
      if (sentData.conversationId === conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === sentData.message.id 
              ? { ...msg, status: sentData.message.status as Message['status'] }
              : msg
          )
        );
        
        // Remover de mensajes optimistas
        optimisticMessagesRef.current.delete(sentData.message.id);
      }
    };

    const handleMessageDelivered = (data: unknown) => {
      const deliveredData = data as { conversationId: string; messageId: string };
      console.log('📬 useChat - Mensaje entregado:', deliveredData);
      
      if (deliveredData.conversationId === conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === deliveredData.messageId 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        );
      }
    };

    const handleMessageRead = (data: unknown) => {
      const readData = data as { conversationId: string; messageIds: string[] };
      console.log('👁️ useChat - Mensajes leídos:', readData);
      
      if (readData.conversationId === conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            readData.messageIds.includes(msg.id)
              ? { ...msg, status: 'read', readAt: new Date().toISOString() }
              : msg
          )
        );
      }
    };

    const handleTyping = (data: unknown) => {
      const typingData = data as { conversationId: string; userEmail: string };
      console.log('✍️ useChat - Usuario escribiendo:', typingData);
      
      if (typingData.conversationId === conversationId) {
        // El context ya maneja typingUsers globalmente
      }
    };

    const handleTypingStop = (data: unknown) => {
      const typingStopData = data as { conversationId: string; userEmail: string };
      console.log('⏹️ useChat - Usuario dejó de escribir:', typingStopData);
      
      if (typingStopData.conversationId === conversationId) {
        // El context ya maneja typingUsers globalmente
      }
    };

    const handleConversationUpdate = (data: unknown) => {
      const updateData = data as { conversationId: string; updates: Partial<Conversation> };
      console.log('🔄 useChat - Conversación actualizada:', updateData);
      
      if (updateData.conversationId === conversationId) {
        setConversation(prev => prev ? { ...prev, ...updateData.updates } : null);
      }
    };

    // Registrar todos los listeners
    on('new-message', handleNewMessage);
    on('message-sent', handleMessageSent);
    on('message-delivered', handleMessageDelivered);
    on('message-read', handleMessageRead);
    on('typing', handleTyping);
    on('typing-stop', handleTypingStop);
    on('conversation-event', handleConversationUpdate);

    // SOLUCIONADO: Solo limpiar listeners al desmontar el componente
    // No limpiar en cada re-render para evitar el ciclo
    return () => {
      // Solo limpiar si el componente se está desmontando
      if (cleanupRef.current) {
        console.log('🎧 useChat - Limpiando listeners para conversación:', conversationId);
        // Limpiar todos los listeners
        off('new-message');
        off('message-sent');
        off('message-delivered');
        off('message-read');
        off('typing');
        off('typing-stop');
        off('conversation-event');
      }
    };
  }, [socket, conversationId, on, off, isConnected]); // Removido isJoined de las dependencias

  // Enviar mensaje con optimistic updates y retry
  const sendMessage = useCallback(async (content: string, type: string = 'text', metadata: Record<string, unknown> = {}) => {
    if (!conversationId || !content.trim() || !isJoined) return;

    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      setError(`ID de conversación inválido: ${conversationId}`);
      return;
    }

    // CORREGIDO: Codificar conversationId para URL
    const encodedId = encodeConversationIdForUrl(sanitizedId);

    try {
      setSending(true);
      setError(null);

      // Crear mensaje optimista
      const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const optimisticMessage: Message = {
        id: optimisticId,
        content,
        type: type as Message['type'],
        direction: 'outbound',
        timestamp: new Date().toISOString(),
        status: 'sending',
        metadata
      };

      // Agregar a mensajes optimistas
      optimisticMessagesRef.current.add(optimisticId);

      // Agregar mensaje optimista inmediatamente
      setMessages(prev => [...prev, optimisticMessage]);
      // Scroll al final después de agregar mensaje optimista
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Enviar por WebSocket (tiempo real)
      console.log('🚀 Enviando mensaje por WebSocket:', { conversationId: sanitizedId, content, type, metadata });
      
      socketSendMessage(sanitizedId, content, type, metadata);

      // También enviar por API para persistencia con retry
      try {
        console.log('💾 Guardando mensaje en API');
        
        const operationKey = generateOperationKey('sendMessage', { 
          conversationId: sanitizedId, 
          content: content.substring(0, 50) // Usar solo los primeros 50 caracteres para la clave
        });
        
        const apiResponse = await retryWithBackoff(
          () => api.post(`/api/conversations/${encodedId}/messages`, {
            content,
            type,
            metadata
          }),
          operationKey,
          rateLimitBackoff
        );

        // Actualizar mensaje optimista con datos reales
        const realMessage = apiResponse.data;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticId 
              ? { ...realMessage, status: 'sent' }
              : msg
          )
        );

        // Remover de mensajes optimistas
        optimisticMessagesRef.current.delete(optimisticId);

        console.log('✅ Mensaje enviado exitosamente');
      } catch (apiError) {
        console.error('❌ Error enviando por API:', apiError);
        
        // Marcar como error si falla la API
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticId 
              ? { ...msg, status: 'failed' }
              : msg
          )
        );

        // Remover de mensajes optimistas
        optimisticMessagesRef.current.delete(optimisticId);
        
        throw new Error('Error guardando mensaje en el servidor');
      }

    } catch (error: unknown) {
      console.error('❌ Error enviando mensaje:', error);
      setError(error instanceof Error ? error.message : 'Error enviando mensaje');
    } finally {
      setSending(false);
    }
  }, [conversationId, socketSendMessage, isJoined]);

  // Indicar escritura con debouncing
  const handleTyping = useCallback(() => {
    if (!conversationId || !isConnected || !isJoined) return;

    if (!isTyping) {
      setIsTyping(true);
      console.log('✍️ Iniciando indicador de escritura');
      startTyping(conversationId);
    }

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing después de 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      console.log('⏹️ Deteniendo indicador de escritura (timeout)');
      stopTyping(conversationId);
    }, 3000);
  }, [conversationId, isConnected, isTyping, startTyping, stopTyping, isJoined]);

  // Detener escritura
  const handleStopTyping = useCallback(() => {
    if (!conversationId || !isConnected) return;

    setIsTyping(false);
    console.log('⏹️ Deteniendo indicador de escritura');
    stopTyping(conversationId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId, isConnected, stopTyping]);

  // Marcar mensajes como leídos
  const markAsRead = useCallback((messageIds: string[]) => {
    if (!conversationId || !messageIds.length || !isConnected) return;

    console.log('👁️ Marcando mensajes como leídos:', messageIds);
    
    // Actualizar estado local inmediatamente
    setMessages(prev => 
      prev.map(msg => 
        messageIds.includes(msg.id)
          ? { ...msg, status: 'read', readAt: new Date().toISOString() }
          : msg
      )
    );

    // Enviar al servidor
    markMessagesAsRead(conversationId, messageIds);
  }, [conversationId, isConnected, markMessagesAsRead]);

  // Scroll al final
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Función para reenviar mensaje fallido
  const retryMessage = useCallback((messageId: string) => {
    const failedMessage = messages.find(msg => msg.id === messageId);
    if (failedMessage && failedMessage.status === 'failed') {
      console.log('🔄 Reintentando mensaje:', messageId);
      
      // Remover mensaje fallido
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Reenviar
      sendMessage(failedMessage.content, failedMessage.type, failedMessage.metadata);
    }
  }, [messages, sendMessage]);

  // Función para eliminar mensaje optimista
  const deleteOptimisticMessage = useCallback((messageId: string) => {
    console.log('🗑️ Eliminando mensaje optimista:', messageId);
    
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    optimisticMessagesRef.current.delete(messageId);
  }, []);

  // Función de limpieza memoizada
  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Limpiar mensajes optimistas
    optimisticMessagesRef.current.clear();
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Datos
    messages,
    conversation,
    typingUsers: typingUsers.get(conversationId) || new Set(),
    
    // Estados
    loading,
    error,
    sending,
    isTyping,
    isConnected,
    isJoined,
    
    // Acciones
    sendMessage,
    handleTyping,
    handleStopTyping,
    markAsRead,
    retryMessage,
    deleteOptimisticMessage,
    
    // Utilidades
    scrollToBottom,
    messagesEndRef,
    refresh: loadMessages
  };
}; 