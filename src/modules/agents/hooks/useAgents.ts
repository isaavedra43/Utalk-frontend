// Hook para manejar agentes IA  
// Simplificado sin react-query
import { useState, useEffect } from 'react'
import { Agent } from '../types'
import { agentsService } from '../services/agentsService'
import { logger, createLogContext } from '@/lib/logger'

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAgents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await agentsService.getAgents()
      if (result.success) {
        setAgents(result.agents || [])
      } else {
        setError('Error al cargar agentes')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      logger.error('MODULE', 'Error loading agents', createLogContext({
        error: errorMessage
      }))
    } finally {
      setLoading(false)
    }
  }

  const createAgent = async (agentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await agentsService.createAgent(agentData)
      if (result.success && result.agent) {
        setAgents(prev => [...prev, result.agent])
        return result.agent
      } else {
        setError('Error al crear agente')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return null
    }
  }

  const updateAgent = async (id: string, agentData: Partial<Agent>) => {
    try {
      const result = await agentsService.updateAgent(id, agentData)
      if (result.success && result.agent) {
        setAgents(prev => 
          prev.map(agent => 
            agent.id === id ? { ...agent, ...result.agent } : agent
          )
        )
        return result.agent
      } else {
        setError('Error al actualizar agente')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return null
    }
  }

  useEffect(() => {
    loadAgents()
  }, [])

  return {
    agents,
    loading,
    error,
    refetch: loadAgents,
    createAgent,
    updateAgent
  }
}
