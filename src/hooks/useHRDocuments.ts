import { useState, useEffect, useCallback } from 'react';
import {
  hrDocumentsService,
  HRDocument,
  HRDocumentMetadata,
  HRDocumentsSummary,
  HRDocumentsFilters
} from '../services/hrDocumentsService';

// ============================================================================
// TYPES
// ============================================================================

interface UseHRDocumentsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialFilters?: HRDocumentsFilters;
}

interface UseHRDocumentsReturn {
  documents: HRDocument[];
  summary: HRDocumentsSummary | null;
  folders: string[];
  loading: boolean;
  error: string | null;
  uploadDocument: (file: File, metadata: HRDocumentMetadata) => Promise<HRDocument>;
  updateDocument: (documentId: string, metadata: Partial<HRDocumentMetadata>) => Promise<HRDocument>;
  deleteDocument: (documentId: string) => Promise<void>;
  downloadDocument: (documentId: string, fileName: string) => Promise<void>;
  getPreviewUrl: (documentId: string) => Promise<string>;
  toggleFavorite: (documentId: string) => Promise<HRDocument>;
  togglePin: (documentId: string) => Promise<HRDocument>;
  shareDocument: (documentId: string, shareData: any) => Promise<void>;
  duplicateDocument: (documentId: string) => Promise<HRDocument>;
  moveDocument: (documentId: string, folder: string) => Promise<HRDocument>;
  searchDocuments: (query: string, filters?: HRDocumentsFilters) => Promise<HRDocument[]>;
  createFolder: (folderName: string) => Promise<void>;
  deleteFolder: (folderName: string) => Promise<void>;
  exportDocuments: (format?: 'excel' | 'pdf', filters?: HRDocumentsFilters) => Promise<Blob>;
  refreshData: () => Promise<void>;
  setFilters: (filters: HRDocumentsFilters) => void;
}

// ============================================================================
// HOOK
// ============================================================================

