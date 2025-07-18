import { io, Socket } from "socket.io-client";
import type { Message, Conversation } from "@/types/api";

// 🔊 EVENTOS COMPLETOS DEL BACKEND SEGÚN ESPECIFICACIÓN
type ServerToClientEvents = {
  // Mensajes en tiempo real
  "new-message": (message: Message) => void;
  "message-read": (data: { conversationId: string; messageId: string; userId: string }) => void;
  
  // Conversaciones y asignaciones
  "conversation-assigned": (data: { conversationId: string; agentId: string; agentName: string }) => void;
  "conversation-status": (data: { conversationId: string; status: string }) => void;
  
  // Indicadores de escritura
  "typing-start": (data: { conversationId: string; userId: string; userName: string }) => void;
  "typing-stop": (data: { conversationId: string; userId: string }) => void;
  
  // Eventos de conexión y errores
  "connect": () => void;
  "disconnect": (reason: string) => void;
  "connect_error": (error: Error) => void;
  "reconnect": (attemptNumber: number) => void;
  "reconnect_error": (error: Error) => void;
  "reconnect_failed": () => void;
  
  // Eventos de presencia y estado
  "user-online": (data: { userId: string; userName: string }) => void;
  "user-offline": (data: { userId: string }) => void;
  
  // Notificaciones del sistema
  "notification": (data: { type: string; title: string; message: string; conversationId?: string }) => void;
  
  // Estados de entrega de mensajes
  "message-delivered": (data: { conversationId: string; messageId: string }) => void;
  "message-failed": (data: { conversationId: string; messageId: string; error: string }) => void;
};

type ClientToServerEvents = {
  // Unirse/salir de salas de conversación
  "join-conversation": (conversationId: string) => void;
  "leave-conversation": (conversationId: string) => void;
  
  // Indicadores de escritura del cliente
  "typing-start": (data: { conversationId: string; userId: string }) => void;
  "typing-stop": (data: { conversationId: string; userId: string }) => void;
  
  // Confirmaciones de lectura
  "mark-as-read": (data: { conversationId: string; messageId: string }) => void;
  
  // Eventos de presencia
  "user-status": (data: { status: 'online' | 'away' | 'offline' }) => void;
  
  // Heartbeat para mantener conexión
  "heartbeat": () => void;
};

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let reconnectionTimer: NodeJS.Timeout | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;

// 🔧 CONFIGURACIÓN ROBUSTA DE CONEXIÓN
const SOCKET_CONFIG = {
  RECONNECTION_ATTEMPTS: 10,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 30000,
  HEARTBEAT_INTERVAL: 30000, // 30 segundos
  CONNECTION_TIMEOUT: 10000,
};

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
  return socket;
};

