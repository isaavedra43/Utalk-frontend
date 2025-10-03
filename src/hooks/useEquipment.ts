import { useState, useEffect, useCallback } from 'react';
import {
  equipmentService,
  Equipment,
  EquipmentReview,
  EquipmentSummary,
  CreateEquipmentRequest,
  CreateReviewRequest
} from '../services/equipmentService';

// ============================================================================
// TYPES
// ============================================================================

interface UseEquipmentOptions {
  employeeId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseEquipmentReturn {
  equipment: Equipment[];
  summary: EquipmentSummary | null;
  loading: boolean;
  error: string | null;
  assignEquipment: (equipmentData: CreateEquipmentRequest) => Promise<Equipment>;
  updateEquipment: (equipmentId: string, updateData: Partial<CreateEquipmentRequest>) => Promise<Equipment>;
  returnEquipment: (equipmentId: string, returnData: { condition: Equipment['condition']; notes?: string; photos?: string[] }) => Promise<Equipment>;
  reportLost: (equipmentId: string, details: { lostDate: string; description: string; policeReportNumber?: string }) => Promise<Equipment>;
  reportDamage: (equipmentId: string, damageData: { description: string; severity: 'minor' | 'moderate' | 'severe'; photos?: string[]; estimatedCost?: number }) => Promise<Equipment>;
  deleteEquipment: (equipmentId: string) => Promise<void>;
  createReview: (equipmentId: string, reviewData: CreateReviewRequest) => Promise<EquipmentReview>;
  getReviews: (equipmentId: string) => Promise<EquipmentReview[]>;
  uploadFiles: (files: File[], type: 'invoice' | 'photo' | 'document') => Promise<string[]>;
  exportEquipment: (format?: 'excel' | 'pdf') => Promise<Blob>;
  generateReport: (reportType: 'inventory' | 'maintenance' | 'depreciation' | 'responsibility') => Promise<Blob>;
  scheduleReview: (equipmentId: string, scheduleData: { reviewType: EquipmentReview['reviewType']; scheduledDate: string; notes?: string }) => Promise<any>;
  refreshData: () => Promise<void>;
}

// ============================================================================
// HOOK
// ============================================================================

export const useEquipment = (options: UseEquipmentOptions): UseEquipmentReturn => {
  const { employeeId, autoRefresh = false, refreshInterval = 30000 } = options;

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [summary, setSummary] = useState<EquipmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando datos de equipo para empleado:', employeeId);

      const [equipmentData, summaryData] = await Promise.all([
        equipmentService.getEmployeeEquipment(employeeId),
        equipmentService.getSummary(employeeId)
      ]);

      setEquipment(equipmentData);
      setSummary(summaryData);

      console.log('✅ Datos de equipo cargados:', {
        totalEquipment: equipmentData.length,
        summary: summaryData
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando equipo';
      setError(errorMessage);
      console.error('❌ Error cargando equipo:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // Cargar datos inicialmente
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh de equipo');
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  // Asignar equipo
  const assignEquipment = useCallback(async (equipmentData: CreateEquipmentRequest): Promise<Equipment> => {
    try {
      setError(null);
      const result = await equipmentService.assignEquipment(employeeId, equipmentData);
      
      setEquipment(prev => [result, ...prev]);
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error asignando equipo';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Actualizar equipo
  const updateEquipment = useCallback(async (
    equipmentId: string,
    updateData: Partial<CreateEquipmentRequest>
  ): Promise<Equipment> => {
    try {
      setError(null);
      const result = await equipmentService.updateEquipment(employeeId, equipmentId, updateData);
      
      setEquipment(prev => prev.map(eq => eq.id === equipmentId ? result : eq));
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando equipo';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Devolver equipo
  const returnEquipment = useCallback(async (
    equipmentId: string,
    returnData: { condition: Equipment['condition']; notes?: string; photos?: string[] }
  ): Promise<Equipment> => {
    try {
      setError(null);
      const result = await equipmentService.returnEquipment(employeeId, equipmentId, returnData);
      
      setEquipment(prev => prev.map(eq => eq.id === equipmentId ? result : eq));
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error devolviendo equipo';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Reportar perdido
  const reportLost = useCallback(async (
    equipmentId: string,
    details: { lostDate: string; description: string; policeReportNumber?: string }
  ): Promise<Equipment> => {
    try {
      setError(null);
      const result = await equipmentService.reportLost(employeeId, equipmentId, details);
      
      setEquipment(prev => prev.map(eq => eq.id === equipmentId ? result : eq));
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error reportando pérdida';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Reportar daño
  const reportDamage = useCallback(async (
    equipmentId: string,
    damageData: { description: string; severity: 'minor' | 'moderate' | 'severe'; photos?: string[]; estimatedCost?: number }
  ): Promise<Equipment> => {
    try {
      setError(null);
      const result = await equipmentService.reportDamage(employeeId, equipmentId, damageData);
      
      setEquipment(prev => prev.map(eq => eq.id === equipmentId ? result : eq));
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error reportando daño';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Eliminar equipo
  const deleteEquipment = useCallback(async (equipmentId: string): Promise<void> => {
    try {
      setError(null);
      await equipmentService.deleteEquipment(employeeId, equipmentId);
      
      setEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando equipo';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Crear revisión
  const createReview = useCallback(async (
    equipmentId: string,
    reviewData: CreateReviewRequest
  ): Promise<EquipmentReview> => {
    try {
      setError(null);
      const result = await equipmentService.createReview(employeeId, equipmentId, reviewData);
      
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando revisión';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Obtener revisiones
  const getReviews = useCallback(async (equipmentId: string): Promise<EquipmentReview[]> => {
    try {
      setError(null);
      return await equipmentService.getReviews(employeeId, equipmentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo revisiones';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId]);

  // Subir archivos
  const uploadFiles = useCallback(async (
    files: File[],
    type: 'invoice' | 'photo' | 'document'
  ): Promise<string[]> => {
    try {
      setError(null);
      return await equipmentService.uploadFiles(files, type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error subiendo archivos';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Exportar
  const exportEquipment = useCallback(async (format: 'excel' | 'pdf' = 'excel'): Promise<Blob> => {
    try {
      setError(null);
      return await equipmentService.exportEquipment(employeeId, format);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando equipo';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId]);

  // Generar reporte
  const generateReport = useCallback(async (
    reportType: 'inventory' | 'maintenance' | 'depreciation' | 'responsibility'
  ): Promise<Blob> => {
    try {
      setError(null);
      return await equipmentService.generateReport(employeeId, reportType);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando reporte';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId]);

  // Programar revisión
  const scheduleReview = useCallback(async (
    equipmentId: string,
    scheduleData: { reviewType: EquipmentReview['reviewType']; scheduledDate: string; notes?: string }
  ): Promise<any> => {
    try {
      setError(null);
      const result = await equipmentService.scheduleReview(employeeId, equipmentId, scheduleData);
      await refreshData();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error programando revisión';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  return {
    equipment,
    summary,
    loading,
    error,
    assignEquipment,
    updateEquipment,
    returnEquipment,
    reportLost,
    reportDamage,
    deleteEquipment,
    createReview,
    getReviews,
    uploadFiles,
    exportEquipment,
    generateReport,
    scheduleReview,
    refreshData
  };
};

export default useEquipment;

