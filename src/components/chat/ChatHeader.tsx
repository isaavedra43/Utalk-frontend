import React from 'react';
import { MoreVertical, Phone, Video, User } from 'lucide-react';
import type { Conversation } from '../../types';

interface ChatHeaderProps {
  conversation: Conversation | null;
  onlineUsers?: Set<string>;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ conversation, onlineUsers = new Set() }) => {
  if (!conversation) {
    return (
      <div className="border-b border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">Selecciona una conversación</h3>
              <p className="text-xs sm:text-sm text-gray-500">Para comenzar a chatear</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOnline = onlineUsers.has(conversation.customerPhone);

  return (
    <div className="border-b border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs sm:text-sm">
                {conversation.customerName.charAt(0).toUpperCase()}
              </span>
            </div>
            {/* Indicador de estado online */}
            <div className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{conversation.customerName}</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-500 truncate">{conversation.customerPhone}</span>
              <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                isOnline 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {isOnline ? 'En línea' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Estado de la conversación */}
          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
            conversation.status === 'open' 
              ? 'bg-green-100 text-green-800'
              : conversation.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {conversation.status === 'open' ? 'Abierta' : 
             conversation.status === 'pending' ? 'Pendiente' : 'Cerrada'}
          </span>

          {/* Prioridad */}
          {conversation.priority && (
            <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
              conversation.priority === 'urgent' 
                ? 'bg-red-100 text-red-800'
                : conversation.priority === 'high'
                ? 'bg-orange-100 text-orange-800'
                : conversation.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {conversation.priority === 'urgent' ? 'Urgente' :
               conversation.priority === 'high' ? 'Alta' :
               conversation.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
          )}

          {/* Acciones */}
          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags */}
      {conversation.tags && conversation.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {conversation.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}; 