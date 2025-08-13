import React from 'react';
import type { Message } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  customerName?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar = true,
  customerName
}) => {
  // Generar iniciales del remitente
  const getInitials = (sender: string) => {
    if (sender.includes('whatsapp:')) {
      // Es un cliente de WhatsApp
      return customerName ? customerName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 'CL';
    } else if (sender.includes('agent:')) {
      // Es un agente
      const agentName = sender.replace('agent:', '');
      return agentName.split('@')[0].toUpperCase().slice(0, 2);
    } else {
      // Otro tipo de remitente
      return sender.split('@')[0].toUpperCase().slice(0, 2);
    }
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

  // Determinar el estado del mensaje
  const getMessageStatus = () => {
    if (message.direction === 'inbound') return null;
    
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'failed':
        return <span className="text-red-500 text-xs">Error</span>;
      default:
        return null;
    }
  };

  const isOutbound = message.direction === 'outbound';
  const initials = getInitials(message.senderIdentifier || message.metadata.sentBy);
  const timestamp = formatTimestamp(message.createdAt);
  const messageStatus = getMessageStatus();

  return (
    <div className={`flex gap-3 ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar para mensajes entrantes */}
      {!isOutbound && showAvatar && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 flex-shrink-0">
          {initials}
        </div>
      )}
      
      {/* Burbuja del mensaje */}
      <div className={`max-w-xs lg:max-w-md ${
        isOutbound 
          ? 'bg-blue-600 text-white' 
          : 'bg-white border border-gray-200'
      } rounded-lg p-3 shadow-sm`}>
        {/* Contenido del mensaje */}
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        
        {/* Timestamp y estado */}
        <div className={`flex items-center justify-between mt-2 ${
          isOutbound ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <span className="text-xs">{timestamp}</span>
          {messageStatus && (
            <div className="flex items-center gap-1">
              {messageStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 