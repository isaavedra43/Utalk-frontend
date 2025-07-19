// Cliente Axios principal para consumir la API REST
// Configuración base, interceptors y manejo de errores
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse } from '@/types'
import { logger } from '@/lib/logger'

class ApiClient {
  private client: AxiosInstance
  
  constructor() {
    // ✅ CRÍTICO: Backend UTalk tiene todas las rutas bajo /api
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const baseURL = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`
    
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
    
    // Log inicial de configuración con detalles de debugging
    logger.info('ApiClient initialized', {
      originalApiUrl: apiUrl,
      finalBaseURL: baseURL,
      timeout: this.client.defaults.timeout,
      env: import.meta.env.DEV ? 'development' : 'production',
      envVarValue: import.meta.env.VITE_API_URL || 'NOT_SET'
    }, 'api_client_init')
    
    // ✅ Log crítico para debugging
    if (baseURL.includes('tu-backend-utalk') || baseURL.includes('your-') || baseURL.includes('localhost:8000')) {
      logger.warn('⚠️ API URL may not be configured correctly!', {
        currentURL: baseURL,
        suggestion: 'Configure VITE_API_URL in .env with real Railway backend URL'
      }, 'api_url_warning')
    }
  }

  private setupInterceptors() {
    // Request interceptor - agregar token de autenticación y logging
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        
        // Iniciar tracking de performance
        const perfId = logger.startPerformance(`API_${config.method?.toUpperCase()}_${config.url}`)
        ;(config as any).metadata = { perfId, startTime: Date.now() }
        
        logger.api(config.method?.toUpperCase() || 'GET', config.url || '', {
          headers: config.headers as Record<string, string>
        })
        
        return config
      },
      (error) => {
        logger.error('API Request interceptor error', error, 'api_request_error')
        return Promise.reject(error)
      }
    )

    // Response interceptor - manejo de errores globales y logging
    this.client.interceptors.response.use(
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

        // Manejo específico de errores
        if (status === 401) {
          // ✅ CORREGIDO: NO redirigir automáticamente durante el proceso de login
          const isLoginEndpoint = url.includes('/auth/login')
          
          logger.warn('Unauthorized request detected', {
            url,
            isLoginEndpoint,
            token: config?.headers?.Authorization ? 'present' : 'missing',
            willRedirect: !isLoginEndpoint
          }, 'api_unauthorized')
          
          // Solo limpiar tokens y redirigir si NO es el endpoint de login
          if (!isLoginEndpoint) {
            // Limpiar token inválido solo si no estamos haciendo login
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
            
            // Redirigir a login si estamos en una página protegida
            if (window.location.pathname !== '/auth/login') {
              logger.info('Redirecting to login due to expired session', { 
                currentPath: window.location.pathname 
              }, 'session_expired_redirect')
              window.location.href = '/auth/login'
            }
          } else {
            // Es el endpoint de login, dejar que el contexto maneje el error
            logger.info('Login endpoint 401 - letting context handle error', {
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
            message: error.response?.data?.message || error.message
          }, 'api_server_error')
        } else if (error.code === 'ECONNABORTED') {
          logger.error('Request timeout', { url, timeout: config?.timeout }, 'api_timeout')
        } else if (error.code === 'ERR_NETWORK') {
          logger.error('Network error - backend may be down', { 
            url,
            baseURL: config?.baseURL 
          }, 'api_network_error')
        } else {
          // ✅ NUEVO: Log para otros tipos de errores
          logger.error('Unknown API error', {
            url,
            status,
            code: error.code,
            message: error.message
          }, 'api_unknown_error')
        }

        return Promise.reject(error)
      }
    )
  }

  // Métodos HTTP principales
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config)
    return response.data.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config)
    
    // ✅ LOGS CRÍTICOS: Verificar estructura de respuesta antes de retornar
    logger.info('🔍 API POST Response Debug', {
      url,
      status: response.status,
      hasData: !!response.data,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      hasDataData: response.data?.data !== undefined,
      dataDataType: typeof response.data?.data,
      responseStructure: JSON.stringify(response.data, null, 2).substring(0, 500)
    }, 'api_post_response_debug')
    
    // ✅ CORREGIDO: Para /auth/login, retornar response.data directamente (no .data.data)
    // El backend UTalk responde con { user, token } directamente en response.data
    if (url.includes('/auth/login')) {
      const loginData = response.data as any
      logger.info('🔑 Login endpoint - returning direct response.data', {
        hasUser: !!loginData?.user,
        hasToken: !!loginData?.token,
        userExists: !!loginData?.user?.id,
        tokenLength: loginData?.token?.length || 0
      }, 'login_response_direct')
      
      return loginData as T
    }
    
    // Para otros endpoints, usar el patrón ApiResponse<T>
    return response.data.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config)
    return response.data.data
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

    const response = await this.client.post<ApiResponse<T>>(url, formData, config)
    return response.data.data
  }

  // Método para configurar headers personalizados
  setHeader(key: string, value: string) {
    this.client.defaults.headers.common[key] = value
  }

  // Método para remover headers
  removeHeader(key: string) {
    delete this.client.defaults.headers.common[key]
  }

  // Getter para acceso directo al cliente Axios si es necesario
  get axiosInstance() {
    return this.client
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient()
export default apiClient 