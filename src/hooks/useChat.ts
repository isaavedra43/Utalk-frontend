import { useState, useEffect, useCallback, useRef } from 'react';
import { infoLog } from '../config/logger';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuthContext } from '../contexts/useAuthContext';
import { 
  sanitizeConversationId, 
  normalizeConversationId,
  logConversationId, 
  encodeConversationIdForUrl,
  extractPhonesFromConversationId
} from '../utils/conversationUtils';
import { messagesCache, generateCacheKey } from '../utils/cacheUtils';
import { retryWithBackoff, generateOperationKey, rateLimitBackoff } from '../utils/retryUtils';
import api from '../services/api';
import { messagesService } from '../services/messages';
import { conversationsService } from '../services/conversations';
import { useChatStore } from '../stores/useChatStore';
import type { Conversation, Message } from '../types';





export const useChat = (conversationId: string) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUser } = useAuthContext();
  
  // VALIDAR conversationId pero NO hacer return temprano
  const isValidConversationId = !!(conversationId && typeof conversationId === 'string' && conversationId.trim() !== '');
  
  const {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    typingUsers,
    on,
    off
  } = useWebSocketContext();

  // Estabilizar leaveConversation para cumplir exhaustiveness del linter
  const leaveConversationStableRef = useRef(leaveConversation);
  useEffect(() => { leaveConversationStableRef.current = leaveConversation; }, [leaveConversation]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false); // CAMBIADO: Inicializar como false
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optimisticMessagesRef = useRef<Set<string>>(new Set());
  const joinAttemptedRef = useRef(false);
  const cleanupRef = useRef(false);
  const currentConversationIdRef = useRef<string | null>(null); // NUEVO: Trackear conversationId actual
  const sendMessageInProgressRef = useRef(false); // SOLUCIONADO: Protección contra doble envío

  // NUEVO: Resetear estado cuando cambia conversationId con señal anti-carrera
  const activeRequestTokenRef = useRef<number>(0);
  useEffect(() => {
    if (currentConversationIdRef.current !== conversationId) {
      infoLog('🔄 useChat - Cambio de conversación detectado:', {
        anterior: currentConversationIdRef.current,
        nueva: conversationId
      });

      const token = Date.now();
      activeRequestTokenRef.current = token;

      // Limpiar estado anterior
      setMessages([]);
      setConversation(null);
      setLoading(false);
      setError(null);
      setIsJoined(false);
      joinAttemptedRef.current = false;
      cleanupRef.current = false;

      currentConversationIdRef.current = conversationId;
    }
  }, [conversationId]);

  // CORREGIDO: Solo cargar mensajes si hay conversationId válido
  const loadMessages = useCallback(async () => {
    if (!conversationId || !conversationId.trim()) {
      infoLog('ℹ️ useChat - No hay conversationId, saltando carga de mensajes');
      setLoading(false);
      return;
    }

    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      setError(`ID de conversación inválido: ${conversationId}`);
      setLoading(false);
      return;
    }

    // CORREGIDO: Codificar conversationId para URL para preservar los +
    const apiId = encodeConversationIdForUrl(sanitizedId);

    // Verificar cache primero
    const cacheKey = generateCacheKey('messages', { conversationId: sanitizedId, limit: 50 });
    const cachedMessages = messagesCache.get<Message[]>(cacheKey);
    
    if (cachedMessages) {
      // REDUCIDO: Log menos frecuente para evitar spam
      // infoLog('📋 useChat - Mensajes cargados desde cache:', cachedMessages.length);
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
        () => api.get(`/api/messages?conversationId=${apiId}&limit=50`),
        operationKey,
        rateLimitBackoff
      );
      
      const loadedMessages = response.data?.data?.messages ?? [];
      
      // Guardar en cache por 1 minuto
      messagesCache.set(cacheKey, loadedMessages, 60000);
      
      // REDUCIDO: Log menos frecuente para evitar spam
      // infoLog('📋 useChat - Mensajes cargados desde API:', {
      //   totalMessages: loadedMessages.length,
      //   conversationId: sanitizedId,
      //   cacheKey
      // });
      
      // Filtrar mensajes optimistas que ya fueron confirmados
      const filteredMessages = loadedMessages.filter((msg: Message) => !optimisticMessagesRef.current.has(msg.id));
      
      // REDUCIDO: Log menos frecuente para evitar spam
      // infoLog('📋 useChat - Mensajes después del filtrado:', {
      //   originalCount: loadedMessages.length,
      //   filteredCount: filteredMessages.length,
      //   optimisticCount: optimisticMessagesRef.current.size
      // });
      
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
    if (!conversationId || !conversationId.trim()) {
      infoLog('ℹ️ useChat - No hay conversationId, saltando carga de conversación');
      return;
    }

    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      setError(`ID de conversación inválido: ${conversationId}`);
      return;
    }

    // Verificar cache primero
    const cacheKey = generateCacheKey('conversation', { conversationId: sanitizedId });
    const cachedConversation = messagesCache.get<Conversation>(cacheKey);
    
    if (cachedConversation) {
      // REDUCIDO: Log menos frecuente para evitar spam
      // infoLog('📋 useChat - Conversación cargada desde cache');
      setConversation(cachedConversation);
      return;
    }

    try {
      logConversationId(sanitizedId, 'loadConversation');
      
      // Usar retry con backoff para la carga de conversación
      const operationKey = generateOperationKey('loadConversation', { conversationId: sanitizedId });
      const conversationData = await retryWithBackoff(
        () => conversationsService.getConversation(sanitizedId),
        operationKey,
        rateLimitBackoff
      );
      
      // Guardar en cache
      messagesCache.set(cacheKey, conversationData, 300000); // 5 minutos de cache
      
      // Log para verificar que se está cargando la información correcta
      infoLog('✅ useChat - Conversación cargada:', {
        id: conversationData.id,
        customerName: conversationData.customerName,
        customerPhone: conversationData.customerPhone
      });
      
      setConversation(conversationData);
      
      // SOLUCIONADO: Marcar conversación como leída cuando se entra
      // Esto resetea el contador de mensajes no leídos
      useChatStore.getState().markConversationAsRead(sanitizedId);
      
    } catch (err: unknown) {
      infoLog('Error cargando conversación:', err);
      setError(err instanceof Error ? err.message : 'Error cargando conversación');
    }
  }, [conversationId]);

  // CORREGIDO: Unirse a conversación solo cuando hay conversationId válido
  useEffect(() => {
    // SOLUCIONADO: Agregar delay para permitir que WebSocket se conecte después del refresh
    const timeoutId = setTimeout(() => {
      // Solo ejecutar si está conectado, hay conversationId válido, no está unido y no se ha intentado antes
      if (isConnected && conversationId && conversationId.trim() && !isJoined && !joinAttemptedRef.current) {
        // Validar y sanitizar el ID de conversación
        const sanitizedId = sanitizeConversationId(conversationId);
        if (!sanitizedId) {
          // NUEVO: Manejo mejorado de IDs inválidos sin spam de errores
          infoLog('⚠️ useChat - ID de conversación inválido, intentando normalizar:', conversationId);
          
          // Intentar normalizar el ID
          const normalizedId = normalizeConversationId(conversationId);
          if (normalizedId) {
            infoLog('✅ useChat - ID normalizado exitosamente:', normalizedId);
            // Continuar con el ID normalizado
            joinAttemptedRef.current = true;
            
            const joinOperation = async () => {
              try {
                infoLog('🔗 useChat - Uniéndose a conversación normalizada:', normalizedId);
                logConversationId(normalizedId, 'joinConversation');
                
                joinConversation(normalizedId);
                await loadMessages();
                await loadConversation();
                
                infoLog('✅ useChat - Mensajes cargados, estableciendo isJoined como true');
                setIsJoined(true);
                
              } catch (error) {
                infoLog('❌ useChat - Error uniéndose a conversación normalizada:', error);
                setError('Error uniéndose a conversación');
                joinAttemptedRef.current = false;
              }
            };

            joinOperation();
            return;
          } else {
            infoLog('❌ useChat - ID de conversación inválido y no se puede normalizar:', conversationId);
            setError(`ID de conversación inválido: ${conversationId}`);
            return;
          }
        }

        joinAttemptedRef.current = true; // Marcar como intentado

        const joinOperation = async () => {
          try {
            infoLog('🔗 useChat - Uniéndose a conversación:', sanitizedId);
            logConversationId(sanitizedId, 'joinConversation');
            
            // Unirse sin throttling para evitar el ciclo
            joinConversation(sanitizedId);
            
            // Cargar datos después de unirse
            const startToken = activeRequestTokenRef.current;
            await loadMessages();
            if (startToken !== activeRequestTokenRef.current) return; // Ignorar si cambió la conversación
            await loadConversation();
            
            // SOLUCIONADO: Establecer isJoined después de cargar los mensajes exitosamente
            // Esto asegura que el componente se renderice correctamente
            infoLog('✅ useChat - Mensajes cargados, estableciendo isJoined como true');
            setIsJoined(true);
            
          } catch (error) {
            infoLog('❌ useChat - Error uniéndose a conversación:', error);
            setError('Error uniéndose a conversación');
            joinAttemptedRef.current = false; // Resetear flag en caso de error
          }
        };

        joinOperation();
      }
    }, 1000); // SOLUCIONADO: Delay de 1 segundo para permitir que WebSocket se conecte

    // SOLUCIONADO: Limpiar timeout al desmontar
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isConnected, conversationId, isJoined, joinConversation, loadMessages, loadConversation]);

  // NUEVO: Mejorar el manejo de estado cuando los mensajes se cargan exitosamente
  useEffect(() => {
    // Si los mensajes se cargaron correctamente pero isJoined sigue siendo false,
    // establecer isJoined como true para permitir el renderizado
    if (messages.length > 0 && !isJoined && !loading) {
      infoLog('✅ useChat - Mensajes cargados exitosamente, estableciendo isJoined como true');
      setIsJoined(true);
    }
  }, [messages.length, isJoined, loading]);

  // NUEVO: Log para monitorear cambios en el estado de mensajes (REDUCIDO para evitar spam)
  // useEffect(() => {
  //   infoLog('📊 useChat - Estado de mensajes actualizado:', {
  //     messagesCount: messages.length,
  //     isJoined,
  //     loading,
  //     conversationId
  //   });
  // }, [messages.length, isJoined, loading, conversationId]);

  // SOLUCIONADO/ROBUSTO: Salir de conversación solo al desmontar real (ignorar cleanup de Strict Mode)
  const cleanupRunCountRef = useRef(0);
  const lastConversationIdRef = useRef<string | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => { lastConversationIdRef.current = conversationId || null; }, [conversationId]);
  useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);

  useEffect(() => {
    return () => {
      // En desarrollo con Strict Mode, React ejecuta un "unmount simulado" inmediatamente.
      if (import.meta.env.DEV) {
        cleanupRunCountRef.current += 1;
        if (cleanupRunCountRef.current === 1) {
          // Primera limpieza: es el ciclo simulado. No salir de la conversación.
          return;
        }
      }

      const currentId = lastConversationIdRef.current;
      const currentConnected = isConnectedRef.current;

      if (currentId && currentConnected && !cleanupRef.current) {
        cleanupRef.current = true; // Marcar como que ya se limpió

        const sanitizedId = sanitizeConversationId(currentId);
        if (sanitizedId) {
          const leaveOperation = async () => {
            try {
              infoLog('🔌 useChat - Saliendo de conversación:', sanitizedId);
              logConversationId(sanitizedId, 'leaveConversation');
              setIsJoined(false);
              leaveConversationStableRef.current(sanitizedId);
            } catch (error) {
              infoLog('❌ useChat - Error saliendo de conversación:', error);
            }
          };

          leaveOperation();
        }
      }
    };
  }, []);

  // ESCUCHAR CONFIRMACIONES DE CONVERSACIÓN - CRÍTICO
  useEffect(() => {
    const handleConversationJoined = (e: CustomEvent) => {
      const eventData = e.detail as { conversationId: string; roomId: string; onlineUsers: string[]; timestamp: string };
      if (eventData.conversationId === conversationId) {
        infoLog('✅ useChat - Confirmado unido a conversación:', conversationId);
        setIsJoined(true);
      }
    };

    const handleConversationLeft = (e: CustomEvent) => {
      const eventData = e.detail as { conversationId: string; timestamp: string };
      if (eventData.conversationId === conversationId) {
        infoLog('✅ useChat - Confirmado salido de conversación:', conversationId);
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

    infoLog('🎧 useChat - Configurando listeners para conversación:', conversationId);

    const handleNewMessage = (data: unknown) => {
      const messageData = data as { conversationId: string; message: Message };
      infoLog('📨 useChat - Nuevo mensaje recibido:', messageData);
      
      // DEBUG: Log específico para mensajes de imagen
      if (messageData.message.type === 'image') {
        infoLog('🖼️ useChat - Mensaje de imagen detectado:', {
          messageId: messageData.message.id,
          content: messageData.message.content,
          type: messageData.message.type,
          metadata: messageData.message.metadata
        });
      }
      
      if (messageData.conversationId === conversationId) {
        setMessages(prev => {
          // SOLUCIONADO: Buscar si hay un mensaje optimístico para reemplazar
          const optimisticIndex = prev.findIndex(msg => 
            msg.id.startsWith('optimistic_') && 
            msg.type === 'message_with_files' &&
            messageData.message.type === 'message_with_files' &&
            msg.direction === 'outbound' &&
            messageData.message.direction === 'outbound'
          );

          if (optimisticIndex !== -1) {
            infoLog('📨 useChat - Reemplazando mensaje optimístico:', {
              optimisticId: prev[optimisticIndex].id,
              realId: messageData.message.id
            });
            
            const newMessages = [...prev];
            newMessages[optimisticIndex] = messageData.message;
            return newMessages;
          }

          // Evitar duplicados
          const exists = prev.some(msg => msg.id === messageData.message.id);
          if (exists) {
            infoLog('📨 useChat - Mensaje duplicado, ignorando:', messageData.message.id);
            return prev;
          }
          
          infoLog('📨 useChat - Agregando nuevo mensaje:', messageData.message);
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
      infoLog('✅ useChat - Mensaje enviado confirmado:', sentData);
      
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
      infoLog('📬 useChat - Mensaje entregado:', deliveredData);
      
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
      infoLog('👁️ useChat - Mensajes leídos:', readData);
      
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
      infoLog('✍️ useChat - Usuario escribiendo:', typingData);
      
      if (typingData.conversationId === conversationId) {
        // El context ya maneja typingUsers globalmente
      }
    };

    const handleTypingStop = (data: unknown) => {
      const typingStopData = data as { conversationId: string; userEmail: string };
      infoLog('⏹️ useChat - Usuario dejó de escribir:', typingStopData);
      
      if (typingStopData.conversationId === conversationId) {
        // El context ya maneja typingUsers globalmente
      }
    };

    const handleConversationUpdate = (data: unknown) => {
      const updateData = data as { conversationId: string; updates: Partial<Conversation> };
      infoLog('🔄 useChat - Conversación actualizada:', updateData);
      
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
        console.debug('🎧 useChat - Limpiando listeners para conversación:', conversationId);
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

  // Enviar mensaje con archivos usando optimistic updates
  const sendMessageWithAttachments = useCallback(async (
    content: string,
    attachments: Array<{ id: string; type: string }>
  ) => {
    if (!conversationId || !isJoined) return;
    
    // SOLUCIONADO: Protección más robusta contra doble envío
    if (sending || sendMessageInProgressRef.current) {
      infoLog('⚠️ useChat - Mensaje con archivos ya se está enviando, ignorando envío duplicado');
      return;
    }
    
    // SOLUCIONADO: Marcar como en progreso
    sendMessageInProgressRef.current = true;

    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      setError(`ID de conversación inválido: ${conversationId}`);
      sendMessageInProgressRef.current = false;
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      logConversationId(sanitizedId, 'sendMessageWithAttachments');

      // Crear mensaje optimístico
      const optimisticMessage: Message = {
        id: `optimistic_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        conversationId: sanitizedId,
        content: content.trim() || '',
        type: 'message_with_files',
        direction: 'outbound',
        status: 'queued',
        senderIdentifier: `agent:${backendUser?.email || 'unknown'}`,
        recipientIdentifier: `whatsapp:${extractPhonesFromConversationId(sanitizedId)?.phone1 || ''}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          agentId: backendUser?.email || 'unknown',
          ip: 'unknown',
          requestId: 'optimistic',
          sentBy: backendUser?.email || 'unknown',
          source: 'web' as const,
          timestamp: new Date().toISOString(),
          attachments: attachments.map(att => ({
            id: att.id,
            type: att.type,
            // Placeholder URL que se actualizará cuando llegue el mensaje real
            url: '',
            name: `${att.type}-${att.id}`,
            size: 0,
            mime: `${att.type}/*`,
            category: att.type
          }))
        }
      };

      // Agregar mensaje optimístico al estado local
      setMessages(prev => [...prev, optimisticMessage]);
      
      infoLog('📤 Mensaje optimístico agregado:', {
        id: optimisticMessage.id,
        content: content || '(vacío)',
        attachmentsCount: attachments.length
      });

      // Enviar al backend usando fileUploadService
      const { fileUploadService } = await import('../services/fileUpload');
      await fileUploadService.sendMessageWithAttachments(
        sanitizedId,
        content.trim(),
        attachments
      );

      infoLog('✅ Mensaje con archivos enviado exitosamente');
      
    } catch (error: unknown) {
      console.error('❌ Error enviando mensaje con archivos:', error);
      setError(error instanceof Error ? error.message : 'Error enviando mensaje con archivos');
      
      // Remover mensaje optimístico en caso de error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('optimistic_')));
    } finally {
      setSending(false);
      sendMessageInProgressRef.current = false;
    }
  }, [conversationId, isJoined, sending, backendUser?.email]);

  // Enviar mensaje con optimistic updates y retry
  const sendMessage = useCallback(async (
    content: string,
    type: 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker' = 'text',
    metadata: Record<string, unknown> = {}
  ) => {
    if (!conversationId || !content.trim() || !isJoined) return;
    
    // SOLUCIONADO: Protección más robusta contra doble envío
    if (sending || sendMessageInProgressRef.current) {
      infoLog('⚠️ useChat - Mensaje ya se está enviando, ignorando envío duplicado');
      return;
    }
    
    // SOLUCIONADO: Marcar como en progreso
    sendMessageInProgressRef.current = true;
    
    // SOLUCIONADO: Verificar si ya existe un mensaje idéntico reciente
    const recentMessage = messages.find(msg => 
      msg.content === content && 
      msg.type === type &&
      msg.direction === 'outbound' &&
      msg.createdAt && new Date().getTime() - new Date(msg.createdAt).getTime() < 5000 // Últimos 5 segundos
    );
    
    if (recentMessage) {
      infoLog('⚠️ useChat - Mensaje idéntico enviado recientemente, ignorando:', { content, type });
      sendMessageInProgressRef.current = false;
      return;
    }

    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      setError(`ID de conversación inválido: ${conversationId}`);
      return;
    }

    try {
      setSending(true);
      setError(null);
      
      logConversationId(sanitizedId, 'sendMessage');
      
      // Construir identificadores requeridos por el backend
      const phones = extractPhonesFromConversationId(sanitizedId);
      const customerPhone = phones?.phone1 || '';
      const senderIdentifier = `agent:${backendUser?.email || 'unknown'}`;
      const recipientIdentifier = `whatsapp:${customerPhone}`;

      // Enviar 1 sola vez sin retry en 400
      const response = await messagesService.sendMessage(sanitizedId, {
        content,
        type,
        metadata,
        // Campos obligatorios para backend (extensión del contrato del backend)
        senderIdentifier: senderIdentifier as unknown as string,
        recipientIdentifier: recipientIdentifier as unknown as string
      } as unknown as { content: string; type?: typeof type; metadata?: Record<string, unknown> });
      
      // SOLUCIONADO: Extraer el mensaje real del objeto de respuesta
      const realMessage = (response as unknown as { data?: { message?: Message } }).data?.message || response as unknown as Message;
      
      // SOLUCIONADO: Agregar el mensaje real al estado local
      setMessages(prev => {
        // Verificar si el mensaje ya existe (para evitar duplicados)
        const exists = prev.some(msg => msg.id === realMessage.id);
        if (exists) {
          // Si existe, actualizar con los datos reales
          return prev.map(msg => 
            msg.id === realMessage.id 
              ? { ...realMessage, status: 'sent' } as unknown as Message
              : msg
          ) as unknown as Message[];
        } else {
          // Si no existe, agregarlo al final
          return [...prev, { ...realMessage, status: 'sent' } as unknown as Message];
        }
      });

      // SOLUCIONADO: No incrementar unreadCount para mensajes outbound (enviados por el usuario)
      // Los mensajes outbound no deben contar como no leídos

      // Remover de mensajes optimistas si existe
      optimisticMessagesRef.current.delete(realMessage.id);

      infoLog('✅ Mensaje enviado exitosamente');
    } catch (error: unknown) {
      console.error('❌ Error enviando mensaje:', error);
      setError(error instanceof Error ? error.message : 'Error enviando mensaje');
    } finally {
      setSending(false);
      // SOLUCIONADO: Limpiar flag de envío en progreso
      sendMessageInProgressRef.current = false;
    }
      }, [conversationId, isJoined, sending, backendUser?.email, messages]);

  // Indicar escritura con debouncing
  const handleTyping = useCallback(() => {
    if (!conversationId || !isConnected || !isJoined) return;

    if (!isTyping) {
      setIsTyping(true);
      infoLog('✍️ Iniciando indicador de escritura');
      startTyping(conversationId);
    }

    // Limpiar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing después de 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      infoLog('⏹️ Deteniendo indicador de escritura (timeout)');
      stopTyping(conversationId);
    }, 3000);
  }, [conversationId, isConnected, isTyping, startTyping, stopTyping, isJoined]);

  // Detener escritura
  const handleStopTyping = useCallback(() => {
    if (!conversationId || !isConnected) return;

    setIsTyping(false);
    infoLog('⏹️ Deteniendo indicador de escritura');
    stopTyping(conversationId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId, isConnected, stopTyping]);

  // Marcar mensajes como leídos
  const markAsRead = useCallback((messageIds: string[]) => {
    if (!conversationId || !messageIds.length || !isConnected || !isJoined) return;

    infoLog('👁️ Marcando mensajes como leídos:', messageIds);
    
    // SOLUCIONADO: Actualizar estado local inmediatamente
    setMessages(prev => 
      prev.map(msg => 
        messageIds.includes(msg.id)
          ? { ...msg, status: 'read', readAt: new Date().toISOString() }
          : msg
      )
    );

    // SOLUCIONADO: Actualizar el unreadCount de la conversación en el store
    const sanitizedId = sanitizeConversationId(conversationId);
    if (sanitizedId) {
      // Calcular el nuevo unreadCount basado en los mensajes restantes no leídos
      const remainingUnread = messages.filter(msg => 
        msg.direction === 'inbound' && 
        msg.status !== 'read' && 
        !messageIds.includes(msg.id)
      ).length;
      
      // Actualizar el store de conversaciones
      useChatStore.getState().updateConversationUnreadCount(sanitizedId, remainingUnread);
      
      // Enviar al servidor
      markMessagesAsRead(sanitizedId, messageIds);
    }
  }, [conversationId, isConnected, isJoined, markMessagesAsRead, messages]);

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
      infoLog('🔄 Reintentando mensaje:', messageId);
      
      // Remover mensaje fallido
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      // Reenviar
      sendMessage(
        failedMessage.content,
        failedMessage.type as 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker',
        (failedMessage.metadata as unknown) as Record<string, unknown>
      );
    }
  }, [messages, sendMessage]);

  // Función para eliminar mensaje optimista
  const deleteOptimisticMessage = useCallback((messageId: string) => {
    infoLog('🗑️ Eliminando mensaje optimista:', messageId);
    
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

  // NUEVO: Sincronizar con URL cuando cambie conversationId
  useEffect(() => {
    if (conversationId) {
      const sanitizedId = sanitizeConversationId(conversationId);
      if (sanitizedId) {
        const encodedId = encodeConversationIdForUrl(sanitizedId);
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set('conversation', encodedId);
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
      }
    }
  }, [conversationId, navigate, location.pathname, location.search]);

  // Limpiar al desmontar
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // NUEVO: Return condicional al final, después de que todos los hooks se hayan llamado
  if (!isValidConversationId) {
    return {
      messages: [],
      conversation: null,
      loading: false,
      error: null,
      sending: false,
      isTyping: false,
      isConnected: false,
      isJoined: false,
      typingUsers: new Set<string>(),
      sendMessage: () => Promise.resolve(),
      sendMessageWithAttachments: () => Promise.resolve(),
      handleTyping: () => {},
      handleStopTyping: () => {},
      markAsRead: () => Promise.resolve(),
      retryMessage: () => Promise.resolve(),
      deleteOptimisticMessage: () => {},
      scrollToBottom: () => {},
      messagesEndRef: { current: null },
      refresh: () => Promise.resolve()
    };
  }

  return {
    // Datos
    messages,
    conversation,
    typingUsers: typingUsers.get(conversationId) || new Set<string>(),
    
    // Estados
    loading,
    error,
    sending,
    isTyping,
    isConnected,
    isJoined,
    
    // Acciones
    sendMessage,
    sendMessageWithAttachments,
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