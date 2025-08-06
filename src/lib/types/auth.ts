/**
 * Tipos de autenticación para UTalk Frontend
 * Basados en la documentación del backend y responses reales
 */

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'viewer' | 'superadmin';
  avatarUrl?: string;
  permissions?: string[];
  isAuthenticated?: boolean;
}

export interface LoginFormData {
  email?: string;
  password?: string;
  error?: string;
  retryAfter?: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface CookieData {
  session?: string;
  refresh_token?: string;
  user_info?: string;
}

export interface PageFormData {
  email?: string;
  error?: string;
  retryAfter?: number;
  success?: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}
