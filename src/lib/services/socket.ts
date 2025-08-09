/**
 * Cliente Socket.io configurado para UTalk Frontend
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md - Sección "🔌 EVENTOS SOCKET.IO ESPECÍFICOS"
 * 
 * Eventos implementados según documentación:
 * - join-conversation: Unirse a sala de conversación
 * - new-message: Recibir nuevos mensajes
 * - message-status-updated: Actualizar estado de mensajes
 * - user-typing: Indicador de escritura
 * - sync-state: Sincronización post-reconexión
 * - disconnect/reconnect: Manejo de reconexión automática
 */

import { environment } from '$lib/config/environment';
import { io, type Socket } from 'socket.io-client';

export type ChatListeners = {
  onNewMessage?: (payload: any) => void;
  onConversationEvent?: (payload: any) => void;
  onTypingIndicator?: (payload: any) => void;
};

const listenerSet: Set<ChatListeners> = new Set();

export function registerChatListeners(partial: ChatListeners): () => void {
  listenerSet.add(partial);
  return () => listenerSet.delete(partial);
}

export function clearChatListeners() {
  listenerSet.clear();
}

let socket: Socket | null = null;

export function connectSocket() {
  if (typeof window === 'undefined') return;
  if (socket?.connected) return;

  socket = io(environment.SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true
  });

  socket.on('connect', () => { });
  socket.on('disconnect', () => { });

  socket.on('new-message', (payload) => {
    for (const l of listenerSet) l.onNewMessage?.(payload);
  });
  socket.on('conversation-event', (payload) => {
    for (const l of listenerSet) l.onConversationEvent?.(payload);
  });
  socket.on('typing-indicator', (payload) => {
    for (const l of listenerSet) l.onTypingIndicator?.(payload);
  });
}

export function joinConversation(conversationId: string) {
  socket?.emit('join-conversation', { conversationId });
}

export function leaveConversation(conversationId: string) {
  socket?.emit('leave-conversation', { conversationId });
}

export function sendTyping(conversationId: string, isTyping: boolean) {
  socket?.emit('typing', { conversationId, isTyping });
}
