// Módulo Chat - Sistema de mensajería y comunicación
// Exportaciones públicas del módulo para uso en otras partes de la aplicación

// Componente principal
export { default as Inbox } from './Inbox'

// Componentes principales
export { default as ConversationList } from './components/ConversationList'
export { default as ConversationItem } from './components/ConversationItem'
export { default as MessageList } from './components/MessageList'
export { default as MessageInput } from './components/MessageInput'
export { default as MessageBubble } from './components/MessageBubble'
export { default as ChatWindow } from './components/ChatWindow'
export { default as Sidebar } from './components/Sidebar'
export { default as IAPanel } from './components/IAPanel'
export { default as InfoPanel } from './components/InfoPanel'

// Componentes de UI
export { default as Avatar } from './components/Avatar'
export { default as ChannelBadge } from './components/ChannelBadge'
export * as LoaderSkeletons from './components/LoaderSkeleton'

// Tipos específicos
export type { 
  Message, 
  Conversation, 
  Contact,
  MessageType,
  ChannelType,
  ConversationStatus,
  ConversationFilter,
  TypingIndicator,
  SuggestedResponse,
  ConversationSummary,
  InboxProps,
  ChatWindowProps,
  ConversationListProps,
  MessageBubbleProps,
  IAPanelProps,
  InfoPanelProps
} from './types'

// Servicios (TODO: Implementar cuando se integre con backend)
// export { messageService } from './services/messageService'
// export { conversationService } from './services/conversationService'

// Hooks específicos del módulo (TODO: Implementar)
// export { useMessages } from './hooks/useMessages'
// export { useConversations } from './hooks/useConversations'
// export { useSocket } from './hooks/useSocket'

// Rutas del módulo
export const CHAT_ROUTES = {
  index: '/chat',
  conversation: '/chat/:conversationId',
  newChat: '/chat/new',
  archived: '/chat/archived',
  settings: '/chat/settings',
} as const 