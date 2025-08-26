import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { infoLog } from '../../config/logger';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { TypingIndicator } from './TypingIndicator';
import { sanitizeConversationId } from '../../utils/conversationUtils';
import { convertFirebaseTimestamp } from '../../utils/timestampUtils';
import { useWarningLogger } from '../../hooks/useWarningLogger';

import type { Conversation as ConversationType, Message as MessageType } from '../../types/index';
import './ChatComponent.css';
import { MessageSquare } from 'lucide-react';

export const ChatComponent = ({ conversationId }: { conversationId?: string }) => {
  const location = useLocation();
  const { logWarningOnce } = useWarningLogger();
  
  // NUEVO: Obtener conversationId de la URL si no se proporciona uno
  const effectiveConversationId = conversationId || (() => {
    const searchParams = new URLSearchParams(location.search);
    const urlConversationId = searchParams.get('conversation');
    if (urlConversationId) {
      const sanitizedId = sanitizeConversationId(decodeURIComponent(urlConversationId));
      return sanitizedId || '';
    }
    return '';
  })();

  // NUEVO: Protección contra conversationId inválido
  if (!effectiveConversationId || effectiveConversationId.trim() === '') {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecciona una conversación
          </h3>
          <p className="text-gray-500">
            Elige una conversación de la lista para comenzar a chatear
          </p>
        </div>
      </div>
    );
  }

  const {
    messages,
    conversation,
    loading,
    error,
    sending,
    isTyping,
    isConnected,
    isJoined, // NUEVO: Estado de confirmación
    typingUsers,
    sendMessage,
    sendMessageWithAttachments,
    handleTyping,
    handleStopTyping,
    markAsRead,
    retryMessage,
    deleteOptimisticMessage,
    messagesEndRef
  } = useChat(effectiveConversationId);

  // NUEVO: Protección adicional contra datos undefined
  if (loading && !conversation) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando conversación...
          </h3>
        </div>
      </div>
    );
  }

  // NUEVO: Protección contra error de carga
  if (error && !conversation) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MessageSquare className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar la conversación
          </h3>
          <p className="text-gray-500 mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const [inputValue, setInputValue] = useState('');

  // NUEVO: Logs para debugging del renderizado (REDUCIDO para evitar spam)
  // Solo mostrar cuando cambien valores importantes
  const prevRenderState = useRef({ isConnected, isJoined, loading, error, messagesCount: messages.length });
  
  useEffect(() => {
    const currentState = { isConnected, isJoined, loading, error, messagesCount: messages.length };
    const prevState = prevRenderState.current;
    
    // Solo log si hay cambios significativos Y hay errores
    if (
      (prevState.error !== currentState.error && currentState.error) ||
      (prevState.isConnected !== currentState.isConnected && !currentState.isConnected) ||
      (prevState.isJoined !== currentState.isJoined && !currentState.isJoined)
    ) {
      infoLog('📊 ChatComponent - Estado actualizado (CRÍTICO):', {
        conversationId: effectiveConversationId,
        isConnected: currentState.isConnected,
        isJoined: currentState.isJoined,
        loading: currentState.loading,
        error: currentState.error,
        messagesCount: currentState.messagesCount
      });
      prevRenderState.current = currentState;
    }
  }, [isConnected, isJoined, loading, error, messages.length, effectiveConversationId]);

  // Marcar mensajes como leídos cuando se ven
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages
        .filter((msg) => msg.direction === 'inbound' && msg.status !== 'read')
        .map((msg) => msg.id);

      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages);
      }
    }
  }, [messages, markAsRead]);

  // Conversión de mensajes (declarada arriba para no romper el orden de hooks)
  const convertMessages = useCallback((msgs: { id: string; content: string; direction: 'inbound' | 'outbound'; timestamp?: string | { _seconds: number; _nanoseconds: number }; status: string; type: string; mediaUrl?: string; metadata?: Record<string, unknown> }[]): MessageType[] => {
    // REDUCIR LOGS: Solo log si hay muchos mensajes o errores
    if (msgs.length > 50) {
      console.debug('🔄 convertMessages - Iniciando conversión de', msgs.length, 'mensajes');
    }
    
    const convertedMessages = msgs.map((msg, index) => {
      try {
        // Validación mejorada para diferentes tipos de mensaje
        if (!msg.id) {
          console.warn('⚠️ convertMessages - Mensaje sin ID en índice', index, msg);
          return null;
        }

        // Para mensajes de texto, requerir contenido
        if (msg.type === 'text' && !msg.content) {
          console.warn('⚠️ convertMessages - Mensaje de texto sin contenido en índice', index, msg);
          return null;
        }

        // Convertir timestamp de Firebase a ISO string (mover aquí para usar en placeholder)
        const convertedTimestamp = convertFirebaseTimestamp(msg.timestamp);
        const finalTimestamp = convertedTimestamp || new Date().toISOString();

        // Para mensajes de media, verificar que tenga mediaUrl o contenido en metadata
        if (['image', 'document', 'audio', 'voice', 'video', 'sticker', 'media', 'message_with_files'].includes(msg.type)) {
          const hasMediaUrl = msg.mediaUrl && msg.mediaUrl !== null;
          const mediaMetadata = msg.metadata?.media as { urls?: string[]; processed?: unknown[] } | undefined;
          const hasMediaInMetadata = (mediaMetadata?.urls?.length ?? 0) > 0 || (mediaMetadata?.processed?.length ?? 0) > 0;
          const attachments = msg.metadata?.attachments as Array<{ url?: string; id?: string }> | undefined;
          const hasAttachments = (attachments?.length ?? 0) > 0;
          
          // SOLUCIÓN: Mostrar placeholder en lugar de eliminar mensajes de media
          if (!hasMediaUrl && !hasMediaInMetadata && !hasAttachments && !msg.content) {
            // Solo loggear una vez por conversación, no por cada mensaje
            logWarningOnce(
              'media-missing-content',
              '⚠️ convertMessages - Detectados mensajes de media sin URL ni contenido. Esto es normal para mensajes de WhatsApp que aún no se han procesado.'
            );
            
            // Retornar mensaje placeholder en lugar de null
            return {
              id: msg.id,
              conversationId: effectiveConversationId,
              content: 'Cargando media...',
              direction: msg.direction,
              createdAt: finalTimestamp,
              metadata: {
                agentId: 'system',
                ip: '127.0.0.1',
                requestId: 'unknown',
                sentBy: 'system',
                source: 'web',
                timestamp: finalTimestamp,
                originalMetadata: msg.metadata
              },
              status: 'sent',
              type: 'text', // Cambiar a texto para mostrar placeholder
              updatedAt: finalTimestamp
            };
          }
        }

        let mappedStatus: MessageType['status'];
        switch (msg.status) {
          case 'queued': mappedStatus = 'queued'; break;
          case 'received': mappedStatus = 'received'; break;
          case 'sent': mappedStatus = 'sent'; break;
          case 'delivered': mappedStatus = 'delivered'; break;
          case 'read': mappedStatus = 'read'; break;
          case 'failed': mappedStatus = 'failed'; break;
          default:
            // REDUCIR LOGS: Solo log si es un status realmente desconocido
            if (!['queued', 'received', 'sent', 'delivered', 'read', 'failed'].includes(msg.status)) {
              console.warn('⚠️ convertMessages - Status desconocido:', msg.status, 'usando "sent"');
            }
            mappedStatus = 'sent';
        }

        let mappedType: MessageType['type'];
        switch (msg.type) {
          case 'text':
          case 'image':
          case 'document':
          case 'location':
          case 'audio':
          case 'voice':
          case 'video':
          case 'sticker':
          case 'message_with_files': // NUEVO: Agregar soporte para message_with_files
            mappedType = msg.type === 'message_with_files' ? 'image' : msg.type; break;
          case 'system':
            // TEMPORAL: Detectar tipo basado en contenido para mensajes system
            if (msg.mediaUrl || (msg.metadata?.media)) {
              mappedType = 'image'; // Si tiene mediaUrl, probablemente es imagen
              console.log('🖼️ [ChatComponent] Mensaje system detectado como imagen:', {
                mediaUrl: msg.mediaUrl,
                metadata: msg.metadata,
                content: msg.content
              });
            } else {
              mappedType = 'text'; // Si no, es texto
            }
            break;
          default:
            // REDUCIR LOGS: Solo log si es un tipo realmente desconocido
            if (!['text', 'image', 'document', 'location', 'audio', 'voice', 'video', 'sticker', 'message_with_files', 'system'].includes(msg.type)) {
              console.warn('⚠️ convertMessages - Tipo desconocido:', msg.type, 'usando "text"');
            }
            mappedType = 'text';
        }

        // Para mensajes de media, usar mediaUrl como contenido si está disponible
        let messageContent = msg.content;
        if (['image', 'document', 'audio', 'voice', 'video', 'sticker', 'media', 'message_with_files', 'system'].includes(msg.type)) {
          // Priorizar mediaUrl si está disponible
          if (msg.mediaUrl) {
            messageContent = msg.mediaUrl;
          } else {
            // Buscar URLs en metadata si no hay mediaUrl directo
            const mediaMetadata = msg.metadata?.media as { urls?: string[]; processed?: unknown[] } | undefined;
            if (mediaMetadata && mediaMetadata.urls && mediaMetadata.urls.length > 0) {
              messageContent = mediaMetadata.urls[0];
            } else if (mediaMetadata && mediaMetadata.processed && mediaMetadata.processed.length > 0) {
              const processed = mediaMetadata.processed[0] as { url?: string };
              if (processed && processed.url) {
                messageContent = processed.url;
              }
            } else {
              // NUEVO: Para message_with_files, buscar en attachments
              const attachments = msg.metadata?.attachments as Array<{ url?: string; id?: string }> | undefined;
              if (attachments && attachments.length > 0 && attachments[0].url) {
                messageContent = attachments[0].url;
              }
            }
          }
        }

        // Usar timestamp ya convertido arriba

        const convertedMessage: MessageType = {
          id: msg.id,
          conversationId: effectiveConversationId,
          content: messageContent,
          direction: msg.direction,
          createdAt: finalTimestamp,
          metadata: {
            agentId: 'system',
            ip: '127.0.0.1',
            requestId: 'unknown',
            sentBy: 'system',
            source: 'web',
            timestamp: finalTimestamp,
            // Incluir metadata original si existe
            ...(msg.metadata && { originalMetadata: msg.metadata })
          },
          status: mappedStatus,
          type: mappedType,
          updatedAt: finalTimestamp
        };

        return convertedMessage;
      } catch (error) {
        console.error('❌ convertMessages - Error convirtiendo mensaje en índice', index, ':', error, msg);
        return null;
      }
    }).filter(Boolean) as MessageType[];

    // REDUCIR LOGS: Solo log si hay problemas
    const filteredCount = convertedMessages.filter(Boolean).length;
    if (filteredCount < msgs.length) {
      console.debug('✅ convertMessages - Conversión completada con filtros:', {
        mensajesOriginales: msgs.length,
        mensajesConvertidos: convertedMessages.length,
        mensajesFiltrados: filteredCount
      });
    }

    return convertedMessages;
  }, [effectiveConversationId, logWarningOnce]);

  const convertedMessages = useMemo(() => convertMessages(messages.map(msg => ({
    ...msg,
    metadata: msg.metadata as unknown as Record<string, unknown>
  }))), [messages, convertMessages]);

  // Ordenar mensajes por fecha ascendente y agrupar por día
  const { sortedMessages, groupedMessages } = useMemo(() => {
    // Asegurar timestamps válidos y ordenar ascendente (antiguos arriba, nuevos abajo)
    const sorted = [...convertedMessages].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return ta - tb;
    });

    // Agrupar por día con separadores de fecha como WhatsApp
    const groups: { 
      type: 'date' | 'messages'; 
      date?: string; 
      messages?: typeof sorted; 
      key: string;
      timestamp?: Date;
    }[] = [];
    
    let currentDate: string | null = null;
    let currentMessages: typeof sorted = [];
    
    for (const msg of sorted) {
      const msgDate = new Date(msg.createdAt);
      const msgDateKey = format(msgDate, 'yyyy-MM-dd');
      const msgDateLabel = format(msgDate, 'EEEE, d MMM', { locale: es }); // ej. "lunes, 22 jul"
      
      // Si es un nuevo día, crear separador de fecha
      if (msgDateKey !== currentDate) {
        // Guardar grupo anterior si existe
        if (currentDate && currentMessages.length > 0) {
          groups.push({
            type: 'messages',
            messages: currentMessages,
            key: `messages-${currentDate}`,
            timestamp: new Date(currentMessages[0].createdAt)
          });
        }
        
        // Agregar separador de fecha
        groups.push({
          type: 'date',
          date: msgDateLabel,
          key: `date-${msgDateKey}`
        });
        
        // Iniciar nuevo grupo
        currentDate = msgDateKey;
        currentMessages = [msg];
      } else {
        // Mismo día, verificar si hay mucha diferencia de tiempo
        const lastMsg = currentMessages[currentMessages.length - 1];
        const lastMsgTime = new Date(lastMsg.createdAt);
        const timeDiff = Math.abs(msgDate.getTime() - lastMsgTime.getTime());
        const fiveMinutes = 5 * 60 * 1000; // 5 minutos en milisegundos
        
        // Si hay más de 5 minutos de diferencia, agregar espaciado visual
        if (timeDiff > fiveMinutes) {
          // Agregar un mensaje espaciador invisible
          currentMessages.push({
            ...msg,
            id: `spacer-${msg.id}`,
            content: '',
            type: 'spacer' as 'text'
          });
        }
        
        currentMessages.push(msg);
      }
    }
    
    // Agregar el último grupo si existe
    if (currentDate && currentMessages.length > 0) {
      groups.push({
        type: 'messages',
        messages: currentMessages,
        key: `messages-${currentDate}`,
        timestamp: new Date(currentMessages[0].createdAt)
      });
    }

    return { sortedMessages: sorted, groupedMessages: groups };
  }, [convertedMessages]);

  // NUEVO: Mostrar estado cuando no hay conversación seleccionada
  if (!effectiveConversationId || !effectiveConversationId.trim()) {
    return (
      <div className="chat-container">
        <div className="chat-no-conversation">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecciona una conversación
            </h3>
            <p className="text-gray-500 text-sm">
              Elige una conversación para comenzar a chatear
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Función para enviar mensaje
  const handleSend = async () => {
    if (!inputValue.trim() || !isConnected || !isJoined) return;
    
    const messageContent = inputValue.trim();
    setInputValue('');
    
    try {
      await sendMessage(messageContent);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      // Restaurar el mensaje en caso de error
      setInputValue(messageContent);
    }
  };

  // Manejar cambio de input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    if (!isTyping && isJoined) {
      handleTyping();
    }
  };

  // Manejar pérdida de foco
  const handleInputBlur = () => {
    handleStopTyping();
  };

  // Manejar tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mostrar estado de conexión
  if (!isConnected) {
    return (
      <div className="chat-container">
        <div className="chat-disconnected">
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-red-600 font-medium text-sm sm:text-base">Desconectado</p>
              <p className="text-gray-500 text-xs sm:text-sm">Intentando reconectar...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar estado de unión a conversación
  if (!isJoined) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Uniéndose a la conversación...</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-2">Esperando confirmación del servidor</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Cargando conversación...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-container">
        <div className="chat-error">
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl sm:text-2xl">⚠️</span>
              </div>
              <p className="text-red-600 font-medium mb-2 text-sm sm:text-base">Error de conexión</p>
              <p className="text-gray-500 text-xs sm:text-sm mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Convertir tipos para compatibilidad
  const convertConversation = (conv: ConversationType | null): ConversationType | null => {
    if (!conv) return null;
    return conv;
  };

  const convertTypingUsers = (users: Set<string>) => {
    return Array.from(users).map(userId => ({
      userId,
      userName: userId,
      isTyping: true,
      timestamp: new Date()
    }));
  };

  // Obtener typing users para la conversación actual
  const currentTypingUsers = typingUsers.get(effectiveConversationId) || new Set<string>();

  return (
    <div className="chat-container">
      <ChatHeader 
        conversation={convertConversation(conversation)} 
        messages={sortedMessages}
      />
      
      <div className="chat-messages">
        <MessageList 
          messages={sortedMessages}
          messageGroups={groupedMessages}
          customerName={conversation?.contact?.name || 
                      conversation?.contact?.name || 
                      conversation?.customerName || 'Usuario'}
          onRetryMessage={retryMessage}
          onDeleteMessage={deleteOptimisticMessage}
        />
        
        {currentTypingUsers.size > 0 && (
          <TypingIndicator users={convertTypingUsers(currentTypingUsers)} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <MessageInput
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          onSendMessage={handleSend}
          sendMessageWithAttachments={sendMessageWithAttachments}
          isSending={sending}
          disabled={!isConnected || !isJoined}
          conversationId={effectiveConversationId} // NUEVO: Pasar conversationId para subir archivos
          placeholder={
            !isConnected 
              ? "Desconectado..." 
              : !isJoined 
                ? "Conectando a la conversación..."
                : "Escribe un mensaje..."
          }
        />
      </div>
    </div>
  );
}; 