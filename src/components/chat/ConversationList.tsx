import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { ConversationItem } from './ConversationItem';

import { useConversations } from '../../hooks/useConversations';


export const ConversationList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  

  
  const { 
    conversations, 
    selectedConversationId, 
    selectConversation, 
    clearActiveConversation,
    isLoading, 
    isFetchingNextPage,
    hasNextPage,
    loadMoreConversations 
  } = useConversations({
    search: searchTerm,
    status: activeFilter === 'all' ? undefined : activeFilter
  });

  // Función para manejar el scroll infinito
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px antes del final

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      loadMoreConversations();
    }
  }, [hasNextPage, isFetchingNextPage, loadMoreConversations]);

  // Agregar event listener para scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // FASE 3: Optimización - Memoizar filtros para evitar recreaciones
  const filters = useMemo(() => [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'asig', label: 'Asig' },
    { id: 'urg', label: 'Urg' }
  ], []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-2 sm:p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-900">Conversaciones</h2>
          {selectedConversationId && (
            <button
              onClick={clearActiveConversation}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              title="Limpiar selección"
            >
              Limpiar
            </button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-2 sm:mb-3">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value), [])}
            className="w-full pl-7 sm:pl-8 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 sm:space-x-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={useCallback(() => setActiveFilter(filter.id), [filter.id])}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                activeFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List with Infinite Scroll */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0"
      >
        {isLoading ? (
          <div className="p-2 sm:p-3">
            <div className="animate-pulse space-y-2 sm:space-y-3">
              {useMemo(() => [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-2 sm:h-3 bg-gray-300 rounded w-1/2 mt-1 sm:mt-2"></div>
                  </div>
                </div>
              )), [])}
            </div>
          </div>
        ) : conversations.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={useCallback(() => selectConversation(conversation.id), [selectConversation, conversation.id])}
              />
            ))}
          </div>
        ) : (
          useMemo(() => (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  {searchTerm || activeFilter !== 'all' 
                    ? 'No se encontraron conversaciones' 
                    : 'No hay conversaciones'
                  }
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchTerm || activeFilter !== 'all'
                    ? 'Intenta con otros filtros o términos de búsqueda'
                    : 'Las conversaciones aparecerán aquí cuando lleguen mensajes'
                  }
                </p>
              </div>
            </div>
          ), [searchTerm, activeFilter])
        )}

        {/* Indicador de carga más conversaciones */}
        {isFetchingNextPage && (
          <div className="flex justify-center p-4">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500">Cargando más...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 