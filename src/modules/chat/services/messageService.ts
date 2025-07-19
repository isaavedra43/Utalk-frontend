// Servicio para mensajes - Conecta con API real de UTalk Backend
// Abstrae las llamadas a /api/messages del backend
// ✅ ALINEADO 100% CON ESTRUCTURA CANÓNICA - Sin mapeo manual
import { apiClient } from '@/services/apiClient'
import { MessageValidator } from '@/lib/validation'
import { CanonicalMessage } from '@/types/canonical'

// Reexportar tipo para compatibilidad
export type Message = CanonicalMessage
export type MessageType = CanonicalMessage['type']

export interface MessagesResponse {
  success: boolean
  messages: CanonicalMessage[]
  total: number
  page: number
  limit: number
  error?: string
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
  message: CanonicalMessage
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
      
      // ✅ VALIDACIÓN CENTRALIZADA CON EL SISTEMA CANÓNICO (ÚNICA FUENTE DE VERDAD)
      const validatedMessages = MessageValidator.validateBackendResponse(response);
      
      console.log('🛡️ Validation complete:', {
        originalCount: response.data?.length || response.messages?.length || 0,
        validatedCount: validatedMessages.length,
        validationPassed: validatedMessages.length > 0
      });
      
      const result: MessagesResponse = {
        success: true,
        messages: validatedMessages,
        total: response.total || validatedMessages.length,
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
      
      // ✅ RETORNAR RESPUESTA ESTRUCTURADA EN CASO DE ERROR
      return {
        success: false,
        messages: [],
        total: 0,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Obtener todos los mensajes con filtros
  async getAllMessages(filters: { search?: string, status?: string } = {}): Promise<MessagesResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      
      const queryString = params.toString()
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

      const response = await apiClient.get(url)
      
      // ✅ USAR VALIDADOR CANÓNICO EN LUGAR DE MAPEO MANUAL
      const validatedMessages = MessageValidator.validateBackendResponse(response);
      
      return {
        success: response.success || true,
        messages: validatedMessages,
        total: response.total || validatedMessages.length,
        page: response.page || 1,
        limit: response.limit || 50
      }
    } catch (error) {
      return {
        success: false,
        messages: [],
        total: 0,
        page: 1,
        limit: 50,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
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
    
    // ✅ VALIDAR RESPUESTA DE ENVÍO TAMBIÉN
    const validatedMessages = MessageValidator.validateBackendResponse([response.data || response.message]);
    const validatedMessage = validatedMessages[0];
    
    if (!validatedMessage) {
      throw new Error('Respuesta de envío de mensaje inválida del backend');
    }
    
    return {
      success: response.success || true,
      message: validatedMessage
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
    try {
      const response = await apiClient.get(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`)
      
      // ✅ USAR VALIDADOR CANÓNICO EN LUGAR DE MAPEO MANUAL
      const validatedMessages = MessageValidator.validateBackendResponse(response);
      
      return {
        success: response.success || true,
        messages: validatedMessages,
        total: response.total || validatedMessages.length,
        page: 1,
        limit: 50
      }
    } catch (error) {
      return {
        success: false,
        messages: [],
        total: 0,
        page: 1,
        limit: 50,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // ✅ TODO EL MAPEO MANUAL FUE ELIMINADO
  // El MessageValidator canónico es la ÚNICA fuente de verdad para transformación de datos
}

export const messageService = new MessageService()
export default messageService 