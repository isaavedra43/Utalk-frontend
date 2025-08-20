import { useMemo, useCallback } from 'react';
import { infoLog } from '../../config/logger';

// Tipos genéricos para filtrado
export interface BaseFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchableItem {
  [key: string]: unknown;
}

// Hook genérico para filtrado
export function useFiltering<T extends SearchableItem>(
  items: T[],
  filters: BaseFilters & Record<string, unknown>,
  searchFields: (keyof T)[],
  filterConfig: {
    [key: string]: {
      field: keyof T;
      type: 'exact' | 'range' | 'array' | 'date';
      transform?: (value: unknown) => unknown;
    };
  } = {}
) {
  // Filtrado memoizado
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return [];

    let filtered = [...items];

    // Filtro por búsqueda
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return searchFields.some(field => {
          const value = item[field];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm);
        });
      });
    }

    // Aplicar filtros configurados
    Object.entries(filterConfig).forEach(([filterKey, config]) => {
      const filterValue = filters[filterKey];
      if (filterValue == null) return;

      filtered = filtered.filter(item => {
        const itemValue = item[config.field];
        
        switch (config.type) {
          case 'exact':
            return itemValue === filterValue;
          
          case 'range':
            if (Array.isArray(filterValue)) {
              const [min, max] = filterValue;
              if (min != null && itemValue < min) return false;
              if (max != null && itemValue > max) return false;
            }
            return true;
          
          case 'array':
            if (Array.isArray(filterValue)) {
              return filterValue.includes(itemValue);
            }
            return itemValue === filterValue;
          
          case 'date':
            if (Array.isArray(filterValue)) {
              const [start, end] = filterValue;
              if (start && itemValue < start) return false;
              if (end && itemValue > end) return false;
            }
            return true;
          
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [items, filters, searchFields, filterConfig]);

  // Ordenamiento memoizado
  const sortedItems = useMemo(() => {
    if (!filters.sortBy) return filteredItems;

    const sorted = [...filteredItems];
    const sortOrder = filters.sortOrder || 'asc';

    sorted.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof T];
      const bValue = b[filters.sortBy as keyof T];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
      if (bValue == null) return sortOrder === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });

    return sorted;
  }, [filteredItems, filters.sortBy, filters.sortOrder]);

  // Paginación memoizada
  const paginatedItems = useMemo(() => {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, filters.page, filters.limit]);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: items.length,
      filtered: filteredItems.length,
      displayed: paginatedItems.length,
      page: filters.page || 1,
      totalPages: Math.ceil(filteredItems.length / (filters.limit || 20)),
      hasMore: paginatedItems.length < filteredItems.length
    };
  }, [items.length, filteredItems.length, paginatedItems.length, filters.page, filters.limit]);

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<BaseFilters & Record<string, unknown>>) => {
    infoLog('Filtros actualizados:', newFilters);
    // Esta función debe ser implementada por el componente padre
    return newFilters;
  }, []);

  return {
    items: paginatedItems,
    filteredItems,
    sortedItems,
    stats,
    updateFilters
  };
}

// Hook específico para filtrado de clientes
export function useClientFiltering(
  clients: SearchableItem[],
  filters: BaseFilters & Record<string, unknown>
) {
  const searchFields: (keyof SearchableItem)[] = ['name', 'company', 'email'];
  
  const filterConfig = {
    stages: { field: 'stage', type: 'array' as const },
    agents: { field: 'assignedTo', type: 'array' as const },
    aiScore: { field: 'score', type: 'range' as const },
    value: { field: 'expectedValue', type: 'range' as const },
    probability: { field: 'probability', type: 'range' as const },
    statuses: { field: 'status', type: 'array' as const },
    tags: { field: 'tags', type: 'array' as const },
    sources: { field: 'source', type: 'array' as const },
    segments: { field: 'segment', type: 'array' as const },
    createdAfter: { field: 'createdAt', type: 'date' as const },
    createdBefore: { field: 'createdAt', type: 'date' as const }
  };

  return useFiltering(clients, filters, searchFields, filterConfig);
}

// Hook específico para filtrado de equipo
export function useTeamFiltering(
  members: SearchableItem[],
  filters: BaseFilters & Record<string, unknown>
) {
  const searchFields: (keyof SearchableItem)[] = ['fullName', 'email', 'role'];
  
  const filterConfig = {
    status: { field: 'status', type: 'exact' as const },
    role: { field: 'role', type: 'exact' as const }
  };

  return useFiltering(members, filters, searchFields, filterConfig);
} 