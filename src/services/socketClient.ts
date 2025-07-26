// Cliente WebSocket para comunicación en tiempo real
// ✅ EMAIL-FIRST: Identificación por email, sin UID ni Firebase
import { io, Socket } from 'socket.io-client'
import { logger } from '@/lib/logger'

class SocketClient {
  private socket: Socket | null = null
  private isConnected: boolean = false
  private currentToken: string | null = null
  private currentUserEmail: string | null = null

  constructor() {
    console.log('🔗 SocketClient initialized for EMAIL-FIRST backend')
  }

  /**
   * ✅ Método público para conectar con token JWT y email del usuario
   */
  public connectWithToken(token: string, userEmail: string) {
    // Validar que tenemos token y email
    if (!token || !userEmail) {
      console.error('❌ Cannot connect socket: Missing token or userEmail', {
        hasToken: !!token,
        hasUserEmail: !!userEmail
      })
      return
    }

    // Desconectar socket anterior si existe
    if (this.socket) {
      console.log('🔄 Disconnecting previous socket connection...')
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }

    console.log('🔗 Conectando al socket con token:', token.substring(0, 20) + '...', 'y email:', userEmail)
    
    // Guardar credenciales actuales
    this.currentToken = token
    this.currentUserEmail = userEmail
    
    this.connect(token, userEmail)
  }

  /**
   * ✅ CRÍTICO: Conexión con email en handshake inicial
   */
  private connect(token: string, userEmail: string) {
    const wsUrl = import.meta.env.VITE_WS_URL
    if (!wsUrl) {
      console.error('❌ VITE_WS_URL not configured for WebSocket connection')
      return
    }

    console.log('🔗 Establishing WebSocket connection...', {
      url: wsUrl,
      hasToken: !!token,
      hasUserEmail: !!userEmail,
      tokenLength: token.length
    })
    
    // ✅ CRÍTICO: Enviar email en handshake inicial (EMAIL-FIRST)
    this.socket = io(wsUrl, {
      auth: {
        token: token,           // ✅ Token JWT en handshake inicial
        email: userEmail        // ✅ EMAIL como identificador (no userId)
      },
      transports: ['polling', 'websocket'], // ✅ IMPORTANTE: NO solo 'websocket'
      autoConnect: true,
      forceNew: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    this.setupEventListeners()
  }

  /**
   * ✅ Configurar listeners de eventos
   */
  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('✅ Socket connected successfully', {
        id: this.socket?.id,
        hasToken: !!this.currentToken,
        hasUserEmail: !!this.currentUserEmail
      })
      
      logger.success('WebSocket connected', {
        socketId: this.socket?.id,
        email: this.currentUserEmail
      }, 'socket_connected')
    })

    this.socket.on('authenticated', () => {
      console.log('✅ Socket authentication successful')
      logger.success('Socket authentication successful', {
        email: this.currentUserEmail
      }, 'socket_authenticated')
    })

    this.socket.on('authentication_error', (error) => {
      console.error('❌ Socket authentication failed:', error)
      logger.error('Socket authentication failed', error, 'socket_auth_failed')
      
      // Desconectar automáticamente en caso de error de autenticación
      this.disconnectSocket()
    })

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false
      console.log('🔌 Socket disconnected:', reason)
      
      logger.warn('Socket disconnected', { 
        reason,
        email: this.currentUserEmail 
      }, 'socket_disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
      logger.error('Socket connection error', error, 'socket_connection_error')
    })

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
      logger.error('Socket error', error, 'socket_error')
    })
  }

  /**
   * ✅ Unirse a un room/canal por email
   */
  public joinRoom(roomId: string) {
    if (this.socket && this.isConnected) {
      console.log(`📞 Joining room: ${roomId} as email: ${this.currentUserEmail}`)
      this.socket.emit('join:room', { 
        roomId,
        email: this.currentUserEmail 
      })
    }
  }

  /**
   * ✅ Salir de un room/canal
   */
  public leaveRoom(roomId: string) {
    if (this.socket && this.isConnected) {
      console.log(`🚪 Leaving room: ${roomId}`)
      this.socket.emit('leave:room', { 
        roomId,
        email: this.currentUserEmail 
      })
    }
  }

  /**
   * ✅ Enviar evento de typing
   */
  public sendTyping(conversationId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('user:typing', { 
        conversationId,
        email: this.currentUserEmail 
      })
    }
  }

  /**
   * ✅ Enviar evento de stop typing
   */
  public sendStopTyping(conversationId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('user:stopped_typing', { 
        conversationId,
        email: this.currentUserEmail 
      })
    }
  }

  /**
   * ✅ Helper para obtener email del localStorage
   */
  private getUserEmailFromStorage(): string | null {
    try {
      const userData = localStorage.getItem('user_data')
      if (userData) {
        const user = JSON.parse(userData)
        return user?.email || null
      }
    } catch (error) {
      console.warn('Error parsing user data from localStorage:', error)
    }
    return null
  }

  /**
   * ✅ Desconectar socket
   */
  public disconnectSocket() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...')
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.currentToken = null
      this.currentUserEmail = null
    }
  }

  /**
   * ✅ Reconectar con credenciales almacenadas
   */
  public reconnectWithAuth() {
    const token = localStorage.getItem('auth_token')
    const userEmail = this.getUserEmailFromStorage()

    if (token && userEmail) {
      console.log('🔄 Reconnecting socket with stored credentials...')
      this.connectWithToken(token, userEmail)
    } else {
      console.warn('❌ Cannot reconnect: Missing token or userEmail', {
        hasToken: !!token,
        hasUserEmail: !!userEmail
      })
    }
  }

  /**
   * ✅ Verificar estado de conexión
   */
  public isSocketConnected(): boolean {
    return this.socket && this.currentToken && this.currentUserEmail ? this.isConnected : false
  }

  /**
   * ✅ Obtener socket instance para listeners externos
   */
  public getSocket(): Socket | null {
    return this.socket
  }
}

// ✅ Export singleton instance
export const socketClient = new SocketClient() 