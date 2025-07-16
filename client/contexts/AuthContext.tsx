import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';
import type { User, LoginCredentials, ApiResponse } from '@/types/api';
import { initSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useConversationStore } from '@/hooks/useConversationStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { addMessage, updateConversation } = useConversationStore();

  // Configurar listeners de Socket.IO cuando hay usuario autenticado
  useEffect(() => {
    if (!user) return;

    const handleNewMessage = (message: any) => {
      console.log("📩 Nuevo mensaje recibido por socket:", message);
      addMessage(message);
      
      // Mostrar notificación
      toast({
        title: "Nuevo mensaje",
        description: `De: ${message.senderName || 'Desconocido'}`,
      });
    };

    const handleConversationUpdate = (conversation: any) => {
      console.log("🔄 Actualización de conversación:", conversation);
      updateConversation(conversation);
    };

    const handleMessageRead = (data: { conversationId: string; messageId: string }) => {
      console.log("👁️ Mensaje marcado como leído:", data);
      // Aquí podrías actualizar el estado de lectura si fuera necesario
    };

    const handleUserTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      console.log("⌨️ Usuario escribiendo:", data);
      // Aquí podrías mostrar indicador de "escribiendo..."
    };

    const socket = getSocket();
    if (socket && socket.connected) {
      console.log("🎧 Configurando listeners de eventos socket...");
      
      socket.on("message:new", handleNewMessage);
      socket.on("conversation:status", handleConversationUpdate);
      socket.on("message:read", handleMessageRead);
      socket.on("user:typing", handleUserTyping);

      return () => {
        console.log("🔇 Removiendo listeners de eventos socket...");
        socket.off("message:new", handleNewMessage);
        socket.off("conversation:status", handleConversationUpdate);
        socket.off("message:read", handleMessageRead);
        socket.off("user:typing", handleUserTyping);
      };
    } else {
      console.warn("⚠️ Socket no disponible para configurar listeners");
    }
  }, [user, addMessage, updateConversation]);

  // Verificar autenticación al cargar
  useEffect(() => {
    refreshAuth();
  }, []);

  const refreshAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Verificar si hay token guardado
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log("🔐 No hay token de autenticación guardado");
        setLoading(false);
        return;
      }

      console.log("🔐 Verificando token de autenticación...");
      
      // Verificar con el backend si el token es válido
      const response = await api.get<ApiResponse<User>>('/auth/me');
      
      if (response.success && response.data) {
        console.log("✅ Token válido, usuario autenticado:", response.data.name);
        setUser(response.data);
        
        // Inicializar socket si no está conectado
        const socket = getSocket();
        if (!socket || !socket.connected) {
          console.log("🔌 Inicializando socket con token existente...");
          initSocket(token);
        }
      } else {
        console.log("❌ Token inválido, limpiando sesión");
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error: any) {
      console.error('❌ Error al verificar autenticación:', error);
      
      if (error.response?.status === 401) {
        console.log("🔐 Token expirado, limpiando sesión");
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      console.log("🔐 Intentando iniciar sesión para:", email);
      
      const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        console.log("✅ Login exitoso:", response.data.user.name);
        setUser(response.data.user);
        
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          console.log("🔌 Inicializando socket con nuevo token...");
          initSocket(response.data.token);
        }

        toast({
          title: "Bienvenido",
          description: `Hola ${response.data.user.name}, sesión iniciada correctamente.`,
        });
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      
      console.error("❌ Error de login:", errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("🚪 Cerrando sesión...");
      
      // Llamar al endpoint de logout si existe
      await api.post('/auth/logout').catch(() => {
        console.log("⚠️ Error en logout del servidor, continuando con logout local");
      });
    } catch (error) {
      console.error('❌ Error durante logout:', error);
    } finally {
      // Limpiar estado local
      setUser(null);
      localStorage.removeItem('authToken');
      disconnectSocket();
      
      console.log("✅ Sesión cerrada exitosamente");
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 