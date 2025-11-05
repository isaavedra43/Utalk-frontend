// Servicio de reportes y analíticas

import api from '../../../services/api';
import type { 
  ProjectDashboard,
  ProjectReport,
  ProjectMetrics,
  ProjectHealth,
  PredictiveAnalytics,
  ProjectTrends,
  ReportExport,
  ApiResponse 
} from '../types';

class AnalyticsService {
  private readonly BASE_PATH = '/api/projects';

  /**
   * Obtener dashboard del proyecto
   * Endpoint: GET /api/projects/:id/dashboard
   */
  async getDashboard(projectId: string, dashboardId?: string): Promise<any> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/dashboard`,
        { params: { dashboardId } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtener métricas del proyecto
   * Endpoint: GET /api/projects/:id/metrics
   */
  async getMetrics(projectId: string): Promise<ProjectMetrics> {
    try {
      const response = await api.get<ApiResponse<ProjectMetrics>>(
        `${this.BASE_PATH}/${projectId}/metrics`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  }

  /**
   * Obtener health score del proyecto
   * Endpoint: GET /api/projects/:id/health
   */
  async getProjectHealth(projectId: string): Promise<ProjectHealth> {
    try {
      const response = await api.get<ApiResponse<ProjectHealth>>(
        `${this.BASE_PATH}/${projectId}/health`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching project health:', error);
      throw error;
    }
  }

  /**
   * Generar reporte
   * Endpoint: GET /api/projects/:id/reports/:type
   */
  async generateReport(
    projectId: string,
    type: 'status' | 'financial' | 'time' | 'resource' | 'quality' | 'risk' | 'executive' | 'custom',
    options?: {
      period?: any;
      sections?: string[];
      format?: 'html' | 'json';
    }
  ): Promise<ProjectReport> {
    try {
      const response = await api.get<ApiResponse<ProjectReport>>(
        `${this.BASE_PATH}/${projectId}/reports/${type}`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Crear dashboard personalizado
   * Endpoint: POST /api/projects/:id/dashboards
   */
  async createDashboard(
    projectId: string,
    dashboard: Partial<ProjectDashboard>
  ): Promise<ProjectDashboard> {
    try {
      const response = await api.post<ApiResponse<ProjectDashboard>>(
        `${this.BASE_PATH}/${projectId}/dashboards`,
        dashboard
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtener dashboard personalizado
   * Endpoint: GET /api/projects/:id/dashboards/:dashboardId
   */
  async getDashboardById(
    projectId: string,
    dashboardId: string
  ): Promise<ProjectDashboard> {
    try {
      const response = await api.get<ApiResponse<ProjectDashboard>>(
        `${this.BASE_PATH}/${projectId}/dashboards/${dashboardId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtener predicciones con IA
   * Endpoint: GET /api/projects/:id/analytics/predictions
   */
  async getPredictions(projectId: string): Promise<PredictiveAnalytics> {
    try {
      const response = await api.get<ApiResponse<PredictiveAnalytics>>(
        `${this.BASE_PATH}/${projectId}/analytics/predictions`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching predictions:', error);
      throw error;
    }
  }

  /**
   * Obtener tendencias del proyecto
   * Endpoint: GET /api/projects/:id/analytics/trends
   */
  async getTrends(
    projectId: string,
    options?: {
      metrics?: string[];
      periodDays?: number;
    }
  ): Promise<ProjectTrends> {
    try {
      const response = await api.get<ApiResponse<ProjectTrends>>(
        `${this.BASE_PATH}/${projectId}/analytics/trends`,
        { params: options }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }
  }

  /**
   * Exportar reporte
   * Endpoint: GET /api/projects/:id/export/:format
   */
  async exportReport(
    projectId: string,
    reportId: string,
    format: 'pdf' | 'excel' | 'csv' | 'json'
  ): Promise<Blob> {
    try {
      const response = await api.get(
        `${this.BASE_PATH}/${projectId}/reports/${reportId}/export/${format}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  /**
   * Programar reporte recurrente
   * Endpoint: POST /api/projects/:id/reports/schedule
   */
  async scheduleReport(
    projectId: string,
    schedule: {
      reportType: string;
      frequency: string;
      recipients: string[];
      format: string;
      config?: any;
    }
  ): Promise<any> {
    try {
      const response = await api.post<ApiResponse<any>>(
        `${this.BASE_PATH}/${projectId}/reports/schedule`,
        schedule
      );
      return response.data.data;
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }
}

export const timelineService = new TimelineService();
export default timelineService;

