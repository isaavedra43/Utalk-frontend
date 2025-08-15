/**
 * Utilidades para manejo de IDs de conversación
 * Soluciona el problema de "INVALID_ID_FORMAT" en el backend
 */

/**
 * Valida si un ID de conversación tiene el formato correcto
 * @param conversationId - El ID de conversación a validar
 * @returns true si el formato es válido
 */
export const isValidConversationId = (conversationId: string): boolean => {
  if (!conversationId || typeof conversationId !== 'string') {
    return false;
  }

  // SOLUCIÓN CRÍTICA: Aceptar tanto + como %2B en los IDs
  // El patrón debe permitir tanto el formato original como el codificado
  const conversationIdPattern = /^conv_[+]?\d+_[+]?\d+$/;
  const encodedConversationIdPattern = /^conv_%2B\d+_%2B\d+$/;
  
  // Verificar si es el formato original (con +)
  if (conversationIdPattern.test(conversationId)) {
    return true;
  }
  
  // Verificar si es el formato codificado (con %2B)
  if (encodedConversationIdPattern.test(conversationId)) {
    return true;
  }
  
  // Verificar formato mixto (uno con + y otro con %2B)
  const mixedPattern1 = /^conv_[+]?\d+_%2B\d+$/;
  const mixedPattern2 = /^conv_%2B\d+_[+]?\d+$/;
  
  if (mixedPattern1.test(conversationId) || mixedPattern2.test(conversationId)) {
    return true;
  }
  
  return false;
};

/**
 * Normaliza un ID de conversación para asegurar formato consistente
 * @param conversationId - El ID de conversación a normalizar
 * @returns El ID normalizado o null si es inválido
 */
export const normalizeConversationId = (conversationId: string): string | null => {
  if (!conversationId || typeof conversationId !== 'string') {
    return null;
  }

  // Si ya tiene el formato correcto, retornarlo tal como está
  if (isValidConversationId(conversationId)) {
    return conversationId;
  }

  // SOLUCIÓN CRÍTICA: Manejar IDs codificados con %2B
  // Intentar extraer y reformatear si es posible, incluyendo formato codificado
  const match = conversationId.match(/^conv_([+]?\d+)_([+]?\d+)$/);
  if (match) {
    const [, phone1, phone2] = match;
    return `conv_${phone1}_${phone2}`;
  }
  
  // Intentar con formato codificado %2B
  const encodedMatch = conversationId.match(/^conv_(%2B\d+)_(%2B\d+)$/);
  if (encodedMatch) {
    const [, phone1, phone2] = encodedMatch;
    return `conv_${phone1}_${phone2}`;
  }
  
  // Intentar formato mixto (uno con + y otro con %2B)
  const mixedMatch1 = conversationId.match(/^conv_([+]?\d+)_(%2B\d+)$/);
  if (mixedMatch1) {
    const [, phone1, phone2] = mixedMatch1;
    return `conv_${phone1}_${phone2}`;
  }
  
  const mixedMatch2 = conversationId.match(/^conv_(%2B\d+)_([+]?\d+)$/);
  if (mixedMatch2) {
    const [, phone1, phone2] = mixedMatch2;
    return `conv_${phone1}_${phone2}`;
  }

  return null;
};

/**
 * Genera un ID de conversación a partir de dos números de teléfono
 * @param phone1 - Primer número de teléfono
 * @param phone2 - Segundo número de teléfono
 * @returns ID de conversación generado
 */
export const generateConversationId = (phone1: string, phone2: string): string => {
  // Normalizar números de teléfono (remover espacios, guiones, etc.)
  const normalizePhone = (phone: string): string => {
    return phone.replace(/[\s\-()]/g, '');
  };

  const normalizedPhone1 = normalizePhone(phone1);
  const normalizedPhone2 = normalizePhone(phone2);

  // Asegurar que los números tengan el formato correcto
  const formatPhone = (phone: string): string => {
    // Si no tiene "+" al inicio, agregarlo
    if (!phone.startsWith('+')) {
      return `+${phone}`;
    }
    return phone;
  };

  const formattedPhone1 = formatPhone(normalizedPhone1);
  const formattedPhone2 = formatPhone(normalizedPhone2);

  return `conv_${formattedPhone1}_${formattedPhone2}`;
};

/**
 * Extrae los números de teléfono de un ID de conversación
 * @param conversationId - El ID de conversación
 * @returns Objeto con los dos números de teléfono o null si es inválido
 */
