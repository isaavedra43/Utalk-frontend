// Cliente Axios principal para consumir la API REST
// Configuración base, interceptors y manejo de errores
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse } from '@/types'
import { logger } from '@/lib/logger'

class ApiClient {
  private client: AxiosInstance
  
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
    
    // Log inicial de configuración
    logger.info('ApiClient initialized', {
      baseURL: this.client.defaults.baseURL,
      timeout: this.client.defaults.timeout,
      env: import.meta.env.DEV ? 'development' : 'production'
    }, 'api_client_init')
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
          logger.warn('Unauthorized request - token may be expired', {
            url,
            token: config?.headers?.Authorization ? 'present' : 'missing'
          }, 'api_unauthorized')
          
          // Limpiar token inválido
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          
          // Redirigir a login si estamos en una página protegida
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login'
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