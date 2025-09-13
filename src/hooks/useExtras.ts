import { useState, useEffect, useCallback } from 'react';
import { extrasService, MovementRecord, AttendanceMetrics, MovementsSummary } from '../services/extrasService';
import { logger } from '../utils/logger';

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

      // Calcular fechas por defecto (últimos 30 días)
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const endDate = today.toISOString().split('T')[0];
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      // Cargar todos los datos en paralelo
      const [metricsData, movementsData, summaryData] = await Promise.all([
        extrasService.getAttendanceMetrics(employeeId),
        extrasService.getMovements(employeeId),
        extrasService.getMovementsSummary(employeeId, startDate, endDate)
      ]);

      setMetrics(metricsData);
      setMovements(movementsData);
      setSummary(summaryData);
    } catch (err) {
      let errorMessage = 'Error cargando datos de extras';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Manejo específico de errores
        if (err.message.includes('400')) {
          errorMessage = 'Datos inválidos. Verifica la información del empleado.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Empleado no encontrado.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Error del servidor. Inténtalo de nuevo más tarde.';
        } else if (err.message.includes('Network Error') || err.message.includes('timeout')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        }
      }
      
      setError(errorMessage);
      logger.apiError('Error en useExtras', err as Error, {
        employeeId,
        context: 'refreshData'
      });
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const registerMovement = useCallback(async (movementData: any): Promise<MovementRecord> => {
    try {
      setError(null);
      
      // Validación de datos antes de enviar
      if (!movementData.type) {
        throw new Error('El tipo de movimiento es requerido');
      }
      
      if (!movementData.date) {
        throw new Error('La fecha es requerida');
      }
      
      if (!movementData.description?.trim()) {
        throw new Error('La descripción es requerida');
      }
      
      // Validar fecha no futura
      const movementDate = new Date(movementData.date);
      const today = new Date();
      if (movementDate > today) {
        throw new Error('La fecha no puede ser futura');
      }
      
      // Validaciones específicas por tipo
      if (movementData.type === 'overtime' && (!movementData.hours || movementData.hours <= 0)) {
        throw new Error('Las horas extra deben ser mayor a 0');
      }
      
      if (movementData.type === 'absence' && (!movementData.duration || movementData.duration <= 0)) {
        throw new Error('La duración de la ausencia debe ser mayor a 0');
      }
      
      if (movementData.type === 'loan' && (!movementData.totalAmount || movementData.totalAmount <= 0)) {
        throw new Error('El monto del préstamo debe ser mayor a 0');
      }
      
      const result = await extrasService.registerMovement(employeeId, movementData);
      
      // Actualizar datos localmente para UI inmediata
      setMovements(prev => [result, ...prev]);
      
      // Refrescar datos completos
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error registrando movimiento';
      setError(errorMessage);
      logger.apiError('Error en registerMovement', err as Error, {
        employeeId,
        movementData
      });
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
