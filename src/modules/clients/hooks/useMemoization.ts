import { useMemo, useCallback } from 'react';
import type { Client, ClientFilters } from '../../../types/client';

// Hook para memoizar filtros de clientes
export function useClientFiltersMemo(clients: Client[], filters: ClientFilters) {
  return useMemo(() => {
    return clients.filter(client => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          client.name.toLowerCase().includes(searchLower) ||
          client.company.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro por etapa
      if (filters.stages && filters.stages.length > 0) {
        if (!filters.stages.includes(client.stage)) return false;
      }

      // Filtro por agente
      if (filters.agents && filters.agents.length > 0) {
        if (!filters.agents.includes(client.assignedTo || '')) return false;
      }

      // Filtro por score IA
      if (filters.aiScoreMin !== undefined && client.score < filters.aiScoreMin) return false;
      if (filters.aiScoreMax !== undefined && client.score > filters.aiScoreMax) return false;

      // Filtro por valor
      if (filters.valueMin !== undefined && client.expectedValue < filters.valueMin) return false;
      if (filters.valueMax !== undefined && client.expectedValue > filters.valueMax) return false;

      // Filtro por probabilidad
      if (filters.probabilityMin !== undefined && client.probability < filters.probabilityMin) return false;
      if (filters.probabilityMax !== undefined && client.probability > filters.probabilityMax) return false;

      // Filtro por estado
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(client.status)) return false;
      }

      // Filtro por tags
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => client.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Filtro por fuente
      if (filters.sources && filters.sources.length > 0) {
        if (!filters.sources.includes(client.source)) return false;
      }

      // Filtro por segmento
      if (filters.segments && filters.segments.length > 0) {
        if (!filters.segments.includes(client.segment)) return false;
      }

      // Filtro por fechas
      if (filters.createdAfter && client.createdAt < filters.createdAfter) return false;
      if (filters.createdBefore && client.createdAt > filters.createdBefore) return false;

      return true;
    });
  }, [clients, filters]);
}

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
    console.log('Cliente seleccionado:', client.name);
  }, []);

  const handleClientAction = useCallback((action: string, client: Client) => {
    // Lógica de acciones
    console.log('Acción:', action, 'Cliente:', client.name);
  }, []);

  const handleClientUpdate = useCallback((clientId: string, updates: Partial<Client>) => {
    // Lógica de actualización
    console.log('Actualizando cliente:', clientId, updates);
  }, []);

  return {
    handleClientSelect,
    handleClientAction,
    handleClientUpdate
  };
} 