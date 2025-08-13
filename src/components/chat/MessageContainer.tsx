import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { MessageGroup, TypingIndicator } from '../../types';

interface MessageContainerProps {
  messageGroups: MessageGroup[];
  typingUsers: TypingIndicator[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  customerName: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFetchingNextPage?: boolean;
}

export const MessageContainer: React.FC<MessageContainerProps> = ({
  messageGroups,
  typingUsers,
  messagesEndRef,
  customerName,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  isFetchingNextPage = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Función para verificar si estamos cerca del final
  const checkScrollPosition = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 100; // 100px del final
    const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;
    const isNearTop = scrollTop < 200; // 200px del inicio para cargar más

    setIsNearBottom(isNearBottom);
    setShowScrollToBottom(!isNearBottom && scrollHeight > clientHeight);

    // Cargar más mensajes cuando estamos cerca del inicio
    if (isNearTop && hasMore && !isFetchingNextPage && !isLoadingMore && onLoadMore) {
      setIsLoadingMore(true);
      onLoadMore();
    }
  }, [hasMore, isFetchingNextPage, isLoadingMore, onLoadMore]);

  // Scroll al final
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior
      });
    }
  }, []);

  // Efecto para scroll automático al final cuando llegan nuevos mensajes
  useEffect(() => {
    if (isNearBottom && messageGroups.length > 0) {
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
    }
  }, [messageGroups.length, isNearBottom, scrollToBottom]);

  // Efecto para verificar posición del scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    
    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
    };
  }, [checkScrollPosition]);

  // Scroll automático inicial
  useEffect(() => {
    if (!isLoading && messageGroups.length > 0) {
      setTimeout(() => {
        scrollToBottom('auto');
      }, 100);
    }
  }, [isLoading, messageGroups.length, scrollToBottom]);

  // Resetear estado de carga
  useEffect(() => {
    if (!isFetchingNextPage) {
      setIsLoadingMore(false);
    }
  }, [isFetchingNextPage]);

  if (isLoading && messageGroups.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start space-x-2">
              <div className="w-6 h-6 loading-skeleton rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 loading-skeleton rounded w-3/4 mb-2"></div>
                <div className="h-3 loading-skeleton rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {/* Contenedor principal de mensajes */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#D1D5DB transparent'
        }}
      >
        {/* Indicador de carga más mensajes (solo cuando está cargando) */}
        {isFetchingNextPage && (
          <div className="flex justify-center p-2">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500">Cargando mensajes...</span>
            </div>
          </div>
        )}

        {messageGroups.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium">No hay mensajes aún</p>
              <p className="text-xs">Comienza la conversación</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Separador de fecha */}
                <div className="flex justify-center mb-3">
                  <span className="date-separator text-xs text-gray-500 px-3 py-1 rounded-full">
                    {group.date}
                  </span>
                </div>
                
                {/* Mensajes del grupo */}
                <div className="space-y-1 px-3">
                  {group.messages.map((message, messageIndex) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      customerName={customerName}
                      showAvatar={message.direction === 'inbound'}
                      isLastInGroup={
                        messageIndex === group.messages.length - 1 ||
                        group.messages[messageIndex + 1]?.direction !== message.direction
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
            
            {/* Indicador de escritura */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {customerName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">escribiendo...</span>
                </div>
              </div>
            )}
            
            {/* Referencia para scroll automático */}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Botón scroll al final */}
      {showScrollToBottom && (
        <button
          onClick={() => scrollToBottom()}
          className="scroll-button absolute bottom-4 right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center z-10"
        >
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Indicador de scroll discreto */}
      {!isNearBottom && (
        <div className="new-messages-indicator absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
          Nuevos mensajes
        </div>
      )}
    </div>
  );
}; 