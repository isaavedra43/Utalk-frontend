// 👥 TIPOS CANÓNICOS - Módulo de Agentes y Performance UTalk
// Sistema completo de gestión de equipos y métricas avanzadas

import type { CanonicalUser } from '@/types/canonical'

/**
 * 🎯 AGENTE CANÓNICO
 */
export interface Agent {
  // ✅ IDENTIFICACIÓN
  id: string
  email: string
  firstName: string
  lastName: string
  fullName?: string
  
  // ✅ PERFIL PROFESIONAL
  role: AgentRole
  department: string
  title: string
  avatar?: string
  phoneNumber?: string
  extension?: string
  
  // ✅ ESTADO Y ACTIVIDAD
  status: AgentStatus
  isActive: boolean
  isOnline: boolean
  lastActivity: Date
  lastLogin?: Date
  
  // ✅ PERMISOS Y ACCESOS
  permissions: AgentPermissions
  accessLevel: AccessLevel
  supervisorId?: string
  teamIds: string[]
  
  // ✅ CONFIGURACIÓN DE CANALES
  enabledChannels: Channel[]
  channelSettings: Record<Channel, ChannelSettings>
  
  // ✅ MÉTRICAS DE PERFORMANCE
  currentMetrics: AgentMetrics
  weeklyGoals?: AgentGoals
  monthlyGoals?: AgentGoals
  
  // ✅ METADATOS
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
  
  // ✅ CONFIGURACIÓN PERSONAL
  workingHours: WorkingHours
  timezone: string
  language: string
  
  // ✅ HISTÓRICO DE CAMBIOS
  changeHistory?: AgentChange[]
  
  // ✅ DATOS ADICIONALES
  metadata?: {
    hireDate?: Date
    birthday?: Date
    skills?: string[]
    certifications?: string[]
    notes?: string
    location?: string
    emergencyContact?: string
  }
}

/**
 * 🎯 ROLES DE AGENTE
 */
export interface AgentRole {
  id: string
  name: string
  displayName: string
  description: string
  level: number
  color: string
  icon: string
  defaultPermissions: AgentPermissions
  isCustom: boolean
  canBeDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * 🎯 ESTADOS DE AGENTE
 */
export type AgentStatus = 
  | 'active'           // Activo y trabajando
  | 'inactive'         // Inactivo temporalmente
  | 'busy'             // Ocupado, no disponible
  | 'break'            // En descanso
  | 'training'         // En capacitación
  | 'meeting'          // En reunión
  | 'offline'          // Desconectado
  | 'suspended'        // Suspendido

/**
 * 🎯 PERMISOS DE AGENTE
 */
export interface AgentPermissions {
  // ✅ ACCESOS BÁSICOS
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
  canApprove: boolean
  canConfigure: boolean
  
  // ✅ GESTIÓN DE CONVERSACIONES
  canViewAllChats: boolean
  canAssignChats: boolean
  canTransferChats: boolean
  canCloseChats: boolean
  canViewChatHistory: boolean
  
  // ✅ GESTIÓN DE CONTACTOS
  canViewAllContacts: boolean
  canEditContacts: boolean
  canDeleteContacts: boolean
  canExportContacts: boolean
  canImportContacts: boolean
  
  // ✅ CAMPAÑAS
  canViewCampaigns: boolean
  canCreateCampaigns: boolean
  canEditCampaigns: boolean
  canSendCampaigns: boolean
  canViewCampaignStats: boolean
  
  // ✅ REPORTES Y ANALÍTICA
  canViewReports: boolean
  canCreateReports: boolean
  canExportReports: boolean
  canViewTeamMetrics: boolean
  canViewCompanyMetrics: boolean
  
  // ✅ CONFIGURACIÓN
  canManageTeam: boolean
  canManageIntegrations: boolean
  canManageSettings: boolean
  canManageBilling: boolean
  canManageUsers: boolean
  
