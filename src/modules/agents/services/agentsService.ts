// 🎯 SERVICIO DE AGENTES IA
// Manejo de operaciones CRUD y métricas para agentes

import { apiClient } from '@/services/apiClient'
import { logger, createLogContext } from '@/lib/logger'
import type {
  Agent,
  AgentFilters,
  AIAnalysis,
  AgentsResponse,
  AgentResponse,
  AgentMetricsResponse,
  AgentTeamsResponse,
  AgentRolesResponse
} from '../types'

const agentsServiceContext = createLogContext({ component: 'agentsService' })

/**
 * 🎯 SERVICIO DE AGENTES
 */
class AgentsService {
  private baseUrl = '/api/agents'

  /**
   * 📋 Obtener lista de agentes con filtros
   */
  async getAgents(filters: AgentFilters = {}): Promise<AgentsResponse> {
    try {
      const queryParams = new URLSearchParams()

      // Aplicar filtros
      if (filters.search) {queryParams.append('search', filters.search)}
      if (filters.department) {queryParams.append('department', filters.department)}
      if (filters.role) {queryParams.append('role', filters.role)}
      if (filters.isOnline !== undefined) {queryParams.append('isOnline', filters.isOnline.toString())}
      if (filters.isActive !== undefined) {queryParams.append('isActive', filters.isActive.toString())}
      if (filters.lastActivityFrom) {queryParams.append('lastActivityFrom', filters.lastActivityFrom.toISOString())}
      if (filters.lastActivityTo) {queryParams.append('lastActivityTo', filters.lastActivityTo.toISOString())}
      if (filters.minCSAT) {queryParams.append('minCSAT', filters.minCSAT.toString())}
      if (filters.maxCSAT) {queryParams.append('maxCSAT', filters.maxCSAT.toString())}
      if (filters.minConversionRate) {queryParams.append('minConversionRate', filters.minConversionRate.toString())}
      if (filters.maxConversionRate) {queryParams.append('maxConversionRate', filters.maxConversionRate.toString())}
      if (filters.minRevenue) {queryParams.append('minRevenue', filters.minRevenue.toString())}
      if (filters.maxRevenue) {queryParams.append('maxRevenue', filters.maxRevenue.toString())}

      // Manejar arrays de status
      if (Array.isArray(filters.status)) {
        filters.status.forEach(status => queryParams.append('status', status))
      } else if (filters.status) {
        queryParams.append('status', filters.status)
      }

      const response = await apiClient.get<AgentsResponse>(`${this.baseUrl}?${queryParams.toString()}`)

      return {
        success: response.data.success,
        agents: response.data.agents || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 20
      }
    } catch (error) {
      logger.error('MODULE', 'Error al obtener agentes', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error desconocido',
        filters
      }))

