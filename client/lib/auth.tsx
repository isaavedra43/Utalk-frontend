/**
 * Authentication Context and Hooks
 * Manages user authentication state and provides authentication utilities
 * ENTERPRISE: Logging condicional sin console.log en producción
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { apiClient, User, LoginRequest, ApiError } from './api';

// Logging condicional
const isDev = import.meta.env.DEV;
const devWarn = (...args: any[]) => {
  if (isDev) {
    console.warn(...args);
  }
};

const devError = (...args: any[]) => {
  if (isDev) {
    console.error(...args);
  }
};

// Types
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null && apiClient.isAuthenticated();

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.login(credentials);
      setUser(response.user);
      
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(response.user));
      
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiClient.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      devWarn('Logout API call failed:', err);
      // Continue with logout even if API call fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      if (!apiClient.isAuthenticated()) {
        setUser(null);
        localStorage.removeItem('user');
        return;
      }

      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      const error = err as ApiError;
      if (error.status === 401) {
        // Token expired or invalid
        setUser(null);
        localStorage.removeItem('user');
      } else {
        setError(error.message || 'Failed to refresh user data');
      }
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if user data exists in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (err) {
            devWarn('Failed to parse stored user data:', err);
            localStorage.removeItem('user');
          }
        }
        
        // Validate token and refresh user data if needed
        await refreshUser();
      } catch (err) {
        devError('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUser]);

  // Auto-refresh user data periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshUser();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUser]);

  // Listen for storage changes (logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue === null) {
        // User was logged out in another tab
        setUser(null);
        setError(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const authValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      window.location.href = '/login';
      return null;
    }

    return <Component {...props} />;
  };

  return WrappedComponent;
};

// Hook for checking permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission) || user.role === 'admin';
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.some(permission => hasPermission(permission));
  }, [user, hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!user) return false;
    return permissions.every(permission => hasPermission(permission));
  }, [user, hasPermission]);

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
    permissions: user?.permissions || [],
    role: user?.role,
  };
};

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  requiredPermissions,
  fallback = <div className="p-4 text-center text-red-500">No tienes permisos para ver esta sección</div>
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasPermission, hasRole, hasAllPermissions } = usePermissions();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in withAuth
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check single permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions requirement
  if (requiredPermissions && !hasAllPermissions(requiredPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Export types
export type { AuthContextType, AuthProviderProps }; 