  // ✅ CARACTERÍSTICAS ESPECIALES
  canUseAI: boolean
  canAccessAPI: boolean
  canViewAuditLogs: boolean
  canManageTemplates: boolean
  canManageAutomations: boolean
}

/**
 * 🎯 NIVELES DE ACCESO
 */
export type AccessLevel = 
  | 'basic'            // Acceso básico
  | 'intermediate'     // Acceso intermedio
  | 'advanced'         // Acceso avanzado
  | 'admin'            // Administrador
  | 'owner'            // Propietario

/**
 * 🎯 CANALES DE COMUNICACIÓN
 */
export type Channel = 
  | 'whatsapp'
  | 'sms'
  | 'email'
  | 'webchat'
  | 'facebook'
  | 'instagram'
  | 'telegram'
  | 'phone'

/**
 * 🎯 CONFIGURACIÓN DE CANAL
 */
export interface ChannelSettings {
  isEnabled: boolean
  maxConcurrentChats: number
  autoAssign: boolean
  priority: number
  workingHours?: WorkingHours
  autoResponses?: {
    greeting?: string
    away?: string
    closed?: string
  }
}

/**
 * 🎯 HORARIOS DE TRABAJO
 */
export interface WorkingHours {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  isWorkingDay: boolean
  startTime: string    // "09:00"
  endTime: string      // "18:00"
  breakStart?: string  // "12:00"
  breakEnd?: string    // "13:00"
}

/**
 * 🎯 MÉTRICAS DE AGENTE
 */
export interface AgentMetrics {
  // ✅ MÉTRICAS DE CONVERSACIONES
  totalChats: number
  activeChats: number
  completedChats: number
  transferredChats: number
  avgResponseTime: number          // En segundos
  avgResolutionTime: number        // En segundos
  firstResponseTime: number        // En segundos
  
  // ✅ MÉTRICAS DE VENTAS
  totalSales: number
  totalRevenue: number
  avgTicketSize: number
  conversionRate: number           // Porcentaje
  upsellRate: number              // Porcentaje
  crossSellRate: number           // Porcentaje
  
  // ✅ MÉTRICAS DE CALIDAD
  csat: number                    // Customer Satisfaction (1-5)
  nps: number                     // Net Promoter Score (-100 a 100)
  qualityScore: number            // Puntuación de calidad (0-100)
  resolutionRate: number          // Porcentaje de chats resueltos
  escalationRate: number          // Porcentaje de escalaciones
  
  // ✅ MÉTRICAS DE ACTIVIDAD
  totalMessages: number
  messagesPerChat: number
  onlineHours: number
  utilization: number             // Porcentaje de utilización
  availability: number            // Porcentaje de disponibilidad
  
  // ✅ MÉTRICAS DE CAMPAÑAS
  campaignsSent: number
  openRate: number                // Porcentaje
  clickRate: number               // Porcentaje
  responseRate: number            // Porcentaje
  unsubscribeRate: number         // Porcentaje
  
  // ✅ MÉTRICAS DE RETENCIÓN
  customerRetention: number       // Porcentaje
  repeatCustomers: number
  referrals: number
  
  // ✅ FECHAS DE CÁLCULO
  periodStart: Date
  periodEnd: Date
  lastUpdated: Date
}

/**
 * 🎯 OBJETIVOS DEL AGENTE
 */
export interface AgentGoals {
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  
  // ✅ OBJETIVOS DE CONVERSACIONES
  targetChats?: number
  targetResponseTime?: number      // En segundos
  targetResolutionRate?: number    // Porcentaje
  
  // ✅ OBJETIVOS DE VENTAS
  targetRevenue?: number
  targetSales?: number
  targetConversionRate?: number    // Porcentaje
  
  // ✅ OBJETIVOS DE CALIDAD
  targetCSAT?: number             // 1-5
  targetNPS?: number              // -100 a 100
  targetQualityScore?: number     // 0-100
  
  // ✅ PROGRESO ACTUAL
  progress: Record<string, {
    current: number
    target: number
    percentage: number
    status: 'on-track' | 'behind' | 'ahead' | 'achieved'
  }>
  
  // ✅ METADATOS
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

/**
 * 🎯 CAMBIO DE AGENTE (AUDITORÍA)
 */
export interface AgentChange {
  id: string
  agentId: string
  changeType: 'created' | 'updated' | 'deleted' | 'status_changed' | 'permissions_changed'
  field?: string
  oldValue?: any
  newValue?: any
  reason?: string
  changedBy: string
  changedAt: Date
  ipAddress?: string
  userAgent?: string
}

/**
 * 🎯 EQUIPO DE AGENTES
 */
export interface AgentTeam {
  id: string
  name: string
  description: string
  supervisorId: string
  memberIds: string[]
  
