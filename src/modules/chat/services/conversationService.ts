// Servicio para el manejo de conversaciones
// ✅ REFACTORIZADO: Solo obtiene TODAS las conversaciones del backend
import { apiClient } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/lib/constants'
import type { CanonicalConversation } from '@/types/canonical'

/**
 * ✅ Servicio simplificado para conversaciones
 */
class ConversationService {
  /**
   * ✅ Obtener TODAS las conversaciones del backend
   * Sin filtros - el backend ya entrega la lista correcta
   */
  async getConversations(): Promise<CanonicalConversation[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.LIST)
      return response.data || []
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  }
}

// ✅ Exportar instancia singleton
export const conversationService = new ConversationService() 