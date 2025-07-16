import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Función helper para logs de navegación
const logNavigation = (action: string, data?: any, isError = false) => {
  const timestamp = new Date().toISOString();
  const logLevel = isError ? 'ERROR' : 'INFO';
  const message = `[NAVIGATION ${logLevel}] ${action}`;
  
  if (isError) {
    console.error(message, data);
  } else {
    console.log(message, data || '');
  }
  
  // Solo en desarrollo, mostrar logs más detallados
  if (import.meta.env.DEV) {
    console.log(`[NAVIGATION DEBUG] ${timestamp} - ${action}`, data);
  }
};

export function RequireAuth() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Log de inicialización del componente
  useEffect(() => {
    logNavigation('RequireAuth inicializado', {
      pathname: location.pathname,
      search: location.search,
      isAuthenticated,
      loading,
      userId: user?.id
    });
  }, []);

  // Log de cambios en el estado de autenticación
  useEffect(() => {
    logNavigation('Estado de autenticación actualizado en RequireAuth', {
      isAuthenticated,
      loading,
      pathname: location.pathname,
      userId: user?.id,
      userEmail: user?.email
    });
  }, [isAuthenticated, loading, user, location.pathname]);

  // Log cuando se está verificando autenticación
  useEffect(() => {
    if (loading) {
      logNavigation('Verificando autenticación para ruta protegida', {
        pathname: location.pathname,
        search: location.search
      });
    }
  }, [loading, location]);

  // Mostrar loader mientras verifica autenticación
  if (loading) {
    logNavigation('Mostrando loader de verificación de autenticación');
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
    logNavigation('Usuario no autenticado - Redirigiendo a login', {
      attemptedPath: location.pathname,
      search: location.search,
      userWasLoggedIn: !!user
    });
    
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si está autenticado, log de acceso concedido y renderizar rutas protegidas
  logNavigation('Acceso autorizado a ruta protegida', {
    pathname: location.pathname,
    userId: user?.id,
    userEmail: user?.email,
    userRole: user?.role
  });

  return <Outlet />;
} 