// Servicio para conversaciones - Conecta con API real de UTalk Backend
// Abstrae las llamadas a /api/conversations del backend
import { apiClient } from '@/services/apiClient'
import { Conversation, ConversationFilter } from '../types'

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
      
      // Manejar diferentes estructuras de respuesta del backend
      let conversations = []
      let total = 0
      
      if (response.conversations) {
        // Formato: { conversations: [...], total: number }
        conversations = response.conversations
        total = response.total || response.conversations.length
        console.log('✅ Using response.conversations format')
      } else if (response.data && Array.isArray(response.data)) {
        // Formato: { data: [...] }
        conversations = response.data
        total = response.data.length
        console.log('✅ Using response.data array format')
      } else if (Array.isArray(response)) {
        // Formato directo: [...]
        conversations = response
        total = response.length
        console.log('✅ Using direct array format')
      } else {
        console.warn('⚠️ Unexpected response format:', response)
        conversations = []
        total = 0
      }
      
      console.log(`📊 Processing ${conversations.length} conversations`)
      
      const mappedConversations = this.mapBackendConversations(conversations)
      
      console.log('🎯 Final mapped conversations:', mappedConversations)
      
      // Mapear respuesta del backend a nuestros tipos
      return {
        success: response.success || true,
        conversations: mappedConversations,
        total: total,
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
    
    return {
      success: response.success || true,
      conversation: this.mapBackendConversation(response.data || response.conversation)
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

  // Mapear datos del backend a nuestro tipo Conversation
  private mapBackendConversation(backendConv: any): Conversation {
    // El backend UTalk usa esta estructura según la documentación
    return {
      id: backendConv.id,
      contact: {
        id: backendConv.contactId || backendConv.contact?.id,
        name: backendConv.contact?.name || 'Sin nombre',
        email: backendConv.contact?.email,
        phone: backendConv.contact?.phone,
        avatar: backendConv.contact?.avatar,
        channel: this.mapChannel(backendConv.contact?.channel || 'whatsapp'),
        tags: backendConv.contact?.tags || [],
        isOnline: backendConv.contact?.isActive || false,
        lastSeen: backendConv.contact?.lastContactAt ? new Date(backendConv.contact.lastContactAt) : undefined,
        customFields: backendConv.contact?.customFields || {}
      },
      channel: this.mapChannel(backendConv.contact?.channel || 'whatsapp'),
      status: this.mapStatus(backendConv.status),
      assignedTo: backendConv.assignedTo ? {
        id: backendConv.assignedTo.id,
        name: backendConv.assignedTo.name,
        avatar: backendConv.assignedTo.avatar
      } : undefined,
      lastMessage: backendConv.lastMessage ? {
        id: backendConv.lastMessage.id,
        conversationId: backendConv.id,
        content: backendConv.lastMessage.content,
        type: this.mapMessageType(backendConv.lastMessage.type),
        timestamp: new Date(backendConv.lastMessage.timestamp),
        sender: {
          id: backendConv.lastMessage.sender?.id || 'unknown',
          name: backendConv.lastMessage.sender?.name || 'Usuario',
          type: backendConv.lastMessage.direction === 'inbound' ? 'contact' : 'agent',
          avatar: backendConv.lastMessage.sender?.avatar
        },
        isRead: backendConv.lastMessage.status === 'read',
        isDelivered: ['delivered', 'read'].includes(backendConv.lastMessage.status)
      } : undefined,
      unreadCount: backendConv.messageCount || 0, // El backend puede tener lógica diferente
      tags: backendConv.tags || [],
      createdAt: new Date(backendConv.createdAt),
      updatedAt: new Date(backendConv.updatedAt || backendConv.lastMessageAt),
      priority: 'medium', // El backend UTalk no tiene priority en el modelo
      isMuted: false // El backend UTalk no tiene muted en el modelo
    }
  }

  private mapBackendConversations(backendConversations: any[]): Conversation[] {
    return backendConversations.map(conv => this.mapBackendConversation(conv))
  }

  // Mapear canales del backend a nuestros tipos
  private mapChannel(backendChannel: string): any {
    const channelMap: Record<string, any> = {
      'whatsapp': 'whatsapp',
      'email': 'email',
      'web': 'web',
      'facebook': 'facebook',
      'instagram': 'instagram',
      'telegram': 'telegram'
    }
    return channelMap[backendChannel] || 'whatsapp'
  }

  // Mapear estados del backend a nuestros tipos
  private mapStatus(backendStatus: string): any {
    const statusMap: Record<string, any> = {
      'open': 'open',
      'closed': 'closed',
      'pending': 'pending',
      'assigned': 'assigned'
    }
    return statusMap[backendStatus] || 'open'
  }

  // Mapear tipos de mensaje del backend a nuestros tipos
  private mapMessageType(backendType: string): any {
    const typeMap: Record<string, any> = {
      'text': 'text',
      'image': 'image', 
      'document': 'file',
      'audio': 'audio',
      'video': 'video'
    }
    return typeMap[backendType] || 'text'
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

    // ✅ CORRECCIÓN: Usar el mismo mapper para datos mock y reales
    const mappedConversations = this.mapBackendConversations(mockData.map(conv => ({
      ...conv,
      // Simular la estructura que vendría del backend
      contactId: conv.contact.id,
      lastMessageAt: conv.lastMessage?.timestamp.toISOString(),
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    })))

    console.log('🎭 Returning mapped mock conversations for development:', mappedConversations)

    return {
      success: true,
      conversations: mappedConversations,
      total: mappedConversations.length,
      page: 1,
      limit: 50
    }
  }
}

export const conversationService = new ConversationService()
export default conversationService 