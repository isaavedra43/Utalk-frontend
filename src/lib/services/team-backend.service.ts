/**
 * Team Backend Service
 * Servicio completo para integración con el backend del módulo Equipo & Performance
 */

import type {
  Agent,
  AgentAction,
  AgentInsight,
  AgentMetrics,
  AgentPermissions,
  AgentRole,
  AgentStatus,
  PermissionLevel,
  TeamStats
} from '$lib/types/team';
import { api } from './axios';

// WebSocket está disponible globalmente en el navegador

// ============================================================================
// TIPOS PARA API
// ============================================================================

export interface CreateAgentRequest {
  name: string;
  email: string;
  role: AgentRole;
  avatar?: string;
  permissions: AgentPermissions;
}

export interface UpdateAgentRequest {
  name?: string;
  email?: string;
  role?: AgentRole;
  avatar?: string;
  status?: AgentStatus;
  permissions?: Partial<AgentPermissions>;
}

export interface AgentFilters {
  search?: string;
  status?: AgentStatus;
  role?: AgentRole;
  permissions?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface MetricsFilters {
  agentId?: string;
  dateFrom: string;
  dateTo: string;
  metrics: string[];
}

export interface AgentActionRequest {
  agentId: string;
  action: string;
  parameters?: Record<string, unknown>;
  priority?: 'low' | 'medium' | 'high';
}

// ============================================================================
// ENDPOINTS PRINCIPALES
// ============================================================================

export const teamEndpoints = {
  // Agentes
  agents: '/api/team/agents',
  agent: (id: string) => `/api/team/agents/${id}`,
  agentMetrics: (id: string) => `/api/team/agents/${id}/metrics`,
  agentPermissions: (id: string) => `/api/team/agents/${id}/permissions`,
  agentActions: (id: string) => `/api/team/agents/${id}/actions`,

  // Estadísticas
  stats: '/api/team/stats',
  statsOverview: '/api/team/stats/overview',
  statsTrends: '/api/team/stats/trends',

  // Acciones IA
  aiActions: '/api/team/ai/actions',
  aiSuggestions: '/api/team/ai/suggestions',
  aiInsights: '/api/team/ai/insights',

  // Permisos
  permissions: '/api/team/permissions',
  permissionLevels: '/api/team/permissions/levels',

  // Reportes
  reports: '/api/team/reports',
  exportData: '/api/team/export',

  // Real-time
  realtime: '/api/team/realtime',
  realtimeMetrics: '/api/team/realtime/metrics',
  realtimeStatus: '/api/team/realtime/status'
} as const;

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

export class TeamBackendService {
  private static instance: TeamBackendService;
  private realtimeConnections: Map<string, unknown> = new Map();
  private retryAttempts: Map<string, number> = new Map();
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000;

  static getInstance(): TeamBackendService {
    if (!TeamBackendService.instance) {
      TeamBackendService.instance = new TeamBackendService();
    }
    return TeamBackendService.instance;
  }

  // ============================================================================
  // GESTIÓN DE AGENTES
  // ============================================================================

  /**
   * Obtener lista de agentes con filtros
   */
  async getAgents(filters?: AgentFilters): Promise<Agent[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }

