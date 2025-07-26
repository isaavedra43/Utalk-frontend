// Servicio para el manejo de conversaciones
// ✅ BACKEND PROPIO CON JWT - USA EMAIL COMO IDENTIFICADOR
import { apiClient } from '@/services/apiClient'
import { logger } from '@/lib/logger'
import { ConversationValidator } from '@/lib/validation'
import { API_ENDPOINTS, FILTER_PARAMS } from '@/lib/constants'
import type { 
  CanonicalConversation 
} from '@/types/canonical'
import type { ConversationFilter } from '../types'

/**
 * ✅ Servicio singleton para conversaciones usando EMAIL como identificador
 */
class ConversationService {
  /**
   * ✅ Obtener conversaciones con filtros (usando email)
   */
  async getConversations(filters: ConversationFilter = {}): Promise<CanonicalConversation[]> {
    try {
      logger.info('Fetching conversations with filters', { 
        filters,
        filtersUsed: Object.keys(filters)
      }, 'conversation_fetch_start')

      const params = new URLSearchParams()

      // ✅ Filtros usando EMAIL
      if (filters.assignedTo) params.append(FILTER_PARAMS.ASSIGNED_TO, filters.assignedTo)
      if (filters.customerEmail) params.append('customerEmail', filters.customerEmail)
      if (filters.participantEmail) params.append('participantEmail', filters.participantEmail)
      if (filters.status) params.append(FILTER_PARAMS.STATUS, filters.status)
      if (filters.channel) params.append(FILTER_PARAMS.CHANNEL, filters.channel)
      if (filters.dateFrom) params.append(FILTER_PARAMS.DATE_FROM, filters.dateFrom)
      if (filters.dateTo) params.append(FILTER_PARAMS.DATE_TO, filters.dateTo)

      console.log('📞 Getting conversations with EMAIL filters:', Object.fromEntries(params))

      const response = await apiClient.get(`${API_ENDPOINTS.CONVERSATIONS.LIST}?${params.toString()}`)
      const validatedConversations = ConversationValidator.validateBackendResponse(response)

      logger.success('Conversations fetched successfully', {
        count: validatedConversations.length,
        hasFilters: Object.keys(filters).length > 0
      }, 'conversation_fetch_success')

      return validatedConversations
    } catch (error) {
      logger.error('Failed to fetch conversations', error, 'conversation_fetch_error')
      throw error
    }
  }

  /**
   * ✅ Obtener conversaciones asignadas a un email específico
   */
  async getConversationsByAssignedEmail(email: string): Promise<CanonicalConversation[]> {
    try {
      logger.info('Fetching conversations by assigned email', { email }, 'conversations_by_assigned_start')
      
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.BY_ASSIGNED(email))
      const validatedConversations = ConversationValidator.validateBackendResponse(response)

      logger.success('Conversations by assigned email fetched', {
        email,
        count: validatedConversations.length
      }, 'conversations_by_assigned_success')

      return validatedConversations
    } catch (error) {
      logger.error('Failed to fetch conversations by assigned email', { email, error }, 'conversations_by_assigned_error')
      throw error
    }
  }

  /**
   * ✅ Obtener conversaciones donde participa un email específico
   */
  async getConversationsByParticipantEmail(email: string): Promise<CanonicalConversation[]> {
    try {
      logger.info('Fetching conversations by participant email', { email }, 'conversations_by_participant_start')
      
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.BY_PARTICIPANT(email))
      const validatedConversations = ConversationValidator.validateBackendResponse(response)

      logger.success('Conversations by participant email fetched', {
        email,
        count: validatedConversations.length
      }, 'conversations_by_participant_success')

      return validatedConversations
    } catch (error) {
      logger.error('Failed to fetch conversations by participant email', { email, error }, 'conversations_by_participant_error')
      throw error
    }
  }

  /**
   * ✅ Asignar conversación a un agente (usando email)
   */
  async assignConversation(conversationId: string, agentEmail: string): Promise<CanonicalConversation> {
    try {
      logger.info('Assigning conversation to agent', {
        conversationId,
        agentEmail
      }, 'conversation_assign_start')

      const response = await apiClient.patch(
        API_ENDPOINTS.CONVERSATIONS.ASSIGN(conversationId),
        { assignedTo: agentEmail }
      )

      // ✅ Validar conversación individual
      const validatedConversations = ConversationValidator.validateBackendResponse([response])
      const validatedConversation = validatedConversations[0]
      
      if (!validatedConversation) {
        throw new Error('Respuesta de asignación de conversación inválida del backend')
      }

      logger.success('Conversation assigned successfully', {
        conversationId,
        agentEmail,
        assignedTo: validatedConversation.assignedTo
      }, 'conversation_assign_success')

      return validatedConversation
    } catch (error) {
      logger.error('Failed to assign conversation', {
        conversationId,
        agentEmail,
        error
      }, 'conversation_assign_error')
      throw error
    }
  }

  /**
   * ✅ Desasignar conversación
   */
  async unassignConversation(conversationId: string): Promise<CanonicalConversation> {
    try {
      logger.info('Unassigning conversation', { conversationId }, 'conversation_unassign_start')

      const response = await apiClient.patch(
        API_ENDPOINTS.CONVERSATIONS.ASSIGN(conversationId),
        { assignedTo: null }
      )

      // ✅ Validar conversación individual
      const validatedConversations = ConversationValidator.validateBackendResponse([response])
      const validatedConversation = validatedConversations[0]
      
      if (!validatedConversation) {
        throw new Error('Respuesta de desasignación de conversación inválida del backend')
      }

      logger.success('Conversation unassigned successfully', {
        conversationId,
        assignedTo: validatedConversation.assignedTo
      }, 'conversation_unassign_success')

      return validatedConversation
    } catch (error) {
      logger.error('Failed to unassign conversation', { conversationId, error }, 'conversation_unassign_error')
      throw error
    }
  }
}

// ✅ Exportar instancia singleton
export const conversationService = new ConversationService() 