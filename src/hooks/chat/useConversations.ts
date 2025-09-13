import type { ConversationFilters } from '../../types';
import { useConversationList } from './useConversationList';
import { useConversationSync } from './useConversationSync';
import { useConversationActions } from './useConversationActions';

/**
 * Hook compositor que combina todas las funcionalidades de conversaciones
 * 
 * Este hook es el punto de entrada principal para todas las operaciones
 * relacionadas con conversaciones. Combina los hooks específicos:
 * - useConversationList: Lista, paginación y filtros
 * - useConversationSync: Sincronización WebSocket
 * - useConversationActions: Acciones CRUD
 * 
 * @param filters - Filtros opcionales para la lista de conversaciones
 * @returns Objeto con todas las funcionalidades combinadas
 */
export const useConversations = (filters?: ConversationFilters) => {
  // Combinar todos los hooks específicos
  const listHook = useConversationList(filters);
  const syncHook = useConversationSync();
  const actionsHook = useConversationActions();

  // Retornar todas las funcionalidades combinadas
  return {
    // Datos de conversaciones (de useConversationList)
    conversations: listHook.conversations,
    activeConversation: listHook.activeConversation,
    isLoading: listHook.isLoading,
    isFetchingNextPage: listHook.isFetchingNextPage,
    hasNextPage: listHook.hasNextPage,
    error: listHook.error,
    urlConversationId: listHook.urlConversationId,

    // Acciones de lista (de useConversationList)
    setActiveConversation: listHook.setActiveConversation,
    fetchNextPage: listHook.fetchNextPage,
    refetch: listHook.refetch,

    // Sincronización (de useConversationSync)
    isSynced: syncHook.isSynced,
    canSync: syncHook.canSync,
    syncWithServer: syncHook.syncWithServer,
    manager: syncHook.manager,

    // Acciones CRUD (de useConversationActions)
    selectConversation: actionsHook.selectConversation,
    deselectConversation: actionsHook.deselectConversation,
    clearConversationFromUrl: actionsHook.clearConversationFromUrl,
    updateConversationData: actionsHook.updateConversationData,
    refreshConversations: actionsHook.refreshConversations,
    markConversationAsRead: actionsHook.markConversationAsRead,
  };
}; 