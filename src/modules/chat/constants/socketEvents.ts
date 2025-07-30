// Constantes de eventos Socket.IO para mantener sincronización Frontend-Backend
// Basado en Socket.IO best practices: https://socket.io/docs/v4/server-application-structure

/**
 * ✅ EVENTOS DE CONEXIÓN
 */
export const CONNECTION_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  AUTHENTICATED: 'authenticated',
  AUTHENTICATION_ERROR: 'authentication_error',
} as const

/**
 * ✅ EVENTOS DE CONVERSACIONES (ROOMS)
 */
export const CONVERSATION_EVENTS = {
  JOIN: 'join-conversation',
  LEAVE: 'leave-conversation', 
  USER_JOINED: 'user-joined-conversation',
  USER_LEFT: 'user-left-conversation',
  ASSIGNED: 'conversation-assigned',
} as const

/**
 * ✅ EVENTOS DE MENSAJES
 */
export const MESSAGE_EVENTS = {
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  MESSAGE_DELIVERED: 'message-delivered',
  MESSAGE_FAILED: 'message-failed',
  MESSAGE_NOTIFICATION: 'message-notification',
  ASSIGNED_MESSAGE_NOTIFICATION: 'assigned-message-notification',
} as const

/**
 * ✅ EVENTOS DE TYPING INDICATORS
 */
export const TYPING_EVENTS = {
  START: 'typing-start',
  STOP: 'typing-stop',
} as const

/**
 * ✅ EVENTOS DE ESTADO
 */
export const STATUS_EVENTS = {
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  STATUS_CHANGE: 'status-change',
} as const

/**
 * ✅ TODOS LOS EVENTOS COMBINADOS
 */
export const SOCKET_EVENTS = {
  ...CONNECTION_EVENTS,
  ...CONVERSATION_EVENTS,
  ...MESSAGE_EVENTS,
  ...TYPING_EVENTS,
  ...STATUS_EVENTS,
} as const

/**
 * ✅ TIPOS TYPESCRIPT
 */
export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS]
export type ConnectionEvent = typeof CONNECTION_EVENTS[keyof typeof CONNECTION_EVENTS]
export type ConversationEvent = typeof CONVERSATION_EVENTS[keyof typeof CONVERSATION_EVENTS]
export type MessageEvent = typeof MESSAGE_EVENTS[keyof typeof MESSAGE_EVENTS]
export type TypingEvent = typeof TYPING_EVENTS[keyof typeof TYPING_EVENTS]
export type StatusEvent = typeof STATUS_EVENTS[keyof typeof STATUS_EVENTS] 