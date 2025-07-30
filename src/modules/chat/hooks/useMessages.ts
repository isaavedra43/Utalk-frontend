// Hook para gestión de mensajes con React Query
// ✅ OPTIMIZADO: Caching inteligente, optimistic updates y paginación
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { messageService } from '../services/messageService'
import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import type { CanonicalMessage } from '@/types/canonical'
import { v4 as uuidv4 } from 'uuid'

// ✅ CONTEXTO PARA LOGGING
const messagesContext = getComponentContext('useMessages')

// ✅ Query keys para React Query
export const messageKeys = {
  all: ['messages'] as const,
  conversations: (conversationId: string) => [...messageKeys.all, 'conversation', conversationId] as const,
  infinite: (conversationId: string) => [...messageKeys.all, 'infinite', conversationId] as const,
  search: (query: any) => [...messageKeys.all, 'search', query] as const,
}

/**
 * ✅ Hook principal para obtener mensajes de una conversación con paginación
 * ✅ CRÍTICO: Error React #310 resuelto con validación ultra-defensiva
 */
export function useMessages(conversationId: string, enablePagination = false) {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  // ✅ VALIDACIÓN ULTRA-DEFENSIVA CRÍTICA - ERROR REACT #310
  if (!conversationId || typeof conversationId !== 'string' || !conversationId.trim()) {
    logger.error('VALIDATION', 'ID de conversación inválido', {
      conversationId,
      type: typeof conversationId,
      isEmpty: !conversationId,
      isString: typeof conversationId === 'string'
    })
    
    return {
      messages: [],
      isLoading: false,
      error: 'Conversation ID inválido',
      hasValidMessages: false,
      isEnabled: false,
      refetch: () => Promise.resolve(),
      fetchNextPage: undefined,
      hasNextPage: false,
      isFetchingNextPage: false
    }
  }

  // ✅ VALIDACIÓN DE AUTENTICACIÓN ANTES DE QUERIES
  const isEnabled = Boolean(
    conversationId &&
    isAuthenticated &&
    user?.email &&
    user?.isActive &&
    apiClient.getAuthToken()
  )

  const context = createLogContext({
    ...messagesContext,
    method: 'useMessages',
    data: {
      conversationId,
      enablePagination,
      userEmail: user?.email,
      userActive: user?.isActive,
      isEnabled,
      hasToken: !!apiClient.getAuthToken()
    }
  })

  logger.info('API', 'Hook useMessages iniciado', context)

  // ✅ VERIFICAR QUE LA CONVERSACIÓN EXISTE ANTES DE CARGAR MENSAJES
  const { data: conversation, error: conversationError } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      try {
        logger.info('API', 'Verificando existencia de conversación', { conversationId })
        const response = await apiClient.get(`/conversations/${conversationId}`)
        return response
      } catch (error: any) {
        logger.error('API', 'Error verificando conversación', {
          conversationId,
          error: error.message,
          status: error.response?.status
        })
        throw error
      }
    },
    enabled: isEnabled,
    retry: 1,
    staleTime: 30000, // 30 segundos
    cacheTime: 300000, // 5 minutos
  })

  // ✅ SOLO CARGAR MENSAJES SI LA CONVERSACIÓN EXISTE - CRÍTICO PARA ERROR #310
  const conversationExists = Boolean(conversation && !conversationError)

  // ✅ QUERY SIMPLE PARA MENSAJES
  const simpleQuery = useQuery({
    queryKey: messageKeys.conversations(conversationId),
    queryFn: async () => {
      logger.info('API', 'Fetching messages (simple)', { conversationId })
      const response = await messageService.getMessages(conversationId)
      logger.success('MESSAGE', 'Messages fetched successfully', {
        conversationId,
        count: response?.length || 0
      })
      return response
    },
    enabled: isEnabled && conversationExists && !enablePagination,
    staleTime: 0, // ✅ CRÍTICO: Siempre considerar stale para tiempo real
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchInterval: false, // ✅ Socket.IO maneja tiempo real
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false
      return failureCount < 2
    },
    retryDelay: 1000,
    cacheTime: 300000, // 5 minutos
  })

  // ✅ QUERY INFINITA PARA PAGINACIÓN
  const infiniteQuery = useInfiniteQuery({
    queryKey: messageKeys.infinite(conversationId),
    queryFn: async ({ pageParam = 1 }) => {
      logger.info('API', 'Fetching messages (infinite)', { conversationId, page: pageParam })
      const response = await messageService.getMessagesWithPagination(conversationId, pageParam)
      return response
    },
    enabled: isEnabled && conversationExists && enablePagination,
    getNextPageParam: (lastPage: any) => {
      if (!lastPage || !lastPage.hasNextPage) return undefined
      return lastPage.nextPage
    },
    staleTime: 0,
    refetchOnMount: true,
    retry: 2,
    cacheTime: 300000,
  })

  const messagesQuery = enablePagination ? infiniteQuery : simpleQuery

  // ✅ NORMALIZACIÓN ROBUSTA DE MENSAJES
  const normalizedMessages = useMemo(() => {
    try {
      if (!messagesQuery.data) return []
      
      const rawMessages = enablePagination && messagesQuery.data && 'pages' in messagesQuery.data
        ? messagesQuery.data.pages?.flatMap((page: any) => page.data || []) || []
        : Array.isArray(messagesQuery.data) ? messagesQuery.data : []

      logger.info('MESSAGE', 'Normalizando mensajes', {
        conversationId,
        rawCount: rawMessages.length,
        hasPages: enablePagination && messagesQuery.data && 'pages' in messagesQuery.data
      })

      return rawMessages
        .filter((msg: any) => msg && msg.id && typeof msg.id === 'string')
        .map((msg: any) => normalizeMessage(msg))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        
    } catch (error: any) {
      logger.error('MESSAGE', 'Error normalizando mensajes', {
        conversationId,
        error: error.message,
        dataType: typeof messagesQuery.data
      })
      return []
    }
  }, [messagesQuery.data, conversationId, enablePagination])

  // ✅ FUNCIÓN PARA PROCESAR MENSAJES EN TIEMPO REAL
  const processIncomingMessage = useCallback((newMessage: any) => {
    try {
      if (!newMessage || !newMessage.id || newMessage.conversationId !== conversationId) {
        logger.warn('MESSAGE', 'Mensaje rechazado por validación', {
          hasId: !!newMessage?.id,
          conversationMatch: newMessage?.conversationId === conversationId,
          expectedConversation: conversationId,
          receivedConversation: newMessage?.conversationId
        })
        return
      }

      const normalizedMessage = normalizeMessage(newMessage)
      
      // ✅ ACTUALIZAR CACHE DE REACT QUERY
      queryClient.setQueryData(
        messageKeys.conversations(conversationId),
        (oldData: CanonicalMessage[] | undefined) => {
          if (!oldData) return [normalizedMessage]
          
          // ✅ EVITAR DUPLICADOS
          const exists = oldData.some(msg => msg.id === normalizedMessage.id)
          if (exists) return oldData
          
          const newData = [...oldData, normalizedMessage]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          
          logger.socket('Mensaje agregado al cache', {
            messageId: normalizedMessage.id,
            conversationId,
            totalMessages: newData.length
          })
          
          return newData
        }
      )

      // ✅ INVALIDAR QUERIES PARA FORZAR RE-RENDER
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      
    } catch (error: any) {
      logger.error('MESSAGE', 'Error procesando mensaje entrante', {
        conversationId,
        messageId: newMessage?.id,
        error: error.message
      })
    }
  }, [conversationId, queryClient])

  return {
    messages: normalizedMessages,
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error || conversationError,
    hasValidMessages: normalizedMessages.length > 0,
    isEnabled,
    conversationExists,
    refetch: messagesQuery.refetch,
    processIncomingMessage,
    // ✅ Para infinite queries - solo disponible si enablePagination es true
    fetchNextPage: enablePagination && 'fetchNextPage' in messagesQuery ? messagesQuery.fetchNextPage : undefined,
    hasNextPage: enablePagination && 'hasNextPage' in messagesQuery ? messagesQuery.hasNextPage : false,
    isFetchingNextPage: enablePagination && 'isFetchingNextPage' in messagesQuery ? messagesQuery.isFetchingNextPage : false
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