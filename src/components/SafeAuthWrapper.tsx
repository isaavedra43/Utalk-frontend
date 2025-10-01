/**
 * Wrapper seguro para componentes que requieren autenticación
 * Evita errores de contexto no inicializado
 */
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

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
  const [authState, setAuthState] = useState<{
    loading: boolean;
    isAuthenticated: boolean;
    error: string | null;
  }>({
    loading: true,
    isAuthenticated: false,
    error: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔐 SafeAuthWrapper - Verificando autenticación');
        
        // ✅ Esperar a que el contexto esté disponible
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // ✅ Verificar token en localStorage de forma segura
        const token = localStorage.getItem('access_token');
        const hasValidToken = token && token !== 'undefined' && token !== 'null' && token.length > 10;
        
        if (!hasValidToken && requireAuth) {
          console.log('🔐 SafeAuthWrapper - No hay token válido, redirigiendo a login');
          setAuthState({
            loading: false,
            isAuthenticated: false,
            error: 'No autenticado'
          });
          return;
        }
        
        // ✅ Importar dinámicamente el contexto para evitar errores de inicialización
        try {
          const { useAuthContext } = await import('../contexts/useAuthContext');
          
          // ✅ Usar un timeout para evitar que se cuelgue
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout verificando auth')), 3000)
          );
          
          const authCheckPromise = new Promise<void>((resolve) => {
            try {
              // ✅ Verificar que el contexto esté disponible
              const authContext = useAuthContext();
              
              console.log('🔐 SafeAuthWrapper - Estado de auth:', {
                loading: authContext.loading,
                isAuthenticated: authContext.isAuthenticated,
                hasUser: !!authContext.user
              });
              
              setAuthState({
                loading: false,
                isAuthenticated: authContext.isAuthenticated,
                error: authContext.error
              });
              
              resolve();
            } catch (error) {
              console.warn('🔐 SafeAuthWrapper - Error accediendo al contexto, usando fallback');
              setAuthState({
                loading: false,
                isAuthenticated: !!hasValidToken,
                error: null
              });
              resolve();
            }
          });
          
          await Promise.race([authCheckPromise, timeoutPromise]);
          
        } catch (contextError) {
          console.warn('🔐 SafeAuthWrapper - Error con contexto de auth, usando verificación básica:', contextError);
          
          // ✅ Fallback: usar solo verificación de token
          setAuthState({
            loading: false,
            isAuthenticated: !!hasValidToken,
            error: null
          });
        }
        
      } catch (error) {
        console.error('🔐 SafeAuthWrapper - Error verificando autenticación:', error);
        setAuthState({
          loading: false,
          isAuthenticated: false,
          error: error instanceof Error ? error.message : 'Error de autenticación'
        });
      }
    };

    checkAuth();
  }, [requireAuth]);

  // ✅ Mostrar loading mientras se verifica
  if (authState.loading) {
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
  if (requireAuth && !authState.isAuthenticated) {
    console.log('🔐 SafeAuthWrapper - Usuario no autenticado, redirigiendo a:', fallbackRoute);
    return <Navigate to={fallbackRoute} replace />;
  }

  // ✅ Mostrar contenido si está autenticado o no se requiere auth
  return <>{children}</>;
};
