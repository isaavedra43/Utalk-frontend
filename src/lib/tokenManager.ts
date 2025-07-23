// Gestor de tokens para refresh automático y logout seguro
// Maneja la rotación de tokens y expiración segura
import { apiClient } from '@/services/apiClient'
import { logger } from '@/lib/logger'
import { API_ENDPOINTS } from '@/lib/constants'



class TokenManager {
  private refreshTimeout: NodeJS.Timeout | null = null
  private isRefreshing = false
  private refreshPromise: Promise<string | null> | null = null

  // Obtener token del localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  // Guardar token en localStorage
  setToken(token: string, expiresIn?: number): void {
    const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : Date.now() + 24 * 60 * 60 * 1000 // 24h por defecto
    
    localStorage.setItem('auth_token', token)
    localStorage.setItem('token_expires_at', expiresAt.toString())
    
    // Programar refresh automático
    this.scheduleTokenRefresh(expiresAt)
    
    logger.info('Token guardado y refresh programado', {
      expiresAt: new Date(expiresAt).toISOString(),
      expiresInMinutes: Math.round((expiresAt - Date.now()) / 60000)
    })
  }

  // Verificar si el token está próximo a expirar (5 minutos antes)
  isTokenExpiringSoon(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at')
    if (!expiresAt) return true
    
    const expirationTime = parseInt(expiresAt)
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000
    
    return expirationTime <= fiveMinutesFromNow
  }

  // Verificar si el token ha expirado
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at')
    if (!expiresAt) return true
    
    const expirationTime = parseInt(expiresAt)
    return Date.now() >= expirationTime
  }

  // Programar refresh automático del token
  private scheduleTokenRefresh(expiresAt: number): void {
    // Limpiar timeout anterior
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
    }

    // Calcular tiempo para refresh (5 minutos antes de expirar)
    const refreshTime = expiresAt - 5 * 60 * 1000
    const delay = Math.max(0, refreshTime - Date.now())

    this.refreshTimeout = setTimeout(() => {
      this.refreshToken()
    }, delay)

    logger.info('Refresh de token programado', {
      refreshTime: new Date(refreshTime).toISOString(),
      delayMinutes: Math.round(delay / 60000)
    })
  }

  // Refresh automático del token
  async refreshToken(): Promise<string | null> {
    // Evitar múltiples refreshes simultáneos
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  // Realizar refresh del token
  private async performTokenRefresh(): Promise<string | null> {
    try {
      logger.info('Iniciando refresh de token')
      
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {})
      
      if (response.token) {
        this.setToken(response.token, response.expiresIn)
        apiClient.setAuthToken(response.token)
        
        logger.info('Token refrescado exitosamente')
        return response.token
      } else {
        throw new Error('No se recibió nuevo token')
      }
    } catch (error: any) {
      logger.error('Error al refrescar token', { error: error.message })
      
      // Si falla el refresh, hacer logout
      this.handleTokenExpiration()
      return null
    }
  }

  // Manejar expiración del token
  handleTokenExpiration(): void {
    logger.warn('Token expirado, iniciando logout')
    
    // Limpiar timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = null
    }

    // Limpiar localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_data')

    // Limpiar token del cliente API
    apiClient.setAuthToken(null)

    // Disparar evento de logout
    window.dispatchEvent(new CustomEvent('token-expired'))
  }

  // Verificar token periódicamente
  startTokenMonitoring(): void {
    // Verificar cada minuto
    setInterval(() => {
      if (this.isTokenExpired()) {
        this.handleTokenExpiration()
      } else if (this.isTokenExpiringSoon()) {
        this.refreshToken()
      }
    }, 60 * 1000)

    logger.info('Monitoreo de token iniciado')
  }

  // Limpiar recursos
  cleanup(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = null
    }
    this.isRefreshing = false
    this.refreshPromise = null
  }
}

export const tokenManager = new TokenManager()
export default tokenManager 