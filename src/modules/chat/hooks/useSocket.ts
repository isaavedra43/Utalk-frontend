// Hook para gestión de WebSocket en tiempo real
// ✅ EMAIL-FIRST: Conexión y eventos usando email como identificador
import { useState, useEffect, useCallback } from 'react'
import { socketClient } from '@/services/socketClient'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/logger'

// ✅ Estado del socket simplificado
interface SocketState {
  isConnected: boolean
  isReconnecting: boolean
  lastError: string | null
}

// ✅ Typing Indicator usando EMAIL
interface TypingIndicator {
  userEmail: string
  userName?: string
  conversationId: string
  timestamp: Date
}

export function useSocket() {
  const [socketState, setSocketState] = useState<SocketState>({
    isConnected: false,
    isReconnecting: false,
    lastError: null
  })
  
  const { user } = useAuth()

  // ✅ Conectar socket cuando el usuario esté autenticado
  useEffect(() => {
    if (user?.email && user?.isActive) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        console.log('🔗 useSocket: Connecting with EMAIL-FIRST authentication', {
          userEmail: user.email,
          hasToken: !!token
        })
        
        try {
          socketClient.connectWithToken(token, user.email)
          setSocketState(prev => ({
            ...prev,
            isConnected: true,
            lastError: null
          }))
        } catch (error) {
          console.error('❌ useSocket: Failed to connect', error)
          setSocketState(prev => ({
            ...prev,
            isConnected: false,
            lastError: 'Error de conexión'
          }))
        }
      }
    }

    return () => {
      // Limpiar conexión al desmontar
      try {
        socketClient.disconnectSocket()
        setSocketState(prev => ({
          ...prev,
          isConnected: false
        }))
      } catch (error) {
        console.warn('⚠️ useSocket: Error during cleanup', error)
      }
    }
  }, [user?.email, user?.isActive])

  // ✅ Métodos públicos simplificados
  const joinRoom = useCallback((conversationId: string) => {
    if (socketState.isConnected && user?.email) {
      logger.info('Joining conversation room', { conversationId, userEmail: user.email })
    }
  }, [socketState.isConnected, user?.email])

  const leaveRoom = useCallback((conversationId: string) => {
    if (socketState.isConnected && user?.email) {
      logger.info('Leaving conversation room', { conversationId, userEmail: user.email })
    }
  }, [socketState.isConnected, user?.email])

  const sendTyping = useCallback((conversationId: string) => {
    if (socketState.isConnected && user?.email) {
      logger.info('Sending typing indicator', { conversationId, userEmail: user.email })
    }
  }, [socketState.isConnected, user?.email])

  const sendStopTyping = useCallback((conversationId: string) => {
    if (socketState.isConnected && user?.email) {
      logger.info('Stopping typing indicator', { conversationId, userEmail: user.email })
    }
  }, [socketState.isConnected, user?.email])

  const reconnect = useCallback(() => {
    const token = localStorage.getItem('auth_token')
    if (token && user?.email) {
      setSocketState(prev => ({ ...prev, isReconnecting: true }))
      
      try {
        socketClient.connectWithToken(token, user.email)
        setSocketState(prev => ({
          ...prev,
          isReconnecting: false,
          isConnected: true,
          lastError: null
        }))
      } catch (error) {
        setSocketState(prev => ({
          ...prev,
          isReconnecting: false,
          lastError: 'Error de reconexión'
        }))
      }
    }
  }, [user?.email])

  return {
    ...socketState,
    joinRoom,
    leaveRoom,
    sendTyping,
    sendStopTyping,
    reconnect
  }
}

// ✅ Hook simplificado para typing indicators usando EMAIL
export function useTypingIndicators(conversationId?: string) {
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!conversationId || !user?.email) return

    const socket = socketClient.getSocket()
    if (!socket) return

    const handleTyping = (data: any) => {
      if (data.conversationId === conversationId && data.userEmail !== user.email) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userEmail !== data.userEmail)
          return [...filtered, {
            userEmail: data.userEmail,
            userName: data.userName,
            conversationId: data.conversationId,
            timestamp: new Date()
          }]
        })

        // Remover después de 3 segundos
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userEmail !== data.userEmail))
        }, 3000)
      }
    }

    const handleStopTyping = (data: any) => {
      if (data.conversationId === conversationId) {
        setTypingUsers(prev => prev.filter(u => u.userEmail !== data.userEmail))
      }
    }

    socket.on('user:typing', handleTyping)
    socket.on('user:stopped_typing', handleStopTyping)

    return () => {
      socket.off('user:typing', handleTyping)
      socket.off('user:stopped_typing', handleStopTyping)
    }
  }, [conversationId, user?.email])

  return typingUsers
} 