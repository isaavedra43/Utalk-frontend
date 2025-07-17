/**
 * Tipos unificados para paginación
 * 
 * Se migra de page/pageSize a limit/startAfter para mejor compatibilidad
 * con Firestore y APIs modernas.
 */

// 🔧 Parámetros unificados de paginación
export interface PaginationParams {
  limit?: number;           // Número de elementos a obtener (reemplaza pageSize)
  startAfter?: string;      // Cursor para paginación (reemplaza page)
  orderBy?: string;         // Campo para ordenar
  direction?: 'asc' | 'desc'; // Dirección del ordenamiento
}

// Legacy - Para mantener compatibilidad temporal
export interface LegacyPaginationParams {
  page?: number;
  pageSize?: number;
}

// Respuesta paginada unificada
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor?: string;     // Para próxima página
    previousCursor?: string; // Para página anterior
    total?: number;          // Total de elementos (si disponible)
  };
}

// Utilidad para convertir de legacy a nuevo formato
export function convertLegacyPagination(
  legacy: LegacyPaginationParams
): PaginationParams {
  const { page = 1, pageSize = 20 } = legacy;
  
  return {
    limit: pageSize,
    // Para page-based, calculamos el offset como cursor simulado
    startAfter: page > 1 ? `page_${page - 1}` : undefined,
  };
}

// Utilidad para crear parámetros de paginación
export function createPaginationParams(
  limit = 20,
  startAfter?: string,
  orderBy = 'createdAt',
  direction: 'asc' | 'desc' = 'desc'
): PaginationParams {
  return {
    limit,
    startAfter,
    orderBy,
    direction
  };
}

// Hook helpers para paginación
export interface UsePaginationOptions {
  initialLimit?: number;
  initialOrderBy?: string;
  initialDirection?: 'asc' | 'desc';
}

export interface UsePaginationState {
  limit: number;
  startAfter?: string;
  orderBy: string;
  direction: 'asc' | 'desc';
  hasMore: boolean;
  loading: boolean;
}

export interface UsePaginationActions {
  loadMore: () => void;
  reset: () => void;
  setLimit: (limit: number) => void;
  setOrderBy: (field: string, direction?: 'asc' | 'desc') => void;
} 