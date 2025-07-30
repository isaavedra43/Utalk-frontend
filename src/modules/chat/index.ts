// Índice principal del módulo de chat
// ✅ SOPORTE MULTIMEDIA COMPLETO: Exportaciones actualizadas

// Componentes principales
export { Inbox } from './Inbox'
export { ResponsiveInbox } from './components/ResponsiveInbox'
export { ChatWindow } from './components/ChatWindow'
export { MessageBubble } from './components/MessageBubble'
export { ConversationItem } from './components/ConversationItem'
export { ConversationList } from './components/ConversationList'
export { MessageList } from './components/MessageList'
export { InfoPanel } from './components/InfoPanel'
export { IAPanel } from './components/IAPanel'
export { ChannelBadge } from './components/ChannelBadge'
export { Avatar } from './components/Avatar'
export { MessageInput } from './components/MessageInput'
export { MessageStatus } from './components/MessageStatus'

// ✅ NUEVOS: Componentes multimedia
export { FileUpload, useFileUpload } from './components/FileUpload'
export { FileRenderer } from './components/FileRenderer'
export { AudioPlayer } from './components/AudioPlayer'
export { AudioRecorder } from './components/AudioRecorder'

// Hooks
export { useConversations } from './hooks/useConversations'
export { useMessages, useSendMessage } from './hooks/useMessages'
export { useSocket, useTypingIndicators } from './hooks/useSocket'

// ✅ NUEVOS: Hooks multimedia
export { useTemporaryUrl, useFileUrl } from './hooks/useTemporaryUrl'

// Constantes y validadores Socket.IO
export { 
  SOCKET_EVENTS, 
  CONNECTION_EVENTS, 
  CONVERSATION_EVENTS, 
  MESSAGE_EVENTS, 
  TYPING_EVENTS, 
  STATUS_EVENTS 
} from './constants/socketEvents'

export {
  validateNewMessageEvent,
  validateMessageReadEvent,
  validateTypingEvent,
  validateUserEvent,
  safeEventHandler
} from './validators/socketValidators'

// Servicios
export { messageService } from './services/messageService'
export { conversationService } from './services/conversationService'
export { contactService } from './services/contactService'
export { uploadService } from './services/uploadService'

// Tipos
export type {
  Message,
  Conversation,
  Contact,
  MessageType,
  ChannelType,
  ConversationStatus,
  SendMessageData,
  TypingIndicator,
  MessageBubbleProps,
  ConversationItemProps
} from './types'

// Rutas del módulo
export const CHAT_ROUTES = {
  index: '/chat',
  conversation: '/chat/:conversationId',
  newChat: '/chat/new',
  archived: '/chat/archived',
  settings: '/chat/settings',
} as const 