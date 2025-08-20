import { useWebSocketConnection } from './useWebSocketConnection';
import { useWebSocketMessages } from './useWebSocketMessages';
import { useWebSocketSync } from './useWebSocketSync';
import { useWebSocketEvents } from './useWebSocketEvents';

/**
 * Hook compositor que combina funcionalidades de conexión y mensajes WebSocket
 * 
 * Este hook es el punto de entrada principal para todas las operaciones
 * relacionadas con WebSocket. Combina los hooks específicos:
 * - useWebSocketConnection: Conexión, reconexión y estados
 * - useWebSocketMessages: Envío/recepción de mensajes
 * - useWebSocketSync: Sincronización de estado con control de versiones
 * - useWebSocketEvents: Eventos personalizados y de sistema
 * 
 * @returns Objeto con todas las funcionalidades combinadas
 */
export const useWebSocket = () => {
  // Hook de conexión
  const connection = useWebSocketConnection();
  
  // Hook de mensajes (usa el socket de la conexión)
  const messages = useWebSocketMessages(connection.socket);

  // Hook de sincronización
  const sync = useWebSocketSync(connection.socket, { resolveStrategy: 'merge' });

  // Hook de eventos
  const events = useWebSocketEvents();

  // Retornar todas las funcionalidades combinadas
  return {
    // Estados de conexión
    socket: connection.socket,
    isConnected: connection.isConnected,
    isConnecting: connection.isConnecting,
    isSynced: connection.isSynced,
    connectionError: connection.connectionError,
    isFallbackMode: connection.isFallbackMode,
    isChatRoute: connection.isChatRoute,
    reconnectAttempts: connection.reconnectAttempts,
    lastConnectionTime: connection.lastConnectionTime,

    // Acciones de conexión
    connect: connection.connect,
    disconnect: connection.disconnect,
    syncState: connection.syncState,
    doSyncState: connection.doSyncState,
    emit: connection.emit,
    on: connection.on,
    off: connection.off,

    // Rooms
    joinConversation: connection.joinConversation,
    leaveConversation: connection.leaveConversation,

    // Acciones de mensajes
    sendMessage: messages.sendMessage,
    markMessagesAsRead: messages.markMessagesAsRead,
    processReceivedMessage: messages.processReceivedMessage,

    // Sincronización de estado
    isStateSynced: sync.isSynced,
    lastSyncTime: sync.lastSyncTime,
    serverVersion: sync.serverVersion,
    localVersion: sync.localVersion,
    syncWithServer: sync.syncWithServer,
    publishLocalChanges: sync.publishLocalChanges,

    // Eventos personalizados y de sistema
    ...events,
  };
}; 