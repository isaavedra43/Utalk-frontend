import { useMemo, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ConversationFilters } from '../../types';
import { conversationsService } from '../../services/conversations';
import { useChatStore } from '../../stores/useChatStore';
import { useAuthContext } from '../../contexts/useAuthContext';
import { encodeConversationIdForUrl } from '../../utils/conversationUtils';
import { infoLog } from '../../config/logger';

export const useConversationList = (filters: ConversationFilters = {}) => {
  const { isAuthenticated, loading: authLoading, isAuthenticating } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    conversations: storeConversations,
    activeConversation,
    setConversations,
    setActiveConversation
  } = useChatStore();
  
  const get = useChatStore.getState;

  // Memoizar filters para evitar re-renders innecesarios
  const memoizedFilters = useMemo(() => filters, [filters]);

  // Sincronización con URL - Extraer conversationId de la URL
  const urlConversationId = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const conversationId = searchParams.get('conversation');
    return conversationId ? decodeURIComponent(conversationId) : null;
  }, [location.search]);

  // Sincronizar URL con conversación seleccionada
  useEffect(() => {
    if (activeConversation?.id && activeConversation.id !== urlConversationId) {
      const encodedId = encodeConversationIdForUrl(activeConversation.id);
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('conversation', encodedId);
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    }
  }, [activeConversation?.id, urlConversationId, navigate, location.pathname, location.search]);

  // Infinite Query para obtener conversaciones - SOLO DESPUÉS DEL LOGIN
  const {
    data: conversationsData,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['conversations', memoizedFilters],
    queryFn: ({ pageParam = 1 }) => conversationsService.getConversations({
      ...memoizedFilters,
      page: pageParam,
      limit: 20
    } as ConversationFilters & { page: number; limit: number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: isAuthenticated && !authLoading && !isAuthenticating,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    }
  });

  // Combinar conversaciones del store y React Query
  const allConversations = useMemo(() => {
    const queryConversations = conversationsData?.pages.flatMap(page => page.conversations) || [];
    
    // Combinar conversaciones del store y React Query
    const allConversations = [...storeConversations, ...queryConversations];
    
    // Combinar y deduplicar conversaciones por ID
    const uniqueConversations = allConversations.reduce((acc, conversation) => {
      const existingIndex = acc.findIndex(conv => conv.id === conversation.id);
      
      if (existingIndex === -1) {
        acc.push(conversation);
      } else {
        const existing = acc[existingIndex];
        const existingTime = new Date(existing.lastMessageAt || existing.createdAt).getTime();
        const newTime = new Date(conversation.lastMessageAt || conversation.createdAt).getTime();
        
        if (newTime > existingTime) {
          acc[existingIndex] = conversation;
        }
      }
      
      return acc;
    }, [] as typeof allConversations);
    
    return uniqueConversations;
  }, [conversationsData?.pages, storeConversations]);

  // Sincronizar datos de React Query al store solo para carga inicial
  useEffect(() => {
    if (isAuthenticated && !authLoading && conversationsData?.pages && storeConversations.length === 0) {
      const queryConversations = conversationsData.pages.flatMap(page => page.conversations);
      if (queryConversations.length > 0) {
        setConversations(queryConversations);
      }
    }
  }, [conversationsData?.pages, setConversations, isAuthenticated, authLoading, storeConversations.length]);

  // Manejar eventos de nuevas conversaciones
  useEffect(() => {
    const handleConversationCreated = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      infoLog('🆕 ConversationList - Conversación creada:', detail);
      
      if (detail?.conversation) {
        // Agregar la nueva conversación al store
        // Obtener conversaciones actuales y agregar la nueva
        const currentConversations = get().conversations;
        const exists = currentConversations.find((conv) => conv.id === detail.conversation.id);
        if (!exists) {
          setConversations([detail.conversation, ...currentConversations]);
        }
        
        // Seleccionar la conversación si se solicita
        if (detail.shouldSelect) {
          setActiveConversation(detail.conversation);
        }
      }
    };

    window.addEventListener('conversation-created', handleConversationCreated);

    return () => {
      window.removeEventListener('conversation-created', handleConversationCreated);
    };
  }, [setConversations, setActiveConversation]);

  // NOTA: Se elimina el cleanup automático de la URL para no borrar '?conversation' mientras se resuelve la selección.

  return {
    // Datos de conversaciones
    conversations: allConversations,
    activeConversation,
    
    // Estado de carga
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    
    // Acciones
    setActiveConversation,
    fetchNextPage,
    refetch,
    
    // URL sync
    urlConversationId
  };
}; 