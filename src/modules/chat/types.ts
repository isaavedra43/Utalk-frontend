// Tipos para el módulo de Chat/Inbox de UTalk
// Define todas las interfaces y enums necesarios para mensajería

export type ChannelType = 'whatsapp' | 'facebook' | 'email' | 'web' | 'instagram' | 'telegram'

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'sticker'

export type ConversationStatus = 'open' | 'closed' | 'pending' | 'assigned'

export type UserRole = 'admin' | 'agent' | 'viewer'

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  channel: ChannelType
  tags: string[]
  isOnline: boolean
  lastSeen?: Date
  customFields?: Record<string, any>
}

export interface Message {
  id: string
  conversationId: string
  content: string
  type: MessageType
  timestamp: Date
  sender: {
    id: string
    name: string
    type: 'contact' | 'agent' | 'bot'
    avatar?: string
  }
  attachments?: {
    id: string
    name: string
    url: string
    type: string
    size: number
  }[]
  isRead: boolean
  isDelivered: boolean
  metadata?: Record<string, any>
}

export interface Conversation {
  id: string
  contact: Contact
  channel: ChannelType
  status: ConversationStatus
  assignedTo?: {
    id: string
    name: string
    avatar?: string
  }
  lastMessage?: Message
  unreadCount: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
  priority: 'low' | 'medium' | 'high'
  isMuted: boolean
}

export interface ConversationFilter {
  status?: ConversationStatus
  channel?: ChannelType
  assignedTo?: string
  tags?: string[]
  search?: string
  unreadOnly?: boolean
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

export interface SidebarProps {
  onFilterChange: (filter: ConversationFilter) => void
  currentFilter: ConversationFilter
}

export interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
  isLoading: boolean
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