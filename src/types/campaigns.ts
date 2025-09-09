// Tipos para el módulo de Campañas Omnicanal

export type CampaignChannel = 'email' | 'sms' | 'whatsapp' | 'multichannel';
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
export type CampaignType = 'blast' | 'journey' | 'ab_test' | 'triggered';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed' | 'unsubscribed';
export type EventType = 'delivered' | 'opened' | 'read' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed' | 'conversion';

// Interfaces principales
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  channels: CampaignChannel[];
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Configuración
  budget?: number;
  pacing: 'asap' | 'daily' | 'weekly' | 'custom';
  sendTimeOptimization: boolean;
  frequencyCapping: {
    enabled: boolean;
    maxPerDay?: number;
    maxPerWeek?: number;
    maxPerMonth?: number;
  };
  
  // Objetivos
  objectives: {
    primary: 'engagement' | 'conversion' | 'awareness' | 'retention';
    kpis: string[];
    targetValue?: number;
  };
  
  // Metadatos
  tags: string[];
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Configuración de canales
  channelConfig: {
    email?: EmailChannelConfig;
    sms?: SMSChannelConfig;
    whatsapp?: WhatsAppChannelConfig;
  };
  
  // A/B Testing
  abTest?: ABTestConfig;
  
  // Métricas
  metrics: CampaignMetrics;
}

export interface EmailChannelConfig {
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  templateId: string;
  variables: Record<string, any>;
  attachments?: string[];
  utmParams: UTMParams;
  tracking: {
    opens: boolean;
    clicks: boolean;
    unsubscribes: boolean;
  };
}

export interface SMSChannelConfig {
  message: string;
  fromNumber: string;
  templateId?: string;
  variables: Record<string, any>;
  shortLinks: boolean;
  optOutText: string;
}

export interface WhatsAppChannelConfig {
  templateName: string;
  templateLanguage: string;
  templateCategory: 'marketing' | 'utility' | 'authentication';
  variables: Record<string, any>;
  mediaUrl?: string;
  buttons?: WhatsAppButton[];
  listItems?: WhatsAppListItem[];
}

export interface WhatsAppButton {
  id: string;
  type: 'quick_reply' | 'url' | 'phone_number';
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface WhatsAppListItem {
  id: string;
  title: string;
  description?: string;
}

export interface ABTestConfig {
  enabled: boolean;
  variants: CampaignVariant[];
  trafficSplit: number[]; // Porcentajes para cada variante
  metric: 'open_rate' | 'click_rate' | 'conversion_rate' | 'revenue';
  minimumSampleSize: number;
  confidenceLevel: number;
  autoOptimize: boolean;
  winnerDeployment: boolean;
}

export interface CampaignVariant {
  id: string;
  name: string;
  weight: number;
  channelConfig: {
    email?: Partial<EmailChannelConfig>;
    sms?: Partial<SMSChannelConfig>;
    whatsapp?: Partial<WhatsAppChannelConfig>;
  };
  isControl: boolean;
}

export interface UTMParams {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

// Audiencias y Segmentación
export interface Audience {
  id: string;
  name: string;
  description?: string;
  type: 'static' | 'dynamic';
  size: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Configuración de segmentación
  segments: AudienceSegment[];
  filters: AudienceFilter[];
  
  // Metadatos
  tags: string[];
  lastSyncedAt?: Date;
}

export interface AudienceSegment {
  id: string;
  name: string;
  type: 'demographic' | 'behavioral' | 'purchase' | 'engagement' | 'custom';
  conditions: SegmentCondition[];
  logic: 'AND' | 'OR';
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: any;
  valueType: 'string' | 'number' | 'date' | 'boolean' | 'array';
}

export interface AudienceFilter {
  id: string;
  name: string;
  type: 'include' | 'exclude';
  conditions: SegmentCondition[];
  logic: 'AND' | 'OR';
}

// Plantillas
export interface Template {
  id: string;
  name: string;
  description?: string;
  channel: CampaignChannel;
  type: 'html' | 'text' | 'whatsapp_template' | 'sms_template';
  category: string;
  version: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Contenido
  content: TemplateContent;
  variables: TemplateVariable[];
  validations: TemplateValidation[];
  
