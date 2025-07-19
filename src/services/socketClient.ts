// Cliente WebSocket para comunicación en tiempo real
// Configuración de Socket.IO, eventos y reconexión automática
import { io, Socket } from 'socket.io-client'

class SocketClient {
  private socket: Socket | null = null
  private isConnected = false
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor() {
    // ✅ NO conectar automáticamente - solo cuando hay token
    console.log('🔗 SocketClient initialized - will connect when authenticated')
    
    // ✅ Validar variables de entorno de WebSocket
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

    // ✅ Validar que no use wss:// (Socket.IO maneja el protocolo)
    if (wsUrl.startsWith('wss://')) {
      console.warn('⚠️ VITE_WS_URL should use https://, not wss://. Socket.IO will handle the protocol.')
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
    if (this.socket?.connected) {
      console.log('✅ Socket already connected')
      return
    }

    console.log('🔗 Connecting to WebSocket with authentication...', {
      hasToken: !!token,
      hasUserId: !!userId,
      tokenLength: token?.length || 0
    })
    
    this.connect(token, userId)
  }

  // ✅ Conexión con token y userId requeridos (según Backend UTalk)
  private connect(token?: string, userId?: string) {
    // Verificar token y userId
    const authToken = token || localStorage.getItem('auth_token')
    const authUserId = userId || this.getUserIdFromStorage()
    
    if (!authToken || !authUserId) {
      console.warn('❌ Missing authentication data for WebSocket', {
        hasToken: !!authToken,
        hasUserId: !!authUserId
      })
      return
    }

    // ✅ Validar URL de WebSocket
    const wsUrl = import.meta.env.VITE_WS_URL
    if (!wsUrl) {
      console.error('❌ VITE_WS_URL not configured for WebSocket connection')
      return
    }

    console.log('🔗 Establishing WebSocket connection...', {
      url: wsUrl,
      hasToken: !!authToken,
      hasUserId: !!authUserId,
      tokenLength: authToken.length
    })
    
    // ✅ Conectar SIN token en auth (el backend UTalk espera evento explícito)
    this.socket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
    })

    // ✅ Configurar autenticación específica para Backend UTalk
    this.setupAuthenticationForUTalk(authToken, authUserId)
    this.setupEventListeners()
  }

  // ✅ Autenticación específica para Backend UTalk
  private setupAuthenticationForUTalk(token: string, userId: string) {
    if (!this.socket) return

    // ✅ Emitir evento 'auth' cuando el socket se conecte (según Backend UTalk)
    this.socket.on('connect', () => {
      console.log('🔗 Socket connected, emitting auth event...')
      
      // ✅ Backend UTalk espera: socket.emit('auth', { token, userId })
      this.socket!.emit('auth', {
        token: token,
        userId: userId
      })
      
      console.log('🔐 Socket auth emitido:', { 
        token: token.substring(0, 20) + '...', 
        userId 
      })
    })

    // ✅ Escuchar confirmación de autenticación
    this.socket.on('auth:success', (data) => {
      console.log('✅ Socket authentication successful:', data)
      this.isConnected = true
      this.emit('socket:status', { connected: true })
      this.emit('socket:auth:success', data)
    })

    this.socket.on('auth:error', (error) => {
      console.error('❌ Socket authentication failed:', error)
      this.emit('socket:auth:error', error)
    })
  }

  // ✅ Helper para obtener userId del localStorage
  private getUserIdFromStorage(): string | null {
    try {
      const userData = localStorage.getItem('user_data')
      if (userData) {
        const user = JSON.parse(userData)
        return user?.id || null
      }
    } catch (error) {
      console.warn('Error parsing user data from localStorage:', error)
    }
    return null
  }

  private setupEventListeners() {
    if (!this.socket) return

    // ✅ El evento 'connect' se maneja en setupAuthenticationForUTalk
    // Solo agregamos eventos adicionales aquí

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
      this.emit('message:new', data)
    })

    this.socket.on('message:read', (data) => {
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

  // Emitir evento al servidor
  send(event: string, data: any): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket no conectado, no se puede enviar:', event)
      return
    }

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
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      console.log('🔗 WebSocket disconnected')
    }
  }

  // Reconectar manualmente
  reconnect(): void {
    if (this.socket) {
      this.socket.connect()
    } else {
      this.connect()
    }
  }
}

// Instancia singleton del cliente WebSocket
export const socketClient = new SocketClient()
export default socketClient 