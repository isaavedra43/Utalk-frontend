// Hook para gestionar conexión Socket.IO en tiempo real
// Conecta con socketClient para eventos del backend UTalk
// ✅ ALINEADO CON ESTRUCTURA CANÓNICA - Validación obligatoria para WebSocket
import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socketClient } from '@/services/socketClient'
import { TypingIndicator } from '../types'
import { messageKeys } from './useMessages'
import { conversationKeys } from './useConversations'
import { MessageValidator } from '@/lib/validation'
import { logger } from '@/lib/logger'

export interface SocketState {
  isConnected: boolean
  isReconnecting: boolean
  error: string | null
}

export interface UseSocketOptions {
  conversationId?: string
  enableTyping?: boolean
  enablePresence?: boolean
}

export function useSocket(options: UseSocketOptions = {}) {
  const { conversationId, enableTyping = true, enablePresence = true } = options
  const queryClient = useQueryClient()
  
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    isReconnecting: false,
    error: null
  })
  
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])

  // Gestionar estado de conexión
  useEffect(() => {
    const handleSocketStatus = (data: { connected: boolean, reason?: string }) => {
      setSocketState(prev => ({ 
        ...prev, 
        isConnected: data.connected, 
        error: data.reason ? `Desconectado: ${data.reason}` : null,
        isReconnecting: false
      }))
    }

    const handleSocketError = (data: { error: string }) => {
      setSocketState(prev => ({ ...prev, error: data.error }))
    }

    const handleSocketReconnect = () => {
      setSocketState(prev => ({ ...prev, isReconnecting: true }))
    }

    // Eventos de conexión del socketClient
    socketClient.on('socket:status', handleSocketStatus)
    socketClient.on('socket:error', handleSocketError)
    socketClient.on('socket:reconnect', handleSocketReconnect)

    // Verificar estado inicial
    setSocketState(prev => ({ ...prev, isConnected: socketClient.connected }))

    return () => {
      socketClient.off('socket:status', handleSocketStatus)
      socketClient.off('socket:error', handleSocketError)
      socketClient.off('socket:reconnect', handleSocketReconnect)
    }
  }, [])

  // Unirse a sala de conversación específica
  useEffect(() => {
    if (conversationId && socketClient.connected) {
      socketClient.joinRoom(`conversation-${conversationId}`)
      
      return () => {
        socketClient.leaveRoom(`conversation-${conversationId}`)
      }
    }
  }, [conversationId])

  // ✅ CORRECCIÓN: Usar un efecto para manejar la invalidación de queries
  useEffect(() => {
    const handleAuthSuccess = () => {
      console.log('✅ Socket authenticated, invalidating queries...')
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }

    socketClient.on('socket:auth:success', handleAuthSuccess)

    return () => {
      socketClient.off('socket:auth:success', handleAuthSuccess)
    }
  }, [queryClient])

  // ✅ NUEVO: Manejar nuevo mensaje recibido CON VALIDACIÓN CANÓNICA
  useEffect(() => {
    const handleNewMessage = (data: { message: any, conversationId: string }) => {
      logger.info('🔍 WebSocket message received - validating with canonical structure', {
        conversationId: data.conversationId,
        messageStructure: data.message ? Object.keys(data.message) : []
      }, 'websocket_message_received')

      // ✅ VALIDACIÓN CANÓNICA OBLIGATORIA - Misma que REST
      const validatedMessages = MessageValidator.validateBackendResponse([data.message]);
      
      if (validatedMessages.length === 0) {
        logger.error('❌ WebSocket message failed canonical validation - DISCARDED', {
          conversationId: data.conversationId,
          originalMessage: data.message
        }, 'websocket_message_validation_failed')
        return; // Descartar mensaje inválido
      }

      const validatedMessage = validatedMessages[0];
      
      logger.success('✅ WebSocket message validated successfully', {
        messageId: validatedMessage.id,
        conversationId: validatedMessage.conversationId,
        type: validatedMessage.type,
        hasContent: !!validatedMessage.content
      }, 'websocket_message_validated')

      // Actualizar cache de mensajes con el mensaje VALIDADO
      queryClient.setQueryData(
        messageKeys.list(data.conversationId),
        (old: any) => {
          if (!old) return old
          
          // Verificar si el mensaje ya existe para evitar duplicados
          const exists = old.messages?.some((msg: any) => msg.id === validatedMessage.id)
          if (exists) {
            logger.info('WebSocket message already exists in cache - skipping', {
              messageId: validatedMessage.id
            }, 'websocket_message_duplicate')
            return old
          }
          
          return {
            ...old,
            messages: [...(old.messages || []), validatedMessage], // ✅ Mensaje validado
            total: (old.total || 0) + 1
          }
        }
      )

      // Actualizar último mensaje en lista de conversaciones
      queryClient.setQueriesData(
        { queryKey: conversationKeys.lists() },
        (old: any) => {
          if (!old?.conversations) return old
          return {
            ...old,
            conversations: old.conversations.map((conv: any) =>
              conv.id === data.conversationId
                ? { 
                    ...conv, 
                    lastMessage: {
                      id: validatedMessage.id,
                      content: validatedMessage.content,
                      timestamp: validatedMessage.timestamp,
                      senderName: validatedMessage.sender.name,
                      type: validatedMessage.type
                    },
                    updatedAt: new Date(),
                    unreadCount: conv.unreadCount + 1
                  }
                : conv
            )
          }
        }
      )

      // Invalidar queries para refrescar
      queryClient.invalidateQueries({ queryKey: messageKeys.list(validatedMessage.conversationId) })
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() })
    }

    socketClient.on('message:new', handleNewMessage)
    return () => socketClient.off('message:new', handleNewMessage)
  }, [queryClient])

  // Manejar mensaje marcado como leído
  useEffect(() => {
    const handleMessageRead = (data: { messageId: string, conversationId: string }) => {
      logger.info('📖 WebSocket message read event received', {
        messageId: data.messageId,
        conversationId: data.conversationId
      }, 'websocket_message_read')

      // Actualizar estado del mensaje en cache
      queryClient.setQueryData(
        messageKeys.list(data.conversationId),
        (old: any) => {
          if (!old?.messages) return old
          return {
            ...old,
            messages: old.messages.map((msg: any) =>
              msg.id === data.messageId ? { ...msg, isRead: true } : msg
            )
          }
        }
      )
    }

    socketClient.on('message:read', handleMessageRead)
    return () => socketClient.off('message:read', handleMessageRead)
  }, [queryClient])

  // Manejar indicadores de typing
  useEffect(() => {
    if (!enableTyping) return

    const handleTyping = (data: { userId: string, userName: string, conversationId: string, isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => {
          // Remover indicador existente del mismo usuario
          const filtered = prev.filter(user => user.userId !== data.userId)
          return [...filtered, { 
            ...data, 
            timestamp: new Date()
          }]
        })

        // Auto-remover después de 3 segundos
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(user => user.userId !== data.userId))
        }, 3000)
      } else {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId))
      }
    }

    socketClient.on('conversation:typing', handleTyping)

    return () => {
      socketClient.off('conversation:typing', handleTyping)
    }
  }, [enableTyping])

  // Funciones para emitir eventos usando la API pública
  const startTyping = useCallback((conversationId: string) => {
    if (enableTyping && socketClient.connected) {
      socketClient.startTyping(conversationId)
    }
  }, [enableTyping])

  const stopTyping = useCallback((conversationId: string) => {
    if (enableTyping && socketClient.connected) {
      socketClient.stopTyping(conversationId)
    }
  }, [enableTyping])

  const sendPresenceUpdate = useCallback((status: 'online' | 'offline' | 'away') => {
    if (enablePresence && socketClient.connected) {
      socketClient.send('user:status', { status })
    }
  }, [enablePresence])

  // Reconectar manualmente
  const reconnect = useCallback(() => {
    socketClient.reconnect()
  }, [])

  // Desconectar manualmente
  const disconnect = useCallback(() => {
          socketClient.disconnectSocket()
  }, [])

  return {
    // Estado de la conexión
    ...socketState,
    
    // Datos en tiempo real
    typingUsers: conversationId 
      ? typingUsers.filter(user => user.conversationId === conversationId)
      : typingUsers,
    
    // Funciones para emitir eventos
    startTyping,
    stopTyping,
    sendPresenceUpdate,
    
    // Control de conexión
    reconnect,
    disconnect,
    
    // Información del socket
    socketId: 'socket-id', // El socketClient no expone el ID
  }
}

// Hook específico para una conversación
export function useConversationSocket(conversationId: string) {
  return useSocket({ conversationId, enableTyping: true, enablePresence: false })
}

// Hook para indicadores de typing con debounce
export function useTypingIndicator(conversationId: string, delay = 500) {
  const { startTyping, stopTyping } = useSocket({ conversationId })
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (isTyping) {
      startTyping(conversationId)
      
      // Auto-stop después del delay
      timeoutId = setTimeout(() => {
        setIsTyping(false)
        stopTyping(conversationId)
      }, delay)
    } else {
      stopTyping(conversationId)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isTyping, conversationId, startTyping, stopTyping, delay])

  const triggerTyping = useCallback(() => {
    setIsTyping(true)
  }, [])

  const stopTypingNow = useCallback(() => {
    setIsTyping(false)
  }, [])

  return {
    isTyping,
    triggerTyping,
    stopTyping: stopTypingNow
  }
} 