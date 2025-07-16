import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { 
  Seller, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

export interface TeamFormData {
  name: string;
  email: string;
  role: Seller['role'];
  permissions: Seller['permissions'];
  channelAssignments: string[];
  status?: Seller['status'];
}

// Hook para obtener lista de miembros del equipo
export function useTeamMembers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['team-members', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Seller>>('/team/members', params);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para obtener un miembro específico del equipo
export function useTeamMember(memberId: string) {
  return useQuery({
    queryKey: ['team-members', memberId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Seller>>(`/team/members/${memberId}`);
      return response.data;
    },
    enabled: !!memberId,
  });
}

// Hook para crear un nuevo miembro del equipo
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberData: TeamFormData) => {
      const response = await api.post<ApiResponse<Seller>>('/team/members', memberData);
      return response.data;
    },
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      
      toast({
        title: "Miembro agregado",
        description: `${newMember.name} ha sido agregado al equipo exitosamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al agregar miembro",
        description: error.response?.data?.message || "No se pudo agregar el miembro al equipo.",
        variant: "destructive",
      });
    },
  });
}

// Hook para actualizar un miembro del equipo
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: Partial<TeamFormData> }) => {
      const response = await api.put<ApiResponse<Seller>>(`/team/members/${memberId}`, data);
      return response.data;
    },
    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members', updatedMember.id] });
      
      toast({
        title: "Miembro actualizado",
        description: `Los datos de ${updatedMember.name} han sido actualizados.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar miembro",
        description: error.response?.data?.message || "No se pudo actualizar el miembro.",
        variant: "destructive",
      });
    },
  });
}

// Hook para eliminar/desactivar un miembro del equipo
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await api.delete<ApiResponse<void>>(`/team/members/${memberId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      
      toast({
        title: "Miembro eliminado",
        description: "El miembro ha sido eliminado del equipo exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar miembro",
        description: error.response?.data?.message || "No se pudo eliminar el miembro.",
        variant: "destructive",
      });
    },
  });
}

// Hook para obtener performance del equipo
export function useTeamPerformance(params?: {
  startDate?: string;
  endDate?: string;
  memberId?: string;
}) {
  return useQuery({
    queryKey: ['team-performance', params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        totalMembers: number;
        activeMembers: number;
        totalChats: number;
        totalSales: number;
        averageResponseTime: number;
        teamConversionRate: number;
        teamSatisfactionScore: number;
        topPerformers: Array<{
          memberId: string;
          name: string;
          chats: number;
          sales: number;
          conversionRate: number;
        }>;
        performanceByChannel: Array<{
          channel: string;
          totalChats: number;
          averageResponseTime: number;
          conversionRate: number;
        }>;
        dailyMetrics: Array<{
          date: string;
          totalChats: number;
          totalSales: number;
          averageResponseTime: number;
        }>;
      }>>('/team/performance', params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener performance individual
export function useMemberPerformance(memberId: string, params?: {
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['member-performance', memberId, params],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        totalChats: number;
        activeChats: number;
        closedChats: number;
        totalSales: number;
        averageResponseTime: number;
        conversionRate: number;
        customerSatisfaction: number;
        dailyActivity: Array<{
          date: string;
          chats: number;
          sales: number;
          averageResponseTime: number;
        }>;
        channelActivity: Array<{
          channel: string;
          chats: number;
          sales: number;
          averageResponseTime: number;
        }>;
        recentActivities: Array<{
          type: string;
          description: string;
          timestamp: string;
        }>;
      }>>(`/team/members/${memberId}/performance`, params);
      return response.data;
    },
    enabled: !!memberId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
} 