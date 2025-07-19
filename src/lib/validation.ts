// 🛡️ SISTEMA DE VALIDACIÓN CENTRALIZADO - UTalk Frontend
// Guardián de la calidad de datos - NO PASA NADA MAL FORMADO

import { 
  CanonicalMessage, 
  CanonicalConversation, 
  CanonicalContact,
  ValidationResult
} from '@/types/canonical'

/**
 * 🚨 LOGGER ESPECIALIZADO EN VALIDACIÓN
 */
class ValidationLogger {
  private static instance: ValidationLogger
  
  static getInstance(): ValidationLogger {
    if (!ValidationLogger.instance) {
      ValidationLogger.instance = new ValidationLogger()
    }
    return ValidationLogger.instance
  }
  
  error(message: string, data: any, context: string) {
    console.group(`🚨 VALIDATION ERROR - ${context}`)
    console.error(message)
    console.error('Data received:', data)
    console.error('Stack trace:', new Error().stack)
    console.groupEnd()
    
    // TODO: Enviar a sistema de monitoring en producción
    this.reportToMonitoring('error', message, data, context)
  }
  
  warning(message: string, data: any, context: string) {
    console.group(`⚠️ VALIDATION WARNING - ${context}`)
    console.warn(message)
    console.warn('Data received:', data)
    console.groupEnd()
    
    this.reportToMonitoring('warning', message, data, context)
  }
  
  info(message: string, data: any, context: string) {
    console.group(`ℹ️ VALIDATION INFO - ${context}`)
    console.info(message)
    console.info('Data:', data)
    console.groupEnd()
  }
  
  private reportToMonitoring(level: string, message: string, data: any, context: string) {
    // En producción, enviar a Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Ejemplo: Sentry.captureException(new Error(message), { extra: { data, context, level } })
      console.log(`Monitoring: ${level} - ${context} - ${message}`, data)
    }
  }
}

const logger = ValidationLogger.getInstance()

/**
 * 🔍 VALIDADOR BASE
 */
class DataValidator {
  
  /**
   * Valida que un campo exista y no sea null/undefined
   */
  static validateRequired(value: any, fieldName: string): boolean {
    if (value === null || value === undefined || value === '') {
      logger.error(`Campo requerido faltante: ${fieldName}`, value, 'REQUIRED_FIELD')
      return false
    }
    return true
  }
  
  /**
   * Valida que un valor sea del tipo esperado
   */
  static validateType(value: any, expectedType: string, fieldName: string): boolean {
    const actualType = typeof value
    
    if (expectedType === 'date' && !(value instanceof Date)) {
      logger.error(`Campo ${fieldName} debe ser Date, recibido: ${actualType}`, value, 'TYPE_MISMATCH')
      return false
    }
    
    if (expectedType === 'array' && !Array.isArray(value)) {
      logger.error(`Campo ${fieldName} debe ser Array, recibido: ${actualType}`, value, 'TYPE_MISMATCH')
      return false
    }
    
    if (expectedType !== 'date' && expectedType !== 'array' && actualType !== expectedType) {
      logger.error(`Campo ${fieldName} debe ser ${expectedType}, recibido: ${actualType}`, value, 'TYPE_MISMATCH')
      return false
    }
    
    return true
  }
  
  /**
   * Valida que un enum tenga un valor válido
   */
  static validateEnum(value: any, allowedValues: string[], fieldName: string): boolean {
    if (!allowedValues.includes(value)) {
      logger.error(`Campo ${fieldName} tiene valor inválido. Permitidos: ${allowedValues.join(', ')}`, value, 'ENUM_VIOLATION')
      return false
    }
    return true
  }
  
  /**
   * Transforma string a Date si es necesario
   */
  static transformToDate(value: any, fieldName: string): Date | null {
    if (value instanceof Date) return value
    
    if (typeof value === 'string') {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        logger.error(`No se puede convertir ${fieldName} a Date válida`, value, 'DATE_CONVERSION')
        return null
      }
      logger.info(`Transformado ${fieldName} de string a Date`, { original: value, transformed: date }, 'DATE_TRANSFORM')
      return date
    }
    
