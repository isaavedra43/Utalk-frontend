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
      console.log('🔍 conversationService.getConversations DEBUG:', {
        filters,
        filtersUsed: Object.keys(filters),
        endpoint: API_ENDPOINTS.CONVERSATIONS.LIST,
        hasParticipantEmail: !!filters.participantEmail,
        participantEmail: filters.participantEmail
      })
      
      logger.info('Fetching conversations with filters', { 
        filters,
        filtersUsed: Object.keys(filters),
        hasParticipantEmail: !!filters.participantEmail
      }, 'conversation_fetch_start')

      const params = new URLSearchParams()

      // ✅ Filtros usando EMAIL - CRÍTICO: Siempre incluir participantEmail si está presente
      if (filters.assignedTo) params.append(FILTER_PARAMS.CONVERSATIONS.ASSIGNED_TO, filters.assignedTo)
      if (filters.customerEmail) params.append(FILTER_PARAMS.CONVERSATIONS.CUSTOMER_EMAIL, filters.customerEmail)
      if (filters.participantEmail) {
        params.append(FILTER_PARAMS.CONVERSATIONS.PARTICIPANT_EMAIL, filters.participantEmail)
        console.log('✅ Agregando filtro participantEmail:', filters.participantEmail)
      }
      if (filters.status) params.append(FILTER_PARAMS.CONVERSATIONS.STATUS, filters.status)
      if (filters.channel) params.append(FILTER_PARAMS.CONVERSATIONS.CHANNEL, filters.channel)
      if (filters.dateFrom) params.append(FILTER_PARAMS.CONVERSATIONS.DATE_FROM, filters.dateFrom)
      if (filters.dateTo) params.append(FILTER_PARAMS.CONVERSATIONS.DATE_TO, filters.dateTo)

      const url = `${API_ENDPOINTS.CONVERSATIONS.LIST}?${params.toString()}`
      console.log('📞 Getting conversations with EMAIL filters:', {
        url,
        params: Object.fromEntries(params),
        fullUrl: url,
        participantEmailIncluded: params.has('participantEmail')
      })

      // ✅ PRUEBA: Simular respuesta en desarrollo si no hay backend
      if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_API_URL) {
        console.log('🧪 SIMULANDO RESPUESTA DEL BACKEND (modo desarrollo)')
        return this.getMockConversations(filters)
      }

      const response = await apiClient.get(url)
      console.log('📥 conversationService: Raw response from backend:', {
        status: response.status,
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        responseKeys: response.data ? Object.keys(response.data) : []
      })
      
      const validatedConversations = ConversationValidator.validateBackendResponse(response)
      console.log('✅ conversationService: Validated conversations:', {
        count: validatedConversations.length,
        participantEmail: filters.participantEmail,
        conversations: validatedConversations.map(c => ({ 
          id: c.id, 
          contact: c.contact?.name, 
          status: c.status,
          assignedTo: c.assignedTo?.id
        }))
      })

      logger.success('Conversations fetched successfully', {
        count: validatedConversations.length,
        hasFilters: Object.keys(filters).length > 0,
        participantEmail: filters.participantEmail
      }, 'conversation_fetch_success')

      return validatedConversations
    } catch (error) {
      console.error('❌ conversationService ERROR:', error)
      logger.error('Failed to fetch conversations', { 
        error, 
        filters,
        participantEmail: filters.participantEmail 
      }, 'conversation_fetch_error')
      throw error
    }
  }

  /**
   * ✅ Generar conversaciones mock para desarrollo
   */
  private getMockConversations(filters: ConversationFilter): CanonicalConversation[] {
    console.log('🎭 Generando conversaciones mock con filtros:', filters)
    
    const mockConversations: CanonicalConversation[] = [
      {
        id: 'conv-1',
        title: 'Soporte Técnico - Problema con facturación',
        status: 'open',
        priority: 'medium',
        contact: {
          id: 'contact-1',
          name: 'Juan Pérez',
          phone: '+1234567890',
          email: 'juan@test.com',
          isOnline: true,
          tags: ['cliente', 'premium'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isBlocked: false,
          preferences: {
            language: 'es',
            timezone: 'America/Mexico_City',
            notifications: true
          }
        },
        channel: 'whatsapp',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        messageCount: 15,
        unreadCount: 2,
        assignedTo: {
          id: filters.participantEmail || 'user@example.com',
          name: 'Usuario Test',
          role: 'agent'
        },
        lastMessage: {
          id: 'msg-1',
          content: 'Hola, ¿cómo puedo ayudarte con tu problema de facturación?',
          timestamp: new Date(),
          senderName: 'Usuario Test',
          type: 'text'
        },
        tags: ['soporte', 'facturación'],
        isMuted: false,
        isArchived: false,
        metadata: {
          source: 'whatsapp',
          satisfaction: 4
        }
      },
      {
        id: 'conv-2',
        title: 'Venta - Consulta sobre productos',
        status: 'pending',
        priority: 'high',
        contact: {
          id: 'contact-2',
          name: 'María García',
          phone: '+1987654321',
          email: 'maria@test.com',
          isOnline: false,
          tags: ['prospecto', 'ventas'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isBlocked: false,
          preferences: {
            language: 'es',
            timezone: 'America/Mexico_City',
            notifications: true
          }
        },
        channel: 'telegram',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        messageCount: 8,
        unreadCount: 1,
        assignedTo: {
          id: filters.participantEmail || 'user@example.com',
          name: 'Usuario Test',
          role: 'agent'
        },
        lastMessage: {
          id: 'msg-2',
          content: '¿Podrías enviarme información sobre los precios?',
          timestamp: new Date(),
          senderName: 'María García',
          type: 'text'
        },
        tags: ['ventas', 'productos'],
        isMuted: false,
        isArchived: false,
        metadata: {
          source: 'telegram',
          satisfaction: 5
        }
      }
    ]

    // ✅ Filtrar por participante si se especifica
    if (filters.participantEmail) {
      const filtered = mockConversations.filter(conv => 
        conv.assignedTo?.id === filters.participantEmail
      )
      console.log(`🎭 Filtrado por participante ${filters.participantEmail}:`, filtered.length)
      return filtered
    }

    return mockConversations
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