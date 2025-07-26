// Servicio para conversaciones - Conecta con API real de UTalk Backend
// ✅ ALINEADO CON UID DE FIREBASE + FIRESTORE SYNC
// Abstrae las llamadas a /api/conversations del backend
import { apiClient } from '@/services/apiClient'
import { Conversation, ConversationFilter } from '../types'
import { ConversationValidator } from '@/lib/validation'
import { API_ENDPOINTS, FILTER_PARAMS } from '@/lib/constants'

export interface ConversationResponse {
  success: boolean
  conversations: Conversation[]
  total: number
  page: number
  limit: number
}

export interface SingleConversationResponse {
  success: boolean
  conversation: Conversation
}

class ConversationService {
  private baseUrl = '/conversations'

  // ✅ ACTUALIZADO: Obtener lista de conversaciones con filtros usando UID
  async getConversations(filter: ConversationFilter = {}): Promise<ConversationResponse> {
    try {
      const params = new URLSearchParams()
      
      // ✅ CRÍTICO: Usar UID para filtros (no phone ni otros identificadores)
      if (filter.assignedTo) {
        params.append(FILTER_PARAMS.CONVERSATIONS.ASSIGNED_TO, filter.assignedTo) // ✅ UID del agente
      }
      
      if (filter.customerUid) {
        params.append(FILTER_PARAMS.CONVERSATIONS.CUSTOMER_UID, filter.customerUid) // ✅ UID del cliente
      }
      
      if (filter.participantUid) {
        params.append(FILTER_PARAMS.CONVERSATIONS.PARTICIPANT, filter.participantUid) // ✅ UID participante
      }
      
      if (filter.status) {
        params.append(FILTER_PARAMS.CONVERSATIONS.STATUS, filter.status)
      }
      
      if (filter.channel) {
        params.append(FILTER_PARAMS.CONVERSATIONS.CHANNEL, filter.channel)
      }
      
      if (filter.search) {
        params.append('search', filter.search)
      }
      
      if (filter.unreadOnly) {
        params.append('unreadOnly', 'true')
      }
      
      if (filter.dateFrom) {
        params.append(FILTER_PARAMS.CONVERSATIONS.DATE_FROM, filter.dateFrom)
      }
      
      if (filter.dateTo) {
        params.append(FILTER_PARAMS.CONVERSATIONS.DATE_TO, filter.dateTo)
      }
      
      const queryString = params.toString()
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

      console.log('🔍 Fetching conversations with UID filters:', {
        url,
        filters: filter,
        assignedToUid: filter.assignedTo,
        customerUid: filter.customerUid
      })
      
      const response = await apiClient.get(url)
      
      console.log('📥 Raw backend response:', response)
      
      // ✅ VALIDACIÓN CANÓNICA OBLIGATORIA
      const validatedConversations = ConversationValidator.validateBackendResponse(response)
      
      console.log('🛡️ ConversationValidator result:', {
        originalCount: response.conversations?.length || response.data?.length || 0,
        validatedCount: validatedConversations.length,
        validationPassed: validatedConversations.length > 0,
        uidFiltersApplied: {
          assignedTo: !!filter.assignedTo,
          customerUid: !!filter.customerUid,
          participantUid: !!filter.participantUid
        }
      })
      
      // ✅ RETORNAR CONVERSACIONES VALIDADAS
      return {
        success: response.success || true,
        conversations: validatedConversations,
        total: validatedConversations.length,
        page: response.page || 1,
        limit: response.limit || 50
      }
    } catch (error: any) {
      console.error('❌ Error fetching conversations:', error)
      
      // Si hay error de autenticación o backend, devolver datos mock para desarrollo
      if (error.response?.status === 401) {
        console.log('🔐 Authentication required - returning mock data for development')
        return this.getMockConversations()
      }
      
      throw error
    }
  }

