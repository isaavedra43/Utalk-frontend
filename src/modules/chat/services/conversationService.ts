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
    const params = new URLSearchParams()
    
    // Aplicar filtros según el backend UTalk
    if (filter.status) params.append('status', filter.status)
    if (filter.assignedTo) params.append('assignedTo', filter.assignedTo)
    if (filter.search) params.append('search', filter.search)
    if (filter.unreadOnly) params.append('unreadOnly', 'true')
    
    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

    const response = await apiClient.get(url)
    
    // Mapear respuesta del backend a nuestros tipos
    return {
      success: response.success || true,
      conversations: this.mapBackendConversations(response.data || response.conversations || []),
      total: response.total || response.data?.length || 0,
      page: response.page || 1,
      limit: response.limit || 50
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
}

export const conversationService = new ConversationService()
export default conversationService 