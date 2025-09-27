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

// ✅ ESTRUCTURAS DE DATOS POR DEFECTO PARA EVITAR ERRORES UNDEFINED
const getDefaultAgentPermissions = () => ({
  read: false,
  write: false,
  approve: false,
  configure: false,
  modules: {
    dashboard: { read: false, write: false, configure: false },
    contacts: { read: false, write: false, configure: false },
    campaigns: { read: false, write: false, configure: false },
    team: { read: false, write: false, configure: false },
    analytics: { read: false, write: false, configure: false },
    ai: { read: false, write: false, configure: false },
    settings: { read: false, write: false, configure: false },
    hr: { read: false, write: false, configure: false },
    clients: { read: false, write: false, configure: false },
    notifications: { read: false, write: false, configure: false },
    chat: { read: false, write: false, configure: false },
    'internal-chat': { read: false, write: false, configure: false },
    phone: { read: false, write: false, configure: false },
    'knowledge-base': { read: false, write: false, configure: false },
    supervision: { read: false, write: false, configure: false },
    copilot: { read: false, write: false, configure: false },
    providers: { read: false, write: false, configure: false },
    warehouse: { read: false, write: false, configure: false },
    shipping: { read: false, write: false, configure: false },
    services: { read: false, write: false, configure: false }
  }
});