export const extractPhonesFromConversationId = (conversationId: string): { phone1: string; phone2: string } | null => {
  if (!isValidConversationId(conversationId)) {
    return null;
  }

  // SOLUCIÓN CRÍTICA: Manejar tanto formato original como codificado
  let match = conversationId.match(/^conv_([+]?\d+)_([+]?\d+)$/);
  
  // Si no coincide con formato original, intentar con formato codificado
  if (!match) {
    match = conversationId.match(/^conv_(%2B\d+)_(%2B\d+)$/);
  }
  
  // Si no coincide con formato codificado, intentar formato mixto
  if (!match) {
    match = conversationId.match(/^conv_([+]?\d+)_(%2B\d+)$/);
  }
  
  if (!match) {
    match = conversationId.match(/^conv_(%2B\d+)_([+]?\d+)$/);
  }
  
  if (!match) {
    return null;
  }

  const [, phone1, phone2] = match;
  
  // Normalizar los números de teléfono
  const normalizePhone = (phone: string): string => {
    // Si tiene %2B, convertirlo a +
    if (phone.startsWith('%2B')) {
      return phone.replace('%2B', '+');
    }
    // Si no tiene + al inicio, agregarlo
    if (!phone.startsWith('+')) {
      return `+${phone}`;
    }
    return phone;
  };
  
  return {
    phone1: normalizePhone(phone1),
    phone2: normalizePhone(phone2)
  };
};

/**
 * Valida y limpia un ID de conversación antes de enviarlo al backend
 * @param conversationId - El ID de conversación a validar
 * @returns El ID limpio o null si es inválido
 */
export const sanitizeConversationId = (conversationId: string): string | null => {
  // SOLUCIÓN CRÍTICA: Manejar URLs que pueden tener espacios en lugar de +
  // HTTP convierte automáticamente + en espacios, necesitamos revertir esto
  const decodedConversationId = conversationId.replace(/\s/g, '+');
  
  // Normalizar el ID
  const normalized = normalizeConversationId(decodedConversationId);
  
  if (!normalized) {
    console.warn('⚠️ ID de conversación inválido:', conversationId, 'decoded:', decodedConversationId);
    return null;
  }

  // Verificar que cumple con el patrón esperado por el backend
  if (!isValidConversationId(normalized)) {
    console.error('❌ ID de conversación no cumple con el formato esperado:', normalized);
    return null;
  }

  return normalized;
};

/**
 * Codifica un ID de conversación para uso en URLs
 * CORREGIDO: Asegura que los caracteres + se codifiquen como %2B
 * @param conversationId - El ID de conversación a codificar
 * @returns El ID codificado para URL
 */
export const encodeConversationIdForUrl = (conversationId: string): string => {
  const sanitized = sanitizeConversationId(conversationId);
  if (!sanitized) {
    throw new Error(`ID de conversación inválido para codificación: ${conversationId}`);
  }
  
  // SOLUCIÓN CRÍTICA: Usar encodeURIComponent para preservar los + en la URL
  // encodeURIComponent convierte + en %2B automáticamente
  const encoded = encodeURIComponent(sanitized);
  
  console.log('�� ID de conversación codificado correctamente en URL | Data:', {
    originalId: conversationId,
    decodedId: sanitized,
    sanitizedId: sanitized,
    encodedId: encoded,
    method: 'encodeConversationIdForUrl'
  });
  
  return encoded;
};

/**
 * Codifica un ID de conversación específicamente para WebSocket
 * CORREGIDO: Asegura que los caracteres + se codifiquen como %2B en WebSocket
 * @param conversationId - El ID de conversación a codificar
 * @returns El ID codificado para WebSocket
 */
export const encodeConversationIdForWebSocket = (conversationId: string): string => {
  const sanitized = sanitizeConversationId(conversationId);
  if (!sanitized) {
    throw new Error(`ID de conversación inválido para WebSocket: ${conversationId}`);
  }
  
  // SOLUCIÓN CRÍTICA: Para WebSocket también necesitamos codificar los +
  // Aunque WebSocket no es HTTP, algunos servidores pueden interpretar mal los +
  const encoded = encodeURIComponent(sanitized);
  
  console.log('🔗 ID de conversación codificado para WebSocket | Data:', {
    originalId: conversationId,
    sanitizedId: sanitized,
    encodedId: encoded,
    method: 'encodeConversationIdForWebSocket'
  });
  
  return encoded;
};

/**
 * Decodifica un ID de conversación desde una URL
 * @param encodedConversationId - El ID codificado desde la URL
 * @returns El ID decodificado
 */
export const decodeConversationIdFromUrl = (encodedConversationId: string): string => {
  try {
    // Decodificar la URL
    const decoded = decodeURIComponent(encodedConversationId);
    
    // Revertir espacios a + si es necesario
    const withPlus = decoded.replace(/\s/g, '+');
    
    return withPlus;
  } catch (error) {
    console.error('❌ Error decodificando ID de conversación:', encodedConversationId, error);
    return encodedConversationId; // Retornar original si falla la decodificación
  }
};

/**
 * Función de utilidad para logging de IDs de conversación
 * @param conversationId - El ID de conversación
 * @param context - Contexto adicional para el log
 */
export const logConversationId = (conversationId: string, context: string = ''): void => {
  const isValid = isValidConversationId(conversationId);
  const phones = extractPhonesFromConversationId(conversationId);
  
  console.log(`🔍 ID de Conversación ${context}:`, {
    id: conversationId,
    isValid,
    phones,
    length: conversationId.length
  });
}; 