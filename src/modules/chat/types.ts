// Tipos específicos del módulo de chat
// ✅ EMAIL-FIRST: Todos los identificadores usan email
import type { 
  CanonicalMessage, 
  CanonicalConversation, 
  CanonicalContact 
} from '@/types/canonical'

// ✅ Tipos de mensaje y canal
export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'sticker'
export type ChannelType = 'whatsapp' | 'telegram' | 'web' | 'email' | 'sms' | 'voice' | 'webchat' | 'api' | 'facebook' | 'instagram'

// ✅ Tipos adicionales requeridos por componentes
export interface Message extends CanonicalMessage {}
export interface Conversation extends CanonicalConversation {}
export interface Contact extends CanonicalContact {}

export type ConversationStatus = 'open' | 'pending' | 'closed' | 'archived'

export interface SuggestedResponse {
  id: string
  text: string
  category: string
}

export interface ConversationSummary {
  id: string
  summary: string
  sentiment: string
  topics: string[]
}

// ✅ Filtro de conversaciones usando EMAIL
export interface ConversationFilter {
  assignedTo?: string       // Email del agente asignado
  customerEmail?: string    // Email del cliente
  participantEmail?: string // Email del participante
  status?: ConversationStatus
  channel?: ChannelType
  dateFrom?: string        // Fecha desde (ISO string)
  dateTo?: string          // Fecha hasta (ISO string)
  search?: string          // Búsqueda de texto
  limit?: number
  page?: number
  unreadOnly?: boolean     // Solo conversaciones no leídas
  tags?: string[]          // Tags de conversación
}

// ✅ Datos para envío de mensaje usando EMAIL
export interface SendMessageData {
  conversationId: string
  content: string
  type?: MessageType
  senderEmail: string      // ✅ EMAIL como identificador
  recipientEmail: string   // ✅ EMAIL como identificador
  timestamp?: Date
}

// ✅ Props para componentes
export interface AvatarProps {
  name?: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'  // ✅ Incluir 'xl'
  isOnline?: boolean
  channel?: ChannelType
}

export interface ChannelBadgeProps {
  channel: ChannelType
  size?: 'sm' | 'md'
}

export interface ChatWindowProps {
  conversationId?: string
  onSendMessage: (data: SendMessageData) => void
  onSelectConversation?: (conversationId: string) => void
  isLoading?: boolean
  typingUsers?: string[]  // ✅ Array de strings de usuarios escribiendo
}

export interface ConversationItemProps {
  conversation: CanonicalConversation
  isSelected?: boolean
  onSelect: (conversationId: string) => void
  showAvatar?: boolean
}

export interface ConversationListProps {
  conversations: CanonicalConversation[]
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
  isLoading?: boolean
  error?: string | null
  filter?: ConversationFilter
  onFilterChange?: (filter: ConversationFilter) => void
}

export interface MessageBubbleProps {
  message: CanonicalMessage
  isOwn: boolean
  showAvatar?: boolean
  isGrouped?: boolean
}

export interface IAPanelProps {
  conversationId?: string
  summary?: string
  suggestions?: string[]
  onSendSuggestion?: (suggestion: string) => void
  onAskAssistant?: (question: string) => void
}

export interface InfoPanelProps {
  conversationId?: string
  contact?: CanonicalContact
  conversation?: CanonicalConversation
  onUpdateContact?: (contact: Partial<CanonicalContact>) => void
  onUpdateConversation?: (conversation: Partial<CanonicalConversation>) => void
}

export interface InboxProps {
  initialConversationId?: string
  onSendMessage?: (data: SendMessageData) => void
  onSelectConversation?: (conversationId: string) => void
}

export interface ResponsiveInboxProps {
  initialConversationId?: string
  onSendMessage?: (data: SendMessageData) => void
  onSelectConversation?: (conversationId: string) => void
}

// ✅ Usuario simplificado EMAIL-FIRST
export interface User {
  email: string            // ✅ Identificador principal
  name: string
  permissions: string[]
  department: string
  isActive: boolean
  role?: string
  avatar?: string
  phone?: string
  createdAt?: string
  updatedAt?: string
} 