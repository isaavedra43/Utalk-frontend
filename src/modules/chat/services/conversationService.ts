// Servicio para el manejo de conversaciones
// ✅ REFACTORIZADO: Solo obtiene TODAS las conversaciones del backend
import { apiClient } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/lib/constants'
import type { CanonicalConversation } from '@/types/canonical'

/**
 * ✅ Validador simple para conversaciones
 */
function isValidConversation(conv: any): boolean {
  return typeof conv === 'object' && conv && conv.id && conv.contact
}

/**
 * ✅ Servicio simplificado para conversaciones
 */
class ConversationService {
  /**
   * ✅ Obtener TODAS las conversaciones del backend
   * Robusto ante cualquier estructura de respuesta
   */
  async getConversations(): Promise<CanonicalConversation[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.LIST)

      // Log para depuración (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔎 [DEBUG] RAW RESPONSE CONVERSATIONS:', response.data)
        console.log('🔎 [DEBUG] Response structure:', {
          isArray: Array.isArray(response.data),
          type: typeof response.data,
          keys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A'
        })
      }

      // Normalizador robusto - soporta todos los casos comunes de estructura
      let conversations: any = []

      if (Array.isArray(response.data)) {
        // Caso 1: Array directo
        conversations = response.data
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected direct array format')
        }
      } else if (Array.isArray(response.data?.conversations)) {
        // Caso 2: { data: { conversations: [...] } }
        conversations = response.data.conversations
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected nested conversations format')
        }
      } else if (Array.isArray(response.data?.data)) {
        // Caso 3: { data: { data: [...] } }
        conversations = response.data.data
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected nested data format')
        }
      } else if (Array.isArray(response.data?.results)) {
        // Caso 4: { data: { results: [...] } }
        conversations = response.data.results
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected results format')
        }
      } else if (Array.isArray(response.data?.items)) {
        // Caso 5: { data: { items: [...] } }
        conversations = response.data.items
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected items format')
        }
      } else if (Array.isArray(response.data?.list)) {
        // Caso 6: { data: { list: [...] } }
        conversations = response.data.list
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected list format')
        }
      } else {
        // Caso 7: Búsqueda dinámica - busca cualquier propiedad que contenga un array
        if (response.data && typeof response.data === 'object') {
          for (const key of Object.keys(response.data)) {
            if (Array.isArray(response.data[key])) {
              conversations = response.data[key]
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ [DEBUG] Found array in property: ${key}`)
              }
              break
            }
          }
        }
      }

      // Validación final
      if (!Array.isArray(conversations)) {
        console.error('❌ [ERROR] Estructura de conversaciones inesperada:', response.data)
        console.error('❌ [ERROR] No se pudo encontrar un array válido de conversaciones en la respuesta')
        return []
      }

      // Filtrar conversaciones válidas
      const validConversations = conversations.filter(isValidConversation)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ [DEBUG] Total conversations received: ${conversations.length}`)
        console.log(`✅ [DEBUG] Valid conversations after filtering: ${validConversations.length}`)
        if (validConversations.length !== conversations.length) {
          console.warn('⚠️ [WARNING] Some conversations were filtered out due to missing required fields (id, contact)')
        }
      }

      // Si no hay conversaciones válidas, mostrar mensaje informativo
      if (validConversations.length === 0 && conversations.length > 0) {
        console.warn('⚠️ [WARNING] Se recibieron conversaciones pero ninguna tiene la estructura requerida (id + contact)')
      }

      return validConversations

    } catch (error) {
      console.error('❌ [ERROR] Error fetching conversations:', error)
      
      // Mensaje más específico según el tipo de error
      if (error instanceof TypeError) {
        console.error('❌ [ERROR] Problema de tipado/estructura en la respuesta del backend')
      } else if (error instanceof SyntaxError) {
        console.error('❌ [ERROR] Respuesta del backend no es JSON válido')
      } else {
        console.error('❌ [ERROR] Error de red o servidor al obtener conversaciones')
      }
      
      throw error
    }
  }
}

// ✅ Exportar instancia singleton
export const conversationService = new ConversationService() 