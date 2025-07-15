import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiClient } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import type { 
  KBDocument, 
  FAQ, 
  FAQFormData, 
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Hook para obtener documentos de la base de conocimiento
export function useKnowledgeBaseDocs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  folder?: string;
  tags?: string[];
}) {
  return useQuery({
    queryKey: ['knowledge', 'documents', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<KBDocument>>('/knowledge/documents', params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener un documento específico
export function useKnowledgeBaseDoc(docId: string) {
  return useQuery({
    queryKey: ['knowledge', 'documents', docId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<KBDocument>>(`/knowledge/documents/${docId}`);
      return response.data;
    },
    enabled: !!docId,
  });
}

// Hook para subir un documento
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      file, 
      title, 
      description, 
      folder, 
      tags = [] 
    }: {
      file: File;
      title: string;
      description: string;
      folder: string;
      tags?: string[];
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('folder', folder);
      tags.forEach(tag => formData.append('tags[]', tag));

      const response = await apiClient.post<ApiResponse<KBDocument>>(
        '/knowledge/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', 'documents'] });
      
      toast({
        title: "Documento subido",
        description: `El documento "${newDoc.name}" ha sido subido exitosamente.`,
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

// Hook para eliminar un documento
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docId: string) => {
      const response = await api.delete<ApiResponse<void>>(`/knowledge/documents/${docId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', 'documents'] });
      
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

// Hook para marcar/desmarcar como favorito
export function useToggleFavoriteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ docId, isFavorite }: { docId: string; isFavorite: boolean }) => {
      const response = await api.patch<ApiResponse<KBDocument>>(
        `/knowledge/documents/${docId}/favorite`,
        { isFavorite }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', 'documents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo actualizar el favorito.",
        variant: "destructive",
      });
    },
  });
}

// Hook para descargar documentos como ZIP
export function useDownloadDocumentsZip() {
  return useMutation({
    mutationFn: async (docIds: string[]) => {
      const response = await apiClient.get('/knowledge/documents/download-zip', {
        params: { ids: docIds.join(',') },
        responseType: 'blob',
      });
      
      // Crear URL para descarga
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'documentos.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Descarga iniciada",
        description: "Los documentos se están descargando como ZIP.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en la descarga",
        description: error.response?.data?.message || "No se pudo descargar los documentos.",
        variant: "destructive",
      });
    },
  });
}

// Hook para generar enlace de compartición
export function useShareDocument() {
  return useMutation({
    mutationFn: async (docId: string) => {
      const response = await api.post<ApiResponse<{ shareLink: string }>>(
        `/knowledge/documents/${docId}/share`
      );
      return response.data;
    },
    onSuccess: (result) => {
      // Copiar al portapapeles
      if (navigator.clipboard) {
        navigator.clipboard.writeText(result.shareLink);
        toast({
          title: "Enlace copiado",
          description: "El enlace de compartición ha sido copiado al portapapeles.",
        });
      } else {
        toast({
          title: "Enlace generado",
          description: `Enlace: ${result.shareLink}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error al compartir",
        description: error.response?.data?.message || "No se pudo generar el enlace.",
        variant: "destructive",
      });
    },
  });
}

// ========================= FAQs =========================

// Hook para obtener FAQs
export function useFAQs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: ['knowledge', 'faqs', params],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<FAQ>>('/knowledge/faqs', params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
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
    onSuccess: (newFaq) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', 'faqs'] });
      
      toast({
        title: "FAQ creada",
        description: `La FAQ "${newFaq.question}" ha sido creada exitosamente.`,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', 'faqs'] });
      
      toast({
        title: "FAQ actualizada",
        description: "La FAQ ha sido actualizada exitosamente.",
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
      queryClient.invalidateQueries({ queryKey: ['knowledge', 'faqs'] });
      
      toast({
        title: "FAQ eliminada",
        description: "La FAQ ha sido eliminada exitosamente.",
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
export function useSearchKnowledgeBase(query: string, type?: 'documents' | 'faqs' | 'all') {
  return useQuery({
    queryKey: ['knowledge', 'search', query, type],
    queryFn: async () => {
      const params = { 
        q: query,
        ...(type && { type })
      };
      const response = await api.get<ApiResponse<{ documents: KBDocument[]; faqs: FAQ[] }>>(
        '/knowledge/search', 
        params
      );
      return response.data;
    },
    enabled: query.length > 2, // Solo buscar si hay al menos 3 caracteres
    staleTime: 30 * 1000,
  });
} 