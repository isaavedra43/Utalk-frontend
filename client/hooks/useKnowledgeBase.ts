import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { 
  KBDocument, 
  FAQ, 
  FAQFormData,
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

export interface DocumentFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  file?: File;
  isPublic: boolean;
  permissions: {
    read: string[];
    write: string[];
  };
}

// Hook para obtener documentos
export function useDocuments(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<KBDocument>>('/knowledge/documents', params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener un documento específico
export function useDocument(documentId: string) {
  return useQuery({
    queryKey: ['documents', documentId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<KBDocument>>(`/knowledge/documents/${documentId}`);
      return response.data;
    },
    enabled: !!documentId,
  });
}

// Hook para subir/crear un documento
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentData: DocumentFormData) => {
      const formData = new FormData();
      formData.append('title', documentData.title);
      formData.append('description', documentData.description);
      formData.append('category', documentData.category);
      formData.append('tags', JSON.stringify(documentData.tags));
      formData.append('isPublic', String(documentData.isPublic));
      formData.append('permissions', JSON.stringify(documentData.permissions));
      
      if (documentData.file) {
        formData.append('file', documentData.file);
      }

      // Usar apiClient directamente para manejar FormData
      const { apiClient } = await import('@/lib/apiClient');
      const response = await apiClient.post<ApiResponse<KBDocument>>('/knowledge/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (newDocument) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      toast({
        title: "Documento subido",
        description: `El documento "${newDocument.name}" ha sido subido exitosamente.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al subir documento",
        description: error.response?.data?.message || "No se pudo subir el documento.",
        variant: "destructive",
      });
    },
  });
}

// Hook para actualizar un documento
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, data }: { 
      documentId: string; 
      data: Partial<DocumentFormData> 
    }) => {
      const response = await api.put<ApiResponse<KBDocument>>(`/knowledge/documents/${documentId}`, data);
      return response.data;
    },
    onSuccess: (updatedDocument) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', updatedDocument.id] });
      
      toast({
        title: "Documento actualizado",
        description: `El documento "${updatedDocument.name}" ha sido actualizado.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar documento",
        description: error.response?.data?.message || "No se pudo actualizar el documento.",
        variant: "destructive",
      });
    },
  });
}

// Hook para eliminar un documento
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await api.delete<ApiResponse<void>>(`/knowledge/documents/${documentId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar documento",
        description: error.response?.data?.message || "No se pudo eliminar el documento.",
        variant: "destructive",
      });
    },
  });
}

// Hook para obtener FAQs
export function useFAQs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  priority?: FAQ['priority'];
}) {
  return useQuery({
    queryKey: ['faqs', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<FAQ>>('/knowledge/faqs', params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener una FAQ específica
export function useFAQ(faqId: string) {
  return useQuery({
    queryKey: ['faqs', faqId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<FAQ>>(`/knowledge/faqs/${faqId}`);
      return response.data;
    },
    enabled: !!faqId,
  });
}

// Hook para crear una FAQ
export function useCreateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faqData: FAQFormData) => {
      const response = await api.post<ApiResponse<FAQ>>('/knowledge/faqs', faqData);
      return response.data;
    },
    onSuccess: (newFAQ) => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      
      toast({
        title: "FAQ creada",
        description: "La pregunta frecuente ha sido creada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear FAQ",
        description: error.response?.data?.message || "No se pudo crear la FAQ.",
        variant: "destructive",
      });
    },
  });
}

// Hook para actualizar una FAQ
export function useUpdateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ faqId, data }: { faqId: string; data: Partial<FAQFormData> }) => {
      const response = await api.put<ApiResponse<FAQ>>(`/knowledge/faqs/${faqId}`, data);
      return response.data;
    },
    onSuccess: (updatedFAQ) => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs', updatedFAQ.id] });
      
      toast({
        title: "FAQ actualizada",
        description: "La pregunta frecuente ha sido actualizada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar FAQ",
        description: error.response?.data?.message || "No se pudo actualizar la FAQ.",
        variant: "destructive",
      });
    },
  });
}

// Hook para eliminar una FAQ
export function useDeleteFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faqId: string) => {
      const response = await api.delete<ApiResponse<void>>(`/knowledge/faqs/${faqId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      
      toast({
        title: "FAQ eliminada",
        description: "La pregunta frecuente ha sido eliminada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar FAQ",
        description: error.response?.data?.message || "No se pudo eliminar la FAQ.",
        variant: "destructive",
      });
    },
  });
}

// Hook para buscar en la base de conocimiento
export function useSearchKnowledge(query: string) {
  return useQuery({
    queryKey: ['search-knowledge', query],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        documents: KBDocument[];
        faqs: FAQ[];
        totalResults: number;
      }>>('/knowledge/search', { q: query });
      return response.data;
    },
    enabled: query.length > 2, // Solo buscar si hay al menos 3 caracteres
    staleTime: 30 * 1000, // 30 segundos
  });
}

// Hook para obtener categorías disponibles
export function useKnowledgeCategories() {
  return useQuery({
    queryKey: ['knowledge-categories'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        documentCategories: string[];
        faqCategories: string[];
      }>>('/knowledge/categories');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para obtener estadísticas de la base de conocimiento
export function useKnowledgeStats() {
  return useQuery({
    queryKey: ['knowledge-stats'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{
        totalDocuments: number;
        totalFAQs: number;
        totalViews: number;
        totalDownloads: number;
        popularDocuments: Array<{
          id: string;
          title: string;
          views: number;
          downloads: number;
        }>;
        recentActivity: Array<{
          type: 'document' | 'faq';
          action: 'created' | 'updated' | 'viewed' | 'downloaded';
          title: string;
          timestamp: string;
          user: string;
        }>;
      }>>('/knowledge/stats');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para marcar un documento como favorito
export function useToggleDocumentFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, isFavorite }: { documentId: string; isFavorite: boolean }) => {
      const response = await api.post<ApiResponse<void>>(`/knowledge/documents/${documentId}/favorite`, {
        favorite: isFavorite,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// Hook para descargar un documento
export function useDownloadDocument() {
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { apiClient } = await import('@/lib/apiClient');
      const response = await apiClient.get(`/knowledge/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      
      // Crear URL para descarga
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extraer nombre del archivo de los headers si está disponible
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'documento';
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches) filename = matches[1];
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Descarga iniciada",
        description: "El documento se está descargando.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en la descarga",
        description: error.response?.data?.message || "No se pudo descargar el documento.",
        variant: "destructive",
      });
    },
  });
} 