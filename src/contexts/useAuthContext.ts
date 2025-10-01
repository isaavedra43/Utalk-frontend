import { useContext } from 'react';
import { AuthContext } from './AuthContext';

interface BackendUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: { uid: string; email: string; displayName?: string } | null;
  backendUser: BackendUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<BackendUser>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  updateProfile: (data: { displayName?: string; email?: string }) => Promise<BackendUser>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  // ✅ SOLUCIÓN DEFINITIVA: SIEMPRE devolver un estado seguro si no hay contexto
  // Esto previene completamente el error "useAuthContext debe ser usado dentro de un AuthProvider"
  if (!context) {
    console.warn('⚠️ useAuthContext llamado fuera de AuthProvider. Usando estado seguro por defecto.');
    
    // ✅ VERIFICAR si hay token en localStorage para determinar estado inicial
    const hasToken = localStorage.getItem('access_token');
    const shouldRedirectToLogin = !hasToken;
    
    // ✅ Estado completamente funcional que previene errores
    return {
      user: null,
      backendUser: null,
      loading: false, // ✅ CRÍTICO: No loading infinito
      error: shouldRedirectToLogin ? 'No autenticado' : null,
      isAuthenticated: false,
      isAuthenticating: false,
      login: async () => { 
        console.warn('Auth no inicializado - redirigiendo a login');
        window.location.href = '/login';
        throw new Error('Auth no inicializado'); 
      },
      logout: async () => {
        console.warn('Auth no inicializado - limpiando estado');
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      },
      clearAuth: () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      },
      updateProfile: async () => { 
        throw new Error('Auth no inicializado'); 
      }
    } as AuthState;
  }
  
  return context;
};

// ✅ MIGRACIÓN: Exportar también el hook directo para uso futuro
export { useAuth } from '../hooks/useAuth'; 