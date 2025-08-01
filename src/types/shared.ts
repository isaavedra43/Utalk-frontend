// Tipos compartidos y unificados para toda la aplicación
// Evita duplicación entre módulos y proporciona consistencia

// ===== TIPOS BASE =====

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface BaseUser extends BaseEntity {
  firstName: string
  lastName: string
  email: string
  avatar?: string
  isActive: boolean
  lastSeen?: Date
}

// ===== USUARIO UNIFICADO =====

export interface User extends BaseUser {
  name: string // Nombre completo
  role: string
  permissions: string[]
  department?: string
  position?: string
  phone?: string
  isOnline: boolean
  lastLogin?: Date
}

// ===== CONTACTOS UNIFICADOS =====

export type ContactStatus = 'active' | 'inactive' | 'prospect' | 'customer' | 'lead'
export type ContactChannel = 'whatsapp' | 'facebook' | 'email' | 'sms' | 'web' | 'support'

export interface Contact extends BaseEntity {
  // Información básica
  firstName: string
  lastName: string
  name: string // Nombre completo calculado
  email?: string
  phone?: string

  // Información comercial
  company?: string
  position?: string
  value: number
  conversions: number

  // Estado y gestión
  status: ContactStatus
  channel: ContactChannel
  owner: string
  tags: string[]

  // Actividad
  lastInteraction: string
  lastActivity: Date

  // IA y análisis
  iaTag: string
  iaPercentage: number

  // UI
  avatar?: string
}

// ===== AGENTES UNIFICADOS =====

export type AgentStatus = 'online' | 'offline' | 'busy' | 'away'

export interface Agent extends BaseUser {
  title: string
  department: string
  role: string // Simplificado de AgentRole
  status: AgentStatus
  isOnline: boolean

  // Capacidades
  maxConcurrentTickets: number
  skills: string[]

  // Performance
  performance?: {
    totalTickets: number
    activeTickets: number
    completedTickets: number
    transferredTickets: number
    avgResponseTime: number
    satisfactionScore: number
  }
}

// ===== DOCUMENTOS DE CONOCIMIENTO =====

export type DocumentStatus = 'draft' | 'published' | 'archived'
export type DocumentType = 'article' | 'faq' | 'guide' | 'policy' | 'procedure'

export interface KnowledgeDocument extends BaseEntity {
  title: string
  content: string
  excerpt?: string
  status: DocumentStatus
  type: DocumentType
  category: string
  tags: string[]
  author: string
  lastModifiedBy: string
  viewCount: number
  isPublic: boolean
  metadata?: Record<string, any>
}

// ===== RESPUESTAS DE API =====

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ===== FILTROS COMUNES =====

export interface BaseFilters {
  search?: string
  status?: string
  startDate?: string
  endDate?: string
  tags?: string[]
  limit?: number
  offset?: number
}

export interface ContactFilters extends BaseFilters {
  owner?: string
  channel?: ContactChannel
  company?: string
  page?: number
  limit?: number
}

export interface AgentFilters extends BaseFilters {
  department?: string
  role?: string
  isOnline?: boolean
  isActive?: boolean
  lastActivityFrom?: Date
  lastActivityTo?: Date
  minCSAT?: number
  maxCSAT?: number
  minConversionRate?: number
  maxConversionRate?: number
  minRevenue?: number
  maxRevenue?: number
  page?: number
  limit?: number
}

export interface DocumentFilters extends BaseFilters {
  category?: string
  type?: DocumentType
  author?: string
  page?: number
  limit?: number
}

// ===== CRM STATS =====

export interface CRMStats {
  totalContacts: number
  newContactsThisMonth: number
  conversionRate: number
  activeClients: number
  inactiveClients: number
  avgClientValue?: number
  byStatus: Record<ContactStatus, number>
  byChannel: Record<ContactChannel, number>
}

// ===== MÉTRICAS Y ANALYTICS =====

export interface BaseMetrics {
  total: number
  active: number
  inactive: number
  growth: number
  period: string
}

export interface ContactMetrics extends BaseMetrics {
  prospects: number
  customers: number
  leads: number
  avgValue: number
  conversionRate: number
}

export interface AgentMetrics extends BaseMetrics {
  online: number
  busy: number
  away: number
  avgResponseTime: number
  avgSatisfaction: number
}

// ===== UTILIDADES =====

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}