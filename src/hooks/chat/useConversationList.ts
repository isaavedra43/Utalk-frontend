import { useMemo, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import type { ConversationFilters } from '../../types';
import { conversationsService } from '../../services/conversations';
import { useChatStore } from '../../stores/useChatStore';
import { useAuthContext } from '../../contexts/useAuthContext';
// import { encodeConversationIdForUrl } from '../../utils/conversationUtils'; // Removido - no se usa
import { infoLog } from '../../config/logger';

export const useConversationList = (filters: ConversationFilters = {}) => {
  const { isAuthenticated, loading: authLoading, isAuthenticating } = useAuthContext();
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

  // REMOVIDO: useEffect movido después de la declaración de allConversations

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
    // ARREGLADO: Solo habilitar cuando realmente esté autenticado y no esté cargando
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

  // ELIMINADO: Sincronización automática con URL que causaba apertura automática de conversaciones
  // Ahora el agente debe seleccionar manualmente las conversaciones
  // useEffect(() => {
  //   if (urlConversationId && urlConversationId !== activeConversation?.id) {
  //     // Buscar la conversación en la lista actual
  //     const conversation = allConversations.find(c => c.id === urlConversationId);
  //     if (conversation) {
  //       infoLog('🔄 useConversationList - Sincronizando conversación desde URL:', urlConversationId);
  //       setActiveConversation(conversation);
  //     }
  //   }
  // }, [urlConversationId, activeConversation?.id, allConversations, setActiveConversation]);

  // Sincronizar datos de React Query al store
  useEffect(() => {
    if (isAuthenticated && !authLoading && conversationsData?.pages) {
      const queryConversations = conversationsData.pages.flatMap(page => page.conversations);
      
      // CRÍTICO: Siempre sincronizar con el backend, incluso si devuelve lista vacía
      // Esto limpia conversaciones obsoletas del store local
      setConversations(queryConversations);
      
      if (queryConversations.length === 0) {
        infoLog('🧹 useConversationList - Backend devolvió lista vacía, limpiando store local');
        // Si no hay conversaciones en el backend, limpiar también la conversación activa
        setActiveConversation(null);
        
        // Limpiar también el caché del navegador para evitar conversaciones persistentes
        if (typeof window !== 'undefined') {
          try {
            // Limpiar localStorage relacionado con conversaciones
            Object.keys(localStorage).forEach(key => {
              if (key.includes('conversation') || key.includes('chat')) {
                localStorage.removeItem(key);
              }
            });
            
            // Limpiar sessionStorage relacionado con conversaciones
            Object.keys(sessionStorage).forEach(key => {
              if (key.includes('conversation') || key.includes('chat')) {
                sessionStorage.removeItem(key);
              }
            });
            
            infoLog('🧹 useConversationList - Caché del navegador limpiado');
          } catch (error) {
            console.warn('⚠️ Error limpiando caché del navegador:', error);
          }
        }
      } else {
        infoLog('✅ useConversationList - Conversaciones sincronizadas:', queryConversations.length);
      }
    }
  }, [conversationsData?.pages, setConversations, setActiveConversation, isAuthenticated, authLoading]);

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
  }, [setConversations, setActiveConversation, get]);

  // NOTA: Se elimina el cleanup automático de la URL para no borrar '?conversation' mientras se resuelve la selección.

  // NUEVO: Protección contra estado de autenticación inválido - MOVIDO AL FINAL
  const isAuthValid = isAuthenticated && !authLoading && !isAuthenticating;

  // NUEVO: Return condicional al final, después de que todos los hooks se hayan llamado
  if (!isAuthValid) {
    return {
      conversations: [],
      activeConversation: null,
      isLoading: true,
      isFetchingNextPage: false,
      hasNextPage: false,
      error: null,
      setActiveConversation: () => {},
      fetchNextPage: () => Promise.resolve(),
      refetch: () => Promise.resolve(),
      urlConversationId: null
    };
  }

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