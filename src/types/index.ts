// Tipos globales principales de TypeScript
// Interfaces y tipos compartidos en toda la aplicación

// Usuario y autenticación
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: UserRole
  isActive: boolean
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}

// ✅ NUEVO: Interface para la respuesta de login del backend UTalk
export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    role: 'admin' | 'agent' | 'viewer'
    status: 'active' | 'inactive'
    createdAt: string
    lastLoginAt?: string
  }
  token: string
}

export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Contactos y CRM
export interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  position?: string
  tags: string[]
  status: ContactStatus
  notes?: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

export type ContactStatus = 'new' | 'qualified' | 'contacted' | 'converted' | 'lost'

// Campañas
export interface Campaign {
  id: string
  name: string
  description?: string
  status: CampaignStatus
  templateId: string
  segmentId: string
  totalRecipients: number
  sentCount: number
  openCount: number
  clickCount: number
  scheduledAt?: Date
  sentAt?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'

// Equipo
export interface TeamMember {
  id: string
  user: User
  role: UserRole
  permissions: Permission[]
  performance: TeamPerformance
  joinedAt: Date
}

export interface Permission {
  id: string
  name: string
  resource: string
  actions: string[]
}

export interface TeamPerformance {
  responseTime: number
  satisfactionScore: number
  tasksCompleted: number
  contactsManaged: number
  period: 'day' | 'week' | 'month'
}

// Knowledge Base
export interface Article {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  isPublished: boolean
  views: number
  authorId: string
  createdAt: Date
  updatedAt: Date
}

// API y respuestas
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  timestamp: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// UI y formularios
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FilterOptions {
  search?: string
  status?: string
  dateFrom?: Date
  dateTo?: Date
  tags?: string[]
  assignedTo?: string
}

// Configuración
export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'es' | 'en'
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  inApp: boolean
  sound: boolean
}

export interface PrivacySettings {
  showOnlineStatus: boolean
  shareAnalytics: boolean
}