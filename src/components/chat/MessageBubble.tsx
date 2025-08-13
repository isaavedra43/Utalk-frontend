import React from 'react';
import type { Message } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
  customerName?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar,
  customerName
}) => {
  const isOutbound = message.direction === 'outbound';
  const isRead = message.status === 'read';

  // Generar iniciales del cliente
  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Formatear timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch {
      return 'hace un momento';
    }
  };

  const timestamp = formatTimestamp(message.createdAt);

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} gap-3`}>
      {/* Avatar (solo para mensajes entrantes) */}
      {!isOutbound && showAvatar && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">
          {customerName ? getCustomerInitials(customerName) : 'CL'}
        </div>
      )}

      {/* Espacio para alinear mensajes salientes */}
      {isOutbound && (
        <div className="w-8 flex-shrink-0"></div>
      )}

      {/* Burbuja de mensaje */}
      <div className={`max-w-xs lg:max-w-md ${isOutbound ? 'order-first' : ''}`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            isOutbound
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Timestamp y estado */}
        <div className={`flex items-center gap-1 mt-1 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">{timestamp}</span>
          {isOutbound && (
            <div className="flex items-center">
              {isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 