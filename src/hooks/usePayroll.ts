// ===================================================================
// HOOKS PERSONALIZADOS PARA EL MÓDULO DE NÓMINA GENERAL
// ===================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PayrollPeriod, 
  PayrollEmployee, 
  PayrollFilters, 
  PayrollStats,
  PayrollBulkOperation 
} from '../types/payroll';
import payrollService from '../services/payrollService';
import { useNotifications } from '../contexts/NotificationContext';

// ===================================================================
// HOOK PRINCIPAL PARA GESTIÓN DE PERÍODOS
// ===================================================================

export const usePayrollPeriods = (initialPage = 1, initialLimit = 20) => {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<PayrollPeriod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  });

  const { showNotification } = useNotifications();

  // Cargar períodos
  const loadPeriods = useCallback(async (
    page = pagination.page,
    limit = pagination.limit,
    filters?: { status?: string; frequency?: string }
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando períodos de nómina...', { page, limit, filters });

      const response = await payrollService.getPeriods(page, limit, filters);
      
      setPeriods(response.periods);
      setPagination(response.pagination);

      console.log('✅ Períodos cargados:', response.periods.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar períodos';
      console.error('❌ Error cargando períodos:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, showNotification]);

  // Cargar período actual
  const loadCurrentPeriod = useCallback(async () => {
    try {
      console.log('🔄 Cargando período actual...');
      const period = await payrollService.getCurrentPeriod();
      setCurrentPeriod(period);
      console.log('✅ Período actual:', period?.name || 'No hay período activo');
    } catch (err) {
      console.error('❌ Error cargando período actual:', err);
      setCurrentPeriod(null);
    }
  }, []);

  // Crear período
  const createPeriod = useCallback(async (periodData: Partial<PayrollPeriod>) => {
    try {
      setLoading(true);
      console.log('🔄 Creando período...', periodData);

      const newPeriod = await payrollService.createPeriod(periodData);
      
      // Recargar lista
      await loadPeriods();
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Período creado exitosamente'
      });

      console.log('✅ Período creado:', newPeriod.name);
      return newPeriod;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear período';
      console.error('❌ Error creando período:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPeriods, showNotification]);

  // Procesar período
  const processPeriod = useCallback(async (periodId: string) => {
    try {
      setLoading(true);
      console.log('🔄 Procesando período...', periodId);

      const stats = await payrollService.processPeriod(periodId);
      
      // Recargar lista
      await loadPeriods();
      
      showNotification({
        type: 'success',
        title: 'Procesamiento Completado',
        message: `Se procesaron ${stats.processedEmployees} empleados exitosamente`
      });

      console.log('✅ Período procesado:', stats);
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar período';
      console.error('❌ Error procesando período:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error en Procesamiento',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPeriods, showNotification]);

  // Aprobar período
  const approvePeriod = useCallback(async (periodId: string) => {
    try {
      setLoading(true);
      console.log('🔄 Aprobando período...', periodId);

      const approvedPeriod = await payrollService.approvePeriod(periodId);
      
      // Recargar lista
      await loadPeriods();
      
      showNotification({
        type: 'success',
        title: 'Período Aprobado',
        message: 'El período ha sido aprobado exitosamente'
      });

      console.log('✅ Período aprobado:', approvedPeriod.name);
      return approvedPeriod;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar período';
      console.error('❌ Error aprobando período:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPeriods, showNotification]);

  // Marcar como pagado
  const markAsPaid = useCallback(async (periodId: string) => {
    try {
      setLoading(true);
      console.log('🔄 Marcando período como pagado...', periodId);

      const paidPeriod = await payrollService.markPeriodAsPaid(periodId);
      
      // Recargar lista
      await loadPeriods();
      
      showNotification({
        type: 'success',
        title: 'Período Pagado',
        message: 'El período ha sido marcado como pagado'
      });

      console.log('✅ Período marcado como pagado:', paidPeriod.name);
      return paidPeriod;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al marcar período como pagado';
      console.error('❌ Error marcando como pagado:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPeriods, showNotification]);

  // Eliminar período
  const deletePeriod = useCallback(async (periodId: string) => {
    try {
      setLoading(true);
      console.log('🔄 Eliminando período...', periodId);

      await payrollService.deletePeriod(periodId);
      
      // Recargar lista
      await loadPeriods();
      
      showNotification({
        type: 'success',
        title: 'Período Eliminado',
        message: 'El período ha sido eliminado exitosamente'
      });

      console.log('✅ Período eliminado');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar período';
      console.error('❌ Error eliminando período:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPeriods, showNotification]);

  // Cargar datos iniciales
  useEffect(() => {
    loadPeriods();
    loadCurrentPeriod();
  }, []);

  return {
    periods,
    currentPeriod,
    loading,
    error,
    pagination,
    loadPeriods,
    loadCurrentPeriod,
    createPeriod,
    processPeriod,
    approvePeriod,
    markAsPaid,
    deletePeriod,
    setError
  };
};

// ===================================================================
// HOOK PARA EMPLEADOS DE UN PERÍODO
// ===================================================================

export const usePayrollEmployees = (periodId: string | null) => {
  const [employees, setEmployees] = useState<Array<{
    employee: any;
    payroll: PayrollEmployee | null;
  }>>([]);
  const [period, setPeriod] = useState<PayrollPeriod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PayrollFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const { showNotification } = useNotifications();

  // Cargar empleados del período
  const loadEmployees = useCallback(async (
    page = 1,
    limit = 20,
    currentFilters = filters
  ) => {
    if (!periodId) {
      setEmployees([]);
      setPeriod(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando empleados del período...', { periodId, page, limit, currentFilters });

      const response = await payrollService.getPeriodEmployees(
        periodId,
        page,
        limit,
        currentFilters
      );
      
      setEmployees(response.employees);
      setPeriod(response.period);
      setPagination(response.pagination);

      console.log('✅ Empleados cargados:', response.employees.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar empleados';
      console.error('❌ Error cargando empleados:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [periodId, filters, showNotification]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: PayrollFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Cambiar página
  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Recargar datos cuando cambien filtros o página
  useEffect(() => {
    if (periodId) {
      loadEmployees(pagination.page, pagination.limit, filters);
    }
  }, [periodId, pagination.page, filters]);

  return {
    employees,
    period,
    loading,
    error,
    filters,
    pagination,
    loadEmployees,
    applyFilters,
    clearFilters,
    changePage,
    setError
  };
};

// ===================================================================
// HOOK PARA NÓMINA INDIVIDUAL
// ===================================================================

export const usePayrollDetail = (payrollId: string | null) => {
  const [payroll, setPayroll] = useState<PayrollEmployee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotifications();

  // Cargar nómina individual
  const loadPayroll = useCallback(async () => {
    if (!payrollId) {
      setPayroll(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando nómina individual...', payrollId);

      const payrollData = await payrollService.getPayrollById(payrollId);
      setPayroll(payrollData);

      console.log('✅ Nómina cargada:', payrollData.employeeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar nómina';
      console.error('❌ Error cargando nómina:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [payrollId, showNotification]);

  // Actualizar nómina
  const updatePayroll = useCallback(async (updateData: Partial<PayrollEmployee>) => {
    if (!payrollId) return;

    try {
      setLoading(true);
      console.log('🔄 Actualizando nómina...', payrollId);

      const updatedPayroll = await payrollService.updatePayroll(payrollId, updateData);
      setPayroll(updatedPayroll);

      showNotification({
        type: 'success',
        title: 'Nómina Actualizada',
        message: 'Los cambios se han guardado exitosamente'
      });

      console.log('✅ Nómina actualizada');
      return updatedPayroll;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar nómina';
      console.error('❌ Error actualizando nómina:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [payrollId, showNotification]);

  // Regenerar nómina
  const regeneratePayroll = useCallback(async (options?: { recalculateExtras?: boolean }) => {
    if (!payrollId) return;

    try {
      setLoading(true);
      console.log('🔄 Regenerando nómina...', payrollId);

      const regeneratedPayroll = await payrollService.regeneratePayroll(payrollId, options);
      setPayroll(regeneratedPayroll);

      showNotification({
        type: 'success',
        title: 'Nómina Regenerada',
        message: 'La nómina ha sido recalculada exitosamente'
      });

      console.log('✅ Nómina regenerada');
      return regeneratedPayroll;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al regenerar nómina';
      console.error('❌ Error regenerando nómina:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [payrollId, showNotification]);

  // Aprobar nómina individual
  const approvePayroll = useCallback(async () => {
    if (!payrollId) return;

    try {
      setLoading(true);
      console.log('🔄 Aprobando nómina...', payrollId);

      const approvedPayroll = await payrollService.approvePayroll(payrollId);
      setPayroll(approvedPayroll);

      showNotification({
        type: 'success',
        title: 'Nómina Aprobada',
        message: 'La nómina ha sido aprobada exitosamente'
      });

      console.log('✅ Nómina aprobada');
      return approvedPayroll;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aprobar nómina';
      console.error('❌ Error aprobando nómina:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [payrollId, showNotification]);

  // Cargar datos iniciales
  useEffect(() => {
    loadPayroll();
  }, [loadPayroll]);

  return {
    payroll,
    loading,
    error,
    loadPayroll,
    updatePayroll,
    regeneratePayroll,
    approvePayroll,
    setError
  };
};

// ===================================================================
// HOOK PARA OPERACIONES MASIVAS
// ===================================================================

export const usePayrollBulkOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotifications();

  // Ejecutar operación masiva
  const executeBulkOperation = useCallback(async (operation: PayrollBulkOperation) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Ejecutando operación masiva...', operation);

      const result = await payrollService.bulkOperation(operation);

      if (result.errors.length > 0) {
        showNotification({
          type: 'warning',
          title: 'Operación Completada con Errores',
          message: `${result.processedCount} elementos procesados, ${result.errors.length} errores`
        });
      } else {
        showNotification({
          type: 'success',
          title: 'Operación Completada',
          message: `Se procesaron ${result.processedCount} elementos exitosamente`
        });
      }

      console.log('✅ Operación masiva completada:', result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en operación masiva';
      console.error('❌ Error en operación masiva:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return {
    loading,
    error,
    executeBulkOperation,
    setError
  };
};

// ===================================================================
// HOOK PARA ESTADÍSTICAS
// ===================================================================

export const usePayrollStats = (periodId: string | null) => {
  const [stats, setStats] = useState<PayrollStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    if (!periodId) {
      setStats(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando estadísticas...', periodId);

      const statsData = await payrollService.getPeriodStats(periodId);
      setStats(statsData);

      console.log('✅ Estadísticas cargadas');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      console.error('❌ Error cargando estadísticas:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  // Cargar datos cuando cambie el período
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    loadStats,
    setError
  };
};

// ===================================================================
// HOOK PARA EXPORTACIÓN
// ===================================================================

export const usePayrollExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotifications();

  // Exportar período
  const exportPeriod = useCallback(async (
    periodId: string,
    options: {
      format: 'excel' | 'pdf' | 'csv';
      includeDetails?: boolean;
      includeFiscalBreakdown?: boolean;
      includeMovements?: boolean;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Exportando período...', { periodId, options });

      const blob = await payrollService.exportPeriod(periodId, options);
      
      // Generar nombre de archivo
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = options.format === 'excel' ? 'xlsx' : options.format;
      const filename = `nomina_${timestamp}.${extension}`;

      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Exportación Completada',
        message: `El archivo ${filename} ha sido descargado`
      });

      console.log('✅ Período exportado:', filename);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al exportar período';
      console.error('❌ Error exportando período:', err);
      setError(errorMessage);
      showNotification({
        type: 'error',
        title: 'Error de Exportación',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  return {
    loading,
    error,
    exportPeriod,
    setError
  };
};
