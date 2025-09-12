import { useState, useEffect, useCallback } from 'react';
import { chatManager } from '../services/ChatManager';
import { logger } from '../utils/logger';

interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  senderId: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isOptimistic?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  participants: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
}

interface SendMessageOptions {
  content: string;
  type?: 'text' | 'image' | 'file';
  conversationId?: string;
}

interface ChatHookReturn {
  // Datos
  messages: Message[];
  conversations: Conversation[];
  currentConversationId: string | null;
  user: User | null;
  
  // Estados
  isLoading: boolean;
  isInitialized: boolean;
  isSocketConnected: boolean;
  error: string | null;
  
  // Acciones
  sendMessage: (options: SendMessageOptions) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  setCurrentConversation: (conversationId: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useChatNew = (): ChatHookReturn => {
  // Estados locales
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función para inicializar el chat
  const initialize = useCallback(async () => {
    if (isInitialized) {
      logger.apiInfo('Chat ya está inicializado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.apiInfo('Inicializando chat con ChatManager...');
      
      await chatManager.initialize();
      
      // Obtener datos iniciales del ChatManager
      setConversations(chatManager.getConversations());
      setMessages(chatManager.getMessages());
      setCurrentConversationId(chatManager.getCurrentConversationId());
      setUser(chatManager.getUser());
      setIsSocketConnected(chatManager.isSocketConnected());
      setIsInitialized(true);
      
      logger.apiInfo('Chat inicializado exitosamente');

    } catch (initError) {
      const errorMessage = initError instanceof Error ? initError.message : 'Error inicializando chat';
      logger.apiError('Error inicializando chat', initError as Error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Función para cargar conversaciones
  const loadConversations = useCallback(async () => {
    if (!isInitialized) {
      logger.apiInfo('Chat no inicializado, inicializando primero...');
      await initialize();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await chatManager.loadConversations();
      setConversations(chatManager.getConversations());
      
      // Si no hay conversación actual pero hay conversaciones disponibles, cargar la primera
      const conversations = chatManager.getConversations();
      if (!currentConversationId && conversations.length > 0) {
        await loadMessages(conversations[0].id);
      }
      
    } catch (loadError) {
      const errorMessage = loadError instanceof Error ? loadError.message : 'Error cargando conversaciones';
      logger.apiError('Error cargando conversaciones', loadError as Error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize, currentConversationId]);

  // Función para cargar mensajes
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!isInitialized) {
      logger.apiInfo('Chat no inicializado, inicializando primero...');
      await initialize();
    }

    if (!conversationId) {
      logger.apiError('ID de conversación requerido', new Error('Missing conversationId'));
      setError('ID de conversación requerido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await chatManager.loadMessages(conversationId);
      setMessages(chatManager.getMessages());
      setCurrentConversationId(chatManager.getCurrentConversationId());
      
    } catch (loadError) {
      const errorMessage = loadError instanceof Error ? loadError.message : 'Error cargando mensajes';
      logger.apiError('Error cargando mensajes', loadError as Error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initialize]);

  // Función para enviar mensajes
  const sendMessage = useCallback(async (options: SendMessageOptions) => {
    const { content, type = 'text', conversationId } = options;
    
    if (!isInitialized) {
      logger.apiError('Chat no inicializado', new Error('Chat not initialized'));
      setError('Chat no inicializado');
      return;
    }

    if (!content?.trim()) {
      logger.apiError('Contenido del mensaje requerido', new Error('Empty message content'));
      setError('El mensaje no puede estar vacío');
      return;
    }

    // Usar conversación actual si no se especifica una
    const targetConversationId = conversationId || currentConversationId;
    if (!targetConversationId) {
      logger.apiError('No hay conversación seleccionada', new Error('No conversation selected'));
      setError('No hay conversación seleccionada');
      return;
    }

    try {
      await chatManager.sendMessage(content, type);
      
      // Actualizar mensajes locales
      setMessages(chatManager.getMessages());
      
      // Limpiar error si había uno
      setError(null);
      
    } catch (sendError) {
      const errorMessage = sendError instanceof Error ? sendError.message : 'Error enviando mensaje';
      logger.apiError('Error enviando mensaje', sendError as Error);
      setError(errorMessage);
    }
  }, [isInitialized, currentConversationId]);

  // Función para establecer conversación actual
  const setCurrentConversation = useCallback((conversationId: string | null) => {
    if (conversationId && conversationId !== currentConversationId) {
      loadMessages(conversationId);
    } else if (!conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  }, [currentConversationId, loadMessages]);

  // Configurar event listeners del ChatManager
  useEffect(() => {
    const handleChatInitialized = () => {
      logger.apiInfo('Chat inicializado - actualizando estado del hook');
      setIsInitialized(true);
      setConversations(chatManager.getConversations());
      setMessages(chatManager.getMessages());
      setCurrentConversationId(chatManager.getCurrentConversationId());
      setUser(chatManager.getUser());
      setIsSocketConnected(chatManager.isSocketConnected());
    };

    const handleConversationsLoaded = (event: CustomEvent) => {
      logger.apiInfo('Conversaciones cargadas - actualizando estado del hook');
      const { conversations } = event.detail;
      setConversations(conversations);
    };

    const handleMessagesLoaded = (event: CustomEvent) => {
      logger.apiInfo('Mensajes cargados - actualizando estado del hook');
      const { conversationId, messages } = event.detail;
      setCurrentConversationId(conversationId);
      setMessages(messages);
    };

    const handleMessagesUpdated = (event: CustomEvent) => {
      logger.apiInfo('Mensajes actualizados - actualizando estado del hook');
      const { messages } = event.detail;
      setMessages(messages);
    };

    const handleUserLoaded = (event: CustomEvent) => {
      logger.apiInfo('Usuario cargado - actualizando estado del hook');
      const { user } = event.detail;
      setUser(user);
    };

    const handleChatError = (event: CustomEvent) => {
      logger.apiError('Error del chat - actualizando estado del hook', new Error(event.detail.message));
      const { message } = event.detail;
      setError(message);
    };

    const handleConversationNotFound = () => {
      logger.apiInfo('Conversación no encontrada - actualizando estado del hook');
      setError('Esta conversación no existe o no tienes permisos para verla');
      setMessages([]);
      setCurrentConversationId(null);
    };

    const handleNoConversations = () => {
      logger.apiInfo('No hay conversaciones - actualizando estado del hook');
      setConversations([]);
      setMessages([]);
      setCurrentConversationId(null);
    };

    const handleSocketConnected = () => {
      logger.apiInfo('WebSocket conectado - actualizando estado del hook');
      setIsSocketConnected(true);
    };

    const handleSocketDisconnected = () => {
      logger.apiInfo('WebSocket desconectado - actualizando estado del hook');
      setIsSocketConnected(false);
    };

    // Agregar event listeners
    window.addEventListener('chat:initialized', handleChatInitialized);
    window.addEventListener('chat:conversations-loaded', handleConversationsLoaded as EventListener);
    window.addEventListener('chat:messages-loaded', handleMessagesLoaded as EventListener);
    window.addEventListener('chat:messages-updated', handleMessagesUpdated as EventListener);
    window.addEventListener('chat:user-loaded', handleUserLoaded as EventListener);
    window.addEventListener('chat:error', handleChatError as EventListener);
    window.addEventListener('chat:conversation-not-found', handleConversationNotFound);
    window.addEventListener('chat:no-conversations', handleNoConversations);
    window.addEventListener('socket:connected', handleSocketConnected);
    window.addEventListener('socket:disconnected', handleSocketDisconnected);

    // Cleanup
    return () => {
      window.removeEventListener('chat:initialized', handleChatInitialized);
      window.removeEventListener('chat:conversations-loaded', handleConversationsLoaded as EventListener);
      window.removeEventListener('chat:messages-loaded', handleMessagesLoaded as EventListener);
      window.removeEventListener('chat:messages-updated', handleMessagesUpdated as EventListener);
      window.removeEventListener('chat:user-loaded', handleUserLoaded as EventListener);
      window.removeEventListener('chat:error', handleChatError as EventListener);
      window.removeEventListener('chat:conversation-not-found', handleConversationNotFound);
      window.removeEventListener('chat:no-conversations', handleNoConversations);
      window.removeEventListener('socket:connected', handleSocketConnected);
      window.removeEventListener('socket:disconnected', handleSocketDisconnected);
    };
  }, []);

  // Auto-inicializar el chat cuando el hook se monta
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      logger.apiInfo('Auto-inicializando chat...');
      initialize().catch((error) => {
        logger.apiError('Error en auto-inicialización del chat', error);
      });
    }
  }, [isInitialized, isLoading, initialize]);

  // Actualizar estado de conexión del socket periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const connected = chatManager.isSocketConnected();
      if (connected !== isSocketConnected) {
        setIsSocketConnected(connected);
      }
    }, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval);
  }, [isSocketConnected]);

  return {
    // Datos
    messages,
    conversations,
    currentConversationId,
    user,
    
    // Estados
    isLoading,
    isInitialized,
    isSocketConnected,
    error,
    
    // Acciones
    sendMessage,
    loadMessages,
    loadConversations,
    setCurrentConversation,
    clearError,
    initialize
  };
};
