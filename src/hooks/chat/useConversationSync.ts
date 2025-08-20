import { useEffect, useCallback, useMemo } from 'react';
import { useWebSocketContext } from '../../contexts/useWebSocketContext';
// import { useChatStore } from '../../stores/useChatStore';
import { useAuthContext } from '../../contexts/useAuthContext';
import { ConversationManager } from '../../services/ConversationManager';
import { infoLog } from '../../config/logger';

export const useConversationSync = () => {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { on, off, isConnected, syncState } = useWebSocketContext();
  
  // const { addMessage } = useChatStore(); // Comentado temporalmente hasta implementar la lógica

  // Usar singleton mejorado para controlar estado global
  const manager = useMemo(() => {
    const instance = ConversationManager.getInstance();
    instance.registerInstance();
    return instance;
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      manager.unregisterInstance();
    };
  }, [manager]);

  // Cleanup adicional para mantener estabilidad
  useEffect(() => {
    // Solo limpiar listeners si realmente se desconecta
    if (!isAuthenticated || !isConnected) {
      if (import.meta.env.DEV) {
        console.log('🔌 useConversationSync - Cleanup por desconexión...');
      }
      manager.setListenersRegistered(false);
    }
  }, [isAuthenticated, isConnected, manager]);



  // Handlers para eventos de WebSocket
  const handleConversationEvent = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      console.log('🔌 useConversationSync - Evento de conversación recibido:', eventData);
    }
    // Lógica de manejo de eventos de conversación
  }, []);

  const handleNewMessage = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      console.log('🔌 useConversationSync - Nuevo mensaje recibido:', eventData);
      console.log('🔌 useConversationSync - Timestamp del handler:', new Date().toISOString());
    }
    
    // Lógica de manejo de nuevos mensajes
    const data = eventData as { conversationId?: string; message?: unknown };
    if (data?.conversationId && data?.message) {
      // Validar que message tenga el tipo correcto antes de agregarlo
      // addMessage(data.conversationId, data.message);
    }
  }, []);

  const handleMessageRead = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      console.log('🔌 useConversationSync - Mensajes marcados como leídos:', eventData);
    }
    // Lógica de manejo de mensajes leídos
  }, []);

  const handleConversationJoined = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      console.log('🔌 useConversationSync - Usuario se unió a conversación:', eventData);
    }
    // Lógica de manejo de unión a conversación
  }, []);

  const handleConversationLeft = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      console.log('🔌 useConversationSync - Usuario salió de conversación:', eventData);
    }
    // Lógica de manejo de salida de conversación
  }, []);

  const handleStateSynced = useCallback((syncData: unknown) => {
    if (import.meta.env.DEV) {
      console.log('🔌 useConversationSync - Estado sincronizado:', syncData);
    }
    // Lógica de sincronización de estado
  }, []);

  const handleWebhookConversationCreated = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      console.log('🔌 useConversationSync - Nueva conversación desde webhook:', eventData);
    }
    // Lógica de manejo de conversación creada por webhook
  }, []);

  const handleWebhookNewMessage = useCallback((eventData: unknown) => {
    if (import.meta.env.DEV) {
      console.log('🎯 useConversationSync - Handler webhook:new-message llamado con datos:', eventData);
      console.log('🎯 useConversationSync - Timestamp del handler:', new Date().toISOString());
    }
    
    // Lógica de manejo de nuevo mensaje por webhook
    const data = eventData as { conversationId?: string; message?: unknown };
    if (data?.conversationId && data?.message) {
      // Validar que message tenga el tipo correcto antes de agregarlo
      // addMessage(data.conversationId, data.message);
    }
  }, []);

  // ESCUCHAR EVENTOS DE CONVERSACIÓN - OPTIMIZADO PARA EVITAR RECONEXIONES
  useEffect(() => {
    if (!isAuthenticated || authLoading || !isConnected) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][ConversationSync] No registrando listeners', { 
          isAuthenticated, 
          authLoading, 
          isConnected 
        });
      }
      return;
    }

    // Usar singleton mejorado para evitar registro duplicado
    if (manager.isListenersRegistered()) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.debug('[DEBUG][ConversationSync] Listeners ya registrados, saltando');
      }
      return;
    }

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.debug('[DEBUG][ConversationSync] Registrando listeners de WS');
    }

    // Registrar listeners para eventos de conversación
    on('conversation-event', handleConversationEvent);
    on('new-message', handleNewMessage);
    on('message-read', handleMessageRead);
    on('conversation-joined', handleConversationJoined);
    on('conversation-left', handleConversationLeft);
    on('state-synced', handleStateSynced);
    
    // Registrar listeners para eventos de webhook
    on('webhook:conversation-created', handleWebhookConversationCreated);
    on('webhook:new-message', handleWebhookNewMessage);
    
    // Registrar listeners para eventos personalizados del DOM
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
    
    // Marcar como registrado usando singleton mejorado
    manager.setListenersRegistered(true);

    // Cleanup solo cuando se desmonta el componente o cambia el estado de autenticación
    return () => {
      // Solo limpiar si realmente se está desmontando o desconectando
      if (!isAuthenticated || !isConnected) {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.debug('[DEBUG][ConversationSync] Limpiando listeners de WS (desconexión)');
        }
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
  }, [isAuthenticated, authLoading, isConnected, on, off, handleConversationEvent, handleNewMessage, handleMessageRead, handleConversationJoined, handleConversationLeft, handleStateSynced, handleWebhookConversationCreated, handleWebhookNewMessage, manager]);

  // Función para sincronizar con el servidor
  const syncWithServer = useCallback(() => {
    if (manager.canSync()) {
      syncState();
      infoLog('🔄 useConversationSync - Sincronizando con servidor...');
    }
  }, [manager, syncState]);

  return {
    // Estado de sincronización
    isSynced: manager.isInitialSyncTriggered(),
    canSync: manager.canSync(),
    
    // Acciones de sincronización
    syncWithServer,
    
    // Estado del manager
    manager
  };
}; 