import { useState, useCallback, useMemo } from 'react';
import type { ClientFilters, ClientStage, ClientStatus, ClientSource, ClientSegment, ClientTag } from '../../../types/client';

interface UseClientFiltersOptions {
  initialFilters?: Partial<ClientFilters>;
  onFiltersChange?: (filters: ClientFilters) => void;
}

export const useClientFilters = (options: UseClientFiltersOptions = {}) => {
  const { initialFilters = {}, onFiltersChange } = options;

  const [filters, setFilters] = useState<ClientFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });

  // Opciones de filtros disponibles
  const filterOptions = useMemo(() => ({
    stages: [
      { value: 'lead', label: 'Lead' },
      { value: 'prospect', label: 'Prospect' },
      { value: 'demo', label: 'Demo' },
      { value: 'propuesta', label: 'Propuesta' },
      { value: 'negociacion', label: 'Negociación' },
      { value: 'ganado', label: 'Ganado' },
      { value: 'perdido', label: 'Perdido' }
    ] as const,

    statuses: [
      { value: 'won', label: 'Ganado' },
      { value: 'lost', label: 'Perdido' },
      { value: 'pending', label: 'Pendiente' },
      { value: 'active', label: 'Activo' },
      { value: 'inactive', label: 'Inactivo' },
      { value: 'prospect', label: 'Prospecto' }
    ] as const,

    sources: [
      { value: 'facebook', label: 'Facebook' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'website', label: 'Sitio Web' },
      { value: 'referral', label: 'Referido' },
      { value: 'cold_call', label: 'Llamada Fría' },
      { value: 'event', label: 'Evento' },
      { value: 'advertising', label: 'Publicidad' }
    ] as const,

    segments: [
      { value: 'startup', label: 'Startup' },
      { value: 'sme', label: 'PYME' },
      { value: 'enterprise', label: 'Enterprise' },
      { value: 'freelancer', label: 'Freelancer' },
      { value: 'agency', label: 'Agencia' }
    ] as const,

    tags: [
      { value: 'VIP', label: 'VIP' },
      { value: 'Empresa', label: 'Empresa' },
      { value: 'Startup', label: 'Startup' },
      { value: 'Premium', label: 'Premium' },
      { value: 'Hot Lead', label: 'Hot Lead' },
      { value: 'Cold Lead', label: 'Cold Lead' }
    ] as const,

    agents: [
      { value: 'admin@company.com', label: 'PS Pedro Sánchez' },
      { value: 'maria@company.com', label: 'MG María González' },
      { value: 'carlos@company.com', label: 'CR Carlos Ruiz' },
      { value: 'ana@company.com', label: 'AM Ana Martín' },
      { value: 'elena@company.com', label: 'ET Elena Torres' }
    ] as const,

    sortOptions: [
      { value: 'name', label: 'Nombre' },
      { value: 'company', label: 'Empresa' },
      { value: 'value', label: 'Valor' },
      { value: 'probability', label: 'Probabilidad' },
      { value: 'score', label: 'Score' },
      { value: 'createdAt', label: 'Fecha de Creación' },
      { value: 'lastContact', label: 'Último Contacto' }
    ] as const
  }), []);

  // Actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<ClientFilters>) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        ...newFilters,
        page: 1 // Resetear a la primera página cuando cambian los filtros
      };
      
      // Notificar cambio de filtros
      if (onFiltersChange) {
        onFiltersChange(updated);
      }
      
      return updated;
    });
  }, [onFiltersChange]);

  // Actualizar búsqueda
  const updateSearch = useCallback((search: string) => {
    updateFilters({ search: search.trim() || undefined });
  }, [updateFilters]);

  // Actualizar filtros por etapa
  const updateStageFilters = useCallback((stages: ClientStage[]) => {
    updateFilters({ stages: stages.length > 0 ? stages : undefined });
  }, [updateFilters]);

  // Actualizar filtros por agente
  const updateAgentFilters = useCallback((agents: string[]) => {
    updateFilters({ agents: agents.length > 0 ? agents : undefined });
  }, [updateFilters]);

  // Actualizar filtros por score de IA
  const updateAIScoreFilters = useCallback((min?: number, max?: number) => {
    updateFilters({ 
      aiScoreMin: min,
      aiScoreMax: max
    });
  }, [updateFilters]);

  // Actualizar filtros por valor
  const updateValueFilters = useCallback((min?: number, max?: number) => {
    updateFilters({ 
      valueMin: min,
      valueMax: max
    });
  }, [updateFilters]);

  // Actualizar filtros por probabilidad
  const updateProbabilityFilters = useCallback((min?: number, max?: number) => {
    updateFilters({ 
      probabilityMin: min,
      probabilityMax: max
    });
  }, [updateFilters]);

  // Actualizar filtros por estado
  const updateStatusFilters = useCallback((statuses: ClientStatus[]) => {
    updateFilters({ statuses: statuses.length > 0 ? statuses : undefined });
  }, [updateFilters]);

  // Actualizar filtros por etiquetas
  const updateTagFilters = useCallback((tags: ClientTag[]) => {
    updateFilters({ tags: tags.length > 0 ? tags : undefined });
  }, [updateFilters]);

  // Actualizar filtros por fuente
  const updateSourceFilters = useCallback((sources: ClientSource[]) => {
    updateFilters({ sources: sources.length > 0 ? sources : undefined });
  }, [updateFilters]);

  // Actualizar filtros por segmento
  const updateSegmentFilters = useCallback((segments: ClientSegment[]) => {
    updateFilters({ segments: segments.length > 0 ? segments : undefined });
  }, [updateFilters]);

  // Actualizar filtros por fecha
  const updateDateFilters = useCallback((createdAfter?: Date, createdBefore?: Date) => {
    updateFilters({ 
      createdAfter,
      createdBefore
    });
  }, [updateFilters]);

  // Actualizar ordenamiento
  const updateSorting = useCallback((sortBy: ClientFilters['sortBy'], sortOrder: 'asc' | 'desc' = 'desc') => {
    updateFilters({ sortBy, sortOrder });
  }, [updateFilters]);

  // Cambiar página
  const changePage = useCallback((page: number) => {
    setFilters(prev => {
      const updated = { ...prev, page };
      
      if (onFiltersChange) {
        onFiltersChange(updated);
      }
      
      return updated;
    });
  }, [onFiltersChange]);

  // Cambiar tamaño de página
  const changePageSize = useCallback((limit: number) => {
    updateFilters({ limit, page: 1 });
  }, [updateFilters]);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    const clearedFilters: ClientFilters = {
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    
    setFilters(clearedFilters);
    
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  }, [onFiltersChange]);

  // Limpiar filtros específicos
  const clearSearch = useCallback(() => {
    updateFilters({ search: undefined });
  }, [updateFilters]);

  const clearStageFilters = useCallback(() => {
    updateFilters({ stages: undefined });
  }, [updateFilters]);

  const clearAgentFilters = useCallback(() => {
    updateFilters({ agents: undefined });
  }, [updateFilters]);

  const clearAIScoreFilters = useCallback(() => {
    updateFilters({ aiScoreMin: undefined, aiScoreMax: undefined });
  }, [updateFilters]);

  const clearValueFilters = useCallback(() => {
    updateFilters({ valueMin: undefined, valueMax: undefined });
  }, [updateFilters]);

  const clearProbabilityFilters = useCallback(() => {
    updateFilters({ probabilityMin: undefined, probabilityMax: undefined });
  }, [updateFilters]);

  const clearStatusFilters = useCallback(() => {
    updateFilters({ statuses: undefined });
  }, [updateFilters]);

  const clearTagFilters = useCallback(() => {
    updateFilters({ tags: undefined });
  }, [updateFilters]);

  const clearSourceFilters = useCallback(() => {
    updateFilters({ sources: undefined });
  }, [updateFilters]);

  const clearSegmentFilters = useCallback(() => {
    updateFilters({ segments: undefined });
  }, [updateFilters]);

  const clearDateFilters = useCallback(() => {
    updateFilters({ createdAfter: undefined, createdBefore: undefined });
  }, [updateFilters]);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof ClientFilters];
      return key !== 'page' && 
             key !== 'limit' && 
             key !== 'sortBy' && 
             key !== 'sortOrder' && 
             value !== undefined && 
             value !== null &&
             (Array.isArray(value) ? value.length > 0 : true);
    });
  }, [filters]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    
    if (filters.search) count++;
    if (filters.stages && filters.stages.length > 0) count++;
    if (filters.agents && filters.agents.length > 0) count++;
    if (filters.aiScoreMin !== undefined || filters.aiScoreMax !== undefined) count++;
    if (filters.valueMin !== undefined || filters.valueMax !== undefined) count++;
    if (filters.probabilityMin !== undefined || filters.probabilityMax !== undefined) count++;
    if (filters.statuses && filters.statuses.length > 0) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.sources && filters.sources.length > 0) count++;
    if (filters.segments && filters.segments.length > 0) count++;
    if (filters.createdAfter || filters.createdBefore) count++;
    
    return count;
  }, [filters]);

  // Obtener resumen de filtros activos
  const activeFiltersSummary = useMemo(() => {
    const summary: string[] = [];
    
    if (filters.search) summary.push(`Búsqueda: "${filters.search}"`);
    if (filters.stages && filters.stages.length > 0) summary.push(`Etapas: ${filters.stages.length}`);
    if (filters.agents && filters.agents.length > 0) summary.push(`Agentes: ${filters.agents.length}`);
    if (filters.aiScoreMin !== undefined || filters.aiScoreMax !== undefined) summary.push('Score IA');
    if (filters.valueMin !== undefined || filters.valueMax !== undefined) summary.push('Valor');
    if (filters.probabilityMin !== undefined || filters.probabilityMax !== undefined) summary.push('Probabilidad');
    if (filters.statuses && filters.statuses.length > 0) summary.push(`Estados: ${filters.statuses.length}`);
    if (filters.tags && filters.tags.length > 0) summary.push(`Etiquetas: ${filters.tags.length}`);
    if (filters.sources && filters.sources.length > 0) summary.push(`Fuentes: ${filters.sources.length}`);
    if (filters.segments && filters.segments.length > 0) summary.push(`Segmentos: ${filters.segments.length}`);
    if (filters.createdAfter || filters.createdBefore) summary.push('Fechas');
    
    return summary;
  }, [filters]);

  return {
    // Estado
    filters,
    
    // Opciones disponibles
    filterOptions,
    
    // Acciones de actualización
    updateFilters,
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
    updateSorting,
    changePage,
    changePageSize,
    
    // Acciones de limpieza
    clearFilters,
    clearSearch,
    clearStageFilters,
    clearAgentFilters,
    clearAIScoreFilters,
    clearValueFilters,
    clearProbabilityFilters,
    clearStatusFilters,
    clearTagFilters,
    clearSourceFilters,
    clearSegmentFilters,
    clearDateFilters,
    
    // Utilidades
    hasActiveFilters,
    activeFiltersCount,
    activeFiltersSummary
  };
}; 