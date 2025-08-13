/**
 * Store de Equipo & Performance - UTalk
 * Gestión de estado para el módulo de gestión de agentes y análisis de rendimiento
 */

import type {
  Agent,
  AgentPermissions,
  AIAction,
  AIActionResult,
  CoachingData,
  InsightData,
  LoadingStates,
  TeamConfig,
  TeamFilters,
  TeamState
} from '$lib/types/team';
import { derived, get, writable } from 'svelte/store';

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialState: TeamState = {
  agents: [],
  selectedAgentId: null,
  searchQuery: '',
  statusFilter: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  activeTab: 'overview',
  rightPanelTab: 'actions',
  loading: {
    agents: false,
    details: false,
    actions: false,
    insights: false
  },
  stats: {
    totalAgents: 0,
    activeAgents: 0,
    inactiveAgents: 0,
    averagePerformance: 0,
    topPerformer: null
  }
};

const initialFilters: TeamFilters = {
  search: '',
  status: 'all'
};

const initialConfig: TeamConfig = {
  autoRefresh: true,
  refreshInterval: 30000, // 30 segundos
  showInactiveAgents: true,
  defaultSort: 'name',
  defaultTab: 'overview'
};

// ============================================================================
// STORES PRINCIPALES
// ============================================================================

export const teamState = writable<TeamState>(initialState);
export const teamFilters = writable<TeamFilters>(initialFilters);
export const teamConfig = writable<TeamConfig>(initialConfig);

// ============================================================================
// DERIVED STORES
// ============================================================================

// Agentes filtrados y ordenados
export const filteredAgents = derived([teamState, teamFilters], ([$state, $filters]) => {
  let agents = [...$state.agents];

  // Filtrar por búsqueda
  if ($filters.search) {
    const searchLower = $filters.search.toLowerCase();
    agents = agents.filter(
      agent =>
        agent.name.toLowerCase().includes(searchLower) ||
        agent.email.toLowerCase().includes(searchLower) ||
        agent.role.toLowerCase().includes(searchLower)
    );
  }

  // Filtrar por estado
  if ($filters.status !== 'all') {
    agents = agents.filter(agent => agent.status === $filters.status);
  }

  // Ordenar
  agents.sort((a, b) => {
    let comparison = 0;

    switch ($state.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'performance':
        comparison = b.metrics.conversionRate - a.metrics.conversionRate;
        break;
      case 'lastActivity':
        comparison = new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        break;
    }

    return $state.sortOrder === 'asc' ? comparison : -comparison;
  });

  return agents;
});

// Agente seleccionado
export const selectedAgent = derived([teamState, filteredAgents], ([$state, $agents]) => {
  if (!$state.selectedAgentId) return null;
  return $agents.find(agent => agent.id === $state.selectedAgentId) || null;
});

// Estadísticas actualizadas
export const currentStats = derived([filteredAgents], ([$agents]) => {
  const totalAgents = $agents.length;
  const activeAgents = $agents.filter(agent => agent.status === 'active').length;
  const inactiveAgents = totalAgents - activeAgents;

  const averagePerformance =
    totalAgents > 0
      ? $agents.reduce((sum, agent) => sum + agent.metrics.conversionRate, 0) / totalAgents
      : 0;

  const topPerformer =
    $agents.length > 0
      ? $agents.reduce((top, agent) =>
          agent.metrics.conversionRate > top.metrics.conversionRate ? agent : top
        ).id
      : null;

  return {
    totalAgents,
    activeAgents,
    inactiveAgents,
    averagePerformance: parseFloat(averagePerformance.toFixed(1)),
    topPerformer
  };
});

// Agentes con permisos activos
export const agentsWithActivePermissions = derived([filteredAgents], ([$agents]) => {
  return $agents.filter(agent => agent.permissions.totalActivePermissions > 0);
});

// Agentes que requieren atención (performance baja)
export const agentsNeedingAttention = derived([filteredAgents], ([$agents]) => {
  return $agents.filter(
    agent => agent.metrics.conversionRate < 20 || agent.metrics.csatScore < 3.5
  );
});

// ============================================================================
// ACCIONES DEL STORE
// ============================================================================

