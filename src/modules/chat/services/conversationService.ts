// Servicio para el manejo de conversaciones
// ✅ REFACTORIZADO: Solo obtiene TODAS las conversaciones del backend
import { apiClient } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/lib/constants'
import type { CanonicalConversation } from '@/types/canonical'

/**
 * ✅ NORMALIZACIÓN SIMPLE Y ROBUSTA: Solo descarta si no hay ID
 * Todo lo demás usa defaults seguros
 */
function normalizeConversation(conv: any): any {
  // ❌ ÚNICO DESCARTE: Si no hay ID
  if (!conv || !conv.id) {
    console.warn('[NORMALIZE] Descartando conversación sin ID:', conv)
    return null
  }

  console.log('[NORMALIZE] Procesando conversación:', conv.id, conv)

  // ✅ NORMALIZACIÓN SIMPLE CON DEFAULTS SEGUROS
  const normalized = {
    // ✅ ID obligatorio (ya validado)
    id: conv.id,
    
    // ✅ TÍTULO con múltiples fallbacks
    title: conv.title || 
           conv.contact?.name || 
           conv.customerPhone || 
           conv.participants?.[0] || 
           'Conversación Sin Título',
    
    // ✅ STATUS con default seguro
    status: (['open', 'pending', 'closed', 'archived'].includes(conv.status)) ? 
            conv.status : 'open',
    
    // ✅ PRIORITY con default seguro  
    priority: (['low', 'medium', 'high', 'urgent'].includes(conv.priority)) ? 
              conv.priority : 'medium',
    
    // ✅ CONTACTO con defaults inteligentes
    contact: conv.contact ? {
      id: conv.contact.id || conv.customerPhone || conv.participants?.[0] || 'unknown',
      name: conv.contact.name || conv.customerPhone || conv.participants?.[0] || 'Cliente',
      phone: conv.contact.phone || conv.customerPhone || conv.participants?.[0] || 'N/A',
      avatar: conv.contact.avatarUrl || conv.contact.avatar || undefined,
      email: conv.contact.email || undefined,
      isOnline: conv.contact.isOnline || false,
      lastSeen: conv.contact.lastSeen ? new Date(conv.contact.lastSeen) : undefined,
      company: conv.contact.company || undefined,
      department: conv.contact.department || undefined,
      tags: conv.contact.tags || [],
      createdAt: conv.contact.createdAt ? new Date(conv.contact.createdAt) : new Date(),
      updatedAt: conv.contact.updatedAt ? new Date(conv.contact.updatedAt) : new Date(),
      customFields: conv.contact.customFields || undefined,
      isBlocked: conv.contact.isBlocked || false,
      preferences: conv.contact.preferences || {
        language: 'es',
        timezone: 'UTC', 
        notifications: true
      }
    } : {
      // ✅ CONTACTO DEFAULT si no existe
      id: conv.customerPhone || conv.participants?.[0] || 'unknown',
      name: conv.customerPhone || conv.participants?.[0] || 'Cliente',
      phone: conv.customerPhone || conv.participants?.[0] || 'N/A',
      avatar: undefined,
      email: undefined,
      isOnline: false,
      lastSeen: undefined,
      company: undefined,
      department: undefined,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      customFields: undefined,
      isBlocked: false,
      preferences: {
        language: 'es',
        timezone: 'UTC',
        notifications: true
      }
    },
    
    // ✅ CANAL con fallback inteligente
    channel: conv.channel || conv.contact?.channel || 'whatsapp',
    
    // ✅ FECHAS - Maneja Firebase timestamps, strings, Date objects
    createdAt: conv.createdAt?._seconds ? 
               new Date(conv.createdAt._seconds * 1000) :
               conv.createdAt ? new Date(conv.createdAt) : new Date(),
               
    updatedAt: conv.updatedAt?._seconds ? 
               new Date(conv.updatedAt._seconds * 1000) :
               conv.updatedAt ? new Date(conv.updatedAt) : 
               conv.lastMessageAt ? new Date(conv.lastMessageAt) : new Date(),
               
    lastMessageAt: conv.lastMessageAt?._seconds ? 
                   new Date(conv.lastMessageAt._seconds * 1000) :
                   conv.lastMessageAt ? new Date(conv.lastMessageAt) :
                   conv.lastMessage?.timestamp?._seconds ? 
                   new Date(conv.lastMessage.timestamp._seconds * 1000) :
                   conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp) : new Date(),
    
    // ✅ CONTADORES - Maneja formato {operand: 1}
    messageCount: typeof conv.messageCount === 'object' && conv.messageCount?.operand ? 
                  conv.messageCount.operand : 
                  typeof conv.messageCount === 'number' ? conv.messageCount : 1,
                  
    unreadCount: typeof conv.unreadCount === 'object' && conv.unreadCount?.operand ? 
                 conv.unreadCount.operand :
                 typeof conv.unreadCount === 'number' ? conv.unreadCount : 0,
    
    // ✅ ASIGNACIÓN opcional
    assignedTo: conv.assignedTo || undefined,
    
    // ✅ ÚLTIMO MENSAJE con defaults seguros
    lastMessage: conv.lastMessage ? {
      id: conv.lastMessage.id || 'unknown',
      content: conv.lastMessage.content || 'Sin contenido',
      timestamp: conv.lastMessage.timestamp?._seconds ? 
                 new Date(conv.lastMessage.timestamp._seconds * 1000) :
                 conv.lastMessage.timestamp ? new Date(conv.lastMessage.timestamp) : new Date(),
      senderName: conv.lastMessage.senderName || 'Usuario',
      type: conv.lastMessage.type || 'text'
    } : {
      id: 'placeholder',
      content: 'Sin mensajes',
      timestamp: new Date(),
      senderName: 'Sistema',
      type: 'text'
    },
    
    // ✅ METADATOS con defaults seguros
    tags: Array.isArray(conv.tags) ? conv.tags : [],
    isMuted: conv.isMuted || false,
    isArchived: conv.isArchived || false,
    
    // ✅ CAMPOS ADICIONALES del backend
    participants: conv.participants || [],
    customerPhone: conv.customerPhone || undefined,
    lastMessageId: conv.lastMessageId || undefined,
    
    // ✅ METADATOS de normalización
    metadata: {
      source: 'backend',
      normalized: true,
      originalData: conv
    }
  }

  console.log('[NORMALIZE] ✅ Conversación normalizada exitosamente:', {
    id: normalized.id,
    title: normalized.title,
    hasContact: !!normalized.contact,
    contactName: normalized.contact.name,
    status: normalized.status,
    messageCount: normalized.messageCount,
    unreadCount: normalized.unreadCount
  })

  return normalized
}

