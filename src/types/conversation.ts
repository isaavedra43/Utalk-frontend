// Tipos basados en la estructura real de Firebase

// Tipo específico para el contacto en conversaciones
export interface ConversationContact {
  name: string;
  phoneNumber: string;
}

export interface Conversation {
  id: string; // conv_+5214773790184_+5214793176502
  customerPhone: string; // "+5214773790184"
  contact: ConversationContact;
  lastMessage?: LastMessage;
  lastMessageAt: string; // "11 de agosto de 2025, 4:21:25 p.m. UTC-6"
  unreadCount: number; // 5
  status: 'open' | 'closed' | 'pending' | 'resolved';
  assignedTo?: string; // "admin@company.com"
  participants: string[]; // ["+5214773790184", "system@utalk.local", "admin@company.com", ...]
  createdAt: string; // "8 de agosto de 2025, 6:33:49 p.m. UTC-6"
  updatedAt: string; // "11 de agosto de 2025, 4:21:25 p.m. UTC-6"
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[]; // ["VIP", "Premium", "Order"]
  
  // Campos legacy para compatibilidad
  customerName?: string; // Deprecated: usar contact.name
  messageCount?: number; // 22
  tenantId?: string; // "default_tenant"
  workspaceId?: string; // "default_workspace"
  assignedToName?: string | null; // "PS Pedro Sánchez"
  createdBy?: string; // "admin@company.com"
  messages?: Message[]; // Subcolección de mensajes
  metadata?: Record<string, unknown>; // Metadatos adicionales
}

export interface LastMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker';
  timestamp: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

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

export interface ConversationFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 