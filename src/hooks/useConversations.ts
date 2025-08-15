import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Conversation, ConversationFilters } from '../types';
import { conversationsService } from '../services/conversations';
import { useAppStore } from '../stores/useAppStore';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuthContext } from '../contexts/useAuthContext';
import { sanitizeConversationId, logConversationId, encodeConversationIdForUrl } from '../utils/conversationUtils';

export const useConversations = (filters: ConversationFilters = {}) => {
  const { isAuthenticated, loading: authLoading, isAuthenticating } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    activeConversation,
    setConversations,
    setActiveConversation,
    updateConversation: updateStoreConversation
  } = useAppStore();

  // WebSocket context
  const { on, off, emit, isConnected } = useWebSocketContext();

  // Estados para controlar la sincronización - CORREGIDO PARA EVITAR MÚLTIPLES EJECUCIONES
  const [isInitialSyncDone, setIsInitialSyncDone] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef<boolean>(false); // NUEVO: Flag para evitar múltiples inicializaciones

  // Memoizar filters para evitar re-renders innecesarios
  const memoizedFilters = useMemo(() => filters, [filters]);

  // NUEVO: Sincronización con URL - Extraer conversationId de la URL
  const urlConversationId = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const conversationId = searchParams.get('conversation');
    return conversationId ? decodeURIComponent(conversationId) : null;
  }, [location.search]);

  // NUEVO: Sincronizar URL con conversación seleccionada
  useEffect(() => {
    if (activeConversation?.id && activeConversation.id !== urlConversationId) {
      const encodedId = encodeConversationIdForUrl(activeConversation.id);
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('conversation', encodedId);
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    }
  }, [activeConversation?.id, urlConversationId, navigate, location.pathname, location.search]);



  // Memoizar la función de sincronización con debouncing - OPTIMIZADO PARA REDUCIR PETICIONES
  const debouncedSync = useCallback((reason?: string) => {
    // Limpiar timeout anterior si existe
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Evitar sincronizaciones muy frecuentes (mínimo 10 segundos entre sincronizaciones)
    const now = Date.now();
    if (now - lastSyncTime < 10000) {
      console.log('🔄 useConversations - Sincronización ignorada (muy frecuente)');
      return;
    }

    // Debouncing de 3000ms para reducir peticiones
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
    }, 3000);
  }, [isAuthenticated, authLoading, isConnected, emit, memoizedFilters, lastSyncTime]);

  // SINCRONIZACIÓN INICIAL - CORREGIDA PARA EVITAR MÚLTIPLES EJECUCIONES
  useEffect(() => {
    // Solo sincronizar si no se ha hecho la sincronización inicial y no se está inicializando
    if (isAuthenticated && !authLoading && isConnected && !isInitialSyncDone && !isInitializingRef.current) {
      console.log('🔄 useConversations - Sincronización inicial...');
      isInitializingRef.current = true; // Marcar como inicializando
      setIsInitialSyncDone(true);
      debouncedSync('initial');
      
      // Resetear flag después de un tiempo más largo
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 5000); // Aumentado de 2 a 5 segundos
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

  // CORREGIDO: Infinite Query para obtener conversaciones - SOLO DESPUÉS DEL LOGIN
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
    enabled: isAuthenticated && !authLoading && !isAuthenticating, // CORREGIDO: Solo ejecutar si está autenticado, no cargando y no en proceso de autenticación
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
  const allConversations = useMemo(() => {
    const conversations = conversationsData?.pages.flatMap(page => page.conversations) || [];
    
    // NUEVO: Filtrar conversaciones duplicadas basadas en el número de teléfono
    const uniqueConversations = conversations.reduce((acc, conversation) => {
      const phone = conversation.customerPhone;
      
      // Buscar si ya existe una conversación con el mismo número
      const existingIndex = acc.findIndex(conv => conv.customerPhone === phone);
      
      if (existingIndex === -1) {
        // No existe, agregar
        acc.push(conversation);
      } else {
        // Ya existe, mantener la más reciente
        const existing = acc[existingIndex];
        const existingTime = new Date(existing.lastMessageAt || existing.createdAt).getTime();
        const newTime = new Date(conversation.lastMessageAt || conversation.createdAt).getTime();
        
        if (newTime > existingTime) {
          // Reemplazar con la más reciente
          acc[existingIndex] = conversation;
        }
      }
      
      return acc;
    }, [] as typeof conversations);
    
    return uniqueConversations;
  }, [conversationsData?.pages]);

  // Sincronizar datos del store con la query - solo si está autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading && allConversations.length > 0) {
      setConversations(allConversations);
    }
  }, [allConversations, setConversations, isAuthenticated, authLoading]);

  // NUEVO: Sincronizar conversación seleccionada con URL
  useEffect(() => {
    if (urlConversationId && (!activeConversation || activeConversation.id !== urlConversationId)) {
      const sanitizedId = sanitizeConversationId(urlConversationId);
      if (sanitizedId) {
        const conversation = allConversations.find(conv => conv.id === sanitizedId);
        if (conversation) {
          setActiveConversation(conversation);
        }
      }
    }
  }, [urlConversationId, activeConversation, allConversations, setActiveConversation]);

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

  // CORREGIDO: NO seleccionar automáticamente conversación - el usuario debe seleccionar manualmente
  // useEffect(() => {
  //   if (isAuthenticated && !authLoading && !activeConversation && allConversations.length > 0) {
  //     setActiveConversation(allConversations[0]);
  //   }
  // }, [activeConversation, allConversations, setActiveConversation, isAuthenticated, authLoading]);

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

  // NUEVO: Cache para evitar errores repetitivos de IDs inválidos
  const invalidIdCache = useRef<Set<string>>(new Set());
  const lastErrorTime = useRef<number>(0);

  // Función para manejar IDs inválidos sin spam de errores
  const handleInvalidConversationId = useCallback((conversationId: string) => {
    const now = Date.now();
    
    // Si ya reportamos este ID como inválido en los últimos 30 segundos, no reportar de nuevo
    if (invalidIdCache.current.has(conversationId) && (now - lastErrorTime.current) < 30000) {
      return;
    }
    
    // Agregar al cache y reportar error
    invalidIdCache.current.add(conversationId);
    lastErrorTime.current = now;
    
    console.warn('⚠️ ID de conversación inválido:', conversationId, 'decoded:', decodeURIComponent(conversationId));
    console.error('❌ useConversations - ID de conversación inválido:', conversationId);
  }, []);

  // Función para seleccionar conversación con manejo mejorado de errores
  const selectConversation = useCallback((conversationId: string) => {
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      handleInvalidConversationId(conversationId);
      return;
    }

    logConversationId(sanitizedId, 'selectConversation');
    const conversation = allConversations.find(conv => conv.id === sanitizedId);
    if (conversation) {
      setActiveConversation(conversation);
      
      // NUEVO: Actualizar URL cuando se selecciona una conversación
      const encodedId = encodeConversationIdForUrl(sanitizedId);
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.set('conversation', encodedId);
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    }
  }, [allConversations, setActiveConversation, handleInvalidConversationId, navigate, location.pathname, location.search]);

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