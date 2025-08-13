import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { Conversation, ConversationFilters } from '../types';
import { conversationsService, mockConversations } from '../services/conversations';

export const useConversations = (filters: ConversationFilters = {}) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Query para obtener conversaciones
  const {
    data: conversationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['conversations', filters],
    queryFn: () => conversationsService.getConversations(filters),
    // Por ahora usar datos mock mientras no hay backend
    initialData: {
      conversations: mockConversations,
      total: mockConversations.length,
      page: 1,
      limit: 50,
      hasMore: false
    },
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false
  });

  // Mutation para actualizar conversación
  const updateConversationMutation = useMutation({
    mutationFn: ({ conversationId, updateData }: { conversationId: string; updateData: Partial<Conversation> }) =>
      conversationsService.updateConversation(conversationId, updateData),
    onSuccess: () => {
      // Refetch para obtener datos actualizados
      refetch();
    }
  });

  // Mutation para marcar como leído
  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: string) => conversationsService.markConversationAsRead(conversationId),
    onSuccess: () => {
      // Refetch para obtener datos actualizados
      refetch();
    }
  });

  // Mutation para cambiar estado
  const changeStatusMutation = useMutation({
    mutationFn: ({ conversationId, status }: { conversationId: string; status: string }) =>
      conversationsService.changeConversationStatus(conversationId, status),
    onSuccess: () => {
      // Refetch para obtener datos actualizados
      refetch();
    }
  });

  // Función para seleccionar conversación
  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);

  // Función para obtener conversación seleccionada
  const selectedConversation = conversationsData?.conversations.find(
    conv => conv.id === selectedConversationId
  ) || null;

  // Función para filtrar conversaciones
  const filteredConversations = conversationsData?.conversations.filter(conversation => {
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
  }) || [];

  // Estadísticas
  const stats = {
    total: conversationsData?.total || 0,
    unread: filteredConversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
    assigned: filteredConversations.filter(conv => conv.assignedTo).length,
    urgent: filteredConversations.filter(conv => conv.priority === 'urgent').length,
    open: filteredConversations.filter(conv => conv.status === 'open').length
  };

  return {
    // Datos
    conversations: filteredConversations,
    selectedConversation,
    selectedConversationId,
    stats,
    
    // Estados
    isLoading,
    error,
    
    // Acciones
    selectConversation,
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