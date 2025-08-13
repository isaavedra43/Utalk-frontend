import React, { useState, useRef, useCallback } from 'react';
import { 
  Paperclip, 
  Image, 
  FileText, 
  Music, 
  Video, 
  X, 
  Upload, 
  CheckCircle,
  AlertCircle,
  File,
  Trash2
} from 'lucide-react';
import { fileUploadService } from '../../services/fileUpload';
import { APP_CONFIG } from '../../config/constants';

interface FileUploadManagerProps {
  conversationId: string;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'document' | 'location' | 'audio' | 'voice' | 'video' | 'sticker') => void;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
}

interface FilePreview {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  type: 'image' | 'document' | 'audio' | 'video';
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  conversationId,
  onSendMessage,
  isUploading,
  setIsUploading
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Generar ID único para archivos
  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  // Crear previsualización de archivo
  const createFilePreview = async (file: File): Promise<FilePreview> => {
    const id = generateFileId();
    const type = fileUploadService.getMessageType(file);
    
    let preview: string | undefined;
    
    // Crear preview para imágenes
    if (type === 'image') {
      preview = URL.createObjectURL(file);
    }
    
    return {
      id,
      file,
      preview,
      progress: 0,
      status: 'pending',
      type
    };
  };

  // Manejar selección de archivos
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPreviews: FilePreview[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validar archivo
      try {
        fileUploadService.validateFile(file);
        const preview = await createFilePreview(file);
        newPreviews.push(preview);
      } catch (error) {
        console.error(`Error validando archivo ${file.name}:`, error);
        // Mostrar error pero continuar con otros archivos
      }
    }

    setFilePreviews(prev => [...prev, ...newPreviews]);
    setShowMenu(false);
  };

  // Subir archivo individual
  const uploadFile = async (filePreview: FilePreview) => {
    try {
      // Actualizar estado a uploading
      setFilePreviews(prev => 
        prev.map(fp => 
          fp.id === filePreview.id 
            ? { ...fp, status: 'uploading', progress: 0 }
            : fp
        )
      );

      setIsUploading(true);

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setFilePreviews(prev => 
          prev.map(fp => 
            fp.id === filePreview.id && fp.progress < 90
              ? { ...fp, progress: fp.progress + 10 }
              : fp
          )
        );
      }, 200);

      // Subir archivo según su tipo
      let uploadResponse;
      switch (filePreview.type) {
        case 'image':
          uploadResponse = await fileUploadService.uploadImage(filePreview.file, conversationId);
          break;
        case 'audio':
          uploadResponse = await fileUploadService.uploadAudio(filePreview.file, conversationId);
          break;
        case 'video':
          uploadResponse = await fileUploadService.uploadVideo(filePreview.file, conversationId);
          break;
        default:
          uploadResponse = await fileUploadService.uploadDocument(filePreview.file, conversationId);
          break;
      }

      clearInterval(progressInterval);

      // Marcar como completado
      setFilePreviews(prev => 
        prev.map(fp => 
          fp.id === filePreview.id 
            ? { ...fp, status: 'success', progress: 100 }
            : fp
        )
      );

      // Enviar mensaje
      await onSendMessage(uploadResponse.url, filePreview.type);

      // Remover de la lista después de un delay
      setTimeout(() => {
        setFilePreviews(prev => prev.filter(fp => fp.id !== filePreview.id));
      }, 2000);

    } catch (error) {
      console.error('Error subiendo archivo:', error);
      setFilePreviews(prev => 
        prev.map(fp => 
          fp.id === filePreview.id 
            ? { ...fp, status: 'error', error: 'Error al subir archivo' }
            : fp
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Subir todos los archivos pendientes
  const uploadAllFiles = async () => {
    const pendingFiles = filePreviews.filter(fp => fp.status === 'pending');
    
    for (const filePreview of pendingFiles) {
      await uploadFile(filePreview);
    }
  };

  // Remover archivo de la lista
  const removeFile = (fileId: string) => {
    setFilePreviews(prev => {
      const filePreview = prev.find(fp => fp.id === fileId);
      if (filePreview?.preview) {
        URL.revokeObjectURL(filePreview.preview);
      }
      return prev.filter(fp => fp.id !== fileId);
    });
  };

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  // Limpiar previews al desmontar
  React.useEffect(() => {
    return () => {
      filePreviews.forEach(fp => {
        if (fp.preview) {
          URL.revokeObjectURL(fp.preview);
        }
      });
    };
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative">
      {/* Botón principal */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isUploading}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        title="Adjuntar archivo"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Menú desplegable */}
      {showMenu && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px] z-50">
          <div className="text-sm font-medium text-gray-700 mb-2">Adjuntar archivo</div>
          
          {/* Opciones de archivo */}
          <div className="space-y-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <File className="w-4 h-4" />
              <span>Seleccionar archivos</span>
            </button>
            
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => handleFileSelect(e.target?.files);
                input.click();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Image className="w-4 h-4" />
              <span>Imágenes</span>
            </button>
            
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'audio/*';
                input.multiple = true;
                input.onchange = (e) => handleFileSelect(e.target?.files);
                input.click();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Music className="w-4 h-4" />
              <span>Audio</span>
            </button>
            
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/*';
                input.multiple = true;
                input.onchange = (e) => handleFileSelect(e.target?.files);
                input.click();
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Video className="w-4 h-4" />
              <span>Video</span>
            </button>
            
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx";
                input.multiple = true;
                input.onchange = (e) => handleFileSelect(e.target?.files);
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
                    <AlertCircle className="w-4 h-4 text-red-500" title={filePreview.error} />
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