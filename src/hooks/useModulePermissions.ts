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
      
      // FALLBACK SEGURO: Si hay error, permitir acceso a todos los módulos
      // Crear una lista de todos los módulos disponibles como fallback
      const fallbackModules: ModulePermission[] = [
        { id: 'dashboard', name: 'Dashboard', description: 'Panel principal', level: 'basic' },
        { id: 'hr', name: 'Recursos Humanos', description: 'Módulo de empleados', level: 'advanced' },
        { id: 'notifications', name: 'Centro de Notificaciones', description: 'Gestión de notificaciones', level: 'basic' },
        { id: 'internal-chat', name: 'Chat Interno', description: 'Comunicación interna', level: 'basic' },
        { id: 'contacts', name: 'Clientes', description: 'Gestión de clientes', level: 'basic' },
        { id: 'campaigns', name: 'Campañas', description: 'Gestión de campañas', level: 'advanced' },
        { id: 'team', name: 'Equipo', description: 'Gestión de equipo', level: 'advanced' },
        { id: 'analytics', name: 'Analytics', description: 'Análisis de datos', level: 'advanced' },
        { id: 'ai', name: 'IA', description: 'Inteligencia artificial', level: 'advanced' },
        { id: 'settings', name: 'Configuración', description: 'Configuración del sistema', level: 'advanced' },
        { id: 'clients', name: 'Customer Hub', description: 'Centro de clientes', level: 'basic' },
        { id: 'chat', name: 'Mensajes', description: 'Sistema de mensajes', level: 'basic' },
        { id: 'phone', name: 'Teléfono', description: 'Sistema telefónico', level: 'basic' },
        { id: 'knowledge-base', name: 'Base de Conocimiento', description: 'Base de conocimientos', level: 'basic' },
        { id: 'supervision', name: 'Supervisión', description: 'Herramientas de supervisión', level: 'advanced' },
        { id: 'copilot', name: 'Copiloto IA', description: 'Asistente de IA', level: 'advanced' },
        { id: 'providers', name: 'Proveedores', description: 'Gestión de proveedores', level: 'advanced' },
        { id: 'warehouse', name: 'Almacén', description: 'Gestión de almacén', level: 'advanced' },
        { id: 'shipping', name: 'Envíos', description: 'Gestión de envíos', level: 'advanced' },
        { id: 'services', name: 'Servicios', description: 'Gestión de servicios', level: 'advanced' }
      ];
      
      setAccessibleModules(fallbackModules);
      infoLog('Usando módulos de fallback', { moduleCount: fallbackModules.length });
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
    // Si está cargando, permitir acceso temporalmente para evitar bloqueos
    if (loading) {
      return true;
    }
    
    // Si no hay permisos cargados, permitir acceso por defecto
    if (!permissions) {
      // Log solo una vez por hook para evitar spam
      if (!permissionsFallbackLogged.current) {
        infoLog('No hay permisos cargados, permitiendo acceso por defecto');
        permissionsFallbackLogged.current = true;
      }
      return true;
    }
    
    // Si es usuario inmune, permitir acceso a todos los módulos
    if (permissions.isImmuneUser) {
      return true;
    }
    
    // Si no hay módulos accesibles definidos, denegar acceso
    if (!accessibleModules || accessibleModules.length === 0) {
      // Log solo una vez por hook para evitar spam
      if (!noModulesAccessibleLogged.current) {
        infoLog('No hay módulos accesibles definidos, denegando acceso');
        noModulesAccessibleLogged.current = true;
      }
      return false;
    }
    
    const hasAccess = accessibleModules.some(module => module.id === moduleId);
    // Log solo para módulos específicos y con menos frecuencia
    if (!hasAccess) {
      infoLog('Acceso denegado a módulo', { moduleId, accessibleModules: accessibleModules.map(m => m.id) });
    }
    
    return hasAccess;
  }, [permissions, accessibleModules, loading]);

  // Verificar permiso específico
  const hasPermission = useCallback((moduleId: string, action: 'read' | 'write' | 'configure'): boolean => {
    // Si está cargando, permitir acceso temporalmente
    if (loading) {
      return true;
    }
    
    // Si no hay permisos cargados, permitir acceso por defecto
    if (!permissions) {
      return true;
    }
    
    // Si es usuario inmune, permitir acceso a todos los módulos
    if (permissions.isImmuneUser) {
      return true;
    }
    
    // Validación robusta de la estructura de permisos
    if (!permissions.permissions || !permissions.permissions.modules) {
      // Log solo una vez por hook para evitar spam
      if (!invalidPermissionStructureLogged.current) {
        infoLog('Estructura de permisos inválida, permitiendo acceso por defecto', { 
          hasPermissions: !!permissions.permissions,
          hasModules: !!permissions.permissions?.modules 
        });
        invalidPermissionStructureLogged.current = true;
      }
      return true; // Permitir acceso por defecto si la estructura es inválida
    }
    
    const modulePermissions = permissions.permissions.modules[moduleId];
    if (!modulePermissions) {
      return true; // Permitir acceso por defecto si no hay permisos específicos
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
