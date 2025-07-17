// =============================================
// apiUtils.ts - Utilidades para manejar respuestas de API
// =============================================
// Este archivo contiene funciones para procesar respuestas de API
// de forma segura y robusta, evitando errores por cambios en la
// estructura del backend.
// =============================================

import { logger } from "./utils";
import type { Conversation, Message } from "@/types/api";

type FirestoreTimestamp = { 
  _seconds: number; 
  _nanoseconds: number; 
};

type DateOrTimestamp = string | FirestoreTimestamp | null | undefined;

/**
 * Transforma un timestamp de Firestore a un string ISO.
 * @param ts El timestamp a transformar.
 * @returns El string ISO o una cadena válida por defecto si es inválido.
 */
export function toISOStringFromFirestore(ts: DateOrTimestamp): string {
  if (!ts) {
    const defaultDate = new Date().toISOString();
    console.warn('🔧 [toISOStringFromFirestore] Timestamp vacío, usando fecha actual:', defaultDate);
    return defaultDate;
  }
  
  if (typeof ts === 'object' && ts !== null && '_seconds' in ts) {
    try {
      const converted = new Date(ts._seconds * 1000).toISOString();
      console.log('✅ [toISOStringFromFirestore] Firestore timestamp convertido:', { original: ts, converted });
      return converted;
    } catch (error) {
      const fallback = new Date().toISOString();
      console.error('❌ [toISOStringFromFirestore] Error convirtiendo Firestore timestamp, usando fallback:', { error, fallback });
      return fallback;
    }
  }
  
  if (typeof ts === 'string') {
    try {
      // Validar que es un string ISO válido
      const testDate = new Date(ts);
      if (!isNaN(testDate.getTime())) {
        return ts;
      } else {
        throw new Error('String de fecha inválido');
      }
    } catch (error) {
      const fallback = new Date().toISOString();
      console.warn('⚠️ [toISOStringFromFirestore] String de fecha inválido, usando fallback:', { original: ts, fallback });
      return fallback;
    }
  }
  
  if (ts instanceof Date) {
    try {
      return ts.toISOString();
    } catch (error) {
      const fallback = new Date().toISOString();
      console.error('❌ [toISOStringFromFirestore] Error en Date.toISOString(), usando fallback:', { error, fallback });
      return fallback;
    }
  }
  
  const fallback = new Date().toISOString();
  console.warn('🔧 [toISOStringFromFirestore] Tipo de timestamp no reconocido, usando fallback:', { type: typeof ts, value: ts, fallback });
  return fallback;
}

/**
 * Normaliza una cadena de texto para asegurar que sea válida
 * @param value El valor a normalizar
 * @param fallback El valor por defecto si es inválido
 * @returns String válido o el fallback
 */
export function safeString(value: any, fallback: string = ""): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'string') {
    return value.trim();
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  if (typeof value === 'boolean') {
    return String(value);
  }
  
  // Para objetos, intentar convertir a string JSON o usar fallback
  try {
    return String(value);
  } catch (error) {
    console.warn('⚠️ [safeString] No se pudo convertir valor a string:', { value, error });
    return fallback;
  }
}

/**
 * Normaliza un booleano para asegurar que sea válido
 * @param value El valor a normalizar
 * @param fallback El valor por defecto si es inválido
 * @returns Boolean válido o el fallback
 */
export function safeBoolean(value: any, fallback: boolean = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
  }
  
  if (typeof value === 'number') {
    return value !== 0;
  }
  
  return fallback;
}

/**
 * Normaliza un mensaje para asegurar que todos los campos críticos tengan valores válidos
 * y estén alineados con el contrato del backend
 * @param msg El mensaje a normalizar
 * @returns Mensaje normalizado y seguro
 */
