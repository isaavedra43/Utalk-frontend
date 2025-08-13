// Tipos de usuario
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'agent' | 'viewer';
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

// Tipos de conversación
export interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  subject?: string;
  status: 'open' | 'closed' | 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  tags: string[];
  unreadCount: number;
  lastMessage?: Message;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// Tipos de mensaje
export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location' | 'sticker';
  direction: 'inbound' | 'outbound';
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, unknown>;
  replyToMessageId?: string;
}

// Tipos de contacto
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  avatar?: string;
  tags: string[];
  status: 'active' | 'inactive';
  lastContact?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// Tipos de sugerencia de IA
export interface AISuggestion {
  id: string;
  conversationId: string;
  content: string;
  confidence: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  createdAt: Date;
}

// Tipos de estado de la aplicación
export interface AppState {
  user: User | null;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  contacts: Contact[];
  loading: boolean;
  error: string | null;
}

// Tipos de filtros
export interface ConversationFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  tags?: string[];
}

// Tipos de respuesta de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos de eventos de Socket.IO
export interface SocketEvents {
  'new-message': (data: { message: Message }) => void;
  'typing': (data: { conversationId: string; userId: string }) => void;
  'typing-stop': (data: { conversationId: string; userId: string }) => void;
  'user-online': (data: { userId: string }) => void;
  'user-offline': (data: { userId: string }) => void;
  'conversation-event': (data: Partial<Conversation>) => void;
  'message-read': (data: { conversationId: string; messageIds: string[] }) => void;
} 