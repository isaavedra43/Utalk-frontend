import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/utils";
import type { 
  User, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Tipos específicos para equipo
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface TeamMember extends User {
  isOnline: boolean;
  lastActivity: string;
  status?: 'active' | 'inactive' | 'online' | 'offline';
  performance: {
    conversationsHandled: number;
    averageResponseTime: number;
    customerSatisfaction: number;
    totalMessages: number;
  };
}

interface TeamFormData {
  name: string;
  email: string;
  password?: string;
  role: string;
  department?: string;
  phone?: string;
  avatar?: string;
  permissions?: string[];
}

// Hook para obtener lista de miembros del equipo
export function useTeamMembers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'online' | 'offline';
}) {
  return useQuery({
    queryKey: ['team', 'members', params],
    queryFn: async () => {
      logger.api('Obteniendo lista de miembros del equipo', { params });
      const response = await api.get<PaginatedResponse<TeamMember>>('/team/members', params);
      logger.api('Miembros del equipo obtenidos exitosamente', { total: response.pagination?.total });
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para obtener un miembro específico del equipo
export function useTeamMember(memberId: string) {
  return useQuery({
    queryKey: ['team', 'members', memberId],
    queryFn: async () => {
      logger.api('Obteniendo miembro específico del equipo', { memberId });
      const response = await api.get<TeamMember>(`/team/members/${memberId}`);
      return response;
    },
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener roles disponibles
export function useRoles() {
  return useQuery({
    queryKey: ['team', 'roles'],
    queryFn: async () => {
      logger.api('Obteniendo roles disponibles');
      const response = await api.get<Role[]>('/team/roles');
      logger.api('Roles obtenidos exitosamente', { rolesCount: response.length });
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para obtener permisos disponibles
export function usePermissions() {
  return useQuery({
    queryKey: ['team', 'permissions'],
    queryFn: async () => {
      logger.api('Obteniendo permisos disponibles');
      const response = await api.get<Permission[]>('/team/permissions');
      logger.api('Permisos obtenidos exitosamente', { permissionsCount: response.length });
      return response;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}

// Hook para crear un nuevo miembro del equipo
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData: TeamFormData) => {
      logger.api('Creando nuevo miembro del equipo', { 
        name: memberData.name, 
        email: memberData.email,
        role: memberData.role 
      });
      const response = await api.post<TeamMember>('/team/members', memberData);
      return response;
    },
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      
      logger.api('Miembro del equipo creado exitosamente', { 
        memberId: newMember.id, 
        name: newMember.name 
      });
      
      toast({
        title: "Miembro agregado",
        description: `${newMember.name} ha sido agregado al equipo exitosamente.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo crear el miembro del equipo.";
      logger.api('Error al crear miembro del equipo', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al agregar miembro",
        description: errorMessage,
      });
    },
  });
}

// Hook para actualizar un miembro del equipo
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: Partial<TeamFormData> }) => {
      logger.api('Actualizando miembro del equipo', { 
        memberId, 
        updatedFields: Object.keys(data) 
      });
      const response = await api.put<TeamMember>(`/team/members/${memberId}`, data);
      return response;
    },
    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.setQueryData(['team', 'members', updatedMember.id], updatedMember);
      
      logger.api('Miembro del equipo actualizado exitosamente', { memberId: updatedMember.id });
      
      toast({
        title: "Miembro actualizado",
        description: `Los datos de ${updatedMember.name} han sido actualizados.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo actualizar el miembro del equipo.";
      logger.api('Error al actualizar miembro del equipo', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al actualizar miembro",
        description: errorMessage,
      });
    },
  });
}

// Hook para eliminar un miembro del equipo
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      logger.api('Eliminando miembro del equipo', { memberId });
      await api.delete(`/team/members/${memberId}`);
      return memberId;
    },
    onSuccess: (deletedMemberId) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.removeQueries({ queryKey: ['team', 'members', deletedMemberId] });
      
      logger.api('Miembro del equipo eliminado exitosamente', { memberId: deletedMemberId });
      
      toast({
        title: "Miembro eliminado",
        description: "El miembro del equipo ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo eliminar el miembro del equipo.";
      logger.api('Error al eliminar miembro del equipo', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al eliminar miembro",
        description: errorMessage,
      });
    },
  });
}

// Hook para obtener estadísticas de rendimiento del equipo
export function useTeamPerformance(params?: {
  startDate?: string;
  endDate?: string;
  memberId?: string;
}) {
  return useQuery({
    queryKey: ['team', 'performance', params],
    queryFn: async () => {
      logger.api('Obteniendo estadísticas de rendimiento del equipo', { params });
      const response = await api.get<{
        overview: {
          totalMembers: number;
          activeMembers: number;
          averageResponseTime: number;
          totalConversations: number;
          teamEfficiency: number;
        };
        memberStats: Array<{
          memberId: string;
          memberName: string;
          conversationsHandled: number;
          averageResponseTime: number;
          customerSatisfaction: number;
          totalMessages: number;
          onlineTime: number;
          productivity: number;
        }>;
        trends: Array<{
          date: string;
          conversationsHandled: number;
          averageResponseTime: number;
          teamOnline: number;
        }>;
      }>('/team/performance', params);
      logger.api('Estadísticas de rendimiento del equipo obtenidas exitosamente');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para cambiar el rol de un miembro
export function useChangeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, roleId }: { memberId: string; roleId: string }) => {
      logger.api('Cambiando rol de miembro del equipo', { memberId, roleId });
      const response = await api.put<TeamMember>(`/team/members/${memberId}/role`, { roleId });
      return response;
    },
    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.setQueryData(['team', 'members', updatedMember.id], updatedMember);
      
      logger.api('Rol cambiado exitosamente');
      
      toast({
        title: "Rol actualizado",
        description: `El rol de ${updatedMember.name} ha sido actualizado.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo cambiar el rol.";
      logger.api('Error al cambiar rol', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al cambiar rol",
        description: errorMessage,
      });
    },
  });
}

// Hook para asignar permisos a un miembro
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, permissions }: { memberId: string; permissions: string[] }) => {
      logger.api('Asignando permisos a miembro del equipo', { memberId, permissionsCount: permissions.length });
      const response = await api.put<TeamMember>(`/team/members/${memberId}/permissions`, { permissions });
      return response;
    },
    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.setQueryData(['team', 'members', updatedMember.id], updatedMember);
      
      logger.api('Permisos asignados exitosamente');
      
      toast({
        title: "Permisos actualizados",
        description: `Los permisos de ${updatedMember.name} han sido actualizados.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudieron asignar los permisos.";
      logger.api('Error al asignar permisos', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al asignar permisos",
        description: errorMessage,
      });
    },
  });
}

// Hook para activar/desactivar un miembro
export function useToggleMemberStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: 'active' | 'inactive' }) => {
      logger.api('Cambiando estado de miembro del equipo', { memberId, status });
      const response = await api.put<TeamMember>(`/team/members/${memberId}/status`, { status });
      return response;
    },
    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
      queryClient.setQueryData(['team', 'members', updatedMember.id], updatedMember);
      
      logger.api('Estado de miembro cambiado exitosamente');
      
      const statusText = updatedMember.status === 'active' ? 'activado' : 'desactivado';
      toast({
        title: "Estado actualizado",
        description: `${updatedMember.name} ha sido ${statusText}.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo cambiar el estado del miembro.";
      logger.api('Error al cambiar estado de miembro', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al cambiar estado",
        description: errorMessage,
      });
    },
  });
}

// Hook para obtener actividad en tiempo real del equipo
export function useTeamActivity() {
  return useQuery({
    queryKey: ['team', 'activity'],
    queryFn: async () => {
      logger.api('Obteniendo actividad en tiempo real del equipo');
      const response = await api.get<Array<{
        memberId: string;
        memberName: string;
        status: 'online' | 'away' | 'busy' | 'offline';
        currentTask?: string;
        lastActivity: string;
        activeConversations: number;
      }>>('/team/activity');
      logger.api('Actividad del equipo obtenida exitosamente');
      return response;
    },
    staleTime: 10 * 1000, // 10 segundos
  });
}

// Hook para buscar miembros del equipo
export function useSearchTeamMembers(query: string) {
  return useQuery({
    queryKey: ['team', 'search', query],
    queryFn: async () => {
      logger.api('Buscando miembros del equipo', { query });
      const response = await api.get<TeamMember[]>('/team/members/search', { q: query });
      logger.api('Búsqueda de miembros completada', { resultCount: response.length });
      return response;
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}

// Hook para gestión de roles (CRUD completo)
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: { name: string; description: string; permissions: string[] }) => {
      logger.api('Creando nuevo rol', { name: roleData.name });
      const response = await api.post<Role>('/team/roles', roleData);
      return response;
    },
    onSuccess: (newRole) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'roles'] });
      
      logger.api('Rol creado exitosamente', { roleId: newRole.id });
      
      toast({
        title: "Rol creado",
        description: `El rol ${newRole.name} ha sido creado exitosamente.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo crear el rol.";
      logger.api('Error al crear rol', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al crear rol",
        description: errorMessage,
      });
    },
  });
}

// Hook para actualizar rol
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      roleId, 
      data 
    }: { 
      roleId: string; 
      data: { name?: string; description?: string; permissions?: string[] } 
    }) => {
      logger.api('Actualizando rol', { roleId });
      const response = await api.put<Role>(`/team/roles/${roleId}`, data);
      return response;
    },
    onSuccess: (updatedRole) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'roles'] });
      
      logger.api('Rol actualizado exitosamente', { roleId: updatedRole.id });
      
      toast({
        title: "Rol actualizado",
        description: `El rol ${updatedRole.name} ha sido actualizado.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo actualizar el rol.";
      logger.api('Error al actualizar rol', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al actualizar rol",
        description: errorMessage,
      });
    },
  });
}

// Hook para eliminar rol
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      logger.api('Eliminando rol', { roleId });
      await api.delete(`/team/roles/${roleId}`);
      return roleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'roles'] });
      
      logger.api('Rol eliminado exitosamente');
      
      toast({
        title: "Rol eliminado",
        description: "El rol ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo eliminar el rol.";
      logger.api('Error al eliminar rol', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al eliminar rol",
        description: errorMessage,
      });
    },
  });
} 