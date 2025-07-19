// 📋 ESTRUCTURA CANÓNICA DE DATOS - UTalk Frontend
// Esta es la fuente de verdad para TODOS los módulos del sistema

/**
 * 🎯 MENSAJE CANÓNICO
 * Estructura estricta que DEBE cumplir todo mensaje en UTalk
 */
export interface CanonicalMessage {
  // ✅ CAMPOS OBLIGATORIOS
  id: string                    // ID único del mensaje
  conversationId: string        // ID de la conversación
  content: string              // Contenido del mensaje
  timestamp: Date              // Timestamp SIEMPRE Date, nunca string
  
  // ✅ REMITENTE OBLIGATORIO
  sender: {
    id: string                 // ID único del remitente
    name: string               // Nombre completo
    type: 'contact' | 'agent' | 'bot' | 'system'  // Tipo estricto
    avatar?: string            // URL del avatar (opcional)
  }
  
  // ✅ TIPO Y ESTADO OBLIGATORIOS
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker'
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  direction: 'inbound' | 'outbound'
  
  // ✅ CAMPOS BOOLEANOS CON DEFAULTS
  isRead: boolean              // Estado de lectura
  isDelivered: boolean         // Estado de entrega
  isImportant: boolean         // Marcado como importante
  
  // ✅ ADJUNTOS (OPCIONAL PERO ESTRUCTURADO)
  attachments?: Array<{
    id: string                 // ID único del adjunto
    name: string               // Nombre del archivo
    url: string                // URL del archivo
    type: string               // MIME type
    size: number               // Tamaño en bytes
  }>
  
  // ✅ METADATOS (OPCIONAL)
  metadata?: {
    twilioSid?: string         // ID de Twilio (si aplica)
    userId?: string            // ID del usuario que envió
    edited?: boolean           // Si fue editado
    reactions?: Array<{        // Reacciones al mensaje
      emoji: string
      userId: string
      timestamp: Date
    }>
  }
}

/**
 * 🎯 CONVERSACIÓN CANÓNICA
 * Estructura estricta para conversaciones
 */
export interface CanonicalConversation {
  // ✅ CAMPOS OBLIGATORIOS
  id: string                   // ID único de conversación
  title: string                // Título de la conversación
  status: 'open' | 'pending' | 'closed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // ✅ CONTACTO OBLIGATORIO
  contact: CanonicalContact    // Contacto principal
  
  // ✅ CANAL OBLIGATORIO
  channel: 'whatsapp' | 'telegram' | 'email' | 'webchat' | 'api'
  
  // ✅ TIMESTAMPS OBLIGATORIOS
  createdAt: Date
  updatedAt: Date
  lastMessageAt: Date
  
  // ✅ CONTADORES OBLIGATORIOS
  messageCount: number         // Total de mensajes
  unreadCount: number          // Mensajes sin leer
  
  // ✅ ASIGNACIÓN (OPCIONAL)
  assignedTo?: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  
  // ✅ ÚLTIMO MENSAJE (OPCIONAL)
  lastMessage?: {
    id: string
    content: string
    timestamp: Date
    senderName: string
    type: CanonicalMessage['type']
  }
  
  // ✅ ETIQUETAS Y METADATOS
  tags: string[]               // Array de etiquetas
  isMuted: boolean            // Si está silenciado
  isArchived: boolean         // Si está archivado
  
  // ✅ METADATOS
  metadata?: {
    source?: string            // Origen de la conversación
    customFields?: Record<string, any>
    satisfaction?: number      // Rating de satisfacción
  }
}

/**
 * 🎯 CONTACTO CANÓNICO
 * Estructura estricta para contactos
 */
export interface CanonicalContact {
  // ✅ CAMPOS OBLIGATORIOS
  id: string                   // ID único del contacto
  name: string                 // Nombre completo
  phone: string                // Teléfono (formato internacional)
  
  // ✅ INFORMACIÓN PERSONAL
  email?: string               // Email (opcional pero común)
  avatar?: string              // URL del avatar
  
  // ✅ INFORMACIÓN COMERCIAL
  company?: string             // Empresa
  position?: string            // Cargo
  
  // ✅ ESTADO Y CLASIFICACIÓN
  status: 'active' | 'inactive' | 'blocked' | 'prospect' | 'customer' | 'lead'
  source: 'manual' | 'import' | 'whatsapp' | 'webchat' | 'api'
  
  // ✅ INFORMACIÓN DE CHAT (REQUERIDA PARA UI)
  isOnline: boolean            // Estado de conexión en tiempo real
  channel: 'whatsapp' | 'telegram' | 'email' | 'webchat' | 'api' | 'facebook' | 'web' | 'instagram' // Canal de comunicación
  lastSeen?: Date              // Última vez que estuvo online
  
  // ✅ TIMESTAMPS
  createdAt: Date
  updatedAt: Date
  lastContactAt?: Date
  
  // ✅ ESTADÍSTICAS
  totalMessages: number        // Total de mensajes
  totalConversations: number   // Total de conversaciones
  averageResponseTime?: number // Tiempo promedio de respuesta (minutos)
  
  // ✅ DATOS COMERCIALES
  value: number                // Valor comercial (0 por default)
  currency: string             // Moneda (USD, MXN, etc)
  
  // ✅ ETIQUETAS Y CLASIFICACIÓN
  tags: string[]               // Etiquetas del contacto
  
