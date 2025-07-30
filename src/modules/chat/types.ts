// Tipos específicos del módulo de chat
// ✅ REFACTORIZADO: Tipos simplificados sin lógica de filtrado
import { CanonicalConversation, CanonicalMessage } from '@/types/canonical'

// ✅ Tipo principal de conversación (usando el canónico)
export type Conversation = CanonicalConversation

// ✅ Tipos de canal y mensaje (compatibles con canonical)
export type ChannelType = "whatsapp" | "email" | "web" | "sms" | "phone" | "telegram" | "facebook" | "instagram" | "api" | "voice" | "webchat"
// ✅ TIPOS DE MENSAJE ACTUALIZADOS
export type MessageType = 
  | 'text' 
  | 'image' 
  | 'file' 
  | 'audio' 
  | 'video' 
  | 'location' 
  | 'sticker'
  | 'media' // ✅ NUEVO: Para mensajes con archivos multimedia
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

// ✅ DATOS PARA ENVÍO DE MENSAJES - CORREGIDO Y UNIFICADO
export interface SendMessageData {
  messageId?: string // ✅ UUID único generado en frontend
  conversationId: string
  content: string
  senderEmail: string
  recipientEmail: string // Made required
  type?: MessageType // Now includes 'media'
  attachments?: Array<{
    id: string
    filename: string
    url: string
    mimeType: string
    size: number
    category: 'image' | 'video' | 'audio' | 'document'
    metadata?: {
      duration?: string
      durationSeconds?: number
      bitrate?: number
      format?: string
      transcription?: string
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
