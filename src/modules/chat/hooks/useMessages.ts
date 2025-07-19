// Hook para gestionar mensajes con React Query
// Conecta con messageService para obtener datos del backend UTalk
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import messageService, { SendMessageData } from '../services/messageService'
import { logger } from '@/lib/logger'

// Claves de query para invalidaciones y cache
export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (conversationId: string) => [...messageKeys.lists(), conversationId] as const,
  search: (query: string) => [...messageKeys.all, 'search', query] as const,
  stats: () => [...messageKeys.all, 'stats'] as const,
}

// Hook principal para obtener mensajes de una conversación
export function useMessages(conversationId: string, page = 1, limit = 50) {
  console.log('🎣 useMessages hook called:', { conversationId, page, limit });
  
  const result = useQuery({
    queryKey: messageKeys.list(conversationId),
    queryFn: async () => {
      console.log('🔄 useMessages: Executing queryFn for conversation:', conversationId);
      const response = await messageService.getMessages(conversationId, page, limit);
      console.log('📦 useMessages: Service response:', response);
      return response;
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      console.log('✅ useMessages: Query success:', {
        conversationId,
        messagesCount: data.messages?.length,
        total: data.total,
        firstMessage: data.messages?.[0]
      });
    },
    onError: (error) => {
      console.error('❌ useMessages: Query error:', { conversationId, error });
    }
  })

  // Log del estado del hook
  console.log('📊 useMessages hook state:', {
    conversationId,
    isLoading: result.isLoading,
    isError: result.isError,
    isFetching: result.isFetching,
    isSuccess: result.isSuccess,
    dataExists: !!result.data,
    messagesCount: result.data?.messages?.length || 0,
    error: result.error
  });

  logger.hook('useMessages', {
    input: { conversationId, page, limit },
    loading: result.isLoading,
    error: result.error,
    dataLength: result.data?.messages?.length,
    output: result.data ? {
      total: result.data.total,
      messagesCount: result.data.messages?.length
    } : undefined
  })

  return result
}

// Hook para obtener todos los mensajes con filtros
export function useAllMessages(filters: { search?: string, status?: string } = {}) {
  return useQuery({
    queryKey: [...messageKeys.lists(), 'all', filters],
    queryFn: () => messageService.getAllMessages(filters),
    staleTime: 60 * 1000, // 1 minuto
  })
}

// Hook para buscar mensajes
export function useSearchMessages(query: string) {
  return useQuery({
    queryKey: messageKeys.search(query),
    queryFn: () => messageService.searchMessages(query),
    enabled: query.length > 2, // Solo buscar si hay al menos 3 caracteres
    staleTime: 30 * 1000,
  })
}

// Hook para obtener estadísticas de mensajes
export function useMessageStats() {
  return useQuery({
    queryKey: messageKeys.stats(),
    queryFn: () => messageService.getMessageStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para enviar mensaje
export function useSendMessage() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: SendMessageData) => {
      const perfId = logger.startPerformance('send_message')
      logger.info(`Sending message to conversation ${data.conversationId}`, {
        type: data.type,
        contentLength: data.content.length,
        hasMedia: !!data.media
      }, 'send_message_start')
      
      return messageService.sendMessage(data).then(result => {
        logger.endPerformance(perfId, `Message sent successfully`)
        return result
      })
    },
    onMutate: async (data) => {
      // Optimistic update - añadir mensaje inmediatamente
      await queryClient.cancelQueries({ queryKey: messageKeys.list(data.conversationId) })

      const previousMessages = queryClient.getQueryData(messageKeys.list(data.conversationId))

      // Crear mensaje optimistic
      const optimisticMessage = {
        id: `temp_${Date.now()}`,
        conversationId: data.conversationId,
        content: data.content,
        type: data.type,
        timestamp: new Date(),
        sender: {
          id: 'current-user',
          name: 'Tú',
          type: 'agent' as const,
          avatar: undefined
        },
        isRead: false,
        isDelivered: false,
        attachments: data.media ? [{
          id: `temp_media_${Date.now()}`,
          name: data.media.name || 'Archivo',
          url: data.media.url,
          type: data.media.type,
          size: 0
        }] : undefined,
        metadata: {
          isPending: true
        }
      }

      // Actualizar query con mensaje optimistic
      queryClient.setQueryData(
        messageKeys.list(data.conversationId),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            messages: [...(old.messages || []), optimisticMessage]
          }
        }
      )

      logger.success(`Optimistic message added to conversation ${data.conversationId}`, null, 'optimistic_message')

      return { previousMessages, optimisticMessage }
    },
    onError: (error, data, context) => {
      // Revertir optimistic update en caso de error
      if (context?.previousMessages) {
        queryClient.setQueryData(messageKeys.list(data.conversationId), context.previousMessages)
      }
      
      logger.error(`Failed to send message to conversation ${data.conversationId}`, error, 'send_message_error')
    },
    onSuccess: (response, data) => {
      // Actualizar con el mensaje real del backend
      queryClient.setQueryData(
        messageKeys.list(data.conversationId),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            messages: old.messages.map((msg: any) => 
              msg.metadata?.isPending && msg.content === data.content
                ? response.message
                : msg
            )
          }
        }
      )

      // Invalidar lista de conversaciones para actualizar último mensaje
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      
      logger.success(`Message sent successfully to conversation ${data.conversationId}`, {
        messageId: response.message?.id,
        timestamp: response.message?.timestamp
      }, 'send_message_success')
    },
  })

  // Log del estado de la mutación
  logger.hook('useSendMessage', {
    loading: mutation.isPending,
    error: mutation.error
  })

  return mutation
}

