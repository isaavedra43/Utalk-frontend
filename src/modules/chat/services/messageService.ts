// Servicio para mensajes - Conecta con API real de UTalk Backend
// Abstrae las llamadas a /api/messages del backend
import { apiClient } from '@/services/apiClient'
import { Message, MessageType } from '../types'

export interface MessagesResponse {
  success: boolean
  messages: Message[]
  total: number
  page: number
  limit: number
}

export interface SendMessageData {
  conversationId: string
  content: string
  type: MessageType
  media?: {
    url: string
    type: string
    name?: string
  }
}

export interface SendMessageResponse {
  success: boolean
  message: Message
}

class MessageService {
  private baseUrl = '/messages'

  // Obtener mensajes de una conversación específica
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> {
    console.log('🔍 MessageService.getMessages called:', { conversationId, page, limit });
    
    try {
      // Según la documentación, el backend usa /api/conversations/:id/messages
      const url = `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`;
      console.log('📡 Making API call to:', url);
      
      const response = await apiClient.get(url);
      console.log('📥 Raw API response:', response);
      
      // Examinar estructura de respuesta
      console.log('🔍 Response analysis:', {
        hasData: !!response.data,
        hasMessages: !!response.messages,
        isArray: Array.isArray(response),
        dataIsArray: Array.isArray(response.data),
        messagesIsArray: Array.isArray(response.messages),
        responseKeys: Object.keys(response || {}),
        dataKeys: response.data ? Object.keys(response.data) : 'no data',
        firstMessage: response.data?.[0] || response.messages?.[0] || 'no messages found'
      });
      
      // Determinar cual estructura usar
      let rawMessages = [];
      if (response.data && Array.isArray(response.data)) {
        rawMessages = response.data;
        console.log('✅ Using response.data array with', rawMessages.length, 'messages');
      } else if (response.messages && Array.isArray(response.messages)) {
        rawMessages = response.messages;
        console.log('✅ Using response.messages array with', rawMessages.length, 'messages');
      } else if (Array.isArray(response)) {
        rawMessages = response;
        console.log('✅ Using direct response array with', rawMessages.length, 'messages');
      } else {
        console.warn('⚠️ No valid messages array found in response');
        rawMessages = [];
      }
      
      console.log('📝 Raw messages before mapping:', rawMessages.slice(0, 2));
      
      const mappedMessages = this.mapBackendMessages(rawMessages);
      console.log('🔄 Mapped messages:', mappedMessages.slice(0, 2));
      
      const result = {
        success: response.success || true,
        messages: mappedMessages,
        total: response.total || rawMessages.length || 0,
        page: response.page || page,
        limit: response.limit || limit
      };
      
      console.log('✅ MessageService.getMessages result:', {
        success: result.success,
        messagesCount: result.messages.length,
        total: result.total,
        page: result.page,
        limit: result.limit
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ MessageService.getMessages error:', error);
      throw error;
    }
  }

  // Obtener todos los mensajes con filtros
  async getAllMessages(filters: { search?: string, status?: string } = {}): Promise<MessagesResponse> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    
    const queryString = params.toString()
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

    const response = await apiClient.get(url)
    
    return {
      success: response.success || true,
      messages: this.mapBackendMessages(response.data || response.messages || []),
      total: response.total || response.data?.length || 0,
      page: response.page || 1,
      limit: response.limit || 50
    }
  }

  // Enviar mensaje
  async sendMessage(data: SendMessageData): Promise<SendMessageResponse> {
    // El backend UTalk espera esta estructura según la documentación
    const payload = {
      conversationId: data.conversationId,
      content: data.content,
      type: data.type,
      media: data.media
    }

    const response = await apiClient.post(`${this.baseUrl}/send`, payload)
    
    return {
      success: response.success || true,
      message: this.mapBackendMessage(response.data || response.message)
    }
  }

  // Marcar mensaje como leído
  async markAsRead(messageId: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${messageId}/read`)
  }

  // Marcar múltiples mensajes como leídos
  async markMultipleAsRead(messageIds: string[]): Promise<void> {
    await apiClient.put(`${this.baseUrl}/read-multiple`, {
      messageIds
    })
  }

  // Actualizar estado de mensaje
  async updateStatus(messageId: string, status: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${messageId}/status`, {
      status
    })
  }

  // Obtener estadísticas de mensajes
  async getMessageStats(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/stats`)
    return response.data || response
  }

  // Buscar mensajes
  async searchMessages(query: string): Promise<MessagesResponse> {
    const response = await apiClient.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`)
    
    return {
      success: response.success || true,
      messages: this.mapBackendMessages(response.data || response.messages || []),
      total: response.total || response.data?.length || 0,
      page: 1,
      limit: 50
    }
  }

  // Mapear mensaje del backend a nuestro tipo Message
  private mapBackendMessage(backendMessage: any): Message {
    return {
      id: backendMessage.id,
      conversationId: backendMessage.conversationId,
      content: backendMessage.content,
      type: this.mapMessageType(backendMessage.type),
      timestamp: new Date(backendMessage.timestamp),
      sender: {
        id: backendMessage.sender?.id || 'unknown',
        name: backendMessage.sender?.name || 'Usuario',
        type: this.mapSenderType(backendMessage.direction),
        avatar: backendMessage.sender?.avatar
      },
      attachments: backendMessage.media ? [{
        id: backendMessage.id + '_media',
        name: backendMessage.media.name || 'Archivo',
        url: backendMessage.media.url,
        type: backendMessage.media.type,
        size: 0 // El backend UTalk no incluye size
      }] : undefined,
      isRead: backendMessage.status === 'read',
      isDelivered: ['delivered', 'read'].includes(backendMessage.status),
      metadata: {
        twilioSid: backendMessage.twilioSid,
        userId: backendMessage.userId,
        direction: backendMessage.direction,
        originalStatus: backendMessage.status
      }
    }
  }

  private mapBackendMessages(backendMessages: any[]): Message[] {
    return backendMessages.map(msg => this.mapBackendMessage(msg))
  }

  // Mapear tipos de mensaje del backend a nuestros tipos
  private mapMessageType(backendType: string): MessageType {
    const typeMap: Record<string, MessageType> = {
      'text': 'text',
      'image': 'image',
      'document': 'file',
      'audio': 'audio',
      'video': 'video',
      'location': 'location',
      'sticker': 'sticker'
    }
    return typeMap[backendType] || 'text'
  }

  // Mapear dirección del mensaje a tipo de remitente
  private mapSenderType(direction: string): 'contact' | 'agent' | 'bot' {
    switch (direction) {
      case 'inbound':
        return 'contact'
      case 'outbound':
        return 'agent'
      default:
        return 'agent'
    }
  }

  // Mapeo de tipos de mensaje para backend (reservado para uso futuro)
  // private mapToBackendType(frontendType: MessageType): string {
  //   const typeMap: Record<MessageType, string> = {
  //     text: 'text',
  //     image: 'image',
  //     file: 'document',
  //     audio: 'audio',
  //     video: 'video',
  //     location: 'location',
  //     sticker: 'sticker'
  //   }
  //   return typeMap[frontendType] || 'text'
  // }
}

export const messageService = new MessageService()
export default messageService 