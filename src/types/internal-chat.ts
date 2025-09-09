// Tipos para el módulo de chat interno UTalk

export interface InternalChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'public' | 'private';
  members: string[];
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings: ChannelSettings;
}

export interface ChannelSettings {
  approvers: string[];
  autoForwardRules: AutoForwardRule[];
  sla: {
    enabled: boolean;
    duration: number; // en minutos
    escalationUsers: string[];
  };
  templates: RequestTemplate[];
}

export interface AutoForwardRule {
  id: string;
  condition: string;
  targetChannel: string;
  enabled: boolean;
}

export interface RequestTemplate {
  id: string;
  name: string;
  type: 'pago' | 'pedido' | 'factura' | 'gasto' | 'envio' | 'rh' | 'legal' | 'proveedor' | 'marketing' | 'manufactura' | 'mantenimiento';
  fields: TemplateField[];
  approvalFlow: ApprovalStep[];
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'file' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ApprovalStep {
  id: string;
  name: string;
  approvers: string[];
  type: 'sequential' | 'parallel';
  sla?: number; // en minutos
}

export interface InternalMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'approval_request' | 'approval_response' | 'system';
  timestamp: Date;
  metadata?: MessageMetadata;
  approvalData?: ApprovalData;
  status: 'sent' | 'delivered' | 'read';
}

export interface MessageMetadata {
  attachments?: Attachment[];
  mentions?: string[];
  reactions?: Reaction[];
  threadId?: string;
  replyTo?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  size: number;
  thumbnail?: string;
}

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface ApprovalData {
  id: string;
  type: string;
  fields: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approverName?: string;
  approvedAt?: Date;
  notes?: string;
  attachments?: Attachment[];
}

export interface ApprovalCard {
  id: string;
  messageId: string;
  type: 'pago' | 'pedido' | 'factura' | 'gasto' | 'envio' | 'rh' | 'legal' | 'proveedor' | 'marketing' | 'manufactura' | 'mantenimiento';
  title: string;
  subtitle: string;
  amount?: string;
  currency?: string;
  company?: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approverName?: string;
  approvedAt?: Date;
  createdAt: Date;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  attachments?: Attachment[];
  canApprove: boolean;
  canReject: boolean;
}

export interface DirectMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  isOnline: boolean;
  status: 'online' | 'offline' | 'away';
}

export interface CanvasView {
  type: 'table' | 'kanban' | 'gallery';
  data: any[];
  filters: CanvasFilter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface CanvasFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
}

export interface RightPanelTab {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  badge?: number;
}

export interface CopilotMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  suggestions?: string[];
}

export interface InternalUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  role: 'admin' | 'manager' | 'employee';
  permissions: string[];
}

// Estados del store
export interface InternalChatState {
  channels: InternalChannel[];
  activeChannel: InternalChannel | null;
  messages: Record<string, InternalMessage[]>;
  directMessages: DirectMessage[];
  users: InternalUser[];
  currentUser: InternalUser | null;
  rightPanelTab: string;
  canvasView: CanvasView | null;
  copilotMessages: CopilotMessage[];
  loading: boolean;
  error: string | null;
}

// Acciones del store
export interface InternalChatActions {
  setActiveChannel: (channelId: string) => void;
  sendMessage: (channelId: string, content: string, type?: string, metadata?: MessageMetadata) => void;
  approveRequest: (messageId: string, approvalId: string, notes?: string) => void;
  rejectRequest: (messageId: string, approvalId: string, notes?: string) => void;
  setRightPanelTab: (tabId: string) => void;
  setCanvasView: (view: CanvasView) => void;
  addCopilotMessage: (message: CopilotMessage) => void;
  markAsRead: (channelId: string, messageIds: string[]) => void;
  createChannel: (channel: Omit<InternalChannel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChannel: (channelId: string, updates: Partial<InternalChannel>) => void;
  deleteChannel: (channelId: string) => void;
}
