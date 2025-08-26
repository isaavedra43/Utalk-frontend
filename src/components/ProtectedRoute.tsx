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

    // Fallback por defecto
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos para acceder a este módulo.
          </p>
          <div className="text-sm text-gray-500">
            Módulo: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{moduleId}</span>
            {requiredAction !== 'read' && (
              <>
                <br />
                Permiso requerido: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{requiredAction}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Si tiene acceso, mostrar el contenido
  return <>{children}</>;
};
