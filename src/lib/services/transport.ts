/**
 * Capa de transporte con normalización de respuestas y helpers para IDs
 * Resuelve inconsistencias de shape y encoding en conversation IDs
 */

export interface NormalizedResponse {
  ok: boolean;
  message?: any;
  conversation?: any;
  info?: string;
}

export interface ApiError {
  type: 'validation' | 'payload' | 'network' | 'server';
  message: string;
  fields?: Record<string, string>;
}

/**
 * Normaliza cualquier respuesta de API a un formato unificado
 */
export function normalizeApiResponse(resp: any): NormalizedResponse {
  if (!resp) {
    return { ok: false };
  }

  // Determinar si la respuesta es exitosa
  const ok = resp.success === true || (resp.status >= 200 && resp.status < 300);

  // Extraer datos según diferentes shapes posibles
  const data = resp.data || resp;

  // Buscar message en diferentes ubicaciones
  const message = data?.data?.message || data?.message || null;

  // Buscar conversation en diferentes ubicaciones
  const conversation = data?.data?.conversation || data?.conversation || null;

  // Extraer mensaje informativo
  const info =
    data?.data?.message && typeof data.data.message === 'string'
      ? data.data.message
      : data?.message && typeof data.message === 'string'
        ? data.message
        : undefined;

  return {
    ok,
    message,
    conversation,
    info
  };
}

/**
 * Normaliza conversation ID para uso interno (siempre decodificado)
 */
export function normalizeConvId(id: string): string {
  if (!id) return '';
  return decodeURIComponent(id);
}

/**
 * Codifica conversation ID para URLs
 */
export function encodeConvIdForUrl(id: string): string {
  if (!id) return '';
  return encodeURIComponent(id);
}

/**
 * Mapea errores de API a errores tipados
 */
export function mapApiError(e: any): ApiError {
  const status = e?.response?.status;
  const data = e?.response?.data;

  if (status === 400) {
    if (data?.code === 'validation_error' && Array.isArray(data?.details)) {
      const fields: Record<string, string> = {};
      data.details.forEach((detail: any) => {
        fields[detail.field] = detail.message || `Error en ${detail.field}`;
      });

      return {
        type: 'validation',
        message: 'Error de validación',
        fields
      };
    }

    return {
      type: 'payload',
      message: data?.message || 'Datos inválidos'
    };
  }

  if (status === 413) {
    return {
      type: 'payload',
      message: 'Archivo excede el tamaño permitido'
    };
  }

  if (status >= 500) {
    return {
      type: 'server',
      message: 'Servidor temporalmente indisponible'
    };
  }

  if (e.code === 'NETWORK_ERROR' || e.message?.includes('Network Error')) {
    return {
      type: 'network',
      message: 'Error de conexión'
    };
  }

  return {
    type: 'payload',
    message: e?.message || 'Error desconocido'
  };
}
