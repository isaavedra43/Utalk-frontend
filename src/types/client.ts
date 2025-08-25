// Tipos para el módulo de clientes (Customer Hub)

// Estados del cliente
export type ClientStatus = 'won' | 'lost' | 'pending' | 'active' | 'inactive' | 'prospect';

// Etapas del pipeline de ventas
export type ClientStage = 'lead' | 'prospect' | 'demo' | 'propuesta' | 'negociacion' | 'ganado' | 'perdido';

// Tipos de actividad del cliente
export type ActivityType = 'whatsapp' | 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'follow_up';

// Tipos de fuente del cliente
export type ClientSource = 'facebook' | 'linkedin' | 'website' | 'referral' | 'cold_call' | 'event' | 'advertising';

// Tipos de segmento del cliente
export type ClientSegment = 'startup' | 'sme' | 'enterprise' | 'freelancer' | 'agency';

// Tipos de etiquetas
export type ClientTag = 'VIP' | 'Empresa' | 'Startup' | 'Premium' | 'Hot Lead' | 'Cold Lead';

// Interfaz principal del cliente
export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  avatar?: string;
  initials: string;
  
  // Información comercial
  status: ClientStatus;
  stage: ClientStage;
  score: number; // 0-100
  winRate: number; // 0-100
  expectedValue: number;
  probability: number; // 0-100
  
  // Metadatos
  source: ClientSource;
  segment: ClientSegment;
  tags: ClientTag[];
  
  // Fechas
  createdAt: Date;
  updatedAt: Date;
  lastContact?: Date;
  nextContact?: Date;
  
  // Asignación
  assignedTo?: string;
  assignedToName?: string;
  
  // Información adicional
  description?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// Interfaz para actividades del cliente
export interface ClientActivity {
  id: string;
  clientId: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  duration?: number; // en minutos
  agentId?: string;
  agentName?: string;
  
  // Metadatos específicos por tipo
  metadata?: {
    messageContent?: string;
    callNotes?: string;
    meetingNotes?: string;
    demoFeedback?: string;
    proposalDetails?: string;
  };
}

// Interfaz para deals/oportunidades del cliente
export interface ClientDeal {
  id: string;
  clientId: string;
  title: string;
  description?: string;
  value: number;
  probability: number; // 0-100
  stage: ClientStage;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  
  // Información del deal
  currency: string;
  dealType: 'new_business' | 'upsell' | 'renewal' | 'expansion';
  
  // Métricas
  winProbability: number;
  daysInStage: number;
  
  // Asignación
  assignedTo?: string;
  assignedToName?: string;
  
  // Fechas
  createdAt: Date;
  updatedAt: Date;
  
  // Metadatos
  tags?: string[];
  notes?: string;
  metadata?: Record<string, unknown>;
}

// Interfaz para filtros de búsqueda
export interface ClientFilters {
  // Búsqueda de texto
  search?: string;
  
  // Filtros por etapa
  stages?: ClientStage[];
  
  // Filtros por agente
  agents?: string[];
  
  // Filtros por score de IA
  aiScoreMin?: number;
  aiScoreMax?: number;
  
  // Filtros por valor
  valueMin?: number;
  valueMax?: number;
  
  // Filtros por probabilidad
  probabilityMin?: number;
  probabilityMax?: number;
  
  // Filtros por estado
  statuses?: ClientStatus[];
  
  // Filtros por etiquetas
  tags?: ClientTag[];
  
  // Filtros por fuente
  sources?: ClientSource[];
  
  // Filtros por segmento
  segments?: ClientSegment[];
  
  // Filtros por fecha
  createdAfter?: Date;
  createdBefore?: Date;
  lastContactAfter?: Date;
  lastContactBefore?: Date;
  
  // Ordenamiento
  sortBy?: 'name' | 'company' | 'value' | 'probability' | 'score' | 'createdAt' | 'lastContact';
  sortOrder?: 'asc' | 'desc';
  
  // Paginación
  page?: number;
  limit?: number;
}

// Interfaz para métricas del dashboard
export interface ClientMetrics {
  // Métricas generales
  totalClients: number;
  totalValue: number;
  totalOpportunities: number;
  
  // Métricas por etapa
  stageMetrics: {
    [key in ClientStage]: {
      count: number;
      value: number;
      averageProbability: number;
    };
  };
  
