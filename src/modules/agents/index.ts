// Módulo de Agentes - Exportaciones principales
export { useAgents } from './hooks/useAgents'
export { agentsService } from './services/agentsService'

// Tipos
export type {
  Agent,
  AgentRole,
  AgentTeam,
  AIAnalysis,
  AgentsResponse,
  AgentResponse,
  AgentMetricsResponse,
  AgentTeamsResponse,
  AgentRolesResponse
} from './types'

// Datos mock
export {
  mockAgents,
  mockRoles,
  mockTeams,
  mockAIAnalysis,
  mockAgentStats
} from './data/mockAgents'
