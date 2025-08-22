import { api } from '../config/api';
import { logger } from '../config/logger';

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
      logger.systemInfo('Obteniendo mis permisos de módulos');
      
      const response = await api.get<ModulePermissionsResponse>('/api/module-permissions/my-permissions');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener permisos');
      }
      
      logger.systemInfo('Permisos obtenidos exitosamente', { 
        accessibleModules: response.data.data.permissions?.accessibleModules?.length || 0 
      });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      logger.systemInfo('Error obteniendo permisos', { error });
      throw new Error('Error al obtener permisos de módulos');
    }
  },

  // Obtener lista de módulos disponibles
  async getAvailableModules(): Promise<{ [moduleId: string]: ModulePermission }> {
    try {
      logger.systemInfo('Obteniendo módulos disponibles');
      
      const response = await api.get<ModulePermissionsResponse>('/api/module-permissions/modules');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener módulos');
      }
      
      logger.systemInfo('Módulos obtenidos exitosamente', { 
        totalModules: Object.keys(response.data.data.modules || {}).length 
      });
      
      return response.data.data.modules || {};
      
    } catch (error) {
      logger.systemInfo('Error obteniendo módulos', { error });
      throw new Error('Error al obtener módulos disponibles');
    }
  },

  // Obtener permisos de un usuario específico
  async getUserPermissions(email: string): Promise<UserModulePermissions> {
    try {
      logger.systemInfo('Obteniendo permisos de usuario', { email });
      
      const encodedEmail = encodeURIComponent(email);
      const response = await api.get<ModulePermissionsResponse>(`/api/module-permissions/user/${encodedEmail}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener permisos del usuario');
      }
      
      logger.systemInfo('Permisos de usuario obtenidos exitosamente', { email });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      logger.systemInfo('Error obteniendo permisos de usuario', { error, email });
      throw new Error('Error al obtener permisos del usuario');
    }
  },

  // Obtener permisos por defecto de un rol
  async getRolePermissions(role: string): Promise<UserModulePermissions> {
    try {
      logger.systemInfo('Obteniendo permisos por defecto del rol', { role });
      
      const response = await api.get<ModulePermissionsResponse>(`/api/module-permissions/role/${role}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener permisos del rol');
      }
      
      logger.systemInfo('Permisos del rol obtenidos exitosamente', { role });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      logger.systemInfo('Error obteniendo permisos del rol', { error, role });
      throw new Error('Error al obtener permisos del rol');
    }
  },

  // Obtener resumen de todos los usuarios
  async getUsersSummary(): Promise<UserModulePermissions[]> {
    try {
      logger.systemInfo('Obteniendo resumen de usuarios');
      
      const response = await api.get<ModulePermissionsResponse>('/api/module-permissions/users-summary');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener resumen de usuarios');
      }
      
      logger.systemInfo('Resumen de usuarios obtenido exitosamente', { 
        totalUsers: response.data.data.users?.length || 0 
      });
      
      return response.data.data.users || [];
      
    } catch (error) {
      logger.systemInfo('Error obteniendo resumen de usuarios', { error });
      throw new Error('Error al obtener resumen de usuarios');
    }
  },

  // Actualizar permisos de un usuario
  async updateUserPermissions(email: string, permissions: UserModulePermissions['permissions']): Promise<UserModulePermissions> {
    try {
      logger.systemInfo('Actualizando permisos de usuario', { email });
      
      const encodedEmail = encodeURIComponent(email);
      const response = await api.put<ModulePermissionsResponse>(`/api/module-permissions/user/${encodedEmail}`, {
        permissions
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar permisos del usuario');
      }
      
      logger.systemInfo('Permisos de usuario actualizados exitosamente', { email });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      logger.systemInfo('Error actualizando permisos de usuario', { error, email });
      throw new Error('Error al actualizar permisos del usuario');
    }
  },

  // Resetear permisos de un usuario a valores por defecto
  async resetUserPermissions(email: string): Promise<UserModulePermissions> {
    try {
      logger.systemInfo('Reseteando permisos de usuario', { email });
      
      const encodedEmail = encodeURIComponent(email);
      const response = await api.post<ModulePermissionsResponse>(`/api/module-permissions/user/${encodedEmail}/reset`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al resetear permisos del usuario');
      }
      
      logger.systemInfo('Permisos de usuario reseteados exitosamente', { email });
      
      return response.data.data.permissions!;
      
    } catch (error) {
      logger.systemInfo('Error reseteando permisos de usuario', { error, email });
      throw new Error('Error al resetear permisos del usuario');
    }
  }
};
