import React, { createContext } from 'react';
import { Socket } from 'socket.io-client';
import { useWebSocketConnection, useWebSocketMessages, useWebSocketTyping } from '../hooks/websocket';

// Interface simplificada que combina todos los hooks
interface WebSocketContextType {
  // Connection
  socket: Socket | null;
  isConnected: boolean;
  isSynced: boolean;
  connectionError: string | null;
  isFallbackMode: boolean;
  isChatRoute: boolean;
  connect: (token: string, options?: { timeout?: number }) => void;
  disconnect: () => void;
  emit: (event: string, data: unknown) => boolean;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string) => void;
  syncState: () => void;
  doSyncState: (reason?: string) => void;
  
  // Conversation Management
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  
  // Messages
  sendMessage: (conversationId: string, content: string, type?: string, metadata?: Record<string, unknown>) => boolean;
  markMessagesAsRead: (conversationId: string, messageIds: string[]) => void;
  processReceivedMessage: (data: {
    conversationId: string;
    message: {
      id: string;
      content: string;
      sender: string;
      timestamp: string;
      type?: string;
      metadata?: Record<string, unknown>;
    };
  }) => void;
  
  // Typing
  typingUsers: Map<string, Set<string>>;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  processTypingEvent: (data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
  getTypingUsers: (conversationId: string) => string[];
  isAnyoneTyping: (conversationId: string) => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Usar hooks específicos
  const connection = useWebSocketConnection();
  const messages = useWebSocketMessages(connection.socket);
  const typing = useWebSocketTyping(connection.socket);

  // Combinar todas las funcionalidades
  const value: WebSocketContextType = {
    // Connection
    socket: connection.socket,
    isConnected: connection.isConnected,
    isSynced: connection.isSynced,
    connectionError: connection.connectionError,
    isFallbackMode: connection.isFallbackMode,
    isChatRoute: connection.isChatRoute,
    connect: connection.connect,
    disconnect: connection.disconnect,
    emit: connection.emit,
    on: connection.on,
    off: connection.off,
    syncState: connection.syncState,
    doSyncState: connection.doSyncState,
    
    // Conversation Management (TODO: Implementar en hooks específicos)
    joinConversation: (conversationId: string) => {
      console.log('🔗 WebSocket: Uniéndose a conversación', conversationId);
      // TODO: Implementar en useWebSocketConnection
    },
    leaveConversation: (conversationId: string) => {
      console.log('🔌 WebSocket: Saliendo de conversación', conversationId);
      // TODO: Implementar en useWebSocketConnection
    },
    
    // Messages
    sendMessage: messages.sendMessage,
    markMessagesAsRead: messages.markMessagesAsRead,
    processReceivedMessage: messages.processReceivedMessage,
    
    // Typing
    typingUsers: typing.typingUsers,
    startTyping: typing.startTyping,
    stopTyping: typing.stopTyping,
    processTypingEvent: typing.processTypingEvent,
    getTypingUsers: typing.getTypingUsers,
    isAnyoneTyping: typing.isAnyoneTyping,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Exportar el context para uso directo si es necesario
export { WebSocketContext }; 