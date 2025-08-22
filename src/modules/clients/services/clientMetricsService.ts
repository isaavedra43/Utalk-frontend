import type { ClientMetrics } from '../../../types/client';
import { api } from '../../../config/api';
import { infoLog } from '../../../config/logger';

// Interface para respuestas del backend
interface BackendMetricsResponse {
  success: boolean;
  data: ClientMetrics;
  message: string;
}

export const clientMetricsService = {
  // ✅ MÉTRICAS GENERALES - API REAL
  async getClientMetrics(): Promise<ClientMetrics> {
    try {
      infoLog('Obteniendo métricas de clientes desde API');
      
      const response = await api.get<BackendMetricsResponse>('/api/clients/metrics');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener métricas');
      }
      
      infoLog('Métricas de clientes obtenidas exitosamente');
      
      return response.data.data;
    } catch (error) {
      infoLog('Error al obtener métricas de clientes', { error });
      throw error;
    }
  },

  // 🔮 FUNCIONALIDADES FUTURAS - Métricas específicas (ya incluidas en getClientMetrics)
  
  // ✅ MÉTRICAS POR ETAPA - API REAL
  async getStageMetrics(): Promise<ClientMetrics['stageMetrics']> {
    try {
      infoLog('Obteniendo métricas por etapa desde API');
      
      const response = await api.get<{ success: boolean; data: ClientMetrics['stageMetrics'] }>('/api/clients/metrics/stages');
      
      if (!response.data.success) {
        throw new Error('Error al obtener métricas por etapa');
      }
      
      return response.data.data;
    } catch (error) {
      infoLog('Error al obtener métricas por etapa', { error });
      throw error;
    }
  },

  // ✅ MÉTRICAS POR AGENTE - API REAL
  async getAgentMetrics(): Promise<ClientMetrics['agentMetrics']> {
    try {
      infoLog('Obteniendo métricas por agente desde API');
      
      const response = await api.get<{ success: boolean; data: ClientMetrics['agentMetrics'] }>('/api/clients/metrics/agents');
      
      if (!response.data.success) {
        throw new Error('Error al obtener métricas por agente');
      }
      
      return response.data.data;
    } catch (error) {
      infoLog('Error al obtener métricas por agente', { error });
      throw error;
    }
  },

  // ✅ MÉTRICAS POR FUENTE - API REAL
  async getSourceMetrics(): Promise<ClientMetrics['sourceMetrics']> {
    try {
      infoLog('Obteniendo métricas por fuente desde API');
      
      const response = await api.get<{ success: boolean; data: ClientMetrics['sourceMetrics'] }>('/api/clients/metrics/sources');
      
      if (!response.data.success) {
        throw new Error('Error al obtener métricas por fuente');
      }
      
      return response.data.data;
    } catch (error) {
      infoLog('Error al obtener métricas por fuente', { error });
      throw error;
    }
  },

  // ✅ MÉTRICAS POR SEGMENTO - API REAL
  async getSegmentMetrics(): Promise<ClientMetrics['segmentMetrics']> {
    try {
      infoLog('Obteniendo métricas por segmento desde API');
      
      const response = await api.get<{ success: boolean; data: ClientMetrics['segmentMetrics'] }>('/api/clients/metrics/segments');
      
      if (!response.data.success) {
        throw new Error('Error al obtener métricas por segmento');
      }
      
      return response.data.data;
    } catch (error) {
      infoLog('Error al obtener métricas por segmento', { error });
      throw error;
    }
  }
}; 