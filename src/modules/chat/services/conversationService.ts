// Servicio para el manejo de conversaciones
// ✅ REFACTORIZADO: Solo obtiene TODAS las conversaciones del backend
import { apiClient } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/lib/constants'
import type { CanonicalConversation } from '@/types/canonical'

/**
 * ✅ PASO 2: Validador simple y flexible para conversaciones
 * CORREGIDO: Solo exige 'id', no contact completo
 */
function isValidConversation(conv: any): boolean {
  const isValid = typeof conv === 'object' && conv && conv.id
  
  // Log detallado para debugging
  if (!isValid) {
    console.warn('[VALIDATION] Invalid conversation found:', {
      conversation: conv,
      hasObject: typeof conv === 'object',
      hasTruthy: !!conv,
      hasId: !!conv?.id,
      reason: !conv ? 'null/undefined' : !conv.id ? 'missing id' : 'not object'
    })
  }
  
  return isValid
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

      // ✅ PASO 1: Log de debugging inmediato después de recibir datos
      console.log('[DEBUG] Conversations received from backend:', response.data)
      console.log('[DEBUG] Backend response structure:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        isDataArray: Array.isArray(response.data),
        hasDataData: !!response.data?.data,
        dataDataType: typeof response.data?.data,
        isDataDataArray: Array.isArray(response.data?.data),
        dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A'
      })

      // Log para depuración (solo en desarrollo)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔎 [DEBUG] RAW RESPONSE CONVERSATIONS:', response.data)
        console.log('🔎 [DEBUG] Response structure:', {
          isArray: Array.isArray(response.data),
          type: typeof response.data,
          keys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : 'N/A'
        })
      }

      // ✅ CORREGIDO: Priorizar response.data.data como estructura principal
      let conversations: any = []

      // PRIORIDAD 1: { data: { data: [...] } } - ESTRUCTURA PRINCIPAL
      if (Array.isArray(response.data?.data)) {
        conversations = response.data.data
        console.log('✅ [DEBUG] Using PRIMARY structure: response.data.data')
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected nested data format (PRIMARY)')
        }
      } 
      // PRIORIDAD 2: Array directo en data
      else if (Array.isArray(response.data)) {
        conversations = response.data
        console.log('✅ [DEBUG] Using FALLBACK structure: response.data (direct array)')
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected direct array format (FALLBACK)')
        }
      } 
      // PRIORIDAD 3: { data: { conversations: [...] } }
      else if (Array.isArray(response.data?.conversations)) {
        conversations = response.data.conversations
        console.log('✅ [DEBUG] Using LEGACY structure: response.data.conversations')
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected nested conversations format (LEGACY)')
        }
      } 
      // PRIORIDAD 4: Otros formatos alternativos
      else if (Array.isArray(response.data?.results)) {
        conversations = response.data.results
        console.log('✅ [DEBUG] Using ALT structure: response.data.results')
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected results format (ALT)')
        }
      } else if (Array.isArray(response.data?.items)) {
        conversations = response.data.items
        console.log('✅ [DEBUG] Using ALT structure: response.data.items')
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected items format (ALT)')
        }
      } else if (Array.isArray(response.data?.list)) {
        conversations = response.data.list
        console.log('✅ [DEBUG] Using ALT structure: response.data.list')
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ [DEBUG] Detected list format (ALT)')
        }
      } else {
        // ÚLTIMO RECURSO: Búsqueda dinámica
        if (response.data && typeof response.data === 'object') {
          for (const key of Object.keys(response.data)) {
            if (Array.isArray(response.data[key])) {
              conversations = response.data[key]
              console.log(`✅ [DEBUG] Using DYNAMIC structure: response.data.${key}`)
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ [DEBUG] Found array in property: ${key} (DYNAMIC)`)
              }
              break
            }
          }
        }
      }

      // ✅ PASO 1: Log específico del array extraído
      console.log('[DEBUG] Extracted conversations array:', conversations)
      console.log('[DEBUG] Extracted array length:', conversations?.length)
      console.log('[DEBUG] Extracted array type:', typeof conversations)
      console.log('[DEBUG] Is extracted array valid:', Array.isArray(conversations))

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