// Hook para gestión de conversaciones
// ✅ REFACTORIZADO: Solo obtiene TODAS las conversaciones del backend
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { conversationService } from '../services/conversationService'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'

// ✅ CONTEXTO PARA LOGGING
const conversationsContext = getComponentContext('useConversations')

export function useConversations() {
  const { isAuthenticated, isAuthLoaded, user } = useAuth()
  const queryClient = useQueryClient()

  const context = createLogContext({
    ...conversationsContext,
    method: 'useConversations',
    data: {
      isAuthenticated,
      isAuthLoaded,
      userEmail: user?.email
    }
  })

  logger.info('API', '📥 Hook useConversations iniciado', context)

  // ✅ Validación de autenticación
  if (!isAuthLoaded) {
    logger.info('API', '⏳ Auth not loaded yet', context)
    return {
      data: [],
      isLoading: true,
      error: null,
      refetch: () => Promise.resolve()
    }
  }

  if (!isAuthenticated || !user) {
    logger.warn('API', '⚠️ User not authenticated', context)
    return {
      data: [],
      isLoading: false,
      error: new Error('Usuario no autenticado'),
      refetch: () => Promise.resolve()
    }
  }

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const queryContext = createLogContext({
        ...context,
        method: 'queryFn',
        data: { userEmail: user.email }
      })

      logger.info('API', '🔄 Fetching conversations', queryContext)

      try {
        const startTime = Date.now()
        const conversations = await conversationService.getConversations()
        const duration = Date.now() - startTime

        logger.success('CONVERSATION', 'Conversations fetched successfully', createLogContext({
          ...queryContext,
          data: {
            count: conversations?.length,
            duration
          }
        }))

        return conversations
      } catch (error) {
        logger.apiError('💥 Failed to fetch conversations', createLogContext({
          ...queryContext,
          error: error as Error
        }))
        throw error
      }
    },
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true
  })
} 