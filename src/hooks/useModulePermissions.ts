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
      infoLog('Error cargando permisos, denegando por defecto', { error });
      setError('Error al cargar permisos');
      // Política segura: sin permisos del backend, no se otorga acceso
      setAccessibleModules([]);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // Cargar permisos al montar el hook (OPTIMIZADO)
  useEffect(() => {
    loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]); // ✅ Solo cuando user.email cambie, no cuando loadPermissions se recree

  // Verificar si puede acceder a un módulo
  const canAccessModule = useCallback((moduleId: string): boolean => {
    // Política segura: mientras carga, negar para evitar mostrar módulos indebidos
    if (loading) {
      return false;
    }
    
    // TEMPORAL: Permitir acceso al módulo de inventario mientras se configura en el backend
    if (moduleId === 'inventory') {
      infoLog('Acceso temporal permitido al módulo de inventario', { moduleId });
      return true;
    }
    
    // Si no hay permisos aún, negar por defecto
    if (!permissions) {
      if (!permissionsFallbackLogged.current) {
        infoLog('No hay permisos cargados, denegando por defecto');
        permissionsFallbackLogged.current = true;
      }
      return false;
    }
    
    // Si es usuario inmune, permitir acceso a todos los módulos
    if (permissions.isImmuneUser) {
      infoLog('Usuario inmune, permitiendo acceso a todos los módulos', { moduleId });
      return true;
    }
    
    // Verificar si tiene permisos específicos para el módulo
    const hasModulePermissions = permissions.permissions?.modules?.[moduleId];
    if (hasModulePermissions && (hasModulePermissions.read || hasModulePermissions.write || hasModulePermissions.configure)) {
      infoLog('Acceso permitido por permisos específicos del módulo', { 
        moduleId, 
        permissions: hasModulePermissions 
      });
      return true;
    }
    
    // Verificar si está en la lista de módulos accesibles
    if (accessibleModules && accessibleModules.length > 0) {
      const hasAccess = accessibleModules.some(module => module.id === moduleId);
      infoLog('Verificando acceso por lista de módulos accesibles', { 
        moduleId, 
        hasAccess,
        accessibleModules: accessibleModules.map(m => m.id)
      });
      return hasAccess;
    }
    
    // Si no hay módulos accesibles definidos, negar por defecto
    infoLog('No hay módulos accesibles definidos, denegando por defecto', { moduleId });
    return false;
  }, [permissions, accessibleModules, loading]);

  // Verificar permiso específico
  const hasPermission = useCallback((moduleId: string, action: 'read' | 'write' | 'configure'): boolean => {
    // Política segura: mientras carga o si no hay permisos, negar
    if (loading) {
      return false;
    }
    
    // TEMPORAL: Permitir todos los permisos al módulo de inventario mientras se configura en el backend
    if (moduleId === 'inventory') {
      infoLog('Permiso temporal otorgado al módulo de inventario', { moduleId, action });
      return true;
    }
    
    if (!permissions) {
      return false;
    }
    
    // Si es usuario inmune, permitir acceso a todos los módulos
    if (permissions.isImmuneUser) {
      return true;
    }
    
    // Validación robusta de la estructura de permisos
    if (!permissions.permissions || !permissions.permissions.modules) {
      if (!invalidPermissionStructureLogged.current) {
        infoLog('Estructura de permisos inválida, denegando por defecto', { 
          hasPermissions: !!permissions.permissions,
          hasModules: !!permissions.permissions?.modules 
        });
        invalidPermissionStructureLogged.current = true;
      }
      return false; // Denegar si la estructura es inválida
    }
    
    const modulePermissions = permissions.permissions.modules[moduleId];
    if (!modulePermissions) {
      return false; // Denegar si no hay permisos específicos
    }
    
    return modulePermissions[action] || false;
  }, [permissions, loading]);

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
