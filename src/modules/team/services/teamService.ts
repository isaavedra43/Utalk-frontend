import type { 
  TeamMember, 
  TeamFilters, 
  TeamListResponse, 
  TeamApiResponse, 
  CreateAgentRequest 
} from '../../../types/team';
import api from '../../../services/api';
import { logger } from '../../../utils/logger';

// Servicio completamente alineado con el backend de agentes

interface CreateAgentCompleteRequest {
  // Información básica
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'agent' | 'viewer';
  phone?: string;
  password?: string;
  
  // Permisos básicos
  permissions?: {
    read: boolean;
    write: boolean;
    approve: boolean;
    configure: boolean;
    modules?: { [moduleId: string]: { read: boolean; write: boolean; configure: boolean } };
  };
  
  // Notificaciones
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  
  // Configuración
  configuration?: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    autoLogout: boolean;
    twoFactor: boolean;
  };
}

interface UpdateAgentRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'supervisor' | 'agent' | 'viewer';
  phone?: string;
  isActive?: boolean;
  newPassword?: string;
  permissions?: {
    read?: boolean;
    write?: boolean;
    approve?: boolean;
    configure?: boolean;
    modules?: { [moduleId: string]: { read: boolean; write: boolean; configure: boolean } };
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    desktop?: boolean;
  };
  configuration?: {
    language?: string;
    timezone?: string;
    theme?: 'light' | 'dark' | 'auto';
    autoLogout?: boolean;
    twoFactor?: boolean;
  };
}

interface AgentStatsResponse {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  byRole: {
    admin: number;
    supervisor: number;
    agent: number;
    viewer: number;
  };
  immuneUsers: number;
  performance: {
    averageCsat: number;
    totalChats: number;
    averageResponseTime: string;
    conversionRate: number;
  };
}

interface AgentPerformanceResponse {
  agent: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  performance: {
    period: string;
    totalChats: number;
    csat: number;
    conversionRate: number;
    responseTime: string;
    activeHours: number;
    efficiency: number;
  };
  trends: {
    chats: { current: number; previous: number; change: string };
    csat: { current: number; previous: number; change: string };
  };
  breakdown: {
    byDay: Array<{ date: string; chats: number; csat: number }>;
    byHour: Array<{ hour: string; chats: number; responseTime: string }>;
  };
}

interface AgentPermissionsResponse {
  agent: {
    id: string;
    name: string;
    email: string;
    role: string;
    isImmuneUser: boolean;
  };
  permissions: {
    basic: {
      read: boolean;
      write: boolean;
      approve: boolean;
      configure: boolean;
    };
    modules: { [moduleId: string]: { read: boolean; write: boolean; configure: boolean } };
  };
  accessibleModules: Array<{
    id: string;
    name: string;
    description: string;
    level: 'basic' | 'intermediate' | 'advanced';
  }>;
}

class TeamService {
  // ✅ ENDPOINT 1: Listar agentes
  async getAgents(filters: TeamFilters = {}): Promise<TeamListResponse> {
    try {
      logger.systemInfo('Obteniendo lista de agentes', { filters });
      
      // Construir parámetros de consulta
      const params: Record<string, string> = {};
      
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.role) params.role = filters.role;
      
      // Llamada al endpoint del backend
      const response = await api.get<TeamApiResponse<TeamListResponse>>('/api/team/agents', { params });
      
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
  
  // ✅ ENDPOINT 2: Crear agente completo
  async createAgentComplete(agentData: CreateAgentCompleteRequest): Promise<{ agent: TeamMember; accessInfo?: any }> {
    try {
      logger.systemInfo('Creando nuevo agente completo', { 
        name: agentData.name, 
        email: agentData.email, 
        role: agentData.role 
      });
      
      const response = await api.post<TeamApiResponse<{ agent: TeamMember; accessInfo?: any }>>('/api/team/agents', agentData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear agente');
      }
      
      logger.systemInfo('Agente creado exitosamente', { 
        id: response.data.data.agent.id,
        name: response.data.data.agent.name,
        email: response.data.data.agent.email 
      });
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error creando agente', { error, agentData });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { error?: { message?: string } } } };
        const errorMessage = apiError?.response?.data?.error?.message || 'Error al crear agente';
        throw new Error(errorMessage);
      }
      
      throw new Error('Error al crear agente');
    }
  }
  
  // ✅ ENDPOINT 3: Crear agente (método simple para compatibilidad)
  async createAgent(agentData: CreateAgentRequest): Promise<TeamMember> {
    const completeData: CreateAgentCompleteRequest = {
      name: agentData.name,
      email: agentData.email,
      role: agentData.role,
      phone: agentData.phone,
      permissions: agentData.permissions
    };
    
    const result = await this.createAgentComplete(completeData);
    return result.agent;
  }
  
  // ✅ MÉTODO AUXILIAR: Verificar si un email ya existe (usando lista de agentes)
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      logger.systemInfo('Verificando si el email existe', { email });
      
      // Obtener lista de agentes y verificar si el email ya existe
      const response = await this.getAgents({ search: email });
      const emailExists = response.agents.some(agent => agent.email.toLowerCase() === email.toLowerCase());
      