  // Metadatos
  tags: string[];
  status: 'draft' | 'approved' | 'rejected' | 'archived';
}

export interface TemplateContent {
  html?: string;
  text?: string;
  subject?: string;
  preview?: string;
  assets?: TemplateAsset[];
}

export interface TemplateAsset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  size: number;
  alt?: string;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface TemplateValidation {
  type: 'spam_check' | 'link_check' | 'image_optimization' | 'accessibility' | 'deliverability';
  status: 'pass' | 'fail' | 'warning';
  message: string;
  suggestions?: string[];
}

// WhatsApp Templates específicos
export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'marketing' | 'utility' | 'authentication';
  language: string;
  status: 'pending' | 'approved' | 'rejected' | 'disabled';
  components: WhatsAppTemplateComponent[];
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'footer' | 'button';
  format?: 'text' | 'image' | 'video' | 'document';
  text?: string;
  example?: {
    header_text?: string[];
    body_text?: string[];
    footer_text?: string[];
  };
  buttons?: WhatsAppTemplateButton[];
}

export interface WhatsAppTemplateButton {
  type: 'quick_reply' | 'url' | 'phone_number';
  text: string;
  url?: string;
  phone_number?: string;
}

// Métricas y Analytics
export interface CampaignMetrics {
  // Alcance
  totalRecipients: number;
  validRecipients: number;
  invalidRecipients: number;
  optedOut: number;
  
  // Envío
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  
  // Engagement
  opened: number;
  clicked: number;
  replied: number;
  unsubscribed: number;
  
  // Conversión
  conversions: number;
  revenue: number;
  
  // Tasas
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  conversionRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  
  // Costos
  totalCost: number;
  costPerDelivery: number;
  costPerClick: number;
  costPerConversion: number;
  roi: number;
  
  // Tiempo
  avgTimeToOpen: number;
  avgTimeToClick: number;
  avgTimeToConversion: number;
  
  // Por canal
  channelMetrics: {
    email?: ChannelMetrics;
    sms?: ChannelMetrics;
    whatsapp?: ChannelMetrics;
  };
  
  // Por variante (A/B Test)
  variantMetrics?: {
    [variantId: string]: CampaignMetrics;
  };
  
  // Tendencias temporales
  hourlyData?: MetricDataPoint[];
  dailyData?: MetricDataPoint[];
}

export interface ChannelMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  failed: number;
  unsubscribed: number;
  conversions: number;
  revenue: number;
  cost: number;
}

export interface MetricDataPoint {
  timestamp: Date;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  failed: number;
  unsubscribed: number;
  conversions: number;
  revenue: number;
}

// Eventos en tiempo real
export interface CampaignEvent {
  id: string;
  campaignId: string;
  messageId: string;
  recipientId: string;
  channel: CampaignChannel;
  eventType: EventType;
  timestamp: Date;
  metadata: Record<string, any>;
  provider: string;
  cost?: number;
}

// Jobs y Colas
export interface SendJob {
  id: string;
  campaignId: string;
  batchId: string;
  channel: CampaignChannel;
  provider: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  
  // Configuración del lote
  batchSize: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  
  // Rate limiting
  rateLimit: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  
  // Reintentos
  retryConfig: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
}

// Mensajes individuales
export interface Message {
  id: string;
  campaignId: string;
  recipientId: string;
  channel: CampaignChannel;
  provider: string;
  status: MessageStatus;
  scheduledAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  bouncedAt?: Date;
  failedAt?: Date;
  unsubscribedAt?: Date;
  
  // Contenido
  subject?: string;
  content: string;
  variables: Record<string, any>;
  
  // Tracking
  trackingId: string;
  shortLinks: ShortLink[];
  
  // Costos
  cost: number;
  
  // Errores
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  
  // Metadatos
  metadata: Record<string, any>;
}

// Enlaces cortos
export interface ShortLink {
  id: string;
  slug: string;
  originalUrl: string;
  utmParams: UTMParams;
  clicks: number;
  uniqueClicks: number;
  lastClickedAt?: Date;
  fraudFlags: string[];
  createdAt: Date;
}

// Consentimiento
export interface Consent {
  id: string;
  recipientId: string;
  channel: CampaignChannel;
  status: 'opted_in' | 'opted_out' | 'pending';
  source: string;
  proof: string; // URL o hash de prueba de consentimiento
  grantedAt: Date;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, any>;
}

// Reputación
export interface Reputation {
  id: string;
  type: 'domain' | 'ip' | 'whatsapp_number' | 'sms_number';
  identifier: string;
  score: number; // 0-100
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  factors: ReputationFactor[];
  lastUpdated: Date;
  nextCheckAt: Date;
}

