import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { 
  Contact, 
  ContactFormData, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Hook para obtener lista de contactos
export function useContacts(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  section?: string;
}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Contact>>('/contacts', params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener un contacto específico
export function useContact(contactId: string) {
  return useQuery({
    queryKey: ['contacts', contactId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Contact>>(`/contacts/${contactId}`);
      return response.data;
    },
    enabled: !!contactId,
  });
}

// Hook para crear un nuevo contacto
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData: ContactFormData) => {
      const response = await api.post<ApiResponse<Contact>>('/contacts', contactData);
      return response.data;
    },
    onSuccess: (newContact) => {
      // Invalidar la lista de contactos para que se actualice
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      toast({
        title: "Contacto creado",
        description: `El contacto ${newContact.name} ha sido creado exitosamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear contacto",
        description: error.response?.data?.message || "No se pudo crear el contacto.",
        variant: "destructive",
      });
    },
  });
}

// Hook para actualizar un contacto
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, data }: { contactId: string; data: Partial<ContactFormData> }) => {
      const response = await api.put<ApiResponse<Contact>>(`/contacts/${contactId}`, data);
      return response.data;
    },
    onSuccess: (updatedContact) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', updatedContact.id] });
      
      toast({
        title: "Contacto actualizado",
        description: `Los datos de ${updatedContact.name} han sido actualizados.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar contacto",
        description: error.response?.data?.message || "No se pudo actualizar el contacto.",
        variant: "destructive",
      });
    },
  });
}

// Hook para eliminar un contacto
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const response = await api.delete<ApiResponse<void>>(`/contacts/${contactId}`);
      return response;
    },
    onSuccess: () => {
      // Invalidar la lista de contactos
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar contacto",
        description: error.response?.data?.message || "No se pudo eliminar el contacto.",
        variant: "destructive",
      });
    },
  });
}

// Hook para exportar contactos
export function useExportContacts() {
  return useMutation({
    mutationFn: async (format: 'csv' | 'xlsx' = 'csv') => {
      // Para exportar usamos apiClient directamente para manejar blobs
      const { apiClient } = await import('@/lib/apiClient');
      const response = await apiClient.get(`/contacts/export?format=${format}`, {
        responseType: 'blob',
      });
      
      // Crear URL para descarga
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contactos.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Exportación completada",
        description: "Los contactos se han exportado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en la exportación",
        description: error.response?.data?.message || "No se pudo exportar los contactos.",
        variant: "destructive",
      });
    },
  });
} 