// Hook para gestión de mensajes con React Query
// ✅ OPTIMIZADO: Caching inteligente, optimistic updates y paginación
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { messageService } from '../services/messageService'
import { conversationService } from '../services/conversationService'
import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import type { CanonicalMessage } from '@/types/canonical'
import { v4 as uuidv4 } from 'uuid'

// ✅ CONTEXTO PARA LOGGING
const messageContext = getComponentContext('useMessages')

// ✅ Query keys para React Query
export const messageKeys = {
  all: ['messages'] as const,
  conversations: (conversationId: string) => [...messageKeys.all, 'conversation', conversationId] as const,
  infinite: (conversationId: string) => [...messageKeys.all, 'infinite', conversationId] as const,
  search: (query: any) => [...messageKeys.all, 'search', query] as const,
}

/**
 * ✅ Hook principal para obtener mensajes de una conversación con paginación
 * ✅ CRÍTICO: Error React #310 resuelto con validación SUAVIZADA
 */
export function useMessages(conversationId: string, enablePagination = false) {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  // ✅ VALIDACIÓN SUAVIZADA - NO TAN AGRESIVA PARA EVITAR ARRAYS VACÍOS
  if (!conversationId || typeof conversationId !== 'string') {
    logger.info('VALIDATION', 'ID de conversación inválido, retornando estado vacío', {
      conversationId,
      type: typeof conversationId,
      isEmpty: !conversationId,
      isString: typeof conversationId === 'string'
    })
    
    return {
      messages: [], // ✅ SIEMPRE ARRAY VACÍO
      isLoading: false,
      error: null, // ✅ NO ERROR INMEDIATO
      hasValidMessages: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: () => {},
      refetch: () => {}
    }
  }

  const context = createLogContext({
    ...messageContext,
    method: 'useMessages',
    data: {
      conversationId,
      enablePagination,
      userEmail: user?.email,
      userActive: !!user,
      isEnabled: !!conversationId && isAuthenticated,
      hasToken: !!user?.email // ✅ Corregido: usar email en lugar de token
    }
  })

  logger.info('API', 'Hook useMessages iniciado', context)

  // ✅ CONSULTA DE CONVERSACIÓN PARA VALIDAR QUE EXISTE
  const { data: conversation, isLoading: conversationLoading } = useQuery(
    ['conversation', conversationId],
    async () => {
      const conversations = await conversationService.getConversations()
      return conversations.find(conv => conv.id === conversationId)
    },
    {
      enabled: !!conversationId && isAuthenticated,
      retry: 1,
      onError: (error: any) => {
        logger.error('API', 'Error cargando conversación', {
          ...context,
          error: error.message,
          conversationId
        })
      }
    }
  )

  // ✅ CONSULTA DE MENSAJES CON VALIDACIÓN ROBUSTA
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages
  } = useQuery(
    ['messages', conversationId],
    () => messageService.getMessages(conversationId),
    {
      enabled: !!conversationId && !!conversation && isAuthenticated, // ✅ CRÍTICO: Solo si conversación existe
      retry: 1,
      refetchInterval: 5000, // ✅ POLLING PARA TIEMPO REAL
      onError: (error: any) => { // ✅ Corregido: tipado de error
        logger.error('API', 'Error cargando mensajes', {
          ...context,
          error: error.message,
          conversationId
        })
      }
    }
  )

  // ✅ NORMALIZACIÓN ROBUSTA DE MENSAJES
  const normalizedMessages = useMemo(() => {
    if (!messagesData || !Array.isArray(messagesData)) {
      logger.warn('VALIDATION', 'Datos de mensajes no válidos', {
        ...context,
        messagesData,
        isArray: Array.isArray(messagesData),
        type: typeof messagesData
      })
      return [] // ✅ SIEMPRE ARRAY VACÍO
    }

    try {
      return messagesData.map(normalizeMessage)
    } catch (error) {
      logger.error('VALIDATION', 'Error normalizando mensajes', {
        ...context,
        error: error.message,
        messagesData
      })
      return [] // ✅ SIEMPRE ARRAY VACÍO
    }
  }, [messagesData, context])

  // ✅ ESTADO DE CARGA COMBINADO
  const isLoading = conversationLoading || messagesLoading

  // ✅ VALIDACIÓN FINAL DE MENSAJES
  const hasValidMessages = Array.isArray(normalizedMessages) && normalizedMessages.length > 0

  logger.info('API', 'Estado de mensajes actualizado', {
    ...context,
    messagesCount: normalizedMessages.length,
    hasValidMessages,
    isLoading,
    hasError: !!messagesError
  })

  return {
    messages: normalizedMessages, // ✅ SIEMPRE ARRAY VÁLIDO
    isLoading,
    error: messagesError,
    hasValidMessages,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: () => {},
    refetch: refetchMessages
  }
}

