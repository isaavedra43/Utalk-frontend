import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChatStore } from '../../stores/useChatStore';
import { conversationsService } from '../../services/conversations';
import { encodeConversationIdForUrl, sanitizeConversationId } from '../../utils/conversationUtils';
import { infoLog } from '../../config/logger';

export const useConversationActions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    activeConversation,
    setActiveConversation,
    updateConversation,
    setConversations
  } = useChatStore();

  // Función para seleccionar una conversación
  const selectConversation = useCallback((conversationId: string) => {
    if (!conversationId) {
      infoLog('⚠️ useConversationActions - ID de conversación vacío');
      return;
    }

    const sanitizedId = sanitizeConversationId(conversationId);
    if (!sanitizedId) {
      infoLog('⚠️ useConversationActions - ID de conversación inválido:', conversationId);
      return;
    }

    // Actualizar URL con el ID de la conversación
    const encodedId = encodeConversationIdForUrl(sanitizedId);
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('conversation', encodedId);
    
    const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
    navigate(newUrl, { replace: true });

    // Actualizar estado local - buscar la conversación en el store
    // TODO: Implementar búsqueda de conversación por ID
    // setActiveConversation(sanitizedId);
    
    infoLog('✅ useConversationActions - Conversación seleccionada:', sanitizedId);
  }, [navigate, location.pathname, location.search, setActiveConversation]);

  // Función para deseleccionar conversación
  const deselectConversation = useCallback(() => {
    // Limpiar URL
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete('conversation');
    const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
    navigate(newUrl, { replace: true });

    // Limpiar estado local
    setActiveConversation(null);
    
    infoLog('✅ useConversationActions - Conversación deseleccionada');
  }, [navigate, location.pathname, location.search, setActiveConversation]);

  // Función para actualizar una conversación
  const updateConversationData = useCallback(async (conversationId: string, updates: {
    customerName?: string;
    subject?: string;
    status?: string;
    priority?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }) => {
    try {
      const response = await conversationsService.updateConversation(conversationId, updates);
      updateConversation(conversationId, response);
      infoLog('✅ useConversationActions - Conversación actualizada:', conversationId);
      return response;
    } catch (error) {
      infoLog('❌ useConversationActions - Error al actualizar conversación:', error);
      throw error;
    }
  }, [updateConversation]);

  // Función para marcar conversación como leída
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      await conversationsService.markConversationAsRead(conversationId);
      updateConversation(conversationId, { unreadCount: 0 });
      infoLog('✅ useConversationActions - Conversación marcada como leída:', conversationId);
    } catch (error) {
      infoLog('❌ useConversationActions - Error al marcar como leída:', error);
      throw error;
    }
  }, [updateConversation]);

  // Función para refrescar conversaciones
  const refreshConversations = useCallback(async () => {
    try {
      const response = await conversationsService.getConversations();
      setConversations(response.conversations);
      infoLog('✅ useConversationActions - Conversaciones refrescadas');
      return response;
    } catch (error) {
      infoLog('❌ useConversationActions - Error al refrescar conversaciones:', error);
      throw error;
    }
  }, [setConversations]);

  return {
    // Estado
    activeConversation,
    
    // Acciones básicas
    selectConversation,
    deselectConversation,
    
    // Acciones de datos
    updateConversationData,
    refreshConversations,
    
    // Acciones de estado
    markConversationAsRead
  };
}; 