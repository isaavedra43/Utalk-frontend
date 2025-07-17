// =============================================
// apiUtils.ts - Utilidades para manejar respuestas de API
// =============================================
// Este archivo contiene funciones para procesar respuestas de API
// de forma segura y robusta, evitando errores por cambios en la
// estructura del backend.
// =============================================

import { logger } from "./utils";

type FirestoreTimestamp = { 
  _seconds: number; 
  _nanoseconds: number; 
};

type DateOrTimestamp = string | FirestoreTimestamp | null | undefined;

/**
 * Transforma un timestamp de Firestore a un string ISO.
 * @param ts El timestamp a transformar.
 * @returns El string ISO o una cadena vacía si es inválido.
 */
export function toISOStringFromFirestore(ts: DateOrTimestamp): string {
  if (!ts) return '';
  if (typeof ts === 'object' && ts !== null && '_seconds' in ts) {
    try {
      return new Date(ts._seconds * 1000).toISOString();
    } catch (error) {
      console.error('Error convirtiendo Firestore timestamp', { error });
      return '';
    }
  }
  if (typeof ts === 'string') return ts;
  if (ts instanceof Date) return ts.toISOString();
  
  console.warn('Tipo de timestamp no reconocido', { type: typeof ts, value: ts });
  return '';
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