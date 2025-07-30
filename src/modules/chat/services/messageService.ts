// Servicio para el manejo de mensajes
// ✅ BACKEND PROPIO CON JWT - USA EMAIL COMO IDENTIFICADOR
import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import { MessageValidator } from '@/lib/validation'
import { API_ENDPOINTS, FILTER_PARAMS } from '@/lib/constants'
import type { 
  CanonicalMessage, 
  CanonicalConversation,
  ValidationResult 
} from '@/types/canonical'
import type { SendMessageData } from '../types'

// ✅ CONTEXTO PARA LOGGING
const messageServiceContext = getComponentContext('messageService')

/**
 * ✅ Servicio para gestión de mensajes con logging profesional
 * Basado en mejores prácticas de Last9 para detección rápida de errores
 */
export const messageService = {
  /**
   * ✅ Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string): Promise<CanonicalMessage[]> {
    const context = createLogContext({
      ...messageServiceContext,
      method: 'getMessages',
      data: { conversationId }
    })

    logger.info('API', '📥 Fetching messages for conversation', context)

    try {
      const startTime = Date.now()
      const response = await apiClient.get(`${API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)}`)
      const duration = Date.now() - startTime

      if (response?.success && Array.isArray(response.data)) {
        logger.success('MESSAGE', 'Messages fetched successfully', createLogContext({
          ...context,
          data: {
            count: response.data.length,
            duration,
            conversationId
          }
        }))
        return response.data
      } else {
        logger.warn('API', '⚠️ Invalid response format for messages', createLogContext({
          ...context,
          data: { response: response }
        }))
        return []
      }
    } catch (error) {
      logger.error('API', '💥 Failed to fetch messages', createLogContext({
        ...context,
        error: error as Error,
        data: { conversationId }
      }))
      throw error
    }
  },

  /**
   * ✅ Obtener mensajes con paginación
   */
  async getMessagesWithPagination(conversationId: string, options: {
    page: number
    limit: number
  }): Promise<{
    messages: CanonicalMessage[]
    hasMore: boolean
    total: number
    nextPage: number | null
  }> {
    const context = createLogContext({
      ...messageServiceContext,
      method: 'getMessagesWithPagination',
      data: { conversationId, ...options }
    })

    logger.info('API', '📥 Fetching messages with pagination', context)

    try {
      const startTime = Date.now()
      const response = await apiClient.get(`${API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)}`, {
        params: {
          page: options.page,
          limit: options.limit
        }
      })
      const duration = Date.now() - startTime

      if (response?.success && Array.isArray(response.data?.messages)) {
        logger.success('MESSAGE', 'Paginated messages fetched successfully', createLogContext({
          ...context,
          data: {
            count: response.data.messages.length,
            duration,
            hasMore: response.data.hasMore,
            total: response.data.total
          }
        }))

        return {
          messages: response.data.messages,
          hasMore: response.data.hasMore || false,
          total: response.data.total || 0,
          nextPage: response.data.hasMore ? options.page + 1 : null
        }
      } else {
        logger.warn('API', '⚠️ Invalid paginated response format', createLogContext({
          ...context,
          data: { response: response }
        }))
        return {
          messages: [],
          hasMore: false,
          total: 0,
          nextPage: null
        }
      }
    } catch (error) {
      logger.error('API', '💥 Failed to fetch paginated messages', createLogContext({
        ...context,
        error: error as Error,
        data: { conversationId, options }
      }))
      throw error
    }
  },

  /**
   * ✅ Obtener mensajes por remitente
   */
  async getMessagesBySender(senderEmail: string): Promise<CanonicalMessage[]> {
    const context = createLogContext({
      ...messageServiceContext,
      method: 'getMessagesBySender',
      data: { senderEmail }
    })

    logger.info('API', '📥 Fetching messages by sender email', context)

    try {
      const response = await apiClient.get(`/messages/sender/${encodeURIComponent(senderEmail)}`)

      if (response?.success && Array.isArray(response.data)) {
        logger.success('MESSAGE', 'Messages by sender email fetched', createLogContext({
          ...context,
          data: { count: response.data.length }
        }))
        return response.data
      } else {
        logger.warn('API', '⚠️ Invalid response for sender messages', createLogContext({
          ...context,
          data: { response: response }
        }))
        return []
      }
    } catch (error) {
      logger.error('API', '💥 Failed to fetch messages by sender email', createLogContext({
        ...context,
        error: error as Error,
        data: { senderEmail }
      }))
      throw error
    }
  },

  /**
   * ✅ Obtener mensajes por destinatario
   */
  async getMessagesByRecipient(recipientEmail: string): Promise<CanonicalMessage[]> {
    const context = createLogContext({
      ...messageServiceContext,
      method: 'getMessagesByRecipient',
      data: { recipientEmail }
    })

    logger.info('API', '📥 Fetching messages by recipient email', context)

    try {
      const response = await apiClient.get(`/messages/recipient/${encodeURIComponent(recipientEmail)}`)

      if (response?.success && Array.isArray(response.data)) {
        logger.success('MESSAGE', 'Messages by recipient email fetched', createLogContext({
          ...context,
          data: { count: response.data.length }
        }))
        return response.data
      } else {
        logger.warn('API', '⚠️ Invalid response for recipient messages', createLogContext({
          ...context,
          data: { response: response }
        }))
        return []
      }
    } catch (error) {
      logger.error('API', '💥 Failed to fetch messages by recipient email', createLogContext({
        ...context,
        error: error as Error,
        data: { recipientEmail }
      }))
      throw error
    }
  },

  /**
   * ✅ Enviar mensaje con EMAIL identifiers y messageId único
   */
  async sendMessage(messageData: {
    conversationId: string
    content: string
    recipientEmail: string
    messageId?: string
    attachments?: any[]
    mediaUrl?: string
  }): Promise<CanonicalMessage> {
    const context = createLogContext({
      ...messageServiceContext,
      method: 'sendMessage',
      data: { 
        conversationId: messageData.conversationId,
        recipientEmail: messageData.recipientEmail,
        hasAttachments: !!messageData.attachments?.length,
        hasMediaUrl: !!messageData.mediaUrl
      }
    })

    logger.info('API', '📤 Sending message with EMAIL identifiers and unique messageId', context)

    try {
      const startTime = Date.now()
      const response = await apiClient.post('/messages', {
        ...messageData,
        messageId: messageData.messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
      const duration = Date.now() - startTime

      if (response?.success && response.data) {
        logger.success('MESSAGE', 'Message sent successfully with messageId', createLogContext({
          ...context,
          data: {
            messageId: response.data.id,
            duration,
            conversationId: messageData.conversationId
          }
        }))
        return response.data
      } else {
        const errorMsg = response?.message || 'Respuesta inválida del servidor'
        logger.error('API', '💥 Failed to send message', createLogContext({
          ...context,
          data: { errorMessage: errorMsg, messageData }
        }))
        throw new Error(errorMsg)
      }
    } catch (error) {
      logger.error('API', '💥 Failed to send message', createLogContext({
        ...context,
        error: error as Error,
        data: { messageData }
      }))
      throw error
    }
  },

  /**
   * ✅ Marcar mensaje como leído
   */
  async markMessageAsRead(messageId: string, markedByEmail: string): Promise<void> {
    const context = createLogContext({
      ...messageServiceContext,
      method: 'markMessageAsRead',
      data: { messageId, markedByEmail }
    })

    logger.info('API', '📝 Marking message as read', context)

    try {
      const response = await apiClient.put(`/messages/${messageId}/read`, {
        markedByEmail
      })

      if (response?.success) {
        logger.success('MESSAGE', 'Message marked as read', createLogContext({
          ...context,
          data: { messageId, markedByEmail }
        }))
      } else {
        const errorMsg = response?.message || 'Error al marcar mensaje como leído'
        logger.error('API', '💥 Failed to mark message as read', createLogContext({
          ...context,
          data: { errorMessage: errorMsg, messageId, markedByEmail }
        }))
        throw new Error(errorMsg)
      }
    } catch (error) {
      logger.error('API', '💥 Failed to mark message as read', createLogContext({
        ...context,
        error: error as Error,
        data: { messageId, markedByEmail }
      }))
      throw error
    }
  },

  /**
   * ✅ Marcar mensaje como leído (alias para compatibilidad)
   */
  async markAsRead(messageId: string, markedByEmail: string): Promise<void> {
    return this.markMessageAsRead(messageId, markedByEmail)
  },

  /**
   * ✅ Buscar mensajes con filtros EMAIL
   */
  async searchMessages(query: {
    search?: string
    senderEmail?: string
    recipientEmail?: string
    conversationId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<CanonicalMessage[]> {
    const context = createLogContext({
      ...messageServiceContext,
      method: 'searchMessages',
      data: { query }
    })

    logger.info('API', '🔍 Searching messages with EMAIL filters', context)

    try {
      const response = await apiClient.get('/messages/search', { params: query })

      if (response?.success && Array.isArray(response.data)) {
        logger.success('MESSAGE', 'Message search completed', createLogContext({
          ...context,
          data: { count: response.data.length }
        }))
        return response.data
      } else {
        logger.warn('API', '⚠️ Invalid search response', createLogContext({
          ...context,
          data: { response: response }
        }))
        return []
      }
    } catch (error) {
      logger.error('API', '💥 Failed to search messages', createLogContext({
        ...context,
        error: error as Error,
        data: { query }
      }))
      throw error
    }
  },

  /**
   * ✅ Obtener estadísticas de mensajes (placeholder)
   */
  async getMessageStats(): Promise<any> {
    // ✅ Placeholder para estadísticas
    return {}
  }
} 