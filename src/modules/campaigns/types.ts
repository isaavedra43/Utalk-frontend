// 📋 TIPOS CANÓNICOS - Módulo de Campañas UTalk
// Estructura estricta que sigue el estándar del sistema de validación

import type { CanonicalContact } from '@/types/canonical'

/**
 * 🎯 CAMPAÑA CANÓNICA
 */
export interface Campaign {
  // ✅ CAMPOS OBLIGATORIOS
  id: string
  name: string
  status: CampaignStatus
  type: CampaignType
  
  // ✅ CONFIGURACIÓN DE ENVÍO
  channels: CampaignChannel[]
  message: CampaignMessage
  
  // ✅ AUDIENCIA
  contacts: SelectedContact[]
  totalRecipients: number
  
  // ✅ PROGRAMACIÓN
  scheduledAt?: Date
  sendImmediately: boolean
  timezone: string
  
  // ✅ CONFIGURACIÓN AVANZADA
  settings: CampaignSettings
  
  // ✅ ESTADÍSTICAS
  stats: CampaignStats
  
  // ✅ METADATOS
  tags: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
  
  // ✅ METADATOS ADICIONALES
  metadata?: {
    templateId?: string
    originalCampaignId?: string // Para campañas clonadas
    version?: number
    notes?: string
  }
}

/**
 * 🎯 TIPOS DE ESTADO DE CAMPAÑA
 */
export type CampaignStatus = 
  | 'draft'        // Borrador
  | 'scheduled'    // Programada
  | 'sending'      // Enviando
  | 'sent'         // Enviada
  | 'paused'       // Pausada
  | 'cancelled'    // Cancelada
  | 'failed'       // Fallida
  | 'completed'    // Completada

/**
 * 🎯 TIPOS DE CAMPAÑA
 */
export type CampaignType = 
  | 'whatsapp'     // Solo WhatsApp
  | 'sms'          // Solo SMS
  | 'mixed'        // WhatsApp + SMS

/**
 * 🎯 CANALES DE COMUNICACIÓN
 */
export type CampaignChannel = 
  | 'whatsapp'
  | 'sms'

/**
 * 🎯 MENSAJE DE CAMPAÑA
 */
export interface CampaignMessage {
  // ✅ CONTENIDO PRINCIPAL
  content: string
  subject?: string // Para email futuro
  
  // ✅ PERSONALIZACIÓN
  variables: CampaignVariable[]
  
  // ✅ ADJUNTOS (WhatsApp)
  attachments?: CampaignAttachment[]
  
  // ✅ BOTONES DE ACCIÓN (WhatsApp)
  callToActions?: CallToAction[]
  
  // ✅ CONFIGURACIÓN POR CANAL
  whatsapp?: {
    templateId?: string
    templateName?: string
    useTemplate: boolean
  }
  
  sms?: {
    maxLength: number
    estimatedParts: number
  }
}

/**
 * 🎯 VARIABLES DE PERSONALIZACIÓN
 */
export interface CampaignVariable {
  id: string
  name: string                    // {{nombre}}, {{empresa}}
  label: string                   // "Nombre del contacto"
  type: 'text' | 'number' | 'date' | 'custom'
  defaultValue?: string
  required: boolean
  description?: string
}

/**
 * 🎯 ADJUNTOS DE CAMPAÑA
 */
export interface CampaignAttachment {
  id: string
  name: string
  url: string
  type: 'image' | 'document' | 'video' | 'audio'
  size: number
  mimeType: string
}

/**
 * 🎯 BOTONES DE LLAMADA A ACCIÓN
 */
export interface CallToAction {
  id: string
  type: 'url' | 'phone' | 'quick_reply'
  text: string
  value: string                   // URL, número o texto de respuesta
  trackClicks: boolean
}

/**
 * 🎯 CONTACTO SELECCIONADO PARA CAMPAÑA
 */
export interface SelectedContact extends CanonicalContact {
  // ✅ ESTADO EN LA CAMPAÑA
  campaignStatus: ContactCampaignStatus
  
  // ✅ VARIABLES PERSONALIZADAS
  personalizedVariables?: Record<string, string>
  
  // ✅ CANALES PREFERENCIALES
  preferredChannel?: CampaignChannel
  
  // ✅ RESULTADOS DE ENVÍO
  sendResult?: ContactSendResult
}

/**
 * 🎯 ESTADO DEL CONTACTO EN CAMPAÑA
 */