export const initSocket = (token: string): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (socket && socket.connected) {
    console.log("🔌 Socket ya está conectado, reutilizando conexión existente");
    return socket;
  }
  
  // Limpiar socket anterior si existe
  if (socket) {
    cleanupSocket();
  }
  
  const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";

  // 🔍 LOGS DETALLADOS PARA DEBUG - SOCKET INIT
  console.group('�� [SOCKET INIT DEBUG]');
  console.log('Token recibido:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
  console.log('URL del socket:', VITE_SOCKET_URL);
  console.log('Token en localStorage:', localStorage.getItem('authToken') ? 'PRESENTE' : 'AUSENTE');
  console.groupEnd();

  console.log("🔌 Inicializando Socket.IO con configuración completa:", {
    url: VITE_SOCKET_URL,
    maxReconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
    heartbeatInterval: SOCKET_CONFIG.HEARTBEAT_INTERVAL
  });

  socket = io(VITE_SOCKET_URL, {
    auth: {
      token: `Bearer ${token}`,
    },
    transports: ["websocket", "polling"],
    forceNew: true,
    
    // 🔧 CONFIGURACIÓN ROBUSTA DE RECONEXIÓN
    reconnection: true,
    reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
    reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
    reconnectionDelayMax: SOCKET_CONFIG.RECONNECTION_DELAY_MAX,
    randomizationFactor: 0.5,
    timeout: SOCKET_CONFIG.CONNECTION_TIMEOUT,
  });

  // 🔍 LOGS DETALLADOS PARA DEBUG - SOCKET CONFIG
  console.group('🔍 [SOCKET CONFIG DEBUG]');
  console.log('Socket creado con auth token:', (socket.auth as any)?.token ? `${(socket.auth as any).token.substring(0, 20)}...` : 'NO HAY TOKEN');
  console.log('Socket ID:', socket.id);
  console.log('Socket conectado:', socket.connected);
  console.groupEnd();

  // 🔊 EVENTOS DE CONEXIÓN ROBUSTOS
  socket.on("connect", () => {
    console.log("✅ Socket conectado exitosamente:", {
      socketId: socket?.id,
      transport: socket?.io.engine.transport.name,
      url: VITE_SOCKET_URL
    });
    
    // Limpiar timer de reconexión manual si existe
    if (reconnectionTimer) {
      clearTimeout(reconnectionTimer);
      reconnectionTimer = null;
    }
    
    // Iniciar heartbeat
    startHeartbeat();
    
    // Notificar estado online
    socket?.emit('user-status', { status: 'online' });
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket desconectado:", {
      reason,
      socketId: socket?.id,
      willReconnect: reason !== 'io server disconnect'
    });
    
    // Detener heartbeat
    stopHeartbeat();
    
    // Si la desconexión fue iniciada por el servidor, intentar reconexión manual
    if (reason === 'io server disconnect') {
      console.log("🔄 Servidor cerró conexión, iniciando reconexión manual...");
      scheduleReconnection();
    }
  });

  socket.on("connect_error", (err) => {
    console.error("🔴 Error de conexión Socket.IO:", {
      message: err.message,
      name: err.name || 'Unknown error',
      stack: err.stack || 'No stack trace'
    });
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("🔄 Socket reconectado exitosamente:", {
      attempts: attemptNumber,
      socketId: socket?.id
    });
  });

  socket.on("reconnect_error", (err) => {
    console.error("❌ Error en reconexión:", {
      message: err.message,
      attempt: socket?.io.reconnectionAttempts
    });
  });

  socket.on("reconnect_failed", () => {
    console.error("💀 Reconexión falló después de todos los intentos");
    console.log("🔄 Iniciando reconexión manual en 10 segundos...");
    scheduleReconnection(10000);
  });

  // 🔊 EVENTOS DE MENSAJES COMPLETOS
  socket.on("new-message", (message: Message) => {
    console.log("📨 Nuevo mensaje recibido:", {
      messageId: message.id,
      conversationId: message.conversationId,
      sender: message.sender,
      contentType: message.content?.substring(0, 20) + '...'
    });
  });

  socket.on("message-read", (data) => {
    console.log("👁️ Mensaje marcado como leído:", data);
  });

  socket.on("message-delivered", (data) => {
    console.log("✅ Mensaje entregado:", data);
  });

  socket.on("message-failed", (data) => {
    console.log("❌ Mensaje falló:", data);
  });

  // 🔊 EVENTOS DE CONVERSACIÓN
  socket.on("conversation-assigned", (data) => {
    console.log("👤 Conversación asignada:", data);
  });

  socket.on("conversation-status", (data) => {
    console.log("📋 Estado de conversación actualizado:", data);
  });

  // 🔊 EVENTOS DE ESCRITURA
  socket.on("typing-start", (data) => {
    console.log("✍️ Usuario empezó a escribir:", data);
  });

  socket.on("typing-stop", (data) => {
    console.log("⏹️ Usuario dejó de escribir:", data);
  });

  // 🔊 EVENTOS DE PRESENCIA
  socket.on("user-online", (data) => {
    console.log("🟢 Usuario en línea:", data);
  });

  socket.on("user-offline", (data) => {
    console.log("🔴 Usuario fuera de línea:", data);
  });

  // 🔊 NOTIFICACIONES DEL SISTEMA
  socket.on("notification", (data) => {
    console.log("🔔 Notificación del sistema:", data);
    
    // Mostrar notificación en UI si es necesario
    if (data.type === 'assignment' || data.type === 'mention') {
      // Aquí se puede integrar con el sistema de toast
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: data.title,
          description: data.message,
        });
      }).catch(console.error);
    }
  });

  return socket;
};

