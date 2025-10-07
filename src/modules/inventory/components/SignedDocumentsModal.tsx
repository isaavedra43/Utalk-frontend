import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, FileImage, FileText, Calendar, Eye } from 'lucide-react';
import { SignedDocumentsService, SignedDocument } from '../services/signedDocumentsService';
import { useNotifications } from '../../../contexts/NotificationContext';

interface SignedDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformId?: string;
  platformNumber?: string;
}

export const SignedDocumentsModal: React.FC<SignedDocumentsModalProps> = ({
  isOpen,
  onClose,
  platformId,
  platformNumber
}) => {
  const [documents, setDocuments] = useState<SignedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, platformId]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      let docs: SignedDocument[];
      if (platformId) {
        docs = SignedDocumentsService.getSignedDocumentsByPlatform(platformId);
      } else {
        docs = SignedDocumentsService.getSignedDocuments();
      }
      setDocuments(docs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      showError('Error al cargar documentos firmados');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (document: SignedDocument) => {
    try {
      SignedDocumentsService.downloadSignedDocument(document);
      showSuccess('Documento descargado', `Se descargó ${document.fileName}`);
    } catch (error) {
      showError('Error al descargar documento');
    }
  };

  const handleDelete = async (documentId: string, fileName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el documento "${fileName}"?`)) {
      try {
        const deleted = SignedDocumentsService.deleteSignedDocument(documentId);
        if (deleted) {
          await loadDocuments();
          showSuccess('Documento eliminado', `Se eliminó ${fileName}`);
        } else {
          showError('Error al eliminar documento');
        }
      } catch (error) {
        showError('Error al eliminar documento');
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Desconocido';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Documentos Firmados
            {platformNumber && <span className="text-sm text-gray-600">- Plataforma {platformNumber}</span>}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando documentos...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No hay documentos firmados
              </h4>
              <p className="text-gray-600">
                {platformId
                  ? `No se encontraron documentos firmados para la plataforma ${platformNumber}`
                  : 'No hay documentos firmados almacenados'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icono del tipo de documento */}
                      <div className="flex-shrink-0">
                        {document.documentType === 'pdf' ? (
                          <FileText className="h-8 w-8 text-red-500" />
                        ) : (
                          <FileImage className="h-8 w-8 text-purple-500" />
                        )}
                      </div>

                      {/* Información del documento */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {document.fileName}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {document.createdAt.toLocaleDateString('es-MX')}
                          </span>
                          <span>Plataforma {document.platformNumber}</span>
                          <span>{formatFileSize(document.fileSize)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(document)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        title="Descargar documento"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Descargar</span>
                      </button>

                      <button
                        onClick={() => handleDelete(document.id, document.fileName)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        title="Eliminar documento"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {documents.length} documento(s) encontrado(s)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