export const teamActions = {
  // ===== GESTIÓN DE AGENTES =====

  // Cargar agentes
  loadAgents: async (agents: Agent[]) => {
    teamState.update(state => ({
      ...state,
      agents,
      loading: { ...state.loading, agents: false }
    }));
  },

  // Agregar agente
  addAgent: (agent: Agent) => {
    teamState.update(state => ({
      ...state,
      agents: [...state.agents, agent]
    }));
  },

  // Actualizar agente
  updateAgent: (agentId: string, updates: Partial<Agent>) => {
    teamState.update(state => ({
      ...state,
      agents: state.agents.map(agent => (agent.id === agentId ? { ...agent, ...updates } : agent))
    }));
  },

  // Eliminar agente
  removeAgent: (agentId: string) => {
    teamState.update(state => ({
      ...state,
      agents: state.agents.filter(agent => agent.id !== agentId),
      selectedAgentId: state.selectedAgentId === agentId ? null : state.selectedAgentId
    }));
  },

  // ===== SELECCIÓN Y NAVEGACIÓN =====

  // Seleccionar agente
  selectAgent: (agentId: string | null) => {
    teamState.update(state => ({
      ...state,
      selectedAgentId: agentId
    }));
  },

  // Auto-seleccionar primer agente
  autoSelectFirstAgent: () => {
    const currentState = get(teamState);
    const currentAgents = get(filteredAgents);

    if (currentAgents.length > 0 && !currentState.selectedAgentId) {
      teamActions.selectAgent(currentAgents[0].id);
    }
  },

  // ===== FILTROS Y BÚSQUEDA =====

  // Actualizar búsqueda
  updateSearch: (query: string) => {
    teamState.update(state => ({
      ...state,
      searchQuery: query
    }));
    teamFilters.update(filters => ({
      ...filters,
      search: query
    }));
  },

  // Actualizar filtro de estado
  updateStatusFilter: (filter: 'all' | 'active' | 'inactive') => {
    teamState.update(state => ({
      ...state,
      statusFilter: filter
    }));
    teamFilters.update(filters => ({
      ...filters,
      status: filter
    }));
  },

  // Actualizar ordenamiento
  updateSort: (sortBy: 'name' | 'performance' | 'lastActivity', sortOrder: 'asc' | 'desc') => {
    teamState.update(state => ({
      ...state,
      sortBy,
      sortOrder
    }));
  },

  // ===== UI STATE =====

  // Cambiar tab principal
  setActiveTab: (tab: 'overview' | 'kpis' | 'trends') => {
    teamState.update(state => ({
      ...state,
      activeTab: tab
    }));
  },

  // Cambiar tab del panel derecho
  setRightPanelTab: (tab: 'actions' | 'insights') => {
    teamState.update(state => ({
      ...state,
      rightPanelTab: tab
    }));
  },

  // ===== LOADING STATES =====

  // Establecer loading para una sección
  setLoading: (section: keyof LoadingStates, loading: boolean) => {
    teamState.update(state => ({
      ...state,
      loading: {
        ...state.loading,
        [section]: loading
      }
    }));
  },

  // ===== PERMISOS =====

  // Actualizar permisos de un agente
  updateAgentPermissions: (agentId: string, permissions: Partial<AgentPermissions>) => {
    teamState.update(state => ({
      ...state,
      agents: state.agents.map(agent =>
        agent.id === agentId
          ? {
              ...agent,
              permissions: {
                ...agent.permissions,
                ...permissions,
                lastModified: new Date(),
                totalActivePermissions: Object.values({
                  ...agent.permissions,
                  ...permissions
                }).filter(p => p !== 'basic').length
              }
            }
          : agent
      )
    }));
  },

  // ===== COACHING =====

  // Actualizar datos de coaching
  updateCoachingData: (agentId: string, coaching: Partial<CoachingData>) => {
    teamState.update(state => ({
      ...state,
      agents: state.agents.map(agent =>
        agent.id === agentId ? { ...agent, coaching: { ...agent.coaching, ...coaching } } : agent
      )
    }));
  },

  // ===== ACCIONES IA =====

  // Ejecutar acción IA
  executeAIAction: async (agentId: string, actionType: AIAction['type']) => {
    const action: AIAction = {
      id: `action_${Date.now()}`,
      type: actionType,
      title: getActionTitle(actionType),
      description: getActionDescription(actionType),
      icon: getActionIcon(actionType),
      loading: true,
      completed: false
    };

    // Simular ejecución de acción IA
    setTimeout(() => {
      const result: AIActionResult = {
        success: true,
        message: `Acción ${action.title} ejecutada exitosamente`,
        confidence: Math.random() * 100
      };

      // Actualizar el agente con el resultado
      teamActions.updateAgent(agentId, {
        insights: [
          {
            id: `insight_${Date.now()}`,
            type: 'recommendation',
            title: action.title,
            description: result.message,
            severity: 'medium',
            actionable: false,
            createdAt: new Date(),
            category: 'coaching'
          }
        ]
      });
    }, 2000);

    return action;
  },

  // ===== CONFIGURACIÓN =====

  // Actualizar configuración
  updateConfig: (config: Partial<TeamConfig>) => {
    teamConfig.update(current => ({
      ...current,
      ...config
    }));
  },

  // ===== RESET Y CLEANUP =====

  // Reset completo
  reset: () => {
    teamState.set(initialState);
    teamFilters.set(initialFilters);
    teamConfig.set(initialConfig);
  },

  // Cleanup específico
  cleanup: () => {
    teamState.update(state => ({
      ...state,
      selectedAgentId: null,
      loading: {
        agents: false,
        details: false,
        actions: false,
        insights: false
      }
    }));
  }
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function getActionTitle(type: AIAction['type']): string {
  const titles = {
    suggest_improvement: 'Sugerir Mejora',
    send_reminder: 'Enviar Recordatorio',
    analyze: 'Analizar Rendimiento',
    insert_template: 'Insertar Respuesta Tipo'
  };
  return titles[type];
}

function getActionDescription(type: AIAction['type']): string {
  const descriptions = {
    suggest_improvement: 'Generar sugerencias personalizadas de mejora',
    send_reminder: 'Enviar recordatorio sobre tareas pendientes',
    analyze: 'Realizar análisis detallado del rendimiento',
    insert_template: 'Insertar respuesta predefinida en conversación'
  };
  return descriptions[type];
}

function getActionIcon(type: AIAction['type']): string {
  const icons = {
    suggest_improvement: 'Sparkles',
    send_reminder: 'Bell',
    analyze: 'BarChart3',
    insert_template: 'Copy'
  };
  return icons[type];
}

// ============================================================================
// UTILIDADES
// ============================================================================

// Función para obtener el estado actual sin suscripción
export const getTeamState = () => get(teamState);
export const getTeamFilters = () => get(teamFilters);
export const getTeamConfig = () => get(teamConfig);

// Función para verificar si hay datos cargados
export const hasTeamData = derived(teamState, $state => {
  return $state.agents.length > 0;
});

// Función para obtener estadísticas de rendimiento
export const getPerformanceStats = derived(teamState, $state => {
  const agents = $state.agents;
  if (agents.length === 0) return null;

  const avgCSAT = agents.reduce((sum, agent) => sum + agent.metrics.csatScore, 0) / agents.length;
  const avgConversion =
    agents.reduce((sum, agent) => sum + agent.metrics.conversionRate, 0) / agents.length;
  const avgResponseTime =
    agents.reduce((sum, agent) => {
      const time = agent.metrics.avgResponseTime.split(':');
      return sum + (parseInt(time[0]) * 60 + parseInt(time[1]));
    }, 0) / agents.length;

  return {
    avgCSAT: parseFloat(avgCSAT.toFixed(1)),
    avgConversion: parseFloat(avgConversion.toFixed(1)),
    avgResponseTime: `${Math.floor(avgResponseTime / 60)}:${(avgResponseTime % 60).toString().padStart(2, '0')}`
  };
});

// Exportar tipos para uso externo
export type {
  Agent,
  AgentPermissions,
  AIAction,
  CoachingData,
  InsightData,
  TeamConfig,
  TeamFilters,
  TeamState
};
