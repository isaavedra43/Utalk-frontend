// Hook para gestionar mensajes de chat
// ✅ ALINEADO CON UID DE FIREBASE + FIRESTORE SYNC
// Conecta con messageService para obtener datos del backend
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageService, SendMessageData } from '../services/messageService'
import { logger } from '@/lib/logger'
import { useAuth } from '@/hooks'

// ✅ ACTUALIZADO: Query keys con contexto UID
export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (conversationId: string) => [...messageKeys.lists(), conversationId] as const,
  bySender: (uid: string) => [...messageKeys.all, 'sender', uid] as const,
  byRecipient: (uid: string) => [...messageKeys.all, 'recipient', uid] as const,
  search: (query: string, filters?: any) => [...messageKeys.all, 'search', query, filters] as const,
  stats: () => [...messageKeys.all, 'stats'] as const
}

// ✅ ACTUALIZADO: Hook principal con contexto UID
export function useMessages(conversationId: string, page = 1, limit = 50) {
  const { user, isAuthenticated, isAuthReady } = useAuth()
  
  console.log('🎣 useMessages hook called with UID context:', { 
    conversationId, 
    page, 
    limit,
    userUid: user?.uid,
    userRole: user?.firestoreData?.role
  });
  
  const result = useQuery({
    queryKey: messageKeys.list(conversationId),
    queryFn: async () => {
      console.log('🔄 useMessages: Executing queryFn with UID context:', {
        conversationId,
        userUid: user?.uid,
        userRole: user?.firestoreData?.role
      });
      
      const response = await messageService.getMessages(conversationId, page, limit);
      
      console.log('📦 useMessages: Service response with UID context:', {
        conversationId,
        messagesCount: response.messages?.length,
        total: response.total,
        userUid: user?.uid
      });
      
      return response;
    },
    // ✅ Solo ejecutar si usuario está autenticado, auth está listo Y existe en Firestore
    enabled: !!conversationId && isAuthenticated && isAuthReady && !!user?.syncStatus?.isFirestoreUser,
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: true,
    onSuccess: (data) => {
      console.log('✅ useMessages: Query success with UID context:', {
        conversationId,
        messagesCount: data.messages?.length,
        total: data.total,
        userUid: user?.uid,
        userRole: user?.firestoreData?.role
      });
    },
    onError: (error) => {
      console.error('❌ useMessages: Query error:', { 
        conversationId, 
        error,
        userUid: user?.uid
      });
    }
  })

  // ✅ NUEVO: Log del estado del hook con contexto UID
  console.log('📊 useMessages hook state:', {
    conversationId,
    isLoading: result.isLoading,
    isError: result.isError,
    isFetching: result.isFetching,
    isSuccess: result.isSuccess,
    dataExists: !!result.data,
    messagesCount: result.data?.messages?.length || 0,
    error: result.error,
    userUid: user?.uid,
    userRole: user?.firestoreData?.role,
    isFirestoreUser: user?.syncStatus?.isFirestoreUser
  });

  logger.hook('useMessages', {
    input: { 
      conversationId, 
      page, 
      limit,
      userUid: user?.uid 
    },
    loading: result.isLoading,
    error: result.error,
    dataLength: result.data?.messages?.length,
    output: result.data ? {
      total: result.data.total,
      messagesCount: result.data.messages?.length,
      userContext: {
        uid: user?.uid,
        role: user?.firestoreData?.role
      }
    } : undefined
  })

  return result
}

// ✅ NUEVO: Hook para mensajes por remitente UID
export function useMessagesBySenderUid(uid: string, page = 1, limit = 50) {
  const { user, isAuthenticated, isAuthReady } = useAuth()

  return useQuery({
    queryKey: messageKeys.bySender(uid),
    queryFn: async () => {
      console.log('🔄 useMessagesBySenderUid: Fetching for UID:', uid)
      return await messageService.getMessagesBySenderUid(uid, page, limit)
    },
    enabled: isAuthenticated && isAuthReady && !!user?.syncStatus?.isFirestoreUser && !!uid,
    staleTime: 2 * 60 * 1000,
    onSuccess: (data) => {
      console.log('✅ useMessagesBySenderUid: Success for UID:', {
        senderUid: uid,
        messagesCount: data.messages.length
      })
    }
  })
}

// ✅ NUEVO: Hook para mensajes por destinatario UID
export function useMessagesByRecipientUid(uid: string, page = 1, limit = 50) {
  const { user, isAuthenticated, isAuthReady } = useAuth()

  return useQuery({
    queryKey: messageKeys.byRecipient(uid),
    queryFn: async () => {
      console.log('🔄 useMessagesByRecipientUid: Fetching for UID:', uid)
      return await messageService.getMessagesByRecipientUid(uid, page, limit)
    },
    enabled: isAuthenticated && isAuthReady && !!user?.syncStatus?.isFirestoreUser && !!uid,
    staleTime: 2 * 60 * 1000,
    onSuccess: (data) => {
      console.log('✅ useMessagesByRecipientUid: Success for UID:', {
        recipientUid: uid,
        messagesCount: data.messages.length
      })
    }
  })
}

