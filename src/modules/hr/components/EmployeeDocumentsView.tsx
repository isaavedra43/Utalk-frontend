import React, { useState, useEffect } from 'react';
import UploadFilesModal from './UploadFilesModal';
import { employeesApi } from '../../../services/employeesApi';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Share2,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  Folder,
  File,
  ChevronDown,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Star,
  Heart,
  Bookmark,
  Copy,
  Move,
  ExternalLink
} from 'lucide-react';

interface DocumentFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'other';
  category: 'contract' | 'id' | 'medical' | 'academic' | 'performance' | 'disciplinary' | 'personal' | 'other';
  size: number;
  uploadDate: string;
  uploadedBy: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  isStarred: boolean;
  downloadCount: number;
  lastAccessed?: string;
  thumbnail?: string;
  url: string;
  mimeType: string;
}

interface EmployeeDocumentsData {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  totalFiles: number;
  totalSize: number;
  files: DocumentFile[];
  categories: {
    contract: number;
    id: number;
    medical: number;
    academic: number;
    performance: number;
    disciplinary: number;
    personal: number;
    other: number;
  };
  recentUploads: DocumentFile[];
  mostDownloaded: DocumentFile[];
}

interface EmployeeDocumentsViewProps {
  employeeId: string;
  onBack: () => void;
}

