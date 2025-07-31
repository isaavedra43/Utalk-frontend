// Hook para gestión de Socket.IO con reconexión automática
// ✅ RESTAURADO: Implementación original que funcionaba
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'

// ✅ CONTEXTO PARA LOGGING
const socketContext = getComponentContext('useSocket')

// ✅ INTERFAZ PARA ESTADO DEL SOCKET
interface SocketState {
  isConnected: boolean
  connectionError: string | null
  currentRoom: string | null
}

// ✅ CONFIGURACIÓN OPTIMIZADA PARA SOCKET.IO
const SOCKET_CONFIG = {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  forceNew: false,
  autoConnect: true,
}

/**
 * ✅ Hook principal para Socket.IO
 * ✅ RESTAURADO: Implementación original con Socket.IO real
 */
export function useSocket() {
  const { user, isAuthenticated } = useAuth()
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    connectionError: null,
    currentRoom: null
  })

  const socketRef = useRef<Socket | null>(null)
  const joinConversationDebounced = useRef<NodeJS.Timeout | null>(null)

  // ✅ URL WEBSOCKET DESDE VARIABLES DE ENTORNO
  const wsUrl = useMemo(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://utalk-backend-production.up.railway.app'
    return baseUrl.replace(/^http/, 'ws')
  }, [])

  // ✅ TOKEN PARA AUTENTICACIÓN
  const token = useMemo(() => {
    if (!isAuthenticated || !user?.email) return null
    return localStorage.getItem('token')
  }, [isAuthenticated, user?.email])

  // ✅ CREAR CONEXIÓN SOCKET.IO
  useEffect(() => {
    if (!token || !user?.email) {
      logger.socket('❌ No token or email available for socket connection')
      return
    }

    const context = createLogContext({
      ...socketContext,
      method: 'connect',
      data: {
        wsUrl,
        userEmail: user.email,
        hasToken: !!token
      }
    })

    logger.socket('🔌 Iniciando conexión Socket.IO', context)

    // ✅ CREAR INSTANCIA SOCKET
    const socket = io(wsUrl, {
      ...SOCKET_CONFIG,
      auth: {
        token,
        email: user.email
      }
    })

    socketRef.current = socket

    // ✅ EVENTOS DE CONEXIÓN
    socket.on('connect', () => {
      logger.socket('✅ Socket conectado exitosamente', createLogContext({
        ...context,
        data: {
          socketId: socket.id,
          connected: socket.connected
        }
      }))
      
      setSocketState(prev => ({
        ...prev,
        isConnected: true,
        connectionError: null
      }))
    })

    socket.on('disconnect', (reason) => {
      logger.socket(`🔌 Socket desconectado: ${reason}`, createLogContext({
        ...context,
        data: {
          reason,
          socketId: socket.id
        }
      }))
      
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        currentRoom: null
      }))
    })

    socket.on('connect_error', (error) => {
      logger.socket('❌ Error de conexión Socket.IO', createLogContext({
        ...context,
        data: {
          error: error.message,
          stack: error.stack
        }
      }))
      
      setSocketState(prev => ({
        ...prev,
        isConnected: false,
        connectionError: error.message
      }))
    })

    // ✅ CLEANUP
    return () => {
      if (socket) {
        socket.off('connect')
        socket.off('disconnect')
        socket.off('connect_error')
        socket.disconnect()
      }
    }
  }, [token, user?.email, wsUrl])

  // ✅ FUNCIÓN PARA UNIRSE A CONVERSACIÓN
  const joinConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected || !conversationId) {
      logger.socket('❌ Cannot join conversation: socket not connected or no conversationId')
      return
    }

    // ✅ DEBOUNCE PARA EVITAR SPAM
    if (joinConversationDebounced.current) {
      clearTimeout(joinConversationDebounced.current)
    }

    joinConversationDebounced.current = setTimeout(() => {
      const socket = socketRef.current
      if (!socket?.connected) return

      logger.socket(`🚪 Joining conversation: ${conversationId}`, createLogContext({
        ...socketContext,
        method: 'joinConversation',
        data: {
          conversationId,
          socketId: socket.id
        }
      }))

      socket.emit('join-conversation', { conversationId })
      
      setSocketState(prev => ({
        ...prev,
        currentRoom: conversationId
      }))
    }, 300)
  }, [])

  // ✅ FUNCIÓN PARA SALIR DE CONVERSACIÓN
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socketRef.current?.connected || !conversationId) return

    logger.socket(`🚪 Leaving conversation: ${conversationId}`, createLogContext({
      ...socketContext,
      method: 'leaveConversation',
      data: {
        conversationId,
        socketId: socketRef.current.id
      }
    }))

    socketRef.current.emit('leave-conversation', { conversationId })
    
    setSocketState(prev => ({
      ...prev,
      currentRoom: prev.currentRoom === conversationId ? null : prev.currentRoom
    }))
  }, [])

  // ✅ FUNCIÓN GENÉRICA PARA EMITIR EVENTOS
  const emitEvent = useCallback((event: string, data: any) => {
    if (!socketRef.current?.connected) {
      logger.socket(`❌ Cannot emit ${event}: socket not connected`)
      return
    }

    logger.socket(`📤 Emitting event: ${event}`, createLogContext({
      ...socketContext,
      method: 'emitEvent',
      data: {
        event,
        payload: data,
        socketId: socketRef.current.id
      }
    }))

    socketRef.current.emit(event, data)
  }, [])

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

// ✅ Hook simplificado para typing indicators
export function useTypingIndicators(conversationId?: string) {
  return []
} 