const getDefaultAgentData = (): TeamMember => ({
  id: '',
  email: '',
  name: '',
  role: 'agent',
  phone: undefined,
  avatar: '',
  isActive: true,
  permissions: getDefaultAgentPermissions(),
  performance: {
    totalChats: 0,
    csat: 0,
    conversionRate: 0,
    responseTime: '0s'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// ✅ FUNCIÓN DE VALIDACIÓN ROBUSTA DE DATOS
const validateAgentData = (agent: any): boolean => {
  if (!agent || typeof agent !== 'object') {
    logger.systemError('❌ Datos de agente inválidos: objeto vacío o undefined');
    return false;
  }

  // Validar estructura básica
  if (!agent.id || !agent.email || !agent.name) {
    logger.systemError('❌ Datos de agente incompletos');
    return false;
  }

  // Validar estructura de permisos
  if (!agent.permissions || typeof agent.permissions !== 'object') {
    logger.systemError('❌ Permisos de agente inválidos');
    return false;
  }

  // Validar módulos de permisos
  if (!agent.permissions.modules || typeof agent.permissions.modules !== 'object') {
    logger.systemError('❌ Módulos de permisos inválidos');
    return false;
  }

  return true;
};

// ✅ FUNCIÓN PARA NORMALIZAR DATOS DEL BACKEND
const normalizeAgentData = (backendData: any): TeamMember => {
  if (!backendData) {
    logger.systemInfo('⚠️ Datos del backend vacíos, usando estructura por defecto');
    return getDefaultAgentData();
  }

  // Si es respuesta directa del backend con estructura user/permissions
  if (backendData.user && backendData.permissions) {
    const { user, permissions } = backendData;
    
    // Normalizar permisos
    const normalizedPermissions = {
      read: permissions.read || false,
      write: permissions.write || false,
      approve: permissions.approve || false,
      configure: permissions.configure || false,
      modules: {}
    };

    // Mapear permisos de módulos
    if (permissions.modules && typeof permissions.modules === 'object') {
      Object.keys(permissions.modules).forEach(moduleId => {
        const modulePerms = (permissions.modules as any)[moduleId];
        if (modulePerms) {
          (normalizedPermissions.modules as any)[moduleId] = {
            read: modulePerms.read || false,
            write: modulePerms.write || false,
            configure: modulePerms.configure || false
          };
        }
      });
    }

    return {
      id: user.id || user.email || '',
      email: user.email || '',
      name: user.name || '',
      role: user.role || 'agent',
      phone: user.phone || undefined,
      avatar: user.avatar || generateAvatar(user.name || user.email),
      isActive: user.isActive !== undefined ? user.isActive : true,
      permissions: normalizedPermissions,
      performance: user.performance || {
        totalChats: 0,
        csat: 0,
        conversionRate: 0,
        responseTime: '0s'
      },
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString()
    };
  }

  // Si es estructura directa de TeamMember
  if (validateAgentData(backendData)) {
    return {
      ...getDefaultAgentData(),
      ...backendData,
      permissions: {
        ...getDefaultAgentPermissions(),
        ...backendData.permissions,
        modules: {
          ...getDefaultAgentPermissions().modules,
          ...backendData.permissions?.modules
        }
      }
    };
  }

  logger.systemInfo('⚠️ Estructura de datos del backend inválida, usando estructura por defecto');
  return getDefaultAgentData();
};

// ✅ FUNCIÓN AUXILIAR PARA GENERAR AVATAR
const generateAvatar = (name: string): string => {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

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
      
      const response = await api.post<TeamApiResponse<any>>('/api/team/agents', agentData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear agente');
      }
      
      // ✅ MANEJAR LA ESTRUCTURA REAL DE LA RESPUESTA DEL BACKEND
      const createdAgent = response.data.data;
      
      logger.systemInfo('Agente creado exitosamente', { 
        id: createdAgent.id,
        name: createdAgent.name,
        email: createdAgent.email 
      });
      
      // ✅ RETORNAR EN EL FORMATO ESPERADO POR EL FRONTEND
      return {
        agent: createdAgent,
        accessInfo: undefined // El backend no devuelve accessInfo en esta versión
      };
      
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
      logger.systemInfo('🔍 Obteniendo agente específico', { id });
      
      const encodedId = encodeURIComponent(id);
      const response = await api.get<TeamApiResponse<{ agent: TeamMember }>>(`/api/team/agents/${encodedId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener agente');
      }
      
      const rawData = response.data.data.agent;
      logger.systemInfo('📥 Datos recibidos del backend', { rawData });
      
      // ✅ NORMALIZAR Y VALIDAR DATOS
      const normalizedData = normalizeAgentData(rawData);
      
      if (validateAgentData(normalizedData)) {
        logger.systemInfo('✅ Datos del agente validados y normalizados');
        return normalizedData;
      } else {
        logger.systemInfo('⚠️ Datos inválidos, usando estructura por defecto');
        return getDefaultAgentData();
      }
      
    } catch (error) {
      logger.systemError('❌ Error obteniendo agente');
      
      // En caso de error, retornar datos por defecto en lugar de fallar
      logger.systemInfo('⚠️ Retornando datos por defecto debido a error');
      return getDefaultAgentData();
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
      logger.systemInfo('🔍 Obteniendo permisos de agente', { id });
      
      const encodedId = encodeURIComponent(id);
      const response = await api.get<TeamApiResponse<AgentPermissionsResponse>>(`/api/team/agents/${encodedId}/permissions`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener permisos');
      }
      
      const rawData = response.data.data;
      logger.systemInfo('📥 Permisos recibidos del backend', { rawData });
      
      // ✅ VALIDAR Y NORMALIZAR PERMISOS
      if (!rawData || !rawData.permissions || !rawData.permissions.modules) {
        logger.systemInfo('⚠️ Estructura de permisos inválida, usando permisos por defecto');
        return {
          agent: {
            id: id,
            name: 'Usuario',
            email: id,
            role: 'agent',
            isImmuneUser: false
          },
          permissions: {
            basic: {
              read: false,
              write: false,
              approve: false,
              configure: false
            },
            modules: getDefaultAgentPermissions().modules
          },
          accessibleModules: []
        };
      }
      
      logger.systemInfo('✅ Permisos validados exitosamente');
      return rawData;
      
    } catch (error) {
      logger.systemError('❌ Error obteniendo permisos');
      
      // Retornar permisos por defecto en caso de error
      logger.systemInfo('⚠️ Retornando permisos por defecto debido a error');
      return {
        agent: {
          id: id,
          name: 'Usuario',
          email: id,
          role: 'agent',
          isImmuneUser: false
        },
        permissions: {
          basic: {
            read: false,
            write: false,
            approve: false,
            configure: false
          },
          modules: getDefaultAgentPermissions().modules
        },
        accessibleModules: []
      };
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

  // ✅ NUEVO MÉTODO: Obtener permisos de módulos de usuario usando el servicio de módulos
  async getUserModulePermissions(email: string): Promise<any> {
    try {
      logger.systemInfo('🔍 Obteniendo permisos de módulos de usuario', { email });
      
      // Usar el servicio de permisos de módulos
      const { modulePermissionsService } = await import('../../../services/modulePermissions');
      const permissions = await modulePermissionsService.getUserPermissions(email);
      
      logger.systemInfo('📥 Permisos de módulos obtenidos', { 
        email,
        modulesCount: Object.keys(permissions.permissions.modules || {}).length
      });
      
      return permissions;
      
    } catch (error) {
      logger.systemError('❌ Error obteniendo permisos de módulos');
      
      // Retornar permisos por defecto en caso de error
      logger.systemInfo('⚠️ Retornando permisos por defecto debido a error');
      return {
        email: email,
        role: 'agent',
        accessibleModules: [],
        permissions: {
          modules: getDefaultAgentPermissions().modules
        }
      };
    }
  }

  // ✅ NUEVO MÉTODO: Actualizar permisos de módulos de usuario
  async updateUserModulePermissions(email: string, permissions: any): Promise<any> {
    try {
      logger.systemInfo('🔍 Actualizando permisos de módulos de usuario', { email, permissions });
      
      // Usar el servicio de permisos de módulos
      const { modulePermissionsService } = await import('../../../services/modulePermissions');
      const updatedPermissions = await modulePermissionsService.updateUserPermissions(email, permissions);
      
      logger.systemInfo('✅ Permisos de módulos actualizados exitosamente', { email });
      
      return updatedPermissions;
      
    } catch (error) {
      logger.systemError('❌ Error actualizando permisos de módulos');
      throw new Error('Error al actualizar permisos de módulos del usuario');
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