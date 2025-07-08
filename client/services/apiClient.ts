// Cliente Axios centralizado para llamadas a la API del backend.
// Incluye manejo de autenticación, reintentos automáticos, interceptores y tipado genérico.

import axios, { AxiosError, AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import type { ApiResponse } from './types'

// Firebase Auth SDK (debe estar inicializado en el frontend)
import { getAuth } from 'firebase/auth'

const baseURL = import.meta.env.VITE_API_URL || '/api'

let authToken: string | null = null

/**
 * Permite actualizar dinámicamente el token de autenticación.
 */
export function setAuthToken(token: string) {
  authToken = token
}

/**
 * Convierte cualquier error de Axios en una estructura uniforme ApiResponse.
 * Lanza el error para manejo en los componentes.
 */
export function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError
    const status = err.response?.status || 0
    const message = err.response?.data?.message || err.message || 'Error desconocido'
    throw { status, message, data: err.response?.data }
  }
  throw { status: 0, message: 'Error desconocido', data: error }
}

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
})

// Reintentos automáticos en errores de red y 5xx
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 429 ||
      (error.response?.status && error.response.status >= 500)
    )
  },
})

// Interceptor de requests: añade Authorization si hay token
apiClient.interceptors.request.use(async (config) => {
  // Si no hay token manual, intenta obtenerlo de Firebase Auth
  if (!authToken) {
    try {
      const user = getAuth().currentUser
      if (user) authToken = await user.getIdToken()
    } catch {}
  }
  if (authToken) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${authToken}`
  }
  return config
})

// Interceptor de responses: manejo de errores y redirección
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    if (status === 401) {
      window.location.href = '/login'
      return Promise.reject(error)
    }
    if (status === 429) {
      // Espera breve antes de reintentar
      await new Promise((r) => setTimeout(r, 1500))
    }
    // Uniformiza el error
    handleApiError(error)
  }
)

export default apiClient

// TODO: Añadir caching en memoria, invalidación de datos, y soporte para SSE/WebSockets. 