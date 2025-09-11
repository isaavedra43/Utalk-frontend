import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  Music, 
  Archive, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  Edit, 
  Tag, 
  Calendar, 
  User, 
  Folder,
  Plus,
  Minus,
  Save,
  Loader2
} from 'lucide-react';

interface FileToUpload {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  category: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  preview?: string;
}

interface UploadFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileToUpload[]) => void;
  employeeId: string;
  employeeName: string;
}

const UploadFilesModal: React.FC<UploadFilesModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  employeeId,
  employeeName
}) => {
  const [files, setFiles] = useState<FileToUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = {
    'pdf': ['.pdf'],
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    'video': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
    'audio': ['.mp3', '.wav', '.aac', '.flac', '.ogg'],
    'document': ['.doc', '.docx', '.txt', '.rtf'],
    'spreadsheet': ['.xls', '.xlsx', '.csv'],
    'presentation': ['.ppt', '.pptx'],
    'archive': ['.zip', '.rar', '.7z', '.tar', '.gz']
  };

  const categories = [
    { value: 'contract', label: 'Contratos' },
    { value: 'id', label: 'Identificación' },
    { value: 'medical', label: 'Médicos' },
    { value: 'academic', label: 'Académicos' },
    { value: 'performance', label: 'Desempeño' },
    { value: 'disciplinary', label: 'Disciplinarios' },
    { value: 'personal', label: 'Personales' },
    { value: 'other', label: 'Otros' }
  ];

  const getFileType = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    
    for (const [type, extensions] of Object.entries(acceptedFileTypes)) {
      if (extensions.includes(`.${extension}`)) {
        return type;
      }
    }
    return 'other';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-6 w-6 text-red-500" />;
      case 'image': return <Image className="h-6 w-6 text-green-500" />;
      case 'video': return <Video className="h-6 w-6 text-purple-500" />;
      case 'audio': return <Music className="h-6 w-6 text-blue-500" />;
      case 'document': return <FileText className="h-6 w-6 text-gray-500" />;
      case 'spreadsheet': return <FileText className="h-6 w-6 text-green-600" />;
      case 'presentation': return <FileText className="h-6 w-6 text-orange-500" />;
      case 'archive': return <Archive className="h-6 w-6 text-yellow-500" />;
      default: return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const extension = file.name.toLowerCase().split('.').pop() || '';
    
    if (file.size > maxSize) {
      return 'El archivo es demasiado grande. Máximo 100MB.';
    }
    
    const allExtensions = Object.values(acceptedFileTypes).flat();
    if (!allExtensions.includes(`.${extension}`)) {
      return 'Tipo de archivo no soportado.';
    }
    
    return null;
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const newFiles: FileToUpload[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          type: getFileType(file.name),
          size: file.size,
          category: 'other',
          description: '',
          tags: [],
          isPublic: false,
          status: 'error',
          progress: 0,
          error: validationError
        });
        continue;
      }

      const preview = await createFilePreview(file);
      
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        category: 'other',
        description: '',
        tags: [],
        isPublic: false,
        status: 'pending',
        progress: 0,
        preview
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

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
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFile = (fileId: string, updates: Partial<FileToUpload>) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  const addTag = (fileId: string, tag: string) => {
    if (tag.trim()) {
      updateFile(fileId, {
        tags: [...files.find(f => f.id === fileId)?.tags || [], tag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (fileId: string, tagToRemove: string) => {
    updateFile(fileId, {
      tags: files.find(f => f.id === fileId)?.tags.filter(tag => tag !== tagToRemove) || []
    });
  };

  const handleUpload = async () => {
    const validFiles = files.filter(f => f.status === 'pending' || f.status === 'error');
    
    // Simular subida de archivos
    for (const file of validFiles) {
      updateFile(file.id, { status: 'uploading', progress: 0 });
      
      // Simular progreso
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateFile(file.id, { progress });
      }
      
      updateFile(file.id, { status: 'success', progress: 100 });
    }
    
    // Llamar callback después de un breve delay
    setTimeout(() => {
      onUpload(files);
      onClose();
      setFiles([]);
    }, 1000);
  };

  const resetForm = () => {
    setFiles([]);
    setNewTag('');
    setEditingFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Subir Archivos</h2>
            <p className="text-sm text-gray-600">Para {employeeName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Área de Drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Soporta PDF, imágenes, videos, audios, documentos y más
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Seleccionar Archivos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              accept={Object.values(acceptedFileTypes).flat().join(',')}
            />
          </div>

          {/* Lista de archivos */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Archivos seleccionados ({files.length})
              </h3>
              
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      {/* Icono y preview */}
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="h-12 w-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>

                      {/* Información del archivo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                            <p className="text-sm text-gray-600">
                              {formatFileSize(file.size)} • {file.type.toUpperCase()}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {file.status === 'uploading' && (
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                <span className="text-sm text-blue-600">{file.progress}%</span>
                              </div>
                            )}
                            {file.status === 'success' && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {file.status === 'error' && (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            )}
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {file.error && (
                          <p className="text-sm text-red-600 mt-1">{file.error}</p>
                        )}

                        {/* Barra de progreso */}
                        {file.status === 'uploading' && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Formulario de metadatos */}
                        {file.status === 'pending' && (
                          <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Categoría
                                </label>
                                <select
                                  value={file.category}
                                  onChange={(e) => updateFile(file.id, { category: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`public-${file.id}`}
                                  checked={file.isPublic}
                                  onChange={(e) => updateFile(file.id, { isPublic: e.target.checked })}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`public-${file.id}`} className="text-sm text-gray-700">
                                  Archivo público
                                </label>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción
                              </label>
                              <textarea
                                value={file.description}
                                onChange={(e) => updateFile(file.id, { description: e.target.value })}
                                placeholder="Descripción del archivo..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Etiquetas
                              </label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {file.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {tag}
                                    <button
                                      onClick={() => removeTag(file.id, tag)}
                                      className="ml-1 hover:text-blue-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  placeholder="Agregar etiqueta..."
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addTag(file.id, newTag);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => addTag(file.id, newTag)}
                                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {files.length > 0 && (
              <span>
                {files.filter(f => f.status === 'pending').length} archivo(s) listo(s) para subir
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={files.filter(f => f.status === 'pending').length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Subir Archivos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { UploadFilesModal };
export default UploadFilesModal;
