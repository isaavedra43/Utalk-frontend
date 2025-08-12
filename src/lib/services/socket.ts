/* eslint-disable no-console */
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

import { wsUrl } from '$lib/config/api';
import { toDateSafe } from '$lib/utils/time';
import { io, type Socket } from 'socket.io-client';
import { getAccessToken, setAccessToken } from '../stores/auth.store';
import { conversationsStore } from '../stores/conversations.store';
import { messagesStore } from '../stores/messages.store';
import { normalizeConvId } from './transport';

// Función para normalizar mensajes con timestamps y conversationId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMessage(raw: any, conversationId: string): any {
  return {
    id: raw.id,
    conversationId,
    content: raw.content || raw.text || '',
    sender: raw.sender || raw.senderIdentifier || 'unknown',
    type: raw.type || 'text',
    status: raw.status || 'sent',
    timestamp: toDateSafe(raw.timestamp || raw.createdAt || raw.updatedAt),
    createdAt: toDateSafe(raw.createdAt || raw.timestamp),
    updatedAt: toDateSafe(raw.updatedAt || raw.timestamp),
    ...raw // mantener otros campos
  };
}

export type ChatListeners = {
  onNewMessage?: (payload: unknown) => void;
  onConversationEvent?: (payload: unknown) => void;
  onTypingIndicator?: (payload: unknown) => void;
};

const listenerSet: Set<ChatListeners> = new Set();

// Función para obtener token actual
function getCurrentToken(): string | null {
  return getAccessToken();
}

// Función para refrescar token si es necesario
export async function refreshTokenIfNeeded(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      // Intentar refrescar token usando el cliente HTTP
      const { httpPost } = await import('$lib/api/http');
      const data = await httpPost<{ token?: string }>('auth/refresh', { refreshToken });
      
      if (data && data.token) {
        setAccessToken(data.token);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.debug('RT:TOKEN_REFRESH_FAILED', { error });
    return false;
  }
}

export function registerChatListeners(partial: ChatListeners): () => void {
  listenerSet.add(partial);
  return () => listenerSet.delete(partial);
}

export function clearChatListeners() {
  listenerSet.clear();
}

let socket: Socket | null = null;

export function isConnected(): boolean {
  return socket?.connected || false;
}

export function connectSocket() {
  if (typeof window === 'undefined') return;
  if (socket?.connected) return;

  const token = getCurrentToken();
  if (!token) {
    console.debug('RT:CONNECT_FAILED', { reason: 'No token available' });
    return;
  }

  socket = io(wsUrl('socket.io'), {
    transports: ['websocket'],
    withCredentials: true,
    auth: token ? { token } : undefined
  });

  // Listeners básicos con telemetría RT
  socket.on('connect', () => {
    console.debug('RT:CONNECT', { id: socket?.id, timestamp: new Date().toISOString() });
  });

  socket.on('disconnect', (reason) => {
    console.debug('RT:DISCONNECT', { reason, timestamp: new Date().toISOString() });
  });

  socket.on('reconnect', (attemptNumber) => {
    console.debug('RT:RECONNECT', { attempt: attemptNumber, timestamp: new Date().toISOString() });
  });

  socket.on('reconnect_error', (error) => {
    console.debug('RT:RECONNECT_ERR', { message: error?.message, timestamp: new Date().toISOString() });
  });

  socket.on('connect_error', (err) => {
    console.debug('RT:CONNECT_ERROR', { message: err.message, timestamp: new Date().toISOString() });

    // Si es error de autenticación, intentar refrescar token
    if (err.message.includes('auth') || err.message.includes('token')) {
      refreshTokenIfNeeded().then(refreshed => {
        if (refreshed && socket) {
          const newToken = getCurrentToken();
          if (newToken) {
            socket.auth = { token: newToken };
            socket.connect();
          }
        }
      });
    }
  });

  // Handler unificado para mensajes con normalización completa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInboundMessage = (payload: any) => {
    // 1) Unwrap: preferir payload.message; fallback al propio payload
    const raw = payload?.message ?? payload;
    const convIdRaw = payload?.conversationId ?? raw?.conversationId;

    if (!raw?.id || !convIdRaw) {
      console.debug('RT:MSG_DROP', { reason: 'missing id/convId', keys: Object.keys(payload || {}) });
      return;
    }

    // 2) Normalizar conversationId
    const convId = normalizeConvId(convIdRaw);
    
    // 3) Normalizar mensaje completo
    const msg = normalizeMessage(raw, convId);

    // 4) De-duplicación por message.id
    if (messagesStore.has(msg.id)) {
      console.debug('RT:MSG_DUPLICATE', { messageId: msg.id });
      return;
    }

    console.debug('RT:MSG_IN', { messageId: msg.id, conversationId: convId });

    // 5) Actualizar stores con el mensaje normalizado
    messagesStore.addMessage(msg);
    conversationsStore.addMessage(convId, msg);
    
    for (const l of listenerSet) l.onNewMessage?.(msg);
  };

  // Handler unificado para eventos de conversación
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleConversationUpdated = (payload: any) => {
    const convIdRaw = payload?.conversationId;
    if (!convIdRaw) return;

    const convId = normalizeConvId(convIdRaw);
    console.debug('RT:CONV_EVT', { conversationId: convId, type: payload?.type });

    const msg = payload?.lastMessage;
    if (msg?.id) {
      msg.conversationId = convId;

      if (!messagesStore.has(msg.id)) {
        messagesStore.addMessage(msg);
      }
      conversationsStore.addMessage(convId, msg);
    } else {
      // "tocar" la conversación para reordenar por updatedAt
      conversationsStore.updateConversation(convId, {
        updatedAt: payload?.updatedAt || new Date().toISOString(),
        unreadCount: payload?.unreadCount || 0
      });
    }

    for (const l of listenerSet) l.onConversationEvent?.(payload);
  };

  // Listeners para eventos obligatorios
  socket.on('new-message', handleInboundMessage);
  socket.on('conversation-event', handleConversationUpdated);

  // Listeners para alias opcionales (compatibilidad)
  socket.on('message.created', handleInboundMessage);
  socket.on('conversation.updated', handleConversationUpdated);

  socket.on('typing-indicator', (payload) => {
    // Normalizar conversation ID
    if (payload.conversationId) {
      payload.conversationId = normalizeConvId(payload.conversationId);
    }

    for (const l of listenerSet) l.onTypingIndicator?.(payload);
  });
}

export function joinConversation(conversationId: string) {
  const normalizedId = normalizeConvId(conversationId);
  console.debug('RT:JOIN', { conversationId: normalizedId, timestamp: new Date().toISOString() });
  socket?.emit('join-conversation', { conversationId: normalizedId });
}

export function leaveConversation(conversationId: string) {
  const normalizedId = normalizeConvId(conversationId);
  console.debug('RT:LEAVE', { conversationId: normalizedId, timestamp: new Date().toISOString() });
  socket?.emit('leave-conversation', { conversationId: normalizedId });
}

export function sendTyping(conversationId: string, isTyping: boolean) {
  const normalizedId = normalizeConvId(conversationId);
  socket?.emit('typing', { conversationId: normalizedId, isTyping });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
