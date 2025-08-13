import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { Message } from '../../types';
import { MessageContent } from './MessageContent';

interface MessageBubbleProps {
  message: Message;
  customerName: string;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  customerName,
  showAvatar = false,
  isLastInGroup = true
}) => {
  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getMessageStatus = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      default:
        return null;
    }
  };

  const formatTime = () => {
    // Simular tiempo relativo
    return 'hace un momento';
  };

  const isOutbound = message.direction === 'outbound';

  return (
    <div className={`flex items-end gap-2 ${isOutbound ? 'justify-end' : 'justify-start'} ${!isLastInGroup ? 'mb-1' : 'mb-3'}`}>
      {/* Avatar para mensajes entrantes */}
      {!isOutbound && showAvatar && (
        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-gray-700">
            {getCustomerInitials(customerName)}
          </span>
        </div>
      )}

      {/* Mensaje */}
      <div className={`max-w-xs lg:max-w-md ${isOutbound ? 'order-first' : ''}`}>
        <div
          className={`message-bubble px-3 py-2 rounded-lg text-xs ${
            isOutbound
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          } ${!isLastInGroup ? 'rounded-br-md' : ''}`}
        >
          <MessageContent message={message} />
        </div>
        
        {/* Timestamp y estado - solo mostrar en el último mensaje del grupo */}
        {isLastInGroup && (
          <div className={`flex items-center gap-1 mt-1 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-400">
              {formatTime()}
            </span>
            {isOutbound && getMessageStatus(message.status)}
          </div>
        )}
      </div>
    </div>
  );
}; 