  // Métricas de contacto
  contactsToContactToday: number;
  averageDaysToClose: number;
  
  // Métricas de rendimiento
  winRate: number;
  projectedRevenue: number;
  
  // Métricas por agente
  agentMetrics: {
    [agentId: string]: {
      name: string;
      clientsCount: number;
      totalValue: number;
      winRate: number;
      averageScore: number;
    };
  };
  
  // Métricas por fuente
  sourceMetrics: {
    [source in ClientSource]: {
      count: number;
      value: number;
      conversionRate: number;
    };
  };
  
  // Métricas por segmento
  segmentMetrics: {
    [segment in ClientSegment]: {
      count: number;
      value: number;
      averageValue: number;
    };
  };
  
  // Métricas de win rate
  winRateMetrics: {
    overall: number;
    byStage: {
      [key in ClientStage]: number;
    };
    byAgent: {
      [agentId: string]: number;
    };
    trend: {
      current: number;
      previous: number;
      change: number;
    };
  };
  
  // Métricas de contacto
  contactMetrics: {
    totalContacts: number;
    contactsToday: number;
    averageResponseTime: number;
    contactSuccessRate: number;
    byType: {
      email: number;
      call: number;
      whatsapp: number;
      meeting: number;
    };
  };
  
  // Tendencias
  trends: {
    newClientsThisMonth: number;
    newClientsLastMonth: number;
    valueGrowth: number;
    winRateChange: number;
  };
}

// Interfaz para recomendaciones de IA
export interface ClientAIRecommendation {
  id: string;
  clientId: string;
  type: 'next_action' | 'upsell_opportunity' | 'risk_alert' | 'success_story';
  title: string;
  description: string;
  confidence: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Acciones sugeridas
  suggestedActions: {
    id: string;
    title: string;
    description: string;
    type: 'email' | 'call' | 'meeting' | 'demo' | 'proposal' | 'follow_up';
  }[];
  
  // Metadatos
  reasoning?: string;
  dataPoints?: string[];
  createdAt: Date;
}

// Interfaz para información de contacto
export interface ClientContactInfo {
  email: string;
  phone?: string;
  whatsapp?: string;
  linkedin?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

// Interfaz para detalles comerciales
export interface ClientCommercialDetails {
  expectedValue: number;
  probability: number;
  source: ClientSource;
  segment: ClientSegment;
  industry?: string;
  companySize?: string;
  annualRevenue?: number;
  decisionMaker?: string;
  budget?: number;
  timeline?: string;
}

// Interfaz para el estado del módulo de clientes
export interface ClientState {
  clients: Client[];
  selectedClient: Client | null;
  filters: ClientFilters;
  metrics: ClientMetrics | null;
  activities: Record<string, ClientActivity[]>;
  deals: Record<string, ClientDeal[]>;
  recommendations: Record<string, ClientAIRecommendation[]>;
  
  // Estados de carga
  loading: boolean;
  loadingMetrics: boolean;
  loadingActivities: boolean;
  loadingDeals: boolean;
  
  // Estados de error
  error: string | null;
  metricsError: string | null;
  
  // Estados de UI
  showFilters: boolean;
  showDetailPanel: boolean;
  currentView: 'list' | 'kanban' | 'cards';
  currentTab: 'perfil' | 'actividad' | 'deals' | 'ia';
  
  // Paginación
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para eventos de WebSocket
export interface ClientSocketEvents {
  'client-updated': (data: { client: Client }) => void;
  'client-created': (data: { client: Client }) => void;
  'client-deleted': (data: { clientId: string }) => void;
  'activity-added': (data: { activity: ClientActivity }) => void;
  'deal-updated': (data: { deal: ClientDeal }) => void;
  'metrics-updated': (data: { metrics: ClientMetrics }) => void;
  'ai-recommendation': (data: { recommendation: ClientAIRecommendation }) => void;
}

// Tipos para respuestas de API
export interface ClientApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ClientPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para exportación
export interface ClientExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  filters?: ClientFilters;
  includeActivities?: boolean;
  includeDeals?: boolean;
  includeMetrics?: boolean;
}

// Tipos para notificaciones
export interface ClientNotification {
  id: string;
  type: 'client_update' | 'activity_reminder' | 'deal_alert' | 'ai_insight';
  title: string;
  message: string;
  clientId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: Date;
} 