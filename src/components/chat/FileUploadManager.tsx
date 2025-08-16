import React, { useState, useRef, useCallback } from 'react';
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
}

interface FileUploadManagerProps {
  onFileUpload: (content: string, type?: string, metadata?: Record<string, unknown>) => void;
  conversationId?: string;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({ onFileUpload, conversationId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newFiles: FilePreview[] = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}`,
      file,
      type: getFileType(file),
      status: 'pending',
      progress: 0
    }));

    setFilePreviews(prev => [...prev, ...newFiles]);
    
    // AUTO-SUBIR ARCHIVOS INMEDIATAMENTE
    setTimeout(() => {
      newFiles.forEach(filePreview => {
        uploadFile(filePreview);
      });
    }, 100);
  }, []);

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

  const uploadFile = async (filePreview: FilePreview) => {
    try {
      console.log('🚀 Iniciando subida de archivo:', filePreview.file.name, 'ConversationId:', conversationId);
      
      setFilePreviews(prev => 
        prev.map(fp => 
          fp.id === filePreview.id 
            ? { ...fp, status: 'uploading', progress: 0 }
            : fp
        )
      );

      // Subir archivo real usando el servicio
      if (!conversationId) {
        throw new Error('ConversationId es requerido para subir archivos');
      }
      
      console.log('📤 Enviando request a fileUploadService...');
      const response = await fileUploadService.uploadFile(filePreview.file, conversationId);
      console.log('✅ Archivo subido exitosamente:', response);
      
      // Actualizar con éxito
      setFilePreviews(prev => 
        prev.map(fp => 
          fp.id === filePreview.id 
            ? { ...fp, status: 'success', progress: 100 }
            : fp
        )
      );

      // Enviar archivo con URL real del backend
      onFileUpload(response.url, filePreview.type, {
        fileName: filePreview.file.name,
        fileSize: filePreview.file.size,
        fileType: filePreview.file.type,
        fileId: response.id,
        duration: response.duration,
        thumbnail: response.thumbnail
      });

    } catch (error) {
      console.error('❌ Error uploading file:', error);
      console.error('📋 Detalles del error:', {
        fileName: filePreview.file.name,
        fileSize: filePreview.file.size,
        fileType: filePreview.file.type,
        conversationId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      setFilePreviews(prev => 
        prev.map(fp => 
          fp.id === filePreview.id 
            ? { ...fp, status: 'error', error: 'Error al subir archivo' }
            : fp
        )
      );
    }
  };

  const uploadAllFiles = async () => {
    setIsUploading(true);
    const pendingFiles = filePreviews.filter(fp => fp.status === 'pending');
    
    for (const filePreview of pendingFiles) {
      await uploadFile(filePreview);
    }
    
    setIsUploading(false);
  };

  const removeFile = (id: string) => {
    setFilePreviews(prev => prev.filter(fp => fp.id !== id));
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
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Adjuntar archivo"
      >
        <Paperclip className="w-5 h-5" />
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
          
          <div className="space-y-1">
            {/* Imágenes */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => handleFileSelect((e.target as HTMLInputElement)?.files);
                input.click();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Image className="w-4 h-4" />
              <span>Imágenes</span>
            </button>

            {/* Audios */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'audio/*';
                input.multiple = true;
                input.onchange = (e) => handleFileSelect((e.target as HTMLInputElement)?.files);
                input.click();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Music className="w-4 h-4" />
              <span>Audios</span>
            </button>

            {/* Videos */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.multiple = true;
                input.onchange = (e) => handleFileSelect((e.target as HTMLInputElement)?.files);
                input.click();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Videos</span>
            </button>

            {/* Documentos */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
                input.multiple = true;
                input.onchange = (e) => handleFileSelect((e.target as HTMLInputElement)?.files);
                input.click();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Documentos</span>
            </button>
          </div>
        </div>
      )}

      {/* Zona de Drag & Drop */}
      {isDragOver && (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">Suelta los archivos aquí</p>
            <p className="text-sm text-gray-500">Los archivos se subirán automáticamente</p>
          </div>
        </div>
      )}

      {/* Previsualizaciones de archivos */}
      {filePreviews.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[300px] max-w-[400px] z-40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Archivos seleccionados ({filePreviews.length})
            </h4>
            <button
              onClick={uploadAllFiles}
              disabled={isUploading || filePreviews.every(fp => fp.status !== 'pending')}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Subir todos
            </button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filePreviews.map((filePreview) => (
              <div key={filePreview.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                {/* Preview/Icono */}
                <div className="flex-shrink-0">
                  {filePreview.preview ? (
                    <img 
                      src={filePreview.preview} 
                      alt={filePreview.file.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      {getFileIcon(filePreview.type)}
                    </div>
                  )}
                </div>
                
                {/* Información del archivo */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {filePreview.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(filePreview.file.size)}
                  </p>
                </div>
                
                {/* Estado y progreso */}
                <div className="flex-shrink-0 flex items-center space-x-1">
                  {filePreview.status === 'pending' && (
                    <button
                      onClick={() => uploadFile(filePreview)}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Subir
                    </button>
                  )}
                  
                  {filePreview.status === 'uploading' && (
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-500">{filePreview.progress}%</span>
                    </div>
                  )}
                  
                  {filePreview.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  
                  {filePreview.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  
                  <button
                    onClick={() => removeFile(filePreview.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
}; 