// 🟢 CONTRATOS CENTRALIZADOS - Versión 2.0 (FINAL)

// /auth (Autenticación)
export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

// /team (Equipo/Usuarios)
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'agent' | 'viewer';
  email: string;
  status?: 'active' | 'inactive';
  performance?: Record<string, any>;
  avatar?: string;
}

// /contacts (Contactos)
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string; // Mantenido para UI
}

// /conversations (Conversaciones)
export interface Conversation {
  id: string;
  contact: {
    id: string;
    name: string;
  };
  lastMessage?: Message;
  unreadCount?: number;
  status?: 'open' | 'closed';
  assignedTo?: {
    id: string;
    name: string;
  };
  messages?: Message[];
}

// /messages (Mensajes)
export interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    name: string;
  };
  content: string;
  timestamp: string;
  media?: {
    url: string;
    type: string;
  };
  status?: 'sent' | 'pending' | 'failed' | 'delivered' | 'read' | 'error';
}

// /campaigns (Campañas)
export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'scheduled' | 'sent' | 'cancelled';
  createdAt?: string;
  messagesSent?: number;
}

// Otros tipos que se mantienen por ahora
export interface KBDocument {
  id: string;
  name: string;
  type: string;
  folder: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  description: string;
  tags: string[];
  isFavorite: boolean;
  views: number;
  version: number;
  lastModified: string;
  permissions: {
    read: string[];
    edit: string[];
    create: string[];
  };
  thumbnailUrl?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: "high" | "medium" | "low";
  linkedDocuments: string[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
  views: number;
  helpful: number;
  notHelpful: number;
  isPublished: boolean;
}

export interface DashboardMetrics {
  kpis: any;
  agentPerformance: any[];
  alerts: any[];
}

export interface Seller extends User {
  kpis?: any;
  trends?: any;
}

// Tipos de respuesta de la API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
    previousCursor?: string;
    total?: number;
    // Campos legacy
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

// Tipos para formularios
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ContactFormData {
  name: string;
  email?: string;
  phone: string;
  tags?: string[];
}

export interface MessageFormData {
  content: string;
  media?: {
    url: string;
    type: string;
  };
}

export interface CampaignFormData {
  name: string;
  status: 'active' | 'draft';
}

export interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  priority: FAQ['priority'];
} 