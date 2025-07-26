// Tipos para el módulo de Chat/Inbox de UTalk
// Define todas las interfaces y enums necesarios para mensajería
// ✅ ALINEADO 100% CON ESTRUCTURA CANÓNICA

// ✅ IMPORTAR TIPOS CANÓNICOS EN LUGAR DE DUPLICAR
import { 
  CanonicalMessage, 
  CanonicalConversation, 
  CanonicalContact 
} from '@/types/canonical'

// ✅ USAR TIPOS CANÓNICOS COMO FUENTE DE VERDAD
export type Message = CanonicalMessage
export type Contact = CanonicalContact
export type Conversation = CanonicalConversation

// ✅ MANTENER TIPOS ESPECÍFICOS DEL MÓDULO CHAT
export type ChannelType = 'whatsapp' | 'telegram' | 'email' | 'webchat' | 'api' | 'facebook' | 'web' | 'instagram' // Alineado con CanonicalContact
export type MessageType = CanonicalMessage['type']
export type ConversationStatus = CanonicalConversation['status']
export type UserRole = 'admin' | 'agent' | 'viewer'

// ✅ INTERFACES ESPECÍFICAS DEL MÓDULO CHAT (no duplicar las canónicas)
export interface ConversationFilter {
  status?: ConversationStatus
  channel?: ChannelType
  assignedTo?: string        // ✅ UID del agente asignado
  customerUid?: string       // ✅ NUEVO: UID del cliente
  participantUid?: string    // ✅ NUEVO: UID del participante
  tags?: string[]
  search?: string
  unreadOnly?: boolean
  dateFrom?: string          // ✅ NUEVO: Fecha desde (ISO string)
  dateTo?: string            // ✅ NUEVO: Fecha hasta (ISO string)
}

export interface TypingIndicator {
  conversationId: string
  userId: string
  userName: string
  timestamp: Date
}

export interface AIAssistant {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
}

export interface SuggestedResponse {
  id: string
  content: string
  confidence: number
  category: string
  isRelevant: boolean
}

export interface ConversationSummary {
  totalMessages: number
  avgResponseTime: string
  sentiment: 'positive' | 'neutral' | 'negative'
  topics: string[]
  lastActivity: Date
}

// Props interfaces para componentes
export interface InboxProps {
  initialConversationId?: string
}

export interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
  isLoading: boolean
  error: Error | null
  filter: ConversationFilter
  onFilterChange: (filter: ConversationFilter) => void
}

export interface ConversationItemProps {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}

export interface ChatWindowProps {
  conversationId?: string
  messages: Message[]
  isLoading: boolean
  typingUsers: TypingIndicator[]
  onSendMessage: (content: string, type: MessageType) => void
}

export interface MessageBubbleProps {
  message: Message
  showAvatar: boolean
  isGrouped: boolean
}

export interface IAPanelProps {
  conversationId?: string
  suggestions: SuggestedResponse[]
  summary?: ConversationSummary
  onSendSuggestion: (suggestion: SuggestedResponse) => void
  onAskAssistant: (question: string) => void
}

export interface InfoPanelProps {
  contact?: Contact
  conversation?: Conversation
  onUpdateContact: (contactId: string, data: Partial<Contact>) => void
  onUpdateConversation: (conversationId: string, data: Partial<Conversation>) => void
}

export interface ChannelBadgeProps {
  channel: ChannelType
  size?: 'sm' | 'md' | 'lg'
}

export interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isOnline?: boolean
  channel?: ChannelType
} 