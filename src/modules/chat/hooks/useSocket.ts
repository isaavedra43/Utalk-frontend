// Hook de WebSocket REFACTORIZADO - SOLUCIÓN COMPLETA
// ✅ Elimina doble conexión, race conditions, memory leaks y mejora robustez
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { messageKeys } from './useMessages'
import { logger } from '@/lib/logger'
import type { CanonicalMessage } from '@/types/canonical'
import { io, Socket } from 'socket.io-client'

// ✅ Importar constantes y validadores
import { SOCKET_EVENTS, CONVERSATION_EVENTS, MESSAGE_EVENTS, TYPING_EVENTS } from '../constants/socketEvents'
import { 
  validateNewMessageEvent, 
  validateMessageReadEvent, 
  validateTypingEvent, 
  validateUserEvent,
  safeEventHandler 
} from '../validators/socketValidators'

// ✅ Estados de conexión WebSocket
interface SocketState {
  isConnected: boolean
  isReconnecting: boolean
  lastError: string | null
  currentRoom: string | null
  reconnectAttempts: number
}

// ✅ Typing Indicator usando EMAIL
interface TypingIndicator {
  userEmail: string
  userName?: string
  conversationId: string
  timestamp: Date
}

// ✅ Queue para eventos cuando cache no está listo
interface QueuedEvent {
  type: string
  data: any
  timestamp: number
}

