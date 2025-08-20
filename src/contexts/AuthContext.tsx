import React, { createContext } from 'react';
import { useAuth } from '../hooks/useAuth';

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

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ✅ MIGRACIÓN: Usar useAuth hook que internamente usa useAuthStore
  const authState = useAuth();

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 