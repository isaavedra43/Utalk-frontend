// Hook para gestión de mensajes con React Query
// ✅ OPTIMIZADO: Caching inteligente, optimistic updates y paginación
import { useMutation, useQuery, useInfiniteQuery, useQueryClient, QueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { messageService } from '../services/messageService'
import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext, getErrorContext } from '@/lib/logger'
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
 * Soporta scroll infinito para manejar grandes volúmenes de mensajes
 */
export function useMessages(conversationId: string, enablePagination = false) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const context = createLogContext({
    ...messagesContext,
    method: 'useMessages',
    data: {
      conversationId,
      enablePagination,
      userEmail: user?.email,
      userActive: user?.isActive
    }
  })

  logger.info('API', '📥 Hook useMessages iniciado', context)

  // ✅ VALIDACIÓN ULTRA-DEFENSIVA CRÍTICA
  if (!conversationId || typeof conversationId !== 'string' || !conversationId.trim()) {
    logger.validationError('❌ ID de conversación inválido', createLogContext({
      ...context,
      data: { 
        conversationId,
        type: typeof conversationId,
        length: conversationId?.length
      }
    }))
    return {
      data: [],
      isLoading: false,
      isFetching: false,
      error: new Error('ID de conversación no válido'),
      refetch: () => Promise.resolve()
    }
  }

  if (!user || !user.email || !user.isActive) {
    logger.validationError('❌ Usuario no autenticado', createLogContext({
      ...context,
      data: { 
        hasUser: !!user,
        userEmail: user?.email,
        userActive: user?.isActive
      }
    }))
    return {
      data: [],
      isLoading: false,
      isFetching: false,
      error: new Error('Usuario no autenticado'),
      refetch: () => Promise.resolve()
    }
  }

  if (!apiClient.getAuthToken()) {
    logger.validationError('❌ Token de autenticación no disponible', context)
    return {
      data: [],
      isLoading: false,
      isFetching: false,
      error: new Error('Token de autenticación no disponible'),
      refetch: () => Promise.resolve()
    }
  }

  // ✅ VALIDACIÓN CRÍTICA: No ejecutar si no hay conversationId válido
  const isEnabled = !!(conversationId && conversationId.trim() && user?.email && user?.isActive && apiClient.getAuthToken())

  logger.info('API', '✅ Validaciones completadas - Hook habilitado', createLogContext({
    ...context,
    data: { isEnabled }
  }))

  // Hook para mensajes con paginación (scroll infinito)
  const infiniteQuery = useInfiniteQuery({
    queryKey: messageKeys.infinite(conversationId || 'none'),
    queryFn: async ({ pageParam = 1 }) => {
      const queryContext = createLogContext({
        ...context,
        method: 'infiniteQueryFn',
        data: { conversationId, page: pageParam }
      })

      logger.info('API', '🔄 Ejecutando query infinita', queryContext)
      
      if (!conversationId || !conversationId.trim()) {
        logger.warn('API', '⚠️ No hay conversationId, retornando array vacío', queryContext)
        return { messages: [], hasMore: false, nextPage: null }
      }
      
      try {
        const startTime = Date.now()
        const messages = await messageService.getMessages(conversationId)
        const duration = Date.now() - startTime

        logger.info('API', '✅ Query infinita exitosa', createLogContext({
          ...queryContext,
          data: {
            count: messages?.length,
            duration,
            hasMore: messages && messages.length > 0
          }
        }))

        return { 
          messages: messages || [], 
          hasMore: messages && messages.length > 0, 
          nextPage: pageParam + 1 
        }
      } catch (error) {
        logger.apiError('💥 Error en query infinita', createLogContext({
          ...queryContext,
          error: error as Error,
          data: { conversationId, page: pageParam }
        }))
        throw error
      }
    },
    enabled: isEnabled && enablePagination,
    staleTime: 0, // ✅ CAMBIAR: Siempre considerar stale para tiempo real
    refetchOnWindowFocus: false, // Evitar refetch innecesario, mejor usar WebSocket
    refetchOnMount: true, // ✅ AGREGAR: Refetch al montar
    refetchOnReconnect: true, // ✅ AGREGAR: Refetch al reconectar
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // ✅ AGREGAR: Configuración para tiempo real
    refetchInterval: false, // No polling, solo Socket.IO
    refetchIntervalInBackground: false
  })

  // Hook para mensajes simples (sin paginación)
  const simpleQuery = useQuery({
    queryKey: messageKeys.conversations(conversationId || 'none'),
    queryFn: async () => {
      const queryContext = createLogContext({
        ...context,
        method: 'simpleQueryFn',
        data: { conversationId }
      })

      logger.info('API', '🔄 Ejecutando query simple', queryContext)
      
      if (!conversationId || !conversationId.trim()) {
        logger.warn('API', '⚠️ No hay conversationId, retornando array vacío', queryContext)
        return []
      }
      
      try {
        const startTime = Date.now()
        const messages = await messageService.getMessages(conversationId)
        const duration = Date.now() - startTime

        logger.info('API', '✅ Query simple exitosa', createLogContext({
          ...queryContext,
          data: {
            count: messages?.length,
            duration,
            messages: messages?.slice(0, 3) // Primeros 3 para debug
          }
        }))

        return messages
      } catch (error) {
        logger.apiError('💥 Error en query simple', createLogContext({
          ...queryContext,
          error: error as Error,
          data: { conversationId }
        }))
        throw error
      }
    },
    enabled: isEnabled && !enablePagination,
    staleTime: 0, // ✅ CAMBIAR: Siempre considerar stale para tiempo real
    refetchOnWindowFocus: false, // Evitar refetch innecesario, mejor usar WebSocket
    refetchOnMount: true, // ✅ AGREGAR: Refetch al montar
    refetchOnReconnect: true, // ✅ AGREGAR: Refetch al reconectar
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // ✅ AGREGAR: Configuración para tiempo real
    refetchInterval: false, // No polling, solo Socket.IO
    refetchIntervalInBackground: false
  })

  // ✅ LOGGING DE ESTADO FINAL
  const finalContext = createLogContext({
    ...context,
    data: {
      isEnabled,
      enablePagination,
      hasData: enablePagination ? !!infiniteQuery.data : !!simpleQuery.data,
      isLoading: enablePagination ? infiniteQuery.isLoading : simpleQuery.isLoading,
      hasError: enablePagination ? !!infiniteQuery.error : !!simpleQuery.error
    }
  })

  logger.info('API', '📊 Estado final del hook useMessages', finalContext)

  // Retornar el hook apropiado según la configuración
  if (enablePagination) {
    return {
      data: infiniteQuery.data?.pages.flatMap(page => page.messages) || [],
      pages: infiniteQuery.data?.pages || [],
      isLoading: infiniteQuery.isLoading,
      isFetching: infiniteQuery.isFetching,
      isFetchingNextPage: infiniteQuery.isFetchingNextPage,
      hasNextPage: infiniteQuery.hasNextPage,
      fetchNextPage: infiniteQuery.fetchNextPage,
      error: infiniteQuery.error,
      refetch: infiniteQuery.refetch
    }
  }

  return {
    data: simpleQuery.data || [],
    isLoading: simpleQuery.isLoading,
    isFetching: simpleQuery.isFetching,
    error: simpleQuery.error,
    refetch: simpleQuery.refetch
  }
}

