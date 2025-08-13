import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

// Configuración del socket
const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export const initializeSocket = (): Socket => {
  const token = localStorage.getItem('access_token');
  
  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
    timeout: 30000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  setupSocketListeners();
  return socket;
};

const setupSocketListeners = (): void => {
  if (!socket) return;

  // Conexión
  socket.on('connect', () => {
    console.log('Socket conectado:', socket?.id);
    // Sincronizar estado inicial
    socket?.emit('sync-state', { syncId: Date.now() });
  });

  // Desconexión
  socket.on('disconnect', (reason) => {
    console.log('Socket desconectado:', reason);
  });

  // Errores
  socket.on('error', (error) => {
    console.error('Error de socket:', error);
  });

  // Estado sincronizado
  socket.on('state-synced', (data) => {
    console.log('Estado sincronizado:', data);
    // Actualizar estado de la aplicación
    // updateAppState(data);
  });

  // Nuevos mensajes
  socket.on('new-message', (data) => {
    console.log('Nuevo mensaje recibido:', data);
    // Actualizar conversación en tiempo real
    // handleNewMessage(data);
  });

  // Mensaje enviado (confirmación)
  socket.on('message-sent', (data) => {
    console.log('Mensaje enviado confirmado:', data);
    // Actualizar estado del mensaje
    // handleMessageSent(data);
  });

  // Mensaje leído
  socket.on('message-read', (data) => {
    console.log('Mensaje marcado como leído:', data);
    // Actualizar indicadores de lectura
    // handleMessageRead(data);
  });

  // Usuario escribiendo
  socket.on('typing', (data) => {
    console.log('Usuario escribiendo:', data);
    // Mostrar indicador de escritura
    // showTypingIndicator(data);
  });

  // Usuario dejó de escribir
  socket.on('typing-stop', (data) => {
    console.log('Usuario dejó de escribir:', data);
    // Ocultar indicador de escritura
    // hideTypingIndicator(data);
  });

  // Usuario en línea
  socket.on('user-online', (data) => {
    console.log('Usuario en línea:', data);
    // Actualizar estado de presencia
    // updateUserPresence(data);
  });

  // Usuario desconectado
  socket.on('user-offline', (data) => {
    console.log('Usuario desconectado:', data);
    // Actualizar estado de presencia
    // updateUserPresence(data);
  });

  // Evento de conversación
  socket.on('conversation-event', (data) => {
    console.log('Evento de conversación:', data);
    // Actualizar lista de conversaciones
    // handleConversationEvent(data);
  });

  // Shutdown del servidor
  socket.on('server-shutdown', (data) => {
    console.log('Servidor reiniciándose:', data);
    // Mostrar notificación y reconectar
    // showReconnectionMessage(data);
  });

  // Sincronización requerida
  socket.on('sync-required', (data) => {
    console.log('Sincronización requerida:', data);
    // Reconectar y sincronizar
    socket?.emit('sync-state', { syncId: Date.now() });
  });
};

// Métodos del Socket
export const joinConversation = (conversationId: string): void => {
  socket?.emit('join-conversation', { conversationId });
};

export const leaveConversation = (conversationId: string): void => {
  socket?.emit('leave-conversation', { conversationId });
};

export const sendMessage = (
  conversationId: string,
  content: string,
  type = 'text',
  metadata: Record<string, unknown> = {}
): void => {
  socket?.emit('new-message', {
    conversationId,
    content,
    type,
    metadata,
  });
};

export const startTyping = (conversationId: string): void => {
  socket?.emit('typing', { conversationId });
};

export const stopTyping = (conversationId: string): void => {
  socket?.emit('typing-stop', { conversationId });
};

export const markMessagesAsRead = (conversationId: string, messageIds: string[]): void => {
  socket?.emit('message-read', {
    conversationId,
    messageIds,
  });
};

export const changeUserStatus = (status: string): void => {
  socket?.emit('user-status-change', { status });
};

export const syncState = (): void => {
  socket?.emit('sync-state', { syncId: Date.now() });
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
}; 