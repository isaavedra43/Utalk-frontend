// Punto de entrada principal del módulo de chat
// ✅ EMAIL-FIRST: Exportaciones limpias y organizadas

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
export { useConversationData } from './hooks/useConversationData'

// Tipos
export type {
  // Tipos principales
  MessageType,
  ChannelType,
  Message,
  Conversation,
  Contact,
  ConversationStatus,
  SuggestedResponse,
  ConversationSummary,
  
  // Filtros y datos
  ConversationFilter,
  SendMessageData,
  User,
  
  // Props de componentes
  AvatarProps,
  ChannelBadgeProps,
  ChatWindowProps,
  ConversationItemProps,
  ConversationListProps,
  MessageBubbleProps,
  IAPanelProps,
  InfoPanelProps,
  InboxProps,
  ResponsiveInboxProps,
} from './types'

// Servicios (TODO: Implementar cuando se integre con backend)
// export { messageService } from './services/messageService'
// export { conversationService } from './services/conversationService'

// Rutas del módulo
export const CHAT_ROUTES = {
  index: '/chat',
  conversation: '/chat/:conversationId',
  newChat: '/chat/new',
  archived: '/chat/archived',
  settings: '/chat/settings',
} as const 