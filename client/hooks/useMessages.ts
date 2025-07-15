import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiClient } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { 
  Conversation, 
  Message, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Hook para obtener conversaciones
export function useConversations(params?: {
  section?: string;
  unreplied?: boolean;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Conversation>>('/conversations', params);
      return response;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto (para chat más fresco)
  });
}

// Hook para obtener una conversación específica
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ['conversations', conversationId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Conversation>>(`/conversations/${conversationId}`);
      return response.data;
    },
    enabled: !!conversationId,
  });
}

// Hook para obtener mensajes de una conversación
export function useMessages(conversationId: string, params?: {
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['messages', conversationId, params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Message>>(
        `/conversations/${conversationId}/messages`, 
        params
      );
      return response;
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 segundos (para tiempo real)
    refetchInterval: 5 * 1000, // Refetch cada 5 segundos para simular tiempo real
  });
}

// Hook para enviar un mensaje
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      content, 
      type = 'text',
      attachments = [] 
    }: {
      conversationId: string;
      content: string;
      type?: 'text' | 'image' | 'file' | 'audio';
      attachments?: File[];
    }) => {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', type);
      
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      const response = await apiClient.post<ApiResponse<Message>>(
        `/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    },
    onSuccess: (newMessage, variables) => {
      // Agregar el mensaje optimistamente a la lista
      queryClient.setQueryData(
        ['messages', variables.conversationId],
        (oldData: PaginatedResponse<Message> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: [...oldData.data, newMessage],
          };
        }
      );

      // Invalidar las conversaciones para actualizar el último mensaje
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar mensaje",
        description: error.response?.data?.message || "No se pudo enviar el mensaje.",
        variant: "destructive",
      });
    },
  });
}

// Hook para marcar conversación como leída
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await api.patch<ApiResponse<void>>(
        `/conversations/${conversationId}/mark-read`
      );
      return response;
    },
    onSuccess: (_, conversationId) => {
      // Actualizar el estado de la conversación
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversations', conversationId] });
    },
  });
}

// Hook para archivar/desarchivar conversación
export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, archive }: { conversationId: string; archive: boolean }) => {
      const response = await api.patch<ApiResponse<void>>(
        `/conversations/${conversationId}/archive`,
        { archive }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      toast({
        title: "Conversación actualizada",
        description: "El estado de la conversación ha sido actualizado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar conversación",
        description: error.response?.data?.message || "No se pudo actualizar la conversación.",
        variant: "destructive",
      });
    },
  });
}

// Hook para buscar en mensajes
export function useSearchMessages(query: string, conversationId?: string) {
  return useQuery({
    queryKey: ['messages', 'search', query, conversationId],
    queryFn: async () => {
      const params = { 
        q: query,
        ...(conversationId && { conversationId })
      };
      const response = await api.get<PaginatedResponse<Message>>('/messages/search', params);
      return response;
    },
    enabled: query.length > 2, // Solo buscar si hay al menos 3 caracteres
    staleTime: 30 * 1000,
  });
} 