import { useState, useEffect, useCallback, useMemo } from 'react';
import { clientService } from '../services/clientService';
import { useClientStore } from '../../../stores/useClientStore';
import type { Client, ClientFilters } from '../../../types/client';
import { infoLog } from '../../../config/logger';

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

  const { clientData, setClientData } = useClientStore();
  
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

  // ✅ FILTRAR Y PAGINAR CLIENTES
  const filtered = useMemo(() => {
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

  // ✅ CARGAR CLIENTES - HABILITADO
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      infoLog('Cargando clientes desde API', { filters });

      const response = await clientService.getClients(filters);
      
      // Actualizar el store con los nuevos datos
      setClientData({
        clients: response.data,
        pagination: response.pagination,
        metrics: clientData?.metrics || null,
        selectedClient: clientData?.selectedClient || null,
        filters: filters,
        activities: clientData?.activities || {},
        deals: clientData?.deals || {},
        recommendations: clientData?.recommendations || {},
        loading: false,
        loadingActivities: clientData?.loadingActivities || false,
        loadingDeals: clientData?.loadingDeals || false,
        error: null,
        showFilters: clientData?.showFilters || false,
        showDetailPanel: clientData?.showDetailPanel || false,
        currentView: clientData?.currentView || 'list',
        currentTab: clientData?.currentTab || 'perfil'
      });

      infoLog('Clientes cargados exitosamente', { 
        count: response.data.length,
        total: response.pagination.total 
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar clientes';
      setError(errorMessage);
      infoLog('Error al cargar clientes', { error: err, filters });
    } finally {
      setLoading(false);
    }
  }, [filters, clientData, setClientData]);

  // ✅ CARGAR CLIENTE ESPECÍFICO - API REAL
  const loadClient = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);

      infoLog('Cargando cliente específico desde API', { clientId });

      const client = await clientService.getClientById(clientId);
      
      // Actualizar el cliente en la lista si existe
      if (clientData?.clients) {
        const updatedClients = clientData.clients.map(c => 
          c.id === clientId ? client : c
        );
        
        setClientData({
          ...clientData,
          clients: updatedClients,
          selectedClient: client
        });
      }

      infoLog('Cliente cargado exitosamente', { clientId });
      return client;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar cliente';
      setError(errorMessage);
      infoLog('Error al cargar cliente', { error: err, clientId });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clientData, setClientData]);

  // ✅ ACTUALIZAR CLIENTE - API REAL
  const updateClient = useCallback(async (clientId: string, updates: Partial<Client>) => {
    try {
      setLoading(true);
      setError(null);

      infoLog('Actualizando cliente en API', { clientId, updates });

      const updatedClient = await clientService.updateClient(clientId, updates);
      
      // Actualizar el cliente en la lista
      if (clientData?.clients) {
        const updatedClients = clientData.clients.map(client => 
          client.id === clientId ? updatedClient : client
        );
        
        setClientData({
          ...clientData,
          clients: updatedClients,
          selectedClient: clientData.selectedClient?.id === clientId ? updatedClient : clientData.selectedClient
        });
      }

      infoLog('Cliente actualizado exitosamente', { clientId });
      return updatedClient;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cliente';
      setError(errorMessage);
      infoLog('Error al actualizar cliente', { error: err, clientId, updates });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clientData, setClientData]);

  // ✅ CREAR CLIENTE - API REAL
  const createClient = useCallback(async (newClientData: Partial<Client>) => {
    try {
      setLoading(true);
      setError(null);

      infoLog('Creando nuevo cliente en API', { clientData: newClientData });

      const newClient = await clientService.createClient(newClientData);
      
      // Agregar el nuevo cliente a la lista
      if (clientData?.clients) {
        setClientData({
          ...clientData,
          clients: [newClient, ...clientData.clients]
        });
      }

      infoLog('Cliente creado exitosamente', { clientId: newClient.id });
      return newClient;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cliente';
      setError(errorMessage);
      infoLog('Error al crear cliente', { error: err, clientData: newClientData });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clientData, setClientData]);

  // ✅ ELIMINAR CLIENTE - API REAL
  const deleteClient = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);

      infoLog('Eliminando cliente en API', { clientId });

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

      infoLog('Cliente eliminado exitosamente', { clientId });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar cliente';
      setError(errorMessage);
      infoLog('Error al eliminar cliente', { error: err, clientId });
      throw err;
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

  // ✅ CARGAR CLIENTES AUTOMÁTICAMENTE - HABILITADO (OPTIMIZADO)
  useEffect(() => {
    if (autoLoad) {
      loadClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  // ✅ RECARGAR CUANDO CAMBIEN LOS FILTROS (OPTIMIZADO)
  useEffect(() => {
    if (autoLoad) {
      loadClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search, 
    filters.stages, 
    filters.agents, 
    filters.sources, 
    filters.segments,
    filters.aiScoreMin,
    filters.aiScoreMax,
    filters.valueMin,
    filters.valueMax,
    filters.probabilityMin,
    filters.probabilityMax,
    filters.page,
    filters.limit,
    filters.sortBy,
    filters.sortOrder,
    autoLoad
  ]);

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
    clients: clientData?.clients || [],
    loading: loading || clientData?.loading || false,
    error: error || clientData?.error,
    totalClients: clientData?.pagination?.total || 0,
    
    // Filtros y paginación
    filters,
    pagination: clientData?.pagination || {
      page: 1,
      limit: pageSize,
      total: 0,
      totalPages: 0
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
    filteredClients: clientData?.clients || []
  };
}; 