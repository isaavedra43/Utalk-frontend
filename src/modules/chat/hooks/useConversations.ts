// Hook para gestión de conversaciones
// ✅ REFACTORIZADO: Solo obtiene TODAS las conversaciones del backend
import { useQuery } from '@tanstack/react-query'
import { conversationService } from '../services/conversationService'

// ✅ Query keys simplificadas - sin filtros
export const conversationKeys = {
  all: ['conversations'] as const,
  list: () => [...conversationKeys.all, 'list'] as const,
}

/**
 * ✅ Hook principal para obtener TODAS las conversaciones
 * Sin filtros - el backend ya entrega la lista correcta
 */
export function useConversations() {
  console.log('[HOOK] useConversations: Hook llamado, iniciando consulta...')
  
  return useQuery({
    queryKey: conversationKeys.list(),
    queryFn: async () => {
      console.log('[HOOK] useConversations: Ejecutando queryFn...')
      
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
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
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
    },
    onSettled: (data, error) => {
      console.log('[HOOK] useConversations: onSettled ejecutado')
      console.log('[HOOK] - Data final:', data)
      console.log('[HOOK] - Error final:', error)
      console.log('[HOOK] - Estado final: Query completada')
    }
  })
} 