// Servicio para mensajes - Conecta con API real de UTalk Backend
// ✅ ALINEADO CON UID DE FIREBASE + FIRESTORE SYNC
// Abstrae las llamadas a /api/messages del backend
import { apiClient } from '@/services/apiClient'
import { MessageValidator } from '@/lib/validation'
import { CanonicalMessage } from '@/types/canonical'
import { API_ENDPOINTS, FILTER_PARAMS } from '@/lib/constants'

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
  senderUid?: string         // ✅ NUEVO: UID del remitente (se auto-detecta del token)
  recipientUid?: string      // ✅ NUEVO: UID del destinatario
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

  // ✅ ACTUALIZADO: Obtener mensajes con mejor logging UID
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> {
    console.log('🔍 MessageService.getMessages called with UID context:', { 
      conversationId, 
      page, 
      limit 
    });
    
    try {
      // Según la documentación, el backend usa /api/conversations/:id/messages
      const url = `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`;
      console.log('📡 Making API call to:', url);
      
      const response = await apiClient.get(url);
      console.log('📥 Raw API response:', response);
      
      // ✅ VALIDACIÓN CENTRALIZADA CON EL SISTEMA CANÓNICO
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

  // ✅ NUEVO: Obtener mensajes por remitente UID
  async getMessagesBySenderUid(uid: string, page = 1, limit = 50): Promise<MessagesResponse> {
    try {
      console.log('🔍 Fetching messages by sender UID:', uid);
      
      const response = await apiClient.get(API_ENDPOINTS.MESSAGES.BY_SENDER(uid) + `?page=${page}&limit=${limit}`);
      const validatedMessages = MessageValidator.validateBackendResponse(response);
      
      return {
        success: true,
        messages: validatedMessages,
        total: response.total || validatedMessages.length,
        page,
        limit
      };
    } catch (error) {
      console.error('❌ Error fetching messages by sender UID:', error);
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

  // ✅ NUEVO: Obtener mensajes por destinatario UID
  async getMessagesByRecipientUid(uid: string, page = 1, limit = 50): Promise<MessagesResponse> {
    try {
      console.log('🔍 Fetching messages by recipient UID:', uid);
      
      const response = await apiClient.get(API_ENDPOINTS.MESSAGES.BY_RECIPIENT(uid) + `?page=${page}&limit=${limit}`);
      const validatedMessages = MessageValidator.validateBackendResponse(response);
      
      return {
        success: true,
        messages: validatedMessages,
        total: response.total || validatedMessages.length,
        page,
        limit
      };
    } catch (error) {
      console.error('❌ Error fetching messages by recipient UID:', error);
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

  // ✅ ACTUALIZADO: Obtener todos los mensajes con filtros UID
  async getAllMessages(filters: { 
    search?: string; 
    status?: string;
    senderUid?: string;     // ✅ NUEVO: Filtrar por UID remitente
    recipientUid?: string;  // ✅ NUEVO: Filtrar por UID destinatario
    dateFrom?: string;      // ✅ NUEVO: Fecha desde
    dateTo?: string;        // ✅ NUEVO: Fecha hasta
  } = {}): Promise<MessagesResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      
      // ✅ NUEVOS: Filtros por UID
      if (filters.senderUid) {
        params.append(FILTER_PARAMS.MESSAGES.SENDER_UID, filters.senderUid)
      }
      if (filters.recipientUid) {
        params.append(FILTER_PARAMS.MESSAGES.RECIPIENT_UID, filters.recipientUid)
      }
      if (filters.dateFrom) {
        params.append(FILTER_PARAMS.MESSAGES.DATE_FROM, filters.dateFrom)
      }
      if (filters.dateTo) {
        params.append(FILTER_PARAMS.MESSAGES.DATE_TO, filters.dateTo)
      }
      
      const queryString = params.toString()
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl

      console.log('🔍 Fetching all messages with UID filters:', {
        url,
        filters,
        senderUid: filters.senderUid,
        recipientUid: filters.recipientUid
      });

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

  // ✅ ACTUALIZADO: Enviar mensaje con soporte UID
  async sendMessage(data: SendMessageData): Promise<SendMessageResponse> {
    console.log('📤 Sending message with UID context:', {
      conversationId: data.conversationId,
      senderUid: data.senderUid,
      recipientUid: data.recipientUid,
      contentLength: data.content.length,
      type: data.type
    });

    // El backend UTalk espera esta estructura con UID
    const payload = {
      conversationId: data.conversationId,
      content: data.content,
      type: data.type,
      senderUid: data.senderUid,       // ✅ UID del remitente
      recipientUid: data.recipientUid, // ✅ UID del destinatario
      media: data.media
    }

    const response = await apiClient.post(API_ENDPOINTS.MESSAGES.SEND, payload)
    
    // ✅ VALIDAR RESPUESTA DE ENVÍO TAMBIÉN
    const validatedMessages = MessageValidator.validateBackendResponse([response.data || response.message]);
    const validatedMessage = validatedMessages[0];
    
    if (!validatedMessage) {
      throw new Error('Respuesta de envío de mensaje inválida del backend');
    }
    
    console.log('✅ Message sent successfully with UID:', {
      messageId: validatedMessage.id,
      senderUid: data.senderUid,
      recipientUid: data.recipientUid
    });
    
    return {
      success: response.success || true,
      message: validatedMessage
    }
  }

  // Marcar mensaje como leído
  async markAsRead(messageId: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.MESSAGES.MARK_READ(messageId))
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

  // ✅ ACTUALIZADO: Buscar mensajes con filtros UID
  async searchMessages(query: string, filters?: {
    senderUid?: string;
    recipientUid?: string;
    conversationId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<MessagesResponse> {
    try {
      const params = new URLSearchParams()
      params.append('q', query)
      
      // ✅ Agregar filtros UID si están presentes
      if (filters?.senderUid) {
        params.append(FILTER_PARAMS.MESSAGES.SENDER_UID, filters.senderUid)
      }
      if (filters?.recipientUid) {
        params.append(FILTER_PARAMS.MESSAGES.RECIPIENT_UID, filters.recipientUid)
      }
      if (filters?.conversationId) {
        params.append(FILTER_PARAMS.MESSAGES.CONVERSATION_ID, filters.conversationId)
      }
      if (filters?.dateFrom) {
        params.append(FILTER_PARAMS.MESSAGES.DATE_FROM, filters.dateFrom)
      }
      if (filters?.dateTo) {
        params.append(FILTER_PARAMS.MESSAGES.DATE_TO, filters.dateTo)
      }
      
      const url = `${this.baseUrl}/search?${params.toString()}`
      
      console.log('🔍 Searching messages with UID filters:', {
        query,
        filters,
        url
      });
      
      const response = await apiClient.get(url)
      
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