// Gestor de tokens para refresh automático y logout seguro
// Maneja la rotación de tokens y expiración segura
import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext } from './logger'

// ✅ CONTEXTO PARA LOGGING
const tokenManagerContext = getComponentContext('tokenManager')

interface TokenData {
  token: string
  expiresAt: number
  refreshToken?: string
}

interface RefreshResponse {
  success: boolean
  data?: {
    token: string
    expiresAt: number
    refreshToken?: string
  }
  error?: string
}

class TokenManager {
  private refreshTimer: NodeJS.Timeout | null = null
  private isRefreshing = false

  // ✅ GUARDAR TOKEN CON REFRESH AUTOMÁTICO
  saveToken(tokenData: TokenData) {
    const context = createLogContext({
      ...tokenManagerContext,
      method: 'saveToken',
      data: {
        hasToken: !!tokenData.token,
        expiresAt: new Date(tokenData.expiresAt).toISOString(),
        hasRefreshToken: !!tokenData.refreshToken
      }
    })

    logger.info('AUTH', 'Token guardado y refresh programado', context)

    // ✅ Guardar en localStorage
    localStorage.setItem('auth_token', tokenData.token)
    localStorage.setItem('token_expires_at', tokenData.expiresAt.toString())
    
    if (tokenData.refreshToken) {
      localStorage.setItem('refresh_token', tokenData.refreshToken)
    }

    // ✅ Configurar en apiClient
    apiClient.setAuthToken(tokenData.token)

    // ✅ Programar refresh automático
    this.scheduleTokenRefresh(tokenData.expiresAt)
  }

  // ✅ PROGRAMAR REFRESH AUTOMÁTICO
  private scheduleTokenRefresh(expiresAt: number) {
    // ✅ Limpiar timer anterior
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    // ✅ Calcular tiempo hasta refresh (5 minutos antes de expirar)
    const now = Date.now()
    const refreshTime = expiresAt - (5 * 60 * 1000) // 5 minutos antes
    const timeUntilRefresh = refreshTime - now

    const context = createLogContext({
      ...tokenManagerContext,
      method: 'scheduleTokenRefresh',
      data: {
        expiresAt: new Date(expiresAt).toISOString(),
        refreshTime: new Date(refreshTime).toISOString(),
        timeUntilRefresh: Math.round(timeUntilRefresh / 1000 / 60) // minutos
      }
    })

    logger.info('AUTH', 'Refresh de token programado', context)

    if (timeUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken()
      }, timeUntilRefresh)
    } else {
      // ✅ Token ya expirado o muy cerca, refrescar inmediatamente
      this.refreshToken()
    }
  }

  // ✅ REFRESCAR TOKEN
  private async refreshToken() {
    if (this.isRefreshing) {
      logger.warn('AUTH', 'Token refresh already in progress', createLogContext({
        ...tokenManagerContext,
        method: 'refreshToken'
      }))
      return
    }

    this.isRefreshing = true

    const context = createLogContext({
      ...tokenManagerContext,
      method: 'refreshToken'
    })

    logger.info('AUTH', 'Iniciando refresh de token', context)

    try {
      const refreshToken = localStorage.getItem('refresh_token')
      const currentToken = localStorage.getItem('auth_token')

      if (!refreshToken && !currentToken) {
        logger.warn('AUTH', 'No refresh token or current token available', context)
        this.handleTokenExpiration()
        return
      }

      // ✅ Intentar refresh con refresh token o token actual
      const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
        refreshToken: refreshToken || currentToken
      })

      const responseData = response.data
      if (responseData.success && responseData.data) {
        logger.info('AUTH', 'Token refrescado exitosamente', createLogContext({
          ...context,
          data: {
            newExpiresAt: new Date(responseData.data.expiresAt).toISOString()
          }
        }))

        // ✅ Guardar nuevo token
        this.saveToken({
          token: responseData.data.token,
          expiresAt: responseData.data.expiresAt,
          refreshToken: responseData.data.refreshToken
        })
      } else {
        throw new Error(responseData.error || 'Failed to refresh token')
      }
    } catch (error) {
      logger.error('AUTH', 'Error al refrescar token', createLogContext({
        ...context,
        error: error as Error
      }))

      this.handleTokenExpiration()
    } finally {
      this.isRefreshing = false
    }
  }

  // ✅ MANEJAR EXPIRACIÓN DE TOKEN
  private handleTokenExpiration() {
    const context = createLogContext({
      ...tokenManagerContext,
      method: 'handleTokenExpiration'
    })

    logger.warn('AUTH', 'Token expirado, iniciando logout', context)

    // ✅ Limpiar datos de sesión
    this.clearTokenData()

    // ✅ Redirigir a login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  // ✅ LIMPIAR DATOS DE TOKEN
  clearTokenData() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    localStorage.removeItem('auth_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')

    apiClient.setAuthToken(null)

    logger.info('AUTH', 'Token data cleared', createLogContext({
      ...tokenManagerContext,
      method: 'clearTokenData'
    }))
  }

  // ✅ OBTENER TOKEN ACTUAL
  getCurrentToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  // ✅ VERIFICAR SI TOKEN ES VÁLIDO
  isTokenValid(): boolean {
    const token = localStorage.getItem('auth_token')
    const expiresAt = localStorage.getItem('token_expires_at')

    if (!token || !expiresAt) {
      return false
    }

    const expiration = parseInt(expiresAt)
    const now = Date.now()

    return now < expiration
  }

  // ✅ INICIALIZAR MONITOREO
  startTokenMonitoring() {
    const context = createLogContext({
      ...tokenManagerContext,
      method: 'startTokenMonitoring'
    })

    logger.info('AUTH', 'Monitoreo de token iniciado', context)

    const expiresAt = localStorage.getItem('token_expires_at')
    if (expiresAt) {
      this.scheduleTokenRefresh(parseInt(expiresAt))
    }
  }

  // ✅ DETENER MONITOREO
  stopTokenMonitoring() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    logger.info('AUTH', 'Monitoreo de token detenido', createLogContext({
      ...tokenManagerContext,
      method: 'stopTokenMonitoring'
    }))
  }
}

// ✅ Instancia global
export const tokenManager = new TokenManager()

// ✅ Inicializar automáticamente si hay token
if (typeof window !== 'undefined') {
  const hasToken = localStorage.getItem('auth_token')
  if (hasToken) {
    tokenManager.startTokenMonitoring()
  }
} 