    logger.error(`${fieldName} no es Date ni string convertible`, value, 'DATE_INVALID')
    return null
  }
  
  /**
   * Normaliza un teléfono al formato internacional
   */
  static normalizePhone(phone: string): string {
    // Remover espacios, guiones, paréntesis
    let normalized = phone.replace(/[\s\-()]/g, '') // ✅ Corregido: sin escapes innecesarios
    
    // Si no empieza con +, agregar +52 (México por default)
    if (!normalized.startsWith('+')) {
      if (normalized.startsWith('52')) {
        normalized = '+' + normalized
      } else if (normalized.length === 10) {
        normalized = '+52' + normalized
      } else {
        normalized = '+' + normalized
      }
    }
    
    logger.info('Teléfono normalizado', { original: phone, normalized }, 'PHONE_NORMALIZE')
    return normalized
  }
}

/**
 * 🎯 VALIDADOR DE MENSAJES
 */
export class MessageValidator {
  
  static validate(data: any): ValidationResult & { data?: CanonicalMessage } {
    const errors: ValidationResult['errors'] = []
    const warnings: ValidationResult['warnings'] = []
    
    logger.info('Validando mensaje', data, 'MESSAGE_VALIDATION')
    
    // ✅ CAMPOS OBLIGATORIOS
    if (!DataValidator.validateRequired(data.id, 'id')) {
      errors.push({ field: 'id', message: 'ID es requerido', value: data.id })
    }
    
    if (!DataValidator.validateRequired(data.conversationId, 'conversationId')) {
      errors.push({ field: 'conversationId', message: 'conversationId es requerido', value: data.conversationId })
    }
    
    if (!DataValidator.validateRequired(data.content, 'content')) {
      errors.push({ field: 'content', message: 'content es requerido', value: data.content })
    }
    
    // ✅ TIMESTAMP
    const timestamp = DataValidator.transformToDate(data.timestamp, 'timestamp')
    if (!timestamp) {
      errors.push({ field: 'timestamp', message: 'timestamp inválido', value: data.timestamp })
    }
    
    // ✅ SENDER
    if (!data.sender || typeof data.sender !== 'object') {
      errors.push({ field: 'sender', message: 'sender es requerido y debe ser objeto', value: data.sender })
    } else {
      if (!DataValidator.validateRequired(data.sender.id, 'sender.id')) {
        errors.push({ field: 'sender.id', message: 'sender.id es requerido', value: data.sender.id })
      }
      
      if (!DataValidator.validateRequired(data.sender.name, 'sender.name')) {
        errors.push({ field: 'sender.name', message: 'sender.name es requerido', value: data.sender.name })
      }
      
      if (!DataValidator.validateEnum(data.sender.type, ['contact', 'agent', 'bot', 'system'], 'sender.type')) {
        errors.push({ field: 'sender.type', message: 'sender.type inválido', value: data.sender.type })
      }
    }
    
    // ✅ TYPE
    if (!DataValidator.validateEnum(data.type, ['text', 'image', 'video', 'audio', 'file', 'location', 'sticker'], 'type')) {
      errors.push({ field: 'type', message: 'type inválido', value: data.type })
    }
    
    // ✅ STATUS
    if (!DataValidator.validateEnum(data.status, ['sending', 'sent', 'delivered', 'read', 'failed'], 'status')) {
      errors.push({ field: 'status', message: 'status inválido', value: data.status })
    }
    
    // ✅ DIRECTION
    if (!DataValidator.validateEnum(data.direction, ['inbound', 'outbound'], 'direction')) {
      errors.push({ field: 'direction', message: 'direction inválido', value: data.direction })
    }
    
    // ✅ BOOLEANOS CON DEFAULTS
    const isRead = data.isRead ?? (data.status === 'read')
    const isDelivered = data.isDelivered ?? ['delivered', 'read'].includes(data.status)
    const isImportant = data.isImportant ?? false
    
    // ✅ WARNINGS para campos que faltan pero no son críticos
    if (data.isRead === undefined) {
      warnings.push({ field: 'isRead', message: 'isRead no definido, infiriendo del status', value: isRead })
    }
    
    if (data.isDelivered === undefined) {
      warnings.push({ field: 'isDelivered', message: 'isDelivered no definido, infiriendo del status', value: isDelivered })
    }
    
    // Si hay errores críticos, no devolver data
    if (errors.length > 0) {
      logger.error('Mensaje falló validación', { data, errors }, 'MESSAGE_VALIDATION_FAILED')
      return { isValid: false, errors, warnings }
    }
    
    // ✅ CONSTRUIR MENSAJE CANÓNICO
    const canonicalMessage: CanonicalMessage = {
      id: data.id,
      conversationId: data.conversationId,
      content: data.content,
      timestamp: timestamp!,
      sender: {
        id: data.sender.id,
        name: data.sender.name,
        type: data.sender.type,
        avatar: data.sender.avatar
      },
      type: data.type,
      status: data.status,
      direction: data.direction,
      isRead,
      isDelivered,
      isImportant,
      attachments: data.attachments || (data.media ? [{
        id: data.id + '_media',
        name: data.media.name || 'Archivo',
        url: data.media.url,
        type: data.media.type,
        size: data.media.size || 0
      }] : undefined),
      metadata: {
        twilioSid: data.twilioSid,
        userId: data.userId,
        edited: data.edited || false,
        ...(data.metadata || {})
      }
    }
    
    logger.info('Mensaje validado exitosamente', canonicalMessage, 'MESSAGE_VALIDATION_SUCCESS')
    return { isValid: true, errors: [], warnings, data: canonicalMessage }
  }
  
