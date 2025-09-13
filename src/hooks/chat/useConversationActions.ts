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
    setConversations,
    conversations
  } = useChatStore();

  // Función para seleccionar una conversación con mejor manejo de errores
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

    try {
      // Verificar si ya es la conversación activa
      if (activeConversation?.id === sanitizedId) {
        infoLog('ℹ️ useConversationActions - Conversación ya está activa:', sanitizedId);
        return;
      }

      // ELIMINADO: Actualización automática de URL que causaba persistencia de conversación
      // Ahora el agente debe seleccionar manualmente las conversaciones sin modificar la URL
      // const encodedId = encodeConversationIdForUrl(sanitizedId);
      // const newSearchParams = new URLSearchParams(location.search);
      // newSearchParams.set('conversation', encodedId);
      // 
      // const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
      // navigate(newUrl, { replace: true });

      // Actualizar estado local con la conversación existente si está en el store
      const existing = conversations.find(c => c.id === sanitizedId) || null;
      if (existing) {
        setActiveConversation(existing);
        infoLog('✅ useConversationActions - Conversación seleccionada desde store:', sanitizedId);
      } else {
        // Si no existe en el store, crear una conversación temporal
        const tempConversation = {
          id: sanitizedId,
          customerName: 'Cargando...',
          customerPhone: sanitizedId,
          lastMessage: null,
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as any;
        
        setActiveConversation(tempConversation);
        infoLog('⚠️ useConversationActions - Conversación temporal creada:', sanitizedId);
      }
      
    } catch (error) {
      console.error('❌ Error al seleccionar conversación:', error);
      infoLog('❌ useConversationActions - Error al seleccionar conversación:', sanitizedId, error);
    }
  }, [navigate, location.pathname, location.search, setActiveConversation, conversations, activeConversation]);

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

  // Función para limpiar URL de conversaciones al entrar al módulo de chat
  const clearConversationFromUrl = useCallback(() => {
    const newSearchParams = new URLSearchParams(location.search);
    if (newSearchParams.has('conversation')) {
      newSearchParams.delete('conversation');
      const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
      navigate(newUrl, { replace: true });
      infoLog('🧹 useConversationActions - URL limpiada de conversación persistente');
    }
  }, [navigate, location.pathname, location.search]);

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
    clearConversationFromUrl,
    
    // Acciones de datos
    updateConversationData,
    refreshConversations,
    
    // Acciones de estado
    markConversationAsRead
  };
}; 