import React from 'react';
import type { MessageGroup, TypingIndicator } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessageContainerProps {
  messageGroups: MessageGroup[];
  typingUsers: TypingIndicator[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  customerName?: string;
  isLoading?: boolean;
}

export const MessageContainer: React.FC<MessageContainerProps> = ({
  messageGroups,
  typingUsers,
  messagesEndRef,
  customerName,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  if (messageGroups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mensajes</h3>
          <p className="text-gray-500 text-sm">Comienza la conversación enviando un mensaje</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {messageGroups.map((group) => (
        <div key={group.date} className="space-y-4">
          {/* Separador de fecha */}
          <div className="flex justify-center pt-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {group.date}
            </div>
          </div>

          {/* Mensajes del grupo */}
          <div className="space-y-4 px-4">
            {group.messages.map((message, messageIndex) => (
              <MessageBubble
                key={message.id}
                message={message}
                showAvatar={messageIndex === 0 || 
                  group.messages[messageIndex - 1]?.direction !== message.direction}
                customerName={customerName}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Indicador de escritura */}
      {typingUsers.length > 0 && (
        <div className="flex gap-3 justify-start mt-4 px-4">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
            {customerName ? customerName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 'CL'}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {typingUsers.map(user => user.userName).join(', ')} está escribiendo...
            </p>
          </div>
        </div>
      )}

      {/* Referencia para scroll automático */}
      <div ref={messagesEndRef} />
    </div>
  );
}; 