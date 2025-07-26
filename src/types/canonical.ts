// 📋 ESTRUCTURA CANÓNICA DE DATOS - UTalk Frontend
// Esta es la fuente de verdad para TODOS los módulos del sistema

/**
 * 🔍 RESULTADO DE VALIDACIÓN
 */
export interface ValidationResult {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    value?: any
  }>
  warnings?: Array<{
    field: string
    message: string
    value?: any
  }>
}

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
    id: string                 // ID único del remitente (EMAIL)
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
    userEmail?: string         // EMAIL del usuario que envió
    edited?: boolean           // Si fue editado
    reactions?: Array<{        // Reacciones al mensaje
      emoji: string
      userEmail: string        // ✅ EMAIL en lugar de userId
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
    id: string                 // EMAIL del agente asignado
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
  
  // ✅ CONTACTO OPCIONAL
  email?: string               // Email (opcional)
  avatar?: string              // URL del avatar
  
  // ✅ ESTADO TEMPORAL
  isOnline: boolean            // Estado en línea
  lastSeen?: Date              // ✅ Última vez visto (OPCIONAL)
  
  // ✅ ORGANIZACIÓN Y METADATOS
  company?: string             // Empresa
  department?: string          // Departamento
  tags: string[]               // Etiquetas del contacto
  
  // ✅ TIMESTAMPS
  createdAt: Date
  updatedAt: Date
  
  // ✅ CAMPOS PERSONALIZADOS
  customFields?: Record<string, any>
  
  // ✅ CONFIGURACIÓN
  isBlocked: boolean           // Si está bloqueado
  preferences: {
    language: string           // Idioma preferido
    timezone: string           // Zona horaria
    notifications: boolean     // Recibe notificaciones
  }
}

/**
 * 🎯 USUARIO CANÓNICO EMAIL-FIRST
 * Estructura estricta para usuarios del sistema
 */
export interface CanonicalUser {
  // ✅ IDENTIFICACIÓN EMAIL-FIRST
  email: string                // EMAIL como identificador único
  name: string                 // Nombre completo
  
  // ✅ AUTENTICACIÓN Y AUTORIZACIÓN
  isActive: boolean            // Usuario activo
  role: string                 // Rol del usuario
  permissions: string[]        // Permisos específicos
  department: string           // Departamento
  
  // ✅ INFORMACIÓN OPCIONAL
  avatar?: string              // URL del avatar
  phone?: string               // Teléfono
  
  // ✅ TIMESTAMPS
  createdAt?: Date
  updatedAt?: Date
  lastLoginAt?: Date
  
  // ✅ CONFIGURACIÓN
  preferences?: {
    language: string
    timezone: string
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
  }
}

/**
 * 🔄 FILTROS PARA BÚSQUEDAS
 */
export interface CanonicalFilters {
  // ✅ EMAIL-FIRST: Filtros por email
  senderEmail?: string         // Email del remitente
  recipientEmail?: string      // Email del destinatario
  assignedToEmail?: string     // Email del agente asignado
  
  // ✅ FILTROS TEMPORALES
  dateFrom?: Date
  dateTo?: Date
  
  // ✅ FILTROS DE ESTADO
  status?: string[]
  priority?: string[]
  channel?: string[]
  tags?: string[]
  
  // ✅ BÚSQUEDA
  search?: string
  
  // ✅ PAGINACIÓN
  page?: number
  limit?: number
  
  // ✅ ORDENAMIENTO
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 📊 RESPUESTAS DE API TIPADAS
 */
export interface CanonicalResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  meta?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

/**
 * 🔍 PAGINACIÓN ESTÁNDAR
 */
export interface CanonicalPagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * ⚡ EVENTOS EN TIEMPO REAL EMAIL-FIRST
 */
export interface CanonicalSocketEvent {
  type: string
  conversationId?: string
  userEmail: string            // ✅ EMAIL como identificador
  data: any
  timestamp: Date
} 