  // ✅ NUEVO: Obtener conversaciones asignadas a un UID específico
  async getConversationsByAssignedUid(uid: string): Promise<ConversationResponse> {
    try {
      console.log('🔍 Fetching conversations assigned to UID:', uid)
      
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.BY_ASSIGNED(uid))
      const validatedConversations = ConversationValidator.validateBackendResponse(response)
      
      return {
        success: true,
        conversations: validatedConversations,
        total: validatedConversations.length,
        page: 1,
        limit: 50
      }
    } catch (error: any) {
      console.error('❌ Error fetching conversations by assigned UID:', error)
      throw error
    }
  }

  // ✅ NUEVO: Obtener conversaciones donde participa un UID
  async getConversationsByParticipantUid(uid: string): Promise<ConversationResponse> {
    try {
      console.log('🔍 Fetching conversations for participant UID:', uid)
      
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.BY_PARTICIPANT(uid))
      const validatedConversations = ConversationValidator.validateBackendResponse(response)
      
      return {
        success: true,
        conversations: validatedConversations,
        total: validatedConversations.length,
        page: 1,
        limit: 50
      }
    } catch (error: any) {
      console.error('❌ Error fetching conversations by participant UID:', error)
      throw error
    }
  }

  // Obtener conversación específica
  async getConversation(conversationId: string): Promise<SingleConversationResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${conversationId}`)
    
    // ✅ VALIDACIÓN CANÓNICA PARA CONVERSACIÓN INDIVIDUAL
    const validatedConversations = ConversationValidator.validateBackendResponse([response.data || response.conversation])
    const validatedConversation = validatedConversations[0]
    
    if (!validatedConversation) {
      throw new Error('Conversación inválida o no encontrada')
    }
    
    return {
      success: response.success || true,
      conversation: validatedConversation
    }
  }

  // ✅ ACTUALIZADO: Asignar conversación usando UID
  async assignConversation(conversationId: string, agentUid: string): Promise<void> {
    console.log('🔄 Assigning conversation to agent UID:', { conversationId, agentUid })
    
    await apiClient.put(API_ENDPOINTS.CONVERSATIONS.ASSIGN(conversationId), {
      assignedTo: agentUid  // ✅ Usa UID en lugar de agentId
    })
    
    console.log('✅ Conversation assigned successfully to UID:', agentUid)
  }

  // ✅ ACTUALIZADO: Desasignar conversación
  async unassignConversation(conversationId: string): Promise<void> {
    console.log('🔄 Unassigning conversation:', conversationId)
    
    await apiClient.put(API_ENDPOINTS.CONVERSATIONS.UNASSIGN(conversationId), {
      assignedTo: null
    })
    
    console.log('✅ Conversation unassigned successfully')
  }

  // Obtener estadísticas de conversaciones
  async getConversationStats(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/stats`)
    return response.data || response
  }

  // Marcar conversación como leída
  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${conversationId}/read`)
  }

  // Cambiar estado de conversación
  async updateStatus(conversationId: string, status: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${conversationId}/status`, {
      status
    })
  }

  // Archivar conversación
  async archiveConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${conversationId}`)
  }

  // ✅ ACTUALIZADO: Datos mock con estructura UID para desarrollo
  private getMockConversations(): ConversationResponse {
    const mockData = [
      {
        id: 'conv_mock_1',
        contact: {
          id: 'contact_1',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+1234567890',
          avatar: '',
          channel: 'whatsapp',
          tags: ['cliente'],
          isOnline: true,
          customFields: {}
        },
        channel: 'whatsapp',
        status: 'open',
        assignedTo: {
          uid: 'firebase_uid_agent_1',        // ✅ UID de Firebase
          id: 'firebase_uid_agent_1',         // ✅ Compatibilidad
          name: 'Agente Demo',
          avatar: ''
        },
        lastMessage: {
          id: 'msg_1',
          conversationId: 'conv_mock_1',
          content: 'Hola, necesito ayuda con mi pedido',
          type: 'text',
          timestamp: new Date(Date.now() - 300000), // 5 minutos atrás
          sender: {
            uid: 'firebase_uid_contact_1',    // ✅ UID de Firebase
            id: 'firebase_uid_contact_1',     // ✅ Compatibilidad
            name: 'Juan Pérez',
            type: 'contact'
          },
          status: 'delivered'
        },
        unreadCount: 2,
        tags: ['soporte'],
        createdAt: new Date(Date.now() - 3600000), // 1 hora atrás
        updatedAt: new Date(Date.now() - 300000),
        priority: 'medium',
        isMuted: false
      },
      {
        id: 'conv_mock_2',
        contact: {
          id: 'contact_2',
          name: 'María García',
          email: 'maria@example.com',
          phone: '+0987654321',
          avatar: '',
          channel: 'email',
          tags: ['prospecto'],
          isOnline: false,
          lastSeen: new Date(Date.now() - 1800000), // 30 min atrás
          customFields: {}
        },
        channel: 'email',
        status: 'pending',
        assignedTo: {
          uid: 'firebase_uid_agent_2',        // ✅ UID de Firebase
          id: 'firebase_uid_agent_2',         // ✅ Compatibilidad
          name: 'María Admin',
          avatar: ''
        },
        lastMessage: {
          id: 'msg_2',
          conversationId: 'conv_mock_2',
          content: '¿Cuáles son sus precios?',
          type: 'text',
          timestamp: new Date(Date.now() - 1800000),
          sender: {
            uid: 'firebase_uid_contact_2',    // ✅ UID de Firebase
            id: 'firebase_uid_contact_2',     // ✅ Compatibilidad
            name: 'María García',
            type: 'contact'
          },
          status: 'delivered'
        },
        unreadCount: 0,
        tags: ['ventas'],
        createdAt: new Date(Date.now() - 7200000), // 2 horas atrás
        updatedAt: new Date(Date.now() - 1800000),
        priority: 'high',
        isMuted: false
      }
    ]

    // ✅ Usar ConversationValidator para datos mock también
    const validatedMockConversations = ConversationValidator.validateBackendResponse(mockData.map(conv => ({
      ...conv,
      contactId: conv.contact.id,
      lastMessageAt: conv.lastMessage?.timestamp.toISOString(),
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      // ✅ CRÍTICO: Asegurar que assignedTo tenga UID
      assignedTo: conv.assignedTo ? {
        ...conv.assignedTo,
        uid: conv.assignedTo.uid || conv.assignedTo.id
      } : null
    })))

    console.log('🎭 Returning validated mock conversations with UID structure:', validatedMockConversations)

    return {
      success: true,
      conversations: validatedMockConversations,
      total: validatedMockConversations.length,
      page: 1,
      limit: 50
    }
  }
}

export const conversationService = new ConversationService()
export default conversationService 