import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Conversation } from '../../types';
import { useAppStore } from '../../stores/useAppStore';



interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = React.memo(({
  conversation,
  isSelected,
  onClick
}) => {
  // Estados para controlar animaciones
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const { calculateUnreadCount, markConversationAsRead } = useAppStore();
  
  // Calcular unreadCount dinámicamente
  const unreadCount = calculateUnreadCount(conversation.id);
  const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount);

  // Marcar conversación como leída cuando se selecciona
  useEffect(() => {
    if (isSelected && unreadCount > 0) {
      markConversationAsRead(conversation.id);
    }
  }, [isSelected, unreadCount, conversation.id, markConversationAsRead]);

  // FASE 1: Optimización - Detectar cuando llega un nuevo mensaje con memoización
  useEffect(() => {
    if (unreadCount > prevUnreadCount) {
      setIsNewMessage(true);
      setIsHighlighted(true);
      
      // Resetear animaciones después de un tiempo
      const timeoutId = setTimeout(() => {
        setIsNewMessage(false);
        setIsHighlighted(false);
      }, 3000);
      
      // Cleanup para evitar memory leaks
      return () => clearTimeout(timeoutId);
    }
    setPrevUnreadCount(unreadCount);
  }, [unreadCount, prevUnreadCount]);

  // FASE 3: Optimización - Memoizar funciones para evitar recreaciones
  const formatLastMessageTime = useCallback((timestamp: string | undefined) => {
    if (!timestamp) {
      return 'Reciente';
    }
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true, locale: es });
      } else {
        return date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short' 
        });
      }
    } catch {
      return 'Reciente';
    }
  }, []);

  // FASE 3: Optimización - Memoizar función de iniciales
  const getInitials = useCallback((name: string | undefined) => {
    if (!name || typeof name !== 'string') {
      return '??';
    }
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // FASE 3: Optimización - Memoizar valores calculados
  const formattedTime = useMemo(() => 
    formatLastMessageTime(conversation.lastMessageAt), 
    [formatLastMessageTime, conversation.lastMessageAt]
  );

  const customerInitials = useMemo(() => 
    getInitials(conversation.customerName), 
    [getInitials, conversation.customerName]
  );

  const statusColor = useMemo(() => 
    (conversation.status || 'closed') === 'open' 
      ? 'bg-gradient-to-br from-green-400 to-green-600' 
      : 'bg-gradient-to-br from-gray-400 to-gray-600',
    [conversation.status]
  );

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 cursor-pointer transition-all duration-300 ease-out
        ${isSelected 
          ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
          : 'bg-white hover:bg-gray-50 border-l-4 border-transparent'
        }
        ${isNewMessage ? 'animate-slide-in' : ''}
        ${isHighlighted ? 'ring-2 ring-blue-200' : ''}
        lg:border-l-4 lg:border-transparent lg:hover:border-l-4 lg:hover:border-blue-200
      `}
    >
      {/* Indicador de mensaje nuevo */}
      {isNewMessage && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-ping" />
      )}

      <div className="flex items-start space-x-3">
        {/* Avatar del cliente */}
        <div className="flex-shrink-0">
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm
            ${statusColor}
            ${isNewMessage ? 'animate-pulse' : ''}
          `}>
            {customerInitials}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {/* Header con nombre y tiempo */}
          <div className="flex items-center justify-between mb-1">
            <h3 className={`
              text-sm font-semibold truncate
              ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}
            `}>
              {conversation.customerName || 'Cliente sin nombre'}
            </h3>
            <span className={`
              text-xs ml-2 flex-shrink-0
              ${unreadCount > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'}
            `}>
              {formattedTime}
            </span>
          </div>

          {/* Información del cliente */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs text-gray-500 font-mono">
              {conversation.customerPhone || 'Sin teléfono'}
            </span>
            <div className="flex items-center space-x-1">
              <div className={`
                w-2 h-2 rounded-full
                ${(conversation.status || 'closed') === 'open' ? 'bg-green-500' : 'bg-gray-400'}
              `} />
              <span className="text-xs text-gray-500 capitalize">
                {conversation.status || 'closed'}
              </span>
            </div>
          </div>

          {/* Último mensaje */}
          <div className="flex items-center justify-between">
            <p className={`
              text-sm truncate flex-1
              ${(conversation.unreadCount || 0) > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}
            `}>
              {conversation.lastMessage?.content || 'Sin mensajes'}
            </p>
            
            {/* Badge de mensajes no leídos */}
            {unreadCount > 0 && (
              <div className="flex items-center space-x-2 ml-2">
                <span className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${isNewMessage ? 'animate-bounce bg-red-500 text-white' : 'bg-blue-100 text-blue-700'}
                `}>
                  +{unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de actividad */}
      {unreadCount > 0 && (
        <div className="absolute bottom-2 right-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}); 