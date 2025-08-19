import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '../../../stores/useAppStore';
import type { 
  Client, 
  ClientFilters, 
  ClientApiResponse 
} from '../../../types/client';
import { logger, LogCategory } from '../../../utils/logger';
import { clientService } from '../services/clientService';
import { clientProfileLogger } from '../../../config/logging';

interface UseClientsOptions {
  autoLoad?: boolean;
  initialFilters?: Partial<ClientFilters>;
  pageSize?: number;
}

export const useClients = (options: UseClientsOptions = {}) => {
  const {
    autoLoad = true,
    initialFilters = {},
    pageSize = 20
  } = options;

  const { clientData, setClientData } = useAppStore();
  
  // Estado local para filtros y paginación
  const [filters, setFilters] = useState<ClientFilters>({
    page: 1,
    limit: pageSize,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clientes filtrados y ordenados
  const filteredClients = useMemo(() => {
    if (!clientData?.clients) return [];

    let filtered = [...clientData.clients];

    // Aplicar filtros de búsqueda
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.company.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar filtros por etapa
    if (filters.stages && filters.stages.length > 0) {
      filtered = filtered.filter(client => 
        filters.stages!.includes(client.stage)
      );
    }

    // Aplicar filtros por agente
    if (filters.agents && filters.agents.length > 0) {
      filtered = filtered.filter(client => 
        client.assignedTo && filters.agents!.includes(client.assignedTo)
      );
    }

    // Aplicar filtros por score de IA
    if (filters.aiScoreMin !== undefined) {
      filtered = filtered.filter(client => client.score >= filters.aiScoreMin!);
    }
    if (filters.aiScoreMax !== undefined) {
      filtered = filtered.filter(client => client.score <= filters.aiScoreMax!);
    }

    // Aplicar filtros por valor
    if (filters.valueMin !== undefined) {
      filtered = filtered.filter(client => client.expectedValue >= filters.valueMin!);
    }
    if (filters.valueMax !== undefined) {
      filtered = filtered.filter(client => client.expectedValue <= filters.valueMax!);
    }

    // Aplicar filtros por probabilidad
    if (filters.probabilityMin !== undefined) {
      filtered = filtered.filter(client => client.probability >= filters.probabilityMin!);
    }
    if (filters.probabilityMax !== undefined) {
      filtered = filtered.filter(client => client.probability <= filters.probabilityMax!);
    }

    // Aplicar filtros por estado
    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(client => 
        filters.statuses!.includes(client.status)
      );
    }

    // Aplicar filtros por etiquetas
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(client => 
        client.tags.some(tag => filters.tags!.includes(tag))
      );
    }

    // Aplicar filtros por fuente
    if (filters.sources && filters.sources.length > 0) {
      filtered = filtered.filter(client => 
        filters.sources!.includes(client.source)
      );
    }

    // Aplicar filtros por segmento
    if (filters.segments && filters.segments.length > 0) {
      filtered = filtered.filter(client => 
        filters.segments!.includes(client.segment)
      );
    }

    // Aplicar filtros por fecha
    if (filters.createdAfter) {
      filtered = filtered.filter(client => client.createdAt >= filters.createdAfter!);
    }
    if (filters.createdBefore) {
      filtered = filtered.filter(client => client.createdAt <= filters.createdBefore!);
    }

    // Ordenar
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: string | number | Date;
        let bValue: string | number | Date;

        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'company':
            aValue = a.company.toLowerCase();
            bValue = b.company.toLowerCase();
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
          case 'createdAt':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'lastContact':
            aValue = a.lastContact || new Date(0);
            bValue = b.lastContact || new Date(0);
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [clientData?.clients, filters]);

  // Clientes paginados
  const paginatedClients = useMemo(() => {
    const startIndex = ((filters.page || 1) - 1) * (filters.limit || pageSize);
    const endIndex = startIndex + (filters.limit || pageSize);
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, filters.page, filters.limit, pageSize]);

  // Cargar clientes - DESHABILITADO TEMPORALMENTE
  const loadClients = useCallback(async () => {
    // DESHABILITADO - No hacer llamadas a API
    console.log('Carga de clientes deshabilitada temporalmente');
    setLoading(false);
    setError(null);
  }, []);

  // Cargar cliente específico
  const loadClient = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);

      logger.info(LogCategory.API, 'Cargando cliente específico', { clientId });

      const response: ClientApiResponse<Client> = await clientService.getClientById(clientId);
      
      // Actualizar el cliente en la lista si existe
      if (clientData?.clients) {
        const updatedClients = clientData.clients.map(client => 
          client.id === clientId ? response.data : client
        );
        
        setClientData({
          ...clientData,
          clients: updatedClients,
          selectedClient: response.data
        });
      }

      logger.info(LogCategory.API, 'Cliente cargado exitosamente', { clientId });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar cliente';
      setError(errorMessage);
      clientProfileLogger.error('Error al cargar cliente', { error: err, clientId });
    } finally {
      setLoading(false);
    }
  }, [clientData, setClientData]);

  // Actualizar cliente
  const updateClient = useCallback(async (clientId: string, updates: Partial<Client>) => {
    try {
      setLoading(true);
      setError(null);

      logger.info(LogCategory.API, 'Actualizando cliente', { clientId, updates });

      const response: ClientApiResponse<Client> = await clientService.updateClient(clientId, updates);
      
      // Actualizar el cliente en la lista
      if (clientData?.clients) {
        const updatedClients = clientData.clients.map(client => 
          client.id === clientId ? response.data : client
        );
        
        setClientData({
          ...clientData,
          clients: updatedClients,
          selectedClient: clientData.selectedClient?.id === clientId ? response.data : clientData.selectedClient
        });
      }

      logger.info(LogCategory.API, 'Cliente actualizado exitosamente', { clientId });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cliente';
      setError(errorMessage);
      clientProfileLogger.error('Error al actualizar cliente', { error: err, clientId, updates });
    } finally {
      setLoading(false);
    }
  }, [clientData, setClientData]);

  // Crear cliente
  const createClient = useCallback(async (newClientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);

      logger.info(LogCategory.API, 'Creando nuevo cliente', { clientData: newClientData });

      const response: ClientApiResponse<Client> = await clientService.createClient(newClientData);
      
      // Agregar el nuevo cliente a la lista
      if (clientData?.clients) {
        setClientData({
          ...clientData,
          clients: [response.data, ...clientData.clients]
        });
      }

      logger.info(LogCategory.API, 'Cliente creado exitosamente', { clientId: response.data.id });

      return response.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cliente';
      setError(errorMessage);
      clientProfileLogger.error('Error al crear cliente', { error: err, clientData: newClientData });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clientData, setClientData]);

  // Eliminar cliente
  const deleteClient = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);

      logger.info(LogCategory.API, 'Eliminando cliente', { clientId });

      await clientService.deleteClient(clientId);
      
      // Remover el cliente de la lista
      if (clientData?.clients) {
        const updatedClients = clientData.clients.filter(client => client.id !== clientId);
        
        setClientData({
          ...clientData,
          clients: updatedClients,
          selectedClient: clientData.selectedClient?.id === clientId ? null : clientData.selectedClient
        });
      }

      logger.info(LogCategory.API, 'Cliente eliminado exitosamente', { clientId });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar cliente';
      setError(errorMessage);
      clientProfileLogger.error('Error al eliminar cliente', { error: err, clientId });
    } finally {
      setLoading(false);
    }
  }, [clientData, setClientData]);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<ClientFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Resetear a la primera página cuando cambian los filtros
    }));
  }, []);

  // Cambiar página
  const changePage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  // Cambiar tamaño de página
  const changePageSize = useCallback((limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  // Ordenar
  const sort = useCallback((sortBy: ClientFilters['sortBy'], sortOrder: 'asc' | 'desc' = 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }, [pageSize]);

  // Cargar clientes automáticamente al montar el hook - DESHABILITADO TEMPORALMENTE
  useEffect(() => {
    if (autoLoad) {
      // DESHABILITADO - No cargar automáticamente
      console.log('Auto-load de clientes deshabilitado temporalmente');
    }
  }, [autoLoad]);

  // Verificar si hay filtros activos
  const hasFilters = useMemo(() => {
    return !!(
      filters.search ||
      (filters.stages && filters.stages.length > 0) ||
      (filters.agents && filters.agents.length > 0) ||
      (filters.statuses && filters.statuses.length > 0) ||
      (filters.tags && filters.tags.length > 0) ||
      (filters.sources && filters.sources.length > 0) ||
      (filters.segments && filters.segments.length > 0) ||
      filters.aiScoreMin !== undefined ||
      filters.aiScoreMax !== undefined ||
      filters.valueMin !== undefined ||
      filters.valueMax !== undefined ||
      filters.probabilityMin !== undefined ||
      filters.probabilityMax !== undefined ||
      filters.createdAfter ||
      filters.createdBefore
    );
  }, [filters]);

  return {
    // Estado
    clients: paginatedClients,
    loading: loading || clientData?.loading || false,
    error: error || clientData?.error,
    totalClients: filteredClients.length,
    
    // Filtros y paginación
    filters,
    pagination: {
      page: filters.page || 1,
      limit: filters.limit || pageSize,
      total: filteredClients.length,
      totalPages: Math.ceil(filteredClients.length / (filters.limit || pageSize))
    },
    
    // Acciones
    loadClients,
    loadClient,
    updateClient,
    createClient,
    deleteClient,
    updateFilters,
    changePage,
    changePageSize,
    sort,
    clearFilters,
    
    // Utilidades
    hasFilters,
    filteredClients
  };
}; 