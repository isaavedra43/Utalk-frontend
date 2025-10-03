import { useState, useEffect, useCallback } from 'react';
import { incidentsService, Incident, IncidentRequest, IncidentUpdateRequest, IncidentsSummary } from '../services/incidentsService';

// ============================================================================
// TYPES
// ============================================================================

interface UseIncidentsOptions {
  employeeId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseIncidentsReturn {
  incidents: Incident[];
  summary: IncidentsSummary | null;
  loading: boolean;
  error: string | null;
  createIncident: (incidentData: IncidentRequest) => Promise<Incident>;
  updateIncident: (incidentId: string, updateData: IncidentUpdateRequest) => Promise<Incident>;
  deleteIncident: (incidentId: string) => Promise<void>;
  approveIncident: (incidentId: string, comments?: string) => Promise<Incident>;
  rejectIncident: (incidentId: string, comments: string) => Promise<Incident>;
  closeIncident: (incidentId: string, resolution: string) => Promise<Incident>;
  markCostAsPaid: (incidentId: string, paidBy: string, paymentDate?: string) => Promise<Incident>;
  uploadAttachments: (files: File[]) => Promise<string[]>;
  exportIncidents: (format?: 'excel' | 'pdf') => Promise<Blob>;
  generateReport: (incidentId: string, reportType: 'acta' | 'robo' | 'accidente' | 'lesion' | 'disciplinario' | 'equipo') => Promise<Blob>;
  refreshData: () => Promise<void>;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useIncidents = (options: UseIncidentsOptions): UseIncidentsReturn => {
  const { employeeId, autoRefresh = false, refreshInterval = 30000 } = options;

  // Estado local
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [summary, setSummary] = useState<IncidentsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar datos
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando incidencias para empleado:', employeeId);

      // Cargar incidencias y resumen en paralelo
      const [incidentsData, summaryData] = await Promise.all([
        incidentsService.getIncidents(employeeId),
        incidentsService.getIncidentsSummary(employeeId)
      ]);

      setIncidents(incidentsData);
      setSummary(summaryData);

      console.log('✅ Datos de incidencias cargados:', {
        totalIncidents: incidentsData.length,
        summary: summaryData
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando incidencias';
      setError(errorMessage);
      console.error('❌ Error cargando incidencias:', err);
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
      console.log('🔄 Auto-refresh de incidencias');
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  // Crear incidencia
  const createIncident = useCallback(async (incidentData: IncidentRequest): Promise<Incident> => {
    try {
      setError(null);
      const result = await incidentsService.createIncident(employeeId, incidentData);
      
      // Actualizar datos localmente
      setIncidents(prev => [result, ...prev]);
      
      // Refrescar resumen
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando incidencia';
      setError(errorMessage);
      console.error('❌ Error en createIncident:', err);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Actualizar incidencia
  const updateIncident = useCallback(async (
    incidentId: string, 
    updateData: IncidentUpdateRequest
  ): Promise<Incident> => {
    try {
      setError(null);
      const result = await incidentsService.updateIncident(employeeId, incidentId, updateData);
      
      // Actualizar datos localmente
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? result : inc));
      
      // Refrescar resumen
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando incidencia';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Eliminar incidencia
  const deleteIncident = useCallback(async (incidentId: string): Promise<void> => {
    try {
      setError(null);
      await incidentsService.deleteIncident(employeeId, incidentId);
      
      // Actualizar datos localmente
      setIncidents(prev => prev.filter(inc => inc.id !== incidentId));
      
      // Refrescar resumen
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando incidencia';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Aprobar incidencia
  const approveIncident = useCallback(async (
    incidentId: string, 
    comments?: string
  ): Promise<Incident> => {
    try {
      setError(null);
      const result = await incidentsService.approveIncident(employeeId, incidentId, comments);
      
      // Actualizar datos localmente
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? result : inc));
      
      // Refrescar resumen
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error aprobando incidencia';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Rechazar incidencia
  const rejectIncident = useCallback(async (
    incidentId: string, 
    comments: string
  ): Promise<Incident> => {
    try {
      setError(null);
      const result = await incidentsService.rejectIncident(employeeId, incidentId, comments);
      
      // Actualizar datos localmente
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? result : inc));
      
      // Refrescar resumen
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error rechazando incidencia';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Cerrar incidencia
  const closeIncident = useCallback(async (
    incidentId: string, 
    resolution: string
  ): Promise<Incident> => {
    try {
      setError(null);
      const result = await incidentsService.closeIncident(employeeId, incidentId, resolution);
      
      // Actualizar datos localmente
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? result : inc));
      
      // Refrescar resumen
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cerrando incidencia';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Marcar costo como pagado
  const markCostAsPaid = useCallback(async (
    incidentId: string, 
    paidBy: string,
    paymentDate?: string
  ): Promise<Incident> => {
    try {
      setError(null);
      const result = await incidentsService.markCostAsPaid(employeeId, incidentId, paidBy, paymentDate);
      
      // Actualizar datos localmente
      setIncidents(prev => prev.map(inc => inc.id === incidentId ? result : inc));
      
      // Refrescar resumen
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error marcando costo como pagado';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId, refreshData]);

  // Subir archivos
  const uploadAttachments = useCallback(async (files: File[]): Promise<string[]> => {
    try {
      setError(null);
      return await incidentsService.uploadAttachments(files);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error subiendo archivos';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Exportar incidencias
  const exportIncidents = useCallback(async (format: 'excel' | 'pdf' = 'excel'): Promise<Blob> => {
    try {
      setError(null);
      return await incidentsService.exportIncidents(employeeId, format);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando incidencias';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId]);

  // Generar reporte específico
  const generateReport = useCallback(async (
    incidentId: string,
    reportType: 'acta' | 'robo' | 'accidente' | 'lesion' | 'disciplinario' | 'equipo'
  ): Promise<Blob> => {
    try {
      setError(null);
      return await incidentsService.generateReport(employeeId, incidentId, reportType);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando reporte';
      setError(errorMessage);
      throw err;
    }
  }, [employeeId]);

  return {
    incidents,
    summary,
    loading,
    error,
    createIncident,
    updateIncident,
    deleteIncident,
    approveIncident,
    rejectIncident,
    closeIncident,
    markCostAsPaid,
    uploadAttachments,
    exportIncidents,
    generateReport,
    refreshData
  };
};

export default useIncidents;