  // ✅ CAMPOS PERSONALIZADOS (REQUERIDOS PARA UI)
  customFields?: Record<string, any> // Campos personalizados
  
  // ✅ METADATOS
  metadata?: {
    preferences?: {
      language?: string
      timezone?: string
      communicationChannel?: string
    }
    social?: {
      linkedin?: string
      twitter?: string
      facebook?: string
    }
  }
}

/**
 * 🎯 CAMPAÑA CANÓNICA
 * Estructura para campañas de marketing
 */
export interface CanonicalCampaign {
  // ✅ CAMPOS OBLIGATORIOS
  id: string
  name: string
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled'
  type: 'broadcast' | 'drip' | 'triggered' | 'automated'
  
  // ✅ CONTENIDO
  message: {
    content: string
    type: CanonicalMessage['type']
    attachments?: CanonicalMessage['attachments']
  }
  
  // ✅ AUDIENCIA
  audience: {
    targetCount: number        // Cantidad objetivo
    sentCount: number          // Cantidad enviada
    deliveredCount: number     // Cantidad entregada
    readCount: number          // Cantidad leída
    responseCount: number      // Cantidad que respondió
  }
  
  // ✅ PROGRAMACIÓN
  scheduledAt?: Date           // Cuando está programada
  startedAt?: Date            // Cuando inició
  completedAt?: Date          // Cuando terminó
  
  // ✅ TIMESTAMPS
  createdAt: Date
  updatedAt: Date
  
  // ✅ CREADOR
  createdBy: {
    id: string
    name: string
  }
  
  // ✅ METADATOS
  metadata?: {
    budget?: number
    cost?: number
    roi?: number
    notes?: string
  }
}

/**
 * 🎯 USUARIO CANÓNICO
 * Estructura para usuarios del sistema
 */
export interface CanonicalUser {
  // ✅ CAMPOS OBLIGATORIOS
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'agent' | 'viewer'
  status: 'active' | 'inactive' | 'suspended'
  
  // ✅ INFORMACIÓN PERSONAL
  avatar?: string
  phone?: string
  department?: string
  
  // ✅ CONFIGURACIÓN
  preferences: {
    language: string           // es, en, etc
    timezone: string           // America/Mexico_City
    theme: 'light' | 'dark' | 'auto'
    notifications: {
      email: boolean
      push: boolean
      desktop: boolean
    }
  }
  
  // ✅ PERMISOS
  permissions: string[]        // Array de permisos específicos
  
  // ✅ ESTADÍSTICAS
  stats: {
    totalConversations: number
    totalMessages: number
    averageResponseTime: number
    satisfactionRating: number
    lastActivity: Date
  }
  
  // ✅ TIMESTAMPS
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  
  // ✅ METADATOS
  metadata?: {
    onboardingCompleted: boolean
    trainingCompleted: boolean
    customFields?: Record<string, any>
  }
}

/**
 * 🎯 RESPUESTA DE API CANÓNICA
 * Estructura estándar para todas las respuestas de API
 */
export interface CanonicalAPIResponse<T> {
  // ✅ ESTADO OBLIGATORIO
  success: boolean
  
  // ✅ DATOS (si success = true)
  data?: T
  
  // ✅ ERROR (si success = false)
  error?: {
    code: string               // ERROR_CODE_STANDARD
    message: string            // Mensaje legible
    details?: any              // Detalles adicionales
    timestamp: Date            // Cuando ocurrió
  }
  
  // ✅ METADATOS DE RESPUESTA
  meta?: {
    total?: number             // Total de elementos (para paginación)
    page?: number              // Página actual
    limit?: number             // Límite por página
    hasMore?: boolean          // Si hay más páginas
    requestId?: string         // ID de la petición
    responseTime?: number      // Tiempo de respuesta en ms
  }
  
  // ✅ TIMESTAMP
  timestamp: Date              // Timestamp de la respuesta
}

/**
 * 🎯 FILTROS CANÓNICOS
 * Estructura estándar para filtros en todas las consultas
 */
export interface CanonicalFilters {
  // ✅ PAGINACIÓN
  page?: number
  limit?: number
  
  // ✅ ORDENAMIENTO
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  
  // ✅ BÚSQUEDA
  search?: string
  
  // ✅ FILTROS TEMPORALES
  dateFrom?: Date
  dateTo?: Date
  
  // ✅ FILTROS ESPECÍFICOS
  status?: string | string[]
  tags?: string | string[]
  assignedTo?: string | string[]
  
  // ✅ FILTROS AVANZADOS
  customFilters?: Record<string, any>
}

/**
 * 🎯 VALIDACIÓN DE ESTRUCTURA
 * Tipos para el sistema de validación
 */
export interface ValidationResult {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    value: any
  }>
  warnings: Array<{
    field: string
    message: string
    value: any
  }>
}

export interface ValidationRule {
  field: string
  required: boolean
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  validator?: (value: any) => boolean
  defaultValue?: any
  transform?: (value: any) => any
}

// ✅ EXPORTAR TIPOS LEGACY PARA MIGRACIÓN GRADUAL
export type Message = CanonicalMessage
export type Conversation = CanonicalConversation
export type Contact = CanonicalContact
export type Campaign = CanonicalCampaign
export type User = CanonicalUser
export type APIResponse<T> = CanonicalAPIResponse<T>
export type Filters = CanonicalFilters 