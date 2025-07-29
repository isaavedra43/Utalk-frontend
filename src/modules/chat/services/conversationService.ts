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
          console.error(`❌ [NORMALIZE] Conversación ${i + 1} descartada (sin ID):`, originalConv)
        }
      }

      console.log('📊 [FINAL] Resultado del procesamiento:', {
        backend_conversations: conversations.length,
        processed_conversations: processedConversations.length,
        success_rate: `${((processedConversations.length / conversations.length) * 100).toFixed(1)}%`,
        conversations_to_render: processedConversations
      })

      // ✅ GARANTÍA: Si el backend envió conversaciones pero todas se perdieron, 
      // crear conversación de emergencia
      if (conversations.length > 0 && processedConversations.length === 0) {
        console.error('🚨 [CRITICAL] ¡TODAS las conversaciones se perdieron en el procesamiento!')
        console.error('🚨 [CRITICAL] Datos originales del backend:', conversations)
        
        // ✅ CREAR CONVERSACIÓN DE EMERGENCIA para mostrar el problema
        const emergencyConversation = {
          id: 'emergency-' + Date.now(),
          title: `ERROR: ${conversations.length} conversaciones perdidas`,
          status: 'open' as const,
          priority: 'urgent' as const,
          contact: {
            id: 'emergency-contact',
            name: 'ERROR DE PROCESAMIENTO',
            phone: 'Ver logs del navegador',
            avatar: undefined,
            email: undefined,
            isOnline: false,
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isBlocked: false,
            preferences: { language: 'es', timezone: 'UTC', notifications: true }
          },
          channel: 'api' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessageAt: new Date(),
          messageCount: 1,
          unreadCount: 1,
          lastMessage: {
            id: 'emergency-msg',
            content: `Error de procesamiento: ${conversations.length} conversaciones del backend no pudieron ser normalizadas. Revisar logs de consola.`,
            timestamp: new Date(),
            senderName: 'Sistema de Debug',
            type: 'text' as const
          },
          tags: ['error', 'debug'],
          isMuted: false,
          isArchived: false,
          participants: [],
          metadata: { 
            source: 'emergency', 
            error: true,
            originalCount: conversations.length
          }
        }
        
        console.log('🆘 [EMERGENCY] Creando conversación de emergencia:', emergencyConversation)
        return [emergencyConversation]
      }

      // ✅ ASEGURAR QUE NUNCA RETORNEMOS ARRAY VACÍO SI HABÍA DATOS
      if (processedConversations.length === 0 && conversations.length === 0) {
        console.log('ℹ️ [INFO] No hay conversaciones en el backend - array vacío legítimo')
      }

      console.log('✅ [SUCCESS] Conversaciones listas para renderizar:', processedConversations.length)
      return processedConversations

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