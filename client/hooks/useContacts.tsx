import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type {
  Contact,
  ContactsListRequest,
  ContactsListResponse,
  CreateContactRequest,
  CreateContactResponse,
  UpdateContactRequest,
  UpdateContactResponse,
  DeleteContactResponse,
  ContactTagsResponse,
  ImportContactsRequest,
  ImportContactsResponse,
  ContactStatsResponse,
  ExportContactsRequest,
} from "@shared/api";

// Query keys para React Query
export const contactsKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactsKeys.all, 'list'] as const,
  list: (filters: ContactsListRequest) => [...contactsKeys.lists(), filters] as const,
  details: () => [...contactsKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactsKeys.details(), id] as const,
  tags: () => [...contactsKeys.all, 'tags'] as const,
  stats: () => [...contactsKeys.all, 'stats'] as const,
};

/**
 * Hook para obtener la lista de contactos con filtros y paginación
 */
export function useContacts(filters: ContactsListRequest = {}) {
  return useQuery({
    queryKey: contactsKeys.list(filters),
    queryFn: async (): Promise<ContactsListResponse> => {
      const response = await apiClient.get('/contacts', { params: filters });
      return response.data;
    },
    staleTime: 30 * 1000, // 30 segundos
    retry: 2,
  });
}

/**
 * Hook para obtener un contacto específico por ID
 */
export function useContact(id: string) {
  return useQuery({
    queryKey: contactsKeys.detail(id),
    queryFn: async (): Promise<Contact> => {
      const response = await apiClient.get(`/contacts/${id}`);
      return response.data.contact;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener estadísticas de contactos
 */
export function useContactStats() {
  return useQuery({
    queryKey: contactsKeys.stats(),
    queryFn: async (): Promise<ContactStatsResponse> => {
      const response = await apiClient.get('/contacts/stats');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2,
  });
}

/**
 * Hook para obtener tags disponibles
 */
export function useContactTags() {
  return useQuery({
    queryKey: contactsKeys.tags(),
    queryFn: async (): Promise<ContactTagsResponse> => {
      const response = await apiClient.get('/contacts/tags');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para crear un nuevo contacto
 */
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateContactRequest): Promise<CreateContactResponse> => {
      const response = await apiClient.post('/contacts', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar todas las listas de contactos
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      // Invalidar estadísticas
      queryClient.invalidateQueries({ queryKey: contactsKeys.stats() });
      // Invalidar tags si se agregaron nuevos
      if (data.contact.tags.length > 0) {
        queryClient.invalidateQueries({ queryKey: contactsKeys.tags() });
      }
      
      console.log('Contacto creado exitosamente:', `${data.contact.firstName} ${data.contact.lastName}`);
    },
    onError: (error: any) => {
      console.error('Error al crear contacto:', error);
    },
  });
}

/**
 * Hook para actualizar un contacto existente
 */
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: UpdateContactRequest 
    }): Promise<UpdateContactResponse> => {
      const response = await apiClient.put(`/contacts/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Actualizar el contacto específico en cache
      queryClient.setQueryData(
        contactsKeys.detail(variables.id),
        data.contact
      );
      
      // Invalidar todas las listas de contactos
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      // Invalidar estadísticas
      queryClient.invalidateQueries({ queryKey: contactsKeys.stats() });
      // Invalidar tags si se modificaron
      if (data.contact.tags.length > 0) {
        queryClient.invalidateQueries({ queryKey: contactsKeys.tags() });
      }
      
      console.log('Contacto actualizado exitosamente:', `${data.contact.firstName} ${data.contact.lastName}`);
    },
    onError: (error: any) => {
      console.error('Error al actualizar contacto:', error);
    },
  });
}

/**
 * Hook para eliminar un contacto
 */
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<DeleteContactResponse> => {
      const response = await apiClient.delete(`/contacts/${id}`);
      return response.data;
    },
    onSuccess: (data, id) => {
      // Remover el contacto específico del cache
      queryClient.removeQueries({ queryKey: contactsKeys.detail(id) });
      
      // Invalidar todas las listas de contactos
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      // Invalidar estadísticas
      queryClient.invalidateQueries({ queryKey: contactsKeys.stats() });
      
      console.log('Contacto eliminado exitosamente');
    },
    onError: (error: any) => {
      console.error('Error al eliminar contacto:', error);
    },
  });
}

/**
 * Hook para importar contactos desde archivo CSV
 */
export function useImportContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ImportContactsRequest): Promise<ImportContactsResponse> => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.skipDuplicates !== undefined) {
        formData.append('skipDuplicates', String(data.skipDuplicates));
      }
      if (data.updateExisting !== undefined) {
        formData.append('updateExisting', String(data.updateExisting));
      }

      const response = await apiClient.post('/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar todas las queries de contactos después de importar
      queryClient.invalidateQueries({ queryKey: contactsKeys.all });
      
      console.log('Importación completada:', {
        imported: data.imported,
        updated: data.updated,
        errors: data.errors,
        duplicates: data.duplicates,
      });
    },
    onError: (error: any) => {
      console.error('Error al importar contactos:', error);
    },
  });
}

/**
 * Hook para exportar contactos a CSV
 */
export function useExportContacts() {
  return useMutation({
    mutationFn: async (filters: ExportContactsRequest = {}): Promise<Blob> => {
      const response = await apiClient.get('/contacts/export', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: (blob, variables) => {
      // Crear URL del blob y descargar automáticamente
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contactos_${new Date().toISOString().split('T')[0]}.${variables?.format || 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Exportación completada exitosamente');
    },
    onError: (error: any) => {
      console.error('Error al exportar contactos:', error);
    },
  });
}

/**
 * Hook para búsqueda de contactos con debounce
 */
export function useSearchContacts(searchTerm: string) {
  return useQuery({
    queryKey: contactsKeys.list({ search: searchTerm }),
    queryFn: async (): Promise<ContactsListResponse> => {
      const response = await apiClient.get('/contacts', {
        params: { search: searchTerm, limit: 20 }
      });
      return response.data;
    },
    enabled: searchTerm.length >= 2, // Solo buscar si hay al menos 2 caracteres
    staleTime: 30 * 1000, // 30 segundos
  });
} 