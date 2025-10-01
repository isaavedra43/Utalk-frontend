import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { useAuthContext } from '../contexts/useAuthContext';
import { infoLog } from '../config/logger';
import { LogOut, RefreshCw, Home } from 'lucide-react';

interface ProtectedRouteProps {
  moduleId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredAction?: 'read' | 'write' | 'configure';
}

// Lista de módulos que no requieren verificación de permisos (TEMPORAL)
const MODULES_WITHOUT_PERMISSION_CHECK: string[] = [];

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  moduleId,
  children,
  fallback,
  requiredAction = 'read'
}) => {
  const navigate = useNavigate();

  // ✅ Usar contexto con manejo seguro de errores
  let authContext;
  try {
    authContext = useAuthContext();
  } catch (error) {
    console.warn('⚠️ useAuthContext no disponible en ProtectedRoute, usando estado seguro');
    authContext = {
      logout: async () => {},
      isAuthenticated: false,
      loading: false,
      user: null,
      backendUser: null
    };
  }

  const { logout } = authContext;
  const { canAccessModule, hasPermission, loading, error, accessibleModules } = useModulePermissions();
  
  // ✅ Redirección automática si no tiene acceso
  useEffect(() => {
    if (!loading && !canAccessModule(moduleId)) {
      // Buscar el primer módulo con permisos
      const firstAccessibleModule = accessibleModules && accessibleModules.length > 0 
        ? accessibleModules[0] 
        : null;
      
      if (firstAccessibleModule) {
        infoLog('🔀 Redirigiendo a módulo con permisos', { 
          from: moduleId, 
          to: firstAccessibleModule.id 
        });
        
        // Redirigir automáticamente después de 2 segundos
        setTimeout(() => {
          navigate(`/${firstAccessibleModule.id}`, { replace: true });
        }, 2000);
      }
    }
  }, [loading, moduleId, canAccessModule, accessibleModules, navigate]);
  
  // Para módulos sin verificación de permisos, permitir acceso directo (TEMPORAL)
  if (MODULES_WITHOUT_PERMISSION_CHECK.includes(moduleId)) {
    infoLog('Acceso directo a módulo sin verificación de permisos', { moduleId });
    return <>{children}</>;
  }

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  // Verificar acceso al módulo
  const hasModuleAccess = canAccessModule(moduleId);
  
  // Verificar permiso específico si se requiere
  const hasSpecificPermission = hasPermission(moduleId, requiredAction);
  
  // Si no tiene acceso al módulo o al permiso específico
  if (!hasModuleAccess || !hasSpecificPermission) {
    infoLog('Acceso denegado a módulo', { 
      moduleId, 
      requiredAction, 
      hasModuleAccess, 
      hasSpecificPermission,
      error 
    });

    // Si se proporciona un fallback personalizado, usarlo
    if (fallback) {
      return <>{fallback}</>;
    }

    // Obtener el primer módulo con permisos para redirección
    const firstAccessibleModule = accessibleModules && accessibleModules.length > 0 
      ? accessibleModules[0] 
      : null;

    // Fallback por defecto con redirección automática y opciones
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center max-w-md w-full">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a este módulo.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            Módulo: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{moduleId}</span>
            {requiredAction !== 'read' && (
              <>
                <br />
                Permiso requerido: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{requiredAction}</span>
              </>
            )}
          </div>
          
          {/* Mensaje de redirección automática */}
          {firstAccessibleModule && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800">
                ⏱️ Redirigiendo automáticamente a <strong>{firstAccessibleModule.name}</strong> en 2 segundos...
              </p>
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex flex-col gap-3">
            {/* Botón para ir al módulo con permisos */}
            {firstAccessibleModule && (
              <button
                onClick={() => navigate(`/${firstAccessibleModule.id}`, { replace: true })}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Home className="h-5 w-5" />
                Ir a {firstAccessibleModule.name}
              </button>
            )}
            
            {/* Botón de recargar */}
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 active:scale-95 transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              Recargar Página
            </button>
            
            {/* Botón de cerrar sesión */}
            <button
              onClick={async () => {
                try {
                  await logout();
                  navigate('/login', { replace: true });
                } catch (error) {
                  console.error('Error al cerrar sesión:', error);
                  // Fallback: limpiar y redirigir manualmente
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/login';
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 active:scale-95 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si tiene acceso, mostrar el contenido
  return <>{children}</>;
};
