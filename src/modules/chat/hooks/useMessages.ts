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
  
  console.log('[HOOK] useMessages called with:', {
    conversationId,
    userEmail: user?.email,
    userActive: user?.isActive,
    enabled: !!conversationId && !!user?.email && !!user?.isActive
  })
  
  return useQuery({
    queryKey: messageKeys.conversations(conversationId || 'none'),
    queryFn: async () => {
      console.log('[HOOK] useMessages queryFn executing for:', conversationId)
      
      if (!conversationId) {
        console.log('[HOOK] useMessages: No conversationId, returning empty array')
        return []
      }
      
      try {
        const messages = await messageService.getMessages(conversationId)
        console.log('[HOOK] useMessages: Success, received messages:', {
          count: messages?.length,
          messages: messages
        })
        return messages
      } catch (error) {
        console.error('[HOOK] useMessages: Error fetching messages:', error)
        logger.error('Failed to fetch messages', { conversationId, error }, 'messages_query_error')
        throw error
      }
    },
    enabled: !!conversationId && !!user?.email && !!user?.isActive,
    staleTime: 1000 * 30, // 30 segundos
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
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
    retry: 3
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
    retry: 3
  })
}

/**
 * ✅ Hook para enviar mensaje (auto-incluye email del usuario)
 */
export function useSendMessage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (messageData: SendMessageData) => {
      console.log('[HOOK] useSendMessage mutationFn called with:', messageData)
      
      // ✅ Auto-incluir email del usuario autenticado si no está presente
      const completeMessageData: SendMessageData = {
        ...messageData,
        senderEmail: messageData.senderEmail || user?.email || '',
      }
      
      console.log('[HOOK] useSendMessage sending message with complete data:', completeMessageData)
      
      try {
        const result = await messageService.sendMessage(completeMessageData)
        console.log('[HOOK] useSendMessage success:', result)
        return result
      } catch (error) {
        console.error('[HOOK] useSendMessage error:', error)
        throw error
      }
    },
    onMutate: async (messageData) => {
      console.log('[HOOK] useSendMessage onMutate called')
      
      // ✅ Optimistic update
      const conversationQueryKey = messageKeys.conversations(messageData.conversationId)
      
      await queryClient.cancelQueries({ queryKey: conversationQueryKey })
      
      const previousMessages = queryClient.getQueryData(conversationQueryKey) as any[]
      console.log('[HOOK] Previous messages:', previousMessages)
      
      // ✅ Crear mensaje optimistic con estructura correcta
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversationId: messageData.conversationId,
        content: messageData.content,
        type: messageData.type || 'text',
        direction: 'outgoing' as const,
        status: 'sending' as const,
        timestamp: new Date(),
        sender: {
          id: user?.email || '',
          name: user?.name || 'Tú',
          email: user?.email || ''
        },
        recipient: {
          id: messageData.recipientEmail || '',
          email: messageData.recipientEmail || ''
        },
        isOptimistic: true
      }
      
      console.log('[HOOK] Adding optimistic message:', optimisticMessage)
      
      queryClient.setQueryData(conversationQueryKey, (old: any) => {
        const newMessages = old ? [...old, optimisticMessage] : [optimisticMessage]
        console.log('[HOOK] Updated messages with optimistic:', newMessages)
        return newMessages
      })
      
      return { previousMessages, optimisticMessage, conversationQueryKey }
    },
    onSuccess: (sentMessage, variables, context) => {
      console.log('[HOOK] useSendMessage onSuccess called')
      console.log('[HOOK] Sent message:', sentMessage)
      
      // ✅ Reemplazar mensaje optimistic con el real
      const conversationQueryKey = context?.conversationQueryKey
      
      if (conversationQueryKey) {
        queryClient.setQueryData(conversationQueryKey, (old: any) => {
          if (!old) return [sentMessage]
          
          const updated = old.map((msg: any) => 
            msg.id === context?.optimisticMessage.id ? sentMessage : msg
          )
          console.log('[HOOK] Replaced optimistic message with real:', updated)
          return updated
        })
      }

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
      console.error('[HOOK] useSendMessage onError called')
      console.error('[HOOK] Error:', error)
      
      // ✅ Revertir optimistic update
      if (context?.previousMessages && context?.conversationQueryKey) {
        queryClient.setQueryData(context.conversationQueryKey, context.previousMessages)
        console.log('[HOOK] Reverted optimistic update')
      }

      logger.error('Failed to send message', { 
        variables, 
        error,
        senderEmail: user?.email 
      }, 'message_send_error')
    },
    onSettled: () => {
      console.log('[HOOK] useSendMessage onSettled called')
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