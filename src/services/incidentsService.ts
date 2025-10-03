import api from './api';
import { handleApiError } from '../config/apiConfig';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Incident {
  id: string;
  employeeId: string;
  type: 'administrative' | 'theft' | 'accident' | 'injury' | 'disciplinary' | 'security' | 'equipment' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected' | 'closed';
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  reportedBy: string;
  reportedByName?: string;
  reportedDate: string;
  involvedPersons: string[];
  witnesses: string[];
  evidence: string[];
  actions: string[];
  consequences: string[];
  preventiveMeasures: string[];
  supervisor?: string;
  supervisorName?: string;
  hrReviewer?: string;
  hrReviewerName?: string;
  legalReviewer?: string;
  legalReviewerName?: string;
  signedBy: string[];
  printedDate?: string;
  uploadedDocuments: string[];
  attachments?: string[];
  followUpDate?: string;
  resolution?: string;
  cost?: number;
  costPaid?: boolean;
  costPaidDate?: string;
  costPaidBy?: string;
  insuranceClaim?: boolean;
  policeReport?: boolean;
  medicalReport?: boolean;
  tags: string[];
  isConfidential: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: string;
  updatedAt?: string;
}

export interface IncidentRequest {
  type: Incident['type'];
  severity: Incident['severity'];
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  reportedBy: string;
  involvedPersons: string[];
  witnesses?: string[];
  actions?: string[];
  consequences?: string[];
  preventiveMeasures?: string[];
  supervisor?: string;
  tags?: string[];
  isConfidential?: boolean;
  priority: Incident['priority'];
  cost?: number;
  insuranceClaim?: boolean;
  policeReport?: boolean;
  medicalReport?: boolean;
  attachments?: string[];
}

export interface IncidentUpdateRequest {
  status?: Incident['status'];
  resolution?: string;
  hrReviewer?: string;
  legalReviewer?: string;
  costPaid?: boolean;
  costPaidDate?: string;
  costPaidBy?: string;
  followUpDate?: string;
  signedBy?: string[];
  attachments?: string[];
}

export interface IncidentsSummary {
  totalIncidents: number;
  openIncidents: number;
  closedIncidents: number;
  pendingIncidents: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  byMonth: Record<string, number>;
  totalCost: number;
  paidCost: number;
  unpaidCost: number;
}

// ============================================================================
// INCIDENTS SERVICE
// ============================================================================

class IncidentsService {
  // Helper para manejar errores de API
  private handleError(error: unknown, context: string): never {
    const errorMessage = handleApiError(error);
    console.error(`❌ IncidentsService.${context}:`, errorMessage);
    throw new Error(errorMessage);
  }

  /**
   * Crear nueva incidencia
   */
  async createIncident(employeeId: string, incidentData: IncidentRequest): Promise<Incident> {
    try {
      console.log('📝 Creando incidencia:', { employeeId, incidentData });
      
      const response = await api.post(`/api/employees/${employeeId}/incidents`, incidentData);
      
      console.log('✅ Incidencia creada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'createIncident');
    }
  }

  /**
   * Obtener todas las incidencias de un empleado
   */
  async getIncidents(employeeId: string, filters: Record<string, unknown> = {}): Promise<Incident[]> {
    try {
      console.log('🔍 Obteniendo incidencias:', { employeeId, filters });
      
      const response = await api.get(`/api/employees/${employeeId}/incidents`, { params: filters });
      
      // Manejar la estructura real de respuesta del backend
      let incidents: Incident[] = [];
      if (response.data && response.data.data) {
        incidents = response.data.data.incidents || [];
      } else if (response.data && Array.isArray(response.data)) {
        incidents = response.data;
      } else if (response.data && response.data.incidents) {
        incidents = response.data.incidents;
      }
      
      console.log(`✅ ${incidents.length} incidencias obtenidas`);
      return incidents;
    } catch (error) {
      this.handleError(error, 'getIncidents');
    }
  }

  /**
   * Obtener una incidencia específica
   */
  async getIncident(employeeId: string, incidentId: string): Promise<Incident> {
    try {
      console.log('🔍 Obteniendo incidencia:', { employeeId, incidentId });
      
      const response = await api.get(`/api/employees/${employeeId}/incidents/${incidentId}`);
      
      console.log('✅ Incidencia obtenida');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'getIncident');
    }
  }

  /**
   * Actualizar incidencia
   */
  async updateIncident(
    employeeId: string, 
    incidentId: string, 
    updateData: IncidentUpdateRequest
  ): Promise<Incident> {
    try {
      console.log('📝 Actualizando incidencia:', { employeeId, incidentId, updateData });
      
      const response = await api.put(`/api/employees/${employeeId}/incidents/${incidentId}`, updateData);
      
      console.log('✅ Incidencia actualizada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'updateIncident');
    }
  }

  /**
   * Eliminar incidencia
   */
  async deleteIncident(employeeId: string, incidentId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando incidencia:', { employeeId, incidentId });
      
      await api.delete(`/api/employees/${employeeId}/incidents/${incidentId}`);
      
      console.log('✅ Incidencia eliminada exitosamente');
    } catch (error) {
      this.handleError(error, 'deleteIncident');
    }
  }