  /**
   * Mapea y valida respuesta del backend de mensajes
   */
  static validateBackendResponse(response: any): CanonicalMessage[] {
    logger.info('Validando respuesta de mensajes del backend', response, 'MESSAGE_BACKEND_VALIDATION')
    
    // Determinar estructura de respuesta
    let messages: any[] = []
    
    if (response.data && Array.isArray(response.data)) {
      messages = response.data
    } else if (response.messages && Array.isArray(response.messages)) {
      messages = response.messages
    } else if (Array.isArray(response)) {
      messages = response
    } else {
      logger.error('Respuesta del backend no contiene array de mensajes válido', response, 'BACKEND_STRUCTURE_INVALID')
      return []
    }
    
    const validMessages: CanonicalMessage[] = []
    const invalidCount = { count: 0 }
    
    messages.forEach((msg, index) => {
      const validation = MessageValidator.validate(msg)
      
      if (validation.isValid && validation.data) {
        validMessages.push(validation.data)
      } else {
        invalidCount.count++
        logger.error(`Mensaje ${index} inválido`, { msg, errors: validation.errors }, 'MESSAGE_INVALID')
      }
    })
    
    if (invalidCount.count > 0) {
      logger.error(`${invalidCount.count} mensajes inválidos de ${messages.length} total`, invalidCount, 'MESSAGES_VALIDATION_SUMMARY')
    }
    
    logger.info(`${validMessages.length} mensajes válidos procesados`, validMessages.length, 'MESSAGES_VALIDATION_SUCCESS')
    return validMessages
  }
}

/**
 * 🎯 VALIDADOR DE CONVERSACIONES
 */
export class ConversationValidator {
  
  static validate(data: any): ValidationResult & { data?: CanonicalConversation } {
    const errors: ValidationResult['errors'] = []
    const warnings: ValidationResult['warnings'] = []
    
    logger.info('Validando conversación', data, 'CONVERSATION_VALIDATION')
    
    // ✅ CAMPOS OBLIGATORIOS
    if (!DataValidator.validateRequired(data.id, 'id')) {
      errors.push({ field: 'id', message: 'ID es requerido', value: data.id })
    }
    
    if (!DataValidator.validateRequired(data.title, 'title')) {
      // Si no hay title, usar el nombre del contacto
      if (data.contact?.name) {
        warnings.push({ field: 'title', message: 'title no definido, usando nombre del contacto', value: data.contact.name })
      } else {
        errors.push({ field: 'title', message: 'title es requerido', value: data.title })
      }
    }
    
    // ✅ STATUS
    if (!DataValidator.validateEnum(data.status, ['open', 'pending', 'closed', 'archived'], 'status')) {
      errors.push({ field: 'status', message: 'status inválido', value: data.status })
    }
    
    // ✅ PRIORITY CON DEFAULT
    const priority = data.priority || 'medium'
    if (!DataValidator.validateEnum(priority, ['low', 'medium', 'high', 'urgent'], 'priority')) {
      errors.push({ field: 'priority', message: 'priority inválido', value: data.priority })
    }
    
    // ✅ CHANNEL
    if (!DataValidator.validateEnum(data.channel, ['whatsapp', 'telegram', 'email', 'webchat', 'api'], 'channel')) {
      errors.push({ field: 'channel', message: 'channel inválido', value: data.channel })
    }
    
    // ✅ TIMESTAMPS
    const createdAt = DataValidator.transformToDate(data.createdAt, 'createdAt')
    const updatedAt = DataValidator.transformToDate(data.updatedAt, 'updatedAt')
    const lastMessageAt = DataValidator.transformToDate(data.lastMessageAt, 'lastMessageAt')
    
    if (!createdAt) {
      errors.push({ field: 'createdAt', message: 'createdAt inválido', value: data.createdAt })
    }
    
    if (!updatedAt) {
      errors.push({ field: 'updatedAt', message: 'updatedAt inválido', value: data.updatedAt })
    }
    
    if (!lastMessageAt) {
      errors.push({ field: 'lastMessageAt', message: 'lastMessageAt inválido', value: data.lastMessageAt })
    }
    
    // ✅ CONTACTO (validar por separado)
    if (!data.contact) {
      errors.push({ field: 'contact', message: 'contact es requerido', value: data.contact })
    }
    
    // Si hay errores críticos, no continuar
    if (errors.length > 0) {
      logger.error('Conversación falló validación', { data, errors }, 'CONVERSATION_VALIDATION_FAILED')
      return { isValid: false, errors, warnings }
    }
    
    // Validar contacto
    const contactValidation = ContactValidator.validate(data.contact)
    if (!contactValidation.isValid) {
      errors.push({ field: 'contact', message: 'Contacto inválido', value: contactValidation.errors })
      return { isValid: false, errors, warnings }
    }
    
    // ✅ CONSTRUIR CONVERSACIÓN CANÓNICA
    const canonicalConversation: CanonicalConversation = {
      id: data.id,
      title: data.title || data.contact.name,
      status: data.status,
      priority,
      contact: contactValidation.data!,
      channel: data.channel,
      createdAt: createdAt!,
      updatedAt: updatedAt!,
      lastMessageAt: lastMessageAt!,
      messageCount: data.messageCount || 0,
      unreadCount: data.unreadCount || 0,
      assignedTo: data.assignedTo || undefined,
      lastMessage: data.lastMessage || undefined,
      tags: data.tags || [],
      isMuted: data.isMuted || false,
      isArchived: data.isArchived || false,
      metadata: data.metadata || {}
    }
    
    logger.info('Conversación validada exitosamente', canonicalConversation, 'CONVERSATION_VALIDATION_SUCCESS')
    return { isValid: true, errors: [], warnings, data: canonicalConversation }
  }
  
