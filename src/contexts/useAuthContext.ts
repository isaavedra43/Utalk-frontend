import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  // Prevención: en arranque inicial o si algún árbol se monta antes del Provider,
  // devolvemos un estado seguro en lugar de lanzar para evitar pantallas en blanco.
  if (!context) {
    console.warn('useAuthContext llamado fuera de AuthProvider. Usando estado seguro por defecto.');
    return {
      user: null,
      backendUser: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      isAuthenticating: true,
      login: async () => { throw new Error('Auth no inicializado'); },
      logout: async () => {},
      clearAuth: () => {},
      updateProfile: async () => { throw new Error('Auth no inicializado'); }
    } as unknown as ReturnType<typeof useContext>;
  }
  
  return context;
};

// ✅ MIGRACIÓN: Exportar también el hook directo para uso futuro
export { useAuth } from '../hooks/useAuth'; 