  // ✅ CONFIGURACIÓN
  department: string
  location?: string
  timezone: string
  
  // ✅ MÉTRICAS AGREGADAS
  teamMetrics: TeamMetrics
  
  // ✅ METADATOS
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

/**
 * 🎯 MÉTRICAS DE EQUIPO
 */
export interface TeamMetrics {
  totalAgents: number
  activeAgents: number
  onlineAgents: number
  
  // ✅ MÉTRICAS AGREGADAS
  totalChats: number
  avgResponseTime: number
  avgCSAT: number
  totalRevenue: number
  avgConversionRate: number
  
  // ✅ DISTRIBUCIÓN DE CARGA
  workloadDistribution: Record<string, number>
  performanceRanking: AgentRanking[]
  
  // ✅ COMPARACIÓN TEMPORAL
  vsLastPeriod: {
    chatsChange: number
    revenueChange: number
    csatChange: number
    responseTimeChange: number
  }
}

/**
 * 🎯 RANKING DE AGENTE
 */
export interface AgentRanking {
  agentId: string
  rank: number
  score: number
  category: 'sales' | 'quality' | 'efficiency' | 'overall'
  badge?: 'top-performer' | 'most-improved' | 'consistent' | 'rising-star'
}

/**
 * 🎯 FILTROS DE AGENTES
 */
export interface AgentFilters {
  // ✅ BÚSQUEDA
  search?: string
  
  // ✅ FILTROS BÁSICOS
  status?: AgentStatus[]
  roles?: string[]
  departments?: string[]
  teams?: string[]
  accessLevels?: AccessLevel[]
  
  // ✅ FILTROS DE ACTIVIDAD
  isOnline?: boolean
  isActive?: boolean
  lastActivityFrom?: Date
  lastActivityTo?: Date
  
  // ✅ FILTROS DE PERFORMANCE
  minCSAT?: number
  maxCSAT?: number
  minConversionRate?: number
  maxConversionRate?: number
  minRevenue?: number
  maxRevenue?: number
  
  // ✅ FILTROS DE CANALES
  enabledChannels?: Channel[]
  
  // ✅ ORDENAMIENTO
  sortBy?: 'name' | 'email' | 'role' | 'department' | 'lastActivity' | 'csat' | 'revenue' | 'conversionRate'
  sortOrder?: 'asc' | 'desc'
  
  // ✅ PAGINACIÓN
  page?: number
  limit?: number
}

/**
 * 🎯 CONFIGURACIÓN DEL MÓDULO
 */
export interface AgentsModuleConfig {
  // ✅ LÍMITES
  maxAgentsPerTeam: number
  maxTeamsPerSupervisor: number
  maxConcurrentChats: number
  
  // ✅ MÉTRICAS
  defaultMetricsPeriod: 'day' | 'week' | 'month' | 'quarter'
  enableRealTimeMetrics: boolean
  metricsUpdateInterval: number    // En segundos
  
  // ✅ NOTIFICACIONES
  enablePerformanceAlerts: boolean
  csatThreshold: number
  responseTimeThreshold: number    // En segundos
  
  // ✅ GAMIFICACIÓN
  enableRankings: boolean
  enableBadges: boolean
  enableGoals: boolean
  
  // ✅ INTEGRACIÓN
  enableFirebaseSync: boolean
  enableAuditLogs: boolean
  enableWebSocketUpdates: boolean
  
  // ✅ UI/UX
  defaultView: 'list' | 'grid' | 'cards'
  enableDarkMode: boolean
  enableAnimations: boolean
  autoRefreshInterval: number      // En segundos
}

/**
 * 🎯 RESPUESTAS DE API
 */
export interface AgentsResponse {
  success: boolean
  agents: Agent[]
  total: number
  page: number
  limit: number
  error?: string
}

export interface AgentResponse {
  success: boolean
  agent?: Agent
  error?: string
}

export interface AgentMetricsResponse {
  success: boolean
  metrics?: AgentMetrics
  historical?: MetricsTimeSeries[]
  error?: string
}

export interface AgentTeamsResponse {
  success: boolean
  teams: AgentTeam[]
  total: number
  error?: string
}

export interface AgentRolesResponse {
  success: boolean
  roles: AgentRole[]
  error?: string
}

/**
 * 🎯 SERIES TEMPORALES DE MÉTRICAS
 */
export interface MetricsTimeSeries {
  date: Date
  metrics: Partial<AgentMetrics>
}

/**
 * 🎯 ANÁLISIS DE IA
 */
export interface AIAnalysis {
  agentId: string
  analysisType: 'performance' | 'quality' | 'efficiency' | 'growth'
  
