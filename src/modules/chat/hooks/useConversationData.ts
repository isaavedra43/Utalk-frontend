// Hook para obtener datos específicos de conversación y contacto
// Usado por ChatWindow e InfoPanel para obtener datos reales del backend
import { useQuery } from '@tanstack/react-query'
import { conversationService } from '../services/conversationService'

export function useConversationData(conversationId?: string) {
  const conversationQuery = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null
      
      // Como no tenemos getConversation individual, buscar por filtros
      const conversations = await conversationService.getConversations({ search: conversationId })
      return conversations.find(c => c.id === conversationId) || null
    },
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  return {
    conversation: conversationQuery.data,
    isLoading: conversationQuery.isLoading,
    error: conversationQuery.error,
    refetch: conversationQuery.refetch
  }
}

// Hook para obtener sugerencias de IA para una conversación
export function useIASuggestions(conversationId?: string) {
  return useQuery({
    queryKey: ['ia-suggestions', conversationId],
    queryFn: async () => {
      if (!conversationId) return []
      
      // TODO: Implementar llamada real al backend para sugerencias de IA
      // Por ahora retornamos sugerencias mock
      return [
        {
          id: 'suggestion_1',
          content: 'Hola, ¿en qué puedo ayudarte hoy?',
          confidence: 85,
          category: 'saludo',
          isRelevant: true
        },
        {
          id: 'suggestion_2', 
          content: 'Entiendo tu consulta. Déjame revisar los detalles.',
          confidence: 72,
          category: 'respuesta',
          isRelevant: true
        },
        {
          id: 'suggestion_3',
          content: '¿Podrías proporcionarme más información sobre tu caso?',
          confidence: 68,
          category: 'pregunta',
          isRelevant: false
        }
      ]
    },
    enabled: !!conversationId,
    staleTime: 60 * 1000, // 1 minuto
  })
}

// Hook para obtener resumen de conversación para IA
export function useConversationSummary(conversationId?: string) {
  return useQuery({
    queryKey: ['conversation-summary', conversationId],
    queryFn: async () => {
      if (!conversationId) return null
      
      // TODO: Implementar llamada real al backend para resumen de IA
      // Por ahora retornamos resumen mock
      return {
        totalMessages: 15,
        avgResponseTime: '2m 30s',
        sentiment: 'positive' as const,
        topics: ['soporte', 'producto', 'facturación'],
        lastActivity: new Date()
      }
    },
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
} 