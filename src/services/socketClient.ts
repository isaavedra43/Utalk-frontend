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
  }

  // ✅ Método público para conectar cuando hay token
  public connectWithToken(token: string) {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected')
      return
    }

    console.log('🔗 Connecting to WebSocket with authentication...')
    this.connect(token)
  }

  // ✅ Conexión con token requerido
  private connect(token?: string) {
    // Verificar token
    const authToken = token || localStorage.getItem('auth_token')
    if (!authToken) {
      console.warn('❌ No authentication token available for WebSocket')
      return
    }

    console.log('🔗 Establishing WebSocket connection...')
    
    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:8000', {
      auth: { token: authToken },
      transports: ['websocket'],
      autoConnect: true,
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado')
      this.isConnected = true
      this.emit('socket:status', { connected: true })
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