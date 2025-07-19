// 🎣 HOOKS PRINCIPALES - Módulo de Agentes y Performance
// Gestión completa de agentes con React Query y Firebase en tiempo real

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useEffect } from 'react'
import type { 
  Agent,
  AgentFilters,
  AgentMetrics,
  AgentTeam,
  AgentRole,
  AgentsResponse,
  AgentResponse,
  AgentMetricsResponse,
  AgentTeamsResponse,
  AgentRolesResponse,
  MetricsTimeSeries,
  AIAnalysis,
  AgentStatus,
  AgentPermissions
} from '../types'
import { agentsService } from '../services/agentsService'

/**
 * 🎯 HOOK PRINCIPAL DE AGENTES
 */
export function useAgents(initialFilters?: AgentFilters) {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<AgentFilters>(initialFilters || {
    page: 1,
    limit: 20,
    sortBy: 'lastActivity',
    sortOrder: 'desc'
  })
  
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  // ✅ CONSULTAR AGENTES
  const {
    data: agentsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['agents', filters],
    queryFn: () => agentsService.getAgents(filters),
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
    refetchInterval: 60000 // Actualizar cada minuto
  })

  const agents = agentsData?.agents || []
  const total = agentsData?.total || 0
  const hasMore = agents.length < total

  // ✅ CREAR AGENTE
  const createAgentMutation = useMutation({
    mutationFn: agentsService.createAgent,
    onSuccess: (response: AgentResponse) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['agents'] })
        queryClient.invalidateQueries({ queryKey: ['agent-stats'] })
        queryClient.setQueryData(['agent', response.agent?.id], response.agent)
      }
    }
  })

  // ✅ ACTUALIZAR AGENTE
  const updateAgentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Agent> }) =>
      agentsService.updateAgent(id, updates),
    onSuccess: (response: AgentResponse, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['agents'] })
        queryClient.setQueryData(['agent', variables.id], response.agent)
        queryClient.invalidateQueries({ queryKey: ['agent-metrics', variables.id] })
      }
    }
  })

  // ✅ ELIMINAR AGENTE
  const deleteAgentMutation = useMutation({
    mutationFn: agentsService.deleteAgent,
    onSuccess: (response: { success: boolean; error?: string }, agentId: string) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['agents'] })
        queryClient.removeQueries({ queryKey: ['agent', agentId] })
        queryClient.removeQueries({ queryKey: ['agent-metrics', agentId] })
        queryClient.invalidateQueries({ queryKey: ['agent-stats'] })
        
        // Si era el agente seleccionado, deseleccionar
        if (selectedAgentId === agentId) {
          setSelectedAgentId(null)
        }
      }
    }
  })

  // ✅ CAMBIAR ESTADO DE AGENTE
  const updateAgentStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: AgentStatus }) =>
      agentsService.updateAgentStatus(id, status),
    onSuccess: (response: AgentResponse, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['agents'] })
        queryClient.setQueryData(['agent', variables.id], response.agent)
      }
    }
  })

  // ✅ ACTUALIZAR PERMISOS
  const updatePermissionsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string, permissions: AgentPermissions }) =>
      agentsService.updateAgentPermissions(id, permissions),
    onSuccess: (response: AgentResponse, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['agents'] })
        queryClient.setQueryData(['agent', variables.id], response.agent)
      }
    }
  })

  // ✅ FUNCIONES DE UTILIDAD
  const updateFilters = useCallback((newFilters: Partial<AgentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'lastActivity',
      sortOrder: 'desc'
    })
  }, [])

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      updateFilters({ page: (filters.page || 1) + 1 })
    }
  }, [hasMore, isLoading, filters.page, updateFilters])

  const refresh = useCallback(() => {
    refetch()
    queryClient.invalidateQueries({ queryKey: ['agent-stats'] })
  }, [refetch, queryClient])

  // ✅ SELECCIÓN DE AGENTE
  const selectAgent = useCallback((agentId: string | null) => {
    setSelectedAgentId(agentId)
  }, [])

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId) || null

  // ✅ ACCIONES PRINCIPALES
  const createAgent = useCallback(async (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createAgentMutation.mutateAsync(agentData)
  }, [createAgentMutation])

  const updateAgent = useCallback(async (id: string, updates: Partial<Agent>) => {
    return updateAgentMutation.mutateAsync({ id, updates })
  }, [updateAgentMutation])

  const deleteAgent = useCallback(async (id: string) => {
    return deleteAgentMutation.mutateAsync(id)
  }, [deleteAgentMutation])

  const updateAgentStatus = useCallback(async (id: string, status: AgentStatus) => {
    return updateAgentStatusMutation.mutateAsync({ id, status })
  }, [updateAgentStatusMutation])

  const updatePermissions = useCallback(async (id: string, permissions: AgentPermissions) => {
    return updatePermissionsMutation.mutateAsync({ id, permissions })
  }, [updatePermissionsMutation])

  // ✅ ACCIONES EN LOTE
  const bulkUpdateStatus = useCallback(async (agentIds: string[], status: AgentStatus) => {
    const results = await Promise.allSettled(
      agentIds.map(id => updateAgentStatus(id, status))
    )

    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length

    return { successful, failed, total: agentIds.length }
  }, [updateAgentStatus])

  const bulkDelete = useCallback(async (agentIds: string[]) => {
    const results = await Promise.allSettled(
      agentIds.map(id => deleteAgent(id))
    )

    const successful = results.filter(result => result.status === 'fulfilled').length
    const failed = results.filter(result => result.status === 'rejected').length

    return { successful, failed, total: agentIds.length }
  }, [deleteAgent])

  // ✅ ESTADO DE LOADING
  const isCreating = createAgentMutation.isPending
  const isUpdating = updateAgentMutation.isPending
  const isDeleting = deleteAgentMutation.isPending
  const isUpdatingStatus = updateAgentStatusMutation.isPending
  const isUpdatingPermissions = updatePermissionsMutation.isPending

  const isMutating = isCreating || isUpdating || isDeleting || isUpdatingStatus || isUpdatingPermissions

  return {
    // ✅ DATOS
    agents,
    total,
    hasMore,
    filters,
    selectedAgent,
    selectedAgentId,

    // ✅ ESTADO
    isLoading,
    isError,
    error,
    isMutating,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingStatus,
    isUpdatingPermissions,

    // ✅ ACCIONES
    createAgent,
    updateAgent,
    deleteAgent,
    updateAgentStatus,
    updatePermissions,
    bulkUpdateStatus,
    bulkDelete,

    // ✅ UTILIDADES
    updateFilters,
    resetFilters,
    loadMore,
    refresh,
    selectAgent
  }
}