/**
 * ✅ Servicio simplificado para conversaciones
 */
class ConversationService {
  /**
   * ✅ Obtener todas las conversaciones
   * Robusto ante cualquier estructura de respuesta
   */
  async getConversations(): Promise<CanonicalConversation[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.LIST)

      // ✅ LOG EXPLÍCITO DE AUDITORÍA - RESPUESTA CRUDA
      console.log("Conversaciones recibidas (raw):", response)

      // ✅ El backend entrega SIEMPRE el array de conversaciones directamente en response
      // Nunca usar response.data.data ni response.data.conversations
      if (!response) {
        console.log('[SERVICE] Empty response, returning empty array')
        return []
      }

      let conversations: any = []

      // El response puede ser directamente el array o un objeto que contiene el array
      if (Array.isArray(response)) {
        conversations = response
        console.log('✅ [SUCCESS] Response is array directly')
      } else if (response && typeof response === 'object') {
        // Buscar array en las propiedades más comunes
        if (Array.isArray(response.data)) {
          conversations = response.data
          console.log('✅ [SUCCESS] Found array in response.data')
        } else if (Array.isArray(response.conversations)) {
          conversations = response.conversations
          console.log('✅ [SUCCESS] Found array in response.conversations')
        } else {
          console.log('⚠️ [WARNING] No array found in response object')
          conversations = []
        }
      }

