import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Conversation } from '../../types';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick
}) => {
  const getStatusColor = (status: string, unreadCount: number) => {
    if (unreadCount > 0) return 'bg-green-500';
    if (status === 'urgent') return 'bg-red-500';
    if (status === 'high') return 'bg-orange-500';
    return 'bg-gray-400';
  };

  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return 'hace un momento';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Abierta';
      case 'closed':
        return 'Cerrada';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-2 sm:p-3 cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-gray-700">
            {getCustomerInitials(conversation.customerName)}
          </div>
          {/* Status dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-white ${getStatusColor(conversation.priority || 'medium', conversation.unreadCount)}`}></div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1 sm:mb-1.5">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <h3 className={`text-sm sm:text-base font-semibold truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                {conversation.customerName}
              </h3>
              {conversation.priority && (
                <span className={`px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                  {conversation.priority}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-1 sm:ml-2">
              {formatTime(conversation.lastMessageAt)}
            </span>
          </div>

          {/* Customer Info */}
          <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-1.5">
            <span className="text-xs sm:text-sm text-gray-500 truncate">
              {conversation.customerPhone}
            </span>
            <span className="text-xs sm:text-sm text-gray-400">•</span>
            <span className="text-xs sm:text-sm text-gray-500">
              {getStatusText(conversation.status)}
            </span>
            {conversation.assignedTo && (
              <>
                <span className="text-xs sm:text-sm text-gray-400">•</span>
                <span className="text-xs sm:text-sm text-blue-600">
                  Asignado
                </span>
              </>
            )}
          </div>

          {/* Message preview */}
          <p className={`text-xs sm:text-sm truncate mb-1 sm:mb-2 ${conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
            {conversation.lastMessage?.content || 'Sin mensajes'}
          </p>

          {/* Stats and Tags */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {/* Priority tags */}
              {conversation.tags?.slice(0, 1).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
              
              {/* VIP tag */}
              {conversation.tags?.includes('VIP') && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  VIP
                </span>
              )}
            </div>

            {/* Message count and unread */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {conversation.unreadCount > 0 && (
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                  +{conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 