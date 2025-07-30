// 🛠️ SERVICIO DE AGENTES - UTalk Frontend
// Gestión completa de agentes con Firebase y backend integration

import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import type { 
  Agent,
  AgentFilters,
  AgentTeam,
  AgentRole,
  AgentsResponse,
  AgentResponse,
  AgentMetricsResponse,
  AgentTeamsResponse,
  AgentRolesResponse,
  AgentStatus,
  AgentPermissions,
  AIAnalysis,
  MetricsTimeSeries
} from '../types'

// ✅ CONTEXTO PARA LOGGING
const agentsServiceContext = getComponentContext('agentsService')

/**
 * 🎯 SERVICIO PRINCIPAL DE AGENTES
 */
class AgentsService {
  
  /**
   * ✅ OBTENER AGENTES
   */
  async getAgents(filters: AgentFilters = {}): Promise<AgentsResponse> {
    try {
      console.log('🔍 AgentsService.getAgents called:', filters)
      
      // Construir query string desde filtros
      const queryParams = new URLSearchParams()
      
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder)
      if (filters.search) queryParams.append('search', filters.search)
      
      if (filters.status?.length) {
        filters.status.forEach(status => queryParams.append('status', status))
      }
      
      if (filters.roles?.length) {
        filters.roles.forEach(role => queryParams.append('roles', role))
      }
      
      if (filters.departments?.length) {
        filters.departments.forEach(dept => queryParams.append('departments', dept))
      }
      
      if (filters.teams?.length) {
        filters.teams.forEach(team => queryParams.append('teams', team))
      }
      
      if (filters.accessLevels?.length) {
        filters.accessLevels.forEach(level => queryParams.append('accessLevels', level))
      }
      
      if (filters.enabledChannels?.length) {
        filters.enabledChannels.forEach(channel => queryParams.append('channels', channel))
      }
      
      if (filters.isOnline !== undefined) queryParams.append('isOnline', filters.isOnline.toString())
      if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString())
      if (filters.lastActivityFrom) queryParams.append('lastActivityFrom', filters.lastActivityFrom.toISOString())
      if (filters.lastActivityTo) queryParams.append('lastActivityTo', filters.lastActivityTo.toISOString())
      
      if (filters.minCSAT) queryParams.append('minCSAT', filters.minCSAT.toString())
      if (filters.maxCSAT) queryParams.append('maxCSAT', filters.maxCSAT.toString())
      if (filters.minConversionRate) queryParams.append('minConversionRate', filters.minConversionRate.toString())
      if (filters.maxConversionRate) queryParams.append('maxConversionRate', filters.maxConversionRate.toString())
      if (filters.minRevenue) queryParams.append('minRevenue', filters.minRevenue.toString())
      if (filters.maxRevenue) queryParams.append('maxRevenue', filters.maxRevenue.toString())
      
      const url = `/agents?${queryParams.toString()}`
      console.log('📡 Making API call to:', url)
      
      const response = await apiClient.get(url)
      console.log('📥 Raw agents response:', response)
      
