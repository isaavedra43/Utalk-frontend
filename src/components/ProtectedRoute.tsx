import React from 'react';
import { useModulePermissions } from '../hooks/useModulePermissions';
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
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md mx-auto p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-red-600 text-xl mb-2">🔒 Acceso Denegado</div>
          <div className="text-sm text-gray-700 mb-3">
            No tienes permisos para acceder a este módulo
          </div>
          <div className="text-xs text-gray-500 mb-4">
            Módulo: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{moduleId}</span>
          </div>
          <div className="text-xs text-gray-400">
            Contacta al administrador si necesitas acceso
          </div>
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