const EmployeeDocumentsView: React.FC<EmployeeDocumentsViewProps> = ({ 
  employeeId, 
  onBack 
}) => {
  const [documentsData, setDocumentsData] = useState<EmployeeDocumentsData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleFileUpload = (uploadedFiles: any[]) => {
    // Simular la adición de archivos subidos
    console.log('Archivos subidos:', uploadedFiles);
    // Aquí se actualizaría la lista de documentos con los nuevos archivos
    setShowUploadModal(false);
  };

  // Cargar datos reales de documentos
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const response = await employeesApi.getEmployeeDocuments(employeeId, {
          page: 1,
          limit: 100
        });
        
        // Transformar datos del backend al formato esperado por el componente
        const transformedData: EmployeeDocumentsData = {
          employeeId: employeeId,
          employeeName: 'Empleado', // Se puede obtener del contexto o props
          position: 'Puesto',
          department: 'Departamento',
          totalFiles: response.summary.totalFiles,
          totalSize: response.summary.totalSize,
          categories: response.summary.categories,
          files: response.documents.map(doc => ({
            id: doc.id,
            name: doc.fileName,
            type: getFileTypeFromMime(doc.mimeType),
            category: doc.category,
            size: doc.fileSize / (1024 * 1024), // Convertir bytes a MB
            uploadDate: doc.uploadedAt,
            uploadedBy: doc.uploadedBy,
            description: doc.description || '',
            tags: doc.tags || [],
            isPublic: !doc.isConfidential,
            isStarred: false, // No disponible en el backend actual
            downloadCount: 0, // No disponible en el backend actual
            lastAccessed: doc.uploadedAt, // Usar fecha de subida como fallback
            url: doc.fileUrl,
            mimeType: doc.mimeType
          })),
          recentUploads: [],
          mostDownloaded: []
        };

        // Calcular archivos recientes y más descargados
        transformedData.recentUploads = transformedData.files
          .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
          .slice(0, 5);
        
        transformedData.mostDownloaded = transformedData.files
          .sort((a, b) => b.downloadCount - a.downloadCount)
          .slice(0, 5);

        setDocumentsData(transformedData);
      } catch (error) {
        console.error('Error al cargar documentos:', error);
        setDocumentsData(null);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [employeeId]);

  // Función helper para determinar el tipo de archivo desde MIME type
  const getFileTypeFromMime = (mimeType: string): DocumentFile['type'] => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('audio')) return 'audio';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'archive';
    if (mimeType.includes('text') || mimeType.includes('document')) return 'document';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contract': return <FileText className="h-4 w-4" />;
      case 'id': return <User className="h-4 w-4" />;
      case 'medical': return <Heart className="h-4 w-4" />;
      case 'academic': return <Bookmark className="h-4 w-4" />;
      case 'performance': return <Star className="h-4 w-4" />;
      case 'disciplinary': return <AlertTriangle className="h-4 w-4" />;
      case 'personal': return <User className="h-4 w-4" />;
      default: return <Folder className="h-4 w-4" />;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'contract': return 'Contratos';
      case 'id': return 'Identificación';
      case 'medical': return 'Médicos';
      case 'academic': return 'Académicos';
      case 'performance': return 'Desempeño';
      case 'disciplinary': return 'Disciplinarios';
      case 'personal': return 'Personales';
      default: return 'Otros';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'image': return 'Imagen';
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'document': return 'Documento';
      case 'spreadsheet': return 'Hoja de Cálculo';
      case 'presentation': return 'Presentación';
      case 'archive': return 'Archivo';
      default: return 'Otro';
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredFiles = documentsData?.files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  }) || [];

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      case 'uploadDate':
        aValue = new Date(a.uploadDate).getTime();
        bValue = new Date(b.uploadDate).getTime();
        break;
      case 'downloadCount':
        aValue = a.downloadCount;
        bValue = b.downloadCount;
        break;
      default:
        aValue = new Date(a.uploadDate).getTime();
        bValue = new Date(b.uploadDate).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if (!documentsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron documentos</h3>
          <p className="text-gray-600">No hay documentos disponibles para este empleado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown className="h-5 w-5 text-gray-600 rotate-90" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
                <p className="text-gray-600">{documentsData.employeeName} - {documentsData.position}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Compartir</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Archivos</p>
                <p className="text-2xl font-bold text-blue-600">{documentsData.totalFiles}</p>
                <p className="text-xs text-gray-500">documentos</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tamaño Total</p>
                <p className="text-2xl font-bold text-green-600">{documentsData.totalSize.toFixed(1)} MB</p>
                <p className="text-xs text-gray-500">almacenamiento</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Archive className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(documentsData.categories).length}</p>
                <p className="text-xs text-gray-500">tipos</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Folder className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Subida</p>
                <p className="text-2xl font-bold text-orange-600">{formatDate(documentsData.recentUploads[0]?.uploadDate || '')}</p>
                <p className="text-xs text-gray-500">fecha</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Upload className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías de Documentos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(documentsData.categories).map(([category, count]) => (
                <div key={category} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getCategoryIcon(category)}
                  <div>
                    <p className="font-medium text-gray-900">{getCategoryText(category)}</p>
                    <p className="text-sm text-gray-600">{count} archivo{count > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros y controles */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Archivos</h3>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Subir Archivo</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar archivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
              
              <div className="relative">
                <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="pdf">PDF</option>
                  <option value="image">Imágenes</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audios</option>
                  <option value="document">Documentos</option>
                  <option value="spreadsheet">Hojas de Cálculo</option>
                  <option value="presentation">Presentaciones</option>
                  <option value="archive">Archivos</option>
                </select>
              </div>

              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="contract">Contratos</option>
                  <option value="id">Identificación</option>
                  <option value="medical">Médicos</option>
                  <option value="academic">Académicos</option>
                  <option value="performance">Desempeño</option>
                  <option value="disciplinary">Disciplinarios</option>
                  <option value="personal">Personales</option>
                  <option value="other">Otros</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de archivos */}
          <div className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedFiles.map((file) => (
                  <div key={file.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                          <p className="text-sm text-gray-600">{getTypeText(file.type)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {file.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tamaño:</span>
                        <span className="font-medium">{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Subido:</span>
                        <span className="font-medium">{formatDate(file.uploadDate)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Descargas:</span>
                        <span className="font-medium">{file.downloadCount}</span>
                      </div>
                    </div>

                    {file.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{file.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        file.category === 'contract' ? 'bg-blue-100 text-blue-800' :
                        file.category === 'id' ? 'bg-green-100 text-green-800' :
                        file.category === 'medical' ? 'bg-red-100 text-red-800' :
                        file.category === 'academic' ? 'bg-purple-100 text-purple-800' :
                        file.category === 'performance' ? 'bg-yellow-100 text-yellow-800' :
                        file.category === 'disciplinary' ? 'bg-orange-100 text-orange-800' :
                        file.category === 'personal' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getCategoryText(file.category)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subido</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descargas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(file.type)}
                            <div>
                              <div className="font-medium text-gray-900">{file.name}</div>
                              <div className="text-sm text-gray-500">{getTypeText(file.type)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            file.category === 'contract' ? 'bg-blue-100 text-blue-800' :
                            file.category === 'id' ? 'bg-green-100 text-green-800' :
                            file.category === 'medical' ? 'bg-red-100 text-red-800' :
                            file.category === 'academic' ? 'bg-purple-100 text-purple-800' :
                            file.category === 'performance' ? 'bg-yellow-100 text-yellow-800' :
                            file.category === 'disciplinary' ? 'bg-orange-100 text-orange-800' :
                            file.category === 'personal' ? 'bg-pink-100 text-pink-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getCategoryText(file.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(file.uploadDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {file.downloadCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de subida de archivos */}
      <UploadFilesModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
        employeeId={documentsData?.employeeId || ''}
        employeeName={documentsData?.employeeName || ''}
      />
    </div>
  );
};

export { EmployeeDocumentsView };
export default EmployeeDocumentsView;
