// Servicio para el manejo de mensajes
// ✅ EMAIL-FIRST: Todos los identificadores usan email
import { apiClient } from '@/services/apiClient'
import { logger } from '@/lib/logger'
import { MessageValidator } from '@/lib/validation'
import { API_ENDPOINTS, FILTER_PARAMS } from '@/lib/constants'
import type { 
  CanonicalMessage 
} from '@/types/canonical'

// ✅ Estructura para envío de mensajes usando EMAIL
export interface SendMessageData {
  conversationId: string
  content: string
  type?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'sticker'
  senderEmail: string    // ✅ EMAIL como identificador
  recipientEmail: string // ✅ EMAIL como identificador
  timestamp?: Date
}

/**
 * ✅ Servicio singleton para mensajes usando EMAIL como identificador
 */
class MessageService {
  /**
   * ✅ Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string): Promise<CanonicalMessage[]> {
    try {
      logger.info('Fetching messages for conversation', { conversationId }, 'messages_fetch_start')

      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId))
      const validatedMessages = MessageValidator.validateBackendResponse(response)

      logger.success('Messages fetched successfully', {
        conversationId,
        count: validatedMessages.length
      }, 'messages_fetch_success')

      return validatedMessages
    } catch (error) {
      logger.error('Failed to fetch messages', { conversationId, error }, 'messages_fetch_error')
      throw error
    }
  }

  /**
   * ✅ Obtener mensajes por email del remitente
   */
  async getMessagesBySenderEmail(senderEmail: string): Promise<CanonicalMessage[]> {
    try {
      logger.info('Fetching messages by sender email', { senderEmail }, 'messages_by_sender_start')
      
      const response = await apiClient.get(API_ENDPOINTS.MESSAGES.BY_SENDER(senderEmail))
      const validatedMessages = MessageValidator.validateBackendResponse(response)

      logger.success('Messages by sender email fetched', {
        senderEmail,
        count: validatedMessages.length
      }, 'messages_by_sender_success')

      return validatedMessages
    } catch (error) {
      logger.error('Failed to fetch messages by sender email', { senderEmail, error }, 'messages_by_sender_error')
      throw error
    }
  }

  /**
   * ✅ Obtener mensajes por email del destinatario
   */
  async getMessagesByRecipientEmail(recipientEmail: string): Promise<CanonicalMessage[]> {
    try {
      logger.info('Fetching messages by recipient email', { recipientEmail }, 'messages_by_recipient_start')
      
      const response = await apiClient.get(API_ENDPOINTS.MESSAGES.BY_RECIPIENT(recipientEmail))
      const validatedMessages = MessageValidator.validateBackendResponse(response)

      logger.success('Messages by recipient email fetched', {
        recipientEmail,
        count: validatedMessages.length
      }, 'messages_by_recipient_success')

      return validatedMessages
    } catch (error) {
      logger.error('Failed to fetch messages by recipient email', { recipientEmail, error }, 'messages_by_recipient_error')
      throw error
    }
  }

  /**
   * ✅ Enviar nuevo mensaje (usando email)
   */
  async sendMessage(messageData: SendMessageData): Promise<CanonicalMessage> {
    try {
      logger.info('Sending message with EMAIL identifiers', {
        conversationId: messageData.conversationId,
        senderEmail: messageData.senderEmail,
        recipientEmail: messageData.recipientEmail,
        type: messageData.type || 'text'
      }, 'message_send_start')

      // ✅ Preparar payload con email
      const payload = {
        ...messageData,
        timestamp: messageData.timestamp || new Date()
      }

      const response = await apiClient.post(
        API_ENDPOINTS.CONVERSATIONS.MESSAGES(messageData.conversationId),
        payload
      )

      // ✅ Validar mensaje individual
      const validatedMessages = MessageValidator.validateBackendResponse([response])
      const validatedMessage = validatedMessages[0]
      
      if (!validatedMessage) {
        throw new Error('Respuesta de envío de mensaje inválida del backend')
      }

      logger.success('Message sent successfully', {
        messageId: validatedMessage.id,
        conversationId: messageData.conversationId,
        senderEmail: messageData.senderEmail
      }, 'message_send_success')

      return validatedMessage
    } catch (error) {
      logger.error('Failed to send message', { messageData, error }, 'message_send_error')
      throw error
    }
  }

  /**
   * ✅ Marcar mensaje como leído (usando email)
   */
  async markAsRead(messageId: string, markedByEmail: string): Promise<CanonicalMessage> {
    try {
      logger.info('Marking message as read', { messageId, markedByEmail }, 'message_mark_read_start')

      const response = await apiClient.patch(
        API_ENDPOINTS.MESSAGES.MARK_READ(messageId),
        { markedByEmail }
      )

      // ✅ Validar mensaje individual
      const validatedMessages = MessageValidator.validateBackendResponse([response])
      const validatedMessage = validatedMessages[0]
      
      if (!validatedMessage) {
        throw new Error('Respuesta de marcado como leído inválida del backend')
      }

      logger.success('Message marked as read', {
        messageId,
        markedByEmail
      }, 'message_mark_read_success')

      return validatedMessage
    } catch (error) {
      logger.error('Failed to mark message as read', { messageId, markedByEmail, error }, 'message_mark_read_error')
      throw error
    }
  }

  /**
   * ✅ Buscar mensajes con filtros EMAIL-FIRST
   */
  async searchMessages(query: {
    search?: string
    senderEmail?: string
    recipientEmail?: string
    conversationId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<CanonicalMessage[]> {
    try {
      logger.info('Searching messages with EMAIL filters', { query }, 'message_search_start')

      const params = new URLSearchParams()
      
      if (query.search) params.append('search', query.search)
      if (query.senderEmail) params.append(FILTER_PARAMS.MESSAGES.SENDER_EMAIL, query.senderEmail)
      if (query.recipientEmail) params.append(FILTER_PARAMS.MESSAGES.RECIPIENT_EMAIL, query.recipientEmail)
      if (query.conversationId) params.append(FILTER_PARAMS.MESSAGES.CONVERSATION_ID, query.conversationId)
      if (query.dateFrom) params.append(FILTER_PARAMS.MESSAGES.DATE_FROM, query.dateFrom)
      if (query.dateTo) params.append(FILTER_PARAMS.MESSAGES.DATE_TO, query.dateTo)

      const response = await apiClient.get(`${API_ENDPOINTS.MESSAGES.SEARCH}?${params.toString()}`)
      const validatedMessages = MessageValidator.validateBackendResponse(response)

      logger.success('Message search completed', {
        query,
        count: validatedMessages.length
      }, 'message_search_success')

      return validatedMessages
    } catch (error) {
      logger.error('Failed to search messages', { query, error }, 'message_search_error')
      throw error
    }
  }

  /**
   * ✅ Obtener estadísticas de mensajes (placeholder)
   */
  async getMessageStats(): Promise<any> {
    // ✅ Placeholder para estadísticas
    return {}
  }
}

// ✅ Export singleton instance
export const messageService = new MessageService() 