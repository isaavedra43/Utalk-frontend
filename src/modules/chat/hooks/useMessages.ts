// Hook para gestión de mensajes
// ✅ EMAIL-FIRST: Todos los identificadores usan email
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messageService } from '../services/messageService'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'
import type { SendMessageData } from '../types'

// ✅ Query keys usando EMAIL
export const messageKeys = {
  all: ['messages'] as const,
  conversations: (conversationId: string) => [...messageKeys.all, 'conversation', conversationId] as const,
  bySender: (email: string) => [...messageKeys.all, 'bySender', email] as const,
  byRecipient: (email: string) => [...messageKeys.all, 'byRecipient', email] as const,
  search: (query: any) => [...messageKeys.all, 'search', query] as const,
}

/**
 * ✅ Hook para obtener mensajes de una conversación
 */
export function useMessages(conversationId?: string) {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: messageKeys.conversations(conversationId || 'none'),
    queryFn: () => {
      if (!conversationId) return []
      return messageService.getMessages(conversationId)
    },
    enabled: !!conversationId && !!user?.email && !!user?.isActive,
    staleTime: 1000 * 30, // 30 segundos
    refetchOnWindowFocus: true,
    onError: (error) => {
      logger.error('Failed to fetch messages', { conversationId, error }, 'messages_query_error')
    }
  })
}

/**
 * ✅ Hook para obtener mensajes por email del remitente
 */
export function useMessagesBySenderEmail(senderEmail: string) {
  return useQuery({
    queryKey: messageKeys.bySender(senderEmail),
    queryFn: () => messageService.getMessagesBySenderEmail(senderEmail),
    enabled: !!senderEmail,
    staleTime: 1000 * 60 * 2, // 2 minutos
    onError: (error) => {
      logger.error('Failed to fetch messages by sender email', { senderEmail, error }, 'messages_by_sender_error')
    }
  })
}

/**
 * ✅ Hook para obtener mensajes por email del destinatario
 */
export function useMessagesByRecipientEmail(recipientEmail: string) {
  return useQuery({
    queryKey: messageKeys.byRecipient(recipientEmail),
    queryFn: () => messageService.getMessagesByRecipientEmail(recipientEmail),
    enabled: !!recipientEmail,
    staleTime: 1000 * 60 * 2, // 2 minutos
    onError: (error) => {
      logger.error('Failed to fetch messages by recipient email', { recipientEmail, error }, 'messages_by_recipient_error')
    }
  })
}

/**
 * ✅ Hook para enviar mensaje (auto-incluye email del usuario)
 */
export function useSendMessage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (messageData: SendMessageData) => {
      // ✅ Auto-incluir email del usuario autenticado si no está presente
      const completeMessageData: SendMessageData = {
        ...messageData,
        senderEmail: messageData.senderEmail || user?.email || '',
      }
      
      return messageService.sendMessage(completeMessageData)
    },
    onMutate: async (messageData) => {
      // ✅ Optimistic update
      const conversationQueryKey = messageKeys.conversations(messageData.conversationId)
      
      await queryClient.cancelQueries({ queryKey: conversationQueryKey })
      
      const previousMessages = queryClient.getQueryData(conversationQueryKey)
      
      // ✅ Crear mensaje optimistic con email
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversationId: messageData.conversationId,
        senderPhone: user?.email || '',
        recipientPhone: messageData.recipientEmail,
        content: messageData.content,
        type: messageData.type || 'text',
        status: 'sending' as const,
        isOptimistic: true
      }
      
      queryClient.setQueryData(conversationQueryKey, (old: any) => {
        return old ? [...old, optimisticMessage] : [optimisticMessage]
      })
      
      return { previousMessages, optimisticMessage }
    },
    onSuccess: (sentMessage, variables, context) => {
      // ✅ Reemplazar mensaje optimistic con el real
      const conversationQueryKey = messageKeys.conversations(variables.conversationId)
      
      queryClient.setQueryData(conversationQueryKey, (old: any) => {
        if (!old) return [sentMessage]
        
        return old.map((msg: any) => 
          msg.id === context?.optimisticMessage.id ? sentMessage : msg
        )
      })

      // ✅ Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: messageKeys.bySender(user?.email || '') })
      queryClient.invalidateQueries({ queryKey: messageKeys.byRecipient(variables.recipientEmail ?? '') })

      logger.success('Message sent successfully', {
        messageId: sentMessage.id,
        conversationId: variables.conversationId,
        senderEmail: user?.email
      }, 'message_send_success')
    },
    onError: (error, variables, context) => {
      // ✅ Revertir optimistic update
      if (context?.previousMessages) {
        const conversationQueryKey = messageKeys.conversations(variables.conversationId)
        queryClient.setQueryData(conversationQueryKey, context.previousMessages)
      }

      logger.error('Failed to send message', { 
        variables, 
        error,
        senderEmail: user?.email 
      }, 'message_send_error')
    }
  })
}

/**
 * ✅ Hook para marcar mensaje como leído
 */
export function useMarkMessageAsRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (messageId: string) => 
      messageService.markAsRead(messageId, user?.email || ''),
    onSuccess: (updatedMessage) => {
      // ✅ Invalidar queries de la conversación
      queryClient.invalidateQueries({ 
        queryKey: messageKeys.conversations(updatedMessage.conversationId) 
      })

      logger.success('Message marked as read', {
        messageId: updatedMessage.id,
        markedBy: user?.email
      }, 'message_mark_read_success')
    },
    onError: (error, messageId) => {
      logger.error('Failed to mark message as read', { 
        messageId, 
        error,
        markedBy: user?.email 
      }, 'message_mark_read_error')
    }
  })
}

/**
 * ✅ Hook para buscar mensajes con filtros EMAIL-FIRST
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
    staleTime: 1000 * 60 * 5, // 5 minutos
    onError: (error) => {
      logger.error('Failed to search messages', { query, error }, 'message_search_error')
    }
  })
}

/**
 * ✅ Hook para estadísticas de mensajes
 */
export function useMessageStats() {
  return useQuery({
    queryKey: [...messageKeys.all, 'stats'],
    queryFn: () => messageService.getMessageStats(),
    staleTime: 1000 * 60 * 10, // 10 minutos
    onError: (error) => {
      logger.error('Failed to fetch message stats', { error }, 'message_stats_error')
    }
  })
} 