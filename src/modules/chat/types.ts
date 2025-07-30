// Tipos específicos del módulo de chat
// ✅ REFACTORIZADO: Tipos simplificados sin lógica de filtrado
import { CanonicalConversation, CanonicalMessage } from '@/types/canonical'

// ✅ Tipo principal de conversación (usando el canónico)
export type Conversation = CanonicalConversation

// ✅ Tipos de canal y mensaje (compatibles con canonical)
export type ChannelType = "whatsapp" | "email" | "web" | "sms" | "phone" | "telegram" | "facebook" | "instagram" | "api" | "voice" | "webchat"
// ✅ Tipos de mensajes extendido
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'sticker'
export type ConversationStatus = 'open' | 'pending' | 'closed' | 'archived'

// ✅ Tipos legacy para compatibilidad
export type Contact = any
export type Message = CanonicalMessage

// ✅ Props para componentes principales
export interface InboxProps {
  initialConversationId?: string
  onSendMessage?: (messageData: SendMessageData) => void
  onSelectConversation?: (conversationId: string) => void
}

export interface ResponsiveInboxProps {
  conversations: Conversation[]
  initialConversationId?: string
  onSendMessage?: (messageData: SendMessageData) => void
  onSelectConversation?: (conversationId: string) => void
}

export interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId?: string
  onSelect: (conversationId: string) => void
  onSelectConversation?: (conversationId: string) => void
  isLoading: boolean
  error?: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  filter?: any
  onFilterChange?: (filter: any) => void
}

export interface ChatWindowProps {
  conversation?: Conversation
  conversationId?: string
  messages: CanonicalMessage[]
  isLoading: boolean
  onSendMessage: (data: SendMessageData) => void
  currentUserEmail: string
  typingUsers: TypingIndicator[]
}

// ✅ Datos para envío de mensajes - UNIFICADO
export interface SendMessageData {
  conversationId: string
  content: string
  senderEmail: string
  recipientEmail: string // ✅ REQUERIDO para compatibilidad con el servicio
  type?: MessageType
  senderName?: string
  senderAvatar?: string
  recipientName?: string
  recipientAvatar?: string
  attachments?: Array<{
    id: string
    filename: string
    url: string
    mimeType: string
    size: number
    category: 'image' | 'audio' | 'document' | 'video'
    uploadedAt?: Date
    metadata?: {
      width?: number
      height?: number
      duration?: number
      thumbnail?: string
    }
  }>
}

// ✅ Indicador de escritura
export interface TypingIndicator {
  userEmail: string
  userName: string
  conversationId: string
  timestamp: Date
}

// ✅ Props para otros componentes (mantenemos los existentes que funcionan)
export interface AvatarProps {
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  src?: string
  isOnline?: boolean
  channel?: string
}

export interface ConversationItemProps {
  conversation: Conversation
  isSelected?: boolean
  onSelect: (conversationId: string) => void
  showAvatar?: boolean
}

export interface MessageBubbleProps {
  message: CanonicalMessage
  isOwn: boolean
  showAvatar?: boolean
  isGrouped?: boolean
}

// ✅ Props para paneles
export interface IAPanelProps {
  conversationId?: string
  onSendSuggestion?: (suggestion: string) => void
  onAskAssistant?: (question: string) => void
}

export interface InfoPanelProps {
  conversation?: Conversation
  conversationId?: string
  contact?: any
  onUpdateContact?: (contact: any) => void
  onUpdateConversation?: (conversation: any) => void
}
