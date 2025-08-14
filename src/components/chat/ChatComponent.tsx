import React, { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { TypingIndicator } from './TypingIndicator';

import type { Conversation as ConversationType, Message as MessageType } from '../../types/index';
import './ChatComponent.css';

export const ChatComponent = ({ conversationId }: { conversationId: string }) => {
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
  } = useChat(conversationId);

  const [inputValue, setInputValue] = useState('');

  // Marcar mensajes como leídos cuando se ven
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages
        .filter((msg) => msg.direction === 'inbound' && !msg.readAt)
        .map((msg) => msg.id);

      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages);
      }
    }
  }, [messages, markAsRead]);

  // Manejar envío de mensaje
  const handleSend = async () => {
    if (!inputValue.trim() || sending || !isConnected || !isJoined) return;

    try {
      await sendMessage(inputValue);
      setInputValue('');
      handleStopTyping();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
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

  const convertMessages = (msgs: { id: string; content: string; direction: 'inbound' | 'outbound'; timestamp?: string; status: string; type: string }[]): MessageType[] => {
    return msgs.map(msg => ({
      id: msg.id,
      conversationId: conversationId,
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
      status: msg.status as 'sent' | 'delivered' | 'read' | 'failed',
      type: msg.type as 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker',
      updatedAt: msg.timestamp || new Date().toISOString()
    }));
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
          messages={convertMessages(messages)}
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