export function normalizeMessage(msg: any): Message & { text?: string } {
  console.groupCollapsed(`🔧 [normalizeMessage] Normalizando mensaje: ${msg?.id || 'SIN_ID'}`);
  
  try {
    // 🔧 NORMALIZACIÓN MEJORADA DE CAMPOS CRÍTICOS SEGÚN BACKEND
    
    // 1. SENDER: Normalizar según lo que espera el backend (agent/client)
    let normalizedSender: 'agent' | 'client' = 'client';
    if (msg?.sender) {
      const senderStr = String(msg.sender).toLowerCase();
      if (senderStr === 'agent' || senderStr === 'admin' || senderStr === 'system') {
        normalizedSender = 'agent';
      } else if (senderStr === 'client' || senderStr === 'customer' || senderStr === 'user') {
        normalizedSender = 'client';
      }
    }
    
    // 2. DIRECTION: Si el backend usa direction en lugar de sender
    if (msg?.direction && !msg?.sender) {
      const directionStr = String(msg.direction).toLowerCase();
      if (directionStr === 'inbound' || directionStr === 'incoming') {
        normalizedSender = 'client';
      } else if (directionStr === 'outbound' || directionStr === 'outgoing') {
        normalizedSender = 'agent';
      }
    }
    
    // 3. STATUS: Asegurar valores válidos que acepta el backend
    let normalizedStatus: 'sent' | 'delivered' | 'read' | 'error' = 'sent';
    if (msg?.status) {
      const statusStr = String(msg.status).toLowerCase();
      if (['delivered', 'delivered_to_device', 'delivered_to_phone'].includes(statusStr)) {
        normalizedStatus = 'delivered';
      } else if (['read', 'read_by_recipient', 'opened'].includes(statusStr)) {
        normalizedStatus = 'read';
      } else if (['failed', 'error', 'undelivered', 'rejected'].includes(statusStr)) {
        normalizedStatus = 'error';
      } else if (['sent', 'queued', 'sending', 'accepted'].includes(statusStr)) {
        normalizedStatus = 'sent';
      }
    }
    
    // 4. CONTENIDO: Múltiples campos posibles del backend
    const content = safeString(
      msg?.content || 
      msg?.text || 
      msg?.body || 
      msg?.message || 
      msg?.messageBody,
      "Mensaje sin contenido"
    );
    
    // 5. TIPO DE MENSAJE: Normalizar tipos conocidos
    let normalizedType: 'text' | 'image' | 'file' | 'audio' = 'text';
    if (msg?.type) {
      const typeStr = String(msg.type).toLowerCase();
      if (['image', 'photo', 'picture', 'img'].includes(typeStr)) {
        normalizedType = 'image';
      } else if (['file', 'document', 'attachment', 'doc'].includes(typeStr)) {
        normalizedType = 'file';
      } else if (['audio', 'voice', 'sound', 'recording'].includes(typeStr)) {
        normalizedType = 'audio';
      } else {
        normalizedType = 'text';
      }
    }
    
    // 6. ATTACHMENTS: Normalizar estructura de archivos adjuntos
    const normalizedAttachments = [];
    if (Array.isArray(msg?.attachments)) {
      normalizedAttachments.push(...msg.attachments.filter(att => att && typeof att === 'object'));
    } else if (msg?.mediaUrl || msg?.fileUrl) {
      // Si viene un solo archivo como URL
      normalizedAttachments.push({
        id: `attachment_${Date.now()}`,
        name: msg?.fileName || 'Archivo adjunto',
        type: normalizedType,
        url: msg?.mediaUrl || msg?.fileUrl,
        size: msg?.fileSize || 'Desconocido'
      });
    }

    const normalized = {
      id: safeString(msg?.id, `temp_msg_${Date.now()}`),
      conversationId: safeString(msg?.conversationId || msg?.chatId || msg?.threadId, ""),
      content,
      text: content, // Alias para compatibilidad
      sender: normalizedSender,
      timestamp: toISOStringFromFirestore(msg?.timestamp || msg?.createdAt || msg?.sentAt),
      status: normalizedStatus,
      type: normalizedType,
      attachments: normalizedAttachments,
      
      // 7. CAMPOS ADICIONALES DEL BACKEND (si existen)
      ...(msg?.messageId && { messageId: msg.messageId }),
      ...(msg?.from && { from: safeString(msg.from) }),
      ...(msg?.to && { to: safeString(msg.to) }),
      ...(msg?.direction && { direction: msg.direction }),
      ...(msg?.channel && { channel: msg.channel }),
      ...(msg?.priority && { priority: msg.priority }),
      ...(msg?.metadata && { metadata: msg.metadata })
    };
    
    console.log('✅ Mensaje normalizado exitosamente:', {
      id: normalized.id,
      hasContent: !!normalized.content,
      sender: normalized.sender,
      status: normalized.status,
      type: normalized.type,
      hasAttachments: normalized.attachments.length > 0,
      timestamp: normalized.timestamp
    });
    
    console.groupEnd();
    return normalized;
    
  } catch (error) {
    console.error('❌ Error al normalizar mensaje, usando fallback mínimo:', { error, originalMsg: msg });
    console.groupEnd();
    
    // Fallback de emergencia
    return {
      id: safeString(msg?.id, `emergency_msg_${Date.now()}`),
      conversationId: "",
      content: "Error al cargar mensaje",
      text: "Error al cargar mensaje",
      sender: 'client' as const,
      timestamp: new Date().toISOString(),
      status: 'error' as const,
      type: 'text' as const,
      attachments: []
    };
  }
}

/**
 * Normaliza una conversación para asegurar que todos los campos críticos tengan valores válidos
 * y estén alineados con el contrato del backend
 * @param conv La conversación a normalizar
 * @returns Conversación normalizada y segura
 */
