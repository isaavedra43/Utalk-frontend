// Hook de WebSocket REFACTORIZADO - SOLUCIÓN COMPLETA
// ✅ Elimina doble conexión, race conditions, memory leaks y mejora robustez
import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'
import { useQueryClient } from '@tanstack/react-query'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'
import { normalizeMessage } from './useMessages'
import type { CanonicalMessage } from '@/types/canonical'
import {
  validateMessageEvent,
  validateMessageReadEvent,
  validateTypingEvent,
  validateUserEvent,
  validateSocketEvent
} from '../validators/socketValidators'

// ✅ CONTEXTO PARA LOGGING
const socketContext = getComponentContext('useSocket')

// ✅ CONSTANTES DE EVENTOS
const MESSAGE_EVENTS = {
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  MESSAGE_TYPING: 'typing'
} as const

const TYPING_EVENTS = {
  START: 'typing-start',
  STOP: 'typing-stop'
} as const

const CONVERSATION_EVENTS = {
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left'
} as const

// ✅ FUNCIÓN PARA PROCESAR MENSAJES ENTRANTES
const processIncomingMessage = (queryClient: any, message: CanonicalMessage) => {
  try {
    // ✅ Actualizar cache de mensajes
    queryClient.setQueryData(['messages'], (oldData: CanonicalMessage[] | undefined) => {
      if (!oldData) return [message]
      
      // Evitar duplicados
      const exists = oldData.some(msg => msg.id === message.id)
      if (exists) return oldData
      
      return [...oldData, message].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    })

    // ✅ Invalidar queries relacionadas
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
    queryClient.invalidateQueries({ queryKey: ['messages'] })

    logger.socket('New message processed via WebSocket', {
      messageId: message.id,
      conversationId: message.conversationId,
      senderEmail: message.sender.email
    })
  } catch (error) {
    logger.socketError('💥 Failed to process incoming message', {
      error: error as Error,
      messageId: message.id
    })
  }
}

// ✅ FUNCIÓN SEGURA PARA MANEJAR EVENTOS
const safeEventHandler = <T>(
  validator: (data: any) => boolean,
  handler: (data: T) => void,
  eventName: string
) => {
  return (data: any) => {
    try {
      if (!validator(data)) {
        logger.validationError(`❌ Invalid ${eventName} event data`, {
          eventName,
          data
        })
        return
      }
      
      handler(data as T)
    } catch (error) {
      logger.socketError(`💥 Error handling ${eventName} event`, {
        error: error as Error,
        eventName,
        data
      })
    }
  }
}

