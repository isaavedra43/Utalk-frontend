import { api } from '../config/api';
import { infoLog } from '../config/logger';

// Tipos para los permisos de módulos
export interface ModulePermission {
  id: string;
  name: string;
  description: string;
  level: 'basic' | 'intermediate' | 'advanced';
  actions: {
    read: boolean;
    write: boolean;
    configure: boolean;
  };
}

export interface UserModulePermissions {
  email: string;
  role: string;
  accessibleModules: ModulePermission[];
  permissions: {
    modules: {
      [moduleId: string]: {
        read: boolean;
        write: boolean;
        configure: boolean;
      };
    };
  };
}

export interface ModulePermissionsResponse {
  success: boolean;
  data: {
    modules?: { [moduleId: string]: ModulePermission };
    permissions?: UserModulePermissions;
    users?: UserModulePermissions[];
  };
  message?: string;
}

export const modulePermissionsService = {
  // Obtener mis permisos actuales
  async getMyPermissions(): Promise<UserModulePermissions> {
    try {
      infoLog('Obteniendo mis permisos de módulos');
      
      const response = await api.get<ModulePermissionsResponse>('/api/module-permissions/my-permissions');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener permisos');
      }
      
      infoLog('Permisos obtenidos exitosamente', { 
        accessibleModules: response.data.data.permissions?.accessibleModules?.length || 0 
      });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      infoLog('❌ Error obteniendo permisos del backend', { 
        error: error.message || error,
        endpoint: '/api/module-permissions/my-permissions'
      });
      
      // Re-lanzar el error para que el hook lo maneje apropiadamente
      throw new Error(`Error conectando con backend: ${error.message || 'Servicio no disponible'}`);
    }
  },

  // Obtener lista de módulos disponibles
  async getAvailableModules(): Promise<{ [moduleId: string]: ModulePermission }> {
    try {
      infoLog('Obteniendo módulos disponibles');
      
      const response = await api.get<ModulePermissionsResponse>('/api/module-permissions/modules');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener módulos');
      }
      
      infoLog('Módulos obtenidos exitosamente', { 
        totalModules: Object.keys(response.data.data.modules || {}).length 
      });
      
      return response.data.data.modules || {};
      
    } catch (error) {
      infoLog('❌ Error obteniendo módulos del backend', { 
        error: error.message || error,
        endpoint: '/api/module-permissions/modules'
      });
      throw new Error(`Error obteniendo módulos: ${error.message || 'Servicio no disponible'}`);
    }
  },

  // Obtener permisos de un usuario específico
  async getUserPermissions(email: string): Promise<UserModulePermissions> {
    try {
      infoLog('Obteniendo permisos de usuario', { email });
      
      const encodedEmail = encodeURIComponent(email);
      const response = await api.get<ModulePermissionsResponse>(`/api/module-permissions/user/${encodedEmail}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener permisos del usuario');
      }
      
      infoLog('Permisos de usuario obtenidos exitosamente', { email });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      infoLog('Error obteniendo permisos de usuario', { error, email });
      throw new Error('Error al obtener permisos del usuario');
    }
  },

  // Obtener permisos por defecto de un rol
  async getRolePermissions(role: string): Promise<UserModulePermissions> {
    try {
      infoLog('Obteniendo permisos por defecto del rol', { role });
      
      const response = await api.get<ModulePermissionsResponse>(`/api/module-permissions/role/${role}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener permisos del rol');
      }
      
      infoLog('Permisos del rol obtenidos exitosamente', { role });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      infoLog('Error obteniendo permisos del rol', { error, role });
      throw new Error('Error al obtener permisos del rol');
    }
  },

  // Obtener resumen de todos los usuarios
  async getUsersSummary(): Promise<UserModulePermissions[]> {
    try {
      infoLog('Obteniendo resumen de usuarios');
      
      const response = await api.get<ModulePermissionsResponse>('/api/module-permissions/users-summary');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener resumen de usuarios');
      }
      
      infoLog('Resumen de usuarios obtenido exitosamente', { 
        totalUsers: response.data.data.users?.length || 0 
      });
      
      return response.data.data.users || [];
      
    } catch (error) {
      infoLog('Error obteniendo resumen de usuarios', { error });
      throw new Error('Error al obtener resumen de usuarios');
    }
  },

  // Actualizar permisos de un usuario
  async updateUserPermissions(email: string, permissions: UserModulePermissions['permissions']): Promise<UserModulePermissions> {
    try {
      infoLog('Actualizando permisos de usuario', { email });
      
      const encodedEmail = encodeURIComponent(email);
      const response = await api.put<ModulePermissionsResponse>(`/api/module-permissions/user/${encodedEmail}`, {
        permissions
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar permisos del usuario');
      }
      
      infoLog('Permisos de usuario actualizados exitosamente', { email });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      infoLog('Error actualizando permisos de usuario', { error, email });
      throw new Error('Error al actualizar permisos del usuario');
    }
  },

  // Resetear permisos de un usuario a valores por defecto
  async resetUserPermissions(email: string): Promise<UserModulePermissions> {
    try {
      infoLog('Reseteando permisos de usuario', { email });
      
      const encodedEmail = encodeURIComponent(email);
      const response = await api.post<ModulePermissionsResponse>(`/api/module-permissions/user/${encodedEmail}/reset`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al resetear permisos del usuario');
      }
      
      infoLog('Permisos de usuario reseteados exitosamente', { email });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      infoLog('Error reseteando permisos de usuario', { error, email });
      throw new Error('Error al resetear permisos del usuario');
    }
  },

  // Crear agente con permisos de módulos
  async createAgentWithPermissions(agentData: {
    name: string;
    email: string;
    role: string;
    phone?: string;
    permissions: {
      read: boolean;
      write: boolean;
      approve: boolean;
      configure: boolean;
    };
    modulePermissions: {
      modules: {
        [moduleId: string]: {
          read: boolean;
          write: boolean;
          configure: boolean;
        };
      };
    };
  }): Promise<UserModulePermissions> {
    try {
      infoLog('Creando agente con permisos de módulos', { email: agentData.email });
      
      const response = await api.post<ModulePermissionsResponse>('/api/agents', agentData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al crear agente');
      }
      
      infoLog('Agente creado exitosamente con permisos', { email: agentData.email });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      infoLog('Error creando agente con permisos', { error, email: agentData.email });
      throw new Error('Error al crear agente con permisos de módulos');
    }
  },

  // Actualizar agente con permisos de módulos
  async updateAgentWithPermissions(agentId: string, agentData: {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    permissions?: {
      read: boolean;
      write: boolean;
      approve: boolean;
      configure: boolean;
    };
    modulePermissions?: {
      modules: {
        [moduleId: string]: {
          read: boolean;
          write: boolean;
          configure: boolean;
        };
      };
    };
  }): Promise<UserModulePermissions> {
    try {
      infoLog('Actualizando agente con permisos de módulos', { agentId });
      
      const response = await api.put<ModulePermissionsResponse>(`/api/agents/${agentId}`, agentData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar agente');
      }
      
      infoLog('Agente actualizado exitosamente con permisos', { agentId });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      infoLog('Error actualizando agente con permisos', { error, agentId });
      throw new Error('Error al actualizar agente con permisos de módulos');
    }
  },

  // Validar permisos de un usuario para un módulo específico
  async validateModuleAccess(email: string, moduleId: string, action: 'read' | 'write' | 'configure'): Promise<boolean> {
    try {
      infoLog('Validando acceso a módulo', { email, moduleId, action });
      
      const encodedEmail = encodeURIComponent(email);
      const response = await api.get<{ success: boolean; data: { hasAccess: boolean } }>(
        `/api/module-permissions/validate/${encodedEmail}/${moduleId}/${action}`
      );
      
      if (!response.data.success) {
        return false;
      }
      
      return response.data.data.hasAccess;
      
    } catch (error) {
      infoLog('Error validando acceso a módulo', { error, email, moduleId, action });
      return false;
    }
  },

  // Obtener estadísticas de permisos
  async getPermissionsStats(): Promise<{
    totalUsers: number;
    totalModules: number;
    permissionsByRole: { [role: string]: number };
    mostUsedModules: { moduleId: string; count: number }[];
  }> {
    try {
      infoLog('Obteniendo estadísticas de permisos');
      
      const response = await api.get<{ success: boolean; data: any }>('/api/module-permissions/stats');
      
      if (!response.data.success) {
        throw new Error('Error al obtener estadísticas');
      }
      
      return response.data.data;
      
    } catch (error) {
      infoLog('Error obteniendo estadísticas de permisos', { error });
      throw new Error('Error al obtener estadísticas de permisos');
    }
  }
};
