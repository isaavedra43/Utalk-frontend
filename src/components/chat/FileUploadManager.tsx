import React, { useState, useRef, useCallback } from 'react';
import { infoLog } from '../../config/logger';
import { 
  Paperclip, 
  Upload, 
  FileText, 
  Image, 
  Music, 
  Video, 
  X
} from 'lucide-react';
import { fileUploadService } from '../../services/fileUpload';

interface FilePreview {
  id: string;
  file: File;
  type: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  uploadedFileId?: string; // ID del archivo después de subirlo al servidor
}

interface FileUploadManagerProps {
  onFilesAdded: (files: FilePreview[]) => void; // Nuevo: callback cuando se agregan archivos
  conversationId?: string;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({ 
  onFilesAdded, 
  conversationId 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const getFileType = (file: File): string => {
    // Mapeo más específico para asegurar compatibilidad con el backend
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    
    // Para documentos, verificar extensiones específicas
    const fileName = file.name.toLowerCase();
    const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx'];
    const isDocument = documentExtensions.some(ext => fileName.endsWith(ext));
    
    return isDocument ? 'document' : 'document'; // Default a document
  };

  // Subir archivo al servidor (NO lo envía a WhatsApp)
  const uploadFile = useCallback(async (filePreview: FilePreview) => {
    try {
      infoLog('🚀 Iniciando subida de archivo:', filePreview.file.name, 'ConversationId:', conversationId);
      
      if (!conversationId) {
        throw new Error('ConversationId es requerido para subir archivos');
      }

      // Validar tipo mediante helper
      const detectedType = getFileType(filePreview.file);
      if (!['image', 'document', 'video', 'audio'].includes(detectedType)) {
        throw new Error(`Tipo de archivo no soportado: ${detectedType}`);
      }
      
      // Actualizar estado a uploading
      const updatedFile = { ...filePreview, type: detectedType, status: 'uploading' as const, progress: 0 };
      onFilesAdded([updatedFile]);
      
      infoLog('📤 Enviando request a fileUploadService...');
      const response = await fileUploadService.uploadFile(filePreview.file, {
        conversationId,
        type: detectedType
      });
      
      infoLog('✅ Archivo subido exitosamente:', response);
      
      // Validaciones críticas del ID
      if (!response.id) {
        throw new Error('No se recibió ID del archivo subido');
      }
      if (!response.type) {
        throw new Error('No se recibió tipo del archivo subido');
      }
      
      // Actualizar con éxito y guardar el ID del archivo
      const successFile = { 
        ...filePreview, 
        type: detectedType,
        status: 'success' as const, 
        progress: 100,
        uploadedFileId: response.id
      };
      onFilesAdded([successFile]);

    } catch (error) {
      infoLog('❌ Error uploading file:', error);
      infoLog('📋 Detalles del error:', {
        fileName: filePreview.file.name,
        fileSize: filePreview.file.size,
        fileType: filePreview.file.type,
        conversationId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Actualizar con error
      const errorFile = { 
        ...filePreview, 
        status: 'error' as const, 
        error: 'Error al subir archivo' 
      };
      onFilesAdded([errorFile]);
    }
  }, [conversationId, onFilesAdded]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newFiles: FilePreview[] = Array.from(files).map(file => {
      const fileType = getFileType(file);
      infoLog('📁 Archivo seleccionado:', {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        assignedType: fileType
      });
      
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        type: fileType,
        status: 'pending',
        progress: 0
      };
    });

    // Notificar que se agregaron archivos
    onFilesAdded(newFiles);
    
    // Subir archivos automáticamente
    setTimeout(() => {
      newFiles.forEach(filePreview => {
        uploadFile(filePreview);
      });
    }, 100);
  }, [uploadFile, onFilesAdded]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-all duration-200 transform hover:scale-105"
        title="Adjuntar archivo"
      >
        <Paperclip className="w-3.5 h-3.5" />
      </button>

      {/* Menú desplegable */}
      {showMenu && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px] z-40">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Adjuntar archivo</h4>
            <button
              onClick={() => setShowMenu(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Opciones de archivo */}
          <div className="space-y-1">
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setShowMenu(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Documento</span>
            </button>
            
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setShowMenu(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Image className="w-4 h-4" />
              <span>Imagen</span>
            </button>
            
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setShowMenu(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Video</span>
            </button>
            
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setShowMenu(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Music className="w-4 h-4" />
              <span>Audio</span>
            </button>
          </div>

          {/* Zona de drag & drop */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-2 p-3 border-2 border-dashed rounded-lg text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
            <p className="text-xs text-gray-600">
              Arrastra archivos aquí o
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              selecciona archivos
            </button>
          </div>
        </div>
      )}

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Overlay para cerrar menú */}
      {showMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}; 