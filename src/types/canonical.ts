// Tipos canónicos para el sistema de chat UTalk
// ✅ ESTRUCTURA CANÓNICA PARA MENSAJES, CONVERSACIONES, CONTACTOS Y USUARIOS
// Estos tipos definen la estructura de datos que usa toda la aplicación

/**
 * 🎯 MENSAJE CANÓNICO
 * Estructura estricta que debe cumplir todo mensaje en el sistema
 */
export interface CanonicalMessage {
  // ✅ CAMPOS OBLIGATORIOS
  id: string                    // ID único del mensaje
  conversationId: string        // ID de la conversación
  content: string              // Contenido del mensaje
  timestamp: Date | string    // Timestamp SIEMPRE Date, nunca string
  
  // ✅ REMITENTE OBLIGATORIO
  sender: CanonicalUser
  recipient: CanonicalUser
  
  // ✅ TIPO Y ESTADO OBLIGATORIOS
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker' | 'media' // ✅ AGREGADO 'media'
  status: 'sent' | 'pending' | 'delivered' | 'read' | 'failed'
  direction: 'inbound' | 'outbound'
  
  // ✅ CAMPOS BOOLEANOS CON DEFAULTS
  isRead: boolean              // Estado de lectura
  isDelivered: boolean         // Estado de entrega
  isImportant: boolean         // Marcado como importante
  
  // ✅ MEDIA URL (OPCIONAL PERO REQUERIDO PARA COMPATIBILIDAD)
  mediaUrl?: string | null     // URL del archivo multimedia
  
  // ✅ ADJUNTOS (OPCIONAL PERO ESTRUCTURADO)
  attachments?: CanonicalFileAttachment[]
  
  // ✅ METADATOS (OPCIONAL)
  metadata?: {
    twilioSid?: string         // ID de Twilio (si aplica)
    userEmail?: string         // EMAIL del usuario que envió
    edited?: boolean           // Si fue editado
    error?: string             // Error message if failed
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
  
  // ✅ CANAL Y TIMESTAMPS
  channel: 'whatsapp' | 'email' | 'web' | 'sms' | 'phone' | 'telegram'
  createdAt: Date
  updatedAt: Date
  
  // ✅ AGENTE ASIGNADO (OPCIONAL)
  assignedTo?: {
    email: string              // ✅ EMAIL como identificador
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
  
  // ✅ CONTADORES Y METADATOS
  messageCount: number         // Total de mensajes
  unreadCount: number          // Mensajes sin leer
  tags: string[]               // Array de etiquetas
  
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
  email: string // ✅ CAMBIADO: usar email como identificador principal
  name: string
  type: 'agent' | 'system' | 'contact' | 'bot' | 'customer'
  avatar?: string
}

/**
 * 🎯 VALIDADORES DE TIPOS
 * Funciones para validar que los objetos cumplen con la estructura canónica
 */

// ✅ Validador de mensaje básico (solo campos obligatorios)
export function isValidMessageBasic(obj: any): obj is CanonicalMessage {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.conversationId === 'string' &&
    typeof obj.content === 'string' &&
    obj.timestamp instanceof Date &&
    obj.sender &&
    typeof obj.sender.id === 'string' &&
    typeof obj.sender.name === 'string' &&
    ['contact', 'agent', 'bot', 'system', 'customer'].includes(obj.sender.type) &&
    ['text', 'image', 'video', 'audio', 'file', 'location', 'sticker'].includes(obj.type) &&
    ['pending', 'sent', 'delivered', 'read', 'failed'].includes(obj.status) &&
    ['inbound', 'outbound'].includes(obj.direction) &&
    typeof obj.isRead === 'boolean' &&
    typeof obj.isDelivered === 'boolean' &&
    typeof obj.isImportant === 'boolean'
  )
}

// ✅ Validador de conversación básico
export function isValidConversationBasic(obj: any): obj is CanonicalConversation {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    ['open', 'pending', 'closed', 'archived'].includes(obj.status) &&
    ['low', 'medium', 'high', 'urgent'].includes(obj.priority) &&
    obj.contact &&
    typeof obj.contact.id === 'string' &&
    ['whatsapp', 'email', 'web', 'sms', 'phone', 'telegram'].includes(obj.channel) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    typeof obj.messageCount === 'number' &&
    typeof obj.unreadCount === 'number' &&
    Array.isArray(obj.tags)
  )
}

// ✅ Validador de contacto básico
export function isValidContactBasic(obj: any): obj is CanonicalContact {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.phone === 'string' &&
    typeof obj.isOnline === 'boolean' &&
    Array.isArray(obj.tags) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    typeof obj.isBlocked === 'boolean' &&
    obj.preferences &&
    typeof obj.preferences.language === 'string' &&
    typeof obj.preferences.timezone === 'string' &&
    typeof obj.preferences.notifications === 'boolean'
  )
}

// ✅ Validador de usuario básico
export function isValidUserBasic(obj: any): obj is CanonicalUser {
  return (
    obj &&
    typeof obj.email === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.isActive === 'boolean' &&
    typeof obj.role === 'string' &&
    Array.isArray(obj.permissions) &&
    typeof obj.department === 'string' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    obj.preferences &&
    typeof obj.preferences.language === 'string' &&
    typeof obj.preferences.timezone === 'string' &&
    ['light', 'dark', 'system'].includes(obj.preferences.theme)
  )
}

// ✅ Resultado de validación
export interface ValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

// ✅ TIPO PARA ARCHIVOS MULTIMEDIA
export interface CanonicalFileAttachment {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  category: 'image' | 'video' | 'audio' | 'document'
  metadata?: {
    duration?: string
    durationSeconds?: number
    bitrate?: number
    format?: string
    transcription?: string
    width?: number
    height?: number
    processed?: boolean
  }
  expiresAt?: Date | string
}
