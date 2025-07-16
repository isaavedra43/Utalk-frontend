import { io, Socket } from "socket.io-client";
import type { Message, Conversation } from "@/types/api";

type ServerToClientEvents = {
  "message:new": (message: Message) => void;
  "message:read": (data: { conversationId: string; messageId: string }) => void;
  "conversation:status": (data: { conversationId: string; status: string }) => void;
  "user:typing": (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
};

type ClientToServerEvents = {
  "join-conversation": (conversationId: string) => void;
  "leave-conversation": (conversationId: string) => void;
  "typing:start": (data: { conversationId: string; userId: string }) => void;
  "typing:stop": (data: { conversationId: string; userId: string }) => void;
};

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
  return socket;
};

export const initSocket = (token: string): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (socket) {
    return socket;
  }
  
  const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";

  console.log("🔌 Inicializando Socket.IO con URL:", VITE_SOCKET_URL);

  socket = io(VITE_SOCKET_URL, {
    auth: {
      token: `Bearer ${token}`,
    },
    transports: ["websocket", "polling"],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket conectado exitosamente:", socket?.id);
    console.log("🔗 URL:", VITE_SOCKET_URL);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket desconectado:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("🔴 Error de conexión Socket.IO:", err.message);
    console.error("🔴 Detalles del error:", err);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Desconectando socket...");
    socket.disconnect();
    socket = null;
  }
}; 