      return {
        success: false,
        agents: [],
        total: 0,
        page: 1,
        limit: 20
      }
    }
  }

  /**
   * 📋 Obtener agente por ID
   */
  async getAgent(id: string): Promise<AgentResponse> {
    try {
      const response = await apiClient.get<AgentResponse>(`${this.baseUrl}/${id}`)

      return {
        success: response.data.success,
        agent: response.data.agent
      }
    } catch (error) {
      logger.error('MODULE', 'Error al obtener agente', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error desconocido',
        agentId: id
      }))

      return {
        success: false,
        agent: null
      }
    }
  }

  /**
   * ➕ Crear nuevo agente
   */
  async createAgent(agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentResponse> {
    try {
      const response = await apiClient.post<AgentResponse>(this.baseUrl, agentData)

      return {
        success: response.data.success,
        agent: response.data.agent
      }
    } catch (error) {
      logger.error('MODULE', 'Error al crear agente', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al crear agente',
        agentData
      }))

      return {
        success: false,
        agent: null
      }
    }
  }

  /**
   * ✏️ Actualizar agente existente
   */
  async updateAgent(id: string, agentData: Partial<Agent>): Promise<AgentResponse> {
    try {
      const response = await apiClient.patch<AgentResponse>(`${this.baseUrl}/${id}`, agentData)

      return {
        success: response.data.success,
        agent: response.data.agent
      }
    } catch (error) {
      logger.error('MODULE', 'Error al actualizar agente', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al actualizar agente',
        agentId: id,
        agentData
      }))

      return {
        success: false,
        agent: null
      }
    }
  }

  /**
   * 🗑️ Eliminar agente
   */
  async deleteAgent(id: string): Promise<AgentResponse> {
    try {
      const response = await apiClient.delete<AgentResponse>(`${this.baseUrl}/${id}`)

      return {
        success: response.data.success,
        agent: response.data.agent
      }
    } catch (error) {
      logger.error('MODULE', 'Error al eliminar agente', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al eliminar agente',
        agentId: id
      }))

      return {
        success: false,
        agent: null
      }
    }
  }

  /**
   * 🔄 Actualizar estado del agente
   */
  async updateAgentStatus(id: string, status: string): Promise<AgentResponse> {
    try {
      const response = await apiClient.patch<AgentResponse>(`${this.baseUrl}/${id}/status`, { status })

      return {
        success: response.data.success,
        agent: response.data.agent
      }
    } catch (error) {
      logger.error('MODULE', 'Error al actualizar estado', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al actualizar estado',
        agentId: id,
        status
      }))

      return {
        success: false,
        agent: null
      }
    }
  }

  /**
   * 🔐 Actualizar permisos del agente
   */
  async updateAgentPermissions(id: string, permissions: string[]): Promise<AgentResponse> {
    try {
      const response = await apiClient.patch<AgentResponse>(`${this.baseUrl}/${id}/permissions`, { permissions })

      return {
        success: response.data.success,
        agent: response.data.agent
      }
    } catch (error) {
      logger.error('MODULE', 'Error al actualizar permisos', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al actualizar permisos',
        agentId: id,
        permissions
      }))

      return {
        success: false,
        agent: null
      }
    }
  }

  /**
   * 📊 Obtener métricas de agentes
   */
  async getAgentMetrics(agentId?: string, period: string = 'week'): Promise<AgentMetricsResponse> {
    try {
      const url = agentId ? `${this.baseUrl}/${agentId}/metrics` : `${this.baseUrl}/metrics`
      const response = await apiClient.get<AgentMetricsResponse>(`${url}?period=${period}`)

      return {
        success: response.data.success,
        metrics: response.data.metrics,
        historical: response.data.historical || []
      }
    } catch (error) {
      logger.error('MODULE', 'Error al obtener métricas', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al obtener métricas',
        agentId,
        period
      }))

      return {
        success: false,
        metrics: null,
        historical: []
      }
    }
  }

  /**
   * 👥 Obtener equipos de agentes
   */
  async getAgentTeams(): Promise<AgentTeamsResponse> {
    try {
      const response = await apiClient.get<AgentTeamsResponse>(`${this.baseUrl}/teams`)

      return {
        success: response.data.success,
        teams: response.data.teams || [],
        total: response.data.total || 0
      }
    } catch (error) {
      logger.error('MODULE', 'Error al obtener equipos', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al obtener equipos'
      }))

      return {
        success: false,
        teams: [],
        total: 0
      }
    }
  }

  /**
   * 🎭 Obtener roles de agentes
   */
  async getAgentRoles(): Promise<AgentRolesResponse> {
    try {
      const response = await apiClient.get<AgentRolesResponse>(`${this.baseUrl}/roles`)

      return {
        success: response.data.success,
        roles: response.data.roles || [],
        total: response.data.total || 0
      }
    } catch (error) {
      logger.error('MODULE', 'Error al obtener roles', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al obtener roles'
      }))

      return {
        success: false,
        roles: [],
        total: 0
      }
    }
  }

  /**
   * 🔍 Buscar agentes
   */
  async searchAgents(query: string, filters: AgentFilters = {}): Promise<AgentsResponse> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('q', query)

      // Aplicar filtros adicionales
      if (filters.department) {queryParams.append('department', filters.department)}
      if (filters.role) {queryParams.append('role', filters.role)}
      if (filters.isOnline !== undefined) {queryParams.append('isOnline', filters.isOnline.toString())}

      const response = await apiClient.get<AgentsResponse>(`${this.baseUrl}/search?${queryParams.toString()}`)

      return {
        success: response.data.success,
        agents: response.data.agents || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 20
      }
    } catch (error) {
      logger.error('MODULE', 'Error en búsqueda', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error en búsqueda',
        query,
        filters
      }))

      return {
        success: false,
        agents: [],
        total: 0,
        page: 1,
        limit: 20
      }
    }
  }

  /**
   * 📈 Obtener análisis histórico
   */
  async getHistoricalData(agentId?: string, period: string = 'month'): Promise<any[]> {
    try {
      const url = agentId ? `${this.baseUrl}/${agentId}/history` : `${this.baseUrl}/history`
      const response = await apiClient.get(`${url}?period=${period}`)

      return response.data || []
    } catch (error) {
      logger.error('MODULE', 'Error al obtener histórico', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al obtener histórico',
        agentId,
        period
      }))

      return []
    }
  }

  /**
   * 📊 Obtener estadísticas generales
   */
  async getAgentStats(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`)
      return response.data
    } catch (error) {
      logger.error('MODULE', 'Error al obtener estadísticas', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
      }))

      return null
    }
  }

  /**
   * 📥 Exportar datos de agentes
   */
  async exportAgents(format: 'csv' | 'xlsx' = 'csv', filters: AgentFilters = {}): Promise<string> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('format', format)

      // Aplicar filtros para exportación
      if (filters.department) {queryParams.append('department', filters.department)}
      if (filters.role) {queryParams.append('role', filters.role)}
      if (filters.isOnline !== undefined) {queryParams.append('isOnline', filters.isOnline.toString())}

      const response = await apiClient.get(`${this.baseUrl}/export?${queryParams.toString()}`)

      return response.data.url
    } catch (error) {
      logger.error('MODULE', 'Error al exportar agentes', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al exportar agentes',
        format,
        filters
      }))

      throw error
    }
  }

  /**
   * 🔄 Actualizar estado en lote
   */
  async updateAgentsStatus(agentIds: string[], status: string): Promise<AgentResponse[]> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/batch/status`, {
        agentIds,
        status
      })

      return response.data.results || []
    } catch (error) {
      logger.error('MODULE', 'Error al actualizar estados en lote', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al actualizar estados en lote',
        agentIds,
        status
      }))

      return []
    }
  }

  /**
   * 🎯 Asignar agentes a equipos
   */
  async assignAgentsToTeam(agentIds: string[], teamId: string): Promise<AgentResponse[]> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/batch/assign-team`, {
        agentIds,
        teamId
      })

      return response.data.results || []
    } catch (error) {
      logger.error('MODULE', 'Error al asignar agentes a equipo', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al asignar agentes a equipo',
        agentIds,
        teamId
      }))

      return []
    }
  }

  /**
   * 🔐 Asignar roles en lote
   */
  async assignAgentsRole(agentIds: string[], roleId: string): Promise<AgentResponse[]> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/batch/assign-role`, {
        agentIds,
        roleId
      })

      return response.data.results || []
    } catch (error) {
      logger.error('MODULE', 'Error al asignar roles en lote', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al asignar roles en lote',
        agentIds,
        roleId
      }))

      return []
    }
  }

  /**
   * 📊 Obtener análisis de IA
   */
  async getAIAnalysis(agentId: string): Promise<AIAnalysis[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${agentId}/ai-analysis`)
      return response.data.analyses || []
    } catch (error) {
      logger.error('MODULE', 'Error al obtener análisis de IA', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al obtener análisis de IA',
        agentId
      }))

      return []
    }
  }

  /**
   * 🔄 Sincronizar datos de agentes
   */
  async syncAgentData(): Promise<boolean> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/sync`)
      return response.data.success
    } catch (error) {
      logger.error('MODULE', 'Error al sincronizar datos', createLogContext({
        ...agentsServiceContext,
        error: error instanceof Error ? error.message : 'Error al sincronizar datos'
      }))

      return false
    }
  }
}

export const agentsService = new AgentsService()
