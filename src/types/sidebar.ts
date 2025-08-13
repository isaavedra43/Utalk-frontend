// Tipos para el sidebar derecho

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  channel: 'whatsapp' | 'telegram' | 'email' | 'phone';
  lastContact?: string;
  clientSince?: string;
  whatsappId?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface ConversationDetails {
  id: string;
  status: 'open' | 'closed' | 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  unreadCount: number;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messageCount: number;
  participants: string[];
  tags: string[];
}

export interface NotificationSettings {
  conversationNotifications: boolean;
  reports: boolean;
  autoFollowUp: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

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

export interface CopilotState {
  isMockMode: boolean;
  activeTab: 'suggestions' | 'chat';
  suggestions: AISuggestion[];
  chatHistory: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  isLoading: boolean;
} 