// ✅ ACTUALIZADO: Hook para enviar mensajes con UID
export function useSendMessage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const perfId = logger.startPerformance('send_message_mutation')

  const mutation = useMutation({
    mutationFn: (data: SendMessageData) => {
      // ✅ CRÍTICO: Auto-agregar UID del remitente si no está presente
      const enhancedData = {
        ...data,
        senderUid: data.senderUid || user?.uid // ✅ Usar UID del usuario actual
      }
      
      console.log('📤 useSendMessage: Sending with UID context:', {
        conversationId: enhancedData.conversationId,
        senderUid: enhancedData.senderUid,
        recipientUid: enhancedData.recipientUid,
        contentLength: enhancedData.content.length,
        userUid: user?.uid
      })
      
      return messageService.sendMessage(enhancedData).then(result => {
        logger.endPerformance(perfId, `Message sent successfully by UID: ${enhancedData.senderUid}`)
        return result
      })
    },
    
    onMutate: async (data) => {
      // ✅ Cancelar queries en vuelo para evitar sobrescritura
      await queryClient.cancelQueries({ queryKey: messageKeys.list(data.conversationId) })

      // ✅ Snapshot del estado anterior
      const previousMessages = queryClient.getQueryData(messageKeys.list(data.conversationId))

      // ✅ ACTUALIZADO: Actualización optimista con UID
      queryClient.setQueryData(messageKeys.list(data.conversationId), (old: any) => {
        if (!old) return old

        const optimisticMessage = {
          id: `temp-${Date.now()}`,
          conversationId: data.conversationId,
          content: data.content,
          type: data.type,
          timestamp: new Date(),
          sender: {
            uid: data.senderUid || user?.uid,  // ✅ UID del remitente
            id: data.senderUid || user?.uid,   // ✅ Compatibilidad
            name: user?.firestoreData?.name || user?.displayName || 'Usuario',
            type: 'agent'
          },
          status: 'sending',
          direction: 'outbound',
          isRead: false,
          isDelivered: false,
          isImportant: false,
          metadata: { 
            isPending: true,
            senderUid: data.senderUid || user?.uid
          }
        }

        return {
          ...old,
          messages: [...(old.messages || []), optimisticMessage],
          total: (old.total || 0) + 1
        }
      })

      console.log('🔄 useSendMessage: Optimistic update applied with UID:', {
        conversationId: data.conversationId,
        senderUid: data.senderUid || user?.uid
      })

      return { previousMessages }
    },

    onSuccess: (response, data) => {
      console.log('✅ useSendMessage: Message sent successfully:', {
        messageId: response.message.id,
        conversationId: data.conversationId,
        senderUid: data.senderUid || user?.uid
      })

      // ✅ Actualizar con mensaje real del servidor
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

      // ✅ Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: messageKeys.list(data.conversationId) })
      
      // ✅ Si el remitente es el usuario actual, invalidar sus mensajes
      if ((data.senderUid || user?.uid) === user?.uid && user?.uid) {
        queryClient.invalidateQueries({ queryKey: messageKeys.bySender(user.uid) })
      }
    },

    onError: (error, data, context) => {
      console.error('❌ useSendMessage: Error sending message:', {
        error,
        conversationId: data.conversationId,
        senderUid: data.senderUid || user?.uid
      })

      // ✅ Revertir actualización optimista
      if (context?.previousMessages) {
        queryClient.setQueryData(messageKeys.list(data.conversationId), context.previousMessages)
      }
    }
  })

  return mutation
}

// ✅ NUEVO: Hook para búsqueda de mensajes con filtros UID
export function useSearchMessages(query: string, filters?: {
  senderUid?: string;
  recipientUid?: string;
  conversationId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const { user, isAuthenticated, isAuthReady } = useAuth()

  return useQuery({
    queryKey: messageKeys.search(query, filters),
    queryFn: async () => {
      console.log('🔍 useSearchMessages: Searching with UID filters:', {
        query,
        filters,
        userUid: user?.uid
      })
      return await messageService.searchMessages(query, filters)
    },
    enabled: isAuthenticated && isAuthReady && !!user?.syncStatus?.isFirestoreUser && !!query && query.length > 2,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      console.log('✅ useSearchMessages: Search successful:', {
        query,
        filters,
        messagesCount: data.messages.length,
        userUid: user?.uid
      })
    }
  })
}

// Hook para marcar mensaje como leído
export function useMarkMessageAsRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (messageId: string) => {
      console.log('🔄 useMarkMessageAsRead: Marking as read:', {
        messageId,
        markedByUid: user?.uid
      })
      await messageService.markAsRead(messageId)
      return messageId
    },
    onSuccess: (messageId) => {
      console.log('✅ useMarkMessageAsRead: Message marked as read:', {
        messageId,
        markedByUid: user?.uid
      })
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: messageKeys.lists() })
    },
    onError: (error) => {
      console.error('❌ useMarkMessageAsRead: Error:', error)
    }
  })
}

// Hook para estadísticas de mensajes
export function useMessageStats() {
  const { user, isAuthenticated, isAuthReady } = useAuth()

  return useQuery({
    queryKey: messageKeys.stats(),
    queryFn: async () => {
      console.log('🔄 useMessageStats: Fetching stats for user:', user?.uid)
      return await messageService.getMessageStats()
    },
    enabled: isAuthenticated && isAuthReady && !!user?.syncStatus?.isFirestoreUser,
    staleTime: 10 * 60 * 1000, // 10 minutos
    onSuccess: (data) => {
      console.log('✅ useMessageStats: Success for user:', {
        userUid: user?.uid,
        stats: data
      })
    }
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