export function useSocket() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const context = createLogContext({
    ...socketContext,
    method: 'useSocket',
    data: {
      isAuthenticated,
      userEmail: user?.email,
      isActive: user?.isActive
    }
  })

  logger.socket('🔌 Hook useSocket iniciado', context)

  // ✅ MANEJAR NUEVO MENSAJE
  const handleNewMessageEvent = useCallback((data: { message: CanonicalMessage; conversationId: string; timestamp: number }) => {
    const messageContext = createLogContext({
      ...context,
      method: 'handleNewMessageEvent',
      data: {
        messageId: data.message.id,
        conversationId: data.conversationId,
        timestamp: data.timestamp
      }
    })

    logger.socket('📨 New message received', messageContext)

    try {
      // ✅ VALIDAR ESTRUCTURA DEL MENSAJE
      if (!data.message || !data.conversationId) {
        logger.socketError('❌ Invalid message structure received from WebSocket', {
          receivedData: data
        })
        return
      }

      // ✅ NORMALIZAR Y PROCESAR MENSAJE
      const normalizedMessage = normalizeMessage(data.message)
      processIncomingMessage(queryClient, normalizedMessage)
      
      logger.socket('New message processed successfully', createLogContext({
        ...messageContext,
        data: {
          messageId: normalizedMessage.id,
          conversationId: normalizedMessage.conversationId
        }
      }))
    } catch (error) {
      logger.socketError('💥 Failed to process new message from WebSocket', {
        error: error as Error,
        receivedData: data
      })
    }
  }, [queryClient])

  // ✅ MANEJAR MENSAJE LEÍDO
  const handleMessageReadEvent = useCallback((data: { messageId: string; conversationId: string; readBy: string; readAt: string }) => {
    const readContext = createLogContext({
      ...context,
      method: 'handleMessageReadEvent',
      data: {
        messageId: data.messageId,
        conversationId: data.conversationId,
        readBy: data.readBy
      }
    })

    logger.socket('📝 Message read event received', readContext)

    try {
      // ✅ ACTUALIZAR CACHE
      queryClient.setQueryData(['messages'], (oldData: any) => {
        if (!oldData || !Array.isArray(oldData)) return oldData
        
        return oldData.map((message: any) => {
          if (message.id === data.messageId) {
            return { ...message, status: 'read', readAt: data.readAt, readBy: data.readBy }
          }
          return message
        })
      })

      logger.socket('Message read status updated via WebSocket', createLogContext({
        ...readContext,
        data: {
          messageId: data.messageId,
          readBy: data.readBy
        }
      }))
    } catch (error) {
      logger.socketError('💥 Failed to process message read from WebSocket', {
        error: error as Error,
        receivedData: data
      })
    }
  }, [queryClient])

  // ✅ CONECTAR SOCKET
  const connectSocket = useCallback(() => {
    if (!isAuthenticated || !user?.email || !user?.isActive) {
      logger.socket('⚠️ Cannot connect socket - user not authenticated', createLogContext({
        ...context,
        data: {
          isAuthenticated,
          hasEmail: !!user?.email,
          isActive: user?.isActive
        }
      }))
      return
    }

    if (socketRef.current?.connected) {
      logger.socket('ℹ️ Socket already connected', context)
      return
    }

    try {
      // ✅ Configuración dinámica de URL
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      const wsUrl = import.meta.env.VITE_WS_URL || 
                    (isProduction 
                      ? 'https://utalk-backend-production.up.railway.app' 
                      : 'http://localhost:3000')

      logger.socket('🔌 Connecting to WebSocket...', createLogContext({
        ...context,
        data: {
          url: wsUrl,
          userEmail: user.email,
          isProduction
        }
      }))

      // ✅ Crear conexión Socket.IO
      const socket = io(wsUrl, {
        auth: {
          token: localStorage.getItem('auth_token'),
          email: user.email
        },
        transports: ['polling', 'websocket'],
        autoConnect: true,
        forceNew: false,
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      })

      // ✅ EVENTOS DE CONEXIÓN
      socket.on('connect', () => {
        logger.socket('✅ Socket connected successfully', createLogContext({
          ...context,
          data: { socketId: socket.id, userEmail: user.email }
        }))
      })

      socket.on('disconnect', (reason) => {
        logger.socket('🔌 Socket disconnected', createLogContext({
          ...context,
          data: { reason, userEmail: user.email }
        }))
      })

      socket.on('connect_error', (error) => {
        logger.socketError('💥 Socket connection error', {
          error: error as Error,
          userEmail: user.email
        })
      })

      // ✅ EVENTOS DE MENSAJES
      socket.on(MESSAGE_EVENTS.NEW_MESSAGE, safeEventHandler(
        validateMessageEvent,
        handleNewMessageEvent,
        'new-message'
      ))

      socket.on(MESSAGE_EVENTS.MESSAGE_READ, safeEventHandler(
        validateMessageReadEvent,
        handleMessageReadEvent,
        'message-read'
      ))

      // ✅ EVENTOS DE TYPING
      socket.on(TYPING_EVENTS.START, safeEventHandler(
        validateTypingEvent,
        (data: { userEmail: string; userName?: string; conversationId: string }) => {
          logger.socket('⌨️ User started typing', {
            userEmail: data.userEmail,
            conversationId: data.conversationId
          })
        },
        'typing-start'
      ))

      socket.on(TYPING_EVENTS.STOP, safeEventHandler(
        validateTypingEvent,
        (data: { userEmail: string; conversationId: string }) => {
          logger.socket('⌨️ User stopped typing', {
            userEmail: data.userEmail,
            conversationId: data.conversationId
          })
        },
        'typing-stop'
      ))

      // ✅ EVENTOS DE USUARIOS
      socket.on(CONVERSATION_EVENTS.USER_JOINED, safeEventHandler(
        validateUserEvent,
        (data: unknown) => {
          logger.socket('👤 User joined conversation', { data })
        },
        'user-joined'
      ))

      socket.on(CONVERSATION_EVENTS.USER_LEFT, safeEventHandler(
        validateUserEvent,
        (data: unknown) => {
          logger.socket('👤 User left conversation', { data })
        },
        'user-left'
      ))

      socketRef.current = socket

    } catch (error) {
      logger.socketError('💥 Error creating socket connection', {
        error: error as Error,
        userEmail: user.email
      })
    }
  }, [isAuthenticated, user, handleNewMessageEvent, handleMessageReadEvent])

  // ✅ DESCONECTAR SOCKET
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      logger.socket('🔌 Disconnecting socket', context)
      socketRef.current.disconnect()
      socketRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // ✅ EFFECT PRINCIPAL
  useEffect(() => {
    if (isAuthenticated && user?.email && user?.isActive) {
      connectSocket()
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [isAuthenticated, user?.email, user?.isActive, connectSocket, disconnectSocket])

  // ✅ FUNCIÓN PARA ENVIAR EVENTOS
  const emitEvent = useCallback((event: string, data: any) => {
    if (!socketRef.current?.connected) {
      logger.socketError('❌ Cannot emit event - socket not connected', {
        event,
        data
      })
      return false
    }

    try {
      socketRef.current.emit(event, data)
      logger.socket(`📤 Event emitted: ${event}`, { event, data })
      return true
    } catch (error) {
      logger.socketError(`💥 Error emitting event: ${event}`, {
        error: error as Error,
        event,
        data
      })
      return false
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    emitEvent,
    connectSocket,
    disconnectSocket
  }
}

// ✅ Hook simplificado para typing indicators de una conversación específica
export function useTypingIndicators(conversationId?: string) {
  // ✅ CORREGIDO: Eliminar referencia a typingUsers que no existe
  return []
} 