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
  return useQuery({
    queryKey: conversationKeys.list(),
    queryFn: () => conversationService.getConversations(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  })
} 