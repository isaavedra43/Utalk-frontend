import React from 'react';
import type { Conversation } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: (conversationId: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick
}) => {
  // Generar iniciales del nombre del cliente
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Determinar el color del indicador de estado
  const getStatusColor = () => {
    if (conversation.priority === 'urgent') return 'bg-red-500';
    if (conversation.unreadCount > 0) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  // Determinar el tag principal
  const getPrimaryTag = () => {
    if (conversation.tags && conversation.tags.length > 0) {
      return conversation.tags[0];
    }
    return null;
  };

  // Formatear timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      // Convertir el formato español a Date
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch {
      return 'hace un momento';
    }
  };

  // Truncar texto
  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const initials = getInitials(conversation.customerName);
  const statusColor = getStatusColor();
  const primaryTag = getPrimaryTag();
  const timestamp = conversation.lastMessageAt ? formatTimestamp(conversation.lastMessageAt) : '';
  const lastMessageContent = conversation.lastMessage?.content || 'Sin mensajes';

  return (
    <div
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => onClick(conversation.id)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
            {initials}
          </div>
          {/* Indicador de estado */}
          <div className={`w-3 h-3 rounded-full border-2 border-white absolute -bottom-1 -right-1 ${statusColor}`} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {conversation.customerName}
            </h4>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {timestamp}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 truncate mb-2">
            {truncateText(lastMessageContent, 35)}
          </p>
          
          {/* Tags y contadores */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {primaryTag && (
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  {primaryTag}
                </span>
              )}
              {conversation.unreadCount > 0 && (
                <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
            
            {/* Indicadores adicionales */}
            <div className="flex items-center gap-1">
              {conversation.priority === 'urgent' && (
                <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                  Urgente
                </span>
              )}
              {conversation.priority === 'high' && (
                <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                  Alta
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 