      return emailExists;
      
    } catch (error) {
      // Si hay error, asumimos que no existe para permitir el intento de creación
      logger.systemInfo('Error verificando email, continuando con creación', { email, error });
      return false;
    }
  }

  // ✅ ENDPOINT 4: Obtener agente específico
  async getAgent(id: string): Promise<TeamMember> {
    try {
      logger.systemInfo('Obteniendo agente específico', { id });
      
      const encodedId = encodeURIComponent(id);
      const response = await api.get<TeamApiResponse<{ agent: TeamMember }>>(`/api/team/agents/${encodedId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener agente');
      }
      
      return response.data.data.agent;
      
    } catch (error) {
      logger.systemInfo('Error obteniendo agente', { error, agentId: id });
      throw new Error('Error al obtener agente');
    }
  }
  
  // ✅ ENDPOINT 5: Actualizar agente
  async updateAgent(id: string, updates: UpdateAgentRequest): Promise<TeamMember> {
    try {
      logger.systemInfo('Actualizando agente', { id, updates });
      
      const encodedId = encodeURIComponent(id);
      const response = await api.put<TeamApiResponse<{ agent: TeamMember }>>(`/api/team/agents/${encodedId}`, updates);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar agente');
      }
      
      logger.systemInfo('Agente actualizado exitosamente', { id });
      
      return response.data.data.agent;
      
    } catch (error) {
      logger.systemInfo('Error actualizando agente', { error, agentId: id });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { error?: { message?: string } } } };
        const errorMessage = apiError?.response?.data?.error?.message || 'Error al actualizar agente';
        throw new Error(errorMessage);
      }
      
      throw new Error('Error al actualizar agente');
    }
  }
  
  // ✅ ENDPOINT 6: Eliminar agente
  async deleteAgent(id: string, reason?: string): Promise<{ deletedAgent: any; deletedAt: string; deletedBy: string; reason?: string }> {
    try {
      logger.systemInfo('Eliminando agente', { id, reason });
      
      const encodedId = encodeURIComponent(id);
      const response = await api.delete<TeamApiResponse<any>>(`/api/team/agents/${encodedId}`, {
        data: { confirm: true, reason }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al eliminar agente');
      }
      
      logger.systemInfo('Agente eliminado exitosamente', { id });
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error eliminando agente', { error, agentId: id });
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { error?: { message?: string } } } };
        const errorMessage = apiError?.response?.data?.error?.message || 'Error al eliminar agente';
        throw new Error(errorMessage);
      }
      
      throw new Error('Error al eliminar agente');
    }
  }
  
  // ✅ ENDPOINT 7: Estadísticas de agentes
  async getAgentsStats(): Promise<AgentStatsResponse> {
    try {
      logger.systemInfo('Obteniendo estadísticas de agentes');
      
      const response = await api.get<TeamApiResponse<AgentStatsResponse>>('/api/team/agents/stats');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener estadísticas');
      }
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error obteniendo estadísticas', { error });
      throw new Error('Error al obtener estadísticas de agentes');
    }
  }
  
  // ✅ ENDPOINT 8: Rendimiento de agente
  async getAgentPerformance(id: string, period: string = '30d', metrics: string = 'all'): Promise<AgentPerformanceResponse> {
    try {
      logger.systemInfo('Obteniendo rendimiento de agente', { id, period, metrics });
      
      const encodedId = encodeURIComponent(id);
      const params = { period, metrics };
      const response = await api.get<TeamApiResponse<AgentPerformanceResponse>>(`/api/team/agents/${encodedId}/performance`, { params });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener rendimiento');
      }
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error obteniendo rendimiento', { error, agentId: id });
      throw new Error('Error al obtener rendimiento del agente');
    }
  }
  
  // ✅ ENDPOINT 9: Permisos de agente
  async getAgentPermissions(id: string): Promise<AgentPermissionsResponse> {
    try {
      logger.systemInfo('Obteniendo permisos de agente', { id });
      
      const encodedId = encodeURIComponent(id);
      const response = await api.get<TeamApiResponse<AgentPermissionsResponse>>(`/api/team/agents/${encodedId}/permissions`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener permisos');
      }
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error obteniendo permisos', { error, agentId: id });
      throw new Error('Error al obtener permisos del agente');
    }
  }
  
  // ✅ ENDPOINT 10: Actualizar permisos de agente
  async updateAgentPermissions(id: string, permissions: any): Promise<AgentPermissionsResponse> {
    try {
      logger.systemInfo('Actualizando permisos de agente', { id, permissions });
      
      const encodedId = encodeURIComponent(id);
      const response = await api.put<TeamApiResponse<AgentPermissionsResponse>>(`/api/team/agents/${encodedId}/permissions`, { permissions });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar permisos');
      }
      
      return response.data.data;
      
    } catch (error) {
      logger.systemInfo('Error actualizando permisos', { error, agentId: id });
      throw new Error('Error al actualizar permisos del agente');
    }
  }
  
  // DEPRECATED: Métodos de compatibilidad
  async getMembers(filters: TeamFilters = {}): Promise<TeamListResponse> {
    return this.getAgents(filters);
  }
  
  async getMember(id: string): Promise<TeamMember> {
    return this.getAgent(id);
  }
  
  async updateMember(id: string, updates: any): Promise<TeamMember> {
    return this.updateAgent(id, updates);
  }
}

export const teamService = new TeamService();