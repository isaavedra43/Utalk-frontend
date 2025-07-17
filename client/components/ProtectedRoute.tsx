import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/permissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/utils';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: 'read' | 'write' | 'approve' | 'admin';
  requiredAction?: string;
  fallbackPath?: string;
  showError?: boolean;
}

/**
 * Componente para proteger rutas basado en permisos de usuario
 * 
 * @param children - Componente a renderizar si tiene permisos
 * @param requiredRole - Rol mínimo requerido
 * @param requiredPermission - Permiso específico requerido
 * @param requiredAction - Acción específica requerida
 * @param fallbackPath - Ruta a la que redirigir si no tiene permisos
 * @param showError - Mostrar mensaje de error en lugar de redirigir
 */
export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  requiredAction,
  fallbackPath = '/',
  showError = false
}: ProtectedRouteProps) {
  const location = useLocation();
  const {
    currentRole,
    hasPermission,
    canPerformAction,
    canAccessRoute,
    roleInfo
  } = usePermissions();

  // Verificar acceso basado en la ruta actual
  const hasRouteAccess = canAccessRoute(location.pathname);

  // Verificar rol específico si se requiere
  const hasRequiredRole = requiredRole ? checkRoleHierarchy(currentRole, requiredRole) : true;

  // Verificar permiso específico si se requiere
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : true;

  // Verificar acción específica si se requiere
  const hasRequiredAction = requiredAction ? canPerformAction(requiredAction) : true;

  // Verificación combinada
  const hasAccess = hasRouteAccess && hasRequiredRole && hasRequiredPermission && hasRequiredAction;

  // Logging para debugging
  logger.auth('🛡 Verificación de permisos para ruta protegida', {
    route: location.pathname,
    currentRole,
    requiredRole,
    requiredPermission,
    requiredAction,
    checks: {
      hasRouteAccess,
      hasRequiredRole,
      hasRequiredPermission,
      hasRequiredAction,
      finalAccess: hasAccess
    }
  });

  // Si no tiene acceso
  if (!hasAccess) {
    if (showError) {
      return <AccessDeniedError 
        currentRole={currentRole}
        roleInfo={roleInfo}
        requiredRole={requiredRole}
        requiredPermission={requiredPermission}
        requiredAction={requiredAction}
      />;
    }

    // Redirigir a la página de fallback
    logger.auth('🚫 Acceso denegado - Redirigiendo', {
      from: location.pathname,
      to: fallbackPath,
      reason: getAccessDeniedReason({
        hasRouteAccess,
        hasRequiredRole,
        hasRequiredPermission,
        hasRequiredAction
      })
    });

    return <Navigate to={fallbackPath} replace />;
  }

  // Renderizar contenido si tiene acceso
  return <>{children}</>;
}

/**
 * Verifica jerarquía de roles
 */
function checkRoleHierarchy(currentRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    viewer: 1,
    agent: 2,
    admin: 3
  };

  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
}

/**
 * Determina la razón del acceso denegado
 */
function getAccessDeniedReason(checks: {
  hasRouteAccess: boolean;
  hasRequiredRole: boolean;
  hasRequiredPermission: boolean;
  hasRequiredAction: boolean;
}): string {
  if (!checks.hasRouteAccess) return 'Ruta no permitida para este rol';
  if (!checks.hasRequiredRole) return 'Rol insuficiente';
  if (!checks.hasRequiredPermission) return 'Permiso específico faltante';
  if (!checks.hasRequiredAction) return 'Acción no permitida';
  return 'Acceso denegado - razón desconocida';
}

/**
 * Componente de error para acceso denegado
 */
function AccessDeniedError({
  currentRole,
  roleInfo,
  requiredRole,
  requiredPermission,
  requiredAction
}: {
  currentRole: UserRole;
  roleInfo: any;
  requiredRole?: UserRole;
  requiredPermission?: string;
  requiredAction?: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="max-w-md w-full mx-4">
        <Alert className="border-red-600 bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Acceso Denegado
                </h3>
                <p className="text-sm">
                  No tienes permisos suficientes para acceder a esta sección.
                </p>
              </div>

              <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                <h4 className="font-medium text-gray-300 mb-2">Tu rol actual:</h4>
                <div className="text-sm text-gray-400">
                  <p><span className="font-medium">Rol:</span> {roleInfo.name}</p>
                  <p><span className="font-medium">Nivel:</span> {roleInfo.permissionLevel}</p>
                  <p><span className="font-medium">Permisos:</span> {roleInfo.activePermissions}/{roleInfo.totalPermissions}</p>
                </div>
              </div>

              {(requiredRole || requiredPermission || requiredAction) && (
                <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
                  <h4 className="font-medium text-gray-300 mb-2">Requerimientos:</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    {requiredRole && (
                      <p><span className="font-medium">Rol mínimo:</span> {requiredRole}</p>
                    )}
                    {requiredPermission && (
                      <p><span className="font-medium">Permiso:</span> {requiredPermission}</p>
                    )}
                    {requiredAction && (
                      <p><span className="font-medium">Acción:</span> {requiredAction}</p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Contacta a tu administrador si necesitas acceso adicional.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

/**
 * HOC para proteger componentes
 */
export function withPermissions<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  permissionConfig: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: T) {
    return (
      <ProtectedRoute {...permissionConfig}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Componente para mostrar/ocultar elementos basado en permisos
 */
interface ConditionalRenderProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: 'read' | 'write' | 'approve' | 'admin';
  requiredAction?: string;
  fallback?: ReactNode;
}

export function ConditionalRender({
  children,
  requiredRole,
  requiredPermission,
  requiredAction,
  fallback = null
}: ConditionalRenderProps) {
  const {
    currentRole,
    hasPermission,
    canPerformAction
  } = usePermissions();

  const hasRequiredRole = requiredRole ? checkRoleHierarchy(currentRole, requiredRole) : true;
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : true;
  const hasRequiredAction = requiredAction ? canPerformAction(requiredAction) : true;

  const hasAccess = hasRequiredRole && hasRequiredPermission && hasRequiredAction;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
} 