export interface ReputationFactor {
  name: string;
  value: number;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

// Proveedores
export interface ProviderAccount {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  provider: 'sendgrid' | 'mailgun' | 'ses' | 'postmark' | 'twilio' | 'sinch' | 'messagebird' | 'infobip' | 'meta';
  credentials: Record<string, any>;
  limits: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    requestsPerMonth: number;
  };
  regions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Webhooks
export interface WebhookLog {
  id: string;
  provider: string;
  eventType: string;
  payload: Record<string, any>;
  signature: string;
  status: 'received' | 'processed' | 'failed' | 'ignored';
  processedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
}

// Auditoría
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: 'campaign' | 'audience' | 'template' | 'provider';
  resourceId: string;
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Presupuestos
export interface Budget {
  id: string;
  campaignId: string;
  totalAmount: number;
  spentAmount: number;
  remainingAmount: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'total';
  alerts: BudgetAlert[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAlert {
  id: string;
  threshold: number; // Porcentaje
  triggered: boolean;
  triggeredAt?: Date;
  notified: boolean;
  notifiedAt?: Date;
}

// Estimaciones
export interface CampaignEstimate {
  campaignId: string;
  channel: CampaignChannel;
  audienceSize: number;
  validAudienceSize: number;
  estimatedDeliveries: number;
  estimatedOpens: number;
  estimatedClicks: number;
  estimatedReplies: number;
  estimatedConversions: number;
  estimatedRevenue: number;
  estimatedCost: number;
  confidenceLevel: number;
  confidenceInterval: {
    min: number;
    max: number;
  };
  recommendations: EstimateRecommendation[];
  generatedAt: Date;
}

export interface EstimateRecommendation {
  type: 'timing' | 'channel' | 'creative' | 'audience' | 'budget';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

// Journey Builder
export interface Journey {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  entryCriteria: JourneyEntryCriteria;
  nodes: JourneyNode[];
  connections: JourneyConnection[];
  goals: JourneyGoal[];
  metrics: JourneyMetrics;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface JourneyEntryCriteria {
  audienceId: string;
  triggerEvents: string[];
  conditions: SegmentCondition[];
  cooldownPeriod: number; // en horas
}

export interface JourneyNode {
  id: string;
  type: 'send' | 'wait' | 'condition' | 'ab_test' | 'channel_switch' | 'webhook' | 'set_attribute' | 'goal';
  name: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  conditions?: SegmentCondition[];
}

export interface JourneyConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  conditions?: SegmentCondition[];
}

export interface JourneyGoal {
  id: string;
  name: string;
  type: 'conversion' | 'engagement' | 'revenue';
  value: number;
  currency?: string;
  achieved: boolean;
  achievedAt?: Date;
}

export interface JourneyMetrics {
  totalEntered: number;
  totalCompleted: number;
  completionRate: number;
  avgTimeToComplete: number;
  totalRevenue: number;
  nodeMetrics: {
    [nodeId: string]: {
      entered: number;
      completed: number;
      completionRate: number;
      avgTimeToComplete: number;
    };
  };
}

// Copiloto de Campañas
export interface CopilotSuggestion {
  id: string;
  type: 'content' | 'timing' | 'audience' | 'channel' | 'budget' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: {
    metric: string;
    expectedImprovement: number;
    confidence: number;
  };
  implementation: {
    steps: string[];
    estimatedTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  createdAt: Date;
  appliedAt?: Date;
  appliedBy?: string;
}

// Configuración del sistema
export interface CampaignSettings {
  id: string;
  organizationId: string;
  compliance: ComplianceSettings;
  deliverability: DeliverabilitySettings;
  analytics: AnalyticsSettings;
  integrations: IntegrationSettings;
  updatedAt: Date;
  updatedBy: string;
}

export interface ComplianceSettings {
  gdprEnabled: boolean;
  ccpaEnabled: boolean;
  lfpdpppEnabled: boolean;
  optInRequired: boolean;
  doubleOptIn: boolean;
  unsubscribeRequired: boolean;
  dataRetentionDays: number;
  auditLogRetentionDays: number;
}

export interface DeliverabilitySettings {
  domainWarmupEnabled: boolean;
  ipWarmupEnabled: boolean;
  reputationMonitoring: boolean;
  bounceHandling: 'hard' | 'soft' | 'both';
  suppressionListManagement: boolean;
  feedbackLoopProcessing: boolean;
}

export interface AnalyticsSettings {
  realTimeTracking: boolean;
  attributionModel: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  cohortAnalysis: boolean;
  incrementalityTesting: boolean;
  dataExportFormats: string[];
  dataRetentionDays: number;
}

export interface IntegrationSettings {
  cdpConnections: string[];
  crmConnections: string[];
  analyticsConnections: string[];
  webhookEndpoints: string[];
  ssoProvider?: string;
  customFields: Record<string, any>;
}
