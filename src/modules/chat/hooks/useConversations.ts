// Hook para gestión de conversaciones con React Query
// ✅ RESTAURADO: Versión original que funcionaba
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { conversationService } from '../services/conversationService'

/**
 * ✅ Hook principal para obtener conversaciones 
 * ✅ RESTAURADO: Implementación original con React Query
 */
export function useConversations() {
  const { isAuthenticated, isAuthLoaded, user } = useAuth()

  // ✅ QUERY PARA CONVERSACIONES - DATOS REALES
  const conversationsQuery = useQuery(['conversations'], async () => {
    console.log('🌐 [CONVERSATIONS] Iniciando fetch de conversaciones')
    
    try {
      const conversations = await conversationService.getConversations()
      
      console.log(`✅ [CONVERSATIONS] Conversaciones obtenidas: ${Array.isArray(conversations) ? conversations.length : 0}`)
      
      return conversations
    } catch (error: any) {
      console.error('❌ [CONVERSATIONS] Error obteniendo conversaciones:', error)
      throw error
    }
  }, {
    enabled: !!(isAuthenticated && isAuthLoaded && user?.email),
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  // ✅ VALIDACIÓN Y NORMALIZACIÓN
  const conversations = Array.isArray(conversationsQuery.data) ? conversationsQuery.data : []

  console.log('📊 [CONVERSATIONS] Estado de useConversations:', {
    isAuthenticated,
    isAuthLoaded,
    userEmail: user?.email,
    conversationsCount: conversations.length,
    isLoading: conversationsQuery.isLoading,
    error: conversationsQuery.error
  })

  return {
    data: conversations,
    isLoading: conversationsQuery.isLoading,
    error: conversationsQuery.error,
    refetch: conversationsQuery.refetch,
    isStale: conversationsQuery.isStale,
    isFetching: conversationsQuery.isFetching
  }
} 