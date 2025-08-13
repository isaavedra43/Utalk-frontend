import React from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message, MessageGroup } from '../../types';

interface MessageListProps {
  messages: Message[];
  messageGroups?: MessageGroup[];
  typingUsers?: Array<{
    userId: string;
    userName: string;
    isTyping: boolean;
    timestamp: Date;
  }>;
  customerName?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  messageGroups,
  typingUsers = [],
  customerName = 'Usuario',
  onLoadMore,
  hasMore = false,
  isLoadingMore = false
}) => {
  const renderMessageGroup = (group: MessageGroup) => (
    <div key={group.date} className="mb-6">
      {/* Separador de fecha */}
      <div className="flex items-center justify-center my-4">
        <div className="bg-gray-100 px-3 py-1 rounded-full">
          <span className="text-xs text-gray-500 font-medium capitalize">
            {group.date}
          </span>
        </div>
      </div>

      {/* Mensajes del grupo */}
      {group.messages.map((message, index) => {
        const isLastInGroup = index === group.messages.length - 1;
        const showAvatar = isLastInGroup && message.direction === 'inbound';
        
        return (
          <MessageBubble
            key={message.id}
            message={message}
            customerName={customerName}
            showAvatar={showAvatar}
            isLastInGroup={isLastInGroup}
          />
        );
      })}
    </div>
  );

  const renderMessages = () => {
    if (messageGroups && messageGroups.length > 0) {
      return messageGroups.map(renderMessageGroup);
    }

    // Fallback: renderizar mensajes sin agrupar
    return messages.map((message, index) => {
      const isLastInGroup = index === messages.length - 1 || 
        messages[index + 1]?.direction !== message.direction;
      const showAvatar = isLastInGroup && message.direction === 'inbound';
      
      return (
        <MessageBubble
          key={message.id}
          message={message}
          customerName={customerName}
          showAvatar={showAvatar}
          isLastInGroup={isLastInGroup}
        />
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Botón para cargar más mensajes */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? 'Cargando...' : 'Cargar más mensajes'}
          </button>
        </div>
      )}

      {/* Mensajes */}
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <p className="text-lg font-medium">No hay mensajes</p>
            <p className="text-sm">Comienza la conversación enviando un mensaje</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {renderMessages()}
        </div>
      )}

      {/* Indicador de escritura */}
      <TypingIndicator users={typingUsers} />
    </div>
  );
}; 