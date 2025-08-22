import type { 
  TeamMember, 
  TeamFilters, 
  TeamListResponse, 
  TeamApiResponse, 
  CreateAgentRequest 
} from '../../../types/team';
import api from '../../../services/api';
import { logger } from '../../../utils/logger';

// Servicio actualizado para usar los nuevos endpoints del backend

class TeamService {
  // Obtener lista de agentes - NUEVO ENDPOINT
  async getAgents(filters: TeamFilters = {}): Promise<TeamListResponse> {
    try {
      logger.systemInfo('Obteniendo lista de agentes', { filters });
      
      // Construir parámetros de consulta
      const params: Record<string, string> = {};
      
      if (filters.search) {
        params.search = filters.search;
      }
      
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      
      if (filters.role) {
        params.role = filters.role;
      }
      
      // Llamada al nuevo endpoint del backend
      const response = await api.get<TeamApiResponse<TeamListResponse>>('/api/team/agents', {
        params
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener agentes');
      }
      
      logger.systemInfo('Agentes obtenidos exitosamente', { 
        total: response.data.data.summary.total,
        active: response.data.data.summary.active 
      });
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error obteniendo agentes', { error });
      throw new Error('Error al obtener lista de agentes');
    }
  }
  
  // Crear nuevo agente - NUEVO ENDPOINT
  async createAgent(agentData: CreateAgentRequest): Promise<TeamMember> {
    try {
      logger.systemInfo('Creando nuevo agente', { 
        name: agentData.name, 
        email: agentData.email, 
        role: agentData.role 
      });
      
      // Llamada al nuevo endpoint del backend
      const response = await api.post<TeamApiResponse<TeamMember>>('/api/team/agents', agentData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear agente');
      }
      
      logger.systemInfo('Agente creado exitosamente', { 
        id: response.data.data.id,
        name: response.data.data.name,
        email: response.data.data.email 
      });
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error creando agente', { error, agentData });
      
      // Manejar errores específicos del backend
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        const errorMessage = apiError?.response?.data?.message || 'Error al crear agente';
        throw new Error(errorMessage);
      }
      
      throw new Error('Error al crear agente');
    }
  }
  
  // DEPRECATED: Método de compatibilidad con el sistema anterior
  async getMembers(filters: TeamFilters = {}): Promise<TeamListResponse> {
    // Redirigir al nuevo método
    return this.getAgents(filters);
  }
  
  // Obtener agente específico
  async getAgent(id: string): Promise<TeamMember> {
    try {
      logger.systemInfo('Obteniendo agente específico', { id });
      
      // Nota: Para GET usamos /api/team/agents/:id ya que este endpoint sí existe
      const encodedId = encodeURIComponent(id);
      const response = await api.get<TeamApiResponse<TeamMember>>(`/api/team/agents/${encodedId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener agente');
      }
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error obteniendo agente', { error, agentId: id });
      throw new Error('Error al obtener agente');
    }
  }
  
  // DEPRECATED: Método de compatibilidad
  async getMember(id: string): Promise<TeamMember> {
    return this.getAgent(id);
  }
  
  // Actualizar agente - CORREGIDO: Usar endpoint correcto del backend
  async updateAgent(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    try {
      logger.systemInfo('Actualizando agente', { id, updates });
      
      // ✅ CORRECTO: Usar PUT /api/team/:id como especifica el backend
      const encodedId = encodeURIComponent(id);
      const response = await api.put<TeamApiResponse<TeamMember>>(`/api/team/${encodedId}`, updates);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar agente');
      }
      
      logger.systemInfo('Agente actualizado exitosamente', { id });
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error actualizando agente', { error, agentId: id });
      throw new Error('Error al actualizar agente');
    }
  }
  
  // DEPRECATED: Método de compatibilidad
  async updateMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    return this.updateAgent(id, updates);
  }
}

export const teamService = new TeamService();