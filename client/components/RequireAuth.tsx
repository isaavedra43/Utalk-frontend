import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "./LoadingScreen";

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Componente que protege rutas requiriendo autenticación JWT válida
 * Redirige a /login si no hay sesión válida
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Efecto para redirigir si no está autenticado
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      console.log('Usuario no autenticado, redirigiendo a login...');
      window.location.href = '/login';
    }
  }, [isLoading, isAuthenticated, user]);

  // Mostrar loading mientras verifica la sesión
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticación..." />;
  }

  // Si no está autenticado, mostrar loading mientras redirige
  if (!isAuthenticated || !user) {
    return <LoadingScreen message="Redirigiendo a login..." />;
  }

  // Si está autenticado, mostrar el contenido protegido
  console.log('Usuario autenticado:', user.email);
  return <>{children}</>;
} 