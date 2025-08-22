import React, { useState, useEffect } from 'react';
import { X, Download, File, Image, FileText, Video, Music, Loader } from 'lucide-react';
import { conversationFilesService, type ConversationFile } from '../../services/conversationFiles';

interface ConversationFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string | null;
  messages?: any[]; // Mantenemos para compatibilidad pero ya no lo usamos
}

export const ConversationFilesModal: React.FC<ConversationFilesModalProps> = ({
  isOpen,
  onClose,
  conversationId,
}) => {
  const [files, setFiles] = useState<ConversationFile[]>([]);
  const [allFiles, setAllFiles] = useState<ConversationFile[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'document' | 'video' | 'audio'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar archivos desde el backend
  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const loadFiles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Cargar todos los archivos de la conversación
        const response = await conversationFilesService.getConversationFiles(conversationId, {
          limit: 100, // Cargar hasta 100 archivos
          isActive: true
        });
        
        setAllFiles(response.files);
        setFiles(response.files);
      } catch (err: any) {
        console.error('Error cargando archivos:', err);
        setError(err.message || 'Error al cargar los archivos');
        setAllFiles([]);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [isOpen, conversationId]);

  // Filtrar archivos cuando cambia el filtro
  useEffect(() => {
    if (filter === 'all') {
      setFiles(allFiles);
    } else {
      const filtered = allFiles.filter(file => file.category === filter);
      setFiles(filtered);
    }
  }, [filter, allFiles]);

  // Obtener icono según la categoría del archivo
  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-green-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  // Descargar archivo
  const handleDownload = async (file: ConversationFile) => {
    try {
      await conversationFilesService.downloadFile(file.id, file.originalName);
    } catch (err: any) {
      console.error('Error descargando archivo:', err);
      // Podrías mostrar un toast de error aquí
    }
  };

  // Contar archivos por categoría
  const getCategoryCount = (category: 'all' | 'image' | 'document' | 'video' | 'audio') => {
    if (category === 'all') return allFiles.length;
    return allFiles.filter(file => file.category === category).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Archivos de la conversación</h2>
            <p className="text-sm text-gray-500">
              {files.length} archivo{files.length !== 1 ? 's' : ''} encontrado{files.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros (Tabs estilo WhatsApp) */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({getCategoryCount('all')})
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'image'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Imágenes ({getCategoryCount('image')})
            </button>
            <button
              onClick={() => setFilter('document')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'document'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Documentos ({getCategoryCount('document')})
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'video'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Videos ({getCategoryCount('video')})
            </button>
            <button
              onClick={() => setFilter('audio')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'audio'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Audio ({getCategoryCount('audio')})
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-gray-600">Cargando archivos...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 text-red-500">
              <X className="w-12 h-12 mb-2" />
              <p className="text-lg font-medium">Error al cargar archivos</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <File className="w-12 h-12 mb-2" />
              <p className="text-lg font-medium">No hay archivos</p>
              <p className="text-sm">
                {filter === 'all' 
                  ? 'No se han compartido archivos en esta conversación'
                  : `No hay archivos de tipo ${filter === 'image' ? 'imagen' : filter === 'document' ? 'documento' : filter === 'video' ? 'video' : 'audio'}`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Icono del archivo */}
                  <div className="flex-shrink-0">
                    {getFileIcon(file.category)}
                  </div>
                  
                  {/* Información del archivo */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate" title={file.originalName}>
                      {file.originalName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{conversationFilesService.formatDate(file.uploadedAt)}</span>
                      <span>•</span>
                      <span title={file.uploadedBy}>
                        {file.uploadedBy.includes('@') 
                          ? file.uploadedBy.split('@')[0] 
                          : file.uploadedBy
                        }
                      </span>
                      {file.downloadCount > 0 && (
                        <>
                          <span>•</span>
                          <span>{file.downloadCount} descarga{file.downloadCount !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                    {/* Tags si existen */}
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {file.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {file.tags.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            +{file.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Botón de descarga */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Descargar archivo"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};