  static validateBackendResponse(response: any): CanonicalConversation[] {
    logger.info('Validando respuesta de conversaciones del backend', response, 'CONVERSATION_BACKEND_VALIDATION')
    
    let conversations: any[] = []
    
    if (response.data && Array.isArray(response.data)) {
      conversations = response.data
    } else if (response.conversations && Array.isArray(response.conversations)) {
      conversations = response.conversations
    } else if (Array.isArray(response)) {
      conversations = response
    } else {
      logger.error('Respuesta del backend no contiene array de conversaciones válido', response, 'BACKEND_STRUCTURE_INVALID')
      return []
    }
    
    const validConversations: CanonicalConversation[] = []
    let invalidCount = 0
    
    conversations.forEach((conv, index) => {
      const validation = ConversationValidator.validate(conv)
      
      if (validation.isValid && validation.data) {
        validConversations.push(validation.data)
      } else {
        invalidCount++
        logger.error(`Conversación ${index} inválida`, { conv, errors: validation.errors }, 'CONVERSATION_INVALID')
      }
    })
    
    if (invalidCount > 0) {
      logger.error(`${invalidCount} conversaciones inválidas de ${conversations.length} total`, { invalidCount }, 'CONVERSATIONS_VALIDATION_SUMMARY')
    }
    
    logger.info(`${validConversations.length} conversaciones válidas procesadas`, validConversations.length, 'CONVERSATIONS_VALIDATION_SUCCESS')
    return validConversations
  }
}

/**
 * 🎯 VALIDADOR DE CONTACTOS
 */
export class ContactValidator {
  
