import React, { useState, useRef, useCallback } from 'react';
import { infoLog } from '../../config/logger';
import { 
  Paperclip, 
  Upload, 
  FileText, 
  Image, 
  Music, 
  Video, 
  CheckCircle, 
  AlertCircle, 
  Trash2,
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
  onFileRemoved: (fileId: string) => void; // Nuevo: callback cuando se remueve un archivo
  conversationId?: string;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({ 
  onFilesAdded, 
  onFileRemoved, 
  conversationId 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const getFileType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4 text-blue-500" />;
      case 'audio': return <Music className="w-4 h-4 text-green-500" />;
      case 'video': return <Video className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Subir archivo al servidor (NO lo envía a WhatsApp)
  const uploadFile = useCallback(async (filePreview: FilePreview) => {
    try {
      infoLog('🚀 Iniciando subida de archivo:', filePreview.file.name, 'ConversationId:', conversationId);
      
      if (!conversationId) {
        throw new Error('ConversationId es requerido para subir archivos');
      }
      
      // Actualizar estado a uploading
      const updatedFile = { ...filePreview, status: 'uploading' as const, progress: 0 };
      onFilesAdded([updatedFile]);
      
      infoLog('📤 Enviando request a fileUploadService...');
      const response = await fileUploadService.uploadFile(filePreview.file, {
        conversationId,
        type: filePreview.type
      });
      
      infoLog('✅ Archivo subido exitosamente:', response);
      
      // Actualizar con éxito y guardar el ID del archivo
      const successFile = { 
        ...filePreview, 
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
    
    const newFiles: FilePreview[] = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      type: getFileType(file),
      status: 'pending',
      progress: 0
    }));

    // Notificar que se agregaron archivos
    onFilesAdded(newFiles);
    
    // Subir archivos automáticamente
    setTimeout(() => {
      newFiles.forEach(filePreview => {
        uploadFile(filePreview);
      });
    }, 100);
  }, [uploadFile, onFilesAdded]);

  const removeFile = (id: string) => {
    onFileRemoved(id);
  };

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