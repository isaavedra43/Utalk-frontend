import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useInfiniteQuery } from '@tanstack/react-query';
import type { Conversation, ConversationFilters } from '../types';
import { conversationsService } from '../services/conversations';
import { useAppStore } from '../stores/useAppStore';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuthContext } from '../contexts/useAuthContext';
import { sanitizeConversationId, logConversationId, encodeConversationIdForUrl } from '../utils/conversationUtils';

export const useConversations = (filters: ConversationFilters = {}) => {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const {
    activeConversation,
    setConversations,
    setActiveConversation,
    updateConversation: updateStoreConversation
  } = useAppStore();

  // WebSocket context
  const { on, off, emit, isConnected } = useWebSocketContext();

  // Estados para controlar la sincronización
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoizar filters para evitar re-renders innecesarios
  const memoizedFilters = useMemo(() => filters, [filters]);

  // Memoizar la función de sincronización con debouncing - OPTIMIZADO PARA REDUCIR PETICIONES
  const debouncedSync = useCallback((reason?: string) => {
    // Limpiar timeout anterior si existe
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Evitar sincronizaciones muy frecuentes (mínimo 5 segundos entre sincronizaciones)
    const now = Date.now();
    if (now - lastSyncTime < 5000) {
      console.log('🔄 useConversations - Sincronización ignorada (muy frecuente)');
      return;
    }

    // Debouncing de 1000ms para reducir peticiones
    syncTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && !authLoading && isConnected) {
        console.log('🔄 useConversations - Sincronizando estado inicial...', { reason });
        setLastSyncTime(Date.now());
        emit('sync-state', { 
          lastSync: new Date().toISOString(),
          filters: memoizedFilters,
          reason
        });
      }
    }, 1000);
  }, [isAuthenticated, authLoading, isConnected, emit, memoizedFilters, lastSyncTime]);

  // SINCRONIZACIÓN INICIAL - OPTIMIZADA CON CONDICIONES DE SALIDA
  useEffect(() => {
    // Solo sincronizar si no se ha hecho la sincronización inicial
    if (isAuthenticated && !authLoading && isConnected && !isInitialSyncDone) {
      console.log('🔄 useConversations - Sincronización inicial...');
      setIsInitialSyncDone(true);
      debouncedSync('initial');
    }
  }, [isAuthenticated, authLoading, isConnected, isInitialSyncDone, debouncedSync]);

  // ESCUCHAR RESPUESTA DE SINCRONIZACIÓN - OPTIMIZADO
  const handleStateSynced = useCallback((data: unknown) => {
    const syncData = data as { 
      conversations: Conversation[]; 
      messages: unknown[]; 
      users: unknown[]; 
      timestamp: string 
    };
    console.log('✅ useConversations - Estado sincronizado:', syncData);
    
    // Actualizar conversaciones con datos del servidor
    if (syncData.conversations && syncData.conversations.length > 0) {
      console.log('📋 useConversations - Actualizando conversaciones sincronizadas:', syncData.conversations.length);
      setConversations(syncData.conversations);
    }
  }, [setConversations]);

  useEffect(() => {
    // Registrar listener para sincronización
    on('state-synced', handleStateSynced);

    return () => {
      off('state-synced');
    };
  }, [on, off, handleStateSynced]);

  // ESCUCHAR EVENTOS PERSONALIZADOS DE SINCRONIZACIÓN - OPTIMIZADO
  const handleWebSocketStateSynced = useCallback((e: CustomEvent) => {
    const syncData = e.detail as { 
      conversations: Conversation[]; 
      messages: unknown[]; 
      users: unknown[]; 
      timestamp: string 
    };
    console.log('✅ useConversations - Estado sincronizado desde WebSocket:', syncData);
    
    // Actualizar conversaciones con datos del servidor
    if (syncData.conversations && syncData.conversations.length > 0) {
      console.log('📋 useConversations - Actualizando conversaciones sincronizadas:', syncData.conversations.length);
      setConversations(syncData.conversations);
    }
  }, [setConversations]);

  const handleWebSocketSyncRequired = useCallback((e: CustomEvent) => {
    const syncData = e.detail as { reason: string; timestamp: string };
    console.log('🔄 useConversations - Sincronización requerida desde WebSocket:', syncData);
    
    // Re-sincronizar estado con debouncing
    debouncedSync(syncData.reason);
  }, [debouncedSync]);

  useEffect(() => {
    // Registrar listeners de eventos personalizados
    window.addEventListener('websocket:state-synced', handleWebSocketStateSynced as EventListener);
    window.addEventListener('websocket:sync-required', handleWebSocketSyncRequired as EventListener);

    return () => {
      // Limpiar listeners
      window.removeEventListener('websocket:state-synced', handleWebSocketStateSynced as EventListener);
      window.removeEventListener('websocket:sync-required', handleWebSocketSyncRequired as EventListener);
    };
  }, [handleWebSocketStateSynced, handleWebSocketSyncRequired]);

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
    queryKey: ['conversations', memoizedFilters],
    queryFn: ({ pageParam = 1 }) => conversationsService.getConversations({
      ...memoizedFilters,
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

  // Memoizar handlers de eventos para evitar recreaciones
  const handleConversationEvent = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; [key: string]: unknown };
    console.log('💬 useConversations - Evento de conversación recibido:', eventData);
    
    // Actualizar conversación en el store
    updateStoreConversation(eventData.conversationId, eventData as Partial<Conversation>);
    
    // Refetch para obtener datos actualizados
    refetch();
  }, [updateStoreConversation, refetch]);

  const handleNewMessage = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; message: { content: string; timestamp: string; sender: string } };
    console.log('📨 useConversations - Nuevo mensaje en conversación:', eventData);
    
    // Actualizar conversación con el último mensaje
    updateStoreConversation(eventData.conversationId, {
      lastMessage: {
        content: eventData.message.content,
        direction: 'inbound',
        messageId: `temp-${Date.now()}`,
        sender: eventData.message.sender,
        timestamp: eventData.message.timestamp
      },
      lastMessageAt: eventData.message.timestamp,
      unreadCount: (allConversations.find(c => c.id === eventData.conversationId)?.unreadCount || 0) + 1
    });
    
    // Refetch para obtener datos actualizados
    refetch();
  }, [updateStoreConversation, refetch, allConversations]);

  const handleMessageRead = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; messageIds: string[]; readBy: string };
    console.log('✅ useConversations - Mensajes marcados como leídos:', eventData);
    
    // Actualizar conversación reduciendo el contador de no leídos
    const conversation = allConversations.find(c => c.id === eventData.conversationId);
    if (conversation) {
      const newUnreadCount = Math.max(0, conversation.unreadCount - eventData.messageIds.length);
      updateStoreConversation(eventData.conversationId, {
        unreadCount: newUnreadCount
      });
    }
  }, [updateStoreConversation, allConversations]);

  const handleConversationJoined = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; roomId: string; onlineUsers: string[]; timestamp: string };
    console.log('🔗 useConversations - Usuario unido a conversación:', eventData);
    
    // Actualizar conversación con información de actividad
    updateStoreConversation(eventData.conversationId, {
      updatedAt: eventData.timestamp
    });
  }, [updateStoreConversation]);

  const handleConversationLeft = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; timestamp: string };
    console.log('🔌 useConversations - Usuario salió de conversación:', eventData);
    
    // Actualizar conversación con última actividad
    updateStoreConversation(eventData.conversationId, {
      updatedAt: eventData.timestamp
    });
  }, [updateStoreConversation]);

  // Escuchar eventos de conversación en tiempo real - solo si está autenticado
  useEffect(() => {
    if (!isAuthenticated || authLoading || !isConnected) return;

    // Registrar listeners
    on('conversation-event', handleConversationEvent);
    on('new-message', handleNewMessage);
    on('message-read', handleMessageRead);
    on('conversation-joined', handleConversationJoined);
    on('conversation-left', handleConversationLeft);

    return () => {
      // Limpiar listeners
      off('conversation-event');
      off('new-message');
      off('message-read');
      off('conversation-joined');
      off('conversation-left');
    };
  }, [on, off, handleConversationEvent, handleNewMessage, handleMessageRead, handleConversationJoined, handleConversationLeft, isAuthenticated, authLoading, isConnected]);

  // Seleccionar automáticamente la primera conversación si no hay ninguna seleccionada - solo si está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading && !activeConversation && allConversations.length > 0) {
      setActiveConversation(allConversations[0]);
    }
  }, [activeConversation, allConversations, setActiveConversation, isAuthenticated, authLoading]);

  // Mutation para actualizar conversación
  const updateConversationMutation = useMutation({
    mutationFn: ({ conversationId, updateData }: { conversationId: string; updateData: Partial<Conversation> }) => {
      // CORREGIDO: Codificar conversationId para URL
      const sanitizedId = sanitizeConversationId(conversationId);
      if (!sanitizedId) {
        throw new Error(`ID de conversación inválido: ${conversationId}`);
      }
      const encodedId = encodeConversationIdForUrl(sanitizedId);
      return conversationsService.updateConversation(encodedId, updateData);
    },
    onSuccess: (updatedConversation, variables) => {
      // Actualizar tanto el store como refetch
      updateStoreConversation(variables.conversationId, updatedConversation);
      refetch();
    }
  });

  // Mutation para marcar como leído
  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: string) => {
      // CORREGIDO: Codificar conversationId para URL
      const sanitizedId = sanitizeConversationId(conversationId);
      if (!sanitizedId) {
        throw new Error(`ID de conversación inválido: ${conversationId}`);
      }
      const encodedId = encodeConversationIdForUrl(sanitizedId);
      return conversationsService.markConversationAsRead(encodedId);
    },
    onSuccess: (updatedConversation, variables) => {
      // Actualizar tanto el store como refetch
      updateStoreConversation(variables, updatedConversation);
      refetch();
    }
  });

  // Mutation para cambiar estado
  const changeStatusMutation = useMutation({
    mutationFn: ({ conversationId, status }: { conversationId: string; status: string }) => {
      // CORREGIDO: Codificar conversationId para URL
      const sanitizedId = sanitizeConversationId(conversationId);
      if (!sanitizedId) {
        throw new Error(`ID de conversación inválido: ${conversationId}`);
      }
      const encodedId = encodeConversationIdForUrl(sanitizedId);
      return conversationsService.changeConversationStatus(encodedId, status);
    },
    onSuccess: (updatedConversation, variables) => {
      // Actualizar tanto el store como refetch
      updateStoreConversation(variables.conversationId, updatedConversation);
      refetch();
    }
  });

  // Función para seleccionar conversación
  const selectConversation = useCallback((conversationId: string) => {
    // Validar y sanitizar el ID de conversación
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      console.error('❌ useConversations - ID de conversación inválido:', conversationId);
      return;
    }

    logConversationId(sanitizedId, 'selectConversation');
    const conversation = allConversations.find(conv => conv.id === sanitizedId);
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
  const filteredConversations = useMemo(() => allConversations.filter(conversation => {
    // Filtro por búsqueda
    if (memoizedFilters.search) {
      const searchLower = memoizedFilters.search.toLowerCase();
      const matchesSearch = 
        (conversation.customerName?.toLowerCase() || '').includes(searchLower) ||
        conversation.customerPhone.includes(searchLower) ||
        (conversation.lastMessage?.content?.toLowerCase() || '').includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filtro por estado
    if (memoizedFilters.status && memoizedFilters.status !== 'all') {
      if (conversation.status !== memoizedFilters.status) return false;
    }

    // Filtro por prioridad
    if (memoizedFilters.priority && memoizedFilters.priority !== 'all') {
      if (conversation.priority !== memoizedFilters.priority) return false;
    }

    // Filtro por asignación
    if (memoizedFilters.assignedTo && memoizedFilters.assignedTo !== 'all') {
      if (conversation.assignedTo !== memoizedFilters.assignedTo) return false;
    }

    return true;
  }), [allConversations, memoizedFilters]);

  // Estadísticas - solo si está autenticado
  const stats = useMemo(() => ({
    total: conversationsData?.pages[0]?.total || 0,
    unread: filteredConversations.reduce((sum, conv) => sum + (conv?.unreadCount || 0), 0),
    assigned: filteredConversations.filter(conv => conv?.assignedTo).length,
    urgent: filteredConversations.filter(conv => conv?.priority === 'urgent').length,
    open: filteredConversations.filter(conv => conv?.status === 'open').length
  }), [conversationsData?.pages, filteredConversations]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

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