import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Conversation, ConversationFilters, AppState } from '../types';
import { conversationsService } from '../services/conversations';
import { useAppStore } from '../stores/useAppStore';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuthContext } from '../contexts/useAuthContext';
import { sanitizeConversationId, logConversationId, encodeConversationIdForUrl } from '../utils/conversationUtils';
import { infoLog } from '../config/logger';

// NUEVO: Singleton mejorado con control de instancias y estabilidad
class ConversationsManager {
  private static instance: ConversationsManager | null = null;
  private listenersRegistered = false;
  private initialSyncTriggered = false;
  private lastSyncTime = 0;
  private syncTimeout: NodeJS.Timeout | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private instanceCount = 0;
  private isStable = false;
  private isInitialized = false; // NUEVO: Flag de inicialización
  private initializationTimeout: NodeJS.Timeout | null = null; // NUEVO: Timeout de inicialización

  static getInstance(): ConversationsManager {
    if (!ConversationsManager.instance) {
      ConversationsManager.instance = new ConversationsManager();
      console.log('🔄 ConversationsManager - Singleton creado');
    }
    return ConversationsManager.instance;
  }

  // NUEVO: Método de inicialización controlada
  initialize(): void {
    if (this.isInitialized) {
      console.log('🔄 ConversationsManager - Ya inicializado, saltando...');
      return;
    }

    this.isInitialized = true;
    console.log('🔄 ConversationsManager - Inicializando...');

    // Marcar como estable después de 1 segundo (reducido de 3s)
    this.initializationTimeout = setTimeout(() => {
      this.isStable = true;
      console.log('🔄 ConversationsManager - Estado estable alcanzado');
    }, 1000);
  }

  // NUEVO: Método para registrar instancia con control mejorado
  registerInstance(): void {
    this.instanceCount++;
    console.log(`🔄 ConversationsManager - Instancia registrada (total: ${this.instanceCount})`);
    
    // Inicializar si es la primera instancia
    if (this.instanceCount === 1) {
      this.initialize();
    }
  }

  // NUEVO: Método para desregistrar instancia con control mejorado
  unregisterInstance(): void {
    this.instanceCount = Math.max(0, this.instanceCount - 1);
    console.log(`🔄 ConversationsManager - Instancia desregistrada (total: ${this.instanceCount})`);
    
    // Solo limpiar si no hay instancias activas Y el estado es estable
    if (this.instanceCount === 0 && this.isStable) {
      this.cleanup();
      console.log('🔄 ConversationsManager - Todas las instancias desmontadas, limpiando...');
    }
  }

  isStableState(): boolean {
    return this.isStable;
  }

  isInitializedState(): boolean {
    return this.isInitialized;
  }

  getInstanceCount(): number {
    return this.instanceCount;
  }

  isListenersRegistered(): boolean {
    return this.listenersRegistered;
  }

  setListenersRegistered(value: boolean): void {
    // NUEVO: Permitir registro de listeners siempre que no estén ya registrados
    if (this.listenersRegistered && value) {
      console.log('🔄 ConversationsManager - Listeners ya registrados, saltando...');
      return;
    }
    
    this.listenersRegistered = value;
    console.log(`🔄 ConversationsManager - Listeners ${value ? 'registrados' : 'desregistrados'} (instancias: ${this.instanceCount})`);
  }

  isInitialSyncTriggered(): boolean {
    return this.initialSyncTriggered;
  }

  setInitialSyncTriggered(value: boolean): void {
    // NUEVO: Permitir sincronización inicial siempre que no esté ya activada
    if (this.initialSyncTriggered && value) {
      console.log('🔄 ConversationsManager - Sincronización inicial ya activada, saltando...');
      return;
    }
    
    this.initialSyncTriggered = value;
    console.log(`🔄 ConversationsManager - Sincronización inicial ${value ? 'activada' : 'desactivada'} (instancias: ${this.instanceCount})`);
  }