/**
 * ✅ Hook para enviar mensajes con optimistic updates
 */
export function useSendMessage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (messageData: any) => { // Changed type to any as SendMessageData is removed
      console.log('[HOOK] useSendMessage: Sending message:', messageData)
      
      if (!user?.email) {
        throw new Error('Usuario no autenticado')
      }

      if (!messageData.recipientEmail) {
        throw new Error('recipientEmail es requerido para enviar el mensaje')
      }

      // ✅ Generar messageId único si no existe
      const messageId = messageData.messageId || uuidv4()

      // Agregar email del usuario si no está presente
      const enrichedData: any = { // Changed type to any
        ...messageData,
        messageId, // ✅ OBLIGATORIO: Asegurar que existe messageId
        senderEmail: messageData.senderEmail || user.email,
        recipientEmail: messageData.recipientEmail,
        type: messageData.type || 'text'
      }

      console.log('🔍 [HOOK] useSendMessage: Sending with messageId:', {
        messageId,
        conversationId: enrichedData.conversationId,
        hasContent: !!enrichedData.content,
        type: enrichedData.type
      })

      const response = await messageService.sendMessage(enrichedData)
      console.log('[HOOK] useSendMessage: Message sent successfully:', response)
      return response
    },
    
    // ✅ Optimistic update
    onMutate: async (messageData) => {
      const conversationId = messageData.conversationId
      
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: messageKeys.conversations(conversationId) })
      await queryClient.cancelQueries({ queryKey: messageKeys.infinite(conversationId) })
      
      // Snapshot del estado anterior
      const previousMessages = queryClient.getQueryData(messageKeys.conversations(conversationId))
      const previousInfiniteMessages = queryClient.getQueryData(messageKeys.infinite(conversationId))
      
      // Crear mensaje optimista
      const optimisticMessage: CanonicalMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        content: messageData.content,
        timestamp: new Date(),
        sender: {
          email: user?.email || 'unknown',
          name: user?.name || 'Usuario',
          type: 'agent' as const,
          avatar: user?.avatar
        },
        recipient: {
          email: messageData.recipientEmail || 'unknown',
          name: 'Destinatario',
          type: 'contact' as const
        },
        type: messageData.type || 'text',
        status: 'pending',
        direction: 'outbound',
        isRead: false,
        isDelivered: false,
        isImportant: false,
        metadata: {},
        attachments: messageData.attachments || []
      }
      
      // Actualizar cache con mensaje optimista
      queryClient.setQueryData(
        messageKeys.conversations(conversationId),
        (old: CanonicalMessage[] | undefined) => [...(old || []), optimisticMessage]
      )
      
      // Actualizar cache infinito también
      queryClient.setQueryData(
        messageKeys.infinite(conversationId),
        (old: any) => {
          if (!old) return old
          const newPages = [...old.pages]
          if (newPages.length > 0) {
            newPages[0] = {
              ...newPages[0],
              messages: [...newPages[0].messages, optimisticMessage]
            }
          }
          return { ...old, pages: newPages }
        }
      )
      
      return { previousMessages, previousInfiniteMessages, optimisticMessage }
    },
    
    // ✅ Éxito: reemplazar mensaje optimista con el real
    onSuccess: (sentMessage, messageData, context) => {
      const conversationId = messageData.conversationId
      
      // Reemplazar mensaje optimista con el real
      queryClient.setQueryData(
        messageKeys.conversations(conversationId),
        (old: CanonicalMessage[] | undefined) => {
          if (!old) return [sentMessage]
          return old.map(msg => 
            msg.id === context?.optimisticMessage.id ? sentMessage : msg
          )
        }
      )
      
      // Actualizar cache infinito
      queryClient.setQueryData(
        messageKeys.infinite(conversationId),
        (old: any) => {
          if (!old) return old
          const newPages = old.pages.map((page: any) => ({
            ...page,
            messages: page.messages.map((msg: CanonicalMessage) =>
              msg.id === context?.optimisticMessage.id ? sentMessage : msg
            )
          }))
          return { ...old, pages: newPages }
        }
      )
      
      console.log('[HOOK] useSendMessage: Optimistic update completed')
    },
    
    // ✅ Error: restaurar estado anterior
    onError: (error, messageData, context) => {
      const conversationId = messageData.conversationId
      console.error('[HOOK] useSendMessage: Error sending message:', error)
      
      // Restaurar estado anterior
      if (context?.previousMessages) {
        queryClient.setQueryData(messageKeys.conversations(conversationId), context.previousMessages)
      }
      if (context?.previousInfiniteMessages) {
        queryClient.setQueryData(messageKeys.infinite(conversationId), context.previousInfiniteMessages)
      }
      
      logger.error('API', 'Failed to send message', createLogContext({
        ...context,
        error: error as Error,
        data: { messageData }
      }))
    }
  })
}

