// Hook de analíticas y reportes

import { useState, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import type { 
  ProjectMetrics,
  ProjectHealth,
  PredictiveAnalytics,
  ProjectTrends,
  ProjectReport 
} from '../types';

export const useAnalytics = (projectId: string) => {
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [health, setHealth] = useState<ProjectHealth | null>(null);
  const [predictions, setPredictions] = useState<PredictiveAnalytics | null>(null);
  const [trends, setTrends] = useState<ProjectTrends | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas
  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedMetrics = await analyticsService.getMetrics(projectId);
      setMetrics(fetchedMetrics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar métricas';
      setError(errorMessage);
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Cargar health score
  const loadHealth = useCallback(async () => {
    try {
      const fetchedHealth = await analyticsService.getProjectHealth(projectId);
      setHealth(fetchedHealth);
    } catch (err) {
      console.error('Error loading health:', err);
      throw err;
    }
  }, [projectId]);

  // Cargar predicciones
  const loadPredictions = useCallback(async () => {
    try {
      const fetchedPredictions = await analyticsService.getPredictions(projectId);
      setPredictions(fetchedPredictions);
    } catch (err) {
      console.error('Error loading predictions:', err);
      throw err;
    }
  }, [projectId]);

  // Cargar tendencias
  const loadTrends = useCallback(async (options?: {
    metrics?: string[];
    periodDays?: number;
  }) => {
    try {
      const fetchedTrends = await analyticsService.getTrends(projectId, options);
      setTrends(fetchedTrends);
    } catch (err) {
      console.error('Error loading trends:', err);
      throw err;
    }
  }, [projectId]);

  // Generar reporte
  const generateReport = useCallback(async (
    type: 'status' | 'financial' | 'time' | 'resource' | 'quality' | 'risk' | 'executive',
    options?: any
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const report = await analyticsService.generateReport(projectId, type, options);
      
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar reporte';
      setError(errorMessage);
      console.error('Error generating report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Exportar reporte
  const exportReport = useCallback(async (
    reportId: string,
    format: 'pdf' | 'excel' | 'csv' | 'json'
  ) => {
    try {
      const blob = await analyticsService.exportReport(projectId, reportId, format);
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting report:', err);
      throw err;
    }
  }, [projectId]);

  // Cargar todo (dashboard completo)
  const loadDashboard = useCallback(async () => {
    await Promise.all([
      loadMetrics(),
      loadHealth(),
      loadTrends(),
    ]);
  }, [loadMetrics, loadHealth, loadTrends]);

  return {
    // Estado
    metrics,
    health,
    predictions,
    trends,
    loading,
    error,
    
    // Acciones
    loadMetrics,
    loadHealth,
    loadPredictions,
    loadTrends,
    generateReport,
    exportReport,
    loadDashboard,
  };
};

