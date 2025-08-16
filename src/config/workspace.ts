/**
 * Configuración de workspace y tenant
 */

// Configuración por defecto
const DEFAULT_WORKSPACE_ID = 'default';
const DEFAULT_TENANT_ID = 'na';

/**
 * Obtiene la configuración de workspace desde múltiples fuentes
 * Prioridad: Variables de entorno > localStorage > valores por defecto
 */
export const getWorkspaceConfig = () => {
  // 1. Intentar obtener de variables de entorno
  const envWorkspaceId = import.meta.env.VITE_WORKSPACE_ID;
  const envTenantId = import.meta.env.VITE_TENANT_ID;
  
  if (envWorkspaceId && envWorkspaceId !== DEFAULT_WORKSPACE_ID) {
    console.log('🔧 Workspace config - Usando valores de entorno:', {
      workspaceId: envWorkspaceId,
      tenantId: envTenantId || DEFAULT_TENANT_ID
    });
    return {
      workspaceId: envWorkspaceId,
      tenantId: envTenantId || DEFAULT_TENANT_ID
    };
  }
  
  // 2. Intentar obtener del localStorage (si el usuario ya se ha autenticado)
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.workspaceId && user.workspaceId !== DEFAULT_WORKSPACE_ID) {
      console.log('🔧 Workspace config - Usando valores del usuario:', {
        workspaceId: user.workspaceId,
        tenantId: user.tenantId || DEFAULT_TENANT_ID
      });
      return {
        workspaceId: user.workspaceId,
        tenantId: user.tenantId || DEFAULT_TENANT_ID
      };
    }
  } catch (error) {
    console.warn('⚠️ Error leyendo workspace del localStorage:', error);
  }
  
  // 3. Usar valores por defecto
  console.warn('⚠️ Workspace config - Usando valores por defecto:', {
    workspaceId: DEFAULT_WORKSPACE_ID,
    tenantId: DEFAULT_TENANT_ID
  });
  
  return {
    workspaceId: DEFAULT_WORKSPACE_ID,
    tenantId: DEFAULT_TENANT_ID
  };
};

/**
 * Valida si la configuración de workspace es válida
 */
export const isValidWorkspaceConfig = (config: { workspaceId: string; tenantId: string }) => {
  return config.workspaceId && 
         config.workspaceId !== DEFAULT_WORKSPACE_ID && 
         config.tenantId && 
         config.tenantId !== DEFAULT_TENANT_ID;
};

/**
 * Obtiene la configuración actual de workspace
 */
export const WORKSPACE_CONFIG = getWorkspaceConfig(); 