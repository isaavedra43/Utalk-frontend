// ============================================================================
// HOOK PARA DASHBOARD DE ASISTENCIA
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../attendanceService';

export interface DashboardData {
  date: string;
  currentReport: any | null;
  currentStats: {
    presentCount: number;
    absentCount: number;
    lateCount: number;
  };
  generalStats: {
    attendanceRate: number;
    totalHours: number;
  };
  recentReports: any[];
  alerts: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export const useAttendanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (date?: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await attendanceService.getDashboard(date);
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando dashboard');
      console.error('Error loading attendance dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(() => {
    if (dashboardData?.date) {
      loadDashboard(dashboardData.date);
    } else {
      loadDashboard();
    }
  }, [dashboardData?.date, loadDashboard]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    dashboardData,
    loading,
    error,
    loadDashboard,
    refreshDashboard
  };
};