export type ContactCampaignStatus =
  | 'pending'      // Pendiente de envío
  | 'sending'      // Enviando
  | 'sent'         // Enviado
  | 'delivered'    // Entregado
  | 'read'         // Leído
  | 'replied'      // Respondió
  | 'failed'       // Falló
  | 'bounced'      // Rebotó
  | 'unsubscribed' // Se dio de baja

/**
 * 🎯 RESULTADO DE ENVÍO POR CONTACTO
 */
export interface ContactSendResult {
  // ✅ INFORMACIÓN DEL ENVÍO
  twilioSid?: string
  channel: CampaignChannel
  sentAt: Date
  status: ContactCampaignStatus
  
  // ✅ INFORMACIÓN DE ENTREGA
  deliveredAt?: Date
  readAt?: Date
  repliedAt?: Date
  
  // ✅ ERRORES
  error?: {
    code: string
    message: string
    retryCount: number
  }
  
  // ✅ INTERACCIONES
  interactions?: ContactInteraction[]
}

/**
 * 🎯 INTERACCIONES DEL CONTACTO
 */
export interface ContactInteraction {
  id: string
  type: 'click' | 'reply' | 'call' | 'visit'
  timestamp: Date
  data?: Record<string, any>
}

/**
 * 🎯 CONFIGURACIÓN AVANZADA DE CAMPAÑA
 */
export interface CampaignSettings {
  // ✅ REINTENTOS
  retrySettings: {
    enabled: boolean
    maxRetries: number
    retryInterval: number       // minutos
    retryOnErrors: string[]     // códigos de error
  }
  
  // ✅ CONTROL DE VELOCIDAD
  rateLimit: {
    messagesPerMinute: number
    messagesPerHour: number
  }
  
  // ✅ CANALES ALTERNATIVOS
  fallbackChannels: {
    enabled: boolean
    whatsappToSms: boolean
    smsToWhatsapp: boolean
    fallbackDelay: number       // minutos
  }
  
  // ✅ CONFIGURACIÓN DE TRACKING
  tracking: {
    deliveryReceipts: boolean
    readReceipts: boolean
    clickTracking: boolean
    replyTracking: boolean
  }
  
  // ✅ CONFIGURACIÓN DE COMPLIANCE
  compliance: {
    respectOptOut: boolean
    respectBlacklist: boolean
    respectQuietHours: boolean
    quietHoursStart: string     // "22:00"
    quietHoursEnd: string       // "08:00"
  }
}

/**
 * 🎯 ESTADÍSTICAS DE CAMPAÑA
 */
export interface CampaignStats {
  // ✅ CONTADORES PRINCIPALES
  total: number
  pending: number
  sent: number
  delivered: number
  read: number
  replied: number
  failed: number
  
  // ✅ TASAS DE CONVERSIÓN
  deliveryRate: number        // %
  readRate: number           // %
  replyRate: number          // %
  failureRate: number        // %
  
  // ✅ ESTADÍSTICAS POR CANAL
  whatsappStats?: ChannelStats
  smsStats?: ChannelStats
  
  // ✅ MÉTRICAS DE TIEMPO
  averageDeliveryTime?: number  // minutos
  averageReadTime?: number      // minutos
  
  // ✅ COSTOS
  estimatedCost?: number
  actualCost?: number
  currency: string
  
  // ✅ PROGRESO EN TIEMPO REAL
  progress: {
    percentage: number
    startedAt?: Date
    estimatedCompletion?: Date
  }
}

/**
 * 🎯 ESTADÍSTICAS POR CANAL
 */
export interface ChannelStats {
  total: number
  sent: number
  delivered: number
  read: number
  replied: number
  failed: number
  cost: number
}

/**
 * 🎯 FILTROS DE CAMPAÑA
 */
export interface CampaignFilters {
  // ✅ FILTROS BÁSICOS
  status?: CampaignStatus[]
  type?: CampaignType[]
  channels?: CampaignChannel[]
  
  // ✅ FILTROS TEMPORALES
  dateFrom?: Date
  dateTo?: Date
  scheduledDateFrom?: Date
  scheduledDateTo?: Date
  
  // ✅ FILTROS DE USUARIO
  createdBy?: string[]
  tags?: string[]
  
  // ✅ FILTROS AVANZADOS
  minRecipients?: number
  maxRecipients?: number
  hasErrors?: boolean
  
  // ✅ BÚSQUEDA
  search?: string
  
  // ✅ ORDENAMIENTO
  sortBy?: 'name' | 'createdAt' | 'scheduledAt' | 'sentAt' | 'totalRecipients' | 'deliveryRate'
  sortOrder?: 'asc' | 'desc'
  
  // ✅ PAGINACIÓN
  page?: number
  limit?: number
}