  canSync(): boolean {
    // NUEVO: Permitir sincronización siempre, solo controlar frecuencia
    const now = Date.now();
    if (now - this.lastSyncTime < 2000) {
      return false;
    }
    this.lastSyncTime = now;
    return true;
  }

  setSyncTimeout(timeout: NodeJS.Timeout | null): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = timeout;
  }

  setPollingInterval(interval: NodeJS.Timeout | null): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = interval;
  }

  hasPollingInterval(): boolean {
    return this.pollingInterval !== null;
  }

  cleanup(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout);
      this.initializationTimeout = null;
    }
    this.listenersRegistered = false;
    this.initialSyncTriggered = false;
    this.isStable = false;
    this.isInitialized = false;
    console.log('🔄 ConversationsManager - Cleanup completado');
  }
}

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

  // NUEVO: Usar singleton mejorado para controlar estado global
  const manager = useMemo(() => {
    const instance = ConversationsManager.getInstance();
    instance.registerInstance();
    return instance;
  }, []);

  // NUEVO: Cleanup al desmontar
  useEffect(() => {
    return () => {
      manager.unregisterInstance();
    };
  }, [manager]);

  // NUEVO: Cleanup adicional para mantener estabilidad
  useEffect(() => {
    // Solo limpiar listeners si realmente se desconecta
    if (!isAuthenticated || !isConnected) {
      console.log('🔌 useConversations - Cleanup por desconexión...');
      manager.setListenersRegistered(false);
    }
  }, [isAuthenticated, isConnected, manager]);

  // Memoizar filters para evitar re-renders innecesarios
  const memoizedFilters = useMemo(() => filters, [filters]);

  // Flag para evitar carrera URL <-> estado durante la selección
  const isSelectingRef = useRef(false);

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

  // Obtener conversaciones del store
  const storeConversations = useAppStore((state: AppState) => state.conversations);

  // Combinar conversaciones del store y React Query
  const allConversations = useMemo(() => {
    const queryConversations = conversationsData?.pages.flatMap(page => page.conversations) || [];
    
    // NUEVO: Combinar conversaciones del store y React Query
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

  // Limpiar URL cuando no hay conversación seleccionada
  useEffect(() => {
    if (!activeConversation && urlConversationId) {
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('conversation');
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    }
  }, [activeConversation, urlConversationId, navigate, location.pathname, location.search]);

  // Sincronización con debouncing optimizada - CON CONTROL SINGLETON MEJORADO
  const debouncedSync = useCallback((reason: string) => {
    // NUEVO: Verificar si se puede sincronizar usando el singleton mejorado
    if (!manager.canSync()) {
      console.log('🔄 useConversations - Sincronización no permitida, saltando...');
      return;
    }

    // NUEVO: Evitar sincronizaciones iniciales múltiples
    if (reason === 'initial-connection' && manager.isInitialSyncTriggered()) {
      console.log('🔄 useConversations - Sincronización inicial ya realizada, saltando...');
      return;
    }

    // NUEVO: Evitar sincronizaciones periódicas si WebSocket está activo
    if (reason === 'periodic-polling' && manager.isListenersRegistered()) {
      console.log('🔄 useConversations - WebSocket activo, saltando sincronización periódica...');
      return;
    }

    const debounceTime = reason === 'new-message' ? 300 : 1000;
    
    const timeout = setTimeout(() => {
      if (isAuthenticated && !authLoading && isConnected) {
        console.log('🔄 useConversations - Solicitando sincronización:', { reason });
        
        // NUEVO: Marcar sincronización inicial como realizada
        if (reason === 'initial-connection') {
          manager.setInitialSyncTriggered(true);
        }
        
        syncState();
      }
    }, debounceTime);

    manager.setSyncTimeout(timeout);
  }, [isAuthenticated, authLoading, isConnected, syncState, manager]);

  // Sincronización inicial cuando se conecta el WebSocket - CON CONTROL SINGLETON MEJORADO
  useEffect(() => {
    if (isAuthenticated && !authLoading && isConnected && !manager.isListenersRegistered() && !manager.isInitialSyncTriggered()) {
          // NUEVO: Solo verificar si ya se activó la sincronización inicial
    if (manager.isInitialSyncTriggered()) {
      console.log('🔄 useConversations - Sincronización inicial ya activada, saltando...');
      return;
    }
      
      console.log('🔄 useConversations - WebSocket conectado, solicitando sincronización inicial...');
      manager.setInitialSyncTriggered(true);
      
      // Delay reducido para respuesta más rápida
      setTimeout(() => {
        debouncedSync('initial-connection');
      }, 1000);
    }
  }, [isAuthenticated, authLoading, isConnected, debouncedSync, manager]);

  // Polling periódico OPTIMIZADO - solo como fallback cuando WebSocket no funciona
  useEffect(() => {
    if (!isAuthenticated || authLoading || !isConnected) {
      return;
    }

    // NUEVO: Solo verificar si ya hay un polling activo
    if (manager.hasPollingInterval()) {
      console.log('🔄 useConversations - Polling ya activo, saltando...');
      return;
    }

    // NUEVO: Solo activar polling si no hay listeners registrados (fallback)
    if (manager.isListenersRegistered()) {
      console.log('🔄 useConversations - WebSocket activo, no necesitamos polling...');
      return;
    }

    console.log('🔄 useConversations - Iniciando polling periódico (fallback)...');
    
    // Sincronizar cada 60 segundos solo como fallback (aumentado de 30s)
    const interval = setInterval(() => {
      // NUEVO: Solo verificar si el estado es válido antes de cada polling
      if (!isAuthenticated || authLoading || !isConnected) {
        console.log('🔄 useConversations - Estado no válido, saltando polling...');
        return;
      }
      
      // NUEVO: Solo hacer polling si no hay listeners registrados
      if (manager.isListenersRegistered()) {
        console.log('🔄 useConversations - WebSocket activo, saltando polling...');
        return;
      }
      
      console.log('🔄 useConversations - Polling periódico - solicitando sincronización...');
      debouncedSync('periodic-polling');
    }, 60000); // NUEVO: Aumentado a 60 segundos

    manager.setPollingInterval(interval);

    return () => {
      if (manager.hasPollingInterval()) {
        console.log('🔄 useConversations - Deteniendo polling periódico...');
        manager.setPollingInterval(null);
      }
    };
  }, [isAuthenticated, authLoading, isConnected, debouncedSync, manager]);

  // ESCUCHAR RESPUESTA DE SINCRONIZACIÓN - OPTIMIZADO
  const handleStateSynced = useCallback((data: unknown) => {
    const syncData = data as { 
      conversations: Conversation[]; 
      messages: unknown[]; 
      users: unknown[]; 
      timestamp: string 
    };
    infoLog('✅ useConversations - Estado sincronizado:', syncData);
    
    if (syncData.conversations && syncData.conversations.length > 0) {
      infoLog('📋 useConversations - Actualizando conversaciones sincronizadas:', syncData.conversations.length);
      
      // NUEVO: Siempre actualizar con las conversaciones del servidor
      console.log('🎉 useConversations - Actualizando conversaciones del servidor:', syncData.conversations.length);
      setConversations(syncData.conversations);
    }
  }, [setConversations]);

  // NUEVO: Handler para eventos de webhook de nuevas conversaciones
  const handleWebhookConversationCreated = useCallback((data: unknown) => {
    const eventData = data as { conversation: Conversation };
    console.log('🎉 useConversations - Nueva conversación desde webhook:', eventData.conversation);
    
    if (eventData.conversation) {
      const currentConversations = useAppStore.getState().conversations;
      const existingIndex = currentConversations.findIndex((c: Conversation) => c.id === eventData.conversation.id);
      
      if (existingIndex === -1) {
        console.log('✅ useConversations - Agregando nueva conversación desde webhook:', eventData.conversation.id);
        setConversations([eventData.conversation, ...currentConversations]);
      } else {
        console.log('✅ useConversations - Actualizando conversación existente desde webhook:', eventData.conversation.id);
        updateStoreConversation(eventData.conversation.id, eventData.conversation);
      }
    }
  }, [setConversations, updateStoreConversation]);

  // NUEVO: Handler para eventos de webhook de nuevos mensajes
  const handleWebhookNewMessage = useCallback((data: unknown) => {
    const eventData = data as { 
      conversationId: string; 
      message: { content: string; timestamp: string; sender: string };
      conversation?: Conversation;
    };
    console.log('📨 useConversations - Nuevo mensaje desde webhook:', eventData);
    
    if (eventData.conversation) {
      const currentConversations = useAppStore.getState().conversations;
      const existingIndex = currentConversations.findIndex((c: Conversation) => c.id === eventData.conversation!.id);
      
      if (existingIndex === -1) {
        console.log('✅ useConversations - Agregando nueva conversación desde webhook new-message:', eventData.conversation.id);
        setConversations([eventData.conversation, ...currentConversations]);
      } else {
        console.log('✅ useConversations - Actualizando conversación existente desde webhook new-message:', eventData.conversation.id);
        updateStoreConversation(eventData.conversation.id, eventData.conversation);
      }
    } else {
      // Si no viene la conversación completa, actualizar la existente
      const currentConversation = storeConversations.find((c: Conversation) => c.id === eventData.conversationId);
      if (currentConversation) {
        updateStoreConversation(eventData.conversationId, {
          ...currentConversation,
          lastMessageAt: eventData.message.timestamp,
          unreadCount: (currentConversation.unreadCount || 0) + 1
        });
      }
    }
  }, [setConversations, updateStoreConversation, storeConversations]);

  // NUEVO: Handlers optimizados con useCallback para evitar re-renders
  const handleConversationEvent = useCallback((data: unknown) => {
    const eventData = data as { conversation: Conversation; timestamp: string };
    console.log('🔌 useConversations - Evento de conversación recibido:', eventData);
    updateStoreConversation(eventData.conversation.id, eventData.conversation);
  }, [updateStoreConversation]);

  const handleNewMessage = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; message: unknown; timestamp: string };
    console.log('🔌 useConversations - Nuevo mensaje recibido:', eventData);
    
    // Actualizar conversación con nuevo mensaje
    const currentConversation = storeConversations.find((c: Conversation) => c.id === eventData.conversationId);
    if (currentConversation) {
      updateStoreConversation(eventData.conversationId, {
        ...currentConversation,
        lastMessageAt: eventData.timestamp,
        unreadCount: (currentConversation.unreadCount || 0) + 1
      });
    }
  }, [storeConversations, updateStoreConversation]);

  const handleMessageRead = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; messageIds: string[]; timestamp: string };
    console.log('🔌 useConversations - Mensajes marcados como leídos:', eventData);
    
    // Actualizar conversación con mensajes leídos
    const currentConversation = storeConversations.find((c: Conversation) => c.id === eventData.conversationId);
    if (currentConversation) {
      updateStoreConversation(eventData.conversationId, {
        ...currentConversation,
        unreadCount: Math.max(0, (currentConversation.unreadCount || 0) - eventData.messageIds.length)
      });
    }
  }, [storeConversations, updateStoreConversation]);

  const handleConversationJoined = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; timestamp: string };
    console.log('🔌 useConversations - Usuario se unió a conversación:', eventData);
    updateStoreConversation(eventData.conversationId, {
      updatedAt: eventData.timestamp
    });
  }, [updateStoreConversation]);

  const handleConversationLeft = useCallback((data: unknown) => {
    const eventData = data as { conversationId: string; timestamp: string };
    console.log('🔌 useConversations - Usuario salió de conversación:', eventData);
    updateStoreConversation(eventData.conversationId, {
      updatedAt: eventData.timestamp
    });
  }, [updateStoreConversation]);

  // ESCUCHAR EVENTOS DE CONVERSACIÓN - OPTIMIZADO PARA EVITAR RECONEXIONES
  useEffect(() => {
    if (!isAuthenticated || authLoading || !isConnected) {
      console.log('🔌 useConversations - No registrando listeners:', { 
        isAuthenticated, 
        authLoading, 
        isConnected 
      });
      return;
    }

    // NUEVO: Usar singleton mejorado para evitar registro duplicado
    if (manager.isListenersRegistered()) {
      console.log('🔌 useConversations - Listeners ya registrados, saltando...');
      return;
    }

    console.log('🔌 useConversations - Registrando listeners de eventos WebSocket');

    // Registrar listeners para eventos de conversación
    on('conversation-event', handleConversationEvent);
    on('new-message', handleNewMessage);
    on('message-read', handleMessageRead);
    on('conversation-joined', handleConversationJoined);
    on('conversation-left', handleConversationLeft);
    on('state-synced', handleStateSynced);
    
    // NUEVO: Registrar listeners para eventos de webhook
    on('webhook:conversation-created', handleWebhookConversationCreated);
    on('webhook:new-message', handleWebhookNewMessage);
    
    // NUEVO: Registrar listeners para eventos personalizados del DOM
    const handleWebSocketStateSynced = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handleStateSynced(detail);
    };

    const handleWebSocketNewMessage = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handleNewMessage(detail);
    };

    const handleWebhookConversationCreatedEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handleWebhookConversationCreated(detail);
    };

    const handleWebhookNewMessageEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      handleWebhookNewMessage(detail);
    };

    window.addEventListener('websocket:state-synced', handleWebSocketStateSynced);
    window.addEventListener('new-message', handleWebSocketNewMessage);
    window.addEventListener('webhook:conversation-created', handleWebhookConversationCreatedEvent);
    window.addEventListener('webhook:new-message', handleWebhookNewMessageEvent);
    
    // NUEVO: Marcar como registrado usando singleton mejorado
    manager.setListenersRegistered(true);

    // NUEVO: Cleanup solo cuando se desmonta el componente o cambia el estado de autenticación
    return () => {
      // Solo limpiar si realmente se está desmontando o desconectando
      if (!isAuthenticated || !isConnected) {
        console.log('🔌 useConversations - Limpiando listeners de eventos WebSocket (desconexión)');
        off('conversation-event');
        off('new-message');
        off('message-read');
        off('conversation-joined');
        off('conversation-left');
        off('state-synced');
        off('webhook:conversation-created');
        off('webhook:new-message');
        
        // Limpiar listeners del DOM
        window.removeEventListener('websocket:state-synced', handleWebSocketStateSynced);
        window.removeEventListener('new-message', handleWebSocketNewMessage);
        window.removeEventListener('webhook:conversation-created', handleWebhookConversationCreatedEvent);
        window.removeEventListener('webhook:new-message', handleWebhookNewMessageEvent);
        
        manager.setListenersRegistered(false);
      }
    };
  }, [isAuthenticated, authLoading, isConnected, on, off, handleConversationEvent, handleNewMessage, handleMessageRead, handleConversationJoined, handleConversationLeft, handleStateSynced, handleWebhookConversationCreated, handleWebhookNewMessage, manager]); // NUEVO: Agregadas todas las dependencias necesarias

  // Cleanup ya manejado arriba

  // Mutation para actualizar conversación
  const updateConversationMutation = useMutation({
    mutationFn: ({ conversationId, updateData }: { conversationId: string; updateData: Partial<Conversation> }) => {
      const sanitizedId = sanitizeConversationId(conversationId);
      if (!sanitizedId) {
        throw new Error(`ID de conversación inválido: ${conversationId}`);
      }
      const encodedId = encodeConversationIdForUrl(sanitizedId);
      return conversationsService.updateConversation(encodedId, updateData);
    },
    onSuccess: (updatedConversation, variables) => {
      updateStoreConversation(variables.conversationId, updatedConversation);
      console.log('✅ useConversations - Conversación actualizada en store');
    }
  });

  // Mutation para marcar como leído
  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: string) => {
      const sanitizedId = sanitizeConversationId(conversationId);
      if (!sanitizedId) {
        throw new Error(`ID de conversación inválido: ${conversationId}`);
      }
      const encodedId = encodeConversationIdForUrl(sanitizedId);
      return conversationsService.markConversationAsRead(encodedId);
    },
    onSuccess: (updatedConversation, variables) => {
      updateStoreConversation(variables, updatedConversation);
      console.log('✅ useConversations - Mensajes marcados como leídos en store');
    }
  });

  // Mutation para cambiar estado
  const changeStatusMutation = useMutation({
    mutationFn: ({ conversationId, status }: { conversationId: string; status: string }) => {
      const sanitizedId = sanitizeConversationId(conversationId);
      if (!sanitizedId) {
        throw new Error(`ID de conversación inválido: ${conversationId}`);
      }
      const encodedId = encodeConversationIdForUrl(sanitizedId);
      return conversationsService.changeConversationStatus(encodedId, status);
    },
    onSuccess: (updatedConversation, variables) => {
      updateStoreConversation(variables.conversationId, updatedConversation);
      console.log('✅ useConversations - Estado de conversación actualizado en store');
    }
  });

  // Cache para evitar errores repetitivos de IDs inválidos
  const invalidIdCache = useRef<Set<string>>(new Set());
  const lastErrorTime = useRef<number>(0);

  const handleInvalidConversationId = useCallback((conversationId: string) => {
    const now = Date.now();
    
    if (invalidIdCache.current.has(conversationId) && (now - lastErrorTime.current) < 30000) {
      return;
    }
    
    invalidIdCache.current.add(conversationId);
    lastErrorTime.current = now;
    
    console.warn('⚠️ ID de conversación inválido:', conversationId, 'decoded:', decodeURIComponent(conversationId));
  }, []);

  // Función para seleccionar conversación
  const selectConversation = useCallback((conversationId: string) => {
    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      handleInvalidConversationId(conversationId);
      return;
    }

    if (activeConversation?.id === sanitizedId) {
      console.log('🔄 useConversations - Conversación ya seleccionada:', sanitizedId);
      return;
    }

    logConversationId(sanitizedId, 'selectConversation');
    const conversation = allConversations.find((conv: Conversation) => conv.id === sanitizedId);
    if (conversation) {
      console.log('✅ useConversations - Seleccionando conversación:', conversation.customerName);
      
      isSelectingRef.current = true;
      setActiveConversation(conversation);
      
      const encodedId = encodeConversationIdForUrl(sanitizedId);
      const newSearchParams = new URLSearchParams(location.search);
      const currentEncoded = new URLSearchParams(location.search).get('conversation');
      
      if (currentEncoded !== encodedId) {
        newSearchParams.set('conversation', encodedId);
        navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
      }

      setTimeout(() => {
        isSelectingRef.current = false;
      }, 500);
    } else {
      console.warn('⚠️ useConversations - Conversación no encontrada:', sanitizedId);
    }
  }, [allConversations, activeConversation?.id, setActiveConversation, handleInvalidConversationId, navigate, location.pathname, location.search]);

  // Función para limpiar conversación activa
  const clearActiveConversation = useCallback(() => {
    console.log('🧹 useConversations - Limpiando conversación activa');
    setActiveConversation(null);
  }, [setActiveConversation]);

  return {
    conversations: allConversations,
    activeConversation,
    isLoading,
    error,
    selectConversation,
    clearActiveConversation,
    updateConversation: updateConversationMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    changeStatus: changeStatusMutation.mutate,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
}; 