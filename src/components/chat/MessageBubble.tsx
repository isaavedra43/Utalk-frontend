import React, { useState, useEffect, useRef } from 'react';
import { Check, CheckCheck, RefreshCw, X, MoreVertical } from 'lucide-react';
import type { Message } from '../../types';
import { MessageContent } from './MessageContent';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { convertFirebaseTimestamp } from '../../utils/timestampUtils';

interface MessageBubbleProps {
  message: Message;
  customerName: string;
  onRetry?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  customerName,
  onRetry,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const getMessageStatus = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="w-2.5 h-2.5 text-blue-200" />;
      case 'delivered':
        return <CheckCheck className="w-2.5 h-2.5 text-blue-200" />;
      case 'sent':
        return <Check className="w-2.5 h-2.5 text-blue-200" />;
      case 'failed':
        return (
          <div className="flex items-center gap-1">
            <span className="text-xs text-red-300">Error</span>
            {onRetry && (
              <button
                onClick={() => onRetry(message.id)}
                className="p-1 text-red-300 hover:text-red-100 hover:bg-red-500 rounded transition-colors"
                title="Reintentar envío"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      case 'sending':
        return (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-blue-200 border-t-white rounded-full animate-spin"></div>
            {onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 text-blue-200 hover:text-red-300 hover:bg-red-500 rounded transition-colors"
                title="Cancelar envío"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const formatTime = () => {
    try {
      // Convertir timestamp de Firebase si es necesario
      const convertedTimestamp = convertFirebaseTimestamp(message.createdAt);
      if (!convertedTimestamp) {
        return '';
      }
      
      const date = new Date(convertedTimestamp);
      if (isNaN(date.getTime())) {
        return '';
      }
      
      // Mostrar hora en formato 12 horas como en la imagen
      return format(date, 'h:mm a', { locale: es });
    } catch {
      return '';
    }
  };

  const isOutbound = message.direction === 'outbound';
  
  // Si es un espaciador, solo mostrar espacio
  if (message.content === '' && message.id.startsWith('spacer-')) {
    return <div className="h-4" />;
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'delete':
        onDelete?.(message.id);
        break;
      case 'retry':
        onRetry?.(message.id);
        break;
      case 'copy':
        if (message && message.content) {
          navigator.clipboard.writeText(message.content);
        }
        break;
    }
  };

  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
      {/* Menú de tres puntos - solo para mensajes salientes */}
      {isOutbound && (
        <div ref={menuRef} className="relative mr-1">
          <button
            onClick={handleMenuClick}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Opciones del mensaje"
          >
            <MoreVertical className="w-3 h-3" />
          </button>
          
          {/* Menú desplegable */}
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => handleMenuAction('copy')}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
              >
                Copiar
              </button>
              {onRetry && message.status === 'failed' && (
                <button
                  onClick={() => handleMenuAction('retry')}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Reintentar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => handleMenuAction('delete')}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                >
                  Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Burbuja de mensaje con estilo del copiloto */}
      <div className="relative">
        <div
          className={`
            max-w-xs px-2 py-1.5 rounded-lg text-xs
            ${isOutbound
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
            }
          `}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <MessageContent message={message} />
            </div>
            
            {/* Status del mensaje y hora - solo para mensajes salientes */}
            {isOutbound && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="flex items-center justify-center">
                  {getMessageStatus(message.status)}
                </div>
                <span className="text-[10px] opacity-70">
                  {formatTime()}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Hora para mensajes entrantes */}
        {!isOutbound && (
          <div className="flex items-center gap-1 mt-1 ml-1">
            <span className="text-[10px] text-gray-400">
              {formatTime()}
            </span>
            <span className="text-[10px] text-gray-400">
              {customerName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};