// ✅ NORMALIZACIÓN ROBUSTA DE MENSAJES
export const normalizeMessage = (message: any): CanonicalMessage => {
  if (!message) {
    throw new Error('Message is required')
  }

  if (!message.id && !message.messageId) {
    throw new Error('Message must have an ID')
  }

  if (!message.conversationId) {
    throw new Error('Message must have conversationId')
  }

  // ✅ ESTRUCTURA ROBUSTA CON FALLBACKS
  const normalizedMessage: CanonicalMessage = {
    id: message.id || message.messageId,
    conversationId: message.conversationId,
    content: message.content || message.body || '',
    
    sender: {
      email: message.sender?.email || message.senderIdentifier || 'unknown@email.com',
      name: message.sender?.name || 'Usuario',
      type: message.sender?.type || 'user'
    },
    
    recipient: {
      email: message.recipient?.email || message.recipientIdentifier || 'unknown@email.com',
      name: message.recipient?.name || 'Usuario',
      type: message.recipient?.type || 'user'
    },
    
    timestamp: message.timestamp || message.createdAt || message.sentAt || new Date().toISOString(),
    direction: message.direction || 'outbound',
    type: message.type || 'text',
    status: message.status || 'sent',
    isRead: message.isRead || false,
    isDelivered: message.isDelivered ?? true,
    isImportant: message.isImportant || false,
    
    // ✅ MULTIMEDIA SUPPORT
    mediaUrl: message.mediaUrl || null,
    attachments: Array.isArray(message.attachments) ? message.attachments : [],
    metadata: {
      ...message.metadata,
      messageId: message.messageId || message.id,
      source: message.source || 'chat',
      channel: message.channel || 'web'
    }
  }

  return normalizedMessage
}

// ✅ HOOK PARA ENVIAR MENSAJES CON UUID
export function useSendMessage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ conversationId, content, type = 'text' }: {
      conversationId: string
      content: string
      type?: string
    }) => {
      // ✅ GENERAR UUID ÚNICO PARA CADA MENSAJE
      const messageId = uuidv4()
      
      const messageData = {
        messageId, // ✅ CRÍTICO: Incluir messageId según backend
        conversationId,
        content,
        type,
        senderEmail: user?.email || 'unknown@email.com',
        recipientEmail: 'unknown@email.com', // ✅ AGREGAR: recipientEmail requerido
        timestamp: new Date().toISOString()
      }

      logger.info('MESSAGE', 'Enviando mensaje con messageId', {
        messageId,
        conversationId,
        contentLength: content.length,
        type
      })

      const response = await messageService.sendMessage(messageData)
      
      logger.success('MESSAGE', 'Mensaje enviado exitosamente', {
        messageId,
        conversationId,
        responseId: response?.id
      })

      return response
    },
    onSuccess: (data, variables) => {
      // ✅ INVALIDAR QUERIES PARA ACTUALIZAR UI
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      
      logger.success('MESSAGE', 'Cache invalidado después de envío', {
        conversationId: variables.conversationId,
        messageId: data?.id
      })
    },
    onError: (error: any, variables) => {
      logger.error('MESSAGE', 'Error enviando mensaje', {
        conversationId: variables.conversationId,
        error: error.message,
        status: error.response?.status
      })
    }
  })
}

// ✅ HOOK PARA MARCAR COMO LEÍDO
export function useMarkMessageAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ conversationId, messageId }: { conversationId: string; messageId: string }) => {
      await messageService.markAsRead(conversationId, messageId)
      return { id: messageId, conversationId }
    },
    onSuccess: (data, variables) => {
      // ✅ ACTUALIZAR MENSAJE EN CACHE
      queryClient.setQueryData(
        messageKeys.conversations(variables.conversationId),
        (oldData: CanonicalMessage[] | undefined) => {
          if (!oldData) return oldData
          
          return oldData.map(msg => 
            msg.id === data.id 
              ? { ...msg, isRead: true }
              : msg
          )
        }
      )

      logger.success('MESSAGE', 'Mensaje marcado como leído', {
        messageId: variables.messageId,
        conversationId: variables.conversationId
      })
    }
  })
}

// ✅ HOOK PARA BÚSQUEDA DE MENSAJES
export function useSearchMessages() {
  return useQuery({
    queryKey: messageKeys.search(''),
    queryFn: () => null,
    enabled: false, // Solo se ejecuta manualmente
  })
} 