// ============================================================================
// HOOK PARA MÉTRICAS DE ASISTENCIA
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../attendanceService';

export interface MetricsData {
  period: 'week' | 'month' | 'quarter';
  date: string;
  dateFrom: string;
  dateTo: string;
  metrics: {
    totalReports: number;
    totalEmployees: number;
    attendanceRate: number;
    averageHoursPerDay: number;
    overtimeHours: number;
  };
  trends: {
    attendanceRate: Array<{ date: string; value: number }>;
    overtimeHours: Array<{ date: string; value: number }>;
  };
}

export const useAttendanceMetrics = () => {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async (period: 'week' | 'month' | 'quarter' = 'month', date?: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await attendanceService.getMetrics(period, date);
      setMetricsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando métricas');
      console.error('Error loading attendance metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMetrics = useCallback(() => {
    if (metricsData) {
      loadMetrics(metricsData.period, metricsData.date);
    } else {
      loadMetrics();
    }
  }, [metricsData, loadMetrics]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metricsData,
    loading,
    error,
    loadMetrics,
    refreshMetrics
  };
};
