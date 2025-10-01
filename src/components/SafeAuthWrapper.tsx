/**
 * Wrapper seguro para componentes que requieren autenticación
 * Evita errores de contexto no inicializado
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/useAuthContext';

interface SafeAuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallbackRoute?: string;
}

export const SafeAuthWrapper: React.FC<SafeAuthWrapperProps> = ({ 
  children, 
  requireAuth = true,
  fallbackRoute = '/login'
}) => {
  // ✅ SIMPLIFICADO: Usar directamente useAuthContext (ya es seguro)
  const { isAuthenticated, loading, error } = useAuthContext();

  console.log('🔐 SafeAuthWrapper - Estado:', { 
    isAuthenticated, 
    loading, 
    error,
    requireAuth 
  });

  // ✅ Mostrar loading mientras se verifica
  if (loading) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Verificando acceso...
          </h3>
          <p className="text-sm text-gray-600">
            Validando credenciales
          </p>
        </div>
      </div>
    );
  }

  // ✅ Redirigir si no está autenticado y se requiere autenticación
  if (requireAuth && !isAuthenticated) {
    console.log('🔐 SafeAuthWrapper - Usuario no autenticado, redirigiendo a:', fallbackRoute);
    return <Navigate to={fallbackRoute} replace />;
  }

  // ✅ Mostrar contenido si está autenticado o no se requiere auth
  return <>{children}</>;
};
