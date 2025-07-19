// Cliente Axios principal para consumir la API REST
// Configuración base, interceptors y manejo de errores
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse } from '@/types'
import { logger } from '@/lib/logger'

class ApiClient {
  private axiosInstance: AxiosInstance
  
  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
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
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config)
    
    // ✅ MANEJO ROBUSTO: Verificar formato de respuesta como en POST
    // Compatibilidad con estructura canónica y formato ApiResponse<T>
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // Patrón ApiResponse<T> estándar: { data: {...} }
      return response.data.data
    } else {
      // Respuesta directa (estructura canónica): {...} 
      return response.data as T
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config)
    
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
    
    // ✅ ACTUALIZADO: El backend UTalk usa patrón estándar para todos los endpoints
    // Verificar si la respuesta es del tipo ApiResponse<T> o directa
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // Patrón ApiResponse<T> estándar
      return response.data.data
    } else {
      // Respuesta directa (algunos endpoints especiales como login)
      return response.data as T
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config)
    return response.data.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config)
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

    const response = await this.axiosInstance.post<ApiResponse<T>>(url, formData, config)
    return response.data.data
  }

  // Método para configurar headers personalizados
  setHeader(key: string, value: string) {
    this.axiosInstance.defaults.headers.common[key] = value
  }

  // Método para remover headers
  removeHeader(key: string) {
    delete this.axiosInstance.defaults.headers.common[key]
  }

  // ✅ NUEVO: Método para establecer el token de autorización explícitamente
  setAuthToken(token: string | null) {
    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  // Getter para acceso directo al cliente Axios si es necesario
  get instance() {
    return this.axiosInstance
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient(import.meta.env.VITE_API_URL)
export default apiClient 