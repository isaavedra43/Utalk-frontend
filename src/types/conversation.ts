// Tipos basados en la estructura real de Firebase

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
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 