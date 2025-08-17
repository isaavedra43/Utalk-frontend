import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { Message } from '../../types';

interface ChatAreaProps {
  conversationId: string | null;
  messages: Message[];
  onSendMessage: (content: string, type?: string, metadata?: Record<string, unknown>) => void;
  typingUsers?: string[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversationId,
  messages,
  onSendMessage,
  typingUsers = []
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, type?: string, metadata?: Record<string, unknown>) => {
    if (!content.trim()) return;
    
    try {
      await onSendMessage(content, type, metadata);
      setInputValue('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    // Manejar blur si es necesario
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecciona una conversación
          </h3>
          <p className="text-gray-500">
            Elige una conversación para comenzar a chatear
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
      </div>
      
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <MessageList 
          messages={messages}
        />
        
        {typingUsers.length > 0 && (
          <div className="p-2 text-sm text-gray-500">
            {typingUsers.join(', ')} está escribiendo...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyPress={handleKeyPress}
        onSendMessage={handleSendMessage}
        isSending={false}
        placeholder="Escribe un mensaje..."
      />
    </div>
  );
}; 