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
    read: boolean;
    write: boolean;
    approve: boolean;
    configure: boolean;
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

// Función para normalizar datos del backend de forma tolerante a variaciones
const normalizeBackendData = (backendResponse: any): UserModulePermissions => {
  const { user, permissions, modulePermissions } = backendResponse.data || {};

  // Orígenes posibles en API actuales: data.permissions y/o data.user
  const permissionsBlock = permissions || {};
  const modulesFromPermissions = permissionsBlock?.permissions?.modules || permissionsBlock?.modules || {};
  const accessibleFromPermissions = permissionsBlock?.accessibleModules || [];
  const accessibleFromModulePerms = modulePermissions?.accessibleModules || [];

  // Unificar lista de módulos accesibles y enriquecer con acciones
  const rawAccessible = [...accessibleFromPermissions, ...accessibleFromModulePerms];
  const seenIds = new Set<string>();
  const unifiedAccessible = rawAccessible
    .filter((m: any) => {
      if (!m || !m.id) return false;
      if (seenIds.has(m.id)) return false;
      seenIds.add(m.id);
      return true;
    })
    .map((m: any) => {
      const permsForModule = modulesFromPermissions[m.id] || {};
      return {
        id: m.id,
        name: m.name || m.id,
        description: m.description || '',
        level: m.level || 'basic',
        actions: {
          read: !!permsForModule.read,
          write: !!permsForModule.write,
          configure: !!permsForModule.configure
        }
      } as ModulePermission;
    });

  // Datos de usuario: tomar de data.user o de data.permissions
  const email = user?.email || permissionsBlock?.email || '';
  const role = user?.role || permissionsBlock?.role || 'user';

  // Log para debug
  infoLog('🔍 Normalizando datos del backend:', {
    user,
    permissions,
    modulePermissions,
    modules: modulesFromPermissions,
    accessibleModules: unifiedAccessible
  });

  return {
    email,
    role,
    accessibleModules: unifiedAccessible,
    permissions: {
      read: !!(permissionsBlock?.permissions?.read || permissionsBlock?.read),
      write: !!(permissionsBlock?.permissions?.write || permissionsBlock?.write),
      approve: !!(permissionsBlock?.permissions?.approve || permissionsBlock?.approve),
      configure: !!(permissionsBlock?.permissions?.configure || permissionsBlock?.configure),
      modules: modulesFromPermissions
    }
  };
};

// Cache para evitar múltiples llamadas simultáneas
let permissionsCache: UserModulePermissions | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const modulePermissionsService = {
  // Obtener mis permisos actuales
  async getMyPermissions(): Promise<UserModulePermissions> {
    try {
      // Verificar si tenemos permisos en cache válidos
      if (permissionsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        infoLog('Usando permisos en cache');
        return permissionsCache;
      }

      infoLog('Obteniendo mis permisos de módulos');

      const response = await api.get<ModulePermissionsResponse>('/api/module-permissions/my-permissions');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener permisos');
      }
      
      infoLog('Permisos obtenidos exitosamente', {
        accessibleModules: response.data.data.permissions?.accessibleModules?.length || 0
      });

      // Normalizar datos del backend según las indicaciones
      const normalizedData = normalizeBackendData(response.data);

      // Guardar en cache
      permissionsCache = normalizedData;
      cacheTimestamp = Date.now();

      return normalizedData;
      
    } catch (error) {
      infoLog('Error obteniendo permisos', { error });
      throw new Error('Error al obtener permisos de módulos');
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
      infoLog('Error obteniendo módulos', { error });
      throw new Error('Error al obtener módulos disponibles');
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
      
      // Normalizar datos del backend según las indicaciones
      const normalizedData = normalizeBackendData(response.data);
      return normalizedData;
      
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
      infoLog('Actualizando permisos de usuario', { email, permissions });
      
      const encodedEmail = encodeURIComponent(email);
      const response = await api.put<ModulePermissionsResponse>(`/api/module-permissions/user/${encodedEmail}`, {
        permissions
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al actualizar permisos del usuario');
      }
      
      infoLog('Permisos de usuario actualizados exitosamente', { email });
      
      // Normalizar datos del backend según las indicaciones
      const normalizedData = normalizeBackendData(response.data);
      return normalizedData;
      
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
  }
};
