// Hook de WebSocket para chat en tiempo real
// ✅ EVENTOS CRÍTICOS: new-message, message-read, typing-start/stop
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { messageKeys } from './useMessages'
import { logger } from '@/lib/logger'
import type { CanonicalMessage } from '@/types/canonical'
import { io, Socket } from 'socket.io-client'

// ✅ Estados de conexión WebSocket
interface SocketState {
  isConnected: boolean
  isReconnecting: boolean
  lastError: string | null
  currentRoom: string | null
}

// ✅ Typing Indicator usando EMAIL
interface TypingIndicator {
  userEmail: string
  userName?: string
  conversationId: string
  timestamp: Date
}

export function useSocket() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    isReconnecting: false,
    lastError: null,
    currentRoom: null
  })

  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])

  // ✅ Conectar WebSocket con autenticación JWT
  const connect = useCallback(() => {
    if (!user?.email) {
      console.log('[SOCKET] No user email, skipping connection')
      return
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.log('[SOCKET] No auth token, skipping connection')
      return
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000'
    
    console.log('[SOCKET] Connecting to WebSocket...', {
      url: wsUrl,
      userEmail: user.email,
      hasToken: !!token
    })

    // Crear conexión Socket.IO con autenticación
    socketRef.current = io(wsUrl, {
      auth: {
        token,
        email: user.email
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      forceNew: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })

    const socket = socketRef.current

    // ✅ Eventos de conexión
    socket.on('connect', () => {
      console.log('[SOCKET] Connected successfully', { socketId: socket.id })
      setSocketState(prev => ({
        ...prev,
        isConnected: true,
        isReconnecting: false,
        lastError: null
      }))
      
      logger.success('WebSocket connected', {
        socketId: socket.id,
        userEmail: user.email
      }, 'socket_connected')
    })

    socket.on('disconnect', (reason) => {
      console.log('[SOCKET] Disconnected:', reason)
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        currentRoom: null
      }))
      
      logger.warn('WebSocket disconnected', { 
        reason,
        userEmail: user.email 
      }, 'socket_disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('[SOCKET] Connection error:', error)
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        lastError: error.message
      }))
      
      logger.error('WebSocket connection error', { 
        error: error.message,
        userEmail: user.email 
      }, 'socket_connection_error')
    })

    socket.on('reconnect', (attemptNumber) => {
      console.log('[SOCKET] Reconnected after', attemptNumber, 'attempts')
      setSocketState(prev => ({
        ...prev,
        isReconnecting: false
      }))
    })

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[SOCKET] Reconnection attempt', attemptNumber)
      setSocketState(prev => ({
        ...prev,
        isReconnecting: true
      }))
    })

    // ✅ EVENTO CRÍTICO: Nuevo mensaje
    socket.on('new-message', (message: CanonicalMessage) => {
      console.log('[SOCKET] New message received:', message)
      
      try {
        // Actualizar cache de React Query con el nuevo mensaje
        queryClient.setQueryData(
          messageKeys.conversations(message.conversationId),
          (old: CanonicalMessage[] | undefined) => {
            if (!old) return [message]
            
            // Evitar duplicados
            const exists = old.some(msg => msg.id === message.id)
            if (exists) {
              console.log('[SOCKET] Message already exists, skipping')
              return old
            }
            
            return [...old, message]
          }
        )

        // También actualizar cache infinito si existe
        queryClient.setQueryData(
          messageKeys.infinite(message.conversationId),
          (old: any) => {
            if (!old) return old
            const newPages = [...old.pages]
            if (newPages.length > 0) {
              const exists = newPages[0].messages.some((msg: CanonicalMessage) => msg.id === message.id)
              if (!exists) {
                newPages[0] = {
                  ...newPages[0],
                  messages: [...newPages[0].messages, message]
                }
              }
            }
            return { ...old, pages: newPages }
          }
        )

        logger.success('New message processed via WebSocket', {
          messageId: message.id,
          conversationId: message.conversationId,
          senderEmail: message.sender.id
        }, 'socket_new_message')

      } catch (error) {
        console.error('[SOCKET] Error processing new message:', error)
        logger.error('Failed to process new message from WebSocket', {
          messageId: message.id,
          error
        }, 'socket_new_message_error')
      }
    })

    // ✅ EVENTO CRÍTICO: Mensaje leído
    socket.on('message-read', (data: { messageId: string; conversationId: string; readBy: string; readAt: string }) => {
      console.log('[SOCKET] Message read event:', data)
      
      try {
        // Actualizar estado del mensaje en cache
        queryClient.setQueryData(
          messageKeys.conversations(data.conversationId),
          (old: CanonicalMessage[] | undefined) => {
            if (!old) return old
            
            return old.map(msg => 
              msg.id === data.messageId 
                ? { ...msg, isRead: true, status: 'read' as const }
                : msg
            )
          }
        )

        logger.success('Message read status updated via WebSocket', {
          messageId: data.messageId,
          conversationId: data.conversationId,
          readBy: data.readBy
        }, 'socket_message_read')

      } catch (error) {
        console.error('[SOCKET] Error processing message read:', error)
        logger.error('Failed to process message read from WebSocket', {
          messageId: data.messageId,
          error
        }, 'socket_message_read_error')
      }
    })

    // ✅ EVENTO CRÍTICO: Usuario escribiendo
    socket.on('typing-start', (data: { userEmail: string; userName: string; conversationId: string }) => {
      console.log('[SOCKET] Typing start:', data)
      
      // No mostrar typing del propio usuario
      if (data.userEmail === user.email) return
      
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userEmail !== data.userEmail || u.conversationId !== data.conversationId)
        return [...filtered, {
          userEmail: data.userEmail,
          userName: data.userName,
          conversationId: data.conversationId,
          timestamp: new Date()
        }]
      })
    })

    // ✅ EVENTO CRÍTICO: Usuario dejó de escribir
    socket.on('typing-stop', (data: { userEmail: string; conversationId: string }) => {
      console.log('[SOCKET] Typing stop:', data)
      
      setTypingUsers(prev => 
        prev.filter(u => !(u.userEmail === data.userEmail && u.conversationId === data.conversationId))
      )
    })

    // ✅ EVENTO: Usuario se unió
    socket.on('user-joined', (data) => {
      console.log('[SOCKET] User joined:', data)
    })

    // ✅ EVENTO: Usuario se fue
    socket.on('user-left', (data) => {
      console.log('[SOCKET] User left:', data)
    })

    // ✅ EVENTO: Conversación asignada
    socket.on('conversation-assigned', (data) => {
      console.log('[SOCKET] Conversation assigned:', data)
      // Invalidar queries relacionadas con conversaciones
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

  }, [user?.email, queryClient])

  // ✅ Desconectar WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[SOCKET] Disconnecting...')
      socketRef.current.disconnect()
      socketRef.current = null
    }
    
    setSocketState({
      isConnected: false,
      isReconnecting: false,
      lastError: null,
      currentRoom: null
    })
    setTypingUsers([])
  }, [])

  // ✅ Unirse a room de conversación
  const joinConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current
    if (!socket || !socket.connected) {
      console.log('[SOCKET] Cannot join room, socket not connected')
      return
    }

    console.log('[SOCKET] Joining conversation room:', conversationId)
    
    // Salir del room anterior si existe
    if (socketState.currentRoom && socketState.currentRoom !== conversationId) {
      socket.emit('leave-conversation', socketState.currentRoom)
      console.log('[SOCKET] Left previous room:', socketState.currentRoom)
    }

    // Unirse al nuevo room
    socket.emit('join-conversation', conversationId)
    setSocketState(prev => ({ ...prev, currentRoom: conversationId }))
    
    logger.info('Joined conversation room', {
      conversationId,
      userEmail: user?.email
    }, 'socket_join_room')
  }, [socketState.currentRoom, user?.email])

  // ✅ Salir de room de conversación
  const leaveConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current
    if (!socket || !socket.connected) return

    console.log('[SOCKET] Leaving conversation room:', conversationId)
    socket.emit('leave-conversation', conversationId)
    
    setSocketState(prev => ({ 
      ...prev, 
      currentRoom: prev.currentRoom === conversationId ? null : prev.currentRoom 
    }))
    
    logger.info('Left conversation room', {
      conversationId,
      userEmail: user?.email
    }, 'socket_leave_room')
  }, [user?.email])

  // ✅ Enviar evento typing
  const sendTyping = useCallback((conversationId: string) => {
    const socket = socketRef.current
    if (!socket || !socket.connected || !user?.email) return

    socket.emit('typing-start', {
      conversationId,
      userEmail: user.email,
      userName: user.name
    })

    // Auto-stop typing después de 3 segundos
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping(conversationId)
    }, 3000)

  }, [user?.email, user?.name])

  // ✅ Enviar evento stop typing
  const sendStopTyping = useCallback((conversationId: string) => {
    const socket = socketRef.current
    if (!socket || !socket.connected || !user?.email) return

    socket.emit('typing-stop', {
      conversationId,
      userEmail: user.email
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [user?.email])

  // ✅ Reconectar manualmente
  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(connect, 1000)
  }, [disconnect, connect])

  // ✅ Conectar automáticamente cuando el usuario se autentica
  useEffect(() => {
    if (user?.email) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [user?.email, connect, disconnect])

  // ✅ Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Estado
    ...socketState,
    typingUsers,
    
    // Acciones
    connect,
    disconnect,
    reconnect,
    joinConversation,
    leaveConversation,
    sendTyping,
    sendStopTyping
  }
}

// ✅ Hook simplificado para typing indicators de una conversación específica
export function useTypingIndicators(conversationId?: string) {
  const { typingUsers } = useSocket()
  
  // Filtrar typing users para la conversación actual
  const conversationTypingUsers = typingUsers.filter(
    user => user.conversationId === conversationId
  )

  return conversationTypingUsers
} 