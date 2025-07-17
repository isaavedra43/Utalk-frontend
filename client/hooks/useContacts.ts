import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/utils";
import type { 
  Contact, 
  ContactFormData, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";
import type { PaginationParams } from "@/types/pagination";
import { convertLegacyPagination } from "@/types/pagination";

// 🔧 Hook para obtener lista de contactos - UNIFICADO a limit/startAfter
export function useContacts(params?: PaginationParams & {
  search?: string;
  status?: string;
  section?: string;
}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => {
      logger.api('Obteniendo lista de contactos', { params });
      const response = await api.get<PaginatedResponse<Contact>>('/contacts', params);
      logger.api('Contactos obtenidos exitosamente', { total: response.pagination?.total });
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: true, // Siempre habilitado
  });
}

// 🔄 LEGACY: Hook compatible con page/pageSize (DEPRECATED)
export function useContactsLegacy(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  section?: string;
}) {
  if (!params) {
    return useContacts();
  }

  const { page, pageSize, ...filters } = params;
  const unifiedParams = {
    ...convertLegacyPagination({ page, pageSize }),
    ...filters
  };
  
  logger.api('⚠️ USANDO HOOK LEGACY useContactsLegacy - Migrar a useContacts con PaginationParams', { 
    legacyParams: params,
    unifiedParams 
  });
  
  return useContacts(unifiedParams);
}

// Hook para obtener un contacto específico
export function useContact(contactId: string) {
  return useQuery({
    queryKey: ['contacts', contactId],
    queryFn: async () => {
      logger.api('Obteniendo contacto específico', { contactId });
      const response = await api.get<Contact>(`/contacts/${contactId}`);
      return response;
    },
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para buscar contactos
export function useSearchContacts(query: string) {
  return useQuery({
    queryKey: ['contacts', 'search', query],
    queryFn: async () => {
      logger.api('Buscando contactos', { query });
      const response = await api.get<Contact[]>('/contacts/search', { q: query });
      logger.api('Búsqueda de contactos completada', { resultCount: response.length });
      return response;
    },
    enabled: query.length >= 2, // Solo buscar con al menos 2 caracteres
    staleTime: 30 * 1000, // 30 segundos
  });
}

// Hook para obtener tags disponibles
export function useContactTags() {
  return useQuery({
    queryKey: ['contacts', 'tags'],
    queryFn: async () => {
      logger.api('Obteniendo tags de contactos');
      const response = await api.get<string[]>('/contacts/tags');
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para crear un nuevo contacto
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData: ContactFormData) => {
      logger.api('Creando nuevo contacto', { name: contactData.name, email: contactData.email });
      const response = await api.post<Contact>('/contacts', contactData);
      return response;
    },
    onSuccess: (newContact) => {
      // Invalidar la lista de contactos para que se actualice
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      logger.api('Contacto creado exitosamente', { contactId: newContact.id, name: newContact.name });
      
      toast({
        title: "Contacto creado",
        description: `El contacto ${newContact.name} ha sido creado exitosamente.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo crear el contacto.";
      logger.api('Error al crear contacto', { error: errorMessage }, true);
      
      toast({
        title: "Error al crear contacto",
        description: errorMessage,
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
      logger.api('Actualizando contacto', { contactId, updatedFields: Object.keys(data) });
      const response = await api.put<Contact>(`/contacts/${contactId}`, data);
      return response;
    },
    onSuccess: (updatedContact) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.setQueryData(['contacts', updatedContact.id], updatedContact);
      
      logger.api('Contacto actualizado exitosamente', { contactId: updatedContact.id });
      
      toast({
        title: "Contacto actualizado",
        description: `Los datos de ${updatedContact.name} han sido actualizados.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo actualizar el contacto.";
      logger.api('Error al actualizar contacto', { error: errorMessage }, true);
      
      toast({
        title: "Error al actualizar contacto",
        description: errorMessage,
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
      logger.api('Eliminando contacto', { contactId });
      await api.delete(`/contacts/${contactId}`);
      return contactId;
    },
    onSuccess: (deletedContactId) => {
      // Invalidar la lista de contactos
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      // Remover el contacto específico del cache
      queryClient.removeQueries({ queryKey: ['contacts', deletedContactId] });
      
      logger.api('Contacto eliminado exitosamente', { contactId: deletedContactId });
      
      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo eliminar el contacto.";
      logger.api('Error al eliminar contacto', { error: errorMessage }, true);
      
      toast({
        title: "Error al eliminar contacto",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

// Hook para agregar tags a un contacto
export function useAddContactTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, tags }: { contactId: string; tags: string[] }) => {
      logger.api('Agregando tags a contacto', { contactId, tags });
      const response = await api.post<Contact>(`/contacts/${contactId}/tags`, { tags });
      return response;
    },
    onSuccess: (updatedContact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.setQueryData(['contacts', updatedContact.id], updatedContact);
      
      logger.api('Tags agregados exitosamente al contacto');
      
      toast({
        title: "Tags agregados",
        description: "Los tags han sido agregados al contacto.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudieron agregar los tags.";
      logger.api('Error al agregar tags', { error: errorMessage }, true);
      
      toast({
        title: "Error al agregar tags",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

// Hook para remover tags de un contacto
export function useRemoveContactTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, tags }: { contactId: string; tags: string[] }) => {
      logger.api('Removiendo tags de contacto', { contactId, tags });
      const response = await api.delete<Contact>(`/contacts/${contactId}/tags`, { data: { tags } });
      return response;
    },
    onSuccess: (updatedContact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.setQueryData(['contacts', updatedContact.id], updatedContact);
      
      logger.api('Tags removidos exitosamente del contacto');
      
      toast({
        title: "Tags removidos",
        description: "Los tags han sido removidos del contacto.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudieron remover los tags.";
      logger.api('Error al remover tags', { error: errorMessage }, true);
      
      toast({
        title: "Error al remover tags",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

// Hook para exportar contactos
export function useExportContacts() {
  return useMutation({
    mutationFn: async (format: 'csv' | 'xlsx' = 'csv') => {
      logger.api('Exportando contactos', { format });
      
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
      link.download = `contactos-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      logger.api('Exportación de contactos completada');
      
      toast({
        title: "Exportación completada",
        description: "Los contactos se han exportado exitosamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo exportar los contactos.";
      logger.api('Error en exportación de contactos', { error: errorMessage }, true);
      
      toast({
        title: "Error en la exportación",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

// Hook para importar contactos desde CSV
export function useImportContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      logger.api('Importando contactos desde CSV', { fileName: file.name, fileSize: file.size });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const { apiClient } = await import('@/lib/apiClient');
      const response = await apiClient.post<{ 
        imported: number; 
        skipped: number; 
        errors: string[] 
      }>('/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    },
    onSuccess: (result) => {
      // Invalidar la lista de contactos para refrescar
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
      logger.api('Importación de contactos completada', { 
        imported: result.imported, 
        skipped: result.skipped 
      });
      
      toast({
        title: "Importación completada",
        description: `Se importaron ${result.imported} contactos. ${result.skipped} fueron omitidos.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo importar los contactos.";
      logger.api('Error en importación de contactos', { error: errorMessage }, true);
      
      toast({
        title: "Error en la importación",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
} 