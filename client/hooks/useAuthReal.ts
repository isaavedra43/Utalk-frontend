import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/utils";
import type { User, ApiResponse } from "@/types/api";

// Tipos específicos para autenticación
interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
  avatar?: string;
}

// Hook para obtener perfil del usuario actual
export function useProfile() {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      logger.api('Obteniendo perfil de usuario');
      const response = await api.get<User>('/auth/me');
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
  });
}

// Hook para login real
export function useLoginMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      logger.api('Enviando credenciales de login');
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response;
    },
    onSuccess: (data) => {
      // Invalidar y actualizar queries relacionadas con auth
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.setQueryData(['auth', 'profile'], data.user);
      
      logger.api('Login exitoso - Datos actualizados en cache');
      
      toast({
        title: "¡Bienvenido!",
        description: `Hola ${data.user.name}, sesión iniciada correctamente.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      logger.api('Error en login', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: errorMessage,
      });
    },
  });
}

// Hook para logout real
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      logger.api('Cerrando sesión');
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      // Limpiar todo el cache de queries
      queryClient.clear();
      
      // Limpiar localStorage
      localStorage.removeItem('authToken');
      
      logger.api('Logout exitoso - Cache limpiado');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    },
    onError: (error: any) => {
      logger.api('Error en logout', { error: error.message }, true);
      
      // Aunque falle el logout en servidor, limpiar localmente
      queryClient.clear();
      localStorage.removeItem('authToken');
    },
  });
}

// Hook para actualizar perfil
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: UpdateProfileData) => {
      logger.api('Actualizando perfil de usuario');
      const response = await api.put<User>('/auth/profile', profileData);
      return response;
    },
    onSuccess: (updatedUser) => {
      // Actualizar cache del perfil
      queryClient.setQueryData(['auth', 'profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
      
      logger.api('Perfil actualizado exitosamente');
      
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido actualizados correctamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      logger.api('Error al actualizar perfil', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al actualizar perfil",
        description: errorMessage,
      });
    },
  });
}

// Hook para cambiar contraseña
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      logger.api('Cambiando contraseña');
      const response = await api.post('/auth/change-password', data);
      return response;
    },
    onSuccess: () => {
      logger.api('Contraseña cambiada exitosamente');
      
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      logger.api('Error al cambiar contraseña', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al cambiar contraseña",
        description: errorMessage,
      });
    },
  });
}

// Hook para refresh token (si se implementa)
export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      logger.api('Refrescando token de autenticación');
      const response = await api.post<{ token: string }>('/auth/refresh');
      return response;
    },
    onSuccess: (data) => {
      localStorage.setItem('authToken', data.token);
      logger.api('Token refrescado exitosamente');
    },
    onError: (error: any) => {
      logger.api('Error al refrescar token', { error: error.message }, true);
      
      // Si falla el refresh, probablemente el token expiró
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    },
  });
} 