// Hook para marcar mensaje como leído
export function useMarkMessageAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: string) => messageService.markAsRead(messageId),
    onSuccess: (_, messageId) => {
      // Actualizar mensajes optimísticamente
      queryClient.setQueriesData(
        { queryKey: messageKeys.lists() },
        (old: any) => {
          if (!old?.messages) return old
          return {
            ...old,
            messages: old.messages.map((msg: any) =>
              msg.id === messageId ? { ...msg, isRead: true } : msg
            )
          }
        }
      )
    },
  })
}

// Hook para marcar múltiples mensajes como leídos
export function useMarkMultipleMessagesAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageIds: string[]) => messageService.markMultipleAsRead(messageIds),
    onSuccess: (_, messageIds) => {
      // Actualizar mensajes optimísticamente
      queryClient.setQueriesData(
        { queryKey: messageKeys.lists() },
        (old: any) => {
          if (!old?.messages) return old
          return {
            ...old,
            messages: old.messages.map((msg: any) =>
              messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
            )
          }
        }
      )
    },
  })
}

// Hook para actualizar estado de mensaje
export function useUpdateMessageStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, status }: { messageId: string; status: string }) =>
      messageService.updateStatus(messageId, status),
    onSuccess: (_, { messageId, status }) => {
      // Actualizar mensajes optimísticamente
      queryClient.setQueriesData(
        { queryKey: messageKeys.lists() },
        (old: any) => {
          if (!old?.messages) return old
          return {
            ...old,
            messages: old.messages.map((msg: any) =>
              msg.id === messageId 
                ? { 
                    ...msg, 
                    isRead: status === 'read',
                    isDelivered: ['delivered', 'read'].includes(status)
                  } 
                : msg
            )
          }
        }
      )
    },
  })
}

// Hook para refrescar mensajes de una conversación
export function useRefreshMessages() {
  const queryClient = useQueryClient()

  return (conversationId: string) => {
    queryClient.invalidateQueries({ queryKey: messageKeys.list(conversationId) })
  }
}

// Hook para obtener último mensaje de una conversación
export function useLastMessage(conversationId: string) {
  const { data: messagesData } = useMessages(conversationId)
  
  const lastMessage = messagesData?.messages?.[messagesData.messages.length - 1]
  
  return lastMessage
}

// Hook para optimistic updates de mensajes
export function useOptimisticMessageUpdate() {
  const queryClient = useQueryClient()

  return {
    addMessageOptimistically: (conversationId: string, message: any) => {
      queryClient.setQueryData(
        messageKeys.list(conversationId),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            messages: [...(old.messages || []), message]
          }
        }
      )
    },
    updateMessageOptimistically: (conversationId: string, messageId: string, updates: any) => {
      queryClient.setQueryData(
        messageKeys.list(conversationId),
        (old: any) => {
          if (!old?.messages) return old
          return {
            ...old,
            messages: old.messages.map((msg: any) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            )
          }
        }
      )
    }
  }
} 