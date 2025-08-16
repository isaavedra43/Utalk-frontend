import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Conversation, ConversationFilters } from '../types';
import { conversationsService } from '../services/conversations';
import { useAppStore } from '../stores/useAppStore';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuthContext } from '../contexts/useAuthContext';
import { sanitizeConversationId, logConversationId, encodeConversationIdForUrl } from '../utils/conversationUtils';

// FASE 5: Constantes para retry logic y fallbacks (futuro)
// const RETRY_DELAYS = [1000, 2000, 5000]; // Delays progresivos para retry
// const MAX_RETRY_ATTEMPTS = 3;
// const WEBSOCKET_TIMEOUT = 10000; // 10 segundos para timeout de WebSocket (futuro)

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
  const { on, off, isConnected, syncState } = useWebSocketContext();

  // Estados para controlar la sincronización - CORREGIDO PARA EVITAR MÚLTIPLES EJECUCIONES
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Eliminado: flags locales de sincronización inicial; ahora lo gestiona WebSocketContext

  // FASE 5: Estados para manejo de errores y fallbacks (futuro)
  // const [websocketFailed, setWebsocketFailed] = useState(false);
  // const [retryCount, setRetryCount] = useState(0);
  // const [lastError, setLastError] = useState<string | null>(null);
  // const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoizar filters para evitar re-renders innecesarios
  const memoizedFilters = useMemo(() => filters, [filters]);

  // NUEVO: Flag para evitar carrera URL <-> estado durante la selección
  const isSelectingRef = useRef(false);

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

  // FASE 1: Unificar fuente de verdad - Usar store como principal, React Query como fallback
  const storeConversations = useAppStore(state => state.conversations);
  
  // Combinar datos del store (tiempo real) con datos de React Query (carga inicial)
  const allConversations = useMemo(() => {
    // Si hay datos en el store, usarlos como fuente principal
    if (storeConversations.length > 0) {
      console.log('📊 useConversations - Usando datos del store (tiempo real):', storeConversations.length);
      return storeConversations;
    }
    
    // Fallback: usar datos de React Query para carga inicial
    const queryConversations = conversationsData?.pages.flatMap(page => page.conversations) || [];
    console.log('📊 useConversations - Usando datos de React Query (carga inicial):', queryConversations.length);
    
    // Filtrar conversaciones duplicadas basadas en el número de teléfono
    const uniqueConversations = queryConversations.reduce((acc, conversation) => {
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
    }, [] as typeof queryConversations);
    
    return uniqueConversations;
  }, [storeConversations, conversationsData?.pages]);

  // FASE 1: Sincronizar datos de React Query al store solo para carga inicial
  useEffect(() => {
    if (isAuthenticated && !authLoading && conversationsData?.pages && storeConversations.length === 0) {
      // Solo sincronizar si el store está vacío y tenemos datos de React Query
      const queryConversations = conversationsData.pages.flatMap(page => page.conversations);
      if (queryConversations.length > 0) {
        console.log('📊 useConversations - Sincronizando datos iniciales al store:', queryConversations.length);
        setConversations(queryConversations);
      }
    }
  }, [conversationsData?.pages, setConversations, isAuthenticated, authLoading, storeConversations.length]);

  // NUEVO: Limpiar URL cuando no hay conversación seleccionada
  useEffect(() => {
    // Si no hay conversación activa pero hay conversationId en la URL, limpiar la URL
    if (!activeConversation && urlConversationId) {
      console.log('🧹 useConversations - Limpiando URL sin conversación activa');
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('conversation');
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    }
  }, [activeConversation, urlConversationId, navigate, location.pathname, location.search]);

  // NUEVO: Sincronizar conversación seleccionada con URL - CORREGIDO
  useEffect(() => {
    // Solo sincronizar si hay una conversación activa seleccionada manualmente
    // NO seleccionar automáticamente basado en URL al entrar a /chat
    if (isSelectingRef.current) {
      // Saltar mientras navegamos para no sobrescribir la selección en curso
      return;
    }
    
    // Solo sincronizar si ya hay una conversación activa y la URL no coincide
    if (activeConversation && urlConversationId && activeConversation.id !== urlConversationId) {
      const sanitizedId = sanitizeConversationId(urlConversationId);
      if (sanitizedId && sanitizedId === activeConversation.id) {
        // La URL ya está correcta, no hacer nada
        return;
      }
    }
    
    // NO seleccionar automáticamente conversación desde URL al cargar la página
    // El usuario debe seleccionar manualmente
  }, [urlConversationId, activeConversation, allConversations, setActiveConversation]);

  // Memoizar la función de sincronización con debouncing - OPTIMIZADO PARA REDUCIR PETICIONES
  const debouncedSync = useCallback((reason?: string) => {
    // Limpiar timeout anterior si existe
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // FASE 2: Reducir debounce de 10 segundos a 2 segundos para eventos críticos
    const now = Date.now();
    const minInterval = reason === 'new-message' ? 1000 : 2000; // 1s para mensajes, 2s para otros
    
    if (now - lastSyncTime < minInterval) {
      console.log('🔄 useConversations - Sincronización ignorada (muy frecuente):', { reason, interval: minInterval });
      return;
    }

    // FASE 2: Debouncing reducido de 3000ms a 500ms para eventos críticos
    const debounceTime = reason === 'new-message' ? 200 : 500; // 200ms para mensajes, 500ms para otros
    
    syncTimeoutRef.current = setTimeout(() => {
      if (isAuthenticated && !authLoading && isConnected) {
        console.log('�� useConversations - Solicitando sincronización (delegada al contexto)...', { reason });
        setLastSyncTime(Date.now());
        // Delegar al contexto para evitar duplicados entre múltiples instancias
        syncState();
      }
    }, debounceTime);
  }, [isAuthenticated, authLoading, isConnected, syncState, lastSyncTime]);

  // FASE 5: Función de retry logic para eventos fallidos (futuro)
  // const retryEvent = useCallback((eventType: string, data: unknown, attempt: number = 0) => {
  //   if (attempt >= MAX_RETRY_ATTEMPTS) {
  //     console.error(`❌ useConversations - Máximo intentos de retry alcanzado para ${eventType}`);
  //     setLastError(`Error en ${eventType} después de ${MAX_RETRY_ATTEMPTS} intentos`);
  //     return;
  //   }

  //   const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
  //   console.log(`🔄 useConversations - Reintentando ${eventType} en ${delay}ms (intento ${attempt + 1})`);

  //   retryTimeoutRef.current = setTimeout(() => {
  //     try {
  //         // Reintentar la operación
  //         if (eventType === 'sync') {
  //           syncState();
  //         } else {
  //           // Para otros eventos, podríamos implementar lógica específica
  //           console.log(`🔄 useConversations - Reintentando evento: ${eventType}`);
  //         }
  //     } catch (error) {
  //       console.error(`❌ useConversations - Error en retry ${eventType}:`, error);
  //       retryEvent(eventType, data, attempt + 1);
  //     }
  //   }, delay);
  // }, [syncState]);

  // FASE 5: Función de fallback a React Query cuando WebSocket falla (futuro)
  // const fallbackToReactQuery = useCallback(() => {
  //   console.log('🔄 useConversations - Activando fallback a React Query');
  //   setWebsocketFailed(true);
  //   setRetryCount(0);
  //   
  //   // Forzar refetch de React Query
  //   refetch();
  //   
  //   // Limpiar timeout de retry
  //   if (retryTimeoutRef.current) {
  //     clearTimeout(retryTimeoutRef.current);
  //     retryTimeoutRef.current = null;
  //   }
  // }, [refetch]);

  // FASE 5: Función de logging detallado para debugging (futuro)
  // const logEvent = useCallback((event: string, data?: unknown, error?: unknown) => {
  //   const timestamp = new Date().toISOString();
  //   const logData = {
  //     timestamp,
  //     event,
  //     websocketConnected: isConnected,
  //     websocketFailed,
  //     retryCount,
  //     lastError,
  //     data: data ? JSON.stringify(data).slice(0, 200) : undefined,
  //     error: error ? JSON.stringify(error).slice(0, 200) : undefined
  //   };
  //   
  //   console.log(`📝 useConversations - ${event}:`, logData);
  //   
  //   // En producción, podríamos enviar a un servicio de logging
  //   if (process.env.NODE_ENV === 'production') {
  //     // TODO: Implementar logging a servicio externo
  //   }
  // }, [isConnected, websocketFailed, retryCount, lastError]);

  // La sincronización inicial ahora es responsabilidad del WebSocketContext
  useEffect(() => {
    // No-op
  }, [isAuthenticated, authLoading, isConnected]);

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

  // Memoizar handlers de eventos para evitar recreaciones
  const handleConversationEvent = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; [key: string]: unknown };
    console.log('💬 useConversations - Evento de conversación recibido:', eventData);
    
    // FASE 1: Actualizar conversación en el store (fuente principal)
    updateStoreConversation(eventData.conversationId, eventData as Partial<Conversation>);
    
    // FASE 1: NO hacer refetch - el store es la fuente de verdad
    console.log('💬 useConversations - Evento de conversación procesado (sin refetch)');
  }, [updateStoreConversation]);

  const handleNewMessage = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; message: { content: string; timestamp: string; sender: string } };
    console.log('📨 useConversations - Nuevo mensaje en conversación:', eventData);
    
    // FASE 1: Actualizar conversación en el store (fuente principal)
    const currentConversation = storeConversations.find(c => c.id === eventData.conversationId);
    const currentUnreadCount = currentConversation?.unreadCount || 0;
    
    updateStoreConversation(eventData.conversationId, {
      lastMessage: {
        content: eventData.message.content,
        direction: 'inbound',
        messageId: `temp-${Date.now()}`,
        sender: eventData.message.sender,
        timestamp: eventData.message.timestamp
      },
      lastMessageAt: eventData.message.timestamp,
      unreadCount: currentUnreadCount + 1,
      isNewMessage: true, // Flag para animación
      hasNewMessage: true // Flag para punto verde
    });
    
    // Remover flags de animación después de un tiempo
    setTimeout(() => {
      updateStoreConversation(eventData.conversationId, {
        isNewMessage: false,
        hasNewMessage: false
      });
    }, 3000);
    
    // FASE 1: NO hacer refetch - el store es la fuente de verdad
    // Solo invalidar cache de React Query para futuras cargas
    console.log('📨 useConversations - Actualización en tiempo real completada (sin refetch)');
  }, [updateStoreConversation, storeConversations]);

  const handleMessageRead = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; messageIds: string[]; readBy: string };
    console.log('✅ useConversations - Mensajes marcados como leídos:', eventData);
    
    // FASE 1: Actualizar conversación en el store (fuente principal)
    const conversation = storeConversations.find(c => c.id === eventData.conversationId);
    if (conversation) {
      const newUnreadCount = Math.max(0, conversation.unreadCount - eventData.messageIds.length);
      updateStoreConversation(eventData.conversationId, {
        unreadCount: newUnreadCount
      });
    }
  }, [updateStoreConversation, storeConversations]);

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

  // FASE 2: Escuchar eventos de conversación en tiempo real - MEJORADO
  useEffect(() => {
    // Solo registrar listeners cuando esté autenticado, no cargando y conectado
    if (!isAuthenticated || authLoading || !isConnected) {
      console.log('🔌 useConversations - No registrando listeners:', { 
        isAuthenticated, 
        authLoading, 
        isConnected 
      });
      return;
    }

    console.log('🔌 useConversations - Registrando listeners de eventos WebSocket');

    // Registrar listeners
    on('conversation-event', handleConversationEvent);
    on('new-message', handleNewMessage);
    on('message-read', handleMessageRead);
    on('conversation-joined', handleConversationJoined);
    on('conversation-left', handleConversationLeft);

    return () => {
      console.log('🔌 useConversations - Limpiando listeners de eventos WebSocket');
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
      // FASE 1: Solo actualizar el store (fuente principal)
      updateStoreConversation(variables.conversationId, updatedConversation);
      // FASE 1: NO hacer refetch - el store es la fuente de verdad
      console.log('✅ useConversations - Conversación actualizada en store (sin refetch)');
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
      // FASE 1: Solo actualizar el store (fuente principal)
      updateStoreConversation(variables, updatedConversation);
      // FASE 1: NO hacer refetch - el store es la fuente de verdad
      console.log('✅ useConversations - Mensajes marcados como leídos en store (sin refetch)');
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
      // FASE 1: Solo actualizar el store (fuente principal)
      updateStoreConversation(variables.conversationId, updatedConversation);
      // FASE 1: NO hacer refetch - el store es la fuente de verdad
      console.log('✅ useConversations - Estado de conversación actualizado en store (sin refetch)');
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

  // Función para seleccionar conversación con manejo mejorado de errores - CORREGIDA
  const selectConversation = useCallback((conversationId: string) => {
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      handleInvalidConversationId(conversationId);
      return;
    }

    // Si ya está seleccionada, no hacer nada
    if (activeConversation?.id === sanitizedId) {
      console.log('🔄 useConversations - Conversación ya seleccionada:', sanitizedId);
      return;
    }

    logConversationId(sanitizedId, 'selectConversation');
    const conversation = allConversations.find(conv => conv.id === sanitizedId);
    if (conversation) {
      console.log('✅ useConversations - Seleccionando conversación:', conversation.customerName);
      
      // Activar flag para evitar que el efecto URL interfiera
      isSelectingRef.current = true;
      
      // Seleccionar la conversación
      setActiveConversation(conversation);
      
      // NUEVO: Actualizar URL cuando se selecciona una conversación
      const encodedId = encodeConversationIdForUrl(sanitizedId);
      const newSearchParams = new URLSearchParams(location.search);
      const currentEncoded = new URLSearchParams(location.search).get('conversation');
      
      // Navegar solo si cambia realmente el parámetro
      if (currentEncoded !== encodedId) {
        newSearchParams.set('conversation', encodedId);
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
      }

      // Desarmar el flag tras una pausa más larga para asegurar que todo se estabilice
      setTimeout(() => {
        isSelectingRef.current = false;
        console.log('🔄 useConversations - Flag de selección desactivado');
      }, 500);
    } else {
      console.warn('⚠️ useConversations - Conversación no encontrada:', sanitizedId);
    }
  }, [allConversations, activeConversation?.id, setActiveConversation, handleInvalidConversationId, navigate, location.pathname, location.search]);

  // NUEVO: Función para limpiar conversación activa
  const clearActiveConversation = useCallback(() => {
    console.log('🧹 useConversations - Limpiando conversación activa');
    setActiveConversation(null);
    
    // Limpiar URL
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete('conversation');
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
  }, [setActiveConversation, navigate, location.pathname, location.search]);

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
      // SOLUCIONADO: No limpiar conversación activa automáticamente
      // Esto estaba causando problemas con la selección inicial
      // La conversación se limpiará solo cuando el usuario navegue a otro módulo
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
    clearActiveConversation,
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