  // ✅ INSIGHTS
  insights: AIInsight[]
  recommendations: AIRecommendation[]
  
  // ✅ PUNTUACIONES
  overallScore: number             // 0-100
  improvementPotential: number     // 0-100
  
  // ✅ COMPARACIÓN
  peerComparison: {
    rank: number
    percentile: number
    topPerformers: string[]
  }
  
  // ✅ METADATOS
  generatedAt: Date
  confidence: number               // 0-1
  dataPoints: number
}

export interface AIInsight {
  id: string
  type: 'strength' | 'weakness' | 'opportunity' | 'trend'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  category: string
  metrics: string[]
  confidence: number
}

export interface AIRecommendation {
  id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  actionItems: string[]
  estimatedImpact: string
  timeToImplement: string
  category: 'training' | 'process' | 'tools' | 'goals'
}

/**
 * 🎯 EVENTOS DE AGENTE
 */
export interface AgentEvent {
  id: string
  agentId: string
  type: AgentEventType
  data: Record<string, any>
  timestamp: Date
  source: 'system' | 'user' | 'api' | 'integration'
}

export type AgentEventType = 
  | 'agent_created'
  | 'agent_updated'
  | 'agent_deleted'
  | 'status_changed'
  | 'login'
  | 'logout'
  | 'chat_started'
  | 'chat_ended'
  | 'chat_transferred'
  | 'message_sent'
  | 'goal_achieved'
  | 'metric_threshold_reached'
  | 'permission_changed'
  | 'team_assigned'
  | 'training_completed'

// ✅ CONSTANTES ÚTILES
export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  busy: 'Ocupado',
  break: 'En Descanso',
  training: 'Capacitación',
  meeting: 'Reunión',
  offline: 'Desconectado',
  suspended: 'Suspendido'
}

export const AGENT_STATUS_COLORS: Record<AgentStatus, string> = {
  active: '#10B981',
  inactive: '#6B7280',
  busy: '#F59E0B',
  break: '#8B5CF6',
  training: '#3B82F6',
  meeting: '#EC4899',
  offline: '#9CA3AF',
  suspended: '#EF4444'
}

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  basic: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  admin: 'Administrador',
  owner: 'Propietario'
}

export const CHANNEL_LABELS: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  email: 'Email',
  webchat: 'Chat Web',
  facebook: 'Facebook',
  instagram: 'Instagram',
  telegram: 'Telegram',
  phone: 'Teléfono'
}

export const CHANNEL_ICONS: Record<Channel, string> = {
  whatsapp: '💬',
  sms: '📱',
  email: '📧',
  webchat: '💬',
  facebook: '📘',
  instagram: '📷',
  telegram: '✈️',
  phone: '📞'
}

export const DEFAULT_PERMISSIONS: AgentPermissions = {
  canRead: true,
  canWrite: false,
  canDelete: false,
  canApprove: false,
  canConfigure: false,
  canViewAllChats: false,
  canAssignChats: false,
  canTransferChats: false,
  canCloseChats: true,
  canViewChatHistory: true,
  canViewAllContacts: false,
  canEditContacts: false,
  canDeleteContacts: false,
  canExportContacts: false,
  canImportContacts: false,
  canViewCampaigns: true,
  canCreateCampaigns: false,
  canEditCampaigns: false,
  canSendCampaigns: false,
  canViewCampaignStats: false,
  canViewReports: true,
  canCreateReports: false,
  canExportReports: false,
  canViewTeamMetrics: false,
  canViewCompanyMetrics: false,
  canManageTeam: false,
  canManageIntegrations: false,
  canManageSettings: false,
  canManageBilling: false,
  canManageUsers: false,
  canUseAI: true,
  canAccessAPI: false,
  canViewAuditLogs: false,
  canManageTemplates: false,
  canManageAutomations: false
} 