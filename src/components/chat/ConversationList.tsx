import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search } from 'lucide-react';
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

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'New' },
    { id: 'asig', label: 'Asig' },
    { id: 'urg', label: 'Urg' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-1.5 border-b border-gray-200">
        <h2 className="text-xs font-semibold text-gray-900 mb-1.5">Conversaciones</h2>
        
        {/* Search Bar */}
        <div className="relative mb-1.5">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-3 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
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
        className="flex-1 overflow-y-auto"
      >
        {isLoading ? (
          <div className="p-1.5">
            <div className="animate-pulse space-y-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/2 mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : conversations.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => selectConversation(conversation.id)}
              />
            ))}
            
            {/* Loading indicator for infinite scroll */}
            {isFetchingNextPage && (
              <div className="p-1.5 text-center">
                <div className="inline-flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500">Cargando más conversaciones...</span>
                </div>
              </div>
            )}
            
            {/* End of list indicator */}
            {!hasNextPage && conversations.length > 0 && (
              <div className="p-1.5 text-center">
                <span className="text-xs text-gray-400">No hay más conversaciones</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-1.5 text-center text-gray-500">
            <p className="text-xs">No se encontraron conversaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}; 