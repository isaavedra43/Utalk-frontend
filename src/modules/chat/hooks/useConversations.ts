// Hook para gestión de conversaciones
// ✅ EMAIL-FIRST: Todos los identificadores usan email
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationService } from '../services/conversationService'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import type { ConversationFilter } from '../types'

// ✅ Query keys usando EMAIL
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: ConversationFilter) => [...conversationKeys.lists(), filters] as const,
  byAssigned: (email: string) => [...conversationKeys.all, 'byAssigned', email] as const,
  byParticipant: (email: string) => [...conversationKeys.all, 'byParticipant', email] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  stats: () => [...conversationKeys.all, 'stats'] as const,
}

/**
 * ✅ Hook para obtener conversaciones con filtros EMAIL-FIRST
 */
export function useConversations(filters: ConversationFilter = {}) {
  const { user } = useAuth()
  
  // ✅ CRÍTICO: Agregar email del usuario como participante automáticamente
  const userFilters = {
    ...filters,
    participantEmail: user?.email // ✅ Incluir usuario como participante
  }
  
  // 🔍 DEBUG: Log del estado del usuario
  console.log('🔍 useConversations DEBUG:', {
    userEmail: user?.email,
    userIsActive: user?.isActive,
    isAuthenticated: !!user,
    originalFilters: filters,
    userFilters,
    enabled: !!user?.email && !!user?.isActive
  })
  
  return useQuery({
    queryKey: conversationKeys.list(userFilters),
    queryFn: async () => {
      console.log('🚀 useConversations: Iniciando llamada al backend...')
      const result = await conversationService.getConversations(userFilters)
      console.log('📊 useConversations: Respuesta del backend:', {
        count: result.length,
        conversations: result.map(c => ({ id: c.id, contact: c.contact?.name, status: c.status }))
      })
      return result
    },
    enabled: !!user?.email && !!user?.isActive,
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
    onError: (error) => {
      console.error('❌ useConversations ERROR:', error)
      logger.error('Failed to fetch conversations', { filters: userFilters, error }, 'conversations_query_error')
    },
    onSuccess: (data) => {
      console.log('✅ useConversations SUCCESS:', {
        count: data.length,
        userEmail: user?.email,
        filters: userFilters,
        conversations: data.map(c => ({ id: c.id, contact: c.contact?.name, status: c.status }))
      })
      logger.info('Conversations fetched successfully', { 
        count: data.length, 
        userEmail: user?.email 
      }, 'conversations_query_success')
    }
  })
}

/**
 * ✅ Hook para obtener conversaciones asignadas a un email específico
 */
export function useConversationsByAssignedEmail(email: string) {
  return useQuery({
    queryKey: conversationKeys.byAssigned(email),
    queryFn: () => conversationService.getConversationsByAssignedEmail(email),
    enabled: !!email,
    staleTime: 1000 * 60 * 2, // 2 minutos
    onError: (error) => {
      logger.error('Failed to fetch conversations by assigned email', { email, error }, 'conversations_by_assigned_error')
    }
  })
}

/**
 * ✅ Hook para obtener conversaciones donde participa un email específico
 */
export function useConversationsByParticipantEmail(email: string) {
  return useQuery({
    queryKey: conversationKeys.byParticipant(email),
    queryFn: () => conversationService.getConversationsByParticipantEmail(email),
    enabled: !!email,
    staleTime: 1000 * 60 * 2, // 2 minutos
    onError: (error) => {
      logger.error('Failed to fetch conversations by participant email', { email, error }, 'conversations_by_participant_error')
    }
  })
}

/**
 * ✅ Hook para obtener conversaciones donde participa el usuario actual
 */
export function useConversationsByCurrentParticipant() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: conversationKeys.byParticipant(user?.email || ''),
    queryFn: () => conversationService.getConversationsByParticipantEmail(user?.email || ''),
    enabled: !!user?.email && !!user?.isActive,
    staleTime: 1000 * 60 * 2, // 2 minutos
    onError: (error) => {
      console.error('❌ useConversationsByCurrentParticipant ERROR:', error)
      logger.error('Failed to fetch conversations by current participant', { 
        userEmail: user?.email, 
        error 
      }, 'conversations_by_current_participant_error')
    },
    onSuccess: (data) => {
      console.log('✅ useConversationsByCurrentParticipant SUCCESS:', {
        count: data.length,
        userEmail: user?.email
      })
      logger.success('Conversations by current participant fetched', {
        userEmail: user?.email,
        count: data.length
      }, 'conversations_by_current_participant_success')
    }
  })
}

/**
 * ✅ Hook para asignar conversación usando email
 */
export function useAssignConversation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: ({ conversationId, agentEmail }: { conversationId: string; agentEmail: string }) =>
      conversationService.assignConversation(conversationId, agentEmail),
    onSuccess: (updatedConversation) => {
      // ✅ Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      
      // ✅ Actualizar cache específica
      queryClient.setQueryData(
        conversationKeys.detail(updatedConversation.id),
        updatedConversation
      )

      logger.success('Conversation assigned successfully', {
        conversationId: updatedConversation.id,
        agentEmail: updatedConversation.assignedTo,
        assignedBy: user?.email
      }, 'conversation_assign_success')
    },
    onError: (error, variables) => {
      logger.error('Failed to assign conversation', { 
        variables, 
        error,
        assignedBy: user?.email 
      }, 'conversation_assign_error')
    }
  })
}

/**
 * ✅ Hook para desasignar conversación
 */
export function useUnassignConversation() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.unassignConversation(conversationId),
    onSuccess: (updatedConversation) => {
      // ✅ Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      
      // ✅ Actualizar cache específica
      queryClient.setQueryData(
        conversationKeys.detail(updatedConversation.id),
        updatedConversation
      )

      logger.success('Conversation unassigned successfully', {
        conversationId: updatedConversation.id,
        unassignedBy: user?.email
      }, 'conversation_unassign_success')
    },
    onError: (error, conversationId) => {
      logger.error('Failed to unassign conversation', { 
        conversationId, 
        error,
        unassignedBy: user?.email 
      }, 'conversation_unassign_error')
    }
  })
} 