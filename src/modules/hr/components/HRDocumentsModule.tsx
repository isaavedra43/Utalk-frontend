import React, { useState } from 'react';
import {
  FileText,
  Image,
  Video,
  Music,
  File,
  Folder,
  Upload,
  Download,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Pin,
  Eye,
  Edit,
  Trash2,
  Share2,
  Copy,
  Move,
  Plus,
  MoreHorizontal,
  Clock,
  TrendingUp,
  Users,
  Bookmark,
  AlertCircle,
  CheckCircle,
  FolderPlus,
  X,
  ChevronDown,
  FileSpreadsheet,
  Presentation,
  Archive,
  HardDrive,
  Activity
} from 'lucide-react';
import { useHRDocuments } from '../../../hooks/useHRDocuments';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { HRDocument, HRDocumentMetadata } from '../../../services/hrDocumentsService';

// ============================================================================
// TYPES
// ============================================================================

interface HRDocumentsModuleProps {
  onBack?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const HRDocumentsModule: React.FC<HRDocumentsModuleProps> = ({ onBack }) => {
  const { showSuccess, showError } = useNotifications();

  const {
    documents,
    summary,
    folders,
    loading,
    error,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    toggleFavorite,
    togglePin,
    shareDocument,
    duplicateDocument,
    moveDocument,
    createFolder,
    exportDocuments,
    refreshData
  } = useHRDocuments();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<HRDocument | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Handlers
  const handleUpload = async (file: File, metadata: HRDocumentMetadata) => {
    try {
      await uploadDocument(file, metadata);
      showSuccess('Documento subido exitosamente');
      setShowUploadModal(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error subiendo documento');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    try {
      await deleteDocument(documentId);
      showSuccess('Documento eliminado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error eliminando documento');
    }
  };

  const handleDownload = async (doc: HRDocument) => {
    try {
      await downloadDocument(doc.id, doc.name);
      showSuccess('Documento descargado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error descargando documento');
    }
  };

  const handleToggleFavorite = async (documentId: string) => {
    try {
      await toggleFavorite(documentId);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  };

  const handleTogglePin = async (documentId: string) => {
    try {
      await togglePin(documentId);
      showSuccess('Documento actualizado');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportDocuments('excel');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentos_rh_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Documentos exportados');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error exportando');
    }
  };

  // Filtros
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesFolder = selectedFolder === 'all' || doc.folder === selectedFolder;
    return matchesSearch && matchesCategory && matchesFolder;
  });

  const pinnedDocs = filteredDocuments.filter(doc => doc.isPinned);
  const regularDocs = filteredDocuments.filter(doc => !doc.isPinned);

  // Helpers
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="h-8 w-8" />;
      case 'image':
        return <Image className="h-8 w-8" />;
      case 'video':
        return <Video className="h-8 w-8" />;
      case 'audio':
        return <Music className="h-8 w-8" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-8 w-8" />;
      case 'presentation':
        return <Presentation className="h-8 w-8" />;
      case 'archive':
        return <Archive className="h-8 w-8" />;
      default:
        return <File className="h-8 w-8" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'plantilla': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'politica': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'procedimiento': return 'bg-green-100 text-green-800 border-green-200';
      case 'manual': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'formato': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'capacitacion': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'legal': return 'bg-red-100 text-red-800 border-red-200';
      case 'multimedia': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'plantilla': return 'Plantilla';
      case 'politica': return 'Política';
      case 'procedimiento': return 'Procedimiento';
      case 'manual': return 'Manual';
      case 'formato': return 'Formato';
      case 'capacitacion': return 'Capacitación';
      case 'legal': return 'Legal';
      case 'multimedia': return 'Multimedia';
      default: return 'Otro';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && documents.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando biblioteca de documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplificado */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Documentos RH
                </h1>
                <p className="text-sm text-gray-500">
                  Biblioteca de plantillas, políticas y recursos
                </p>
              </div>
            </div>
            