      return {
        success: true,
        agents: response.data || response.agents || [],
        total: response.total || 0,
        page: response.page || filters.page || 1,
        limit: response.limit || filters.limit || 20
      }
      
    } catch (error) {
      console.error('❌ AgentsService.getAgents error:', error)
      return {
        success: false,
        agents: [],
        total: 0,
        page: filters.page || 1,
        limit: filters.limit || 20,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
  
  /**
   * ✅ OBTENER AGENTE INDIVIDUAL
   */
  async getAgent(agentId: string): Promise<AgentResponse> {
    try {
      console.log('🔍 AgentsService.getAgent called:', agentId)
      
      const response = await apiClient.get(`/agents/${agentId}`)
      console.log('📥 Agent response:', response)
      
      return {
        success: true,
        agent: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.getAgent error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
  
  /**
   * ✅ CREAR AGENTE
   */
  async createAgent(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentResponse> {
    try {
      console.log('🔍 AgentsService.createAgent called:', agentData)
      
      const response = await apiClient.post('/agents', agentData)
      console.log('📥 Create agent response:', response)
      
      return {
        success: true,
        agent: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.createAgent error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear agente'
      }
    }
  }
  
  /**
   * ✅ ACTUALIZAR AGENTE
   */
  async updateAgent(agentId: string, updates: Partial<Agent>): Promise<AgentResponse> {
    try {
      console.log('🔍 AgentsService.updateAgent called:', { agentId, updates })
      
      const response = await apiClient.put(`/agents/${agentId}`, updates)
      console.log('📥 Update agent response:', response)
      
      return {
        success: true,
        agent: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.updateAgent error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar agente'
      }
    }
  }
  
  /**
   * ✅ ELIMINAR AGENTE
   */
  async deleteAgent(agentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 AgentsService.deleteAgent called:', agentId)
      
      await apiClient.delete(`/agents/${agentId}`)
      console.log('✅ Agent deleted successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ AgentsService.deleteAgent error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar agente'
      }
    }
  }
  
  /**
   * ✅ ACTUALIZAR ESTADO DE AGENTE
   */
  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<AgentResponse> {
    try {
      console.log('🔍 AgentsService.updateAgentStatus called:', { agentId, status })
      
      const response = await apiClient.patch(`/agents/${agentId}/status`, { status })
      console.log('📥 Update status response:', response)
      
      return {
        success: true,
        agent: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.updateAgentStatus error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar estado'
      }
    }
  }
  
  /**
   * ✅ ACTUALIZAR PERMISOS DE AGENTE
   */
  async updateAgentPermissions(agentId: string, permissions: AgentPermissions): Promise<AgentResponse> {
    try {
      console.log('🔍 AgentsService.updateAgentPermissions called:', { agentId, permissions })
      
      const response = await apiClient.patch(`/agents/${agentId}/permissions`, { permissions })
      console.log('📥 Update permissions response:', response)
      
      return {
        success: true,
        agent: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.updateAgentPermissions error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar permisos'
      }
    }
  }
  
  /**
   * ✅ OBTENER MÉTRICAS DE AGENTE
   */
  async getAgentMetrics(agentId: string, period: 'day' | 'week' | 'month' = 'week'): Promise<AgentMetricsResponse> {
    try {
      console.log('🔍 AgentsService.getAgentMetrics called:', { agentId, period })
      
      const response = await apiClient.get(`/agents/${agentId}/metrics?period=${period}`)
      console.log('📥 Agent metrics response:', response)
      
      return {
        success: true,
        metrics: response.data?.metrics || response.metrics,
        historical: response.data?.historical || response.historical || []
      }
      
    } catch (error) {
      console.error('❌ AgentsService.getAgentMetrics error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener métricas'
      }
    }
  }
  
  /**
   * ✅ OBTENER ESTADÍSTICAS GLOBALES
   */
  async getAgentStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      console.log('🔍 AgentsService.getAgentStats called')
      
      const response = await apiClient.get('/agents/stats')
      console.log('📥 Agent stats response:', response)
      
      return {
        success: true,
        stats: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.getAgentStats error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
      }
    }
  }
  
  /**
   * ✅ OBTENER EQUIPOS
   */
  async getTeams(): Promise<AgentTeamsResponse> {
    try {
      console.log('🔍 AgentsService.getTeams called')
      
      const response = await apiClient.get('/agents/teams')
      console.log('📥 Teams response:', response)
      
      return {
        success: true,
        teams: response.data || response.teams || [],
        total: response.total || 0
      }
      
    } catch (error) {
      console.error('❌ AgentsService.getTeams error:', error)
      return {
        success: false,
        teams: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Error al obtener equipos'
      }
    }
  }
  
  /**
   * ✅ CREAR EQUIPO
   */
  async createTeam(teamData: Omit<AgentTeam, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; team?: AgentTeam; error?: string }> {
    try {
      console.log('🔍 AgentsService.createTeam called:', teamData)
      
      const response = await apiClient.post('/agents/teams', teamData)
      console.log('📥 Create team response:', response)
      
      return {
        success: true,
        team: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.createTeam error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear equipo'
      }
    }
  }
  
  /**
   * ✅ ACTUALIZAR EQUIPO
   */
  async updateTeam(teamId: string, updates: Partial<AgentTeam>): Promise<{ success: boolean; team?: AgentTeam; error?: string }> {
    try {
      console.log('🔍 AgentsService.updateTeam called:', { teamId, updates })
      
      const response = await apiClient.put(`/agents/teams/${teamId}`, updates)
      console.log('📥 Update team response:', response)
      
      return {
        success: true,
        team: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.updateTeam error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar equipo'
      }
    }
  }
  
  /**
   * ✅ OBTENER ROLES
   */
  async getRoles(): Promise<AgentRolesResponse> {
    try {
      console.log('🔍 AgentsService.getRoles called')
      
      const response = await apiClient.get('/agents/roles')
      console.log('📥 Roles response:', response)
      
      return {
        success: true,
        roles: response.data || response.roles || []
      }
      
    } catch (error) {
      console.error('❌ AgentsService.getRoles error:', error)
      return {
        success: false,
        roles: [],
        error: error instanceof Error ? error.message : 'Error al obtener roles'
      }
    }
  }
  
  /**
   * ✅ CREAR ROL
   */
  async createRole(roleData: Omit<AgentRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; role?: AgentRole; error?: string }> {
    try {
      console.log('🔍 AgentsService.createRole called:', roleData)
      
      const response = await apiClient.post('/agents/roles', roleData)
      console.log('📥 Create role response:', response)
      
      return {
        success: true,
        role: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.createRole error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear rol'
      }
    }
  }
  
  /**
   * ✅ ACTUALIZAR ROL
   */
  async updateRole(roleId: string, updates: Partial<AgentRole>): Promise<{ success: boolean; role?: AgentRole; error?: string }> {
    try {
      console.log('🔍 AgentsService.updateRole called:', { roleId, updates })
      
      const response = await apiClient.put(`/agents/roles/${roleId}`, updates)
      console.log('📥 Update role response:', response)
      
      return {
        success: true,
        role: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.updateRole error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar rol'
      }
    }
  }
  
  /**
   * ✅ OBTENER ANÁLISIS DE IA
   */
  async getAIAnalysis(agentId: string): Promise<{ success: boolean; analysis?: AIAnalysis; error?: string }> {
    try {
      console.log('🔍 AgentsService.getAIAnalysis called:', agentId)
      
      const response = await apiClient.get(`/agents/${agentId}/ai-analysis`)
      console.log('📥 AI analysis response:', response)
      
      return {
        success: true,
        analysis: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.getAIAnalysis error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener análisis de IA'
      }
    }
  }
  
  /**
   * ✅ GENERAR ANÁLISIS DE IA
   */
  async generateAIAnalysis(agentId: string): Promise<{ success: boolean; analysis?: AIAnalysis; error?: string }> {
    try {
      console.log('🔍 AgentsService.generateAIAnalysis called:', agentId)
      
      const response = await apiClient.post(`/agents/${agentId}/ai-analysis/generate`)
      console.log('📥 Generate AI analysis response:', response)
      
      return {
        success: true,
        analysis: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.generateAIAnalysis error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar análisis de IA'
      }
    }
  }
  
  /**
   * ✅ COMPARAR AGENTES
   */
  async compareAgents(agentIds: string[]): Promise<{ success: boolean; comparison?: any; error?: string }> {
    try {
      console.log('🔍 AgentsService.compareAgents called:', agentIds)
      
      const response = await apiClient.post('/agents/compare', { agentIds })
      console.log('📥 Compare agents response:', response)
      
      return {
        success: true,
        comparison: response.data || response
      }
      
    } catch (error) {
      console.error('❌ AgentsService.compareAgents error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al comparar agentes'
      }
    }
  }
  
  /**
   * ✅ EXPORTAR DATOS
   */
  async exportAgents(format: 'csv' | 'excel' | 'json', filters?: AgentFilters): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      console.log('🔍 AgentsService.exportAgents called:', { format, filters })
      
      const queryParams = new URLSearchParams()
      queryParams.append('format', format)
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v.toString()))
            } else {
              queryParams.append(key, value.toString())
            }
          }
        })
      }
      
      const response = await apiClient.post(`/agents/export?${queryParams.toString()}`)
      console.log('📥 Export response:', response)
      
      return {
        success: true,
        url: response.data?.downloadUrl || response.downloadUrl
      }
      
    } catch (error) {
      console.error('❌ AgentsService.exportAgents error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al exportar datos'
      }
    }
  }
  
  /**
   * ✅ CONECTAR WEBSOCKET PARA TIEMPO REAL
   */
  connectRealTime(agentId?: string): WebSocket {
    const wsUrl = process.env.VITE_WS_URL || 'ws://localhost:8080'
    const url = agentId 
      ? `${wsUrl}/agents/${agentId}/realtime`
      : `${wsUrl}/agents/realtime`
    
    console.log('🔗 Connecting to WebSocket:', url)
    
    return new WebSocket(url)
  }
  
  /**
   * ✅ BÚSQUEDA AVANZADA
   */
  async searchAgents(query: string, filters?: Partial<AgentFilters>): Promise<AgentsResponse> {
    try {
      console.log('🔍 AgentsService.searchAgents called:', { query, filters })
      
      const searchFilters: AgentFilters = {
        ...filters,
        search: query,
        page: 1,
        limit: 50
      }
      
      return this.getAgents(searchFilters)
      
    } catch (error) {
      console.error('❌ AgentsService.searchAgents error:', error)
      return {
        success: false,
        agents: [],
        total: 0,
        page: 1,
        limit: 50,
        error: error instanceof Error ? error.message : 'Error en búsqueda'
      }
    }
  }
  
  /**
   * ✅ OBTENER MÉTRICAS HISTÓRICAS
   */
  async getHistoricalMetrics(
    agentId: string, 
    startDate: Date, 
    endDate: Date,
    granularity: 'hour' | 'day' | 'week' = 'day'
  ): Promise<{ success: boolean; historical?: MetricsTimeSeries[]; error?: string }> {
    try {
      console.log('🔍 AgentsService.getHistoricalMetrics called:', { agentId, startDate, endDate, granularity })
      
      const queryParams = new URLSearchParams()
      queryParams.append('startDate', startDate.toISOString())
      queryParams.append('endDate', endDate.toISOString())
      queryParams.append('granularity', granularity)
      
      const response = await apiClient.get(`/agents/${agentId}/metrics/historical?${queryParams.toString()}`)
      console.log('📥 Historical metrics response:', response)
      
      return {
        success: true,
        historical: response.data || response.historical || []
      }
      
    } catch (error) {
      console.error('❌ AgentsService.getHistoricalMetrics error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener métricas históricas'
      }
    }
  }
  
  /**
   * ✅ ASIGNAR AGENTE A EQUIPO
   */
  async assignToTeam(agentId: string, teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 AgentsService.assignToTeam called:', { agentId, teamId })
      
      await apiClient.post(`/agents/${agentId}/teams/${teamId}`)
      console.log('✅ Agent assigned to team successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ AgentsService.assignToTeam error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al asignar agente a equipo'
      }
    }
  }
  
  /**
   * ✅ REMOVER AGENTE DE EQUIPO
   */
  async removeFromTeam(agentId: string, teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 AgentsService.removeFromTeam called:', { agentId, teamId })
      
      await apiClient.delete(`/agents/${agentId}/teams/${teamId}`)
      console.log('✅ Agent removed from team successfully')
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ AgentsService.removeFromTeam error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al remover agente de equipo'
      }
    }
  }

  // ✅ MÉTODO PATCH PARA AGENTS
  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const context = createLogContext({
      ...agentsServiceContext,
      method: 'PATCH',
      data: { url, dataSize: data ? JSON.stringify(data).length : 0 }
    })

    logger.info('API', `📡 PATCH request to ${url}`, context)

    try {
      const response = await apiClient.put<T>(url, data, config)
      return response
    } catch (error) {
      logger.apiError(`💥 PATCH request failed: ${url}`, createLogContext({
        ...context,
        error: error as Error
      }))
      throw error
    }
  }
}

// ✅ INSTANCIA SINGLETON
export const agentsService = new AgentsService()
export default agentsService 