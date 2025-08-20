import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { infoLog } from '../../config/logger';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import { CreateConversationModal } from './CreateConversationModal';
import type { Conversation } from '../../types';

// NUEVO: Props para recibir datos de conversaciones
interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  error: Error | null;
  selectConversation: (conversationId: string) => void;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  activeFilter?: string;
  setActiveFilter?: (filter: string) => void;
  onCreateConversation?: (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    message: string;
    attachment?: File;
  }) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  isLoading,
  error,
  selectConversation,
  refetch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  searchTerm: externalSearchTerm,
  setSearchTerm: externalSetSearchTerm,
  activeFilter: externalActiveFilter,
  setActiveFilter: externalSetActiveFilter,
  onCreateConversation
}) => {
  // NUEVO: Usar props externas o estado local
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localActiveFilter, setLocalActiveFilter] = useState('all');
  
  const searchTerm = externalSearchTerm ?? localSearchTerm;
  const setSearchTerm = externalSetSearchTerm ?? setLocalSearchTerm;
  const activeFilter = externalActiveFilter ?? localActiveFilter;
  const setActiveFilter = externalSetActiveFilter ?? setLocalActiveFilter;
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // NUEVO: Estado para mostrar indicador de sincronización
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newConversationIds, setNewConversationIds] = useState<Set<string>>(new Set()); // NUEVO: Trackear conversaciones nuevas
  
  // Estado para el modal de crear conversación
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // NUEVO: Listener para mostrar indicador de sincronización
  useEffect(() => {
    const handleSyncStart = () => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000); // Ocultar después de 2 segundos
    };

    const handleSyncEnd = () => {
      setIsSyncing(false);
    };

    // NUEVO: Listener para actualizaciones en tiempo real
    const handleWebhookNewMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      infoLog('📨 ConversationList - Recibido evento webhook:new-message:', detail);
      setLastUpdate(new Date());
      
      // NUEVO: Agregar conversación nueva al set de tracking
      if (detail?.conversationId) {
        setNewConversationIds(prev => new Set([...prev, detail.conversationId]));
        
        // Remover después de 3 segundos
        setTimeout(() => {
          setNewConversationIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(detail.conversationId);
            return newSet;
          });
        }, 3000);
      }
      
      // Mostrar indicador de actualización
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 1000);
    };

    // NUEVO: Listener para nuevas conversaciones agregadas
    const handleNewConversationAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      infoLog('🆕 ConversationList - Nueva conversación agregada:', detail);
      
      if (detail?.conversationId) {
        setNewConversationIds(prev => new Set([...prev, detail.conversationId]));
        
        // Remover después de 3 segundos
        setTimeout(() => {
          setNewConversationIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(detail.conversationId);
            return newSet;
          });
        }, 3000);
      }
    };

    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener('sync-end', handleSyncEnd);
    window.addEventListener('webhook:new-message', handleWebhookNewMessage);
    window.addEventListener('new-conversation-added', handleNewConversationAdded);

    return () => {
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener('sync-end', handleSyncEnd);
      window.removeEventListener('webhook:new-message', handleWebhookNewMessage);
      window.removeEventListener('new-conversation-added', handleNewConversationAdded);
    };
  }, []);

  // Función para manejar el scroll infinito
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px antes del final

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  // NUEVO: Indicador de última actualización
  const lastUpdateText = useMemo(() => {
    if (!lastUpdate) return null;
    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `Actualizado hace ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `Actualizado hace ${minutes}m`;
  }, [lastUpdate]);

  // Función para manejar cambios en el input de búsqueda
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  // Función para manejar cambios de filtro
  const handleFilterChange = useCallback((filterId: string) => {
    setActiveFilter(filterId);
  }, [setActiveFilter]);

  // Función para manejar clic en conversación
  const handleConversationClick = useCallback((conversationId: string) => {
    selectConversation(conversationId);
  }, [selectConversation]);

  // Función para manejar creación de conversación
  const handleCreateConversation = useCallback(async (data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    message: string;
    attachment?: File;
  }) => {
    if (!onCreateConversation) return;
    
    setIsCreatingConversation(true);
    try {
      await onCreateConversation(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creando conversación:', error);
    } finally {
      setIsCreatingConversation(false);
    }
  }, [onCreateConversation]);

  // Memoizar el skeleton de carga
  const loadingSkeleton = useMemo(() => (
    <div className="p-2 sm:p-3">
      <div className="animate-pulse space-y-2 sm:space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ), []);

  // Memoizar conversaciones filtradas
  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation: Conversation) => {
      // Filtro por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          (conversation.customerName?.toLowerCase() || '').includes(searchLower) ||
          conversation.customerPhone.includes(searchLower) ||
          (conversation.lastMessage?.content?.toLowerCase() || '').includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro por estado
      if (activeFilter && activeFilter !== 'all') {
        if (conversation.status !== activeFilter) return false;
      }

      return true;
    });
  }, [conversations, searchTerm, activeFilter]);

  // Obtener el ID de la conversación seleccionada
  const selectedConversationId = activeConversation?.id || null;

  if (isLoading) {
    return (
      <div className="h-full bg-white">
        <div className="p-3 border-b border-gray-200">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="flex space-x-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded w-12"></div>
              ))}
            </div>
          </div>
        </div>
        {loadingSkeleton}
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar conversaciones</h3>
          <p className="text-gray-500 mb-4">{error.message}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-semibold text-gray-900">Conversaciones</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Crear nueva conversación"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-1">
            {isSyncing && (
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Sincronizando...</span>
              </div>
            )}
            {lastUpdateText && (
              <div className="text-xs text-gray-500">
                {lastUpdateText}
              </div>
            )}
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className="flex space-x-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                activeFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto no-scrollbar" ref={scrollContainerRef}>
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Las conversaciones aparecerán aquí cuando lleguen nuevos mensajes'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2 sm:p-3">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                isNewConversation={newConversationIds.has(conversation.id)} // Pasar la prop isNew
              />
            ))}
            
            {/* Indicador de carga para scroll infinito */}
            {isFetchingNextPage && (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para crear conversación */}
      <CreateConversationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateConversation}
        isLoading={isCreatingConversation}
      />
    </div>
  );
}; 