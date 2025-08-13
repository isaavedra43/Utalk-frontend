import { useCallback, useEffect, useMemo } from 'react';
import { useMutation, useInfiniteQuery } from '@tanstack/react-query';
import type { Conversation, ConversationFilters } from '../types';
import { conversationsService } from '../services/conversations';
import { useAppStore } from '../stores/useAppStore';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuth } from '../modules/auth/hooks/useAuth';

export const useConversations = (filters: ConversationFilters = {}) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    activeConversation,
    setConversations,
    setActiveConversation,
    updateConversation: updateStoreConversation
  } = useAppStore();

  // WebSocket context
  const { on, off } = useWebSocketContext();

  // Infinite Query para obtener conversaciones con paginación - solo si está autenticado
  const {
    data: conversationsData,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['conversations', filters],
    queryFn: ({ pageParam = 1 }) => conversationsService.getConversations({
      ...filters,
      page: pageParam,
      limit: 20 // Cargar 20 conversaciones por página
    } as ConversationFilters & { page: number; limit: number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
    enabled: isAuthenticated && !authLoading, // Solo ejecutar si está autenticado y no está cargando
    retry: (failureCount, error) => {
      // No reintentar si es un error de autenticación
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (apiError.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 3;
    }
  });

  // Aplanar todas las conversaciones de todas las páginas
  const allConversations = useMemo(() => 
    conversationsData?.pages.flatMap(page => page.conversations) || [], 
    [conversationsData?.pages]
  );

  // Sincronizar datos del store con la query - solo si está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading && allConversations.length > 0) {
      setConversations(allConversations);
    }
  }, [allConversations, setConversations, isAuthenticated, authLoading]);

  // Escuchar eventos de conversación en tiempo real - solo si está autenticado
  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const handleConversationEvent = (data: unknown) => {
      const eventData = data as { conversationId: string; [key: string]: unknown };
      console.log('💬 Evento de conversación recibido:', eventData);
      
      // Actualizar conversación en el store
      updateStoreConversation(eventData.conversationId, eventData as Partial<Conversation>);
      
      // Refetch para obtener datos actualizados
      refetch();
    };

    const handleNewMessage = (data: unknown) => {
      const eventData = data as { conversationId: string; message: { content: string; timestamp: string } };
      console.log('📨 Nuevo mensaje en conversación:', eventData);
      
      // Actualizar conversación con el último mensaje
      updateStoreConversation(eventData.conversationId, {
        lastMessage: {
          content: eventData.message.content,
          direction: 'inbound',
          messageId: `temp-${Date.now()}`,
          sender: 'customer',
          timestamp: eventData.message.timestamp
        },
        lastMessageAt: eventData.message.timestamp,
        unreadCount: (allConversations.find(c => c.id === eventData.conversationId)?.unreadCount || 0) + 1
      });
      
      // Refetch para obtener datos actualizados
      refetch();
    };

    const handleMessageRead = (data: unknown) => {
      const eventData = data as { conversationId: string; messageIds: string[] };
      console.log('✅ Mensajes marcados como leídos:', eventData);
      
      // Actualizar conversación reduciendo el contador de no leídos
      const conversation = allConversations.find(c => c.id === eventData.conversationId);
      if (conversation) {
        updateStoreConversation(eventData.conversationId, {
          unreadCount: Math.max(0, conversation.unreadCount - eventData.messageIds.length)
        });
      }
    };

    // Registrar listeners
    on('conversation-event', handleConversationEvent);
    on('new-message', handleNewMessage);
    on('message-read', handleMessageRead);

    return () => {
      // Limpiar listeners
      off('conversation-event');
      off('new-message');
      off('message-read');
    };
  }, [on, off, updateStoreConversation, refetch, allConversations, isAuthenticated, authLoading]);

  // Seleccionar automáticamente la primera conversación si no hay ninguna seleccionada - solo si está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading && !activeConversation && allConversations.length > 0) {
      setActiveConversation(allConversations[0]);
    }
  }, [activeConversation, allConversations, setActiveConversation, isAuthenticated, authLoading]);

  // Mutation para actualizar conversación
  const updateConversationMutation = useMutation({
    mutationFn: ({ conversationId, updateData }: { conversationId: string; updateData: Partial<Conversation> }) =>
      conversationsService.updateConversation(conversationId, updateData),
    onSuccess: (updatedConversation, variables) => {
      // Actualizar tanto el store como refetch
      updateStoreConversation(variables.conversationId, updatedConversation);
      refetch();
    }
  });

  // Mutation para marcar como leído
  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: string) => conversationsService.markConversationAsRead(conversationId),
    onSuccess: (updatedConversation, variables) => {
      // Actualizar tanto el store como refetch
      updateStoreConversation(variables, updatedConversation);
      refetch();
    }
  });

  // Mutation para cambiar estado
  const changeStatusMutation = useMutation({
    mutationFn: ({ conversationId, status }: { conversationId: string; status: string }) =>
      conversationsService.changeConversationStatus(conversationId, status),
    onSuccess: (updatedConversation, variables) => {
      // Actualizar tanto el store como refetch
      updateStoreConversation(variables.conversationId, updatedConversation);
      refetch();
    }
  });

  // Función para seleccionar conversación
  const selectConversation = useCallback((conversationId: string) => {
    const conversation = allConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setActiveConversation(conversation);
    }
  }, [allConversations, setActiveConversation]);

  // Función para cargar más conversaciones (scroll infinito)
  const loadMoreConversations = useCallback(() => {
    if (isAuthenticated && !authLoading && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isAuthenticated, authLoading]);

  // Función para obtener conversación seleccionada
  const selectedConversation = activeConversation;
  const selectedConversationId = activeConversation?.id || null;

  // Función para filtrar conversaciones
  const filteredConversations = allConversations.filter(conversation => {
    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        conversation.customerName.toLowerCase().includes(searchLower) ||
        conversation.customerPhone.includes(searchLower) ||
        conversation.lastMessage?.content.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro por estado
    if (filters.status && filters.status !== 'all') {
      if (conversation.status !== filters.status) return false;
    }

    // Filtro por prioridad
    if (filters.priority && filters.priority !== 'all') {
      if (conversation.priority !== filters.priority) return false;
    }

    // Filtro por asignación
    if (filters.assignedTo && filters.assignedTo !== 'all') {
      if (conversation.assignedTo !== filters.assignedTo) return false;
    }

    return true;
  });

  // Estadísticas - solo si está autenticado
  const stats = useMemo(() => ({
    total: conversationsData?.pages[0]?.total || 0,
    unread: filteredConversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
    assigned: filteredConversations.filter(conv => conv.assignedTo).length,
    urgent: filteredConversations.filter(conv => conv.priority === 'urgent').length,
    open: filteredConversations.filter(conv => conv.status === 'open').length
  }), [conversationsData?.pages, filteredConversations]);

  return {
    // Datos
    conversations: filteredConversations,
    selectedConversation,
    selectedConversationId,
    stats,
    
    // Estados
    isLoading: isLoading || authLoading || !isAuthenticated, // Mostrar loading si no está autenticado o está cargando
    error,
    isFetchingNextPage,
    hasNextPage,
    
    // Acciones
    selectConversation,
    loadMoreConversations,
    refetch,
    updateConversation: updateConversationMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    changeStatus: changeStatusMutation.mutate,
    
    // Estados de mutaciones
    isUpdating: updateConversationMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
    isChangingStatus: changeStatusMutation.isPending
  };
}; 