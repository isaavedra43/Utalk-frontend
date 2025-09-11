import React, { createContext } from 'react';
import { Socket } from 'socket.io-client';
import { useWebSocket, useWebSocketTyping } from '../hooks/websocket';
import '../utils/debugUtils'; // Importar utilidades de debug

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
      senderIdentifier: string;
      recipientIdentifier?: string;
      timestamp: string;
      type?: string;
      metadata?: Record<string, unknown>;
      mediaUrl?: string;
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
  // Usar hook compositor principal
  const webSocket = useWebSocket();
  const typing = useWebSocketTyping(webSocket.socket);

  // Combinar todas las funcionalidades
  const value: WebSocketContextType = {
    // Connection
    socket: webSocket.socket,
    isConnected: webSocket.isConnected,
    isSynced: webSocket.isSynced,
    connectionError: webSocket.connectionError,
    isFallbackMode: webSocket.isFallbackMode,
    isChatRoute: webSocket.isChatRoute,
    connect: webSocket.connect,
    disconnect: webSocket.disconnect,
    emit: webSocket.emit,
    on: webSocket.on,
    off: webSocket.off,
    syncState: webSocket.syncState,
    doSyncState: webSocket.doSyncState,
    
    // Conversation Management
    joinConversation: webSocket.joinConversation,
    leaveConversation: webSocket.leaveConversation,
    
    // Messages
    sendMessage: webSocket.sendMessage,
    markMessagesAsRead: webSocket.markMessagesAsRead,
    processReceivedMessage: webSocket.processReceivedMessage,
    
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