import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthReadyGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthReadyGate({ children, fallback }: AuthReadyGateProps) {
  const { loading, isAuthenticated } = useAuth();

  // 🔍 LOGS DETALLADOS PARA DEBUG - AUTH READY GATE
  React.useEffect(() => {
    console.group('🔍 [AUTH READY GATE DEBUG]');
    console.log('Loading:', loading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('Token en localStorage:', localStorage.getItem('authToken') ? 'PRESENTE' : 'AUSENTE');
    console.log('URL actual:', window.location.href);
    console.groupEnd();
  }, [loading, isAuthenticated]);

  // Si está cargando, mostrar loader
  if (loading) {
    console.log('🔍 [AUTH READY GATE] Bloqueando UI - AuthContext aún cargando');
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <div className="text-center">
              <p className="text-gray-400 mb-1">Verificando autenticación...</p>
              <p className="text-gray-600 text-sm">
                Validando sesión para acceder a {window.location.pathname}
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // Si no está autenticado, no renderizar nada (RequireAuth se encarga de redirigir)
  if (!isAuthenticated) {
    console.log('🔍 [AUTH READY GATE] No autenticado - no renderizando contenido protegido');
    return null;
  }

  // AuthContext está listo y usuario autenticado
  console.log('🔍 [AUTH READY GATE] AuthContext listo - renderizando contenido protegido');
  return <>{children}</>;
} 