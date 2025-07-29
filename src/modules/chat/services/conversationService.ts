// Servicio para el manejo de conversaciones
// ✅ REFACTORIZADO: Solo obtiene TODAS las conversaciones del backend
import { apiClient } from '@/services/apiClient'
import { API_ENDPOINTS } from '@/lib/constants'
import type { CanonicalConversation } from '@/types/canonical'

/**
 * ✅ NORMALIZACIÓN ROBUSTA: Convierte cualquier objeto del backend en conversación válida
 */
function normalizeConversation(conv: any): any {
  if (!conv || !conv.id) {
    console.warn('[NORMALIZE] Conversación sin ID válido:', conv)
    return null
  }

  // ✅ NORMALIZAR FECHAS: String/Timestamp → Date
  const normalizeDate = (dateValue: any): Date => {
    if (!dateValue) return new Date()
    if (dateValue instanceof Date) return dateValue
    
    // Manejar timestamps de Firebase { _seconds, _nanoseconds }
    if (dateValue._seconds) {
      return new Date(dateValue._seconds * 1000)
    }
    
    // Manejar strings ISO
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue)
      return isNaN(parsed.getTime()) ? new Date() : parsed
    }
    
    // Manejar números (unix timestamp)
    if (typeof dateValue === 'number') {
      return new Date(dateValue)
    }
    
    return new Date()
  }

  // ✅ NORMALIZAR CONTACTO
  const normalizeContact = (contactData: any) => {
    if (!contactData) {
      return {
        id: conv.customerPhone || conv.participants?.[0] || 'unknown',
        name: conv.customerPhone || conv.participants?.[0] || 'Cliente Sin Nombre',
        phone: conv.customerPhone || conv.participants?.[0] || 'N/A',
        avatar: null,
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
      }
    }

    return {
      id: contactData.id || conv.customerPhone || conv.participants?.[0] || 'unknown',
      name: contactData.name || contactData.phone || conv.customerPhone || conv.participants?.[0] || 'Cliente Sin Nombre',
      phone: contactData.phone || conv.customerPhone || conv.participants?.[0] || 'N/A',
      avatar: contactData.avatarUrl || contactData.avatar,
      email: contactData.email,
      isOnline: contactData.isOnline || false,
      lastSeen: contactData.lastSeen ? normalizeDate(contactData.lastSeen) : undefined,
      company: contactData.company,
      department: contactData.department,
      tags: contactData.tags || [],
      createdAt: contactData.createdAt ? normalizeDate(contactData.createdAt) : new Date(),
      updatedAt: contactData.updatedAt ? normalizeDate(contactData.updatedAt) : new Date(),
      customFields: contactData.customFields,
      isBlocked: contactData.isBlocked || false,
      preferences: contactData.preferences || {
        language: 'es',
        timezone: 'UTC',
        notifications: true
      }
    }
  }

  // ✅ NORMALIZAR ÚLTIMO MENSAJE
  const normalizeLastMessage = (messageData: any) => {
    if (!messageData) {
      return {
        id: 'placeholder',
        content: 'Sin mensajes',
        timestamp: new Date(),
        senderName: 'Sistema',
        type: 'text' as const
      }
    }

    return {
      id: messageData.id || 'unknown',
      content: messageData.content || messageData.text || 'Mensaje sin contenido',
      timestamp: normalizeDate(messageData.timestamp || messageData.createdAt),
      senderName: messageData.senderName || messageData.sender?.name || 'Usuario',
      type: (messageData.type || 'text') as any
    }
  }

  // ✅ NORMALIZAR CONTADORES
  const normalizeCount = (countValue: any): number => {
    if (typeof countValue === 'number') return Math.max(0, countValue)
    if (countValue?.operand && typeof countValue.operand === 'number') return Math.max(0, countValue.operand)
    if (typeof countValue === 'string') {
      const parsed = parseInt(countValue, 10)
      return isNaN(parsed) ? 0 : Math.max(0, parsed)
    }
    return 0
  }

  // ✅ CONVERSACIÓN NORMALIZADA COMPLETA
  const normalized = {
    // Campos obligatorios básicos
    id: conv.id,
    title: conv.title || `Conversación con ${conv.contact?.name || conv.customerPhone || 'Cliente'}`,
    status: ['open', 'pending', 'closed', 'archived'].includes(conv.status) ? conv.status : 'open',
    priority: ['low', 'medium', 'high', 'urgent'].includes(conv.priority) ? conv.priority : 'medium',
    
    // Contacto normalizado
    contact: normalizeContact(conv.contact),
    
    // Canal con fallback inteligente
    channel: conv.channel || conv.contact?.channel || 'whatsapp',
    
    // Fechas normalizadas
    createdAt: normalizeDate(conv.createdAt),
    updatedAt: normalizeDate(conv.updatedAt || conv.lastMessageAt),
    lastMessageAt: normalizeDate(conv.lastMessageAt || conv.lastMessage?.timestamp),
    
    // Contadores normalizados
    messageCount: normalizeCount(conv.messageCount),
    unreadCount: normalizeCount(conv.unreadCount),
    
    // Asignación opcional
    assignedTo: conv.assignedTo || undefined,
    
    // Último mensaje normalizado
    lastMessage: normalizeLastMessage(conv.lastMessage),
    
    // Metadatos con defaults seguros
    tags: Array.isArray(conv.tags) ? conv.tags : [],
    isMuted: conv.isMuted || false,
    isArchived: conv.isArchived || false,
    
    // Preservar campos adicionales del backend
    participants: conv.participants || [],
    customerPhone: conv.customerPhone,
    lastMessageId: conv.lastMessageId,
    
    // Metadatos adicionales
    metadata: {
      source: 'backend',
      normalized: true,
      originalStatus: conv.status,
      originalChannel: conv.channel,
      ...(conv.metadata || {})
    }
  }

  console.log('[NORMALIZE] Conversación normalizada:', {
    id: normalized.id,
    originalStatus: conv.status,
    normalizedStatus: normalized.status,
    hasContact: !!normalized.contact,
    contactName: normalized.contact.name,
    hasLastMessage: !!normalized.lastMessage,
    messageCount: normalized.messageCount,
    unreadCount: normalized.unreadCount
  })

  return normalized
}

