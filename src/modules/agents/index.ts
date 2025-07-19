// 👥 MÓDULO DE AGENTES Y PERFORMANCE - UTalk Frontend
// Exportaciones principales del módulo

// ✅ COMPONENTES PRINCIPALES
export { default as AgentsDashboard } from './components/AgentsDashboard'

// ✅ HOOKS
export { 
  useAgents, 
  useAgent, 
  useAgentMetrics,
  useAgentStats,
  useAgentTeams,
  useAgentRoles,
  useAgentAIAnalysis,
  useAgentRealTime,
  useAgentComparison
} from './hooks/useAgents'

// ✅ SERVICIOS
export { agentsService } from './services/agentsService'

// ✅ TIPOS
export type {
  Agent,
  AgentRole,
  AgentStatus,
  AgentPermissions,
  AgentMetrics,
  AgentTeam,
  AgentFilters,
  AgentGoals,
  TeamMetrics,
  AIAnalysis,
  AgentChange,
  AgentEvent,
  AccessLevel,
  Channel,
  WorkingHours,
  AgentsResponse,
  AgentResponse,
  AgentMetricsResponse,
  AgentTeamsResponse,
  AgentRolesResponse,
  MetricsTimeSeries,
  AgentsModuleConfig
} from './types'

// ✅ CONSTANTES
export {
  AGENT_STATUS_LABELS,
  AGENT_STATUS_COLORS,
  ACCESS_LEVEL_LABELS,
  CHANNEL_LABELS,
  CHANNEL_ICONS,
  DEFAULT_PERMISSIONS
} from './types'

// TODO: Los siguientes componentes se implementarán como archivos separados:
// - AgentsList
// - AgentsFilters  
// - AgentDetailPanel
// - AgentCreateModal
// - AgentStatsPanel 