/**
 * 🎯 HOOK PARA AGENTE INDIVIDUAL
 */
export function useAgent(agentId: string) {
  const queryClient = useQueryClient()

  const {
    data: agentData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => agentsService.getAgent(agentId),
    enabled: !!agentId,
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false
  })

  const agent = agentData?.agent

  // ✅ ACTUALIZAR AGENTE
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Agent>) =>
      agentsService.updateAgent(agentId, updates),
    onSuccess: (response: AgentResponse) => {
      if (response.success) {
        queryClient.setQueryData(['agent', agentId], response.agent)
        queryClient.invalidateQueries({ queryKey: ['agents'] })
      }
    }
  })

  const updateAgent = useCallback(async (updates: Partial<Agent>) => {
    return updateMutation.mutateAsync(updates)
  }, [updateMutation])

  return {
    agent,
    isLoading,
    isError,
    error,
    isUpdating: updateMutation.isPending,
    updateAgent,
    refresh: refetch
  }
}

/**
 * 🎯 HOOK PARA MÉTRICAS DE AGENTE
 */
export function useAgentMetrics(agentId: string, period: 'day' | 'week' | 'month' = 'week') {
  const {
    data: metricsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['agent-metrics', agentId, period],
    queryFn: () => agentsService.getAgentMetrics(agentId, period),
    enabled: !!agentId,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // Actualizar cada minuto
    refetchOnWindowFocus: false
  })

  const metrics = metricsData?.metrics
  const historical = metricsData?.historical || []

  return {
    metrics,
    historical,
    isLoading,
    isError,
    error,
    refresh: refetch
  }
}

/**
 * 🎯 HOOK PARA ESTADÍSTICAS GLOBALES
 */
export function useAgentStats() {
  const {
    data: statsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['agent-stats'],
    queryFn: () => agentsService.getAgentStats(),
    staleTime: 60000, // 1 minuto
    refetchInterval: 120000, // Actualizar cada 2 minutos
    refetchOnWindowFocus: false
  })

  return {
    stats: statsData?.stats,
    isLoading,
    error,
    refresh: refetch
  }
}

/**
 * 🎯 HOOK PARA EQUIPOS
 */
export function useAgentTeams() {
  const queryClient = useQueryClient()

  const {
    data: teamsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['agent-teams'],
    queryFn: () => agentsService.getTeams(),
    staleTime: 300000, // 5 minutos
    refetchOnWindowFocus: false
  })

  const teams = teamsData?.teams || []

  // ✅ CREAR EQUIPO
  const createTeamMutation = useMutation({
    mutationFn: agentsService.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-teams'] })
    }
  })

  // ✅ ACTUALIZAR EQUIPO
  const updateTeamMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<AgentTeam> }) =>
      agentsService.updateTeam(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-teams'] })
    }
  })

  const createTeam = useCallback(async (teamData: Omit<AgentTeam, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createTeamMutation.mutateAsync(teamData)
  }, [createTeamMutation])

  const updateTeam = useCallback(async (id: string, updates: Partial<AgentTeam>) => {
    return updateTeamMutation.mutateAsync({ id, updates })
  }, [updateTeamMutation])

  return {
    teams,
    isLoading,
    isError,
    error,
    isMutating: createTeamMutation.isPending || updateTeamMutation.isPending,
    createTeam,
    updateTeam,
    refresh: refetch
  }
}

