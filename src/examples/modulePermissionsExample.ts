/**
 * EJEMPLO DE USO DEL SISTEMA DE PERMISOS DE MÓDULOS
 * 
 * Este archivo muestra cómo usar el sistema de permisos de módulos
 * que acabamos de implementar en el frontend.
 */

import { modulePermissionsService } from '../services/modulePermissions';

/**
 * EJEMPLO 1: Configurar un agente de RRHH
 * Solo puede acceder a módulos relacionados con recursos humanos
 */
export const configureHRAgent = async (agentEmail: string) => {
  try {
    const hrAgentPermissions = {
      modules: {
        // Módulos permitidos para RRHH
        'dashboard': { read: true, write: false, configure: false },
        'hr': { read: true, write: true, configure: false },
        'team': { read: true, write: true, configure: false },
        'notifications': { read: true, write: false, configure: false },
        'knowledge-base': { read: true, write: false, configure: false },
        'internal-chat': { read: true, write: true, configure: false },
        
        // Módulos restringidos
        'clients': { read: false, write: false, configure: false },
        'chat': { read: false, write: false, configure: false },
        'campaigns': { read: false, write: false, configure: false },
        'phone': { read: false, write: false, configure: false },
        'supervision': { read: false, write: false, configure: false },
        'copilot': { read: false, write: false, configure: false },
        'inventory': { read: false, write: false, configure: false }
      }
    };

    await modulePermissionsService.updateUserPermissions(agentEmail, hrAgentPermissions);
    console.log('✅ Agente de RRHH configurado exitosamente');
    
    return {
      success: true,
      message: 'Agente configurado para RRHH',
      allowedModules: ['dashboard', 'hr', 'team', 'notifications', 'knowledge-base', 'internal-chat']
    };
  } catch (error) {
    console.error('❌ Error configurando agente de RRHH:', error);
    throw error;
  }
};

/**
 * EJEMPLO 2: Configurar un agente de ventas
 * Solo puede acceder a módulos relacionados con ventas y clientes
 */
export const configureSalesAgent = async (agentEmail: string) => {
  try {
    const salesAgentPermissions = {
      modules: {
        // Módulos permitidos para ventas
        'dashboard': { read: true, write: false, configure: false },
        'clients': { read: true, write: true, configure: false },
        'chat': { read: true, write: true, configure: false },
        'campaigns': { read: true, write: true, configure: false },
        'phone': { read: true, write: true, configure: false },
        'knowledge-base': { read: true, write: false, configure: false },
        'copilot': { read: true, write: false, configure: false },
        'notifications': { read: true, write: false, configure: false },
        
        // Módulos restringidos
        'hr': { read: false, write: false, configure: false },
        'team': { read: false, write: false, configure: false },
        'internal-chat': { read: true, write: true, configure: false }, // Permitido para coordinación
        'supervision': { read: false, write: false, configure: false },
        'inventory': { read: false, write: false, configure: false }
      }
    };

    await modulePermissionsService.updateUserPermissions(agentEmail, salesAgentPermissions);
    console.log('✅ Agente de ventas configurado exitosamente');
    
    return {
      success: true,
      message: 'Agente configurado para ventas',
      allowedModules: ['dashboard', 'clients', 'chat', 'campaigns', 'phone', 'knowledge-base', 'copilot', 'notifications', 'internal-chat']
    };
  } catch (error) {
    console.error('❌ Error configurando agente de ventas:', error);
    throw error;
  }
};

/**
 * EJEMPLO 3: Configurar un supervisor
 * Tiene acceso amplio a la mayoría de módulos
 */
export const configureSupervisor = async (supervisorEmail: string) => {
  try {
    const supervisorPermissions = {
      modules: {
        // Acceso completo a módulos operativos
        'dashboard': { read: true, write: true, configure: false },
        'clients': { read: true, write: true, configure: false },
        'chat': { read: true, write: true, configure: false },
        'campaigns': { read: true, write: true, configure: false },
        'phone': { read: true, write: true, configure: false },
        'knowledge-base': { read: true, write: true, configure: false },
        'copilot': { read: true, write: false, configure: false },
        'notifications': { read: true, write: true, configure: false },
        'internal-chat': { read: true, write: true, configure: false },
        'team': { read: true, write: true, configure: false },
        'supervision': { read: true, write: true, configure: false },
        
        // Acceso limitado a módulos administrativos
        'hr': { read: true, write: false, configure: false }, // Solo lectura
        'inventory': { read: true, write: true, configure: false } // Acceso completo al inventario
      }
    };

    await modulePermissionsService.updateUserPermissions(supervisorEmail, supervisorPermissions);
    console.log('✅ Supervisor configurado exitosamente');
    
    return {
      success: true,
      message: 'Supervisor configurado exitosamente',
      allowedModules: Object.keys(supervisorPermissions.modules)
    };
  } catch (error) {
    console.error('❌ Error configurando supervisor:', error);
    throw error;
  }
};

/**
 * EJEMPLO 4: Configurar un agente de inventario/almacén
 * Solo puede acceder al módulo de inventario y módulos básicos
 */
