import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { logger } from '@/lib/logger'

// Configuración de URL base dinámica
const isProduction = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'

const baseURL = import.meta.env.VITE_API_URL ||
  (isProduction
    ? 'https://utalk-backend-production.up.railway.app/api'
    : 'http://localhost:3000/api')

// Validar configuración de URL
if (baseURL.endsWith('/api/api')) {
  logger.warn('API', 'VITE_API_URL ends with /api - ensure endpoints do not start with /api to avoid duplication')
}

class ApiClient {
  private axiosInstance: AxiosInstance
  private authToken: string | null = null

  constructor() {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const currentToken = this.authToken || localStorage.getItem('auth_token')

        if (currentToken && (!config.headers || !config.headers.Authorization)) {
          if (config.headers) {
            config.headers.Authorization = `Bearer ${currentToken}`
          }
        }

        return config
      },
      (error) => {
        logger.error('API', 'Request interceptor error', { error: error.message })
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const config = response.config
        if (config.method && config.url) {
          logger.api(`${config.method.toUpperCase()} ${config.url} successful`)
        }
        return response
      },
      (error) => {
        const { response, config } = error

        if (response?.status === 401) {
          logger.warn('API', 'Unauthorized request detected')
          
          const isAuthEndpoint = config?.url?.includes('/auth/')
          
          if (!isAuthEndpoint) {
            logger.info('API', 'Clearing invalid session data')
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_data')
            this.authToken = null
            
            if (window.location.pathname !== '/login') {
              logger.info('API', 'Redirecting to login due to expired session')
              window.location.href = '/login'
            }
          } else {
            logger.info('API', 'Login/validation endpoint 401 - letting context handle error')
          }
        } else if (response?.status === 403) {
          logger.error('API', 'Forbidden request - insufficient permissions')
        } else if (response?.status >= 500) {
          logger.error('API', 'Server error detected')
        }

        return Promise.reject(error)
      }
    )
  }

  // HTTP methods
  async get<T = any>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config)
      
      logger.info('API', 'POST Response Debug', {
        url,
        status: response.status,
        dataKeys: response.data ? Object.keys(response.data) : []
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async delete<T = any>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await this.axiosInstance.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  // Auth token management
  setAuthToken(token: string | null) {
    logger.info('API', 'setAuthToken called', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : null
    })

    this.authToken = token

    if (token) {
      localStorage.setItem('auth_token', token)
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      logger.success('API', 'Auth token configured successfully', {
        tokenPreview: `${token.substring(0, 10)}...`
      })
    } else {
      localStorage.removeItem('auth_token')
      delete this.axiosInstance.defaults.headers.common['Authorization']
      logger.info('API', 'Auth token cleared', {
        action: 'token_removed'
      })
    }
  }

  getAuthToken(): string | null {
    return this.authToken || localStorage.getItem('auth_token')
  }

  // Instance access
  getInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient 