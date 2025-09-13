import { useState, useEffect, useCallback } from 'react';
import { extrasService, MovementRecord, AttendanceMetrics, MovementsSummary } from '../services/extrasService';

export interface UseExtrasOptions {
  employeeId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseExtrasReturn {
  // Estados
  loading: boolean;
  error: string | null;
  
  // Datos
  metrics: AttendanceMetrics | null;
  movements: MovementRecord[];
  summary: MovementsSummary | null;
  
  // Acciones
  refreshData: () => Promise<void>;
  registerMovement: (movementData: any) => Promise<MovementRecord>;
  updateMovement: (movementId: string, updateData: any) => Promise<MovementRecord>;
  deleteMovement: (movementId: string) => Promise<void>;
  approveMovement: (movementId: string, comments?: string) => Promise<MovementRecord>;
  rejectMovement: (movementId: string, reason: string) => Promise<MovementRecord>;
  exportData: (startDate: string, endDate: string) => Promise<void>;
}

export const useExtras = (options: UseExtrasOptions): UseExtrasReturn => {
  const { employeeId, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AttendanceMetrics | null>(null);
  const [movements, setMovements] = useState<MovementRecord[]>([]);
  const [summary, setSummary] = useState<MovementsSummary | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todos los datos en paralelo
      const [metricsData, movementsData, summaryData] = await Promise.all([
        extrasService.getAttendanceMetrics(employeeId),
        extrasService.getMovements(employeeId),
        extrasService.getMovementsSummary(employeeId)
      ]);

      setMetrics(metricsData);
      setMovements(movementsData);
      setSummary(summaryData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando datos de extras';
      setError(errorMessage);
      console.error('Error en useExtras:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const registerMovement = useCallback(async (movementData: any): Promise<MovementRecord> => {
    try {
      setError(null);
      const result = await extrasService.registerMovement(employeeId, movementData);
      
      // Actualizar datos localmente para UI inmediata
      setMovements(prev => [result, ...prev]);
      
      // Refrescar datos completos
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error registrando movimiento';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  const updateMovement = useCallback(async (movementId: string, updateData: any): Promise<MovementRecord> => {
    try {
      setError(null);
      const result = await extrasService.updateMovement(employeeId, movementId, updateData);
      
      // Actualizar datos localmente
      setMovements(prev => prev.map(m => m.id === movementId ? result : m));
      
      // Refrescar datos completos
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando movimiento';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  const deleteMovement = useCallback(async (movementId: string): Promise<void> => {
    try {
      setError(null);
      await extrasService.deleteMovement(employeeId, movementId);
      
      // Actualizar datos localmente
      setMovements(prev => prev.filter(m => m.id !== movementId));
      
      // Refrescar datos completos
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando movimiento';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  const approveMovement = useCallback(async (movementId: string, comments?: string): Promise<MovementRecord> => {
    try {
      setError(null);
      const result = await extrasService.approveMovement(movementId, employeeId, comments);
      
      // Actualizar datos localmente
      setMovements(prev => prev.map(m => m.id === movementId ? result : m));
      
      // Refrescar datos completos
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error aprobando movimiento';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  const rejectMovement = useCallback(async (movementId: string, reason: string): Promise<MovementRecord> => {
    try {
      setError(null);
      const result = await extrasService.rejectMovement(movementId, employeeId, reason);
      
      // Actualizar datos localmente
      setMovements(prev => prev.map(m => m.id === movementId ? result : m));
      
      // Refrescar datos completos
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error rechazando movimiento';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  const exportData = useCallback(async (startDate: string, endDate: string): Promise<void> => {
    try {
      setError(null);
      const blob = await extrasService.exportMovements(employeeId, startDate, endDate, 'excel');
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extras-${employeeId}-${startDate}-${endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando datos';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId]);

  // Cargar datos iniciales
  useEffect(() => {
    if (employeeId) {
      refreshData();
    }
  }, [employeeId, refreshData]);

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (autoRefresh && employeeId) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshData, employeeId]);

  return {
    loading,
    error,
    metrics,
    movements,
    summary,
    refreshData,
    registerMovement,
    updateMovement,
    deleteMovement,
    approveMovement,
    rejectMovement,
    exportData
  };
};

export default useExtras;
