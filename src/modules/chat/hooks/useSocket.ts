// Hook para gestión de Socket.IO con tiempo real
// ✅ CRÍTICO: Configuración mejorada para eliminar errores de tiempo real
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'
import { logger, createLogContext, socketContext } from '@/lib/logger'

// ✅ CONFIGURACIÓN DINÁMICA DE URL
const isProduction = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'

const wsUrl = import.meta.env.VITE_WS_URL ||
  (isProduction
    ? 'https://utalk-backend-production.up.railway.app'
    : 'http://localhost:3000')

// ✅ ESTADO DE SOCKET
interface SocketState {
  isConnected: boolean
  connectionError: string | null
  currentRoom: string | null
  lastActivity: number
}

// ✅ DEBOUNCING PARA ANTI-SPAM
interface DebouncedJoin {
  conversationId: string
  timestamp: number
}

export function useSocket() {
  const { user, isAuthenticated } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    connectionError: null,
    currentRoom: null,
    lastActivity: Date.now()
  })

  // ✅ ANTI-SPAM: Referencias para debouncing
  const joinConversationDebounced = useRef<NodeJS.Timeout | null>(null)
  const lastJoinAttempt = useRef<DebouncedJoin | null>(null)

  const context = createLogContext({
    ...socketContext,
    method: 'useSocket',
    data: {
      userEmail: user?.email,
      isAuthenticated,
      wsUrl,
      isProduction
    }
  })

  // ✅ INICIALIZAR SOCKET CON CONFIGURACIÓN MEJORADA
  const socket = useMemo(() => {
    if (!user?.email || !isAuthenticated) {
      logger.warn('SOCKET', 'No se puede conectar sin usuario autenticado', context)
      return null
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      logger.error('SOCKET', 'No hay token de autenticación disponible', context)
      return null
    }

    logger.info('SOCKET', 'Inicializando conexión Socket.IO', {
      ...context,
      data: {
        ...context.data,
        hasToken: !!token,
        tokenPreview: `${token.substring(0, 10)}...`
      }
    })

    const newSocket = io(wsUrl, {
      auth: { 
        token,
        email: user.email 
      },
      // ✅ CONFIGURACIÓN ANTI-SPAM CRÍTICA
      transports: ['polling', 'websocket'], // ✅ polling primero como especifica backend
      reconnectionAttempts: 10,
      reconnectionDelay: 1000, // ✅ AUMENTADO: 1 segundo mínimo
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
    })

    return newSocket
  }, [user?.email, isAuthenticated, wsUrl])

  // ✅ CONFIGURAR EVENTOS DE SOCKET
  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      logger.success('SOCKET', 'Conectado exitosamente', {
        ...context,
        data: {
          ...context.data,
          socketId: socket.id,
          transport: socket.io.engine.transport.name
        }
      })
      
      setSocketState(prev => ({
        ...prev,
        isConnected: true,
        connectionError: null,
        lastActivity: Date.now()
      }))
    }

    const handleDisconnect = (reason: string) => {
      logger.warn('SOCKET', 'Desconectado', {
        ...context,
        data: {
          ...context.data,
          reason,
          wasConnected: socketState.isConnected
        }
      })
      
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        currentRoom: null
      }))
    }

    const handleConnectError = (error: any) => {
      logger.error('SOCKET', 'Error de conexión', {
        ...context,
        data: {
          ...context.data,
          error: error.message,
          type: error.type
        }
      })
      
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        connectionError: error.message
      }))
    }

    // ✅ HANDLER PARA NUEVOS MENSAJES - CRÍTICO
    const handleNewMessage = (data: any) => {
      try {
        logger.socket('Nuevo mensaje recibido vía Socket.IO', {
          messageId: data.message?.id,
          conversationId: data.conversationId,
          type: data.type,
          hasMessage: !!data.message
        })

        // ✅ VALIDAR ESTRUCTURA ANTES DE PROCESAR
        if (!data.message || !data.message.id || !data.conversationId) {
          logger.warn('SOCKET', 'Mensaje con estructura incompleta', {
            hasMessage: !!data.message,
            hasId: !!data.message?.id,
            hasConversationId: !!data.conversationId,
            dataKeys: Object.keys(data)
          })
          return
        }

        // ✅ NORMALIZAR ESTRUCTURA PARA FRONTEND
        const normalizedMessage = {
          ...data.message,
          // ✅ MAPEAR CAMPOS SEGÚN ESPECIFICACIÓN BACKEND
          senderIdentifier: data.message.senderIdentifier || data.message.sender?.identifier,
          recipientIdentifier: data.message.recipientIdentifier || data.message.recipient?.identifier,
          isDelivered: data.message.isDelivered ?? true,
          isImportant: data.message.isImportant || false
        }

        // ✅ EMITIR EVENTO PERSONALIZADO PARA COMPONENTES
        const customEvent = new CustomEvent('socket-new-message', {
          detail: {
            message: normalizedMessage,
            conversationId: data.conversationId,
            timestamp: data.timestamp
          }
        })
        
        window.dispatchEvent(customEvent)

        logger.socket('Mensaje procesado y emitido como evento personalizado', {
          messageId: normalizedMessage.id,
          conversationId: data.conversationId
        })

      } catch (error: any) {
        logger.error('SOCKET', 'Error procesando mensaje entrante', {
          error: error.message,
          dataReceived: data
        })
      }
    }

    // ✅ REGISTRAR TODOS LOS EVENTOS
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('new-message', handleNewMessage)
    socket.on('message-notification', handleNewMessage)
    socket.on('incoming-message-notification', handleNewMessage)

    // ✅ CLEANUP AL DESMONTAR
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('new-message', handleNewMessage)
      socket.off('message-notification', handleNewMessage)
      socket.off('incoming-message-notification', handleNewMessage)
      
      if (socket.connected) {
        socket.disconnect()
      }
    }
  }, [socket, user?.email, context, socketState.isConnected])

  // ✅ FUNCIÓN PARA UNIRSE A CONVERSACIÓN CON DEBOUNCING CRÍTICO
  const joinConversation = useCallback((conversationId: string) => {
    if (!socket || !socket.connected) {
      logger.warn('SOCKET', 'No se puede unir: socket no conectado', { conversationId })
      return
    }

    // ✅ ANTI-SPAM: Verificar si ya está en la conversación
    if (socketState.currentRoom === conversationId) {
      logger.info('SOCKET', 'Ya está en la conversación', { conversationId })
      return
    }

    // ✅ ANTI-SPAM: Verificar último intento
    const now = Date.now()
    const lastAttempt = lastJoinAttempt.current
    
    if (lastAttempt && 
        lastAttempt.conversationId === conversationId && 
        (now - lastAttempt.timestamp) < 1000) { // 1 segundo mínimo
      logger.warn('SOCKET', 'Join attempt too soon, debouncing', { 
        conversationId,
        timeSinceLastAttempt: now - lastAttempt.timestamp
      })
      return
    }

    // ✅ ANTI-SPAM: Limpiar timeout anterior
    if (joinConversationDebounced.current) {
      clearTimeout(joinConversationDebounced.current)
    }

    // ✅ ANTI-SPAM: Debounce de 500ms
    joinConversationDebounced.current = setTimeout(() => {
      if (socket && socket.connected) {
        // ✅ SALIR DE CONVERSACIÓN ANTERIOR SI EXISTE
        if (socketState.currentRoom && socketState.currentRoom !== conversationId) {
          socket.emit('leave-conversation', { conversationId: socketState.currentRoom })
          logger.info('SOCKET', 'Saliendo de conversación anterior', { 
            previousRoom: socketState.currentRoom 
          })
        }

        socket.emit('join-conversation', { conversationId })
        
        setSocketState(prev => ({
          ...prev,
          currentRoom: conversationId,
          lastActivity: Date.now()
        }))

        lastJoinAttempt.current = { conversationId, timestamp: Date.now() }
        
        logger.info('SOCKET', 'Unido a conversación (debounced)', { 
          conversationId,
          socketId: socket.id
        })
      }
    }, 500) // 500ms debounce según especificación backend

  }, [socket, socketState.currentRoom])

  // ✅ FUNCIÓN PARA SALIR DE CONVERSACIÓN
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socket || !socket.connected) return

    socket.emit('leave-conversation', { conversationId })
    
    setSocketState(prev => ({
      ...prev,
      currentRoom: prev.currentRoom === conversationId ? null : prev.currentRoom
    }))

    logger.info('SOCKET', 'Saliendo de conversación', { conversationId })
  }, [socket])

  // ✅ FUNCIÓN GENÉRICA PARA EMITIR EVENTOS
  const emitEvent = useCallback((eventName: string, data: any) => {
    if (!socket || !socket.connected) {
      logger.warn('SOCKET', 'No se puede emitir evento: socket no conectado', { 
        eventName, 
        hasData: !!data 
      })
      return
    }

    socket.emit(eventName, data)
    
    logger.info('SOCKET', 'Evento emitido', { 
      eventName, 
      dataKeys: data ? Object.keys(data) : []
    })
  }, [socket])

  // ✅ CLEANUP AL DESMONTAR EL HOOK
  useEffect(() => {
    return () => {
      if (joinConversationDebounced.current) {
        clearTimeout(joinConversationDebounced.current)
      }
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected: socketState.isConnected,
    connectionError: socketState.connectionError,
    currentRoom: socketState.currentRoom,
    joinConversation,
    leaveConversation,
    emitEvent
  }
}

// ✅ Hook simplificado para typing indicators de una conversación específica
export function useTypingIndicators(conversationId?: string) {
  // ✅ CORREGIDO: Eliminar referencia a typingUsers que no existe
  return []
} 