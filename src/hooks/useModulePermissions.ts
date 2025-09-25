import { useState, useEffect, useCallback, useRef } from 'react';
import { modulePermissionsService, UserModulePermissions, ModulePermission } from '../services/modulePermissions';
import { useAuthStore } from '../stores/useAuthStore';
import { infoLog } from '../config/logger';

// Función para crear permisos de fallback inteligentes
const createFallbackPermissions = (user: any): UserModulePermissions => {
  const systemModules = [
    { id: 'dashboard', name: 'Dashboard', level: 'basic', category: 'core' },
    { id: 'notifications', name: 'Notificaciones', level: 'basic', category: 'core' },
    { id: 'chat', name: 'Chat', level: 'basic', category: 'communication' },
    { id: 'phone', name: 'Teléfono', level: 'basic', category: 'communication' },
    { id: 'internal-chat', name: 'Chat Interno', level: 'basic', category: 'communication' },
    { id: 'clients', name: 'Clientes', level: 'intermediate', category: 'crm' },
    { id: 'team', name: 'Equipo', level: 'advanced', category: 'management' },
    { id: 'hr', name: 'Recursos Humanos', level: 'advanced', category: 'management' },
    { id: 'supervision', name: 'Supervisión', level: 'advanced', category: 'management' },
    { id: 'campaigns', name: 'Campañas', level: 'intermediate', category: 'marketing' },
    { id: 'providers', name: 'Proveedores', level: 'advanced', category: 'operations' },
    { id: 'warehouse', name: 'Almacén', level: 'intermediate', category: 'operations' },
    { id: 'shipping', name: 'Envíos', level: 'intermediate', category: 'operations' },
    { id: 'copilot', name: 'Copiloto IA', level: 'intermediate', category: 'ai' },
    { id: 'knowledge-base', name: 'Base de Conocimiento', level: 'basic', category: 'support' },
    { id: 'services', name: 'Servicios', level: 'advanced', category: 'configuration' }
  ];

  const permissions: { [moduleId: string]: { read: boolean; write: boolean; configure: boolean } } = {};
  const accessibleModules: ModulePermission[] = [];

  systemModules.forEach(module => {
    let modulePermissions = { read: false, write: false, configure: false };
    
    // Lógica de permisos por rol (fallback inteligente)
    const role = user?.role?.toLowerCase() || 'agent';
    
    if (role.includes('admin')) {
      // Admin: acceso completo
      modulePermissions = { read: true, write: true, configure: true };
    } else if (role.includes('supervisor')) {
      // Supervisor: acceso amplio con configuración limitada
      modulePermissions = { 
        read: true, 
        write: true, 
        configure: module.level !== 'advanced' 
      };
    } else if (role.includes('agent')) {
      // Agente: acceso básico según categoría
      const allowedCategories = ['core', 'communication', 'support'];
      const hasAccess = allowedCategories.includes(module.category);
      modulePermissions = { 
        read: hasAccess, 
        write: hasAccess && module.level === 'basic', 
        configure: false 
      };
    } else {
      // Viewer o rol desconocido: solo lectura en core
      const isCore = module.category === 'core';
      modulePermissions = { 
        read: isCore, 
        write: false, 
        configure: false 
      };
    }

    permissions[module.id] = modulePermissions;

    // Si tiene al menos acceso de lectura, agregarlo a módulos accesibles
    if (modulePermissions.read) {
      accessibleModules.push({
        id: module.id,
        name: module.name,
        description: `Módulo de ${module.name.toLowerCase()}`,
        level: module.level as 'basic' | 'intermediate' | 'advanced',
        actions: modulePermissions
      });
    }
  });

  return {
    email: user?.email || 'unknown@user.com',
    role: user?.role || 'agent',
    accessibleModules,
    permissions: {
      modules: permissions
    }
  };
};

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
  
  // Funciones adicionales
  validateModuleAccess: (email: string, moduleId: string, action: 'read' | 'write' | 'configure') => Promise<boolean>;
  getPermissionsStats: () => Promise<any>;
  createAgentWithPermissions: (agentData: any) => Promise<UserModulePermissions>;
  updateAgentWithPermissions: (agentId: string, agentData: any) => Promise<UserModulePermissions>;
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
      
      infoLog('🔐 Cargando permisos reales del backend para usuario', { email: user.email });
      
      const userPermissions = await modulePermissionsService.getMyPermissions();
      
      // Validar que la respuesta del backend sea válida
      if (!userPermissions || !userPermissions.permissions) {
        throw new Error('Respuesta inválida del backend - sin estructura de permisos');
      }
      
      // Log detallado de la respuesta del backend
      infoLog('✅ Permisos reales obtenidos del backend', { 
        email: userPermissions.email,
        role: userPermissions.role,
        hasPermissions: !!userPermissions.permissions,
        hasModules: !!userPermissions.permissions?.modules,
        accessibleModulesCount: userPermissions.accessibleModules?.length || 0,
        modulePermissionsCount: Object.keys(userPermissions.permissions?.modules || {}).length
      });
      
      setPermissions(userPermissions);
      setAccessibleModules(userPermissions.accessibleModules || []);
      
      // Log de módulos específicos para debugging
      if (userPermissions.accessibleModules?.length > 0) {
        infoLog('📋 Módulos accesibles desde backend', { 
          modules: userPermissions.accessibleModules.map(m => ({
            id: m.id,
            name: m.name,
            level: m.level,
            actions: m.actions
          }))
        });
      }
      
      infoLog('🚀 Permisos cargados y aplicados exitosamente', { 
        accessibleModules: userPermissions.accessibleModules?.length || 0,
        role: userPermissions.role,
        email: userPermissions.email
      });
      
    } catch (error) {
      infoLog('❌ Error cargando permisos del backend', { 
        error: error.message || error,
        email: user.email,
        fallback: 'usando permisos locales'
      });
      
      setError(`Error al cargar permisos: ${error.message || 'Backend no disponible'}`);
      
      // FALLBACK INTELIGENTE: Crear permisos básicos basados en el rol del usuario
      const fallbackPermissions = createFallbackPermissions(user);
      setPermissions(fallbackPermissions);
      setAccessibleModules(fallbackPermissions.accessibleModules || []);
      
      infoLog('🔄 Usando permisos de fallback', { 
        email: user.email,
        role: user.role,
        fallbackModules: fallbackPermissions.accessibleModules?.length || 0
      });
      
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.role]);

  // Cargar permisos al montar el hook (OPTIMIZADO)
  useEffect(() => {
    loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]); // ✅ Solo cuando user.email cambie, no cuando loadPermissions se recree

  // Verificar si puede acceder a un módulo
  const canAccessModule = useCallback((moduleId: string): boolean => {
    // Validación básica
    if (!moduleId) {
      infoLog('⚠️ moduleId no proporcionado para verificación de acceso');
      return false;
    }

    // BYPASS ESPECIAL PARA ADMIN: Si es admin@company.com, permitir acceso a todo
    const isAdminUser = user?.email === 'admin@company.com' || 
                       permissions?.email === 'admin@company.com';
    
    if (isAdminUser) {
      infoLog('👑 BYPASS ADMIN: Acceso completo para admin@company.com', { 
        moduleId, 
        userEmail: user?.email,
        permissionsEmail: permissions?.email 
      });
      return true;
    }

    // Si no hay permisos cargados, usar fallback conservador
    if (!permissions) {
      if (!permissionsFallbackLogged.current) {
        infoLog('🔄 No hay permisos cargados, usando fallback conservador', { moduleId });
        permissionsFallbackLogged.current = true;
      }
      // Solo permitir módulos básicos como fallback
      const basicModules = ['dashboard', 'notifications'];
      return basicModules.includes(moduleId);
    }
    
    // Verificar usando la estructura de permisos del backend
    const modulePermissions = permissions.permissions?.modules?.[moduleId];
    if (modulePermissions) {
      const hasReadAccess = modulePermissions.read === true;
      
      if (hasReadAccess) {
        infoLog('✅ Acceso concedido a módulo desde backend', { 
          moduleId,
          permissions: modulePermissions
        });
      } else {
        infoLog('❌ Acceso denegado a módulo desde backend', { 
          moduleId,
          permissions: modulePermissions
        });
      }
      
      return hasReadAccess;
    }
    
    // Fallback: verificar en accessibleModules
    if (accessibleModules && accessibleModules.length > 0) {
      const hasAccess = accessibleModules.some(module => module.id === moduleId);
      
      if (!hasAccess) {
        infoLog('❌ Módulo no encontrado en accessibleModules', { 
          moduleId, 
          availableModules: accessibleModules.map(m => m.id) 
        });
      } else {
        infoLog('✅ Acceso concedido desde accessibleModules', { moduleId });
      }
      
      return hasAccess;
    }
    
    // Si no hay módulos accesibles definidos, denegar acceso por seguridad
    if (!noModulesAccessibleLogged.current) {
      infoLog('🔒 No hay módulos accesibles definidos, denegando acceso por seguridad', { moduleId });
      noModulesAccessibleLogged.current = true;
    }
    
    return false;
  }, [permissions, accessibleModules]);

  // Verificar permiso específico
  const hasPermission = useCallback((moduleId: string, action: 'read' | 'write' | 'configure'): boolean => {
    // Validación básica
    if (!moduleId || !action) {
      infoLog('⚠️ Parámetros inválidos para verificación de permiso', { moduleId, action });
      return false;
    }

    // BYPASS ESPECIAL PARA ADMIN: Si es admin@company.com, permitir todas las acciones
    const isAdminUser = user?.email === 'admin@company.com' || 
                       permissions?.email === 'admin@company.com';
    
    if (isAdminUser) {
      infoLog('👑 BYPASS ADMIN: Permiso completo para admin@company.com', { 
        moduleId, 
        action,
        userEmail: user?.email,
        permissionsEmail: permissions?.email 
      });
      return true;
    }

    // Si no hay permisos cargados, usar fallback conservador
    if (!permissions) {
      infoLog('🔄 No hay permisos cargados para verificar acción específica', { moduleId, action });
      // Solo permitir lectura en módulos básicos como fallback
      if (action === 'read') {
        const basicModules = ['dashboard', 'notifications'];
        return basicModules.includes(moduleId);
      }
      return false;
    }
    
    // Validación robusta de la estructura de permisos
    if (!permissions.permissions || !permissions.permissions.modules) {
      if (!invalidPermissionStructureLogged.current) {
        infoLog('⚠️ Estructura de permisos inválida del backend', { 
          hasPermissions: !!permissions.permissions,
          hasModules: !!permissions.permissions?.modules,
          moduleId,
          action
        });
        invalidPermissionStructureLogged.current = true;
      }
      return false; // Por seguridad, denegar acceso si la estructura es inválida
    }
    
    const modulePermissions = permissions.permissions.modules[moduleId];
    if (!modulePermissions) {
      infoLog('❌ Módulo no encontrado en permisos del backend', { 
        moduleId, 
        action,
        availableModules: Object.keys(permissions.permissions.modules) 
      });
      return false;
    }
    
    const hasAccess = modulePermissions[action] === true;
    
    if (hasAccess) {
      infoLog(`✅ Permiso ${action} concedido para módulo ${moduleId}`, { 
        moduleId, 
        action,
        allPermissions: modulePermissions
      });
    } else {
      infoLog(`❌ Permiso ${action} denegado para módulo ${moduleId}`, { 
        moduleId, 
        action,
        allPermissions: modulePermissions
      });
    }
    
    return hasAccess;
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

  // Validar acceso a módulo
  const validateModuleAccess = useCallback(async (email: string, moduleId: string, action: 'read' | 'write' | 'configure') => {
    try {
      return await modulePermissionsService.validateModuleAccess(email, moduleId, action);
    } catch (error) {
      infoLog('Error validando acceso a módulo', { error, email, moduleId, action });
      return false;
    }
  }, []);

  // Obtener estadísticas de permisos
  const getPermissionsStats = useCallback(async () => {
    try {
      return await modulePermissionsService.getPermissionsStats();
    } catch (error) {
      infoLog('Error obteniendo estadísticas de permisos', { error });
      throw error;
    }
  }, []);

  // Crear agente con permisos
  const createAgentWithPermissions = useCallback(async (agentData: any) => {
    try {
      const result = await modulePermissionsService.createAgentWithPermissions(agentData);
      infoLog('Agente creado con permisos', { email: agentData.email });
      return result;
    } catch (error) {
      infoLog('Error creando agente con permisos', { error, email: agentData.email });
      throw error;
    }
  }, []);

  // Actualizar agente con permisos
  const updateAgentWithPermissions = useCallback(async (agentId: string, agentData: any) => {
    try {
      const result = await modulePermissionsService.updateAgentWithPermissions(agentId, agentData);
      infoLog('Agente actualizado con permisos', { agentId });
      return result;
    } catch (error) {
      infoLog('Error actualizando agente con permisos', { error, agentId });
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
    resetUserPermissions,
    
    // Funciones adicionales
    validateModuleAccess,
    getPermissionsStats,
    createAgentWithPermissions,
    updateAgentWithPermissions
  };
};
