import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/utils";
import type { 
  KnowledgeBaseItem, 
  FAQ,
  ApiResponse, 
  PaginatedResponse 
} from "@/types/api";

// Tipos específicos para knowledge base
interface DocumentFormData {
  title: string;
  description?: string;
  category: string;
  tags: string[];
  content?: string;
  file?: File;
  isPublic: boolean;
  permissions?: string[];
}

interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isPublic: boolean;
}

interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  type?: 'document' | 'faq' | 'all';
  dateFrom?: string;
  dateTo?: string;
}

// Hook para obtener lista de elementos de knowledge base
export function useKnowledgeBase(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  type?: 'document' | 'faq' | 'all';
  tags?: string[];
}) {
  return useQuery({
    queryKey: ['knowledge-base', params],
    queryFn: async () => {
      logger.api('Obteniendo elementos de knowledge base', { params });
      const response = await api.get<PaginatedResponse<KnowledgeBaseItem>>('/knowledge-base', params);
      logger.api('Elementos de knowledge base obtenidos exitosamente', { 
        total: response.pagination?.total 
      });
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para obtener un elemento específico de knowledge base
export function useKnowledgeBaseItem(itemId: string) {
  return useQuery({
    queryKey: ['knowledge-base', itemId],
    queryFn: async () => {
      logger.api('Obteniendo elemento específico de knowledge base', { itemId });
      const response = await api.get<KnowledgeBaseItem>(`/knowledge-base/${itemId}`);
      return response;
    },
    enabled: !!itemId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para búsqueda avanzada en knowledge base
export function useSearchKnowledgeBase(filters: SearchFilters) {
  return useQuery({
    queryKey: ['knowledge-base', 'search', filters],
    queryFn: async () => {
      logger.api('Búsqueda avanzada en knowledge base', { filters });
      const response = await api.post<KnowledgeBaseItem[]>('/knowledge-base/search', filters);
      logger.api('Búsqueda completada', { resultCount: response.length });
      return response;
    },
    enabled: !!(filters.query && filters.query.length >= 2),
    staleTime: 30 * 1000, // 30 segundos
  });
}

// Hook para obtener categorías disponibles
export function useKnowledgeBaseCategories() {
  return useQuery({
    queryKey: ['knowledge-base', 'categories'],
    queryFn: async () => {
      logger.api('Obteniendo categorías de knowledge base');
      const response = await api.get<Array<{
        id: string;
        name: string;
        description?: string;
        itemCount: number;
      }>>('/knowledge-base/categories');
      logger.api('Categorías obtenidas exitosamente', { categoryCount: response.length });
      return response;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}

// Hook para obtener tags disponibles
export function useKnowledgeBaseTags() {
  return useQuery({
    queryKey: ['knowledge-base', 'tags'],
    queryFn: async () => {
      logger.api('Obteniendo tags de knowledge base');
      const response = await api.get<string[]>('/knowledge-base/tags');
      logger.api('Tags obtenidos exitosamente', { tagCount: response.length });
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para crear documento
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentData: DocumentFormData) => {
      logger.api('Creando nuevo documento', { 
        title: documentData.title, 
        category: documentData.category,
        hasFile: !!documentData.file 
      });

      // Si hay archivo, usar FormData para subir el archivo
      if (documentData.file) {
        const formData = new FormData();
        formData.append('file', documentData.file);
        formData.append('title', documentData.title);
        formData.append('category', documentData.category);
        formData.append('tags', JSON.stringify(documentData.tags));
        formData.append('isPublic', String(documentData.isPublic));
        if (documentData.description) {
          formData.append('description', documentData.description);
        }
        if (documentData.permissions) {
          formData.append('permissions', JSON.stringify(documentData.permissions));
        }

        const { apiClient } = await import('@/lib/apiClient');
        const response = await apiClient.post<KnowledgeBaseItem>('/knowledge-base/documents', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Solo texto, enviar como JSON
        const response = await api.post<KnowledgeBaseItem>('/knowledge-base/documents', documentData);
        return response;
      }
    },
    onSuccess: (newDocument) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      
      logger.api('Documento creado exitosamente', { 
        documentId: newDocument.id, 
        title: newDocument.title 
      });
      
      toast({
        title: "Documento creado",
        description: `El documento "${newDocument.title}" ha sido creado exitosamente.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo crear el documento.";
      logger.api('Error al crear documento', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al crear documento",
        description: errorMessage,
      });
    },
  });
}

// Hook para crear FAQ
export function useCreateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faqData: FAQFormData) => {
      logger.api('Creando nueva FAQ', { 
        question: faqData.question.substring(0, 50) + '...',
        category: faqData.category 
      });
      const response = await api.post<FAQ>('/knowledge-base/faqs', faqData);
      return response;
    },
    onSuccess: (newFAQ) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      
      logger.api('FAQ creada exitosamente', { 
        faqId: newFAQ.id, 
        question: newFAQ.question 
      });
      
      toast({
        title: "FAQ creada",
        description: "La pregunta frecuente ha sido creada exitosamente.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo crear la FAQ.";
      logger.api('Error al crear FAQ', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al crear FAQ",
        description: errorMessage,
      });
    },
  });
}

// Hook para actualizar documento
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      documentId, 
      data 
    }: { 
      documentId: string; 
      data: Partial<DocumentFormData> 
    }) => {
      logger.api('Actualizando documento', { 
        documentId, 
        updatedFields: Object.keys(data) 
      });
      
      const response = await api.put<KnowledgeBaseItem>(`/knowledge-base/documents/${documentId}`, data);
      return response;
    },
    onSuccess: (updatedDocument) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      queryClient.setQueryData(['knowledge-base', updatedDocument.id], updatedDocument);
      
      logger.api('Documento actualizado exitosamente', { documentId: updatedDocument.id });
      
      toast({
        title: "Documento actualizado",
        description: `"${updatedDocument.title}" ha sido actualizado.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo actualizar el documento.";
      logger.api('Error al actualizar documento', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al actualizar documento",
        description: errorMessage,
      });
    },
  });
}

// Hook para actualizar FAQ
export function useUpdateFAQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      faqId, 
      data 
    }: { 
      faqId: string; 
      data: Partial<FAQFormData> 
    }) => {
      logger.api('Actualizando FAQ', { 
        faqId, 
        updatedFields: Object.keys(data) 
      });
      
      const response = await api.put<FAQ>(`/knowledge-base/faqs/${faqId}`, data);
      return response;
    },
    onSuccess: (updatedFAQ) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      queryClient.setQueryData(['knowledge-base', updatedFAQ.id], updatedFAQ);
      
      logger.api('FAQ actualizada exitosamente', { faqId: updatedFAQ.id });
      
      toast({
        title: "FAQ actualizada",
        description: "La pregunta frecuente ha sido actualizada.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo actualizar la FAQ.";
      logger.api('Error al actualizar FAQ', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al actualizar FAQ",
        description: errorMessage,
      });
    },
  });
}

// Hook para eliminar elemento de knowledge base
export function useDeleteKnowledgeBaseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      logger.api('Eliminando elemento de knowledge base', { itemId });
      await api.delete(`/knowledge-base/${itemId}`);
      return itemId;
    },
    onSuccess: (deletedItemId) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      queryClient.removeQueries({ queryKey: ['knowledge-base', deletedItemId] });
      
      logger.api('Elemento eliminado exitosamente', { itemId: deletedItemId });
      
      toast({
        title: "Elemento eliminado",
        description: "El elemento ha sido eliminado de la base de conocimiento.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo eliminar el elemento.";
      logger.api('Error al eliminar elemento', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al eliminar elemento",
        description: errorMessage,
      });
    },
  });
}

// Hook para descargar documento
export function useDownloadDocument() {
  return useMutation({
    mutationFn: async (documentId: string) => {
      logger.api('Descargando documento', { documentId });
      
      const { apiClient } = await import('@/lib/apiClient');
      const response = await apiClient.get(`/knowledge-base/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      
      // Crear URL para descarga
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo del header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `document-${documentId}`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return response;
    },
    onSuccess: () => {
      logger.api('Descarga de documento completada');
      
      toast({
        title: "Descarga iniciada",
        description: "El documento se está descargando.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo descargar el documento.";
      logger.api('Error al descargar documento', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error en descarga",
        description: errorMessage,
      });
    },
  });
}

// Hook para obtener contenido de documento para vista previa
export function useDocumentContent(documentId: string) {
  return useQuery({
    queryKey: ['knowledge-base', documentId, 'content'],
    queryFn: async () => {
      logger.api('Obteniendo contenido de documento para vista previa', { documentId });
      const response = await api.get<{
        content: string;
        type: string;
        size: number;
        pages?: number;
      }>(`/knowledge-base/documents/${documentId}/content`);
      return response;
    },
    enabled: !!documentId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para obtener estadísticas de knowledge base
export function useKnowledgeBaseStats() {
  return useQuery({
    queryKey: ['knowledge-base', 'stats'],
    queryFn: async () => {
      logger.api('Obteniendo estadísticas de knowledge base');
      const response = await api.get<{
        totalItems: number;
        totalDocuments: number;
        totalFAQs: number;
        totalViews: number;
        popularItems: Array<{
          id: string;
          title: string;
          views: number;
          type: string;
        }>;
        recentActivity: Array<{
          id: string;
          title: string;
          action: string;
          timestamp: string;
          user: string;
        }>;
        categoriesStats: Array<{
          category: string;
          count: number;
          percentage: number;
        }>;
      }>('/knowledge-base/stats');
      logger.api('Estadísticas de knowledge base obtenidas exitosamente');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para marcar elemento como favorito
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      logger.api('Alternando favorito en elemento', { itemId });
      const response = await api.post<{ isFavorite: boolean }>(`/knowledge-base/${itemId}/favorite`);
      return { itemId, isFavorite: response.isFavorite };
    },
    onSuccess: ({ itemId, isFavorite }) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      
      logger.api('Estado de favorito actualizado', { itemId, isFavorite });
      
      toast({
        title: isFavorite ? "Agregado a favoritos" : "Removido de favoritos",
        description: isFavorite 
          ? "El elemento ha sido agregado a tus favoritos."
          : "El elemento ha sido removido de tus favoritos.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo actualizar el estado de favorito.";
      logger.api('Error al alternar favorito', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    },
  });
}

// Hook para crear categoría
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData: { name: string; description?: string }) => {
      logger.api('Creando nueva categoría', { name: categoryData.name });
      const response = await api.post<{
        id: string;
        name: string;
        description?: string;
        itemCount: number;
      }>('/knowledge-base/categories', categoryData);
      return response;
    },
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', 'categories'] });
      
      logger.api('Categoría creada exitosamente', { categoryId: newCategory.id });
      
      toast({
        title: "Categoría creada",
        description: `La categoría "${newCategory.name}" ha sido creada.`,
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo crear la categoría.";
      logger.api('Error al crear categoría', { error: errorMessage }, true);
      
      toast({
        variant: "destructive",
        title: "Error al crear categoría",
        description: errorMessage,
      });
    },
  });
}

// Hook para registro de visualización
export function useTrackView() {
  return useMutation({
    mutationFn: async (itemId: string) => {
      logger.api('Registrando visualización', { itemId });
      await api.post(`/knowledge-base/${itemId}/view`);
    },
    onError: (error: any) => {
      logger.api('Error al registrar visualización', { error: error.message }, true);
      // No mostrar toast para este error, es silencioso
    },
  });
} 