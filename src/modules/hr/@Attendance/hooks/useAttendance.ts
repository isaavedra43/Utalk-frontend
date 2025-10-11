// ============================================================================
// HOOKS PARA EL MÓDULO DE ASISTENCIA
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import { attendanceService } from '../attendanceService';
import { 
  AttendanceReport, 
  AttendanceFilters, 
  AttendanceStats, 
  ApprovalRequest, 
  AttendancePermissions 
} from '../types';
import { formatHours } from '@/utils/dateUtils';

export const useAttendance = () => {
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [permissions, setPermissions] = useState<AttendancePermissions | null>(null);

  // Cargar reportes de asistencia
  const loadReports = useCallback(async (filters: AttendanceFilters = {}, page = 1, limit = 20) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceService.listReports(filters, page, limit);
      setReports(response.reports);

      // Cargar estadísticas si no hay filtros específicos
      if (Object.keys(filters).length === 0) {
        const statsResponse = await attendanceService.getAttendanceStats();
        setStats(statsResponse);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar reportes';
      setError(errorMessage);
      console.error('Error cargando reportes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo reporte
  const createReport = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceService.createReport(data);

      if (response.success) {
        await loadReports(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear reporte';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReports]);

  // Actualizar reporte
  const updateReport = useCallback(async (reportId: string, data: Partial<AttendanceReport>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceService.updateReport(reportId, data);

      if (response.success) {
        await loadReports(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar reporte';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReports]);

  // Eliminar reporte
  const deleteReport = useCallback(async (reportId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceService.deleteReport(reportId);

      if (response.success) {
        await loadReports(); // Recargar lista
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar reporte';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReports]);

  // Aprobar o rechazar reporte
  const approveReport = useCallback(async (request: ApprovalRequest) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceService.approveReport(request);

      if (response.success) {
        await loadReports(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar reporte';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReports]);

  // Cargar permisos del usuario
  const loadPermissions = useCallback(async () => {
    try {
      const userPermissions = await attendanceService.getUserPermissions();
      setPermissions(userPermissions);
      return userPermissions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar permisos';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Generar reporte rápido
  const generateQuickReport = useCallback(async (date: string, template: 'normal' | 'weekend' | 'holiday' = 'normal') => {
    try {
      setLoading(true);
      setError(null);

      const quickReportData = await attendanceService.generateQuickReport(date, template);
      const response = await attendanceService.createReport(quickReportData);

      if (response.success) {
        await loadReports(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar reporte rápido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReports]);

  // Estadísticas calculadas
  const calculatedStats = useMemo(() => {
    if (!reports.length) return null;

    return {
      totalReports: reports.length,
      completedReports: reports.filter(r => r.status === 'completed').length,
      approvedReports: reports.filter(r => r.status === 'approved').length,
      totalEmployees: reports.reduce((sum, r) => sum + r.totalEmployees, 0),
      totalPresent: reports.reduce((sum, r) => sum + r.presentCount, 0),
      totalAbsent: reports.reduce((sum, r) => sum + r.absentCount, 0),
      totalOvertime: reports.reduce((sum, r) => sum + r.overtimeHours, 0),
      averageAttendanceRate: reports.length > 0 ?
        (reports.reduce((sum, r) => sum + (r.presentCount / r.totalEmployees), 0) / reports.length) * 100 : 0
    };
  }, [reports]);

  return {
    reports,
    loading,
    error,
    stats,
    permissions,
    calculatedStats,
    loadReports,
    createReport,
    updateReport,
    deleteReport,
    approveReport,
    loadPermissions,
    generateQuickReport,
    setError
  };
};
