/**
 * Utilidades de debug para diagnosticar problemas de WebSocket y conversaciones
 */

import { useChatStore } from '../stores/useChatStore';
import { useWebSocketContext } from '../contexts/useWebSocketContext';

/**
 * Función para diagnosticar el estado actual del sistema
 */
export const diagnoseSystemState = () => {
  const chatState = useChatStore.getState();
  const wsContext = useWebSocketContext();
  
  const diagnosis = {
    timestamp: new Date().toISOString(),
    websocket: {
      isConnected: wsContext.isConnected,
      isSynced: wsContext.isSynced,
      connectionError: wsContext.connectionError,
      isFallbackMode: wsContext.isFallbackMode,
      isChatRoute: wsContext.isChatRoute,
      socketId: wsContext.socket?.id || null
    },
    chat: {
      conversationsCount: chatState.conversations.length,
      activeConversationId: chatState.activeConversation?.id || null,
      activeConversationName: chatState.activeConversation?.customerName || null,
      messagesCount: Object.keys(chatState.messages).length,
      loading: chatState.loading,
      error: chatState.error
    },
    url: {
      currentPath: window.location.pathname,
      searchParams: window.location.search,
      conversationParam: new URLSearchParams(window.location.search).get('conversation')
    }
  };
  
  console.group('🔍 Diagnóstico del Sistema');
  console.log('Estado WebSocket:', diagnosis.websocket);
  console.log('Estado Chat:', diagnosis.chat);
  console.log('URL:', diagnosis.url);
  console.groupEnd();
  
  return diagnosis;
};

/**
 * Función para verificar si hay problemas de sincronización
 */
export const checkSyncIssues = () => {
  const diagnosis = diagnoseSystemState();
  const issues: string[] = [];
  
  // Verificar conexión WebSocket
  if (!diagnosis.websocket.isConnected) {
    issues.push('WebSocket no conectado');
  }
  
  if (diagnosis.websocket.connectionError) {
    issues.push(`Error de conexión: ${diagnosis.websocket.connectionError}`);
  }
  
  // Verificar sincronización
  if (diagnosis.websocket.isConnected && !diagnosis.websocket.isSynced) {
    issues.push('WebSocket conectado pero no sincronizado');
  }
  
  // Verificar conversación activa
  if (diagnosis.chat.activeConversationId && !diagnosis.chat.activeConversationName) {
    issues.push('Conversación activa sin nombre');
  }
  
  // Verificar URL vs estado
  const urlConversationId = diagnosis.url.conversationParam;
  if (urlConversationId && urlConversationId !== diagnosis.chat.activeConversationId) {
    issues.push('Desincronización entre URL y conversación activa');
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ Problemas detectados:', issues);
  } else {
    console.log('✅ Sistema funcionando correctamente');
  }
  
  return issues;
};

/**
 * Función para forzar la sincronización del estado
 */
export const forceSync = async () => {
  console.log('🔄 Forzando sincronización...');
  
  try {
    const wsContext = useWebSocketContext();
    
    // Forzar sincronización de WebSocket
    if (wsContext.isConnected) {
      wsContext.syncState();
    }
    
    // Verificar estado después de la sincronización
    setTimeout(() => {
      checkSyncIssues();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error al forzar sincronización:', error);
  }
};

/**
 * Función para limpiar el estado y reiniciar
 */
export const resetSystemState = () => {
  console.log('🔄 Reiniciando estado del sistema...');
  
  try {
    const chatState = useChatStore.getState();
    const wsContext = useWebSocketContext();
    
    // Limpiar estado de chat
    chatState.setActiveConversation(null);
    chatState.setError(null);
    
    // Desconectar y reconectar WebSocket
    if (wsContext.isConnected) {
      wsContext.disconnect();
    }
    
    // Limpiar URL
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    
    console.log('✅ Estado del sistema reiniciado');
    
  } catch (error) {
    console.error('❌ Error al reiniciar estado:', error);
  }
};

// Hacer las funciones disponibles globalmente para debugging
if (typeof window !== 'undefined') {
  (window as any).diagnoseSystemState = diagnoseSystemState;
  (window as any).checkSyncIssues = checkSyncIssues;
  (window as any).forceSync = forceSync;
  (window as any).resetSystemState = resetSystemState;
}
