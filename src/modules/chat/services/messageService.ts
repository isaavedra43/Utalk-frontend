// Servicio para el manejo de mensajes
// ✅ BACKEND PROPIO CON JWT - USA EMAIL COMO IDENTIFICADOR
import { v4 as uuidv4 } from 'uuid'
import { apiClient } from '@/services/apiClient'
import { logger } from '@/lib/logger'
import { MessageValidator } from '@/lib/validation'
import { API_ENDPOINTS, FILTER_PARAMS } from '@/lib/constants'
import type { 
  CanonicalMessage, 
  CanonicalConversation,
  ValidationResult 
} from '@/types/canonical'
import type { SendMessageData } from '../types'

/**
 * ✅ CONTRATO DE API - MENSAJES CORREGIDO
 * 
 * ESTRUCTURA ESTÁNDAR DEL BACKEND:
 * - Mensajes simples: response.data = [mensaje1, mensaje2, ...]
 * - Mensajes con paginación: response.data = { data: [...], pagination: {...} }
 * 
 * ENDPOINTS DE MENSAJES:
 * - GET /api/conversations/:id/messages -> response.data = [mensaje1, mensaje2, ...]
 * - GET /api/conversations/:id/messages?page=1&limit=50 -> response.data = { data: [...], pagination: {...} }
 * - GET /api/messages/search -> response.data = [mensaje1, mensaje2, ...]
 * - POST /api/messages/send -> response.data = mensaje_creado
 * 
 * ✅ ESTRUCTURA CORREGIDA PARA PAGINACIÓN:
 * El backend entrega: { data: [...], pagination: { hasMore, nextCursor, totalResults } }
 * El frontend accede a: response.data.data (no response.data.messages)
 */

/**
 * ✅ Servicio singleton para mensajes usando EMAIL como identificador
 */
class MessageService {
  /**
   * ✅ Obtener mensajes de una conversación
   */
  async getMessages(conversationId: string): Promise<CanonicalMessage[]> {
    try {
      console.log('[SERVICE] messageService.getMessages called with:', conversationId)
      logger.info('Fetching messages for conversation', { conversationId }, 'messages_fetch_start')

      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId))
      
      // ✅ LOG EXPLÍCITO DE AUDITORÍA - RESPUESTA CRUDA
      console.log("Mensajes recibidos (raw):", response.data)
      console.log('[SERVICE] Raw response metadata:', {
        status: response?.status,
        dataType: typeof response?.data,
        isArray: Array.isArray(response?.data),
        length: response?.data?.length
      })

      // ✅ El backend entrega SIEMPRE el array de mensajes directamente en response.data
      // Nunca usar response.data.data ni response.data.messages
      if (!response || !response.data) {
        console.log('[SERVICE] Empty response, returning empty array')
        return []
      }

      // ✅ Acceso directo al array de mensajes
      const messages = response.data

      if (!Array.isArray(messages)) {
        console.warn('[SERVICE] Response.data is not an array, returning empty array. Received:', typeof messages)
        return []
      }

      console.log('[SERVICE] Messages before validation:', {
        count: messages.length,
        sample: messages[0] || null
      })

      // ✅ Validar y normalizar mensajes
      const validatedMessages = MessageValidator.validateBackendResponse(messages)
      
      console.log('[SERVICE] Messages after validation:', {
        validCount: validatedMessages.length,
        invalidCount: messages.length - validatedMessages.length
      })

      logger.success('Messages fetched successfully', {
        conversationId,
        count: validatedMessages.length
      }, 'messages_fetch_success')

