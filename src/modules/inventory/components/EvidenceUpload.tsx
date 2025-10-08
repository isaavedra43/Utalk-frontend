import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle, AlertCircle, Trash2, Search as EyeIcon, Plus as UploadIcon } from 'lucide-react';
import { EvidenceService } from '../services/evidenceService';
import type { Evidence } from '../types';

interface EvidenceUploadProps {
  platformId: string;
  providerId: string;  // ⭐ REQUERIDO por backend
  existingEvidence?: Evidence[];
  onEvidenceUpdated: (evidence: Evidence[]) => void;
  className?: string;
}

interface FilePreview {
  file: File;
  preview?: string;
  description?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  platformId,
  providerId,  // ⭐ REQUERIDO por backend
  existingEvidence = [],
  onEvidenceUpdated,
  className = ''
}: EvidenceUploadProps) => {
  // Debug: Log props
  console.log('🔍 EvidenceUpload props:', {
    platformId,
    providerId,
    existingEvidenceCount: existingEvidence.length
  });
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FilePreview[] = Array.from(selectedFiles).map(file => {
      // Validar archivo
      const validation = EvidenceService.validateFile(file);
      
      return {
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        description: '',
        status: validation.valid ? 'pending' : 'error',
        error: validation.error
      };
    });

    setFiles((prev: FilePreview[]) => [...prev, ...newFiles]);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    setFiles((prev: FilePreview[]) => prev.map((file: FilePreview, i: number) => 
      i === index ? { ...file, description } : file
    ));
  };

  const removeFile = (index: number) => {
    setFiles((prev: FilePreview[]) => {
      const updated = prev.filter((_: FilePreview, i: number) => i !== index);
      // Limpiar URL de preview para imágenes
      const fileToRemove = prev[index];
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  const handleUpload = async () => {
    const validFiles = files.filter((f: FilePreview) => f.status === 'pending');
    if (validFiles.length === 0) return;

    // Validar que tenemos los datos requeridos
    if (!platformId || !providerId) {
      console.error('❌ Datos requeridos faltantes:', { platformId, providerId });
      alert('Error: Faltan datos requeridos para subir evidencias. Por favor, recarga la página e intenta nuevamente.');
      return;
    }

    console.log('🚀 Iniciando subida de evidencias:', {
      platformId,
      providerId,
      filesCount: validFiles.length
    });

    setUploading(true);
    
    try {
      const filesToUpload = validFiles.map((f: FilePreview) => f.file);
      const descriptions = validFiles.map((f: FilePreview) => f.description || '');
      
      // Actualizar estado a uploading
      setFiles((prev: FilePreview[]) => prev.map((file: FilePreview) => 
        validFiles.includes(file) 
          ? { ...file, status: 'uploading' as const, progress: 0 }
          : file
      ));

      const uploadedEvidence = await EvidenceService.uploadEvidence(
        filesToUpload, 
        platformId,
        providerId,  // ⭐ AGREGADO - Requerido por backend
        descriptions
      );

      // Actualizar estado a success
      setFiles((prev: FilePreview[]) => prev.map((file: FilePreview) => 
        validFiles.includes(file) 
          ? { ...file, status: 'success' as const, progress: 100 }
          : file
      ));

      // Notificar al componente padre
      onEvidenceUpdated([...existingEvidence, ...uploadedEvidence]);

      // Limpiar archivos subidos después de un delay
      setTimeout(() => {
        setFiles((prev: FilePreview[]) => prev.filter((f: FilePreview) => !validFiles.includes(f)));
        setShowUpload(false);
      }, 2000);

    } catch (error) {
      console.error('Error subiendo archivos:', error);
      
      // Actualizar estado a error
      setFiles((prev: FilePreview[]) => prev.map((file: FilePreview) => 
        validFiles.includes(file) 
          ? { 
              ...file, 
              status: 'error' as const, 
              error: error instanceof Error ? error.message : 'Error desconocido'
            }
          : file
      ));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId: string) => {
    try {
      await EvidenceService.deleteEvidence(evidenceId, platformId, providerId);
      const updatedEvidence = existingEvidence.filter((e: Evidence) => e.id !== evidenceId);
      onEvidenceUpdated(updatedEvidence);
    } catch (error) {
      console.error('Error eliminando evidencia:', error);
    }
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Evidencias
        </h3>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <UploadIcon className="h-4 w-4" />
          Subir Evidencias
        </button>
      </div>

      {/* Evidencias existentes */}
      {existingEvidence.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Archivos adjuntos:</h4>
          <div className="grid grid-cols-1 gap-2">
            {existingEvidence.map((evidence) => (
              <div
                key={evidence.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {EvidenceService.getFileIcon(evidence.fileType)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {evidence.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {EvidenceService.formatFileSize(evidence.fileSize)} • 
                      {evidence.uploadDate ? new Date(evidence.uploadDate).toLocaleDateString() : ''}
                    </p>
                    {evidence.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {evidence.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {evidence.url && (
                    <button
                      onClick={() => window.open(evidence.url, '_blank')}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver archivo"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteEvidence(evidence.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar evidencia"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel de subida */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="space-y-4">
              {/* Zona de drop */}
              <div
                onClick={openFileInput}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <UploadIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Haz clic para seleccionar archivos o arrastra archivos aquí
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, PDF, DOC, DOCX, XLS, XLSX, TXT (máx. 10MB por archivo)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files)}
                className="hidden"
              />

              {/* Lista de archivos */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Archivos seleccionados:</h4>
                  {files.map((filePreview: FilePreview, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                    >
                      {/* Preview */}
                      <div className="flex-shrink-0">
                        {filePreview.preview ? (
                          <img
                            src={filePreview.preview}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Info del archivo */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {filePreview.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {EvidenceService.formatFileSize(filePreview.file.size)}
                        </p>
                        
                        {/* Descripción */}
                        <input
                          type="text"
                          placeholder="Descripción opcional..."
                          value={filePreview.description || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDescriptionChange(index, e.target.value)}
                          className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled={filePreview.status === 'uploading'}
                        />
                      </div>

                      {/* Estado */}
                      <div className="flex-shrink-0">
                        {filePreview.status === 'pending' && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        
                        {filePreview.status === 'uploading' && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-blue-600">Subiendo...</span>
                          </div>
                        )}
                        
                        {filePreview.status === 'success' && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-green-600">Subido</span>
                          </div>
                        )}
                        
                        {filePreview.status === 'error' && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-red-600">{filePreview.error}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botones de acción */}
              {files.some((f: FilePreview) => f.status === 'pending') && (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setFiles([]);
                      setShowUpload(false);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploading ? 'Subiendo...' : 'Subir Archivos'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
