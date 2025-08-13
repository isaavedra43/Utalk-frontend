/**
 * Servicio de Equipo & Performance - UTalk
 * Interfaces de API, mocks de datos y manejo de errores para el módulo
 */

import type {
  Agent,
  AgentPermissions,
  AIAction,
  AIActionResult,
  CoachingData,
  InsightData,
  TeamFilters,
  TeamStats
} from '$lib/types/team';
import { logApi, logError } from '$lib/utils/logger';
import { api } from './axios';

// ============================================================================
// INTERFACES DE API
// ============================================================================

export interface GetAgentsResponse {
  agents: Agent[];
  stats: TeamStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface GetAgentResponse {
  agent: Agent;
  insights: InsightData[];
  coaching: CoachingData;
}

export interface UpdateAgentRequest {
  name?: string;
  email?: string;
  role?: string;
  status?: 'active' | 'inactive';
  permissions?: Partial<AgentPermissions>;
}

export interface UpdatePermissionsRequest {
  permissions: Partial<AgentPermissions>;
}

export interface ExecuteAIActionRequest {
  agentId: string;
  actionType: AIAction['type'];
  parameters?: Record<string, unknown>;
}

export interface ExecuteAIActionResponse {
  action: AIAction;
  result: AIActionResult;
}

// ============================================================================
// ENDPOINTS DE API
// ============================================================================

const TEAM_ENDPOINTS = {
  agents: '/api/team/agents',
  agent: (id: string) => `/api/team/agents/${id}`,
  permissions: (id: string) => `/api/team/agents/${id}/permissions`,
  aiAction: '/api/team/ai-actions',
  stats: '/api/team/stats',
  insights: (id: string) => `/api/team/agents/${id}/insights`,
  coaching: (id: string) => `/api/team/agents/${id}/coaching`
} as const;

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

export const teamService = {
  // ===== GESTIÓN DE AGENTES =====

  /**
   * Obtener lista de agentes con filtros
   */
  async getAgents(
    filters: TeamFilters = { search: '', status: 'all' }
  ): Promise<GetAgentsResponse> {
    try {
      logApi('team: getAgents', { filters });

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      if (filters.performance) params.append('performance', filters.performance);
      if (filters.lastActivity) params.append('lastActivity', filters.lastActivity);

      const response = await api.get(`${TEAM_ENDPOINTS.agents}?${params.toString()}`);

      logApi('team: getAgents success', {
        count: response.data.agents.length,
        stats: response.data.stats
      });

      return response.data;
    } catch (error: unknown) {
      logError('team: getAgents error', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  /**
   * Obtener agente específico con detalles completos
   */
  async getAgent(agentId: string): Promise<GetAgentResponse> {
    try {
      logApi('team: getAgent', { agentId });

      const response = await api.get(TEAM_ENDPOINTS.agent(agentId));

      logApi('team: getAgent success', {
        agentId,
        hasInsights: response.data.insights.length > 0,
        hasCoaching: !!response.data.coaching
      });

      return response.data;
    } catch (error: unknown) {
      logError('team: getAgent error', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  /**
   * Crear nuevo agente
   */
  async createAgent(agentData: Omit<Agent, 'id' | 'lastActivity'>): Promise<Agent> {
    try {
      logApi('team: createAgent', { name: agentData.name, role: agentData.role });

      const response = await api.post(TEAM_ENDPOINTS.agents, agentData);

      logApi('team: createAgent success', {
        agentId: response.data.id,
        name: response.data.name
      });

      return response.data;
    } catch (error: unknown) {
      logError('team: createAgent error', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  /**
   * Actualizar agente
   */
  async updateAgent(agentId: string, updates: UpdateAgentRequest): Promise<Agent> {
    try {
      logApi('team: updateAgent', { agentId, updates });

      const response = await api.patch(TEAM_ENDPOINTS.agent(agentId), updates);

      logApi('team: updateAgent success', {
        agentId,
        updatedFields: Object.keys(updates)
      });

      return response.data;
    } catch (error: unknown) {
      logError('team: updateAgent error', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  /**
   * Eliminar agente
   */
  async deleteAgent(agentId: string): Promise<void> {
    try {
      logApi('team: deleteAgent', { agentId });

      await api.delete(TEAM_ENDPOINTS.agent(agentId));

      logApi('team: deleteAgent success', { agentId });
    } catch (error: unknown) {
      logError('team: deleteAgent error', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  // ===== PERMISOS =====

  /**
   * Actualizar permisos de un agente
   */
  async updatePermissions(
    agentId: string,
    permissions: UpdatePermissionsRequest
  ): Promise<AgentPermissions> {
    try {
      logApi('team: updatePermissions', { agentId, permissions });

      const response = await api.patch(TEAM_ENDPOINTS.permissions(agentId), permissions);

      logApi('team: updatePermissions success', {
        agentId,
        updatedPermissions: Object.keys(permissions.permissions)
      });

      return response.data;
    } catch (error: unknown) {
      logError(
        'team: updatePermissions error',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  },

  // ===== ACCIONES IA =====

  /**
   * Ejecutar acción IA
   */
  async executeAIAction(request: ExecuteAIActionRequest): Promise<ExecuteAIActionResponse> {
    try {
      logApi('team: executeAIAction', {
        agentId: request.agentId,
        actionType: request.actionType,
        parameters: request.parameters
      });

      const response = await api.post(TEAM_ENDPOINTS.aiAction, request);

      logApi('team: executeAIAction success', {
        agentId: request.agentId,
        actionType: request.actionType,
        success: response.data.result.success
      });

      return response.data;
    } catch (error: unknown) {
      logError(
        'team: executeAIAction error',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  },

  // ===== ESTADÍSTICAS =====

  /**
   * Obtener estadísticas del equipo
   */
  async getTeamStats(): Promise<TeamStats> {
    try {
      logApi('team: getTeamStats');

      const response = await api.get(TEAM_ENDPOINTS.stats);

      logApi('team: getTeamStats success', response.data);

      return response.data;
    } catch (error: unknown) {
      logError('team: getTeamStats error', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  // ===== INSIGHTS Y COACHING =====

  /**
   * Obtener insights de un agente
   */
  async getAgentInsights(agentId: string): Promise<InsightData[]> {
    try {
      logApi('team: getAgentInsights', { agentId });

      const response = await api.get(TEAM_ENDPOINTS.insights(agentId));

      logApi('team: getAgentInsights success', {
        agentId,
        insightsCount: response.data.length
      });

      return response.data;
    } catch (error: unknown) {
      logError(
        'team: getAgentInsights error',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  },

  /**
   * Obtener datos de coaching de un agente
   */
  async getAgentCoaching(agentId: string): Promise<CoachingData> {
    try {
      logApi('team: getAgentCoaching', { agentId });

      const response = await api.get(TEAM_ENDPOINTS.coaching(agentId));

      logApi('team: getAgentCoaching success', {
        agentId,
        hasStrengths: response.data.strengths.length > 0,
        hasAreasToImprove: response.data.areasToImprove.length > 0
      });

      return response.data;
    } catch (error: unknown) {
      logError(
        'team: getAgentCoaching error',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
};

// ============================================================================
// MOCKS DE DATOS PARA DESARROLLO
// ============================================================================

export const mockTeamData = {
  /**
   * Generar agentes de prueba
   */
  generateMockAgents(): Agent[] {
    const names = [
      'María García López',
      'Carlos López Martínez',
      'Ana Rodríguez Silva',
      'Luis Pérez González',
      'Carmen Fernández Ruiz',
      'Javier Moreno Jiménez'
    ];

    const roles = [
      'Ejecutivo WhatsApp Senior',
      'Supervisor de Ventas',
      'Ejecutivo Facebook',
      'Agente de Soporte',
      'Ejecutivo Email',
      'Coordinador de Equipo'
    ];

    return names.map((name, index) => ({
      id: `agent_${index + 1}`,
      name,
      initials: name
        .split(' ')
        .map(n => n[0])
        .join(''),
      avatar: undefined,
      email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
      role: roles[index],
      status: index < 5 ? 'active' : 'inactive',
      metrics: {
        chatsHandled: 100 + Math.floor(Math.random() * 200),
        csatScore: 3.5 + Math.random() * 1.5,
        conversionRate: 15 + Math.random() * 25,
        avgResponseTime: `${Math.floor(Math.random() * 5)}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}`,
        chatsClosedWithoutEscalation: 80 + Math.floor(Math.random() * 20),
        totalTimeInChats: `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, '0')}`,
        firstTimeResolution: 70 + Math.random() * 20,
        upsellCrossSellRate: 10 + Math.random() * 15,
        aiQualityScore: 3.5 + Math.random() * 1.5,
        chatsHandledChange: -10 + Math.random() * 30,
        csatScoreChange: -5 + Math.random() * 20,
        conversionRateChange: -15 + Math.random() * 30,
        avgResponseTimeChange: -20 + Math.random() * 40,
        chatsClosedWithoutEscalationChange: -10 + Math.random() * 25
      },
      permissions: {
        read: ['basic', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
        write: ['basic', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
        approve: ['basic', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
        configure: ['basic', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
        lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        totalActivePermissions: Math.floor(Math.random() * 4)
      },
      coaching: {
        strengths: [
          {
            id: 'strength_1',
            title: 'Excelente tiempo de respuesta',
            description: 'Mantiene tiempos de respuesta consistentemente bajos',
            category: 'efficiency'
          },
          {
            id: 'strength_2',
            title: 'Alta satisfacción del cliente',
            description: 'Obtiene calificaciones positivas regularmente',
            category: 'quality'
          }
        ],
        areasToImprove: [
          {
            id: 'area_1',
            title: 'Técnicas de cierre de ventas',
            description: 'Necesita mejorar en el cierre efectivo de ventas',
            priority: 'high',
            category: 'sales'
          }
        ],
        suggestedPlan: [
          {
            id: 'task_1',
            title: 'Revisar técnicas de cierre',
            description: 'Estudiar y practicar 3 técnicas de cierre de ventas efectivas',
            priority: 'high',
            estimatedTime: 60,
            status: 'pending',
            category: 'training'
          },
          {
            id: 'task_2',
            title: 'Roleplay con supervisor',
            description: 'Sesión práctica de manejo de objeciones con supervisor',
            priority: 'medium',
            estimatedTime: 45,
            status: 'pending',
            category: 'practice'
          },
          {
            id: 'task_3',
            title: 'Crear plantillas personalizadas',
            description: 'Desarrollar 5 plantillas para respuestas frecuentes',
            priority: 'low',
            estimatedTime: 90,
            status: 'completed',
            category: 'development'
          }
        ],
        aiScore: 75 + Math.random() * 20,
        confidence: 80 + Math.random() * 15
      },
      insights: [
        {
          id: 'insight_1',
          type: 'achievement',
          title: 'Mejor rendimiento del mes',
          description: 'Ha superado sus objetivos de conversión en un 15%',
          severity: 'low',
          actionable: false,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          category: 'performance'
        }
      ],
      trends: {
        chatsVsSales: [
          { label: 'Lun', value: 45, previousValue: 40 },
          { label: 'Mar', value: 52, previousValue: 48 },
          { label: 'Mié', value: 38, previousValue: 42 },
          { label: 'Jue', value: 61, previousValue: 55 },
          { label: 'Vie', value: 49, previousValue: 51 }
        ],
        responseTimeByHour: [
          { label: '9h', value: 2.5 },
          { label: '10h', value: 1.8 },
          { label: '11h', value: 3.2 },
          { label: '12h', value: 2.1 },
          { label: '13h', value: 4.5 },
          { label: '14h', value: 2.8 },
          { label: '15h', value: 1.9 },
          { label: '16h', value: 3.1 },
          { label: '17h', value: 2.3 }
        ],
        channelDistribution: [
          { channel: 'whatsapp', percentage: 60, totalMessages: 120 },
          { channel: 'facebook', percentage: 25, totalMessages: 50 },
          { channel: 'webchat', percentage: 10, totalMessages: 20 },
          { channel: 'email', percentage: 5, totalMessages: 10 }
        ],
        csatLast30Days: 4.2 + Math.random() * 0.8,
        activityByHour: [
          { label: '9h', value: 15 },
          { label: '10h', value: 22 },
          { label: '11h', value: 18 },
          { label: '12h', value: 12 },
          { label: '13h', value: 8 },
          { label: '14h', value: 20 },
          { label: '15h', value: 25 },
          { label: '16h', value: 19 },
          { label: '17h', value: 14 }
        ]
      },
      lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
    }));
  },

  /**
   * Generar estadísticas de prueba
   */
  generateMockStats(): TeamStats {
    return {
      totalAgents: 6,
      activeAgents: 5,
      inactiveAgents: 1,
      averagePerformance: 23.5,
      topPerformer: 'agent_1'
    };
  }
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Simular delay para desarrollo
 */
export const simulateDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Manejar errores de API de manera consistente
 */
export const handleTeamError = (error: unknown, context: string): never => {
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  logError(`team: ${context} error`, errorMessage);

  throw new Error(`Error en ${context}: ${errorMessage}`);
};

// ============================================================================
// EXPORTACIONES
// ============================================================================

// Las interfaces ya están definidas en otros archivos, no necesitan ser re-exportadas
