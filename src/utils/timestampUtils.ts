/**
 * Utilidades para manejo de timestamps de Firebase
 * Convierte timestamps de Firebase (_seconds, _nanoseconds) a fechas JavaScript
 */

interface FirebaseTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

/**
 * Convierte un timestamp de Firebase a una fecha JavaScript
 * @param timestamp - Puede ser un string ISO, un objeto Firebase Timestamp, o undefined
 * @returns Una fecha JavaScript válida o null si no se puede convertir
 */
export const convertFirebaseTimestamp = (timestamp: string | FirebaseTimestamp | undefined | null): string | null => {
  if (!timestamp) {
    return null;
  }

  // Si ya es un string ISO, devolverlo directamente
  if (typeof timestamp === 'string') {
    // Verificar si es un string ISO válido
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return timestamp;
    }
    
    // Si no es un string ISO válido, intentar parsearlo como JSON
    try {
      const parsed = JSON.parse(timestamp);
      if (parsed && typeof parsed === 'object' && '_seconds' in parsed) {
        return convertFirebaseTimestamp(parsed);
      }
    } catch {
      // Si no se puede parsear como JSON, devolver null
      return null;
    }
    
    return null;
  }

  // Si es un objeto Firebase Timestamp
  if (typeof timestamp === 'object' && timestamp !== null && '_seconds' in timestamp) {
    const firebaseTimestamp = timestamp as FirebaseTimestamp;
    
    // Verificar que _seconds sea un número válido
    if (typeof firebaseTimestamp._seconds !== 'number' || isNaN(firebaseTimestamp._seconds)) {
      console.warn('⚠️ Timestamp de Firebase inválido:', timestamp);
      return null;
    }

    // Convertir segundos a milisegundos y crear fecha
    const milliseconds = firebaseTimestamp._seconds * 1000;
    const date = new Date(milliseconds);
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.warn('⚠️ Error al convertir timestamp de Firebase a fecha:', timestamp);
      return null;
    }

    return date.toISOString();
  }

  return null;
};

/**
 * Convierte múltiples timestamps de Firebase en un objeto
 * @param obj - Objeto que puede contener timestamps de Firebase
 * @returns Objeto con timestamps convertidos
 */
export const convertFirebaseTimestampsInObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && '_seconds' in value) {
      // Es un timestamp de Firebase
      result[key] = convertFirebaseTimestamp(value as FirebaseTimestamp);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Es un objeto anidado, procesar recursivamente
      result[key] = convertFirebaseTimestampsInObject(value as Record<string, unknown>);
    } else {
      // Es un valor normal
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * Valida si un valor es un timestamp de Firebase válido
 * @param value - Valor a validar
 * @returns true si es un timestamp de Firebase válido
 */
export const isValidFirebaseTimestamp = (value: unknown): value is FirebaseTimestamp => {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_seconds' in value &&
    typeof (value as FirebaseTimestamp)._seconds === 'number' &&
    !isNaN((value as FirebaseTimestamp)._seconds)
  );
};

/**
 * Obtiene la fecha actual en formato ISO string
 * @returns String ISO de la fecha actual
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
}; 