export const useHRDocuments = (options: UseHRDocumentsOptions = {}): UseHRDocumentsReturn => {
  const { autoRefresh = false, refreshInterval = 30000, initialFilters = {} } = options;

  const [documents, setDocuments] = useState<HRDocument[]>([]);
  const [summary, setSummary] = useState<HRDocumentsSummary | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HRDocumentsFilters>(initialFilters);

  // Cargar datos
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando documentos de RH');

      const [documentsData, summaryData, foldersData] = await Promise.all([
        hrDocumentsService.getDocuments(filters),
        hrDocumentsService.getSummary(),
        hrDocumentsService.getFolders()
      ]);

      setDocuments(documentsData);
      setSummary(summaryData);
      setFolders(foldersData);

      console.log('✅ Datos de documentos de RH cargados:', {
        totalDocuments: documentsData.length,
        folders: foldersData.length
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando documentos';
      setError(errorMessage);
      console.error('❌ Error cargando documentos:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Cargar datos inicialmente
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh de documentos');
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  // Subir documento
  const uploadDocument = useCallback(async (file: File, metadata: HRDocumentMetadata): Promise<HRDocument> => {
    try {
      setError(null);
      const result = await hrDocumentsService.uploadDocument(file, metadata);
      
      setDocuments(prev => [result, ...prev]);
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error subiendo documento';
      setError(errorMessage);
      throw err;
    }
  }, [refreshData]);

  // Actualizar documento
  const updateDocument = useCallback(async (
    documentId: string,
    metadata: Partial<HRDocumentMetadata>
  ): Promise<HRDocument> => {
    try {
      setError(null);
      const result = await hrDocumentsService.updateDocument(documentId, metadata);
      
      setDocuments(prev => prev.map(doc => doc.id === documentId ? result : doc));
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error actualizando documento';
      setError(errorMessage);
      throw err;
    }
  }, [refreshData]);

  // Eliminar documento
  const deleteDocument = useCallback(async (documentId: string): Promise<void> => {
    try {
      setError(null);
      await hrDocumentsService.deleteDocument(documentId);
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando documento';
      setError(errorMessage);
      throw err;
    }
  }, [refreshData]);

  // Descargar documento
  const downloadDocument = useCallback(async (documentId: string, fileName: string): Promise<void> => {
    try {
      setError(null);
      const blob = await hrDocumentsService.downloadDocument(documentId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error descargando documento';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Obtener URL de vista previa
  const getPreviewUrl = useCallback(async (documentId: string): Promise<string> => {
    try {
      setError(null);
      return await hrDocumentsService.getPreviewUrl(documentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error obteniendo vista previa';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Toggle favorito
  const toggleFavorite = useCallback(async (documentId: string): Promise<HRDocument> => {
    try {
      setError(null);
      const result = await hrDocumentsService.toggleFavorite(documentId);
      
      setDocuments(prev => prev.map(doc => doc.id === documentId ? result : doc));
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cambiando favorito';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Toggle pin
  const togglePin = useCallback(async (documentId: string): Promise<HRDocument> => {
    try {
      setError(null);
      const result = await hrDocumentsService.togglePin(documentId);
      
      setDocuments(prev => prev.map(doc => doc.id === documentId ? result : doc));
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fijando documento';
      setError(errorMessage);
      throw err;
    }
  }, [refreshData]);

  // Compartir documento
  const shareDocument = useCallback(async (documentId: string, shareData: any): Promise<void> => {
    try {
      setError(null);
      await hrDocumentsService.shareDocument(documentId, shareData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error compartiendo documento';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Duplicar documento
  const duplicateDocument = useCallback(async (documentId: string): Promise<HRDocument> => {
    try {
      setError(null);
      const result = await hrDocumentsService.duplicateDocument(documentId);
      
      setDocuments(prev => [result, ...prev]);
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error duplicando documento';
      setError(errorMessage);
      throw err;
    }
  }, [refreshData]);

  // Mover documento
  const moveDocument = useCallback(async (documentId: string, folder: string): Promise<HRDocument> => {
    try {
      setError(null);
      const result = await hrDocumentsService.moveDocument(documentId, folder);
      
      setDocuments(prev => prev.map(doc => doc.id === documentId ? result : doc));
      await refreshData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error moviendo documento';
      setError(errorMessage);
      throw err;
    }
  }, [refreshData]);

  // Buscar documentos
  const searchDocuments = useCallback(async (
    query: string,
    searchFilters?: HRDocumentsFilters
  ): Promise<HRDocument[]> => {
    try {
      setError(null);
      return await hrDocumentsService.searchDocuments(query, searchFilters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error buscando documentos';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Crear carpeta
  const createFolder = useCallback(async (folderName: string): Promise<void> => {
    try {
      setError(null);
      await hrDocumentsService.createFolder(folderName);
      
      setFolders(prev => [...prev, folderName]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creando carpeta';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Eliminar carpeta
  const deleteFolder = useCallback(async (folderName: string): Promise<void> => {
    try {
      setError(null);
      await hrDocumentsService.deleteFolder(folderName);
      
      setFolders(prev => prev.filter(f => f !== folderName));
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error eliminando carpeta';
      setError(errorMessage);
      throw err;
    }
  }, [refreshData]);

  // Exportar documentos
  const exportDocuments = useCallback(async (
    format: 'excel' | 'pdf' = 'excel',
    exportFilters?: HRDocumentsFilters
  ): Promise<Blob> => {
    try {
      setError(null);
      return await hrDocumentsService.exportDocuments(format, exportFilters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error exportando documentos';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    documents,
    summary,
    folders,
    loading,
    error,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    getPreviewUrl,
    toggleFavorite,
    togglePin,
    shareDocument,
    duplicateDocument,
    moveDocument,
    searchDocuments,
    createFolder,
    deleteFolder,
    exportDocuments,
    refreshData,
    setFilters
  };
};

export default useHRDocuments;

