import { useState, useEffect, useCallback } from 'react';
import { infoLog } from '../../../config/logger';
import { useClientStore } from '../../../stores/useClientStore';
import { clientMetricsService } from '../services/clientMetricsService';
import { logger, LogCategory } from '../../../utils/logger';

interface UseClientMetricsOptions {
  autoLoad?: boolean;
  refreshInterval?: number; // en milisegundos
}

export const useClientMetrics = (options: UseClientMetricsOptions = {}) => {
  const {
    autoLoad = true,
    refreshInterval = 30000 // 30 segundos por defecto
  } = options;

  const { clientData, setClientData } = useClientStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // ✅ CARGAR MÉTRICAS - HABILITADO
  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      infoLog('Cargando métricas de clientes');

      const metrics = await clientMetricsService.getClientMetrics();
      
      // Actualizar métricas en el store
      setClientData({
        ...clientData,
        metrics,
        clients: clientData?.clients || [],
        selectedClient: clientData?.selectedClient || null,
        filters: clientData?.filters || { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' },
        activities: clientData?.activities || {},
        deals: clientData?.deals || {},
        recommendations: clientData?.recommendations || {},
        loading: clientData?.loading || false,
        loadingActivities: clientData?.loadingActivities || false,
        loadingDeals: clientData?.loadingDeals || false,
        error: clientData?.error || null,
        showFilters: clientData?.showFilters || false,
        showDetailPanel: clientData?.showDetailPanel || false,
        currentView: clientData?.currentView || 'list',
        currentTab: clientData?.currentTab || 'perfil',
        pagination: clientData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
      });

      setLastUpdated(new Date());
      infoLog('Métricas de clientes cargadas exitosamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar métricas';
      setError(errorMessage);
      infoLog('Error al cargar métricas de clientes', { error: err });
    } finally {
      setLoading(false);
    }
  }, [clientData, setClientData]);

  // Refrescar métricas
  const refreshMetrics = useCallback(async () => {
    await loadMetrics();
  }, [loadMetrics]);

  // Cargar métricas específicas
  const loadWinRateMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info(LogCategory.API, 'Cargando métricas de win rate');

      const winRateMetrics = await clientMetricsService.getWinRateMetrics();
      
      // Actualizar solo las métricas de win rate en el store
      if (clientData?.metrics) {
        setClientData({
          ...clientData,
          metrics: {
            ...clientData.metrics,
            winRate: winRateMetrics.winRate,
            trends: {
              ...clientData.metrics.trends,
              winRateChange: winRateMetrics.winRateChange
            }
          },
          clients: clientData?.clients || [],
          selectedClient: clientData?.selectedClient || null,
          filters: clientData?.filters || { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' },
          activities: clientData?.activities || {},
          deals: clientData?.deals || {},
          recommendations: clientData?.recommendations || {},
          loading: clientData?.loading || false,
          loadingActivities: clientData?.loadingActivities || false,
          loadingDeals: clientData?.loadingDeals || false,
          error: clientData?.error || null,
          showFilters: clientData?.showFilters || false,
          showDetailPanel: clientData?.showDetailPanel || false,
          currentView: clientData?.currentView || 'list',
          currentTab: clientData?.currentTab || 'perfil',
          pagination: clientData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
        });
      }

      setLastUpdated(new Date());

      logger.info(LogCategory.API, 'Métricas de win rate cargadas exitosamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar métricas de win rate';
      setError(errorMessage);
      
      logger.error(LogCategory.API, 'Error al cargar métricas de win rate', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [clientData, setClientData]);

  const loadContactMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info(LogCategory.API, 'Cargando métricas de contactos');

      const contactMetrics = await clientMetricsService.getContactMetrics();
      
      // Actualizar solo las métricas de contacto en el store
      if (clientData?.metrics) {
        setClientData({
          ...clientData,
          metrics: {
            ...clientData.metrics,
            contactsToContactToday: contactMetrics.contactsToContactToday,
            averageDaysToClose: contactMetrics.averageDaysToClose
          },
          clients: clientData?.clients || [],
          selectedClient: clientData?.selectedClient || null,
          filters: clientData?.filters || { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' },
          activities: clientData?.activities || {},
          deals: clientData?.deals || {},
          recommendations: clientData?.recommendations || {},
          loading: clientData?.loading || false,
          loadingActivities: clientData?.loadingActivities || false,
          loadingDeals: clientData?.loadingDeals || false,
          error: clientData?.error || null,
          showFilters: clientData?.showFilters || false,
          showDetailPanel: clientData?.showDetailPanel || false,
          currentView: clientData?.currentView || 'list',
          currentTab: clientData?.currentTab || 'perfil',
          pagination: clientData?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
        });
      }

      setLastUpdated(new Date());

      logger.info(LogCategory.API, 'Métricas de contactos cargadas exitosamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar métricas de contactos';
      setError(errorMessage);
      
      logger.error(LogCategory.API, 'Error al cargar métricas de contactos', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [clientData, setClientData]);

  // ✅ CARGAR MÉTRICAS AUTOMÁTICAMENTE - HABILITADO
  useEffect(() => {
    if (autoLoad) {
      loadMetrics();
    }
  }, [autoLoad, loadMetrics]);

  // ✅ CONFIGURAR INTERVALO DE ACTUALIZACIÓN - HABILITADO
  useEffect(() => {
    if (autoLoad && refreshInterval > 0) {
      const interval = setInterval(() => {
        loadMetrics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoLoad, refreshInterval, loadMetrics]);

  // Calcular KPIs derivados
  const calculatedKPIs = {
    // KPIs principales
    totalClients: clientData?.metrics?.totalClients || 0,
    totalValue: clientData?.metrics?.totalValue || 0,
    totalOpportunities: clientData?.metrics?.totalOpportunities || 0,
    contactsToContactToday: clientData?.metrics?.contactsToContactToday || 0,
    averageDaysToClose: clientData?.metrics?.averageDaysToClose || 0,
    winRate: clientData?.metrics?.winRate || 0,
    projectedRevenue: clientData?.metrics?.projectedRevenue || 0,

    // KPIs formateados
    formattedTotalValue: new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(clientData?.metrics?.totalValue || 0),

    formattedProjectedRevenue: new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(clientData?.metrics?.projectedRevenue || 0),

    formattedWinRate: `${(clientData?.metrics?.winRate || 0).toFixed(0)}%`,
    formattedAverageDays: `${(clientData?.metrics?.averageDaysToClose || 0)}d promedio`,

    // Métricas por etapa
    stageMetrics: clientData?.metrics?.stageMetrics || {
      lead: { count: 0, value: 0, averageProbability: 0 },
      prospect: { count: 0, value: 0, averageProbability: 0 },
      demo: { count: 0, value: 0, averageProbability: 0 },
      propuesta: { count: 0, value: 0, averageProbability: 0 },
      negociacion: { count: 0, value: 0, averageProbability: 0 },
      ganado: { count: 0, value: 0, averageProbability: 0 },
      perdido: { count: 0, value: 0, averageProbability: 0 }
    },

    // Métricas por agente
    agentMetrics: clientData?.metrics?.agentMetrics || {},

    // Métricas por fuente
    sourceMetrics: clientData?.metrics?.sourceMetrics || {},

    // Métricas por segmento
    segmentMetrics: clientData?.metrics?.segmentMetrics || {},

    // Tendencias
    trends: clientData?.metrics?.trends || {
      newClientsThisMonth: 0,
      newClientsLastMonth: 0,
      valueGrowth: 0,
      winRateChange: 0
    }
  };

  return {
    // Estado
    metrics: clientData?.metrics,
    loading: loading || clientData?.loadingMetrics || false,
    error: error || clientData?.metricsError,
    lastUpdated,
    
    // KPIs calculados
    kpis: calculatedKPIs,
    
    // Acciones
    loadMetrics,
    refreshMetrics,
    loadWinRateMetrics,
    loadContactMetrics,
    
    // Utilidades
    hasMetrics: !!clientData?.metrics,
    isStale: lastUpdated ? (Date.now() - lastUpdated.getTime()) > (refreshInterval * 2) : true
  };
}; 