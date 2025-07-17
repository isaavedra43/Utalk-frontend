// Tipos para la API de UTalk

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  permissions: {
    read: boolean;
    write: boolean;
    approve: boolean;
    admin: boolean;
  };
}

export interface Contact {
  id: string;
  owner: string;
  name: string;
  email: string;
  phone: string;
  status: "new-lead" | "hot-lead" | "payment" | "customer";
  lastMessage: string;
  timestamp: string;
  date: string;
  channel: "whatsapp" | "email" | "sms" | "facebook" | "instagram";
  section: string;
  isUnread: boolean;
  avatarUrl?: string;
  sentiment?: "positive" | "negative" | "neutral";
  aiScore?: number;
}

export interface Conversation {
  id: string;
  name?: string;
  phone?: string;
  customerPhone?: string;
  agentPhone?: string;
  channel?: "whatsapp" | "email" | "facebook" | "sms";
  lastMessage?: string;
  message?: string;
  timestamp?: string | any;
  lastMessageAt?: string | any;
  createdAt?: string | any;
  updatedAt?: string | any;
  isUnread?: boolean;
  avatar?: string;
  section?: string;
  lastMessageDetails?: {
    timestamp?: string | any;
    createdAt?: string | any;
    updatedAt?: string | any;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: "agent" | "client";
  timestamp: string;
  status: "sent" | "delivered" | "read" | "error";
  type: "text" | "image" | "file" | "audio";
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: "draft" | "scheduled" | "sent" | "cancelled";
  channels: ("whatsapp" | "facebook" | "sms" | "email")[];
  recipients: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
  };
  scheduledDate?: string;
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  assignees: string[];
  tags: string[];
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    errors: number;
    conversionRate: number;
    csat: number;
    incomingMessages: number;
    estimatedROI: number;
  };
}

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
  kpis: {
    totalSales: { value: number; change: number };
    totalMessages: { value: number; change: number };
    avgResponseTime: { value: string; change: number };
    satisfaction: { value: number; change: number };
  };
  agentPerformance: Array<{
    name: string;
    messages: number;
    avgResponseTime: string;
    satisfaction: number;
  }>;
  alerts: Array<{
    type: "critical" | "warning" | "info";
    message: string;
    action: string;
    color: string;
  }>;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  avatar?: string;
  permissions: {
    read: boolean;
    write: boolean;
    approve: boolean;
    admin: boolean;
  };
  kpis: {
    chatsAttended: number;
    messagesResponded: number;
    avgResponseTime: string;
    chatsClosedWithoutEscalation: number;
    conversionRate: number;
    attributableRevenue: number;
    avgTicketValue: number;
    customerRetentionRate: number;
    csatScore: number;
    npsScore: number;
    complaints?: number;
    upsellCrosssellRate?: number;
    aiQualityScore?: number;
    campaignsSent?: number;
    messageOpenRate?: number;
    linkClickRate?: number;
    positiveResponses?: number;
    continuityPercentage?: number;
    totalChatTime?: string;
    firstTimeResolution?: number;
  };
  trends?: {
    chatsVsSales: number[];
    responseTime: number[];
    channelDistribution: {
      name: string;
      value: number;
      color: string;
    }[];
  };
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  views: number;
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
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para formularios
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  status: Contact['status'];
  section: string;
}

export interface MessageFormData {
  content: string;
  type?: 'text' | 'image' | 'file' | 'audio';
  attachments?: string[]; // URLs o IDs de archivos subidos
}

export interface CampaignFormData {
  name: string;
  description: string;
  channels: Campaign['channels'];
  messageBody: string;
  scheduledDate?: string;
  tags: string[];
  assignees: string[];
}

export interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  priority: FAQ['priority'];
} 