      const response = await api.get(teamEndpoints.agents, { params });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al obtener agentes');
    }
  }

  /**
   * Obtener agente por ID
   */
  async getAgent(id: string): Promise<Agent> {
    try {
      const response = await api.get(teamEndpoints.agent(id));
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, `Error al obtener agente ${id}`);
    }
  }

  /**
   * Crear nuevo agente
   */
  async createAgent(agentData: CreateAgentRequest): Promise<Agent> {
    try {
      const response = await api.post(teamEndpoints.agents, agentData);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al crear agente');
    }
  }

  /**
   * Actualizar agente
   */
  async updateAgent(id: string, updates: UpdateAgentRequest): Promise<Agent> {
    try {
      const response = await api.patch(teamEndpoints.agent(id), updates);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, `Error al actualizar agente ${id}`);
    }
  }

  /**
   * Eliminar agente
   */
  async deleteAgent(id: string): Promise<void> {
    try {
      await api.delete(teamEndpoints.agent(id));
    } catch (error) {
      throw this.handleApiError(error, `Error al eliminar agente ${id}`);
    }
  }

  // ============================================================================
  // MÉTRICAS Y ESTADÍSTICAS
  // ============================================================================

  /**
   * Obtener métricas de un agente
   */
  async getAgentMetrics(id: string, filters?: MetricsFilters): Promise<AgentMetrics> {
    try {
      const params = filters
        ? new URLSearchParams(filters as unknown as Record<string, string>)
        : undefined;
      const response = await api.get(teamEndpoints.agentMetrics(id), { params });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, `Error al obtener métricas del agente ${id}`);
    }
  }

  /**
   * Obtener estadísticas generales del equipo
   */
  async getTeamStats(filters?: MetricsFilters): Promise<TeamStats> {
    try {
      const params = filters
        ? new URLSearchParams(filters as unknown as Record<string, string>)
        : undefined;
      const response = await api.get(teamEndpoints.stats, { params });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al obtener estadísticas del equipo');
    }
  }

  /**
   * Obtener overview de estadísticas
   */
  async getStatsOverview(): Promise<TeamStats> {
    try {
      const response = await api.get(teamEndpoints.statsOverview);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al obtener overview de estadísticas');
    }
  }

  /**
   * Obtener tendencias de estadísticas
   */
  async getStatsTrends(filters?: MetricsFilters): Promise<unknown[]> {
    try {
      const params = filters
        ? new URLSearchParams(filters as unknown as Record<string, string>)
        : undefined;
      const response = await api.get(teamEndpoints.statsTrends, { params });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al obtener tendencias');
    }
  }

  // ============================================================================
  // PERMISOS
  // ============================================================================

  /**
   * Obtener permisos de un agente
   */
  async getAgentPermissions(id: string): Promise<AgentPermissions> {
    try {
      const response = await api.get(teamEndpoints.agentPermissions(id));
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, `Error al obtener permisos del agente ${id}`);
    }
  }

  /**
   * Actualizar permisos de un agente
   */
  async updateAgentPermissions(
    id: string,
    permissions: Partial<AgentPermissions>
  ): Promise<AgentPermissions> {
    try {
      const response = await api.patch(teamEndpoints.agentPermissions(id), permissions);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, `Error al actualizar permisos del agente ${id}`);
    }
  }

  /**
   * Obtener niveles de permisos disponibles
   */
  async getPermissionLevels(): Promise<PermissionLevel[]> {
    try {
      const response = await api.get(teamEndpoints.permissionLevels);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al obtener niveles de permisos');
    }
  }

  // ============================================================================
  // ACCIONES IA
  // ============================================================================

  /**
   * Ejecutar acción IA para un agente
   */
  async executeAIAction(request: AgentActionRequest): Promise<AgentAction> {
    try {
      const response = await api.post(teamEndpoints.aiActions, request);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al ejecutar acción IA');
    }
  }

  /**
   * Obtener sugerencias IA para un agente
   */
  async getAISuggestions(agentId: string): Promise<AgentAction[]> {
    try {
      const response = await api.get(`${teamEndpoints.aiSuggestions}?agentId=${agentId}`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al obtener sugerencias IA');
    }
  }

  /**
   * Obtener insights IA para un agente
   */
  async getAIInsights(agentId: string): Promise<AgentInsight[]> {
    try {
      const response = await api.get(`${teamEndpoints.aiInsights}?agentId=${agentId}`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al obtener insights IA');
    }
  }

  // ============================================================================
  // REPORTES Y EXPORTACIÓN
  // ============================================================================

  /**
   * Generar reporte de equipo
   */
  async generateReport(filters?: AgentFilters): Promise<Blob> {
    try {
      const params = filters ? new URLSearchParams(filters as Record<string, string>) : undefined;
      const response = await api.get(teamEndpoints.reports, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al generar reporte');
    }
  }

  /**
   * Exportar datos del equipo
   */
  async exportData(filters?: AgentFilters, format: 'csv' | 'xlsx' | 'json' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams({ format });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }

      const response = await api.get(teamEndpoints.exportData, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, 'Error al exportar datos');
    }
  }

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  /**
   * Conectar a WebSocket para actualizaciones en tiempo real
   */
  connectRealtime(channel: string, onMessage: (data: unknown) => void): unknown {
    try {
      const wsUrl = `${process.env.VITE_WS_URL || 'ws://localhost:3000'}${teamEndpoints.realtime}/${channel}`;
      const ws = new (globalThis as { WebSocket: new (url: string) => unknown }).WebSocket(wsUrl);
      const wsObj = ws as {
        onopen: () => void;
        onmessage: (event: unknown) => void;
        onerror: (error: unknown) => void;
        onclose: () => void;
      };

      wsObj.onopen = () => {
        // WebSocket conectado exitosamente
        this.realtimeConnections.set(channel, ws);
      };

      wsObj.onmessage = (event: unknown) => {
        try {
          const eventData = event as { data: string };
          const data = JSON.parse(eventData.data);
          onMessage(data);
        } catch (error) {
          // Error parsing WebSocket message
        }
      };

      wsObj.onerror = (error: unknown) => {
        this.handleRealtimeError(channel, error);
      };

      wsObj.onclose = () => {
        this.realtimeConnections.delete(channel);
        this.retryRealtimeConnection(channel, onMessage);
      };

      return ws;
    } catch (error) {
      throw new Error(`Error al conectar WebSocket: ${error}`);
    }
  }

  /**
   * Desconectar WebSocket
   */
  disconnectRealtime(channel: string): void {
    const ws = this.realtimeConnections.get(channel);
    if (ws && typeof ws === 'object' && 'close' in ws) {
      (ws as { close: () => void }).close();
      this.realtimeConnections.delete(channel);
    }
  }

  /**
   * Enviar mensaje a través de WebSocket
   */
  sendRealtimeMessage(channel: string, message: unknown): void {
    const ws = this.realtimeConnections.get(channel);
    if (ws && typeof ws === 'object' && 'readyState' in ws && 'send' in ws) {
      const wsObj = ws as { readyState: number; send: (data: string) => void };
      if (wsObj.readyState === 1) {
        // WebSocket.OPEN
        wsObj.send(JSON.stringify(message));
      }
      // WebSocket no disponible
    }
    // WebSocket no disponible
  }

  // ============================================================================
  // MANEJO DE ERRORES Y RETRY
  // ============================================================================

  /**
   * Manejar errores de API con retry automático
   */
  private async handleApiError(error: unknown, message: string): Promise<never> {
    const errorKey = `${message}_${Date.now()}`;
    const attempts = this.retryAttempts.get(errorKey) || 0;

    if (this.shouldRetry(error) && attempts < this.MAX_RETRY_ATTEMPTS) {
      this.retryAttempts.set(errorKey, attempts + 1);

      await this.delay(this.RETRY_DELAY * Math.pow(2, attempts));

      // Reintentar la operación (esto requeriría refactorizar para pasar la operación)
      throw new Error(`Reintento ${attempts + 1}/${this.MAX_RETRY_ATTEMPTS}: ${message}`);
    }

    this.retryAttempts.delete(errorKey);

    const apiError = new Error(message);
    (apiError as { cause?: unknown }).cause = error;
    throw apiError;
  }

  /**
   * Determinar si se debe reintentar basado en el error
   */
  private shouldRetry(error: unknown): boolean {
    const errorObj = error as { response?: { status?: number } };
    if (!errorObj.response) return true; // Error de red

    const status = errorObj.response.status;
    return status !== undefined && (status >= 500 || status === 429); // Errores del servidor o rate limit
  }

  /**
   * Manejar errores de WebSocket
   */
  private handleRealtimeError(_channel: string, _error: unknown): void {
    // Implementar lógica de reconexión si es necesario
  }

  /**
   * Reintentar conexión WebSocket
   */
  private retryRealtimeConnection(channel: string, onMessage: (data: unknown) => void): void {
    const attempts = this.retryAttempts.get(channel) || 0;

    if (attempts < this.MAX_RETRY_ATTEMPTS) {
      this.retryAttempts.set(channel, attempts + 1);

      setTimeout(
        () => {
          this.connectRealtime(channel, onMessage);
        },
        this.RETRY_DELAY * Math.pow(2, attempts)
      );
    } else {
      this.retryAttempts.delete(channel);
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // LIMPIEZA
  // ============================================================================

  /**
   * Limpiar todas las conexiones
   */
  cleanup(): void {
    this.realtimeConnections.forEach((ws, channel) => {
      this.disconnectRealtime(channel);
    });
    this.retryAttempts.clear();
  }
}

// Exportar instancia singleton
export const teamBackendService = TeamBackendService.getInstance();