export function normalizeConversation(conv: any): Conversation {
  console.groupCollapsed(`🔧 [normalizeConversation] Normalizando conversación: ${conv?.id || 'SIN_ID'}`);
  
  try {
    // 🔧 NORMALIZACIÓN MEJORADA DE CAMPOS CRÍTICOS SEGÚN BACKEND
    
    // 1. TELÉFONOS: Múltiples formatos posibles del backend
    const customerPhone = safeString(
      conv?.customerPhone || 
      conv?.phone || 
      conv?.from || 
      conv?.clientPhone || 
      conv?.userPhone,
      "Sin teléfono"
    );
    
    const agentPhone = safeString(
      conv?.agentPhone || 
      conv?.to || 
      conv?.assignedPhone || 
      conv?.businessPhone,
      "Sin agente asignado"
    );
    
    // 2. CANAL: Normalizar canales conocidos del backend
    let normalizedChannel: 'whatsapp' | 'email' | 'facebook' | 'sms' = 'whatsapp';
    if (conv?.channel) {
      const channelStr = String(conv.channel).toLowerCase();
      if (['email', 'mail', 'gmail', 'outlook'].includes(channelStr)) {
        normalizedChannel = 'email';
      } else if (['facebook', 'fb', 'messenger', 'facebook_messenger'].includes(channelStr)) {
        normalizedChannel = 'facebook';
      } else if (['sms', 'text', 'twilio_sms'].includes(channelStr)) {
        normalizedChannel = 'sms';
      } else if (['whatsapp', 'wa', 'twilio_whatsapp'].includes(channelStr)) {
        normalizedChannel = 'whatsapp';
      }
    }
    
    // 3. ÚLTIMO MENSAJE: Múltiples fuentes posibles
    const lastMessage = safeString(
      conv?.lastMessage || 
      conv?.message || 
      conv?.lastMessageContent || 
      conv?.recentMessage,
      "Sin mensaje"
    );
    
    // 4. ESTADO DE LECTURA: Múltiples formatos del backend
    let isUnread = false;
    if (conv?.isUnread !== undefined) {
      isUnread = safeBoolean(conv.isUnread);
    } else if (conv?.read !== undefined) {
      isUnread = !safeBoolean(conv.read);
    } else if (conv?.status) {
      const statusStr = String(conv.status).toLowerCase();
      isUnread = statusStr === 'unread' || statusStr === 'new';
    }
    
    // 5. NOMBRE DEL CONTACTO: Múltiples fuentes
    const name = safeString(
      conv?.name || 
      conv?.contactName || 
      conv?.customerName || 
      conv?.displayName || 
      `Cliente ${customerPhone}`,
      "Cliente sin nombre"
    );
    
    // 6. TIMESTAMPS: Múltiples formatos del backend
    const createdAt = toISOStringFromFirestore(
      conv?.createdAt || 
      conv?.created || 
      conv?.startedAt
    );
    
    const lastMessageAt = toISOStringFromFirestore(
      conv?.lastMessageAt || 
      conv?.lastActivity || 
      conv?.updatedAt || 
      conv?.lastMessageTime || 
      createdAt
    );
    
    const updatedAt = toISOStringFromFirestore(
      conv?.updatedAt || 
      conv?.modified || 
      lastMessageAt || 
      createdAt
    );

    const normalized: Conversation = {
      id: safeString(conv?.id, `temp_${Date.now()}`),
      name,
      phone: customerPhone, // Alias para compatibilidad
      customerPhone,
      agentPhone,
      channel: normalizedChannel,
      lastMessage,
      message: lastMessage, // Alias para compatibilidad
      timestamp: lastMessageAt, // Alias para compatibilidad
      lastMessageAt,
      createdAt,
      updatedAt,
      isUnread,
      avatar: safeString(conv?.avatar, ""),
      section: safeString(conv?.section || conv?.category || conv?.department, "general"),
      
      // 7. CAMPOS ADICIONALES DEL BACKEND (preservar estructura)
      ...(conv?.status && { status: conv.status }),
      ...(conv?.priority && { priority: conv.priority }),
      ...(conv?.assignedTo && { assignedTo: conv.assignedTo }),
      ...(conv?.agentId && { agentId: conv.agentId }),
      ...(conv?.tags && { tags: conv.tags }),
      ...(conv?.metadata && { metadata: conv.metadata }),
      ...(conv?.messageCount && { messageCount: conv.messageCount }),
      ...(conv?.unreadCount && { unreadCount: conv.unreadCount }),
      
      // Preservar lastMessageDetails si existe
      lastMessageDetails: conv?.lastMessageDetails ? {
        timestamp: toISOStringFromFirestore(conv.lastMessageDetails.timestamp),
        createdAt: toISOStringFromFirestore(conv.lastMessageDetails.createdAt),
        updatedAt: toISOStringFromFirestore(conv.lastMessageDetails.updatedAt),
        ...conv.lastMessageDetails
      } : undefined
    };
    
    console.log('✅ Conversación normalizada exitosamente:', {
      id: normalized.id,
      phone: normalized.customerPhone,
      channel: normalized.channel,
      hasLastMessage: !!normalized.lastMessage,
      isUnread: normalized.isUnread,
      timestamps: {
        lastMessageAt: normalized.lastMessageAt,
        createdAt: normalized.createdAt,
        updatedAt: normalized.updatedAt
      }
    });
    
    console.groupEnd();
    return normalized;
    
  } catch (error) {
    console.error('❌ Error al normalizar conversación, usando fallback mínimo:', { error, originalConv: conv });
    console.groupEnd();
    
    // Fallback de emergencia
    return {
      id: safeString(conv?.id, `emergency_${Date.now()}`),
      customerPhone: "Error al cargar teléfono",
      agentPhone: "Error al cargar agente",
      lastMessage: "Error al cargar mensaje",
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      channel: 'whatsapp',
      isUnread: false,
      section: 'error'
    };
  }
}