            {/* Stats simplificados */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{summary?.totalDocuments || 0}</p>
                <p className="text-xs text-gray-500">Documentos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(summary?.totalSize || 0)}</p>
                <p className="text-xs text-gray-500">Espacio</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
                <p className="text-xs text-gray-500">Carpetas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar simplificado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filters y acciones */}
            <div className="flex items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">Todas las categorías</option>
                <option value="plantilla">Plantillas</option>
                <option value="politica">Políticas</option>
                <option value="procedimiento">Procedimientos</option>
                <option value="manual">Manuales</option>
                <option value="formato">Formatos</option>
                <option value="capacitacion">Capacitación</option>
                <option value="legal">Legal</option>
                <option value="multimedia">Multimedia</option>
              </select>

              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">Todas las carpetas</option>
                {folders.map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>

              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Subir</span>
              </button>

              <button
                onClick={handleExport}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Exportar"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Pinned Documents */}
        {pinnedDocs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Pin className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-medium text-gray-900">Documentos Fijados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onTogglePin={handleTogglePin}
                  getFileIcon={getFileIcon}
                  getCategoryColor={getCategoryColor}
                  getCategoryText={getCategoryText}
                  formatFileSize={formatFileSize}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Documents */}
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-3">
            Todos los Documentos ({regularDocs.length})
          </h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {regularDocs.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onTogglePin={handleTogglePin}
                  getFileIcon={getFileIcon}
                  getCategoryColor={getCategoryColor}
                  getCategoryText={getCategoryText}
                  formatFileSize={formatFileSize}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subido</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {regularDocs.map(doc => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-blue-600">
                              {getFileIcon(doc.type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(doc.category)}`}>
                            {getCategoryText(doc.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {formatFileSize(doc.fileSize)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {formatDate(doc.uploadedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-1.5 hover:bg-blue-100 rounded-md text-blue-600 transition-colors"
                              title="Descargar"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleFavorite(doc.id)}
                              className={`p-1.5 rounded-md transition-colors ${
                                doc.isFavorite ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100 text-gray-600'
                              }`}
                              title="Favorito"
                            >
                              <Star className={doc.isFavorite ? 'fill-current h-4 w-4' : 'h-4 w-4'} />
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-1.5 hover:bg-red-100 rounded-md text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {regularDocs.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-1">No se encontraron documentos</h3>
              <p className="text-sm text-gray-500">
                {documents.length === 0
                  ? 'Comienza subiendo tu primer documento'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DOCUMENT CARD COMPONENT
// ============================================================================

interface DocumentCardProps {
  document: HRDocument;
  onDownload: (doc: HRDocument) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onTogglePin: (id: string) => void;
  getFileIcon: (type: string) => JSX.Element;
  getCategoryColor: (category: string) => string;
  getCategoryText: (category: string) => string;
  formatFileSize: (bytes: number) => string;
  formatDate: (date: string) => string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document: doc,
  onDownload,
  onDelete,
  onToggleFavorite,
  onTogglePin,
  getFileIcon,
  getCategoryColor,
  getCategoryText,
  formatFileSize,
  formatDate
}) => {
  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="text-blue-600">
            {getFileIcon(doc.type)}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onTogglePin(doc.id)}
              className={`p-1.5 rounded-md transition-colors ${
                doc.isPinned ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Pin className="h-3 w-3" />
            </button>
            <button
              onClick={() => onToggleFavorite(doc.id)}
              className={`p-1.5 rounded-md transition-colors ${
                doc.isFavorite ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Star className={doc.isFavorite ? 'fill-current h-3 w-3' : 'h-3 w-3'} />
            </button>
          </div>
        </div>
        
        <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(doc.category)}`}>
          {getCategoryText(doc.category)}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm">
          {doc.name}
        </h3>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{doc.description}</p>

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {doc.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{formatFileSize(doc.fileSize)}</span>
          <span>{formatDate(doc.uploadedAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownload(doc)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-3 w-3" />
            <span className="text-xs font-medium">Descargar</span>
          </button>
          <button
            onClick={() => onDelete(doc.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{doc.viewCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="h-3 w-3" />
            <span>{doc.downloadCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { HRDocumentsModule };
export default HRDocumentsModule;

