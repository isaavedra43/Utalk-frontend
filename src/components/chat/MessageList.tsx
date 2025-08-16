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
  onRetryMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  messageGroups,
  typingUsers = [],
  customerName = 'Usuario',
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  onRetryMessage,
  onDeleteMessage
}) => {
  const renderMessageGroup = (group: MessageGroup) => {
    // Si es un separador de fecha
    if (group.type === 'date') {
      return (
        <div key={group.key} className="flex items-center justify-center my-6">
          <div className="bg-gray-200 px-4 py-1.5 rounded-full shadow-sm">
            <span className="text-xs text-gray-600 font-medium">
              {group.date}
            </span>
          </div>
        </div>
      );
    }

    // Si es un grupo de mensajes
    if (group.type === 'messages' && group.messages) {
      return (
        <div key={group.key} className="space-y-1 mb-4">
          {group.messages.map((message, index) => {
            const isLastInGroup = index === group.messages!.length - 1;
            const showAvatar = isLastInGroup && message.direction === 'inbound';
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                customerName={customerName}
                showAvatar={showAvatar}
                isLastInGroup={isLastInGroup}
                onRetry={onRetryMessage}
                onDelete={onDeleteMessage}
              />
            );
          })}
        </div>
      );
    }

    return null;
  };

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
          onRetry={onRetryMessage}
          onDelete={onDeleteMessage}
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
        <div className="space-y-2">
          {renderMessages()}
        </div>
      )}

      {/* Indicador de escritura */}
      <TypingIndicator users={typingUsers} />
    </div>
  );
}; 