/**
 * ✅ VALIDADOR MÍNIMO: Solo verifica ID después de normalización
 */
function isValidConversation(conv: any): boolean {
  const hasId = conv && typeof conv === 'object' && conv.id
  
  if (!hasId) {
    console.warn('[VALIDATION] Conversación sin ID después de normalización:', conv)
    return false
  }
  
  return true
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

      // ✅ NORMALIZACIÓN: Convertir TODAS las conversaciones a formato válido
      const normalizedConversations = conversations
        .map((conv, index) => {
          console.log(`🔧 [NORMALIZE] Procesando conversación ${index + 1}/${conversations.length}:`, {
            id: conv?.id,
            hasContact: !!conv?.contact,
            status: conv?.status,
            channel: conv?.channel
          })
          
          return normalizeConversation(conv)
        })
        .filter(conv => conv !== null) // Remover conversaciones que no pudieron normalizarse

      console.log('🔧 [NORMALIZE] Conversaciones después de normalización:', normalizedConversations.length)
      
      // ✅ VALIDACIÓN MÍNIMA: Solo verificar ID
      const validConversations = normalizedConversations.filter((conv, index) => {
        const isValid = isValidConversation(conv)
        if (!isValid) {
          console.warn(`⚠️ [VALIDATION] Conversación ${index + 1} inválida después de normalización:`, conv)
        }
        return isValid
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ [DEBUG] Total conversations received: ${conversations.length}`)
        console.log(`🔧 [DEBUG] Conversations after normalization: ${normalizedConversations.length}`)
        console.log(`✅ [DEBUG] Valid conversations after filtering: ${validConversations.length}`)
        
        if (validConversations.length !== conversations.length) {
          console.warn('⚠️ [WARNING] Some conversations were filtered out:', {
            original: conversations.length,
            normalized: normalizedConversations.length,
            valid: validConversations.length,
            lost: conversations.length - validConversations.length
          })
        }
      }

      // ✅ LOG FINAL PARA DEBUGGING
      console.log('📊 [FINAL] Resumen de procesamiento:', {
        backend_response: conversations.length,
        after_normalization: normalizedConversations.length,
        after_validation: validConversations.length,
        conversations_to_render: validConversations
      })

      // Si no hay conversaciones válidas después de normalización
      if (validConversations.length === 0 && conversations.length > 0) {
        console.error('🚨 [CRITICAL] Se recibieron conversaciones del backend pero NINGUNA pudo ser procesada')
        console.error('🚨 [CRITICAL] Datos originales:', conversations)
        console.error('🚨 [CRITICAL] Esto indica un problema grave en la normalización o estructura del backend')
        
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
          channel: 'api' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastMessageAt: new Date(),
          messageCount: 1,
          unreadCount: 1,
          lastMessage: {
            id: 'emergency-msg',
            content: `Error: ${conversations.length} conversaciones del backend no pudieron procesarse`,
            timestamp: new Date(),
            senderName: 'Sistema',
            type: 'text' as const
          },
          tags: [],
          isMuted: false,
          isArchived: false,
          participants: [],
          metadata: { source: 'emergency', error: true }
        }
        
        console.log('🆘 [EMERGENCY] Creando conversación de emergencia para mostrar el error:', emergencyConversation)
        return [emergencyConversation]
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