      return validatedMessages

    } catch (error) {
      console.error('[SERVICE] messageService.getMessages error:', error)
      logger.error('Failed to fetch messages', { conversationId, error }, 'messages_fetch_error')
      throw error
    }
  }

  /**
   * ✅ Obtener mensajes con paginación para scroll infinito
   */
  async getMessagesWithPagination(
    conversationId: string, 
    options: { page?: number; limit?: number } = {}
  ): Promise<{
    messages: CanonicalMessage[]
    hasMore: boolean
    nextPage: number | null
    total: number
    currentPage: number
  }> {
    try {
      const { page = 1, limit = 20 } = options
      
      console.log('[SERVICE] messageService.getMessagesWithPagination called with:', {
        conversationId,
        page,
        limit
      })
      
      logger.info('Fetching messages with pagination', { 
        conversationId, 
        page, 
        limit 
      }, 'messages_fetch_paginated_start')

      // Construir URL con parámetros de paginación
      const endpoint = `${API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId)}?page=${page}&limit=${limit}`
      const response = await apiClient.get(endpoint)
      
      console.log('[SERVICE] Paginated response from API:', {
        status: response?.status,
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : [],
      })

      // ✅ LOG EXPLÍCITO DE AUDITORÍA - RESPUESTA CRUDA DE PAGINACIÓN
      console.log("Mensajes paginados recibidos (raw):", response.data)
      
      // ✅ Manejo robusto de respuesta vacía
      if (!response || !response.data) {
        console.log('[SERVICE] Empty paginated response, returning empty result')
        return {
          messages: [],
          hasMore: false,
          nextPage: null,
          total: 0,
          currentPage: page
        }
      }

      // ✅ ESTRUCTURA CORREGIDA: El backend entrega la estructura estándar
      // response.data contiene el objeto con: { data: [...], pagination: {...} }
      let messages = []
      let total = 0
      let hasMore = false

      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Estructura estándar del backend: { data: [...], pagination: {...} }
        if (Array.isArray(response.data.data)) {
          messages = response.data.data
          total = response.data.pagination?.totalResults || 0
          hasMore = response.data.pagination?.hasMore || false
          console.log('[SERVICE] Using standard backend structure: response.data.data')
        }
      } else if (Array.isArray(response.data)) {
        // Fallback: Array directo (por compatibilidad)
        messages = response.data
        total = messages.length
        hasMore = messages.length === limit
        console.log('[SERVICE] Using direct array structure for pagination')
      }

      console.log('[SERVICE] Paginated messages before validation:', {
        count: messages.length,
        total,
        hasMore,
        page
      })

      // ✅ Validar y normalizar mensajes
      const validatedMessages = MessageValidator.validateBackendResponse(messages)
      
      console.log('[SERVICE] Paginated messages after validation:', {
        validCount: validatedMessages.length,
        invalidCount: messages.length - validatedMessages.length
      })

      const result = {
        messages: validatedMessages,
        hasMore,
        nextPage: hasMore ? page + 1 : null,
        total,
        currentPage: page
      }

      logger.success('Paginated messages fetched successfully', {
        conversationId,
        page,
        limit,
        count: validatedMessages.length,
        total,
        hasMore
      }, 'messages_fetch_paginated_success')

      return result

    } catch (error) {
      console.error('[SERVICE] messageService.getMessagesWithPagination error:', error)
      logger.error('Failed to fetch paginated messages', { 
        conversationId, 
        options, 
        error 
      }, 'messages_fetch_paginated_error')
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
      // ✅ Generar messageId único si no se proporciona
      const messageId = messageData.messageId || uuidv4()
      
      logger.info('Sending message with EMAIL identifiers and unique messageId', {
        messageId,
        conversationId: messageData.conversationId,
        senderEmail: messageData.senderEmail,
        recipientEmail: messageData.recipientEmail,
        type: messageData.type || 'text'
      }, 'message_send_start')

      // ✅ Preparar payload con email y messageId único
      const payload = {
        ...messageData,
        messageId, // ✅ OBLIGATORIO: Incluir messageId único
      }

      console.log('🔍 [MESSAGE_SERVICE] Sending message with payload:', {
        messageId,
        conversationId: payload.conversationId,
        hasContent: !!payload.content,
        contentLength: payload.content?.length || 0,
        senderEmail: payload.senderEmail,
        recipientEmail: payload.recipientEmail,
        type: payload.type || 'text'
      })

      const response = await apiClient.post(
        API_ENDPOINTS.CONVERSATIONS.MESSAGES(messageData.conversationId),
        payload
      )

      console.log('✅ [MESSAGE_SERVICE] Backend response:', {
        status: response?.status,
        hasData: !!response?.data,
        messageId: response?.data?.id || response?.data?.messageId
      })

      // ✅ Validar mensaje individual
      const validatedMessages = MessageValidator.validateBackendResponse([response])
      const validatedMessage = validatedMessages[0]
      
      if (!validatedMessage) {
        throw new Error('Respuesta de envío de mensaje inválida del backend')
      }

      logger.success('Message sent successfully with messageId', {
        messageId: validatedMessage.id,
        originalMessageId: messageId,
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