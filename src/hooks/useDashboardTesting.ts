import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboard';
import { useAppStore } from '../stores/useAppStore';
import { generateDynamicMockData } from '../utils/mockDashboardData';
import type { DashboardData, DashboardFilters } from '../types/dashboard';

export const useDashboardTesting = () => {
  const { 
    dashboardData, 
    dashboardLoading, 
    dashboardError, 
    setDashboardData, 
    setDashboardLoading, 
    setDashboardError 
  } = useAppStore();

  const [testMode, setTestMode] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Función para cargar datos del dashboard
  const loadDashboardData = useCallback(async (filters?: DashboardFilters) => {
    try {
      setDashboardLoading(true);
      setDashboardError(null);
      
      const data = await dashboardService.getDashboardData(filters);
      setDashboardData(data);
    } catch (error) {
      setDashboardError('Error al cargar los datos del dashboard');
      console.error('Error loading dashboard data:', error);
    }
  }, [setDashboardData, setDashboardLoading, setDashboardError]);

  // Función para generar datos dinámicos (testing)
  const generateTestData = useCallback(() => {
    const testData = generateDynamicMockData();
    setDashboardData(testData);
  }, [setDashboardData]);

  // Función para simular actualizaciones en tiempo real
  const startRealTimeUpdates = useCallback((intervalMs: number = 5000) => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    const interval = setInterval(() => {
      generateTestData();
    }, intervalMs);

    setRefreshInterval(interval);
  }, [refreshInterval, generateTestData]);

  // Función para detener actualizaciones en tiempo real
  const stopRealTimeUpdates = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [refreshInterval]);

  // Función para alternar entre datos mock y reales
  const toggleDataMode = useCallback((useMock: boolean) => {
    dashboardService.setUseMockData(useMock);
    loadDashboardData();
  }, [loadDashboardData]);

  // Función para simular errores
  const simulateError = useCallback(() => {
    setDashboardError('Error simulado para testing');
  }, [setDashboardError]);

  // Función para simular loading
  const simulateLoading = useCallback(() => {
    setDashboardLoading(true);
    setTimeout(() => {
      setDashboardLoading(false);
    }, 2000);
  }, [setDashboardLoading]);

  // Función para resetear datos
  const resetData = useCallback(() => {
    setDashboardData(null);
    setDashboardError(null);
  }, [setDashboardData, setDashboardError]);

  // Función para aplicar filtros de prueba
  const applyTestFilters = useCallback((filters: DashboardFilters) => {
    loadDashboardData(filters);
  }, [loadDashboardData]);

  // Función para validar estructura de datos
  const validateDataStructure = useCallback((data: DashboardData) => {
    const requiredFields = [
      'header',
      'metrics',
      'sentimentAnalysis',
      'agentRanking',
      'dailyActivity',
      'themesAlerts',
      'activityCalendar',
      'aiInsights',
      'lastUpdated'
    ];

    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      console.error('Campos faltantes en datos del dashboard:', missingFields);
      return false;
    }

    return true;
  }, []);

  // Función para verificar responsividad
  const testResponsiveness = useCallback(() => {
    const breakpoints = [
      { width: 320, height: 568, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop' },
      { width: 1920, height: 1080, name: 'Large Desktop' }
    ];

    breakpoints.forEach(({ width, height, name }) => {
      console.log(`Testing ${name}: ${width}x${height}`);
      // Aquí se podrían agregar tests específicos de responsividad
    });
  }, []);

  // Función para verificar rendimiento
  const testPerformance = useCallback(() => {
    const startTime = performance.now();
    
    // Simular operaciones pesadas
    for (let i = 0; i < 1000; i++) {
      generateDynamicMockData();
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Performance test: ${duration.toFixed(2)}ms`);
    return duration;
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  return {
    // Estado
    dashboardData,
    dashboardLoading,
    dashboardError,
    testMode,
    refreshInterval: refreshInterval !== null,

    // Funciones principales
    loadDashboardData,
    generateTestData,
    resetData,

    // Funciones de testing
    startRealTimeUpdates,
    stopRealTimeUpdates,
    toggleDataMode,
    simulateError,
    simulateLoading,
    applyTestFilters,
    validateDataStructure,
    testResponsiveness,
    testPerformance,

    // Control de modo de testing
    setTestMode
  };
}; 