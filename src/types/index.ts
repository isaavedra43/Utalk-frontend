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

// Tipos de conversación (basados en Firebase)
export interface Conversation {
  id: string; // conv_+5214773790184_+5214793176502
  customerName: string; // "Isra"
  customerPhone: string; // "+5214773790184"
  status: 'open' | 'closed' | 'pending';
  messageCount: number; // 22
  unreadCount: number; // 5
  participants: string[]; // ["+5214773790184", "system@utalk.local", "admin@company.com", ...]
  tenantId: string; // "default_tenant"
  workspaceId: string; // "default_workspace"
  createdAt: string; // "8 de agosto de 2025, 6:33:49 p.m. UTC-6"
  updatedAt: string; // "11 de agosto de 2025, 4:21:25 p.m. UTC-6"
  lastMessageAt: string; // "11 de agosto de 2025, 4:21:25 p.m. UTC-6"
  lastMessage?: LastMessage;
  assignedTo?: string; // "admin@company.com"
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[]; // ["VIP", "Premium", "Order"]
}

export interface LastMessage {
  content: string; // "PRUEBA 9"
  direction: 'inbound' | 'outbound';
  messageId: string; // "e9f6edd0-d771-4829-89f0-16393b53eed3"
  sender: string; // "agent:admin@company.com"
  timestamp: string; // "11 de agosto de 2025, 4:21:25 p.m. UTC-6"
}

// Tipos de mensaje (basados en Firebase)
export interface Message {
  id: string; // "b23da669-896f-4030-8a11-6583b232e96e"
  conversationId: string; // "conv_+5214773790184_+5214"
  content: string; // "prueba 2"
  direction: 'inbound' | 'outbound';
  createdAt: string; // "11 de agosto de 2025, 12:58:20 p.m. UTC-6"
  metadata: MessageMetadata;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  type: 'text' | 'image' | 'document' | 'location';
  recipientIdentifier?: string; // "whatsapp:+5214773790"
  senderIdentifier?: string; // "agent:admin@company.com"
  userAgent?: string;
  updatedAt: string; // "11 de agosto de 2025, 12:58:20 p.m. UTC-6"
}

export interface MessageMetadata {
  agentId: string; // "admin@company.com"
  ip: string; // "189.162.163.251"
  requestId: string; // "unknown"
  sentBy: string; // "admin@company.com"
  source: 'web' | 'mobile' | 'api';
  timestamp: string; // "2025-08-11T18:58:20.111Z"
}

export interface MessageGroup {
  date: string;
  messages: Message[];
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface MessageInputData {
  content: string;
  type?: 'text' | 'image' | 'document' | 'location';
  replyToMessageId?: string;
  metadata?: Record<string, unknown>;
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
  title: string;
  content: string;
  confidence: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  actions: {
    copy: boolean;
    improve: boolean;
    use: boolean;
  };
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

// Re-exportar tipos de sidebar
export * from './sidebar';