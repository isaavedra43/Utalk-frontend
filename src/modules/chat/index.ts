// Módulo Chat - Sistema de mensajería y comunicación
// Exportaciones públicas del módulo para uso en otras partes de la aplicación

// Componentes principales
// export { ConversationList } from './components/ConversationList'
// export { MessageList } from './components/MessageList'
// export { MessageInput } from './components/MessageInput'
// export { ChatWindow } from './components/ChatWindow'

// Servicios
// export { messageService } from './services/messageService'
// export { conversationService } from './services/conversationService'

// Hooks específicos del módulo
// export { useMessages } from './hooks/useMessages'
// export { useConversations } from './hooks/useConversations'
// export { useSocket } from './hooks/useSocket'

// Tipos específicos
// export type { Message, Conversation, MessageType } from './types'

// Rutas del módulo
export const CHAT_ROUTES = {
  index: '/chat',
  conversation: '/chat/:conversationId',
  newChat: '/chat/new',
  archived: '/chat/archived',
  settings: '/chat/settings',
} as const 