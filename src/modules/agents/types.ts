// Tipos específicos del módulo de agentes
// Extiende los tipos base compartidos

import { Agent, AgentStatus, AgentFilters, AgentMetrics } from '@/types/shared'

// Permisos por defecto
export const DEFAULT_PERMISSIONS = {
  canRead: true,
  canWrite: false,
  canDelete: false,
  canApprove: false,
  canConfigure: false,
  canViewAllTickets: false,
  canAssignTickets: false,
  canTransferTickets: false,
  canCloseTickets: false,
  canViewAllContacts: false,
  canEditContacts: false,
  canDeleteContacts: false,
  canExportContacts: false,
  canViewCampaigns: false,
  canCreateCampaigns: false,
  canEditCampaigns: false,
  canSendCampaigns: false,
  canViewCampaignStats: false,
  canViewReports: false,
  canCreateReports: false,
  canExportReports: false,
  canViewTeamMetrics: false,
  canViewCompanyMetrics: false,
  canManageTeam: false
}

// Tipos específicos del módulo que no están en shared
export interface AgentTeam {
  id: string
  name: string
  description?: string
  leaderId: string
  members: string[]
  createdAt: Date
  updatedAt: Date
}

export interface AgentRole {
  id: string
  name: string
  displayName: string
  permissions: string[]
  description?: string
  level: number
  color: string
  icon: string
  defaultPermissions: typeof DEFAULT_PERMISSIONS
  isCustom: boolean
  canBeDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AIAnalysis {
  id: string
  agentId: string
  analysisType: 'performance' | 'behavior' | 'efficiency'
  insights: string[]
  recommendations: string[]
  score: number
  createdAt: Date
}

export interface MetricsTimeSeries {
  timestamp: Date
  value: number
  metric: string
  period: 'hour' | 'day' | 'week' | 'month'
}

// Tipos de respuesta para API
export interface AgentsResponse {
  success: boolean
  agents: Agent[]
  total: number
  page: number
  limit: number
}

export interface AgentResponse {
  success: boolean
  agent: Agent
}

export interface AgentMetricsResponse {
  success: boolean
  metrics: AgentMetrics
  historical: MetricsTimeSeries[]
}

export interface AgentTeamsResponse {
  success: boolean
  teams: AgentTeam[]
  total: number
}

export interface AgentRolesResponse {
  success: boolean
  roles: AgentRole[]
  total: number
}

// Re-exportar tipos compartidos para compatibilidad
export type { Agent, AgentStatus, AgentFilters, AgentMetrics }