// 🔧 FUNCIONES DE UTILIDAD
function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  
  heartbeatTimer = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit('heartbeat');
      console.log("💓 Heartbeat enviado");
    }
  }, SOCKET_CONFIG.HEARTBEAT_INTERVAL);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function scheduleReconnection(delay = SOCKET_CONFIG.RECONNECTION_DELAY) {
  if (reconnectionTimer) return; // Ya hay reconexión programada
  
  reconnectionTimer = setTimeout(() => {
    console.log("🔄 Intentando reconexión manual...");
    const token = localStorage.getItem('authToken');
    if (token) {
      initSocket(token);
    } else {
      console.error("❌ No hay token para reconexión");
    }
    reconnectionTimer = null;
  }, delay);
}

function cleanupSocket() {
  if (socket) {
    console.log("🧹 Limpiando socket anterior...");
    
    // Remover todos los listeners
    socket.removeAllListeners();
    
    // Desconectar
    socket.disconnect();
    
    // Detener timers
    stopHeartbeat();
    if (reconnectionTimer) {
      clearTimeout(reconnectionTimer);
      reconnectionTimer = null;
    }
    
    socket = null;
  }
}

export const disconnectSocket = () => {
  console.log("🔌 Desconectando socket...");
  
  // Notificar estado offline antes de desconectar
  if (socket && socket.connected) {
    socket.emit('user-status', { status: 'offline' });
  }
  
  cleanupSocket();
};

// 🔧 FUNCIONES AUXILIARES PARA COMPONENTES
export const joinConversation = (conversationId: string) => {
  if (socket && socket.connected) {
    socket.emit('join-conversation', conversationId);
    console.log("🏠 Uniéndose a conversación:", conversationId);
  } else {
    console.warn("⚠️ Socket no conectado al intentar unirse a conversación");
  }
};

export const leaveConversation = (conversationId: string) => {
  if (socket && socket.connected) {
    socket.emit('leave-conversation', conversationId);
    console.log("🚪 Saliendo de conversación:", conversationId);
  }
};

export const startTyping = (conversationId: string, userId: string) => {
  if (socket && socket.connected) {
    socket.emit('typing-start', { conversationId, userId });
    console.log("✍️ Indicando que se está escribiendo:", { conversationId, userId });
  }
};

export const stopTyping = (conversationId: string, userId: string) => {
  if (socket && socket.connected) {
    socket.emit('typing-stop', { conversationId, userId });
    console.log("⏹️ Indicando que se dejó de escribir:", { conversationId, userId });
  }
};

export const markMessageAsRead = (conversationId: string, messageId: string) => {
  if (socket && socket.connected) {
    socket.emit('mark-as-read', { conversationId, messageId });
    console.log("👁️ Marcando mensaje como leído:", { conversationId, messageId });
  }
};

// 🔧 ESTADO DE CONEXIÓN PARA COMPONENTES
export const getConnectionStatus = (): 'connected' | 'connecting' | 'disconnected' => {
  if (!socket) return 'disconnected';
  if (socket.connected) return 'connected';
  if (socket.disconnected) return 'disconnected';
  return 'connecting';
};

// 🔧 INFORMACIÓN DE DEBUG
export const getSocketInfo = () => {
  return {
    connected: socket?.connected || false,
    id: socket?.id || null,
    transport: socket?.io.engine.transport.name || null,
    reconnectionAttempts: socket?.io.reconnectionAttempts || 0,
    hasToken: !!localStorage.getItem('authToken')
  };
}; 