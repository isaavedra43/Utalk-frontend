/**
 * Dashboard Store - UTalk
 * Store principal para gestión de estado del dashboard con métricas en tiempo real
 */

import type {
  ActivityData,
  AgentData,
  DashboardFilters,
  DashboardState,
  KPIData
} from '$lib/types/dashboard';
import { derived, get, writable } from 'svelte/store';

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialState: DashboardState = {
  kpis: [],
  activity: [],
  agents: [],
  sentiment: [],
  calendar: [],
  insights: [],
  topics: [],
  riskCustomers: [],
  loading: false,
  error: null,
  lastUpdated: new Date(),
  selectedPeriod: 'today',
  selectedChannels: ['all'],
  autoRefresh: true
};

const initialFilters: DashboardFilters = {
  period: 'today',
  channels: ['all'],
  agents: ['all'],
  dateRange: {
    start: new Date(),
    end: new Date()
  }
};

// ============================================================================
// STORES PRINCIPALES
// ============================================================================

export const dashboardState = writable<DashboardState>(initialState);
export const dashboardFilters = writable<DashboardFilters>(initialFilters);

// Configuración del dashboard
export const dashboardConfig = writable({
  autoRefresh: true,
  refreshInterval: 30000, // 30 segundos
  enableNotifications: true,
  enableSounds: false,
  theme: 'light' as 'light' | 'dark',
  timezone: 'America/Mexico_City'
});

// ============================================================================
// DERIVED STORES (COMPUTADOS)
// ============================================================================

// KPIs computados con tendencias
export const kpisWithTrends = derived(dashboardState, $state => {
  return $state.kpis.map(kpi => ({
    ...kpi,
    trend: kpi.change ? (kpi.change > 0 ? 'up' : 'down') : 'neutral',
    formattedChange: kpi.change ? `${kpi.change > 0 ? '+' : ''}${kpi.change.toFixed(1)}%` : '0%'
  }));
});

// Agentes ordenados por rendimiento
export const rankedAgents = derived(dashboardState, $state => {
  return [...$state.agents].sort((a, b) => {
    // Algoritmo de ranking: satisfacción (40%) + conversaciones (30%) + tiempo respuesta (30%)
    const scoreA =
      a.satisfactionRate * 0.4 + a.conversationsHandled * 0.3 + (10 - a.averageResponseTime) * 0.3;
    const scoreB =
      b.satisfactionRate * 0.4 + b.conversationsHandled * 0.3 + (10 - b.averageResponseTime) * 0.3;
    return scoreB - scoreA;
  });
});

// Resumen general del dashboard
export const dashboardSummary = derived(dashboardState, $state => {
  const totalMessages = $state.activity.reduce((sum, item) => sum + item.messages, 0);
  const avgResponseTime =
    $state.agents.length > 0
      ? $state.agents.reduce((sum, agent) => sum + agent.averageResponseTime, 0) /
        $state.agents.length
      : 0;
  const totalAgentsActive = $state.agents.filter(agent => agent.status === 'active').length;

  return {
    totalMessages,
    avgResponseTime: parseFloat(avgResponseTime.toFixed(1)),
    totalAgents: $state.agents.length,
    activeAgents: totalAgentsActive,
    sentimentScore:
      $state.sentiment.length > 0
        ? $state.sentiment.reduce((sum, s) => sum + s.positive, 0) / $state.sentiment.length
        : 0,
    peakHour:
      $state.activity.length > 0
        ? $state.activity.reduce((max, item) => (item.messages > max.messages ? item : max)).hour
        : null
  };
});

// ============================================================================
// ACCIONES DEL STORE
// ============================================================================

export const dashboardActions = {
  // Actualizar KPIs individuales
  updateKPI: (kpiId: string, newData: Partial<KPIData>) => {
    dashboardState.update(state => ({
      ...state,
      kpis: state.kpis.map(kpi => (kpi.id === kpiId ? { ...kpi, ...newData } : kpi)),
      lastUpdated: new Date()
    }));
  },

  // Reemplazar todos los KPIs
  setKPIs: (kpis: KPIData[]) => {
    dashboardState.update(state => ({
      ...state,
      kpis,
      lastUpdated: new Date()
    }));
  },

  // Actualizar datos de actividad
  setActivity: (activity: ActivityData[]) => {
    dashboardState.update(state => ({
      ...state,
      activity,
      lastUpdated: new Date()
    }));
  },

  // Actualizar agentes
  setAgents: (agents: AgentData[]) => {
    dashboardState.update(state => ({
      ...state,
      agents,
      lastUpdated: new Date()
    }));
  },

  // Actualizar estado de un agente específico
  updateAgentStatus: (agentId: string, status: AgentData['status']) => {
    dashboardState.update(state => ({
      ...state,
      agents: state.agents.map(agent =>
        agent.id === agentId ? { ...agent, status, lastActivity: new Date() } : agent
      ),
      lastUpdated: new Date()
    }));
  },

  // Gestión de loading
  setLoading: (loading: boolean) => {
    dashboardState.update(state => ({
      ...state,
      loading
    }));
  },

  // Gestión de errores
  setError: (error: string | null) => {
    dashboardState.update(state => ({
      ...state,
      error
    }));
  },

  // Actualizar filtros
  updateFilters: (newFilters: Partial<DashboardFilters>) => {
    dashboardFilters.update(filters => ({
      ...filters,
      ...newFilters
    }));
  },

  // Reset completo del estado
  reset: () => {
    dashboardState.set(initialState);
    dashboardFilters.set(initialFilters);
  }
};

// ============================================================================
// UTILIDADES
// ============================================================================

// Función para obtener el estado actual sin suscripción
export const getDashboardState = () => get(dashboardState);
export const getDashboardFilters = () => get(dashboardFilters);
export const getDashboardConfig = () => get(dashboardConfig);

// Función para verificar si hay datos cargados
export const hasDashboardData = derived(dashboardState, $state => {
  return $state.kpis.length > 0 || $state.activity.length > 0 || $state.agents.length > 0;
});

// Exportar tipos para uso externo
export type { DashboardFilters, DashboardState };
