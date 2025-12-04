import React, { useState } from 'react';
import { Upload, FileText, Download, Trash2, Eye, X, Save, AlertCircle, File, Image as ImageIcon } from 'lucide-react';
import type { ProviderDocument } from '../types';

interface DocumentsSectionProps {
  providerId: string;
  documents: ProviderDocument[];
  onUploadDocument: (document: Omit<ProviderDocument, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  providerId,
  documents,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other' as ProviderDocument['type'],
    fileUrl: '',
    notes: '',
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const documentTypeConfig = {
    contract: { label: 'Contrato', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    invoice: { label: 'Factura', icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
    receipt: { label: 'Recibo', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    certificate: { label: 'Certificado', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    other: { label: 'Otro', icon: File, color: 'text-gray-600', bg: 'bg-gray-50' },
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'other',
      fileUrl: '',
      notes: '',
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.fileUrl.trim()) {
      newErrors.fileUrl = 'La URL del archivo es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setUploading(true);
    try {
      const documentData = {
        providerId,
        name: formData.name.trim(),
        type: formData.type,
        fileUrl: formData.fileUrl.trim(),
        fileSize: 0, // TODO: Get actual file size
        mimeType: 'application/pdf', // TODO: Detect mime type
        notes: formData.notes.trim() || undefined,
      };

      await onUploadDocument(documentData);

      resetForm();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error subiendo documento:', error);
      setErrors({ submit: 'Error al subir el documento' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (document: ProviderDocument) => {
    if (window.confirm(`¿Eliminar el documento "${document.name}"?`)) {
      try {
        await onDeleteDocument(document.id);
      } catch (error) {
        console.error('Error eliminando documento:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Documentos</h3>
          <p className="text-sm text-gray-500 mt-1">
            {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowUploadModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Subir Documento</span>
          <span className="sm:hidden">Subir</span>
        </button>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay documentos adjuntos</p>
          <p className="text-sm text-gray-400 mt-1">Sube el primer documento para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => {
            const TypeIcon = documentTypeConfig[document.type].icon;
            
            return (
              <div
                key={document.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-lg ${documentTypeConfig[document.type].bg} flex-shrink-0`}>
                    <TypeIcon className={`w-6 h-6 ${documentTypeConfig[document.type].color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{document.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {documentTypeConfig[document.type].label}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatFileSize(document.fileSize)}
                    </p>
                  </div>
                </div>

                {document.notes && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">{document.notes}</p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{formatDate(document.uploadedAt)}</span>
                    <span className="truncate ml-2">{document.uploadedByName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </a>
                    <button
                      onClick={() => handleDelete(document)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Subir Documento</h3>
              <button
                onClick={() => {
                  resetForm();
                  setShowUploadModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Documento *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Contrato 2024"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ProviderDocument['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(documentTypeConfig).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Archivo *
                </label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fileUrl ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://..."
                />
                {errors.fileUrl && (
                  <p className="text-sm text-red-600 mt-1">{errors.fileUrl}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Sube el archivo a tu servidor y pega la URL aquí
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas adicionales sobre el documento..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowUploadModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {uploading ? 'Subiendo...' : 'Subir Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

