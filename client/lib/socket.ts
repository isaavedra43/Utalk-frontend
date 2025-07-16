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
  
  const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  socket = io(VITE_API_URL, {
    auth: {
      token: `Bearer ${token}`,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 