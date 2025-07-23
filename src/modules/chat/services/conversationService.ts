// Servicio para conversaciones - Conecta con API real de UTalk Backend
// Abstrae las llamadas a /api/conversations del backend
// ✅ ALINEADO 100% CON ESTRUCTURA CANÓNICA - Validación obligatoria
import { apiClient } from '@/services/apiClient'
import { Conversation, ConversationFilter } from '../types'
import { ConversationValidator } from '@/lib/validation'

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

  // Obtener lista de conversaciones con filtros
  async getConversations(filter: ConversationFilter = {}): Promise<ConversationResponse> {
    try {
      const params = new URLSearchParams()
      
      // Aplicar filtros según el backend UTalk
      if (filter.status) params.append('status', filter.status)
      if (filter.assignedTo) params.append('assignedTo', filter.assignedTo)
      if (filter.search) params.append('search', filter.search)
      if (filter.unreadOnly) params.append('unreadOnly', 'true')
      
      const queryString = params.toString()
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

      console.log('🔍 Fetching conversations from:', url)
      
      const response = await apiClient.get(url)
      
      console.log('📥 Raw backend response:', response)
      
      // ✅ VALIDACIÓN CANÓNICA OBLIGATORIA - Misma que MessageValidator
      const validatedConversations = ConversationValidator.validateBackendResponse(response)
      
      console.log('🛡️ ConversationValidator result:', {
        originalCount: response.conversations?.length || response.data?.length || 0,
        validatedCount: validatedConversations.length,
        validationPassed: validatedConversations.length > 0
      })
      
      // ✅ RETORNAR CONVERSACIONES VALIDADAS - Sin mapeo manual
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

  // Obtener estadísticas de conversaciones
  async getConversationStats(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/stats`)
    return response.data || response
  }

  // Marcar conversación como leída
  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${conversationId}/read`)
  }

  // Asignar conversación a agente
  async assignConversation(conversationId: string, agentId: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${conversationId}/assign`, {
      agentId
    })
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



  // Datos mock para desarrollo cuando hay problemas de autenticación
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
          id: 'agent_1',
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
            id: 'contact_1',
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
        lastMessage: {
          id: 'msg_2',
          conversationId: 'conv_mock_2',
          content: '¿Cuáles son sus precios?',
          type: 'text',
          timestamp: new Date(Date.now() - 1800000),
          sender: {
            id: 'contact_2',
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

    // ✅ CORRECCIÓN: Usar ConversationValidator para datos mock también
    const validatedMockConversations = ConversationValidator.validateBackendResponse(mockData.map(conv => ({
      ...conv,
      // Simular la estructura que vendría del backend
      contactId: conv.contact.id,
      lastMessageAt: conv.lastMessage?.timestamp.toISOString(),
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    })))

    console.log('🎭 Returning validated mock conversations for development:', validatedMockConversations)

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