/**
 * ✅ Hook para marcar mensajes como leídos
 */
export function useMarkMessageAsRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ messageId }: { messageId: string, conversationId: string }) => {
      if (!user?.email) {
        throw new Error('Usuario no autenticado')
      }
      
      // ✅ CORREGIDO: Retornar objeto con id para evitar error void
      await messageService.markAsRead(messageId, user.email)
      return { id: messageId, status: 'read' }
    },
    onSuccess: (updatedMessage, { conversationId }) => {
      // Actualizar mensaje en cache
      queryClient.setQueryData(
        messageKeys.conversations(conversationId),
        (oldData: CanonicalMessage[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map((msg: CanonicalMessage) => 
            msg.id === updatedMessage.id ? { ...msg, status: 'read' } : msg
          )
        }
      )
      
      console.log('[HOOK] useMarkMessageAsRead: Message marked as read:', updatedMessage.id)
    }
  })
}

/**
 * ✅ Hook para buscar mensajes
 */
export function useSearchMessages(query: {
  search?: string
  senderEmail?: string
  recipientEmail?: string
  conversationId?: string
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: messageKeys.search(query),
    queryFn: () => messageService.searchMessages(query),
    enabled: !!(query.search || query.senderEmail || query.recipientEmail || query.conversationId),
    staleTime: 1000 * 60, // 1 minuto
  })
} 

