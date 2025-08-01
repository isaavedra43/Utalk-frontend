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
      // ✅ LOGGING CRÍTICO: Verificar token antes de hacer request
      const currentToken = apiClient.getAuthToken()
      console.log('🔍 [CONVERSATIONS] Token verification before request:', {
        hasToken: !!currentToken,
        tokenLength: currentToken?.length || 0,
        tokenPreview: currentToken ? `${currentToken.substring(0, 20)}...` : 'none',
        endpoint: API_ENDPOINTS.CONVERSATIONS.LIST
      })

      console.log('🌐 [CONVERSATIONS] Making API request to:', API_ENDPOINTS.CONVERSATIONS.LIST)
      const response = await apiClient.get(API_ENDPOINTS.CONVERSATIONS.LIST)

      // ✅ LOG EXPLÍCITO DE AUDITORÍA - RESPUESTA CRUDA
      console.log("📥 [CONVERSATIONS] Raw response received:")
      console.log("📥 [CONVERSATIONS] Response type:", typeof response)
      console.log("📥 [CONVERSATIONS] Response is array:", Array.isArray(response))
      console.log("📥 [CONVERSATIONS] Response:", response)
      
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        console.log("📥 [CONVERSATIONS] Response keys:", Object.keys(response))
        console.log("📥 [CONVERSATIONS] Response.data type:", typeof response.data)
        console.log("📥 [CONVERSATIONS] Response.data is array:", Array.isArray(response.data))
        if (response.data) {
          console.log("📥 [CONVERSATIONS] Response.data:", response.data)
        }
      }

      // ✅ El backend entrega SIEMPRE el array de conversaciones directamente en response
      // Nunca usar response.data.data ni response.data.conversations
      if (!response) {
        console.log('❌ [CONVERSATIONS] Empty response, returning empty array')
        return []
      }

      let conversations: any = []

      // ✅ ESTRATEGIA ROBUSTA: Probar múltiples estructuras posibles
      if (Array.isArray(response)) {
        conversations = response
        console.log('✅ [CONVERSATIONS] Response is array directly, length:', response.length)
      } else if (response && typeof response === 'object') {
        // Buscar array en las propiedades más comunes
        if (Array.isArray(response.data)) {
          conversations = response.data
          console.log('✅ [CONVERSATIONS] Found array in response.data, length:', response.data.length)
        } else if (Array.isArray(response.conversations)) {
          conversations = response.conversations
          console.log('✅ [CONVERSATIONS] Found array in response.conversations, length:', response.conversations.length)
        } else if (Array.isArray(response.results)) {
          conversations = response.results
          console.log('✅ [CONVERSATIONS] Found array in response.results, length:', response.results.length)
        } else if (Array.isArray(response.items)) {
          conversations = response.items
          console.log('✅ [CONVERSATIONS] Found array in response.items, length:', response.items.length)
        } else {
          console.log('⚠️ [CONVERSATIONS] No array found in response object')
          console.log('⚠️ [CONVERSATIONS] Available properties:', Object.keys(response))
          
          // ✅ ÚLTIMA ESTRATEGIA: Si la respuesta parece ser de mensajes en lugar de conversaciones
          if (response.messages || (response.data && response.data.messages)) {
            console.log('🔄 [CONVERSATIONS] Response seems to be messages, trying to extract conversations from messages')
            const messages = response.messages || response.data.messages
            if (Array.isArray(messages)) {
              console.log('🔄 [CONVERSATIONS] Converting messages to conversations...')
              // Agrupar mensajes por conversationId para crear conversaciones
              const conversationMap = new Map()
              messages.forEach((msg: any) => {
                if (msg.conversationId) {
                  if (!conversationMap.has(msg.conversationId)) {
                    conversationMap.set(msg.conversationId, {
                      id: msg.conversationId,
                      title: msg.sender?.name || msg.senderIdentifier || 'Conversación',
                      contact: {
                        id: msg.senderIdentifier || msg.sender?.identifier,
                        name: msg.sender?.name || msg.senderIdentifier,
                        phone: msg.senderIdentifier,
                        avatar: null,
                        isOnline: false
                      },
                      lastMessage: {
                        id: msg.id,
                        content: msg.content,
                        timestamp: msg.timestamp || msg.createdAt,
                        senderName: msg.sender?.name || 'Usuario'
                      },
                      status: 'open',
                      channel: 'whatsapp',
                      unreadCount: 0,
                      messageCount: 1,
                      createdAt: msg.timestamp || msg.createdAt,
                      updatedAt: msg.timestamp || msg.createdAt
                    })
                  }
                }
              })
              conversations = Array.from(conversationMap.values())
              console.log('✅ [CONVERSATIONS] Created conversations from messages, count:', conversations.length)
            }
          } else {
            conversations = []
          }
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

      if (conversations.length === 0) {
        console.log('⚠️ [CONVERSATIONS] No conversations found in response')
        return []
      }

      console.log('🔧 [NORMALIZE] Iniciando normalización de conversaciones...')
      console.log('🔧 [NORMALIZE] Conversaciones originales del backend:', conversations)

      // ✅ PROCESAMIENTO SIMPLE: Solo normalizar y validar ID
      const processedConversations = []
      
      for (let i = 0; i < conversations.length; i++) {
        const originalConv = conversations[i]
        console.log(`🔧 [NORMALIZE] Procesando conversación ${i + 1}/${conversations.length}:`, originalConv)
        
        try {
          // ✅ NORMALIZAR (solo falla si no hay ID)
          const normalized = normalizeConversation(originalConv)
          
          if (normalized) {
            console.log(`✅ [NORMALIZE] Conversación ${i + 1} normalizada exitosamente:`, normalized.id)
            processedConversations.push(normalized)
          } else {
            console.warn(`⚠️ [NORMALIZE] Conversación ${i + 1} descartada por falta de ID`)
          }
        } catch (error) {
          console.error(`❌ [NORMALIZE] Error procesando conversación ${i + 1}:`, error)
          console.error(`❌ [NORMALIZE] Conversación problemática:`, originalConv)
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
      
      // ✅ LOGGING ADICIONAL PARA DEBUG DE AUTENTICACIÓN
      const currentToken = apiClient.getAuthToken()
      console.error('❌ [ERROR] Auth token status during error:', {
        hasToken: !!currentToken,
        tokenLength: currentToken?.length || 0,
        tokenPreview: currentToken ? `${currentToken.substring(0, 20)}...` : 'none'
      })
      
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
            name: 'Cliente de Emergencia',
            phone: '+1234567890',
            avatar: undefined,
            email: 'emergency@example.com',
            isOnline: false,
            lastSeen: undefined,
            company: 'Empresa de Emergencia',
            department: 'Soporte',
            tags: ['emergency', 'test'],
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
          channel: 'whatsapp' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessageAt: new Date(),
          lastMessage: {
            id: 'emergency-message',
            content: 'Este es un mensaje de emergencia para testing',
            timestamp: new Date(),
            senderName: 'Cliente de Emergencia',
            type: 'text' as const
          },
          participants: ['emergency-contact'],
          tags: ['emergency'],
          messageCount: 1,
          unreadCount: 0,
          metadata: {
            source: 'emergency',
            reason: 'API error during development'
          }
        }

        return [emergencyConversation]
      }

      return []
    }
  }
}

// ✅ Exportar instancia singleton
export const conversationService = new ConversationService() 