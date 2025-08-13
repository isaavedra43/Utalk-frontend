import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import { useConversations } from '../../hooks/useConversations';
import type { ConversationFilters } from '../../types';

export const ConversationList: React.FC = () => {
  const [filters, setFilters] = useState<ConversationFilters>({
    status: 'all',
    priority: 'all',
    search: ''
  });

  const {
    conversations,
    selectedConversationId,
    isLoading,
    selectConversation
  } = useConversations(filters);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (filterType: keyof ConversationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleConversationClick = (conversationId: string) => {
    selectConversation(conversationId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Q Buscar..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Filtros */}
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 text-xs rounded-full ${
              filters.status === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleFilterChange('status', 'all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-full ${
              filters.priority === 'high' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleFilterChange('priority', 'high')}
          >
            New
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-full ${
              filters.assignedTo === 'assigned' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleFilterChange('assignedTo', 'assigned')}
          >
            Asig
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-full ${
              filters.priority === 'urgent' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleFilterChange('priority', 'urgent')}
          >
            Urg
          </button>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            Cargando conversaciones...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No se encontraron conversaciones
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              onClick={handleConversationClick}
            />
          ))
        )}
      </div>
    </div>
  );
}; 