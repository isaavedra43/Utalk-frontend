import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { CONFIG } from '@/lib/config'

// Cliente HTTP configurado para UTalk
class ApiClient {
  private client: AxiosInstance
  private authToken: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: CONFIG.API.BASE_URL,
      timeout: CONFIG.API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptor para agregar token de autenticación
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.authToken || localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Interceptor para manejar errores de respuesta
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado, redirigir a login
          this.setAuthToken(null)
          localStorage.removeItem('authToken')
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Método para establecer el token de autenticación
  setAuthToken(token: string | null): void {
    this.authToken = token
    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }
  }

  // Método para obtener el token actual
  getAuthToken(): string | null {
    return this.authToken || localStorage.getItem('authToken')
  }

  // Métodos HTTP
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete(url, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data, config)
  }
}

// Instancia singleton
export const apiClient = new ApiClient() 