// ✅ CORREGIR: Función de normalización de mensajes MEJORADA
export const normalizeMessage = (message: any): CanonicalMessage => {
  // ✅ VALIDACIÓN BÁSICA
  if (!message) {
    console.error('[MESSAGES] Message is null or undefined')
    throw new Error('Message is required')
  }
  
  // ✅ AGREGAR: Validación de campos críticos
  if (!message.id && !message.messageId) {
    console.error('[MESSAGES] Message without ID:', message)
    throw new Error('Message must have an ID')
  }
  
  if (!message.conversationId) {
    console.error('[MESSAGES] Message without conversationId:', message)
    throw new Error('Message must have conversationId')
  }

  console.log('[MESSAGES] Normalizing message:', {
    messageId: message.id || message.messageId,
    hasContent: !!message.content,
    hasSender: !!message.sender,
    hasTimestamp: !!message.timestamp,
    rawStructure: Object.keys(message)
  })

  const normalizedMessage = {
    id: message.id || message.messageId || `msg_${Date.now()}_${Math.random()}`,
    conversationId: message.conversationId,
    content: message.content || message.text || '',
    type: message.type || 'text',
    direction: message.direction || 'outbound',
    timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
    status: message.status || 'sent',
    
    // ✅ CORREGIDO: Estructura anidada para compatibilidad
    sender: {
      email: message.sender?.email || 
             message.sender?.identifier || 
             (message as any).senderIdentifier || 
             'unknown',
      name: message.sender?.name || 'Unknown User',
      avatar: message.sender?.avatar,
      type: message.sender?.type || 'agent'
    },
    recipient: {
      email: message.recipient?.email || 
             message.recipient?.identifier || 
             (message as any).recipientIdentifier || 
             'unknown',
      name: message.recipient?.name || 'Unknown User',
      avatar: message.recipient?.avatar,
      type: message.recipient?.type || 'customer'
    },
    
    // ✅ CORREGIDO: Campos opcionales con defaults
    mediaUrl: message.mediaUrl || null,
    metadata: message.metadata || {},
    isRead: message.isRead || false,
    isDelivered: message.isDelivered || false,
    isImportant: message.isImportant || false,
    attachments: message.attachments || []
  }
  
  // ✅ AGREGAR: Logging para debugging
  console.log('[MESSAGES] Normalized message:', {
    id: normalizedMessage.id,
    conversationId: normalizedMessage.conversationId,
    hasContent: !!normalizedMessage.content,
    senderEmail: normalizedMessage.sender.email,
    recipientEmail: normalizedMessage.recipient.email
  })
  
  return normalizedMessage
}

// ✅ CORREGIR: Función para procesar mensajes entrantes y actualizar cache
export const processIncomingMessage = (
  queryClient: QueryClient,
  message: CanonicalMessage
) => {
  try {
    console.log('[MESSAGES] Processing incoming message:', {
      messageId: message.id,
      conversationId: message.conversationId,
      content: message.content?.substring(0, 50) + '...',
      timestamp: message.timestamp
    })

    // ✅ CORREGIR: Actualizar cache de React Query
    queryClient.setQueryData(
      messageKeys.conversations(message.conversationId),
      (oldData: any) => {
        if (!oldData) {
          console.log('[MESSAGES] No existing data, creating new array')
          return [message]
        }

        // ✅ CORREGIR: Evitar duplicados
        const existingIndex = oldData.findIndex((m: CanonicalMessage) => m.id === message.id)
        if (existingIndex !== -1) {
          console.log('[MESSAGES] Message already exists, updating:', message.id)
          const newData = [...oldData]
          newData[existingIndex] = message
          return newData.sort((a: CanonicalMessage, b: CanonicalMessage) => {
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          })
        }

        // ✅ CORREGIR: Agregar nuevo mensaje y ordenar por timestamp
        const newData = [...oldData, message].sort((a: CanonicalMessage, b: CanonicalMessage) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        })

        console.log('[MESSAGES] Added new message, total count:', newData.length)
        return newData
      }
    )

    // ✅ CORREGIR: Invalidar queries relacionadas para refrescar UI
    queryClient.invalidateQueries({
      queryKey: ['conversations']
    })

  } catch (error) {
    console.error('[MESSAGES] Error processing incoming message:', error, message)
  }
} 