/**
 * 🎯 HOOK PARA ROLES
 */
export function useAgentRoles() {
  const queryClient = useQueryClient()

  const {
    data: rolesData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['agent-roles'],
    queryFn: () => agentsService.getRoles(),
    staleTime: 600000, // 10 minutos
    refetchOnWindowFocus: false
  })

  const roles = rolesData?.roles || []

  // ✅ CREAR ROL
  const createRoleMutation = useMutation({
    mutationFn: agentsService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-roles'] })
    }
  })

  // ✅ ACTUALIZAR ROL
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<AgentRole> }) =>
      agentsService.updateRole(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-roles'] })
    }
  })

  const createRole = useCallback(async (roleData: Omit<AgentRole, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createRoleMutation.mutateAsync(roleData)
  }, [createRoleMutation])

  const updateRole = useCallback(async (id: string, updates: Partial<AgentRole>) => {
    return updateRoleMutation.mutateAsync({ id, updates })
  }, [updateRoleMutation])

  return {
    roles,
    isLoading,
    isError,
    error,
    isMutating: createRoleMutation.isPending || updateRoleMutation.isPending,
    createRole,
    updateRole,
    refresh: refetch
  }
}

/**
 * 🎯 HOOK PARA ANÁLISIS DE IA
 */
export function useAgentAIAnalysis(agentId: string) {
  const {
    data: analysisData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['agent-ai-analysis', agentId],
    queryFn: () => agentsService.getAIAnalysis(agentId),
    enabled: !!agentId,
    staleTime: 300000, // 5 minutos
    refetchOnWindowFocus: false
  })

  const analysis = analysisData?.analysis

  // ✅ GENERAR NUEVO ANÁLISIS
  const generateAnalysisMutation = useMutation({
    mutationFn: () => agentsService.generateAIAnalysis(agentId),
    onSuccess: () => {
      refetch()
    }
  })

  const generateAnalysis = useCallback(async () => {
    return generateAnalysisMutation.mutateAsync()
  }, [generateAnalysisMutation])

  return {
    analysis,
    isLoading,
    isError,
    error,
    isGenerating: generateAnalysisMutation.isPending,
    generateAnalysis,
    refresh: refetch
  }
}

/**
 * 🎯 HOOK PARA TIEMPO REAL (WebSocket)
 */
export function useAgentRealTime(agentId?: string) {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = agentsService.connectRealTime(agentId)
        
        ws.onopen = () => {
          setIsConnected(true)
          console.log('🔗 WebSocket conectado para agentes')
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setLastUpdate(new Date())
            
            switch (data.type) {
              case 'agent_updated':
                queryClient.setQueryData(['agent', data.agentId], data.agent)
                queryClient.invalidateQueries({ queryKey: ['agents'] })
                break
                
              case 'metrics_updated':
                queryClient.setQueryData(['agent-metrics', data.agentId], data.metrics)
                break
                
              case 'status_changed':
                queryClient.invalidateQueries({ queryKey: ['agents'] })
                queryClient.invalidateQueries({ queryKey: ['agent-stats'] })
                break
                
              default:
                console.log('📡 Evento WebSocket no manejado:', data.type)
            }
          } catch (error) {
            console.error('❌ Error procesando mensaje WebSocket:', error)
          }
        }
        
        ws.onclose = () => {
          setIsConnected(false)
          console.log('🔌 WebSocket desconectado')
          
          // Reconectar después de 5 segundos
          setTimeout(connectWebSocket, 5000)
        }
        
        ws.onerror = (error) => {
          console.error('❌ Error en WebSocket:', error)
        }
        
        return ws
      } catch (error) {
        console.error('❌ Error conectando WebSocket:', error)
        return null
      }
    }

    const ws = connectWebSocket()
    
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [agentId, queryClient])

  return {
    isConnected,
    lastUpdate
  }
}

/**
 * 🎯 HOOK PARA COMPARACIÓN DE AGENTES
 */
export function useAgentComparison(agentIds: string[]) {
  const {
    data: comparisonData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['agent-comparison', agentIds.sort()],
    queryFn: () => agentsService.compareAgents(agentIds),
    enabled: agentIds.length > 1,
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false
  })

  return {
    comparison: comparisonData?.comparison,
    isLoading,
    isError,
    error,
    refresh: refetch
  }
} 