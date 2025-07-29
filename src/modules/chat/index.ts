// Punto de entrada principal del módulo de chat
// ✅ REFACTORIZADO: Exportaciones limpias y simplificadas

// Componentes principales
export { Inbox } from './Inbox'

// Componentes de conversación
export { ConversationItem } from './components/ConversationItem'
export { ConversationList } from './components/ConversationList'

// Componentes de chat
export { ChatWindow } from './components/ChatWindow'
export { MessageBubble } from './components/MessageBubble'
export { MessageInput } from './components/MessageInput'
export { MessageList } from './components/MessageList'

// Componentes de UI
export { Avatar } from './components/Avatar'
export { ChannelBadge } from './components/ChannelBadge'
export { InfoPanel } from './components/InfoPanel'
export { IAPanel } from './components/IAPanel'
export { ResponsiveInbox } from './components/ResponsiveInbox'

// Hooks
export { useConversations } from './hooks/useConversations'
export { useMessages, useSendMessage } from './hooks/useMessages'
export { useSocket } from './hooks/useSocket'

// Tipos
export type {
  // Tipos principales
  Conversation,
  MessageType,
  ChannelType,
  ConversationStatus,
  SendMessageData,
  TypingIndicator,
  
  // Props de componentes
  InboxProps,
  ResponsiveInboxProps,
  ConversationListProps,
  ChatWindowProps,
  ConversationItemProps,
  MessageBubbleProps,
  AvatarProps,
} from './types'

// Rutas del módulo
export const CHAT_ROUTES = {
  index: '/chat',
  conversation: '/chat/:conversationId',
  newChat: '/chat/new',
  archived: '/chat/archived',
  settings: '/chat/settings',
} as const 