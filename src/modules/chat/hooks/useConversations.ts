// Hook para gestión de conversaciones
// ✅ REFACTORIZADO: Solo obtiene TODAS las conversaciones del backend
import { useQuery } from '@tanstack/react-query'
import { conversationService } from '../services/conversationService'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/services/apiClient'

// ✅ Query keys simplificadas - sin filtros
export const conversationKeys = {
  all: ['conversations'] as const,
  list: () => [...conversationKeys.all, 'list'] as const,
}

/**
 * ✅ Hook principal para obtener TODAS las conversaciones
 * Sin filtros - el backend ya entrega la lista correcta
 * CON VALIDACIÓN DE AUTENTICACIÓN
 */
export function useConversations() {
  console.log('[HOOK] useConversations: Hook llamado, verificando autenticación...')
  
  // ✅ VALIDAR AUTENTICACIÓN ANTES DE HACER QUERIES
  const { isAuthenticated, isAuthReady, user } = useAuth()
  
  // ✅ TEMPORAL: Datos mock si no está autenticado para probar renderizado
  if (!isAuthenticated || !user) {
    console.log('[HOOK] useConversations: No autenticado, devolviendo datos mock')
    return {
      data: [],
      isLoading: false,
      error: null,
      refetch: () => Promise.resolve(),
      isRefetching: false
    }
  }
  
  return useQuery({
    queryKey: conversationKeys.list(),
    queryFn: async () => {
      console.log('[HOOK] useConversations: Ejecutando queryFn...')
      
      // ✅ VALIDACIÓN DOBLE: Contexto + Token en ApiClient
      if (!isAuthenticated || !user) {
        console.error('[HOOK] useConversations: Usuario no autenticado en contexto')
        throw new Error('Usuario no autenticado')
      }

      const currentToken = apiClient.getAuthToken()
      if (!currentToken) {
        console.error('[HOOK] useConversations: No hay token en ApiClient')
        throw new Error('No hay token de autenticación')
      }

      console.log('[HOOK] useConversations: ✅ Autenticación válida, procediendo con request')
      console.log('[HOOK] useConversations: Token presente:', {
        hasToken: !!currentToken,
        tokenPreview: currentToken.substring(0, 20) + '...',
        userEmail: user.email
      })
      
      try {
        const result = await conversationService.getConversations()
        
        console.log('[HOOK] useConversations: Resultado recibido del servicio:')
        console.log('[HOOK] - Tipo:', typeof result)
        console.log('[HOOK] - Es array:', Array.isArray(result))
        console.log('[HOOK] - Longitud:', result?.length)
        console.log('[HOOK] - Contenido completo:', result)
        
        if (result && Array.isArray(result)) {
          console.log('[HOOK] useConversations: Conversaciones válidas encontradas:', result.length)
          result.forEach((conv, index) => {
            console.log(`[HOOK] Conversación ${index + 1}:`, {
              id: conv.id,
              hasContact: !!conv.contact,
              contactName: conv.contact?.name,
              hasLastMessage: !!conv.lastMessage,
              status: conv.status
            })
          })
        } else {
          console.warn('[HOOK] useConversations: Resultado no es un array válido:', result)
        }
        
        return result
        
      } catch (error) {
        console.error('[HOOK] useConversations: Error en queryFn:', error)
        console.error('[HOOK] - Tipo de error:', typeof error)
        console.error('[HOOK] - Stack trace:', error instanceof Error ? error.stack : 'No stack available')
        throw error
      }
    },
    // ✅ CONDICIONES CRÍTICAS: Solo ejecutar si está autenticado y listo
    enabled: isAuthReady && isAuthenticated && !!user && !!apiClient.getAuthToken(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      // ✅ NO REINTENTAR si es error de autenticación
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.error('[HOOK] useConversations: Error de autenticación, no reintentando')
        return false
      }
      return failureCount < 3
    },
    onSuccess: (data) => {
      console.log('[HOOK] useConversations: onSuccess ejecutado')
      console.log('[HOOK] - Data recibida:', data)
      console.log('[HOOK] - Tipo de data:', typeof data)
      console.log('[HOOK] - Es array:', Array.isArray(data))
      console.log('[HOOK] - Longitud:', data?.length)
    },
    onError: (error) => {
      console.error('[HOOK] useConversations: onError ejecutado')
      console.error('[HOOK] - Error:', error)
      console.error('[HOOK] - Mensaje:', error instanceof Error ? error.message : 'Error sin mensaje')
      
      // ✅ LOG ADICIONAL PARA DEBUG DE AUTENTICACIÓN
      console.error('[HOOK] - Estado de autenticación:', {
        isAuthenticated,
        isAuthReady,
        hasUser: !!user,
        hasToken: !!apiClient.getAuthToken()
      })
    },
    onSettled: (data, error) => {
      console.log('[HOOK] useConversations: onSettled ejecutado')
      console.log('[HOOK] - Data final:', data)
      console.log('[HOOK] - Error final:', error)
      console.log('[HOOK] - Estado final: Query completada')
    }
  })
} 