export function useSocket() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventQueueRef = useRef<QueuedEvent[]>([])
  const activeRoomsRef = useRef<Set<string>>(new Set())
  
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    isReconnecting: false,
    lastError: null,
    currentRoom: null,
    reconnectAttempts: 0
  })

  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])

  // ✅ ANTI-SPAM: Debouncing para join conversation
  const joinConversationDebounced = useRef<NodeJS.Timeout | null>(null)
  const lastJoinAttempt = useRef<{ conversationId: string; timestamp: number } | null>(null)

  // ✅ Procesar queue de eventos cuando cache esté listo
  const processEventQueue = useCallback(() => {
    if (eventQueueRef.current.length === 0) return

    console.log('[SOCKET] Processing queued events:', eventQueueRef.current.length)
    
    const queuedEvents = [...eventQueueRef.current]
    eventQueueRef.current = []

    queuedEvents.forEach(({ type, data }) => {
      console.log('[SOCKET] Processing queued event:', type, data)
      
      // Re-procesar evento según su tipo
      if (type === MESSAGE_EVENTS.NEW_MESSAGE && validateNewMessageEvent(data)) {
        handleNewMessageEvent(data)
      } else if (type === MESSAGE_EVENTS.MESSAGE_READ && validateMessageReadEvent(data)) {
        handleMessageReadEvent(data)
      }
    })
  }, [])

  // ✅ Manejar nuevo mensaje (con queue para race conditions)
  const handleNewMessageEvent = useCallback((data: { message: CanonicalMessage; conversationId: string; timestamp: number }) => {
    const { message } = data
    
    console.log('[SOCKET] Received new message event:', {
      messageId: message.id,
      conversationId: message.conversationId,
      content: message.content,
      sender: message.sender,
      structure: {
        hasId: !!message.id,
        hasConversationId: !!message.conversationId,
        hasContent: !!message.content,
        hasSender: !!message.sender
      }
    })

    // ✅ CORREGIDO: Validar estructura mínima requerida
    if (!message.id || !message.conversationId || !message.content) {
      console.error('[SOCKET] Invalid message structure:', message)
      logger.error('Invalid message structure received from WebSocket', {
        message,
        requiredFields: ['id', 'conversationId', 'content']
      }, 'socket_invalid_message_structure')
      return
    }

    // Verificar si el cache está inicializado
    const currentCache = queryClient.getQueryData(messageKeys.conversations(message.conversationId))
    
    if (!currentCache) {
      console.log('[SOCKET] Cache not ready, queuing message event')
      eventQueueRef.current.push({
        type: MESSAGE_EVENTS.NEW_MESSAGE,
        data,
        timestamp: Date.now()
      })
      return
    }

    console.log('[SOCKET] Processing new message immediately:', message.id)

    try {
      // ✅ CORREGIDO: Normalizar estructura del mensaje con manejo de campos faltantes
      const normalizedMessage: CanonicalMessage = {
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        type: message.type || 'text',
        direction: message.direction || 'outbound',
        timestamp: message.timestamp || new Date().toISOString(),
        status: message.status || 'sent',
        sender: {
          email: message.sender?.email || (message as any).senderIdentifier || 'unknown',
          name: message.sender?.name || 'Unknown User',
          avatar: message.sender?.avatar,
          type: message.sender?.type || 'agent'
        },
        recipient: {
          email: message.recipient?.email || (message as any).recipientIdentifier || 'unknown',
          name: message.recipient?.name || 'Unknown User',
          avatar: message.recipient?.avatar,
          type: message.recipient?.type || 'contact'
        },
        metadata: message.metadata || {},
        isRead: message.isRead || false,
        isDelivered: message.isDelivered || false,
        isImportant: message.isImportant || false
      }

      // ✅ CORREGIDO: Validar que el mensaje normalizado sea válido
      if (!normalizedMessage.sender.email || normalizedMessage.sender.email === 'unknown') {
        console.warn('[SOCKET] Message has invalid sender, using fallback')
        normalizedMessage.sender.email = user?.email || 'system'
        normalizedMessage.sender.name = user?.name || 'System'
      }

      // Actualizar cache de React Query con el nuevo mensaje
      queryClient.setQueryData(
        messageKeys.conversations(message.conversationId),
        (old: CanonicalMessage[] | undefined) => {
          if (!old) return [normalizedMessage]
          
          // Evitar duplicados
          const exists = old.some(msg => msg.id === normalizedMessage.id)
          if (exists) {
            console.log('[SOCKET] Message already exists, skipping:', normalizedMessage.id)
            return old
          }
          
          // ✅ CORREGIDO: Ordenar por timestamp
          const updatedMessages = [...old, normalizedMessage].sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          
          console.log('[SOCKET] Message added to cache:', {
            messageId: normalizedMessage.id,
            totalMessages: updatedMessages.length,
            conversationId: normalizedMessage.conversationId,
            sender: normalizedMessage.sender.email,
            content: normalizedMessage.content.substring(0, 50) + '...'
          })
          
          return updatedMessages
        }
      )

      // También actualizar cache infinito si existe
      queryClient.setQueryData(
        messageKeys.infinite(message.conversationId),
        (old: any) => {
          if (!old) return old
          const newPages = [...old.pages]
          if (newPages.length > 0) {
            const exists = newPages[0].messages.some((msg: CanonicalMessage) => msg.id === normalizedMessage.id)
            if (!exists) {
              newPages[0] = {
                ...newPages[0],
                messages: [...newPages[0].messages, normalizedMessage].sort((a, b) => 
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                )
              }
            }
          }
          return { ...old, pages: newPages }
        }
      )

      logger.success('New message processed via WebSocket', {
        messageId: normalizedMessage.id,
        conversationId: normalizedMessage.conversationId,
        senderEmail: normalizedMessage.sender.email,
        content: normalizedMessage.content.substring(0, 100)
      }, 'socket_new_message')

    } catch (error) {
      console.error('[SOCKET] Error processing new message:', error)
      logger.error('Failed to process new message from WebSocket', {
        messageId: message.id,
        error
      }, 'socket_new_message_error')
    }
  }, [queryClient, user?.email, user?.name])

  // ✅ Manejar mensaje leído
  const handleMessageReadEvent = useCallback((data: { messageId: string; conversationId: string; readBy: string; readAt: string }) => {
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
  }, [queryClient])

  // ✅ Re-join rooms después de reconectar
  const rejoinActiveRooms = useCallback(() => {
    const activeRooms = Array.from(activeRoomsRef.current)
    console.log('[SOCKET] Rejoining active rooms after reconnect:', activeRooms)
    
    activeRooms.forEach(conversationId => {
      if (socketRef.current?.connected) {
        console.log('[SOCKET] Rejoining room:', conversationId)
        socketRef.current.emit(CONVERSATION_EVENTS.JOIN, conversationId)
      }
    })
  }, [])

  // ✅ Limpiar TODOS los listeners
  const cleanupListeners = useCallback(() => {
    const socket = socketRef.current
    if (!socket) return

    console.log('[SOCKET] Cleaning up all listeners')
    
    // Remover listeners específicos
    socket.removeAllListeners(SOCKET_EVENTS.CONNECT)
    socket.removeAllListeners(SOCKET_EVENTS.DISCONNECT)
    socket.removeAllListeners(SOCKET_EVENTS.CONNECT_ERROR)
    socket.removeAllListeners(SOCKET_EVENTS.RECONNECT)
    socket.removeAllListeners(SOCKET_EVENTS.RECONNECT_ATTEMPT)
    socket.removeAllListeners(MESSAGE_EVENTS.NEW_MESSAGE)
    socket.removeAllListeners(MESSAGE_EVENTS.MESSAGE_READ)
    socket.removeAllListeners(TYPING_EVENTS.START)
    socket.removeAllListeners(TYPING_EVENTS.STOP)
    socket.removeAllListeners(CONVERSATION_EVENTS.USER_JOINED)
    socket.removeAllListeners(CONVERSATION_EVENTS.USER_LEFT)
    socket.removeAllListeners(CONVERSATION_EVENTS.ASSIGNED)
    
    // Limpiar timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }, [])

  // ✅ Conectar WebSocket con configuración corregida
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

    // Limpiar conexión anterior si existe
    if (socketRef.current) {
      console.log('[SOCKET] Cleaning up previous connection')
      cleanupListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000'
    
    console.log('[SOCKET] Connecting to WebSocket...', {
      url: wsUrl,
      userEmail: user.email,
      hasToken: !!token
    })

    // ✅ CONFIGURACIÓN CORREGIDA: polling primero para estabilidad
    socketRef.current = io(wsUrl, {
      auth: {
        token,
        email: user.email
      },
      transports: ['polling', 'websocket'], // ✅ CORREGIDO: polling primero
      autoConnect: true,
      forceNew: false, // ✅ CORREGIDO: Evitar múltiples conexiones
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 10, // ✅ AUMENTADO: Más intentos
      reconnectionDelay: 1000, // ✅ AUMENTADO: Evitar spam
      reconnectionDelayMax: 5000, // ✅ AUMENTADO: Máximo más alto
      // ✅ ANTI-SPAM: Configuración para evitar rate limiting
      upgrade: true,
      rememberUpgrade: true
    })

    const socket = socketRef.current

    // ✅ Eventos de conexión con cleanup proper
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('[SOCKET] Connected successfully', { socketId: socket.id })
      setSocketState(prev => ({
        ...prev,
        isConnected: true,
        isReconnecting: false,
        lastError: null,
        reconnectAttempts: 0
      }))
      
      logger.success('WebSocket connected', {
        socketId: socket.id,
        userEmail: user.email
      }, 'socket_connected')

      // ✅ Procesar queue y re-join rooms
      processEventQueue()
      rejoinActiveRooms()
    })

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
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

    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
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

    socket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber) => {
      console.log('[SOCKET] Reconnected after', attemptNumber, 'attempts')
      setSocketState(prev => ({
        ...prev,
        isReconnecting: false,
        reconnectAttempts: attemptNumber
      }))

      // ✅ CORREGIDO: Re-join automático después de reconectar
      rejoinActiveRooms()
    })

    socket.on(SOCKET_EVENTS.RECONNECT_ATTEMPT, (attemptNumber) => {
      console.log('[SOCKET] Reconnection attempt', attemptNumber)
      setSocketState(prev => ({
        ...prev,
        isReconnecting: true,
        reconnectAttempts: attemptNumber
      }))
    })

    // ✅ EVENTOS DE MENSAJES CON VALIDACIÓN
    socket.on(MESSAGE_EVENTS.NEW_MESSAGE, safeEventHandler(
      validateNewMessageEvent,
      handleNewMessageEvent,
      'new-message'
    ))

    socket.on(MESSAGE_EVENTS.MESSAGE_READ, safeEventHandler(
      validateMessageReadEvent, 
      handleMessageReadEvent,
      'message-read'
    ))

    // ✅ EVENTOS DE TYPING CON VALIDACIÓN
    socket.on(TYPING_EVENTS.START, safeEventHandler(
      validateTypingEvent,
      (data: { userEmail: string; userName?: string; conversationId: string }) => {
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
      },
      'typing-start'
    ))

    socket.on(TYPING_EVENTS.STOP, safeEventHandler(
      validateTypingEvent,
      (data: { userEmail: string; conversationId: string }) => {
        console.log('[SOCKET] Typing stop:', data)
        
        setTypingUsers(prev => 
          prev.filter(u => !(u.userEmail === data.userEmail && u.conversationId === data.conversationId))
        )
      },
      'typing-stop'
    ))

    // ✅ EVENTOS DE USUARIOS CON VALIDACIÓN
    socket.on(CONVERSATION_EVENTS.USER_JOINED, safeEventHandler(
      validateUserEvent,
      (data) => {
        console.log('[SOCKET] User joined:', data)
      },
      'user-joined'
    ))

    socket.on(CONVERSATION_EVENTS.USER_LEFT, safeEventHandler(
      validateUserEvent,
      (data) => {
        console.log('[SOCKET] User left:', data)
      },
      'user-left'
    ))

    // ✅ EVENTO: Conversación asignada
    socket.on(CONVERSATION_EVENTS.ASSIGNED, (data) => {
      console.log('[SOCKET] Conversation assigned:', data)
      // Invalidar queries relacionadas con conversaciones
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

  }, [user?.email, queryClient, cleanupListeners, handleNewMessageEvent, handleMessageReadEvent, processEventQueue, rejoinActiveRooms])

  // ✅ Desconectar WebSocket con cleanup completo
  const disconnect = useCallback(() => {
    console.log('[SOCKET] Disconnecting...')
    
    // Limpiar listeners
    cleanupListeners()
    
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    
    // Limpiar estado
    setSocketState({
      isConnected: false,
      isReconnecting: false,
      lastError: null,
      currentRoom: null,
      reconnectAttempts: 0
    })
    setTypingUsers([])
    
    // Limpiar refs
    activeRoomsRef.current.clear()
    eventQueueRef.current = []
    
  }, [cleanupListeners])

  // ✅ Unirse a room de conversación con tracking y ANTI-SPAM
  const joinConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current
    if (!socket || !socket.connected) {
      console.log('[SOCKET] Cannot join room, socket not connected')
      return
    }

    // ✅ ANTI-SPAM: Verificar si ya está en la conversación
    if (socketState.currentRoom === conversationId) {
      console.log('[SOCKET] Already in conversation room:', conversationId)
      return
    }

    // ✅ ANTI-SPAM: Verificar si ya está en el set de rooms activos
    if (activeRoomsRef.current.has(conversationId)) {
      console.log('[SOCKET] Already in active rooms:', conversationId)
      return
    }

    // ✅ ANTI-SPAM: Debouncing - evitar múltiples llamadas rápidas
    const now = Date.now()
    if (lastJoinAttempt.current && 
        lastJoinAttempt.current.conversationId === conversationId &&
        now - lastJoinAttempt.current.timestamp < 1000) { // 1 segundo de debounce
      console.log('[SOCKET] Join attempt too soon, debouncing:', conversationId)
      return
    }

    // ✅ ANTI-SPAM: Limpiar timeout anterior
    if (joinConversationDebounced.current) {
      clearTimeout(joinConversationDebounced.current)
    }

    // ✅ ANTI-SPAM: Debounce de 500ms para evitar spam
    joinConversationDebounced.current = setTimeout(() => {
      console.log('[SOCKET] Joining conversation room (debounced):', conversationId)
      
      // Salir del room anterior si existe
      if (socketState.currentRoom && socketState.currentRoom !== conversationId) {
        socket.emit(CONVERSATION_EVENTS.LEAVE, socketState.currentRoom)
        activeRoomsRef.current.delete(socketState.currentRoom)
        console.log('[SOCKET] Left previous room:', socketState.currentRoom)
      }

      // Unirse al nuevo room
      socket.emit(CONVERSATION_EVENTS.JOIN, conversationId)
      activeRoomsRef.current.add(conversationId)
      setSocketState(prev => ({ ...prev, currentRoom: conversationId }))
      
      // ✅ ANTI-SPAM: Registrar intento
      lastJoinAttempt.current = { conversationId, timestamp: Date.now() }
      
      logger.info('Joined conversation room', {
        conversationId,
        userEmail: user?.email
      }, 'socket_join_room')
    }, 500) // 500ms de debounce

  }, [socketState.currentRoom, user?.email])

  // ✅ Salir de room de conversación
  const leaveConversation = useCallback((conversationId: string) => {
    const socket = socketRef.current
    if (!socket || !socket.connected) return

    console.log('[SOCKET] Leaving conversation room:', conversationId)
    socket.emit(CONVERSATION_EVENTS.LEAVE, conversationId)
    
    activeRoomsRef.current.delete(conversationId)
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

    socket.emit(TYPING_EVENTS.START, {
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

    socket.emit(TYPING_EVENTS.STOP, {
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
      // Limpiar todo al desmontar el componente
      cleanupListeners()
    }
  }, [cleanupListeners])

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