import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { TypingIndicator } from './TypingIndicator';
import { sanitizeConversationId } from '../../utils/conversationUtils';

import type { Conversation as ConversationType, Message as MessageType } from '../../types/index';
import './ChatComponent.css';
import { MessageSquare } from 'lucide-react';

export const ChatComponent = ({ conversationId }: { conversationId?: string }) => {
  const location = useLocation();
  
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
    handleTyping,
    handleStopTyping,
    markAsRead,
    retryMessage,
    deleteOptimisticMessage,
    messagesEndRef
  } = useChat(effectiveConversationId);

  const [inputValue, setInputValue] = useState('');

  // NUEVO: Logs para debugging del renderizado (REDUCIDO para evitar spam)
  // Solo mostrar cuando cambien valores importantes
  const prevRenderState = useRef({ isConnected, isJoined, loading, error, messagesCount: messages.length });
  
  useEffect(() => {
    const currentState = { isConnected, isJoined, loading, error, messagesCount: messages.length };
    const prevState = prevRenderState.current;
    
    // Solo log si hay cambios significativos
    if (
      prevState.isConnected !== currentState.isConnected ||
      prevState.isJoined !== currentState.isJoined ||
      prevState.loading !== currentState.loading ||
      prevState.error !== currentState.error ||
      Math.abs(prevState.messagesCount - currentState.messagesCount) > 5
    ) {
      console.log('📊 ChatComponent - Estado actualizado:', {
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
  const convertMessages = useCallback((msgs: { id: string; content: string; direction: 'inbound' | 'outbound'; timestamp?: string; status: string; type: string }[]): MessageType[] => {
    console.debug('🔄 convertMessages - Iniciando conversión de', msgs.length, 'mensajes');
    
    const convertedMessages = msgs.map((msg, index) => {
      try {
        if (!msg.id || !msg.content) {
          console.warn('⚠️ convertMessages - Mensaje inválido en índice', index, msg);
          return null;
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
            console.warn('⚠️ convertMessages - Status desconocido:', msg.status, 'usando "sent"');
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
            mappedType = msg.type; break;
          default:
            console.warn('⚠️ convertMessages - Tipo desconocido:', msg.type, 'usando "text"');
            mappedType = 'text';
        }

        const convertedMessage: MessageType = {
          id: msg.id,
          conversationId: effectiveConversationId,
          content: msg.content,
          direction: msg.direction,
          createdAt: msg.timestamp || new Date().toISOString(),
          metadata: {
            agentId: 'system',
            ip: '127.0.0.1',
            requestId: 'unknown',
            sentBy: 'system',
            source: 'web',
            timestamp: msg.timestamp || new Date().toISOString()
          },
          status: mappedStatus,
          type: mappedType,
          updatedAt: msg.timestamp || new Date().toISOString()
        };

        return convertedMessage;
      } catch (error) {
        console.error('❌ convertMessages - Error convirtiendo mensaje en índice', index, ':', error, msg);
        return null;
      }
    }).filter(Boolean) as MessageType[];

    console.debug('✅ convertMessages - Conversión completada:', {
      mensajesOriginales: msgs.length,
      mensajesConvertidos: convertedMessages.length,
      mensajesFiltrados: convertedMessages.filter(Boolean).length
    });

    return convertedMessages;
  }, [effectiveConversationId]);

  const convertedMessages = useMemo(() => convertMessages(messages), [messages, convertMessages]);

  // Ordenar mensajes por fecha ascendente y agrupar por día
  const { sortedMessages, groupedMessages } = useMemo(() => {
    // Asegurar timestamps válidos y ordenar ascendente (antiguos arriba, nuevos abajo)
    const sorted = [...convertedMessages].sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return ta - tb;
    });

    // Agrupar por día natural con claves únicas
    const groups: { date: string; messages: typeof sorted; key: string }[] = [];
    for (const msg of sorted) {
      const msgDate = new Date(msg.createdAt);
      const groupLabel = format(msgDate, 'EEEE', { locale: es }); // ej. sábado, lunes
      const dateKey = format(msgDate, 'yyyy-MM-dd'); // Clave única para evitar duplicados
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup) {
        groups.push({ 
          date: groupLabel, 
          messages: [msg],
          key: dateKey // Clave única para React
        });
        continue;
      }
      const lastMsg = lastGroup.messages[lastGroup.messages.length - 1];
      const lastDate = new Date(lastMsg.createdAt);
      if (isSameDay(msgDate, lastDate)) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ 
          date: groupLabel, 
          messages: [msg],
          key: dateKey // Clave única para React
        });
      }
    }

    return { sortedMessages: sorted, groupedMessages: groups };
  }, [convertedMessages]);

  // NUEVO: Mostrar estado cuando no hay conversación seleccionada
  if (!effectiveConversationId || !effectiveConversationId.trim()) {
    return (
      <div className="chat-container">
        <div className="chat-no-conversation">
          <div className="flex items-center justify-center h-full p-4">
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
  const convertConversation = (conv: { id: string; title?: string; participants?: string[]; unreadCount?: number; lastMessage?: string; lastMessageAt?: string } | null): ConversationType | null => {
    if (!conv) return null;
    return {
      id: conv.id,
      customerName: conv.title || 'Usuario',
      customerPhone: conv.participants?.[0] || '',
      status: 'open',
      messageCount: 0,
      unreadCount: conv.unreadCount || 0,
      participants: conv.participants || [],
      tenantId: 'default_tenant',
      workspaceId: 'default_workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageAt: conv.lastMessageAt || new Date().toISOString(),
      lastMessage: conv.lastMessage ? {
        content: conv.lastMessage,
        direction: 'inbound',
        messageId: 'temp-id',
        sender: 'system',
        timestamp: conv.lastMessageAt || new Date().toISOString()
      } : undefined
    };
  };

  const convertTypingUsers = (users: Set<string>) => {
    return Array.from(users).map(userId => ({
      userId,
      userName: userId,
      isTyping: true,
      timestamp: new Date()
    }));
  };

  return (
    <div className="chat-container">
      <ChatHeader conversation={convertConversation(conversation)} />
      
      <div className="chat-messages">
        <MessageList 
          messages={sortedMessages}
          messageGroups={groupedMessages}
          onRetryMessage={retryMessage}
          onDeleteMessage={deleteOptimisticMessage}
        />
        
        {typingUsers.size > 0 && (
          <TypingIndicator users={convertTypingUsers(typingUsers)} />
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
          isSending={sending}
          disabled={!isConnected || !isJoined}
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