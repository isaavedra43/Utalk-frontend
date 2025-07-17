import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions, Permission } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/utils';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean; // true = requiere TODOS los permisos, false = requiere AL MENOS UNO
  fallbackPath?: string;
  showError?: boolean;
}

/**
 * 🛡️ Componente para proteger rutas basado en permisos de usuario
 * 
 * @param children - Componente a renderizar si tiene permisos
 * @param requiredPermission - Permiso específico requerido
 * @param requiredPermissions - Lista de permisos requeridos
 * @param requireAll - Si true, requiere TODOS los permisos; si false, AL MENOS UNO
 * @param fallbackPath - Ruta a la que redirigir si no tiene permisos
 * @param showError - Mostrar mensaje de error en lugar de redirigir
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallbackPath = "/login",
  showError = false
}: ProtectedRouteProps) {
  const location = useLocation();
  const { 
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isViewer,
    isAgent, 
    isAdmin,
    role
  } = usePermissions();

  // 🔧 VERIFICACIÓN DE PERMISOS CON NUEVO SISTEMA
  let hasAccess = true;

  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
  } else if (requiredPermissions && requiredPermissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  }

  // Logging para debugging
  logger.auth('🛡 Verificación de permisos para ruta protegida', {
    route: location.pathname,
    role,
    requiredPermission,
    requiredPermissions,
    requireAll,
    hasAccess,
    userPermissions: { isViewer, isAgent, isAdmin }
  });

  // Si no tiene acceso
  if (!hasAccess) {
    if (showError) {
      return <AccessDeniedError 
        route={location.pathname}
        role={role}
        requiredPermission={requiredPermission}
        requiredPermissions={requiredPermissions}
      />;
    }

    // Redirigir a la ruta de fallback
    logger.auth('🚫 Acceso denegado - Redirigiendo', { 
      from: location.pathname, 
      to: fallbackPath,
      reason: 'Permisos insuficientes'
    });

    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Tiene acceso, renderizar children
  return <>{children}</>;
}

/**
 * 🚫 Componente de error para acceso denegado
 */
interface AccessDeniedErrorProps {
  route: string;
  role: string | null;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
}

function AccessDeniedError({ 
  route, 
  role, 
  requiredPermission, 
  requiredPermissions 
}: AccessDeniedErrorProps) {
  const getMessage = () => {
    if (role === 'viewer') {
      return `Como ${role}, no tienes permisos para acceder a esta funcionalidad. Contacta al administrador si necesitas más permisos.`;
    }
    if (role === 'agent') {
      return `Esta funcionalidad requiere permisos administrativos.`;
    }
    return `No tienes permisos suficientes para acceder a esta página.`;
  };

  const getRequiredPermissions = () => {
    if (requiredPermission) return [requiredPermission];
    if (requiredPermissions) return requiredPermissions;
    return [];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ruta: <code className="bg-gray-100 px-2 py-1 rounded">{route}</code>
          </p>
        </div>

        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {getMessage()}
          </AlertDescription>
        </Alert>

        {getRequiredPermissions().length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Permisos requeridos:
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              {getRequiredPermissions().map(permission => (
                <li key={permission} className="flex items-center">
                  <code className="bg-white px-2 py-1 rounded mr-2">{permission}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => window.history.back()}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            ← Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 🛡️ Hook para verificar permisos en componentes
 */
export function useRouteProtection(
  requiredPermission?: Permission,
  requiredPermissions?: Permission[],
  requireAll: boolean = false
) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = true;

  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
  } else if (requiredPermissions && requiredPermissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  }

  return {
    hasAccess,
    canAccess: hasAccess
  };
} 