import { useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

interface BackendUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface StableAuthState {
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

export const useStableAuth = (): StableAuthState => {
  const authStore = useAuthStore();
  
  // Usar refs para mantener valores estables
  const stableUserRef = useRef(authStore.user);
  const stableBackendUserRef = useRef(authStore.backendUser);
  const stableLoadingRef = useRef(authStore.loading);
  const stableAuthenticatingRef = useRef(authStore.isAuthenticating);
  
  // Actualizar refs cuando cambien los valores
  useEffect(() => {
    stableUserRef.current = authStore.user;
  }, [authStore.user]);
  
  useEffect(() => {
    stableBackendUserRef.current = authStore.backendUser;
  }, [authStore.backendUser]);
  
  useEffect(() => {
    stableLoadingRef.current = authStore.loading;
  }, [authStore.loading]);
  
  useEffect(() => {
    stableAuthenticatingRef.current = authStore.isAuthenticating;
  }, [authStore.isAuthenticating]);
  
  // Calcular isAuthenticated de manera estable
  const isAuthenticated = useMemo(() => {
    // Si está autenticando, no considerar como autenticado aún
    if (stableAuthenticatingRef.current) {
      return false;
    }
    
    // Si está cargando, mantener el estado anterior o false
    if (stableLoadingRef.current) {
      return false;
    }
    
    // Solo considerar autenticado si tiene tanto user como backendUser
    return !!(stableUserRef.current && stableBackendUserRef.current);
  }, [authStore.user, authStore.backendUser, authStore.isAuthenticating, authStore.loading]);
  
  // Retornar valores estables
  return {
    user: stableUserRef.current,
    backendUser: stableBackendUserRef.current,
    loading: stableLoadingRef.current,
    error: authStore.error,
    isAuthenticated,
    isAuthenticating: stableAuthenticatingRef.current,
    login: authStore.login,
    logout: authStore.logout,
    clearAuth: authStore.clearAuth,
    updateProfile: authStore.updateProfile
  };
};