  /**
   * Aprobar incidencia
   */
  async approveIncident(
    employeeId: string, 
    incidentId: string, 
    reviewerComments?: string
  ): Promise<Incident> {
    try {
      console.log('✅ Aprobando incidencia:', { employeeId, incidentId });
      
      const response = await api.put(`/api/employees/${employeeId}/incidents/${incidentId}/approve`, {
        reviewerComments
      });
      
      console.log('✅ Incidencia aprobada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'approveIncident');
    }
  }

  /**
   * Rechazar incidencia
   */
  async rejectIncident(
    employeeId: string, 
    incidentId: string, 
    reviewerComments: string
  ): Promise<Incident> {
    try {
      console.log('❌ Rechazando incidencia:', { employeeId, incidentId });
      
      const response = await api.put(`/api/employees/${employeeId}/incidents/${incidentId}/reject`, {
        reviewerComments
      });
      
      console.log('✅ Incidencia rechazada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'rejectIncident');
    }
  }

  /**
   * Cerrar incidencia
   */
  async closeIncident(
    employeeId: string, 
    incidentId: string, 
    resolution: string
  ): Promise<Incident> {
    try {
      console.log('🔒 Cerrando incidencia:', { employeeId, incidentId });
      
      const response = await api.put(`/api/employees/${employeeId}/incidents/${incidentId}/close`, {
        resolution
      });
      
      console.log('✅ Incidencia cerrada exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'closeIncident');
    }
  }

  /**
   * Marcar costo como pagado
   */
  async markCostAsPaid(
    employeeId: string, 
    incidentId: string, 
    paidBy: string,
    paymentDate?: string
  ): Promise<Incident> {
    try {
      console.log('💵 Marcando costo como pagado:', { employeeId, incidentId, paidBy });
      
      const response = await api.put(`/api/employees/${employeeId}/incidents/${incidentId}/mark-paid`, {
        paidBy,
        paymentDate: paymentDate || new Date().toISOString().split('T')[0]
      });
      
      console.log('✅ Costo marcado como pagado exitosamente');
      return response.data.data || response.data;
    } catch (error) {
      this.handleError(error, 'markCostAsPaid');
    }
  }

  /**
   * Obtener resumen de incidencias
   */
  async getIncidentsSummary(employeeId: string): Promise<IncidentsSummary> {
    try {
      console.log('📊 Obteniendo resumen de incidencias:', { employeeId });
      
      const response = await api.get(`/api/employees/${employeeId}/incidents/summary`);
      
      // Manejar la estructura real de respuesta del backend
      let summary: IncidentsSummary;
      if (response.data && response.data.data) {
        summary = response.data.data;
      } else {
        summary = response.data;
      }
      
      console.log('✅ Resumen de incidencias obtenido');
      return summary;
    } catch (error) {
      this.handleError(error, 'getIncidentsSummary');
    }
  }

  /**
   * Subir archivos adjuntos
   */
  async uploadAttachments(files: File[]): Promise<string[]> {
    try {
      console.log('📎 Subiendo archivos adjuntos:', files.length);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await api.post('/api/incidents/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const attachmentIds = response.data.data?.attachmentIds || response.data.attachmentIds || [];
      console.log('✅ Archivos subidos exitosamente:', attachmentIds);
      return attachmentIds;
    } catch (error) {
      this.handleError(error, 'uploadAttachments');
    }
  }

  /**
   * Exportar incidencias
   */
  async exportIncidents(
    employeeId: string, 
    format: 'excel' | 'pdf' = 'excel'
  ): Promise<Blob> {
    try {
      console.log('📥 Exportando incidencias:', { employeeId, format });
      
      const response = await api.get(`/api/employees/${employeeId}/incidents/export`, {
        params: { format },
        responseType: 'blob'
      });
      
      console.log('✅ Incidencias exportadas exitosamente');
      return response.data;
    } catch (error) {
      this.handleError(error, 'exportIncidents');
    }
  }

  /**
   * Generar reporte específico de incidencia
   */
  async generateReport(
    employeeId: string, 
    incidentId: string, 
    reportType: 'acta' | 'robo' | 'accidente' | 'lesion' | 'disciplinario' | 'equipo'
  ): Promise<Blob> {
    try {
      console.log('📄 Generando reporte:', { employeeId, incidentId, reportType });
      
      const response = await api.get(
        `/api/employees/${employeeId}/incidents/${incidentId}/report/${reportType}`,
        { responseType: 'blob' }
      );
      
      console.log('✅ Reporte generado exitosamente');
      return response.data;
    } catch (error) {
      this.handleError(error, 'generateReport');
    }
  }
}

// Exportar instancia única del servicio
export const incidentsService = new IncidentsService();
export default incidentsService;