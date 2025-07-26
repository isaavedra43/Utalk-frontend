// Cliente WebSocket para comunicación en tiempo real
// Configuración de Socket.IO, eventos y reconexión automática
import { io, Socket } from 'socket.io-client'

class SocketClient {
  private socket: Socket | null = null
  private isConnected = false
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map()
  private currentToken: string | null = null
  private currentUserId: string | null = null

  constructor() {
    console.log('🔗 SocketClient initialized - will connect when authenticated')
    this.validateWebSocketConfig()
  }

  /**
   * Validar configuración de WebSocket
   */
  private validateWebSocketConfig() {
    const wsUrl = import.meta.env.VITE_WS_URL
    
    if (!wsUrl) {
      console.error('❌ VITE_WS_URL not configured')
      return false
    }

    if (import.meta.env.DEV) {
      console.log('✅ WebSocket configuration validated', {
        wsUrl,
        protocol: wsUrl.startsWith('https://') ? 'HTTPS' : 'Other'
      })
    }

    return true
  }

  // ✅ Método público para conectar cuando hay token y userId
  public connectWithToken(token: string, userId: string) {
    // Validar que tenemos token y userId
    if (!token || !userId) {
      console.error('❌ Cannot connect socket: Missing token or userId', {
        hasToken: !!token,
        hasUserId: !!userId
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

    console.log('🔗 Conectando al socket con token:', token.substring(0, 20) + '...', 'y userId:', userId)
    
    // Guardar credenciales actuales
    this.currentToken = token
    this.currentUserId = userId
    
    this.connect(token, userId)
  }

  // ✅ CORREGIDO: Conexión con token JWT en handshake inicial
  private connect(token: string, userId: string) {
    const wsUrl = import.meta.env.VITE_WS_URL
    if (!wsUrl) {
      console.error('❌ VITE_WS_URL not configured for WebSocket connection')
      return
    }

    console.log('🔗 Establishing WebSocket connection...', {
      url: wsUrl,
      hasToken: !!token,
      hasUserId: !!userId,
      tokenLength: token.length
    })
    
    // ✅ CRÍTICO: Enviar token JWT en handshake inicial (según documentación oficial)
    this.socket = io(wsUrl, {
      auth: {
        token: token,      // ✅ Token JWT en handshake inicial
        userId: userId     // ✅ User ID en handshake inicial
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

  private setupEventListeners() {
    if (!this.socket) return

    // ✅ Conexión exitosa
    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully', {
        socketId: this.socket?.id,
        hasToken: !!this.currentToken,
        hasUserId: !!this.currentUserId
      })
      this.isConnected = true
      this.emit('socket:status', { connected: true })
    })

    // ✅ Manejar autenticación exitosa del backend
    this.socket.on('authenticated', (data) => {
      console.log('✅ Socket authentication confirmed by backend:', data)
      this.emit('socket:auth:success', data)
    })

    // ✅ Manejar confirmación de autenticación (evento alternativo)
    this.socket.on('auth:success', (data) => {
      console.log('✅ Socket authentication successful:', data)
      this.emit('socket:auth:success', data)
    })

    // ✅ Manejar error de autenticación del backend
    this.socket.on('authentication_error', (error) => {
      console.error('❌ Socket authentication failed:', error)
      this.emit('socket:auth:error', error)
      this.disconnectSocket()
    })

    // ✅ Manejar error de autenticación (evento alternativo)
    this.socket.on('auth:error', (error) => {
      console.error('❌ Socket authentication failed:', error)
      this.emit('socket:auth:error', error)
      this.disconnectSocket()
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason)
      this.isConnected = false
      this.emit('socket:status', { connected: false, reason })
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error)
      this.emit('socket:error', { error: error.message })
    })

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconectado después de', attemptNumber, 'intentos')
      this.emit('socket:reconnect', { attempts: attemptNumber })
    })

    // Escuchar eventos de la aplicación
    this.setupAppEvents()
  }

  private setupAppEvents() {
    if (!this.socket) return

    // Eventos de mensajería
    this.socket.on('message:new', (data) => {
      console.log('📨 New message received via socket:', data)
      this.emit('message:new', data)
    })

    this.socket.on('message:read', (data) => {
      console.log('📖 Message read via socket:', data)
      this.emit('message:read', data)
    })

    this.socket.on('conversation:typing', (data) => {
      this.emit('conversation:typing', data)
    })

    // Eventos de presencia
    this.socket.on('user:online', (data) => {
      this.emit('user:online', data)
    })

    this.socket.on('user:offline', (data) => {
      this.emit('user:offline', data)
    })

    // Eventos de campañas
    this.socket.on('campaign:status', (data) => {
      this.emit('campaign:status', data)
    })

    // Eventos de equipo
    this.socket.on('team:update', (data) => {
      this.emit('team:update', data)
    })
  }

  // ✅ Helper para obtener userId del localStorage
  private getUserIdFromStorage(): string | null {
    try {
      const userData = localStorage.getItem('user_data')
      if (userData) {
        const user = JSON.parse(userData)
        return user?.id || user?.uid || user?.firebaseUid || null
      }
    } catch (error) {
      console.warn('Error parsing user data from localStorage:', error)
    }
    return null
  }

  // Emitir evento al servidor
  send(event: string, data: any): void {
    if (!this.socket || !this.isConnected) {
      console.warn('❌ Socket no conectado, no se puede enviar evento:', event, data)
      return
    }

    console.log('📤 Sending socket event:', event, data)
    this.socket.emit(event, data)
  }

  // Suscribirse a eventos
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(callback)
  }

  // Desuscribirse de eventos
  off(event: string, callback?: (data: any) => void): void {
    if (!this.eventListeners.has(event)) return

    if (callback) {
      this.eventListeners.get(event)!.delete(callback)
    } else {
      this.eventListeners.delete(event)
    }
  }

  // Emitir evento localmente
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  // Unirse a una sala/room
  joinRoom(roomId: string): void {
    this.send('room:join', { roomId })
  }

  // Salir de una sala/room
  leaveRoom(roomId: string): void {
    this.send('room:leave', { roomId })
  }

  // Indicar que el usuario está escribiendo
  startTyping(conversationId: string): void {
    this.send('conversation:typing:start', { conversationId })
  }

  // Indicar que el usuario dejó de escribir
  stopTyping(conversationId: string): void {
    this.send('conversation:typing:stop', { conversationId })
  }

  // Marcar mensaje como leído
  markAsRead(messageId: string): void {
    this.send('message:mark-read', { messageId })
  }

  // Obtener estado de conexión
  get connected(): boolean {
    return this.isConnected
  }

  // ✅ Método público para desconectar
  public disconnectSocket() {
    if (this.socket) {
      console.log('🔗 Disconnecting WebSocket...')
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.currentToken = null
      this.currentUserId = null
    }
  }

  // ✅ NUEVO: Reconectar con token válido desde localStorage
  public reconnectWithAuth() {
    const token = localStorage.getItem('auth_token')
    const userId = this.getUserIdFromStorage()
    
    if (token && userId) {
      console.log('🔄 Reconnecting with stored credentials...')
      this.connectWithToken(token, userId)
    } else {
      console.warn('❌ Cannot reconnect: Missing token or userId', {
        hasToken: !!token,
        hasUserId: !!userId
      })
    }
  }

  // Reconectar manualmente
  reconnect(): void {
    if (this.socket && this.currentToken && this.currentUserId) {
      this.socket.connect()
    } else {
      this.reconnectWithAuth()
    }
  }
}

// Instancia singleton del cliente WebSocket
export const socketClient = new SocketClient()
export default socketClient 