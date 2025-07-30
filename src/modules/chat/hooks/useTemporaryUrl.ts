// Hook para manejar URLs temporales de Firebase Storage
import { useState, useEffect, useRef } from 'react'
import { apiClient } from '@/services/apiClient'
import { logger, createLogContext, getComponentContext } from '@/lib/logger'

// ✅ CONTEXTO PARA LOGGING
const temporaryUrlContext = getComponentContext('useTemporaryUrl')

interface UseTemporaryUrlResult {
  url: string
  isExpired: boolean
  isRefreshing: boolean
  refresh: () => Promise<void>
  error: string | null
}

export function useTemporaryUrl(
  initialUrl: string, 
  expiresAt?: Date | string,
  fileId?: string
): UseTemporaryUrlResult {
  const [url, setUrl] = useState(initialUrl)
  const [isExpired, setIsExpired] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Verificar si la URL ha expirado
  const checkExpiration = useRef(() => {
    if (!expiresAt) return false

    const expirationDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
    const now = new Date()
    
    return now >= expirationDate
  }).current

  // ✅ Refrescar URL desde el backend
  const refresh = useRef(async () => {
    if (!fileId) {
      setError('No se puede refrescar: ID de archivo no disponible')
      return
    }

    try {
      setIsRefreshing(true)
      setError(null)

      console.log('[TEMPORARY-URL] Refreshing URL for file:', fileId)

      // Llamar al backend para obtener nueva URL firmada
      const response = await apiClient.get(`/api/media/file/${fileId}`)
      
      if (response.data?.mediaUrl) {
        setUrl(response.data.mediaUrl)
        setIsExpired(false)
        
        logger.success('URL', 'URL temporal refrescada', createLogContext({
          fileId,
          data: { url: response.data.mediaUrl }
        }))
        
        console.log('[TEMPORARY-URL] URL refreshed successfully')
      } else {
        throw new Error('Nueva URL no recibida del servidor')
      }

    } catch (err) {
      console.error('[TEMPORARY-URL] Error refreshing URL:', err)
      setError('Error al refrescar la URL del archivo')
      
      logger.error('API', 'Error refrescando URL temporal', createLogContext({
        fileId,
        error: err as Error,
        data: { fileId }
      }))
      
    } finally {
      setIsRefreshing(false)
    }
  }).current

  // ✅ Verificar expiración periódicamente
  useEffect(() => {
    if (!expiresAt) return

    const checkExpirationPeriodically = () => {
      const expired = checkExpiration()
      
      if (expired && !isExpired) {
        console.log('[TEMPORARY-URL] URL expired, marking as expired')
        setIsExpired(true)
        setError('La URL del archivo ha expirado')
        
        logger.warn('API', 'URL temporal expirada', createLogContext({
          fileId,
          expiresAt,
          currentTime: new Date().toISOString()
        }))
      }
    }

    // Verificar inmediatamente
    checkExpirationPeriodically()

    // Verificar cada minuto
    const interval = setInterval(checkExpirationPeriodically, 60000)

    return () => clearInterval(interval)
  }, [expiresAt, checkExpiration, isExpired, fileId])

  // ✅ Auto-refresh cuando expira (opcional)
  useEffect(() => {
    if (isExpired && fileId && !isRefreshing) {
      console.log('[TEMPORARY-URL] Auto-refreshing expired URL')
      refresh()
    }
  }, [isExpired, fileId, isRefreshing, refresh])

  return {
    url,
    isExpired,
    isRefreshing,
    refresh,
    error
  }
}

// ✅ Hook simplificado para casos básicos
export function useFileUrl(
  file: {
    url: string
    expiresAt?: Date | string
    id?: string
  }
): UseTemporaryUrlResult {
  return useTemporaryUrl(file.url, file.expiresAt, file.id)
}

export default useTemporaryUrl 