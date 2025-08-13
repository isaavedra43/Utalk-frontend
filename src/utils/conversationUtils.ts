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

  // Patrón para IDs de conversación: conv_[número]_[número]
  // Permite números con o sin el prefijo "+"
  const conversationIdPattern = /^conv_[+]?\d+_[+]?\d+$/;
  
  return conversationIdPattern.test(conversationId);
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

  // Intentar extraer y reformatear si es posible
  const match = conversationId.match(/^conv_([+]?\d+)_([+]?\d+)$/);
  if (match) {
    const [, phone1, phone2] = match;
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

  const match = conversationId.match(/^conv_([+]?\d+)_([+]?\d+)$/);
  if (!match) {
    return null;
  }

  const [, phone1, phone2] = match;
  return {
    phone1: phone1.startsWith('+') ? phone1 : `+${phone1}`,
    phone2: phone2.startsWith('+') ? phone2 : `+${phone2}`
  };
};

/**
 * Valida y limpia un ID de conversación antes de enviarlo al backend
 * @param conversationId - El ID de conversación a validar
 * @returns El ID limpio o null si es inválido
 */
export const sanitizeConversationId = (conversationId: string): string | null => {
  // Normalizar el ID
  const normalized = normalizeConversationId(conversationId);
  
  if (!normalized) {
    console.warn('⚠️ ID de conversación inválido:', conversationId);
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