  static validate(data: any): ValidationResult & { data?: CanonicalContact } {
    const errors: ValidationResult['errors'] = []
    const warnings: ValidationResult['warnings'] = []
    
    logger.info('Validando contacto', data, 'CONTACT_VALIDATION')
    
    // ✅ CAMPOS OBLIGATORIOS
    if (!DataValidator.validateRequired(data.id, 'id')) {
      errors.push({ field: 'id', message: 'ID es requerido', value: data.id })
    }
    
    if (!DataValidator.validateRequired(data.name, 'name')) {
      errors.push({ field: 'name', message: 'name es requerido', value: data.name })
    }
    
    if (!DataValidator.validateRequired(data.phone, 'phone')) {
      errors.push({ field: 'phone', message: 'phone es requerido', value: data.phone })
    }
    
    // ✅ STATUS CON DEFAULT
    const status = data.status || 'active'
    if (!DataValidator.validateEnum(status, ['active', 'inactive', 'blocked', 'prospect', 'customer', 'lead'], 'status')) {
      errors.push({ field: 'status', message: 'status inválido', value: data.status })
    }
    
    // ✅ SOURCE CON DEFAULT
    const source = data.source || 'manual'
    if (!DataValidator.validateEnum(source, ['manual', 'import', 'whatsapp', 'webchat', 'api'], 'source')) {
      errors.push({ field: 'source', message: 'source inválido', value: data.source })
    }
    
    // ✅ TIMESTAMPS
    const createdAt = DataValidator.transformToDate(data.createdAt, 'createdAt')
    const updatedAt = DataValidator.transformToDate(data.updatedAt, 'updatedAt')
    
    if (!createdAt) {
      errors.push({ field: 'createdAt', message: 'createdAt inválido', value: data.createdAt })
    }
    
    if (!updatedAt) {
      errors.push({ field: 'updatedAt', message: 'updatedAt inválido', value: data.updatedAt })
    }
    
    // Si hay errores críticos, no continuar
    if (errors.length > 0) {
      logger.error('Contacto falló validación', { data, errors }, 'CONTACT_VALIDATION_FAILED')
      return { isValid: false, errors, warnings }
    }
    
    // ✅ NORMALIZAR TELÉFONO
    const normalizedPhone = DataValidator.normalizePhone(data.phone)
    
    // ✅ CONSTRUIR CONTACTO CANÓNICO COMPLETO
    const canonicalContact: CanonicalContact = {
      id: data.id,
      name: data.name,
      phone: normalizedPhone,
      email: data.email,
      avatar: data.avatar,
      company: data.company,
      position: data.position,
      status: data.status,
      source: data.source,
      isOnline: data.isOnline ?? false, // ✅ Campo obligatorio agregado
      channel: data.channel || 'whatsapp', // ✅ Campo obligatorio agregado
      lastSeen: data.lastSeen ? (DataValidator.transformToDate(data.lastSeen, 'lastSeen') || undefined) : undefined,
      createdAt: createdAt!,
      updatedAt: updatedAt!,
      lastContactAt: data.lastContactAt ? (DataValidator.transformToDate(data.lastContactAt, 'lastContactAt') || undefined) : undefined,
      totalMessages: data.totalMessages ?? 0,
      totalConversations: data.totalConversations ?? 0,
      averageResponseTime: data.averageResponseTime,
      value: data.value ?? 0,
      currency: data.currency || 'USD',
      tags: Array.isArray(data.tags) ? data.tags : [],
      customFields: data.customFields,
      metadata: data.metadata
    }
    
    logger.info('Contacto validado exitosamente', canonicalContact, 'CONTACT_VALIDATION_SUCCESS')
    return { isValid: true, errors: [], warnings, data: canonicalContact }
  }
  
  static validateBackendResponse(response: any): CanonicalContact[] {
    logger.info('Validando respuesta de contactos del backend', response, 'CONTACT_BACKEND_VALIDATION')
    
    let contacts: any[] = []
    
    if (response.data && Array.isArray(response.data)) {
      contacts = response.data
    } else if (response.contacts && Array.isArray(response.contacts)) {
      contacts = response.contacts
    } else if (Array.isArray(response)) {
      contacts = response
    } else {
      logger.error('Respuesta del backend no contiene array de contactos válido', response, 'BACKEND_STRUCTURE_INVALID')
      return []
    }
    
    const validContacts: CanonicalContact[] = []
    let invalidCount = 0
    
    contacts.forEach((contact, index) => {
      const validation = ContactValidator.validate(contact)
      
      if (validation.isValid && validation.data) {
        validContacts.push(validation.data)
      } else {
        invalidCount++
        logger.error(`Contacto ${index} inválido`, { contact, errors: validation.errors }, 'CONTACT_INVALID')
      }
    })
    
    if (invalidCount > 0) {
      logger.error(`${invalidCount} contactos inválidos de ${contacts.length} total`, { invalidCount }, 'CONTACTS_VALIDATION_SUMMARY')
    }
    
    logger.info(`${validContacts.length} contactos válidos procesados`, validContacts.length, 'CONTACTS_VALIDATION_SUCCESS')
    return validContacts
  }
}

/**
 * 🎯 EXPORTAR VALIDADORES
 */
export const DataValidators = {
  Message: MessageValidator,
  Conversation: ConversationValidator,
  Contact: ContactValidator,
  Base: DataValidator
}

export default DataValidators 