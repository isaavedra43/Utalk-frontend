import React, { useState, useEffect } from 'react';
import { X, Download, Eye, Calendar, User, FileText, Image, Video, Music, File, Search } from 'lucide-react';

interface ConversationFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  url: string;
  size: number;
  sentBy: string;
  sentAt: string;
  thumbnail?: string;
}

interface ConversationFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  clientName: string;
}

// Datos mock para desarrollo
const mockFiles: ConversationFile[] = [
  {
    id: '1',
    name: 'documento.pdf',
    type: 'document',
    url: '#',
    size: 1024000,
    sentBy: 'Cliente',
    sentAt: '2025-01-20T10:30:00Z',
  },
  {
    id: '2',
    name: 'imagen.jpg',
    type: 'image',
    url: '#',
    size: 512000,
    sentBy: 'Agente',
    sentAt: '2025-01-20T09:15:00Z',
    thumbnail: 'https://via.placeholder.com/100x100'
  },
  {
    id: '3',
    name: 'audio.mp3',
    type: 'audio',
    url: '#',
    size: 2048000,
    sentBy: 'Cliente',
    sentAt: '2025-01-19T16:45:00Z',
  },
  {
    id: '4',
    name: 'video.mp4',
    type: 'video',
    url: '#',
    size: 5242880,
    sentBy: 'Agente',
    sentAt: '2025-01-19T14:20:00Z',
    thumbnail: 'https://via.placeholder.com/100x100'
  },
  {
    id: '5',
    name: 'presentacion.pptx',
    type: 'document',
    url: '#',
    size: 3072000,
    sentBy: 'Cliente',
    sentAt: '2025-01-18T11:30:00Z',
  },
  {
    id: '6',
    name: 'foto_perfil.png',
    type: 'image',
    url: '#',
    size: 256000,
    sentBy: 'Agente',
    sentAt: '2025-01-18T10:15:00Z',
    thumbnail: 'https://via.placeholder.com/100x100'
  }
];

export const ConversationFilesModal: React.FC<ConversationFilesModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  clientName
}) => {
  const [files, setFiles] = useState<ConversationFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<ConversationFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Cargar archivos de la conversación
  useEffect(() => {
    if (isOpen && conversationId) {
      loadConversationFiles();
    }
  }, [isOpen, conversationId]);

  // Filtrar archivos basado en búsqueda y filtro
  useEffect(() => {
    let filtered = files;

    // Aplicar filtro de tipo
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(file => file.type === selectedFilter);
    }

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.sentBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFiles(filtered);
  }, [files, searchTerm, selectedFilter]);

  const loadConversationFiles = async () => {
    setIsLoading(true);
    try {
      // TODO: Implementar llamada real a la API
      // const response = await api.get(`/conversations/${conversationId}/files`);
      // setFiles(response.data);
      
      // Por ahora usar datos mock
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      setFiles(mockFiles);
    } catch (error) {
      console.error('Error cargando archivos:', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (file: ConversationFile) => {
    try {
      // TODO: Implementar descarga real
      console.log('Descargando archivo:', file.name);
      // const response = await api.get(`/files/${file.id}/download`);
      // const blob = new Blob([response.data]);
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = file.name;
      // a.click();
      // window.URL.revokeObjectURL(url);
      
      alert(`Descargando: ${file.name}`);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      alert('Error al descargar el archivo');
    }
  };

  const handlePreview = (file: ConversationFile) => {
    // TODO: Implementar preview real
    console.log('Previsualizando archivo:', file.name);
    alert(`Previsualizando: ${file.name}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Archivos de la conversación</h2>
            <p className="text-sm text-gray-500">Conversación con {clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'image' | 'video' | 'audio' | 'document')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los archivos</option>
              <option value="image">Imágenes</option>
              <option value="video">Videos</option>
              <option value="audio">Audios</option>
              <option value="document">Documentos</option>
            </select>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay archivos</p>
              <p className="text-sm">No se encontraron archivos en esta conversación</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail o icono */}
                  <div className="flex items-center justify-center h-24 mb-3 bg-gray-50 rounded-lg">
                    {file.thumbnail ? (
                      <img
                        src={file.thumbnail}
                        alt={file.name}
                        className="max-w-full max-h-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-gray-400">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* Información del archivo */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.type}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{file.sentBy}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(file.sentAt)}</span>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handlePreview(file)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Ver
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Descargar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{filteredFiles.length} archivo{filteredFiles.length !== 1 ? 's' : ''} encontrado{filteredFiles.length !== 1 ? 's' : ''}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 