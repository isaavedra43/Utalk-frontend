// Hook para gestionar conversaciones con React Query
// Conecta con conversationService para obtener datos del backend UTalk
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ConversationFilter } from '../types'
import conversationService from '../services/conversationService'
import { logger } from '@/lib/logger'

// Claves de query para invalidaciones y cache
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filter: ConversationFilter) => [...conversationKeys.lists(), filter] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  stats: () => [...conversationKeys.all, 'stats'] as const,
}

// Hook principal para obtener conversaciones con filtros
export function useConversations(filter: ConversationFilter = {}) {
  const result = useQuery({
    queryKey: conversationKeys.list(filter),
    queryFn: async () => {
      console.log('🔄 useConversations: Starting fetch with filter:', filter)
      const response = await conversationService.getConversations(filter)
      console.log('📦 useConversations: Service response:', response)
      return response
    },
    staleTime: 30 * 1000, // 30 segundos antes de considerar stale
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Refetch cada minuto para conversaciones activas
    onSuccess: (data) => {
      console.log('✅ useConversations: Query success:', {
        total: data.total,
        conversationsCount: data.conversations.length,
        conversations: data.conversations
      })
    },
    onError: (error) => {
      console.error('❌ useConversations: Query error:', error)
    }
  })

  // Log del estado del hook
  console.log('📊 useConversations hook state:', {
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    dataExists: !!result.data,
    conversationsCount: result.data?.conversations?.length || 0
  })

  logger.hook('useConversations', {
    input: { filter },
    loading: result.isLoading,
    error: result.error,
    dataLength: result.data?.conversations?.length,
    output: result.data ? { 
      total: result.data.total,
      conversationsCount: result.data.conversations?.length 
    } : undefined
  })

  return result
}

// Hook para obtener una conversación específica
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: conversationKeys.detail(conversationId),
    queryFn: () => conversationService.getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  })
}

// Hook para obtener estadísticas de conversaciones
export function useConversationStats() {
  return useQuery({
    queryKey: conversationKeys.stats(),
    queryFn: () => conversationService.getConversationStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para marcar conversación como leída
export function useMarkConversationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => 
      conversationService.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) })
    },
  })
}

// Hook para asignar conversación a agente
export function useAssignConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, agentId }: { conversationId: string; agentId: string }) =>
      conversationService.assignConversation(conversationId, agentId),
    onSuccess: (_, { conversationId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) })
    },
  })
}

// Hook para cambiar estado de conversación
export function useUpdateConversationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, status }: { conversationId: string; status: string }) =>
      conversationService.updateStatus(conversationId, status),
    onSuccess: (_, { conversationId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) })
    },
  })
}

// Hook para archivar conversación
export function useArchiveConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.archiveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversationId) })
    },
  })
}

// Hook para refrescar todas las conversaciones
export function useRefreshConversations() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })
  }
}

// Hook para optimistic updates de conversaciones
export function useOptimisticConversationUpdate() {
  const queryClient = useQueryClient()

  return {
    updateConversationOptimistically: (conversationId: string, updates: any) => {
      // Actualizar conversation detail optimísticamente
      queryClient.setQueryData(
        conversationKeys.detail(conversationId),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            conversation: { ...old.conversation, ...updates }
          }
        }
      )

      // Actualizar lista de conversaciones optimísticamente
      queryClient.setQueriesData(
        { queryKey: conversationKeys.lists() },
        (old: any) => {
          if (!old?.conversations) return old
          return {
            ...old,
            conversations: old.conversations.map((conv: any) =>
              conv.id === conversationId ? { ...conv, ...updates } : conv
            )
          }
        }
      )
    }
  }
} 