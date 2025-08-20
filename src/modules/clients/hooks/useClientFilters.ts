import { useState, useCallback, useMemo } from 'react';
import { infoLog } from '../../../config/logger';
import type { Client, ClientFilters, ClientStage, ClientStatus, ClientTag, ClientSource, ClientSegment } from '../../../types/client';

interface UseClientFiltersOptions {
  onFiltersChange?: (filters: ClientFilters) => void;
}

export const useClientFilters = (options: UseClientFiltersOptions = {}) => {
  const [filters, setFilters] = useState<ClientFilters>({
    search: '',
    stages: [],
    agents: [],
    aiScoreMin: undefined,
    aiScoreMax: undefined,
    valueMin: undefined,
    valueMax: undefined,
    probabilityMin: undefined,
    probabilityMax: undefined,
    statuses: [],
    tags: [],
    sources: [],
    segments: [],
    createdAfter: undefined,
    createdBefore: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });

  // Opciones de filtros disponibles
  const filterOptions = useMemo(() => ({
    stages: [
      { value: 'lead' as ClientStage, label: 'Lead' },
      { value: 'prospect' as ClientStage, label: 'Prospecto' },
      { value: 'demo' as ClientStage, label: 'Demo' },
      { value: 'propuesta' as ClientStage, label: 'Propuesta' },
      { value: 'negociacion' as ClientStage, label: 'Negociación' },
      { value: 'ganado' as ClientStage, label: 'Ganado' },
      { value: 'perdido' as ClientStage, label: 'Perdido' }
    ],
    agents: [
      { value: 'admin@company.com', label: 'PS Pedro Sánchez' },
      { value: 'maria@company.com', label: 'MG María González' },
      { value: 'carlos@company.com', label: 'CR Carlos Ruiz' },
      { value: 'ana@company.com', label: 'AM Ana Martín' },
      { value: 'elena@company.com', label: 'ET Elena Torres' }
    ],
    statuses: [
      { value: 'active' as ClientStatus, label: 'Activo' },
      { value: 'inactive' as ClientStatus, label: 'Inactivo' },
      { value: 'pending' as ClientStatus, label: 'Pendiente' }
    ],
    tags: [
      { value: 'VIP' as ClientTag, label: 'VIP' },
      { value: 'Empresa' as ClientTag, label: 'Empresa' },
      { value: 'Startup' as ClientTag, label: 'Startup' },
      { value: 'Premium' as ClientTag, label: 'Premium' },
      { value: 'Hot Lead' as ClientTag, label: 'Hot Lead' },
      { value: 'Cold Lead' as ClientTag, label: 'Cold Lead' }
    ],
    sources: [
      { value: 'website' as ClientSource, label: 'Website' },
      { value: 'referral' as ClientSource, label: 'Referido' },
      { value: 'social' as ClientSource, label: 'Social Media' },
      { value: 'email' as ClientSource, label: 'Email' },
      { value: 'phone' as ClientSource, label: 'Teléfono' },
      { value: 'other' as ClientSource, label: 'Otro' }
    ],
    segments: [
      { value: 'enterprise' as ClientSegment, label: 'Enterprise' },
      { value: 'mid-market' as ClientSegment, label: 'Mid-Market' },
      { value: 'small-business' as ClientSegment, label: 'Small Business' },
      { value: 'startup' as ClientSegment, label: 'Startup' }
    ],
    sortOptions: [
      { value: 'name', label: 'Nombre' },
      { value: 'company', label: 'Empresa' },
      { value: 'value', label: 'Valor' },
      { value: 'probability', label: 'Probabilidad' },
      { value: 'score', label: 'Score IA' },
      { value: 'createdAt', label: 'Fecha de creación' },
      { value: 'lastContact', label: 'Último contacto' }
    ]
  }), []);

  // Actualizar búsqueda
  const updateSearch = useCallback((search: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, search, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Actualizar filtros de etapa
  const updateStageFilters = useCallback((stages: ClientStage[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, stages, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Actualizar filtros de agente
  const updateAgentFilters = useCallback((agents: string[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, agents, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Actualizar filtros de score IA
  const updateAIScoreFilters = useCallback((min?: number, max?: number) => {
    setFilters(prev => {
      const newFilters = { ...prev, aiScoreMin: min, aiScoreMax: max, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Actualizar filtros de valor
  const updateValueFilters = useCallback((min?: number, max?: number) => {
    setFilters(prev => {
      const newFilters = { ...prev, valueMin: min, valueMax: max, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Actualizar filtros de probabilidad
  const updateProbabilityFilters = useCallback((min?: number, max?: number) => {
    setFilters(prev => {
      const newFilters = { ...prev, probabilityMin: min, probabilityMax: max, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Actualizar filtros de estado
  const updateStatusFilters = useCallback((statuses: ClientStatus[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, statuses, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Actualizar filtros de tags
  const updateTagFilters = useCallback((tags: ClientTag[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, tags, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Actualizar filtros de fuente
  const updateSourceFilters = useCallback((sources: ClientSource[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, sources, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Actualizar filtros de segmento
  const updateSegmentFilters = useCallback((segments: ClientSegment[]) => {
    setFilters(prev => {
      const newFilters = { ...prev, segments, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Actualizar filtros de fecha
  const updateDateFilters = useCallback((after?: Date, before?: Date) => {
    setFilters(prev => {
      const newFilters = { ...prev, createdAfter: after, createdBefore: before, page: 1 };
      options.onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [options]);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    const defaultFilters: ClientFilters = {
      search: '',
      stages: [],
      agents: [],
      aiScoreMin: undefined,
      aiScoreMax: undefined,
      valueMin: undefined,
      valueMax: undefined,
      probabilityMin: undefined,
      probabilityMax: undefined,
      statuses: [],
      tags: [],
      sources: [],
      segments: [],
      createdAfter: undefined,
      createdBefore: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20
    };
    setFilters(defaultFilters);
    options.onFiltersChange?.(defaultFilters);
  }, [options]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      (filters.stages?.length ?? 0) > 0 ||
      (filters.agents?.length ?? 0) > 0 ||
      filters.aiScoreMin !== undefined ||
      filters.aiScoreMax !== undefined ||
      filters.valueMin !== undefined ||
      filters.valueMax !== undefined ||
      filters.probabilityMin !== undefined ||
      filters.probabilityMax !== undefined ||
      (filters.statuses?.length ?? 0) > 0 ||
      (filters.tags?.length ?? 0) > 0 ||
      (filters.sources?.length ?? 0) > 0 ||
      (filters.segments?.length ?? 0) > 0 ||
      filters.createdAfter ||
      filters.createdBefore
    );
  }, [filters]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if ((filters.stages?.length ?? 0) > 0) count++;
    if ((filters.agents?.length ?? 0) > 0) count++;
    if (filters.aiScoreMin !== undefined || filters.aiScoreMax !== undefined) count++;
    if (filters.valueMin !== undefined || filters.valueMax !== undefined) count++;
    if (filters.probabilityMin !== undefined || filters.probabilityMax !== undefined) count++;
    if ((filters.statuses?.length ?? 0) > 0) count++;
    if ((filters.tags?.length ?? 0) > 0) count++;
    if ((filters.sources?.length ?? 0) > 0) count++;
    if ((filters.segments?.length ?? 0) > 0) count++;
    if (filters.createdAfter || filters.createdBefore) count++;
    return count;
  }, [filters]);

  // Resumen de filtros activos
  const activeFiltersSummary = useMemo(() => {
    const summary: string[] = [];
    if (filters.search) summary.push(`Búsqueda: "${filters.search}"`);
    if ((filters.stages?.length ?? 0) > 0) summary.push(`Etapas: ${filters.stages?.join(', ') ?? ''}`);
    if ((filters.agents?.length ?? 0) > 0) summary.push(`Agentes: ${filters.agents?.length ?? 0}`);
    if (filters.aiScoreMin !== undefined || filters.aiScoreMax !== undefined) {
      summary.push(`Score IA: ${filters.aiScoreMin || 0}-${filters.aiScoreMax || 100}`);
    }
    if (filters.valueMin !== undefined || filters.valueMax !== undefined) {
      summary.push(`Valor: $${filters.valueMin || 0}-$${filters.valueMax || '∞'}`);
    }
    if (filters.probabilityMin !== undefined || filters.probabilityMax !== undefined) {
      summary.push(`Probabilidad: ${filters.probabilityMin || 0}%-${filters.probabilityMax || 100}%`);
    }
    if ((filters.statuses?.length ?? 0) > 0) summary.push(`Estados: ${filters.statuses?.join(', ') ?? ''}`);
    if ((filters.tags?.length ?? 0) > 0) summary.push(`Tags: ${filters.tags?.join(', ') ?? ''}`);
    if ((filters.sources?.length ?? 0) > 0) summary.push(`Fuentes: ${filters.sources?.join(', ') ?? ''}`);
    if ((filters.segments?.length ?? 0) > 0) summary.push(`Segmentos: ${filters.segments?.join(', ') ?? ''}`);
    if (filters.createdAfter || filters.createdBefore) {
      summary.push('Fechas personalizadas');
    }
    return summary;
  }, [filters]);

  return {
    filters,
    filterOptions,
    updateSearch,
    updateStageFilters,
    updateAgentFilters,
    updateAIScoreFilters,
    updateValueFilters,
    updateProbabilityFilters,
    updateStatusFilters,
    updateTagFilters,
    updateSourceFilters,
    updateSegmentFilters,
    updateDateFilters,
    clearFilters,
    hasActiveFilters,
    activeFiltersCount,
    activeFiltersSummary
  };
};

// Hook para memoizar ordenamiento
export function useClientSortMemo(clients: Client[], sortBy: string, sortOrder: 'asc' | 'desc') {
  return useMemo(() => {
    const sortedClients = [...clients];
    
    sortedClients.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'value':
          aValue = a.expectedValue;
          bValue = b.expectedValue;
          break;
        case 'probability':
          aValue = a.probability;
          bValue = b.probability;
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'lastContact':
          aValue = a.lastContact?.getTime() || 0;
          bValue = b.lastContact?.getTime() || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedClients;
  }, [clients, sortBy, sortOrder]);
}

// Hook para memoizar paginación
export function useClientPaginationMemo(
  clients: Client[], 
  page: number, 
  pageSize: number
) {
  return useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return clients.slice(startIndex, endIndex);
  }, [clients, page, pageSize]);
}

// Hook para memoizar estadísticas
export function useClientStatsMemo(clients: Client[]) {
  return useMemo(() => {
    const totalClients = clients.length;
    const totalValue = clients.reduce((sum, client) => sum + client.expectedValue, 0);
    const avgScore = totalClients > 0 ? clients.reduce((sum, client) => sum + client.score, 0) / totalClients : 0;
    const avgProbability = totalClients > 0 ? clients.reduce((sum, client) => sum + client.probability, 0) / totalClients : 0;

    const stageBreakdown = clients.reduce((acc, client) => {
      acc[client.stage] = (acc[client.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusBreakdown = clients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalClients,
      totalValue,
      avgScore: Math.round(avgScore),
      avgProbability: Math.round(avgProbability),
      stageBreakdown,
      statusBreakdown
    };
  }, [clients]);
}

// Hook para memoizar callbacks
export function useClientCallbacks() {
  const handleClientSelect = useCallback((client: Client) => {
    // Lógica de selección
    infoLog('Cliente seleccionado:', client.name);
  }, []);

  const handleClientAction = useCallback((action: string, client: Client) => {
    // Lógica de acciones
    infoLog('Acción:', action, 'Cliente:', client.name);
  }, []);

  const handleClientUpdate = useCallback((clientId: string, updates: Partial<Client>) => {
    // Lógica de actualización
    infoLog('Actualizando cliente:', clientId, updates);
  }, []);

  return {
    handleClientSelect,
    handleClientAction,
    handleClientUpdate
  };
} 