/**
 * Procesa un array de conversaciones aplicando normalización robusta
 * @param conversations Array de conversaciones a procesar
 * @returns Array de conversaciones normalizadas
 */
export function processConversations(conversations: any[]): Conversation[] {
  console.group('🔄 [processConversations] Procesando array de conversaciones');
  console.log('📥 Conversaciones recibidas:', conversations?.length || 0);
  
  if (!Array.isArray(conversations)) {
    console.error('❌ conversations no es un array:', conversations);
    console.groupEnd();
    return [];
  }
  
  const processed = conversations
    .filter(conv => conv != null) // Filtrar valores null/undefined
    .map(normalizeConversation);
  
  console.log('✅ Conversaciones procesadas exitosamente:', processed.length);
  console.groupEnd();
  
  return processed;
}

/**
 * Procesa un array de mensajes aplicando normalización robusta
 * @param messages Array de mensajes a procesar
 * @returns Array de mensajes normalizados
 */
export function processMessages(messages: any[]): (Message & { text?: string })[] {
  console.group('🔄 [processMessages] Procesando array de mensajes');
  console.log('📥 Mensajes recibidos:', messages?.length || 0);
  
  if (!Array.isArray(messages)) {
    console.error('❌ messages no es un array:', messages);
    console.groupEnd();
    return [];
  }
  
  const processed = messages
    .filter(msg => msg != null) // Filtrar valores null/undefined
    .map(normalizeMessage);
  
  console.log('✅ Mensajes procesados exitosamente:', processed.length);
  console.groupEnd();
  
  return processed;
}

/**
 * Extrae de forma segura un array de datos de una respuesta de API,
 * independientemente de la propiedad en la que se encuentre.
 * @param response La respuesta de la API.
 * @param primaryKey La clave principal donde se esperan los datos (ej: 'messages', 'conversations').
 * @returns El array de datos encontrado o un array vacío.
 */
export function extractData<T>(response: any, primaryKey?: keyof any): T[] {
  console.groupCollapsed(`🔍 [extractData] Extrayendo datos (key: ${String(primaryKey) || 'N/A'})`);
  console.log("📥 Response recibido:", response);

  if (!response) {
    console.warn("⚠️ Response es nulo o undefined");
    console.groupEnd();
    return [];
  }

  // 1. Intentar con la clave primaria si se proporciona
  if (primaryKey && response[primaryKey] && Array.isArray(response[primaryKey])) {
    console.log(`✅ Datos encontrados en la clave primaria: "${String(primaryKey)}"`);
    console.groupEnd();
    return response[primaryKey];
  }

  // 2. Intentar con 'data' (común en APIs REST)
  if (response.data && Array.isArray(response.data)) {
    console.log("✅ Datos encontrados en 'data'");
    console.groupEnd();
    return response.data;
  }
  
  // 3. Intentar con 'conversations' (caso específico)
  if (response.conversations && Array.isArray(response.conversations)) {
    console.log("✅ Datos encontrados en 'conversations'");
    console.groupEnd();
    return response.conversations;
  }

  // 4. Intentar con 'messages' (caso específico)
  if (response.messages && Array.isArray(response.messages)) {
    console.log("✅ Datos encontrados en 'messages'");
    console.groupEnd();
    return response.messages;
  }

  // 5. Verificar si la respuesta es directamente el array
  if (Array.isArray(response)) {
    console.log("✅ La respuesta es directamente el array");
    console.groupEnd();
    return response;
  }

  console.warn("❌ No se encontró un array de datos válido en la respuesta.");
  console.log("Claves disponibles:", Object.keys(response));
  console.groupEnd();
  return [];
} 