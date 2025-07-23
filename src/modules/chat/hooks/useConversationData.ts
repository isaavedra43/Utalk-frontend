// Hook para obtener datos específicos de conversación y contacto
// Usado por ChatWindow e InfoPanel para obtener datos reales del backend
import { useQuery } from '@tanstack/react-query'
import { useConversation } from './useConversations'
import conversationService from '../services/conversationService'
import { logger } from '@/lib/logger'

// Hook para obtener datos completos de una conversación (incluye contacto)
export function useConversationData(conversationId?: string) {
  const conversationQuery = useConversation(conversationId || '')

  const result = useQuery({
    queryKey: ['conversation-data', conversationId],
    queryFn: async () => {
      if (!conversationId) return null
      
      console.log('🔍 useConversationData: Fetching data for conversation:', conversationId)
      
      // Obtener conversación completa
      const conversationResponse = await conversationService.getConversation(conversationId)
      const conversation = conversationResponse.conversation
      
      console.log('📦 useConversationData: Conversation data:', conversation)
      
      // Extraer datos del contacto desde la conversación
      const contact = conversation.contact
      
      return {
        conversation,
        contact,
        // Datos derivados para facilitar el uso en componentes
        isOnline: contact?.isOnline || false,
        channel: conversation.channel,
        status: conversation.status,
        assignedTo: conversation.assignedTo,
        unreadCount: conversation.unreadCount,
        priority: conversation.priority,
        isMuted: conversation.isMuted,
        lastMessage: conversation.lastMessage,
        tags: conversation.tags,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    },
    enabled: !!conversationId && conversationQuery.isSuccess,
    staleTime: 5 * 60 * 1000, // ✅ OPTIMIZACIÓN: 5 minutos antes de considerar stale
    refetchInterval: 5 * 60 * 1000, // ✅ OPTIMIZACIÓN: Refetch cada 5 minutos
    onSuccess: (data) => {
      console.log('✅ useConversationData: Success:', {
        conversationId,
        hasContact: !!data?.contact,
        hasConversation: !!data?.conversation,
        contactName: data?.contact?.name,
        status: data?.status
      })
    },
    onError: (error) => {
      console.error('❌ useConversationData: Error:', error)
    }
  })

  // Log del estado del hook
  console.log('📊 useConversationData hook state:', {
    conversationId,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    dataExists: !!result.data,
    hasContact: !!result.data?.contact,
    hasConversation: !!result.data?.conversation
  })

  logger.hook('useConversationData', {
    input: { conversationId },
    loading: result.isLoading,
    error: result.error,
    output: result.data ? {
      hasContact: !!result.data.contact,
      hasConversation: !!result.data.conversation,
      contactName: result.data.contact?.name,
      status: result.data.status
    } : undefined
  })

  return result
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