import React from 'react';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { useAuthContext } from '../contexts/useAuthContext';
import { AdminMigrationButton } from './AdminMigrationButton';
import { infoLog } from '../config/logger';

interface ProtectedRouteProps {
  moduleId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredAction?: 'read' | 'write' | 'configure';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  moduleId,
  children,
  fallback,
  requiredAction = 'read'
}) => {
  const { canAccessModule, hasPermission, loading, error } = useModulePermissions();
  const { backendUser } = useAuthContext();
  
  // Log de protección de ruta
  React.useEffect(() => {
    infoLog('🛡️ Verificando protección de ruta', { 
      moduleId, 
      requiredAction,
      loading,
      hasError: !!error
    });
  }, [moduleId, requiredAction, loading, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 mb-2">Verificando permisos...</div>
          <div className="text-sm text-gray-500">Módulo: {moduleId}</div>
        </div>
      </div>
    );
  }

  if (error) {
    infoLog('❌ Error en protección de ruta', { moduleId, error });
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-xl mb-2">⚠️ Error de Permisos</div>
          <div className="text-sm text-gray-700 mb-3">{error}</div>
          <div className="text-xs text-gray-500 mb-4">
            Módulo: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{moduleId}</span>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }

  // Verificar acceso básico al módulo
  const hasAccess = canAccessModule(moduleId);
  if (!hasAccess) {
    infoLog('🔒 Acceso denegado a módulo', { moduleId, requiredAction });
    
    // Si es admin y no tiene acceso, mostrar botón de migración
    // Verificar múltiples fuentes para detectar admin
    let isAdmin = false;
    
    // 1. Verificar backendUser
    if (backendUser) {
      isAdmin = backendUser.role?.toLowerCase().includes('admin') || 
                backendUser.email?.includes('admin') ||
                backendUser.email?.includes('@admin') ||
                backendUser.email === 'admin@company.com';
    }
    
    // 2. Verificar token JWT como fallback
    if (!isAdmin) {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          isAdmin = payload.email === 'admin@company.com' || 
                   payload.role === 'admin' ||
                   payload.email?.includes('admin');
        }
      } catch (error) {
        // Ignorar errores de parsing del token
      }
    }
    
    // 3. Verificar localStorage como último recurso
    if (!isAdmin) {
      const storedEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
      const storedRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
      isAdmin = storedEmail === 'admin@company.com' || 
                storedRole === 'admin' ||
                storedEmail?.includes('admin');
    }
    
    // Log para debugging
    infoLog('🔍 Verificando si es admin en ProtectedRoute', {
      email: backendUser?.email,
      role: backendUser?.role,
      isAdmin,
      moduleId,
      hasBackendUser: !!backendUser,
      hasToken: !!localStorage.getItem('access_token'),
      storedEmail: localStorage.getItem('userEmail'),
      storedRole: localStorage.getItem('userRole')
    });
    
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-lg mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-red-600 text-xl mb-2">🔒 Acceso Denegado</div>
          <div className="text-sm text-gray-700 mb-3">
            No tienes permisos para acceder a este módulo
          </div>
          <div className="text-xs text-gray-500 mb-4">
            Módulo: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{moduleId}</span>
          </div>
          
          {/* Botón de migración para admins */}
          {isAdmin && (
            <div className="mt-6">
              <AdminMigrationButton 
                onMigrationComplete={() => {
                  infoLog('✅ Migración de admin completada, recargando permisos');
                }}
              />
            </div>
          )}
          
          {/* Botón de migración forzada (temporal para testing) */}
          {!isAdmin && (
            <div className="mt-6">
              <div className="text-xs text-gray-400 mb-3">
                Contacta al administrador si necesitas acceso
              </div>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin-fix', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    });
                    
                    // Verificar que la respuesta sea JSON
                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                      throw new Error('El servidor devolvió HTML en lugar de JSON');
                    }
                    
                    const data = await response.json();
                    if (response.ok && data.success) {
                      alert(`✅ ¡Permisos arreglados! Módulos: ${data.data?.migration?.modulesCount || 'N/A'}. Recargando página...`);
                      window.location.reload();
                    } else {
                      alert(`❌ Error: ${data.message || 'Error del servidor'}`);
                    }
                  } catch (error) {
                    if (error instanceof Error && error.message.includes('HTML')) {
                      alert('❌ Error: El backend está devolviendo HTML en lugar de JSON. Verifica que el endpoint esté implementado correctamente.');
                    } else {
                      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error de conexión'}`);
                    }
                  }
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔧 Forzar Migración de Admin (Testing)
              </button>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Botón temporal para testing - Admin detectado: {isAdmin ? 'Sí' : 'No'}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Verificar permiso específico si se requiere
  if (requiredAction !== 'read') {
    const hasSpecificPermission = hasPermission(moduleId, requiredAction);
    if (!hasSpecificPermission) {
      infoLog('⚠️ Permisos insuficientes para acción específica', { 
        moduleId, 
        requiredAction,
        hasAccess
      });
      return fallback || (
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md mx-auto p-6 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-yellow-600 text-xl mb-2">⚠️ Permisos Insuficientes</div>
            <div className="text-sm text-gray-700 mb-3">
              Tienes acceso de lectura, pero no puedes realizar la acción: <strong>{requiredAction}</strong>
            </div>
            <div className="text-xs text-gray-500 mb-4">
              Módulo: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{moduleId}</span>
            </div>
            <div className="text-xs text-gray-400">
              Contacta al administrador para obtener permisos adicionales
            </div>
          </div>
        </div>
      );
    }
  }

  // Log de acceso exitoso
  infoLog('✅ Acceso concedido a ruta protegida', { 
    moduleId, 
    requiredAction,
    hasAccess,
    hasSpecificPermission: requiredAction === 'read' ? true : hasPermission(moduleId, requiredAction)
  });

  return <>{children}</>;
};
