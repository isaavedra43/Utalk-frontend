// Cliente Axios principal para consumir la API REST
// Configuración base, interceptors y manejo de errores
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse } from '@/types'
import { logger } from '@/lib/logger'

class ApiClient {
  private axiosInstance: AxiosInstance
  private authToken: string | null = null
  
  constructor(baseURL: string) {
    // ✅ VALIDACIÓN MEJORADA: Solo advertir si realmente hay duplicación
    if (baseURL.endsWith('/api') && !baseURL.endsWith('/api/')) {
      logger.warn('VITE_API_URL ends with /api - ensure endpoints do not start with /api to avoid duplication', {
        baseURL,
        suggestion: 'Use endpoints like /auth/login instead of /api/auth/login'
      })
    }
    
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // ✅ INTERCEPTOR OPTIMIZADO: No sobrescribe headers ya configurados
    this.axiosInstance.interceptors.request.use((config) => {
      // ✅ LOGGING DETALLADO PARA DEBUG
      const currentToken = this.authToken || localStorage.getItem('auth_token')
      
      logger.info('🔍 Request Interceptor Debug', {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasAuthToken: !!currentToken,
        tokenLength: currentToken?.length || 0,
        tokenPreview: currentToken ? `${currentToken.substring(0, 20)}...` : 'none',
        existingAuthHeader: !!config.headers.Authorization,
        existingAuthValue: config.headers.Authorization ? 'present' : 'missing'
      }, 'request_interceptor_debug')

      // ✅ LÓGICA MEJORADA: Solo configurar si no existe ya
      if (currentToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${currentToken}`
        logger.info('✅ Authorization header set by interceptor', {
          url: config.url,
          method: config.method?.toUpperCase(),
          tokenPreview: `${currentToken.substring(0, 20)}...`
        }, 'auth_header_set')
      } else if (currentToken && config.headers.Authorization) {
        logger.info('ℹ️ Authorization header already present, skipping', {
          url: config.url,
          method: config.method?.toUpperCase()
        }, 'auth_header_already_present')
      } else if (!currentToken) {
        logger.warn('⚠️ No auth token available for request', {
          url: config.url,
          method: config.method?.toUpperCase()
        }, 'no_auth_token')
      }

      return config
    })

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const config = response.config as any
        const duration = config.metadata?.startTime ? Date.now() - config.metadata.startTime : 0
        
        // Finalizar tracking de performance
        if (config.metadata?.perfId) {
          logger.endPerformance(config.metadata.perfId)
        }
        
        // Log de respuesta exitosa
        logger.api(config.method?.toUpperCase() || 'GET', config.url || '', {
          status: response.status,
          duration,
          responseSize: JSON.stringify(response.data).length,
          headers: config.headers
        })
        
        return response
      },
      (error) => {
        const config = error.config as any
        const duration = config?.metadata?.startTime ? Date.now() - config.metadata.startTime : 0
        
        // Finalizar tracking de performance en caso de error
        if (config?.metadata?.perfId) {
          logger.endPerformance(config.metadata.perfId)
        }
        
        // Log detallado del error
        const status = error.response?.status
        const url = config?.url || 'unknown'
        const method = config?.method?.toUpperCase() || 'GET'
        
        logger.api(method, url, {
          status,
          duration,
          error: {
            message: error.message,
            code: error.code,
            response: error.response?.data
          },
          headers: config?.headers
        })

        // ✅ MANEJO MEJORADO DE ERRORES 401
        if (status === 401) {
          const isLoginEndpoint = url.includes('/auth/login')
          const isValidateTokenEndpoint = url.includes('/auth/validate-token')
          
          logger.warn('Unauthorized request detected', {
            url,
            isLoginEndpoint,
            isValidateTokenEndpoint,
            token: config?.headers?.Authorization ? 'present' : 'missing',
            willRedirect: !isLoginEndpoint && !isValidateTokenEndpoint
          }, 'api_unauthorized')
          
          // ✅ SOLO LIMPIAR SI NO ES LOGIN O VALIDACIÓN
          if (!isLoginEndpoint && !isValidateTokenEndpoint) {
            logger.info('Clearing invalid session data', {
              url,
              currentPath: window.location.pathname
            }, 'clearing_invalid_session')
            
            // Limpiar token inválido
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
            this.authToken = null
            
            // Redirigir a login si estamos en una página protegida
            if (window.location.pathname !== '/auth/login') {
              logger.info('Redirecting to login due to expired session', { 
                currentPath: window.location.pathname 
              }, 'session_expired_redirect')
              window.location.href = '/auth/login'
            }
          } else {
            // Es el endpoint de login o validación, dejar que el contexto maneje el error
            logger.info('Login/validation endpoint 401 - letting context handle error', {
              url,
              status
            }, 'login_error_passthrough')
          }
        } else if (status === 403) {
          logger.error('Forbidden request - insufficient permissions', {
            url,
            userRole: JSON.parse(localStorage.getItem('user_data') || '{}')?.role
          }, 'api_forbidden')
        } else if (status >= 500) {
          logger.error('Server error detected', {
            url,
            status,
            error: error.response?.data
          }, 'api_server_error')
        }

        return Promise.reject(error)
      }
    )
  }

  // ✅ MÉTODO GET CON LOGGING
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config)
    
    // ✅ LOG EXPLÍCITO DE AUDITORÍA - RESPUESTA CRUDA
    console.log(`[API-CLIENT] GET ${url} - Raw response:`, response.data)
    
    // ✅ Retornar response.data directamente sin extraer .data.data
    return response.data as T
  }

  // ✅ MÉTODO POST CON LOGGING
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config)
    
    // ✅ LOG EXPLÍCITO DE AUDITORÍA - RESPUESTA CRUDA
    console.log(`[API-CLIENT] POST ${url} - Raw response:`, response.data)
    
    // ✅ LOGS CRÍTICOS: Verificar estructura de respuesta antes de retornar
    logger.info('🔍 API POST Response Debug', {
      url,
      status: response.status,
      hasData: !!response.data,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      responseStructure: JSON.stringify(response.data, null, 2).substring(0, 500)
    }, 'api_post_response_debug')
    
    // ✅ Retornar response.data directamente sin extraer .data.data
    // Cada servicio debe manejar su propia estructura de datos
    return response.data as T
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config)
    
    // ✅ LOG EXPLÍCITO DE AUDITORÍA - RESPUESTA CRUDA
    console.log(`[API-CLIENT] PUT ${url} - Raw response:`, response.data)
    
    // ✅ Retornar response.data directamente sin extraer .data.data
    return response.data as T
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config)
    
    // ✅ LOG EXPLÍCITO DE AUDITORÍA - RESPUESTA CRUDA
    console.log(`[API-CLIENT] PATCH ${url} - Raw response:`, response.data)
    
    // ✅ Retornar response.data directamente sin extraer .data.data
    return response.data as T
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config)
    
    // ✅ LOG EXPLÍCITO DE AUDITORÍA - RESPUESTA CRUDA
    console.log(`[API-CLIENT] DELETE ${url} - Raw response:`, response.data)
    
    // ✅ Retornar response.data directamente sin extraer .data.data
    return response.data as T
  }

  // Método para subir archivos
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }

    const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, config)
    
    // ✅ LOG EXPLÍCITO DE AUDITORÍA - RESPUESTA CRUDA
    console.log(`[API-CLIENT] UPLOAD ${url} - Raw response:`, response.data)
    
    // ✅ Retornar response.data directamente sin extraer .data.data
    return response.data as T
  }

  // Método para configurar headers personalizados
  setHeader(key: string, value: string) {
    this.axiosInstance.defaults.headers.common[key] = value
  }

  // Método para remover headers
  removeHeader(key: string) {
    delete this.axiosInstance.defaults.headers.common[key]
  }

  // ✅ MÉTODO MEJORADO: setAuthToken con logging y sincronización
  setAuthToken(token: string | null) {
    logger.info('🔧 setAuthToken called', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
      previousToken: this.authToken ? `${this.authToken.substring(0, 20)}...` : 'none'
    }, 'set_auth_token_called')

    this.authToken = token

    if (token) {
      // ✅ SINCRONIZAR CON LOCALSTORAGE
      localStorage.setItem('auth_token', token)
      
      // ✅ CONFIGURAR HEADER EN AXIOS
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      logger.success('✅ Auth token configured successfully', {
        tokenPreview: `${token.substring(0, 20)}...`,
        headerSet: !!this.axiosInstance.defaults.headers.common['Authorization']
      }, 'auth_token_configured')
    } else {
      // ✅ LIMPIAR TOKEN
      localStorage.removeItem('auth_token')
      delete this.axiosInstance.defaults.headers.common['Authorization']
      
      logger.info('🗑️ Auth token cleared', {
        headerCleared: !this.axiosInstance.defaults.headers.common['Authorization']
      }, 'auth_token_cleared')
    }
  }

  // ✅ MÉTODO PARA OBTENER TOKEN ACTUAL
  getAuthToken(): string | null {
    return this.authToken || localStorage.getItem('auth_token')
  }

  // Getter para acceso directo al cliente Axios si es necesario
  get instance() {
    return this.axiosInstance
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient(
  import.meta.env.VITE_API_URL || 'https://utalk-backend-production.up.railway.app/api'
)
export default apiClient 