/**
 * 🎯 PLANTILLA DE CAMPAÑA
 */
export interface CampaignTemplate {
  id: string
  name: string
  description?: string
  category: string
  
  // ✅ CONTENIDO
  message: Omit<CampaignMessage, 'variables'> & {
    availableVariables: CampaignVariable[]
  }
  
  // ✅ CONFIGURACIÓN PREDETERMINADA
  defaultSettings?: Partial<CampaignSettings>
  defaultType?: CampaignType
  
  // ✅ METADATOS
  isPublic: boolean
  createdBy: string
  createdAt: Date
  usageCount: number
  
  // ✅ PREVIEW
  previewData?: {
    sampleContact: Partial<SelectedContact>
    renderedMessage: string
  }
}

/**
 * 🎯 SEGMENTO DE CONTACTOS
 */
export interface ContactSegment {
  id: string
  name: string
  description?: string
  
  // ✅ CRITERIOS DE SEGMENTACIÓN
  criteria: SegmentCriteria[]
  
  // ✅ CONTACTOS
  contactIds: string[]
  contactCount: number
  
  // ✅ METADATOS
  createdBy: string
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
}

/**
 * 🎯 CRITERIOS DE SEGMENTACIÓN
 */
export interface SegmentCriteria {
  field: string                 // 'tags', 'status', 'source', etc.
  operator: 'equals' | 'contains' | 'startsWith' | 'in' | 'notIn' | 'greaterThan' | 'lessThan'
  value: any
  logic?: 'AND' | 'OR'          // para múltiples criterios
}

/**
 * 🎯 CONFIGURACIÓN DEL MÓDULO
 */
export interface CampaignModuleConfig {
  // ✅ LÍMITES
  maxRecipientsPerCampaign: number
  maxCampaignsPerUser: number
  maxAttachmentSize: number
  
  // ✅ CONFIGURACIÓN DE TWILIO
  twilioConfig: {
    whatsappNumbers: string[]
    smsNumbers: string[]
    webhookUrl: string
  }
  
  // ✅ CONFIGURACIÓN DE TEMPLATES
  allowCustomTemplates: boolean
  requireTemplateApproval: boolean
  
  // ✅ CONFIGURACIÓN DE PERMISOS
  permissions: {
    canCreateCampaigns: boolean
    canEditCampaigns: boolean
    canDeleteCampaigns: boolean
    canViewAnalytics: boolean
    canExportData: boolean
  }
}

/**
 * 🎯 RESPUESTAS DE API
 */
export interface CampaignsResponse {
  success: boolean
  campaigns: Campaign[]
  total: number
  page: number
  limit: number
  error?: string
}

export interface CampaignResponse {
  success: boolean
  campaign?: Campaign
  error?: string
}

export interface ContactsResponse {
  success: boolean
  contacts: SelectedContact[]
  total: number
  page: number
  limit: number
  error?: string
}

export interface TemplatesResponse {
  success: boolean
  templates: CampaignTemplate[]
  total: number
  error?: string
}

/**
 * 🎯 ACCIONES DE CAMPAÑA
 */
export type CampaignAction = 
  | 'create'
  | 'edit'
  | 'clone'
  | 'delete'
  | 'send'
  | 'pause'
  | 'resume'
  | 'cancel'
  | 'schedule'
  | 'unschedule'

/**
 * 🎯 EVENTOS DE CAMPAÑA
 */
export interface CampaignEvent {
  id: string
  campaignId: string
  type: 'created' | 'updated' | 'sent' | 'paused' | 'cancelled' | 'completed' | 'failed'
  timestamp: Date
  userEmail: string
  data?: Record<string, any>
  description: string
}

/**
 * 🎯 EXPORTACIONES PARA COMPATIBILIDAD
 */
export type { CanonicalContact as Contact } from '@/types/canonical'

// ✅ CONSTANTES ÚTILES
export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Borrador',
  scheduled: 'Programada',
  sending: 'Enviando',
  sent: 'Enviada',
  paused: 'Pausada',
  cancelled: 'Cancelada',
  failed: 'Fallida',
  completed: 'Completada'
}

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  mixed: 'WhatsApp + SMS'
}

export const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  whatsapp: 'WhatsApp',
  sms: 'SMS'
}

export const CONTACT_STATUS_LABELS: Record<ContactCampaignStatus, string> = {
  pending: 'Pendiente',
  sending: 'Enviando',
  sent: 'Enviado',
  delivered: 'Entregado',
  read: 'Leído',
  replied: 'Respondió',
  failed: 'Falló',
  bounced: 'Rebotó',
  unsubscribed: 'Dado de baja'
} 