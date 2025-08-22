import { useState, useEffect, useCallback, useRef } from 'react';
import { modulePermissionsService, UserModulePermissions, ModulePermission } from '../services/modulePermissions';
import { useAuthStore } from '../stores/useAuthStore';
import { infoLog } from '../config/logger';

interface UseModulePermissionsReturn {
  // Estado
  loading: boolean;
  error: string | null;
  permissions: UserModulePermissions | null;
  accessibleModules: ModulePermission[];
  
  // Funciones de verificación
  canAccessModule: (moduleId: string) => boolean;
  hasPermission: (moduleId: string, action: 'read' | 'write' | 'configure') => boolean;
  canRead: (moduleId: string) => boolean;
  canWrite: (moduleId: string) => boolean;
  canConfigure: (moduleId: string) => boolean;
  
  // Funciones de gestión
  refreshPermissions: () => Promise<void>;
  updateUserPermissions: (email: string, permissions: UserModulePermissions['permissions']) => Promise<void>;
  resetUserPermissions: (email: string) => Promise<void>;
}

export const useModulePermissions = (): UseModulePermissionsReturn => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<UserModulePermissions | null>(null);
  const [accessibleModules, setAccessibleModules] = useState<ModulePermission[]>([]);
  
  // Refs para controlar logs únicos
  const permissionsFallbackLogged = useRef(false);
  const noModulesAccessibleLogged = useRef(false);
  const invalidPermissionStructureLogged = useRef(false);

  // Cargar permisos del usuario actual
  const loadPermissions = useCallback(async () => {
    if (!user?.email) {
      infoLog('No hay usuario autenticado, usando permisos por defecto');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      infoLog('Cargando permisos de módulos para usuario', { email: user.email });
      
      const userPermissions = await modulePermissionsService.getMyPermissions();
      
      // Log detallado de la respuesta del backend
      infoLog('Respuesta completa del backend', { 
        userPermissions,
        hasPermissions: !!userPermissions.permissions,
        hasModules: !!userPermissions.permissions?.modules,
        accessibleModulesCount: userPermissions.accessibleModules?.length || 0,
        role: userPermissions.role 
      });
      
      setPermissions(userPermissions);
      setAccessibleModules(userPermissions.accessibleModules || []);
      
      infoLog('Permisos cargados exitosamente', { 
        accessibleModules: userPermissions.accessibleModules?.length || 0,
        role: userPermissions.role 
      });
      
    } catch (error) {
      infoLog('Error cargando permisos, usando fallback', { error });
      setError('Error al cargar permisos, usando configuración por defecto');
      
      // FALLBACK SEGURO: Si hay error, mostrar todos los módulos
      // Esto mantiene la funcionalidad existente
      setAccessibleModules([]); // Array vacío significa "todos los módulos"
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Cargar permisos al montar el hook
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Verificar si puede acceder a un módulo
  const canAccessModule = useCallback((moduleId: string): boolean => {
    // Si no hay permisos cargados o hay error, permitir acceso (fallback)
    if (!permissions) {
      // Log solo una vez por hook para evitar spam
      if (!permissionsFallbackLogged.current) {
        infoLog('No hay permisos cargados, usando fallback para todos los módulos');
        permissionsFallbackLogged.current = true;
      }
      return true;
    }
    
    // Si no hay módulos accesibles definidos, permitir acceso (fallback)
    if (!accessibleModules || accessibleModules.length === 0) {
      // Log solo una vez por hook para evitar spam
      if (!noModulesAccessibleLogged.current) {
        infoLog('No hay módulos accesibles definidos, permitiendo acceso a todos los módulos');
        noModulesAccessibleLogged.current = true;
      }
      return true;
    }
    
    const hasAccess = accessibleModules.some(module => module.id === moduleId);
    // Log solo para módulos específicos y con menos frecuencia
    if (!hasAccess) {
      infoLog('Acceso denegado a módulo', { moduleId, accessibleModules: accessibleModules.map(m => m.id) });
    }
    
    return hasAccess;
  }, [permissions, accessibleModules]);

  // Verificar permiso específico
  const hasPermission = useCallback((moduleId: string, action: 'read' | 'write' | 'configure'): boolean => {
    // Si no hay permisos cargados o hay error, permitir acceso (fallback)
    if (!permissions) {
      return true;
    }
    
    // Validación robusta de la estructura de permisos
    if (!permissions.permissions || !permissions.permissions.modules) {
      // Log solo una vez por hook para evitar spam
      if (!invalidPermissionStructureLogged.current) {
        infoLog('Estructura de permisos inválida, usando fallback', { 
          hasPermissions: !!permissions.permissions,
          hasModules: !!permissions.permissions?.modules 
        });
        invalidPermissionStructureLogged.current = true;
      }
      return true; // Fallback: permitir acceso
    }
    
    const modulePermissions = permissions.permissions.modules[moduleId];
    if (!modulePermissions) {
      return false;
    }
    
    return modulePermissions[action] || false;
  }, [permissions]);

  // Funciones de conveniencia
  const canRead = useCallback((moduleId: string) => hasPermission(moduleId, 'read'), [hasPermission]);
  const canWrite = useCallback((moduleId: string) => hasPermission(moduleId, 'write'), [hasPermission]);
  const canConfigure = useCallback((moduleId: string) => hasPermission(moduleId, 'configure'), [hasPermission]);

  // Refrescar permisos
  const refreshPermissions = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  // Actualizar permisos de un usuario
  const updateUserPermissions = useCallback(async (email: string, permissions: UserModulePermissions['permissions']) => {
    try {
      await modulePermissionsService.updateUserPermissions(email, permissions);
      infoLog('Permisos de usuario actualizados', { email });
    } catch (error) {
      infoLog('Error actualizando permisos de usuario', { error, email });
      throw error;
    }
  }, []);

  // Resetear permisos de un usuario
  const resetUserPermissions = useCallback(async (email: string) => {
    try {
      await modulePermissionsService.resetUserPermissions(email);
      infoLog('Permisos de usuario reseteados', { email });
    } catch (error) {
      infoLog('Error reseteando permisos de usuario', { error, email });
      throw error;
    }
  }, []);

  return {
    // Estado
    loading,
    error,
    permissions,
    accessibleModules,
    
    // Funciones de verificación
    canAccessModule,
    hasPermission,
    canRead,
    canWrite,
    canConfigure,
    
    // Funciones de gestión
    refreshPermissions,
    updateUserPermissions,
    resetUserPermissions
  };
};
