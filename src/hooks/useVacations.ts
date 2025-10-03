import { useState, useEffect, useCallback } from 'react';
import { 
  vacationsService,
  VacationRequest,
  CreateVacationRequest,
  VacationBalance,
  VacationPolicy,
  VacationsSummary,
  VacationsData
} from '../services/vacationsService';

// ============================================================================
// TYPES
// ============================================================================

interface UseVacationsOptions {
  employeeId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseVacationsReturn {
  data: VacationsData | null;
  requests: VacationRequest[];
  balance: VacationBalance | null;
  policy: VacationPolicy | null;
  summary: VacationsSummary | null;
  loading: boolean;
  error: string | null;
  createRequest: (requestData: CreateVacationRequest) => Promise<VacationRequest>;
  updateRequest: (requestId: string, updateData: Partial<CreateVacationRequest>) => Promise<VacationRequest>;
  cancelRequest: (requestId: string, reason?: string) => Promise<VacationRequest>;
  deleteRequest: (requestId: string) => Promise<void>;
  approveRequest: (requestId: string, comments?: string) => Promise<VacationRequest>;
  rejectRequest: (requestId: string, reason: string) => Promise<VacationRequest>;
  calculateDays: (startDate: string, endDate: string) => Promise<number>;
  checkAvailability: (startDate: string, endDate: string) => Promise<{ available: boolean; conflicts: string[]; suggestions?: string[] }>;
  uploadAttachments: (files: File[]) => Promise<string[]>;
  exportVacations: (format?: 'excel' | 'pdf', year?: number) => Promise<Blob>;
  getCalendar: (year: number, month: number) => Promise<any>;
  refreshData: () => Promise<void>;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useVacations = (options: UseVacationsOptions): UseVacationsReturn => {
  const { employeeId, autoRefresh = false, refreshInterval = 30000 } = options;

  // Estado local
  const [data, setData] = useState<VacationsData | null>(null);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [policy, setPolicy] = useState<VacationPolicy | null>(null);
  const [summary, setSummary] = useState<VacationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar todos los datos
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando datos de vacaciones para empleado:', employeeId);

      // Cargar todos los datos
      const [vacationsData, requestsData] = await Promise.all([
        vacationsService.getVacationsData(employeeId),
        vacationsService.getRequests(employeeId)
      ]);

      setData(vacationsData);
      setRequests(requestsData || []);
      setBalance(vacationsData.balance);
      setPolicy(vacationsData.policy);
      setSummary(vacationsData.summary);

      console.log('✅ Datos de vacaciones cargados:', {
        totalRequests: requestsData?.length || 0,
        balance: vacationsData.balance,
        summary: vacationsData.summary
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando vacaciones';
      setError(errorMessage);
      console.error('❌ Error cargando vacaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // Cargar datos inicialmente
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh opcional
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh de vacaciones');
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  // Crear solicitud
  const createRequest = useCallback(async (requestData: CreateVacationRequest): Promise<VacationRequest> => {
    try {
      setError(null);
      const result = await vacationsService.createRequest(employeeId, requestData);
      
      // Actualizar datos localmente
      setRequests(prev => [result, ...prev]);
      
      // Refrescar todos los datos
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando solicitud';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Actualizar solicitud
  const updateRequest = useCallback(async (
    requestId: string,
    updateData: Partial<CreateVacationRequest>
  ): Promise<VacationRequest> => {
    try {
      setError(null);
      const result = await vacationsService.updateRequest(employeeId, requestId, updateData);
      
      // Actualizar datos localmente
      setRequests(prev => prev.map(req => req.id === requestId ? result : req));
      
      // Refrescar datos
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando solicitud';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Cancelar solicitud
  const cancelRequest = useCallback(async (requestId: string, reason?: string): Promise<VacationRequest> => {
    try {
      setError(null);
      const result = await vacationsService.cancelRequest(employeeId, requestId, reason);
      
      // Actualizar datos localmente
      setRequests(prev => prev.map(req => req.id === requestId ? result : req));
      
      // Refrescar datos
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cancelando solicitud';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Eliminar solicitud
  const deleteRequest = useCallback(async (requestId: string): Promise<void> => {
    try {
      setError(null);
      await vacationsService.deleteRequest(employeeId, requestId);
      
      // Actualizar datos localmente
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Refrescar datos
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando solicitud';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Aprobar solicitud
  const approveRequest = useCallback(async (requestId: string, comments?: string): Promise<VacationRequest> => {
    try {
      setError(null);
      const result = await vacationsService.approveRequest(employeeId, requestId, comments);
      
      // Actualizar datos localmente
      setRequests(prev => prev.map(req => req.id === requestId ? result : req));
      
      // Refrescar datos
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error aprobando solicitud';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Rechazar solicitud
  const rejectRequest = useCallback(async (requestId: string, reason: string): Promise<VacationRequest> => {
    try {
      setError(null);
      const result = await vacationsService.rejectRequest(employeeId, requestId, reason);
      
      // Actualizar datos localmente
      setRequests(prev => prev.map(req => req.id === requestId ? result : req));
      
      // Refrescar datos
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error rechazando solicitud';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Calcular días
  const calculateDays = useCallback(async (startDate: string, endDate: string): Promise<number> => {
    try {
      setError(null);
      return await vacationsService.calculateDays(employeeId, startDate, endDate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error calculando días';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId]);

  // Verificar disponibilidad
  const checkAvailability = useCallback(async (
    startDate: string,
    endDate: string
  ): Promise<{ available: boolean; conflicts: string[]; suggestions?: string[] }> => {
    try {
      setError(null);
      return await vacationsService.checkAvailability(employeeId, startDate, endDate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error verificando disponibilidad';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId]);

  // Subir archivos
  const uploadAttachments = useCallback(async (files: File[]): Promise<string[]> => {
    try {
      setError(null);
      return await vacationsService.uploadAttachments(files);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error subiendo archivos';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Exportar vacaciones
  const exportVacations = useCallback(async (
    format: 'excel' | 'pdf' = 'excel',
    year?: number
  ): Promise<Blob> => {
    try {
      setError(null);
      return await vacationsService.exportVacations(employeeId, format, year);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando vacaciones';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId]);

  // Obtener calendario
  const getCalendar = useCallback(async (year: number, month: number): Promise<any> => {
    try {
      setError(null);
      return await vacationsService.getCalendar(employeeId, year, month);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo calendario';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId]);

  return {
    data,
    requests,
    balance,
    policy,
    summary,
    loading,
    error,
    createRequest,
    updateRequest,
    cancelRequest,
    deleteRequest,
    approveRequest,
    rejectRequest,
    calculateDays,
    checkAvailability,
    uploadAttachments,
    exportVacations,
    getCalendar,
    refreshData
  };
};

export default useVacations;

