import React, { useState, useEffect } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useTyping } from '../../hooks/useTyping';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { useWebSocketContext } from '../../hooks/useWebSocketContext';

interface ChatComponentProps {
  conversationId: string | null;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({ conversationId }) => {
  const {
    messages,
    messageGroups,
    isLoading,
    error,
    typingUsers,
    sendMessage,
    markMessagesAsRead,
    messagesEndRef,
    isSending
  } = useMessages(conversationId);

  const { onlineUsers } = useWebSocketContext();
  const { startTyping, stopTyping } = useWebSocketContext();
  
  // Hook de typing optimizado
  const { handleTyping, handleStopTyping } = useTyping(conversationId, startTyping, stopTyping);

  const [inputValue, setInputValue] = useState('');

  // Marcar mensajes como leídos cuando se ven
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages
        .filter(msg => msg.direction === 'inbound' && msg.status !== 'read')
        .map(msg => msg.id);

      if (unreadMessages.length > 0) {
        markMessagesAsRead(unreadMessages);
      }
    }
  }, [messages, markMessagesAsRead]);

  // Manejar envío de mensaje
  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    try {
      await sendMessage(inputValue.trim());
      setInputValue('');
      handleStopTyping();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  // Manejar cambio de input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    handleTyping();
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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando conversación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ChatHeader 
        conversation={conversationId ? { 
          id: conversationId, 
          customerName: 'Cliente', 
          customerPhone: '', 
          status: 'open' as const,
          messageCount: 0,
          unreadCount: 0,
          participants: [],
          tenantId: '',
          workspaceId: '',
          createdAt: '',
          updatedAt: '',
          lastMessageAt: ''
        } : null} 
        onlineUsers={onlineUsers}
      />
      
      {/* Lista de mensajes */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages}
          messageGroups={messageGroups}
          typingUsers={typingUsers}
          customerName="Cliente"
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensaje */}
      <MessageInput
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyPress={handleKeyPress}
        onSendMessage={handleSend}
        isSending={isSending}
        conversationId={conversationId}
        placeholder="Escribe un mensaje..."
      />
    </div>
  );
}; 