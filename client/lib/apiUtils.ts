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
 * Normaliza una conversación para asegurar que todos los campos críticos tengan valores válidos
 * @param conv La conversación a normalizar
 * @returns Conversación normalizada y segura
 */
export function normalizeConversation(conv: any): Conversation {
  console.groupCollapsed(`🔧 [normalizeConversation] Normalizando conversación: ${conv?.id || 'SIN_ID'}`);
  
  try {
    const normalized: Conversation = {
      id: safeString(conv?.id, `temp_${Date.now()}`),
      name: safeString(conv?.name, "Cliente sin nombre"),
      phone: safeString(conv?.phone || conv?.customerPhone, "Sin teléfono"),
      customerPhone: safeString(conv?.customerPhone || conv?.phone, "Sin teléfono"),
      agentPhone: safeString(conv?.agentPhone, "Sin agente asignado"),
      channel: (conv?.channel && ['whatsapp', 'email', 'facebook', 'sms'].includes(conv.channel)) 
        ? conv.channel 
        : 'whatsapp',
      lastMessage: safeString(conv?.lastMessage || conv?.message, "Sin mensaje"),
      message: safeString(conv?.message || conv?.lastMessage, "Sin mensaje"),
      timestamp: toISOStringFromFirestore(conv?.timestamp || conv?.lastMessageAt || conv?.createdAt),
      lastMessageAt: toISOStringFromFirestore(conv?.lastMessageAt || conv?.timestamp || conv?.createdAt),
      createdAt: toISOStringFromFirestore(conv?.createdAt),
      updatedAt: toISOStringFromFirestore(conv?.updatedAt || conv?.createdAt),
      isUnread: safeBoolean(conv?.isUnread, false),
      avatar: safeString(conv?.avatar, ""),
      section: safeString(conv?.section, "general"),
      lastMessageDetails: conv?.lastMessageDetails ? {
        timestamp: toISOStringFromFirestore(conv.lastMessageDetails.timestamp),
        createdAt: toISOStringFromFirestore(conv.lastMessageDetails.createdAt),
        updatedAt: toISOStringFromFirestore(conv.lastMessageDetails.updatedAt),
        ...conv.lastMessageDetails
      } : undefined,
      // Preservar campos adicionales
      ...conv
    };
    
    console.log('✅ Conversación normalizada exitosamente:', {
      id: normalized.id,
      phone: normalized.phone,
      channel: normalized.channel,
      hasLastMessage: !!normalized.lastMessage,
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
 * Normaliza un mensaje para asegurar que todos los campos críticos tengan valores válidos
 * @param msg El mensaje a normalizar
 * @returns Mensaje normalizado y seguro
 */
export function normalizeMessage(msg: any): Message & { text?: string } {
  console.groupCollapsed(`🔧 [normalizeMessage] Normalizando mensaje: ${msg?.id || 'SIN_ID'}`);
  
  try {
    const normalized = {
      id: safeString(msg?.id, `temp_msg_${Date.now()}`),
      conversationId: safeString(msg?.conversationId, ""),
      content: safeString(msg?.content || msg?.text || msg?.body || msg?.message, "Mensaje sin contenido"),
      text: safeString(msg?.text || msg?.content || msg?.body || msg?.message, "Mensaje sin contenido"), // Alias para compatibilidad
      sender: (msg?.sender === 'agent' || msg?.sender === 'client') ? msg.sender : 'client',
      timestamp: toISOStringFromFirestore(msg?.timestamp || msg?.createdAt),
      status: (msg?.status && ['sent', 'delivered', 'read'].includes(msg.status)) 
        ? msg.status 
        : 'sent',
      type: (msg?.type && ['text', 'image', 'file', 'audio'].includes(msg.type))
        ? msg.type
        : 'text',
      attachments: Array.isArray(msg?.attachments) ? msg.attachments : []
    };
    
    console.log('✅ Mensaje normalizado exitosamente:', {
      id: normalized.id,
      hasContent: !!normalized.content,
      sender: normalized.sender,
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
      status: 'sent' as const,
      type: 'text' as const,
      attachments: []
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