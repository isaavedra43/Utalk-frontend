// Hook para gestión de mensajes con React Query
// ✅ RESTAURADO: Implementación original que funcionaba
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { messageService } from '../services/messageService'

/**
 * ✅ Hook principal para obtener mensajes de una conversación
 * ✅ RESTAURADO: Implementación original con React Query
 */
export function useMessages(conversationId: string, enablePagination = false) {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  
  // ✅ VALIDACIÓN DEFENSIVA BÁSICA
  if (!conversationId || !isAuthenticated) {
    return {
      messages: [], 
      isLoading: false,
      error: null,
      hasValidMessages: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: () => Promise.resolve(),
      refetch: () => Promise.resolve()
    }
  }

  // ✅ QUERY PARA MENSAJES - DATOS REALES
  const messagesQuery = useQuery(['messages', conversationId], async () => {
    console.log('🌐 [MESSAGES] Iniciando fetch de mensajes para conversación:', conversationId)
    
    try {
      const messages = await messageService.getMessages(conversationId)
      
      console.log(`✅ [MESSAGES] Mensajes obtenidos: ${Array.isArray(messages) ? messages.length : 0}`)
      
      return messages
    } catch (error: any) {
      console.error('❌ [MESSAGES] Error obteniendo mensajes:', error)
      throw error
    }
  }, {
    enabled: !!conversationId && isAuthenticated,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 2 * 60 * 1000, // 2 minutos
    cacheTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchInterval: 30000, // Refetch cada 30 segundos para mensajes en tiempo real
  })

  // ✅ NORMALIZACIÓN SEGURA
  const normalizedMessages = useMemo(() => {
    const messagesData = messagesQuery.data
    
    if (!messagesData) return []
    if (!Array.isArray(messagesData)) return []
    
    return messagesData.sort((a: any, b: any) => {
      const timeA = new Date(a.timestamp || 0).getTime()
      const timeB = new Date(b.timestamp || 0).getTime()
      return timeA - timeB
    })
  }, [messagesQuery.data])

  // ✅ MUTATION PARA ENVIAR MENSAJES
  const sendMessageMutation = useMutation(async (messageData: any) => {
    return await messageService.sendMessage(messageData)
  }, {
    onSuccess: (newMessage) => {
      // Invalidar query para refetch automático
      queryClient.invalidateQueries(['messages', conversationId])
      
      console.log('✅ [MESSAGES] Mensaje enviado exitosamente:', newMessage?.id)
    },
    onError: (error: any) => {
      console.error('❌ [MESSAGES] Error enviando mensaje:', error)
    }
  })

  // ✅ FUNCIÓN PARA ENVIAR MENSAJE
  const sendMessage = useCallback(async (messageData: any) => {
    return sendMessageMutation.mutateAsync(messageData)
  }, [sendMessageMutation])

  // ✅ ESTADO FINAL
  const hasValidMessages = Array.isArray(normalizedMessages) && normalizedMessages.length > 0

  return {
    messages: normalizedMessages,
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    hasValidMessages,
    refetch: messagesQuery.refetch,
    sendMessage,
    isSending: sendMessageMutation.isLoading,
    sendError: sendMessageMutation.error,
    // Para compatibilidad con paginación
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: () => Promise.resolve()
  }
} 