      // ✅ LOGS FINALES
      console.log('[DEBUG] Extracted conversations array:', conversations)
      console.log('[DEBUG] Extracted array length:', conversations?.length)
      console.log('[DEBUG] Is extracted array valid:', Array.isArray(conversations))

      // Validación final
      if (!Array.isArray(conversations)) {
        console.error('❌ [ERROR] No array found anywhere in response')
        console.error('❌ [ERROR] Full response structure:', response)
        console.error('❌ [ERROR] Response keys:', response && typeof response === 'object' ? Object.keys(response) : 'none')
        return []
      }

      console.log('🔧 [NORMALIZE] Iniciando normalización de conversaciones...')
      console.log('🔧 [NORMALIZE] Conversaciones originales del backend:', conversations)

      // ✅ PROCESAMIENTO SIMPLE: Solo normalizar y validar ID
      const processedConversations = []
      
      for (let i = 0; i < conversations.length; i++) {
        const originalConv = conversations[i]
        console.log(`🔧 [NORMALIZE] Procesando conversación ${i + 1}/${conversations.length}:`, originalConv)
        
        // ✅ NORMALIZAR (solo falla si no hay ID)
        const normalized = normalizeConversation(originalConv)
        
        if (normalized) {
          console.log(`✅ [NORMALIZE] Conversación ${i + 1} normalizada exitosamente:`, normalized.id)
          processedConversations.push(normalized)
        } else {
          console.warn(`⚠️ [NORMALIZE] Conversación ${i + 1} descartada por falta de ID`)
        }
      }

      // ✅ RESULTADO FINAL
      console.log('📊 [FINAL] Resultado del procesamiento:', {
        backend_conversations: conversations.length,
        processed_conversations: processedConversations.length,
        success_rate: `${Math.round((processedConversations.length / conversations.length) * 100) || 0}%`,
        conversations_to_render: processedConversations
      })

      if (processedConversations.length === 0) {
        console.warn('⚠️ [INFO] No hay conversaciones en el backend - array vacío legítimo')
      } else {
        console.log('✅ [SUCCESS] Conversaciones listas para renderizar:', processedConversations.length)
      }

      return processedConversations

    } catch (error) {
      console.error('❌ [ERROR] Error en getConversations:', error)
      console.error('❌ [ERROR] Tipo de error:', typeof error)
      console.error('❌ [ERROR] Stack trace:', error instanceof Error ? error.stack : 'No disponible')
      
      // En caso de error, retornar array vacío pero con conversación de emergencia
      if (process.env.NODE_ENV === 'development') {
        console.log('🚨 [EMERGENCY] Creando conversación de emergencia para desarrollo...')
        
        // ✅ MODO DE EMERGENCIA: Crear conversación de prueba para mostrar algo
        const emergencyConversation = {
          id: 'emergency-' + Date.now(),
          title: 'Conversación de Emergencia',
          status: 'open' as const,
          priority: 'medium' as const,
          contact: {
            id: 'emergency-contact',
            name: 'Error en Backend',
            phone: 'N/A',
            avatar: undefined,
            email: undefined,
            isOnline: false,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isBlocked: false,
            preferences: { language: 'es', timezone: 'UTC', notifications: true }
          },
          channel: 'web' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessageAt: new Date(),
          lastMessage: {
            id: 'emergency-msg',
            content: 'Error al cargar conversaciones del backend',
            timestamp: new Date(),
            senderName: 'Sistema',
            type: 'text' as const,
            direction: 'incoming' as const,
            status: 'delivered' as const,
            conversationId: 'emergency-' + Date.now()
          },
          tags: ['error', 'sistema'],
          unreadCount: 1,
          messageCount: 1,
          isMuted: false,
          isArchived: false
        }

        console.log('🚨 [EMERGENCY] Conversación de emergencia creada:', emergencyConversation)
        return [emergencyConversation]
      }

      return []
    }
  }
}

// ✅ Exportar instancia singleton
export const conversationService = new ConversationService() 