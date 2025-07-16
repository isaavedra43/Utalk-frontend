import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { logger } from "@/lib/utils";

export function RequireAuth() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Log de inicialización y cambios de estado
  useEffect(() => {
    logger.navigation('RequireAuth - Verificando acceso', {
      pathname: location.pathname,
      isAuthenticated,
      loading,
      userId: user?.id
    });
  }, [isAuthenticated, loading, user, location.pathname]);

  // Mostrar loader mientras verifica autenticación
  if (loading) {
    logger.navigation('RequireAuth - Verificando autenticación...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <div className="text-center">
            <p className="text-gray-400 mb-1">Verificando autenticación...</p>
            <p className="text-gray-600 text-sm">
              Validando sesión para acceder a {location.pathname}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    logger.navigation('RequireAuth - Usuario no autenticado, redirigiendo a login', {
      attemptedPath: location.pathname,
      search: location.search
    });
    
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si está autenticado, permitir acceso
  logger.navigation('RequireAuth - Acceso autorizado', {
    pathname: location.pathname,
    userId: user?.id,
    userEmail: user?.email,
    userRole: user?.role
  });

  return <Outlet />;
} 