export const configureInventoryAgent = async (agentEmail: string) => {
  try {
    const inventoryAgentPermissions = {
      modules: {
        // Módulos permitidos para inventario
        'dashboard': { read: true, write: false, configure: false },
        'inventory': { read: true, write: true, configure: true }, // Acceso completo al inventario
        'notifications': { read: true, write: false, configure: false },
        'internal-chat': { read: true, write: true, configure: false }, // Para coordinación
        
        // Módulos restringidos
        'clients': { read: false, write: false, configure: false },
        'chat': { read: false, write: false, configure: false },
        'campaigns': { read: false, write: false, configure: false },
        'phone': { read: false, write: false, configure: false },
        'knowledge-base': { read: true, write: false, configure: false }, // Solo lectura para consultas
        'hr': { read: false, write: false, configure: false },
        'team': { read: false, write: false, configure: false },
        'supervision': { read: false, write: false, configure: false },
        'copilot': { read: false, write: false, configure: false }
      }
    };

    await modulePermissionsService.updateUserPermissions(agentEmail, inventoryAgentPermissions);
    console.log('✅ Agente de inventario configurado exitosamente');
    
    return {
      success: true,
      message: 'Agente configurado para inventario',
      allowedModules: ['dashboard', 'inventory', 'notifications', 'internal-chat', 'knowledge-base']
    };
  } catch (error) {
    console.error('❌ Error configurando agente de inventario:', error);
    throw error;
  }
};

/**
 * EJEMPLO 5: Verificar permisos de un usuario
 */
export const checkUserPermissions = async (userEmail: string) => {
  try {
    const userPermissions = await modulePermissionsService.getUserPermissions(userEmail);
    
    console.log('📋 Permisos del usuario:', userEmail);
    console.log('🔗 Rol:', userPermissions.role);
    console.log('📦 Módulos accesibles:');
    
    const accessibleModules = userPermissions.accessibleModules || [];
    accessibleModules.forEach(module => {
      console.log(`  - ${module.name} (${module.id})`);
    });
    
    console.log('🔐 Permisos detallados:');
    Object.entries(userPermissions.permissions.modules).forEach(([moduleId, perms]) => {
      const permissions = perms as { read: boolean; write: boolean; configure: boolean };
      if (permissions.read || permissions.write || permissions.configure) {
        console.log(`  - ${moduleId}:`, {
          read: permissions.read ? '✅' : '❌',
          write: permissions.write ? '✅' : '❌',
          configure: permissions.configure ? '✅' : '❌'
        });
      }
    });
    
    return userPermissions;
  } catch (error) {
    console.error('❌ Error verificando permisos:', error);
    throw error;
  }
};

/**
 * EJEMPLO 5: Obtener todos los módulos disponibles
 */
export const listAvailableModules = async () => {
  try {
    const modules = await modulePermissionsService.getAvailableModules();
    
    console.log('📦 Módulos disponibles en el sistema:');
    Object.entries(modules).forEach(([moduleId, moduleInfo]) => {
      const module = moduleInfo as { name: string; description: string; level: string };
      console.log(`  - ${module.name} (${moduleId})`);
      console.log(`    📝 ${module.description}`);
      console.log(`    🏷️ Nivel: ${module.level}`);
      console.log('');
    });
    
    return modules;
  } catch (error) {
    console.error('❌ Error obteniendo módulos:', error);
    throw error;
  }
};

/**
 * EJEMPLO DE USO EN COMPONENTES REACT
 */
export const ExampleUsageInComponent = () => {
  // Este es un ejemplo de cómo usar el hook useModulePermissions en un componente
  
  /*
  import { useModulePermissions } from '../hooks/useModulePermissions';
  
  const MyComponent = () => {
    const { canAccessModule, hasPermission, loading, accessibleModules } = useModulePermissions();
    
    if (loading) {
      return <div>Cargando permisos...</div>;
    }
    
    return (
      <div>
        {canAccessModule('hr') && (
          <button onClick={() => navigate('/hr')}>
            Ir a RRHH
          </button>
        )}
        
        {hasPermission('clients', 'write') && (
          <button onClick={() => createClient()}>
            Crear Cliente
          </button>
        )}
        
        <h3>Módulos Accesibles:</h3>
        <ul>
          {accessibleModules.map(module => (
            <li key={module.id}>
              {module.name} - Permisos: 
              {module.permissions?.read && ' Leer'}
              {module.permissions?.write && ' Escribir'}
              {module.permissions?.configure && ' Configurar'}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  */
};

/**
 * INSTRUCCIONES DE USO:
 * 
 * 1. Para configurar un agente de RRHH:
 *    await configureHRAgent('rrhh@empresa.com');
 * 
 * 2. Para configurar un agente de ventas:
 *    await configureSalesAgent('vendedor@empresa.com');
 * 
 * 3. Para configurar un supervisor:
 *    await configureSupervisor('supervisor@empresa.com');
 * 
 * 4. Para configurar un agente de inventario:
 *    await configureInventoryAgent('inventario@empresa.com');
 * 
 * 5. Para verificar permisos:
 *    await checkUserPermissions('usuario@empresa.com');
 * 
 * 6. Para ver todos los módulos disponibles:
 *    await listAvailableModules();
 */
