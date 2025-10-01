import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Eye,
  Lock,
  Calendar,
  User,
  Tag,
  Award,
  Check,
  Share2,
  X,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  Copy
} from 'lucide-react';
import { Document, DocumentMetadata } from '../../../types/employee';
import employeeService from '../../../services/employeeService';
import { useHRPermissions } from '../../../hooks/useHRPermissions';

interface DocumentModuleProps {
  employeeId: string;
  employeeName: string;
}

export const DocumentModule: React.FC<DocumentModuleProps> = ({ employeeId, employeeName }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Document['category']>('all');
  const [confidentialFilter, setConfidentialFilter] = useState<'all' | 'confidential' | 'public'>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);

  const { hasPermission, canAccessEmployee } = useHRPermissions();

  const loadDocuments = React.useCallback(async () => {
    if (!employeeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📄 Cargando documentos para empleado:', employeeId);
      const response = await employeeService.getDocuments(employeeId);
      
      if (response.success && response.data) {
        console.log('✅ Documentos cargados exitosamente:', response.data.documents?.length || 0);
        setDocuments(response.data.documents || []);
      } else {
        console.log('⚠️ Respuesta sin datos o sin éxito:', response);
        setDocuments([]);
      }
    } catch (err: any) {
      console.error('❌ Error al cargar documentos:', err);
      setError(err.message || 'Error al cargar documentos');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    console.log('🔍 DocumentModule useEffect:', {
      employeeId,
      canViewDocuments: hasPermission('canViewDocuments', employeeId),
      canAccessEmployee: canAccessEmployee(employeeId)
    });

    // Cargar documentos reales del backend
    loadDocuments();
  }, [employeeId, loadDocuments]);


  const uploadDocument = async (file: File, metadata: DocumentMetadata) => {
    try {
      console.log('🔄 Iniciando subida de documento:', { employeeId, fileName: file.name, metadata });
      setLoading(true);
      setError(null);

      const response = await employeeService.uploadDocument(employeeId, file, metadata);

      console.log('📊 Respuesta de subida:', response);

      if (response.success) {
        console.log('✅ Documento subido exitosamente, recargando lista...');
        // Recargar lista después de subida exitosa
        await loadDocuments();
        setShowUploadModal(false);
        console.log('✅ Lista recargada después de subida');
      } else {
        throw new Error(response.message || 'Error al subir documento');
      }
    } catch (err: any) {
      console.error('❌ Error subiendo documento:', err);
      setError(err.message || 'Error al subir documento');
    } finally {
      setLoading(false);
    }
  };

  const openPreview = (document: Document) => {
    setPreviewDocument(document);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewDocument(null);
  };

  // Funciones de selección múltiple
  const toggleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(documentId)) {
        newSet.delete(documentId);
      } else {
        newSet.add(documentId);
      }
      return newSet;
    });
  };

  const selectAllDocuments = () => {
    const allIds = new Set(filteredDocuments.map(doc => doc.id));
    setSelectedDocuments(allIds);
  };

  const clearSelection = () => {
    setSelectedDocuments(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0) {
      clearSelection();
    } else {
      selectAllDocuments();
    }
  };

  const downloadMultipleDocuments = async () => {
    if (selectedDocuments.size === 0) return;

    try {
      setLoading(true);
      const selectedDocs = documents.filter(doc => selectedDocuments.has(doc.id));
      
      for (const doc of selectedDocs) {
        await downloadDocument(doc.id, doc.originalName);
        // Pequeña pausa entre descargas para evitar problemas
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      clearSelection();
    } catch (err: any) {
      console.error('Error descargando documentos:', err);
      setError('Error al descargar algunos documentos');
    } finally {
      setLoading(false);
    }
  };

  const shareDocuments = () => {
    if (selectedDocuments.size === 0) return;
    setShowShareModal(true);
  };

  const downloadDocument = async (documentId: string, fileName: string) => {
    try {
      setError(null);
      const blob = await employeeService.downloadDocument(employeeId, documentId);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error descargando documento:', err);
      setError(err.message || 'Error al descargar documento');
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      console.log('🔄 Iniciando eliminación de documento:', { employeeId, documentId });
      setLoading(true);
      setError(null);

      const response = await employeeService.deleteDocument(employeeId, documentId);

      console.log('📊 Respuesta de eliminación:', response);

      if (response.success) {
        console.log('✅ Documento eliminado exitosamente, recargando lista...');
        // Recargar lista después de eliminación exitosa
        await loadDocuments();
        console.log('✅ Lista recargada después de eliminación');
      } else {
        throw new Error(response.message || 'Error al eliminar documento');
      }
    } catch (err: any) {
      console.error('❌ Error eliminando documento:', err);
      setError(err.message || 'Error al eliminar documento');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: Document['category']) => {
    switch (category) {
      case 'contract':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'identification':
        return <User className="w-5 h-5 text-green-600" />;
      case 'payroll':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'medical':
        return <User className="w-5 h-5 text-red-600" />;
      case 'training':
        return <Award className="w-5 h-5 text-orange-600" />;
      case 'performance':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'other':
        return <FileText className="w-5 h-5 text-gray-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryLabel = (category: Document['category']) => {
    switch (category) {
      case 'contract':
        return 'Contrato';
      case 'identification':
        return 'Identificación';
      case 'payroll':
        return 'Nómina';
      case 'medical':
        return 'Médico';
      case 'training':
        return 'Capacitación';
      case 'performance':
        return 'Rendimiento';
      case 'other':
        return 'Otro';
      default:
        return 'Desconocido';
    }
  };

  const getCategoryColor = (category: Document['category']) => {
    switch (category) {
      case 'contract':
        return 'bg-blue-100 text-blue-800';
      case 'identification':
        return 'bg-green-100 text-green-800';
      case 'payroll':
        return 'bg-purple-100 text-purple-800';
      case 'medical':
        return 'bg-red-100 text-red-800';
      case 'training':
        return 'bg-orange-100 text-orange-800';
      case 'performance':
        return 'bg-yellow-100 text-yellow-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calcular métricas reales de los documentos
  const totalDocuments = documents.length;
  const confidentialDocuments = documents.filter(doc => doc.isConfidential).length;
  const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
  const documentsByCategory = documents.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    const matchesConfidential = confidentialFilter === 'all' || 
      (confidentialFilter === 'confidential' && doc.isConfidential) ||
      (confidentialFilter === 'public' && !doc.isConfidential);
    
    return matchesSearch && matchesCategory && matchesConfidential;
  });

  // Comentado temporalmente para permitir acceso a usuarios admin
  // TODO: Implementar lógica de permisos HR adecuada
  // if (!hasPermission('canViewDocuments', employeeId) || !canAccessEmployee(employeeId)) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="text-center">
  //         <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
  //         <p className="text-gray-500">No tienes permisos para ver documentos de este empleado</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="document-module">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
            <p className="text-gray-600">{employeeName}</p>
          </div>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Subir Documento
          </button>
        </div>

        {/* Barra de selección múltiple */}
        {selectedDocuments.size > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedDocuments.size} documento{selectedDocuments.size !== 1 ? 's' : ''} seleccionado{selectedDocuments.size !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={clearSelection}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Limpiar selección
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={downloadMultipleDocuments}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Descargar {selectedDocuments.size > 1 ? 'todos' : ''}
              </button>
              
              <button
                onClick={shareDocuments}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {filteredDocuments.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="selectAll" className="text-sm text-gray-700 cursor-pointer whitespace-nowrap">
              Seleccionar todos
            </label>
          </div>
        )}
        
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            <option value="contract">Contrato</option>
            <option value="identification">Identificación</option>
            <option value="payroll">Nómina</option>
            <option value="medical">Médico</option>
            <option value="training">Capacitación</option>
            <option value="performance">Rendimiento</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <select
          value={confidentialFilter}
          onChange={(e) => setConfidentialFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los documentos</option>
          <option value="public">Públicos</option>
          <option value="confidential">Confidenciales</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documentos</p>
              <p className="text-2xl font-bold text-gray-900">{totalDocuments}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confidenciales</p>
              <p className="text-2xl font-bold text-gray-900">{confidentialDocuments}</p>
            </div>
            <Lock className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamaño Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalSize)}</p>
            </div>
            <Tag className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay documentos que mostrar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <div 
              key={document.id} 
              className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                selectedDocuments.has(document.id) ? 'ring-2 ring-blue-500 border-blue-500' : ''
              }`}
            >
              {/* Document Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(document.id)}
                      onChange={() => toggleSelectDocument(document.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {getCategoryIcon(document.category)}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {document.originalName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(document.fileSize)}
                      </p>
                    </div>
                  </div>
                  
                  {document.isConfidential && (
                    <Lock className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* Document Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                    {getCategoryLabel(document.category)}
                  </span>
                  <span className="text-xs text-gray-500">v{document.version}</span>
                </div>

                {document.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {document.description}
                  </p>
                )}

                {document.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {document.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {document.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{document.tags.length - 3} más
                      </span>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  <p>Subido: {formatDate(document.uploadedAt)}</p>
                  {document.metadata?.expiryDate && (
                    <p>Expira: {formatDate(document.metadata.expiryDate)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openPreview(document)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>

                  <button
                    onClick={() => downloadDocument(document.id, document.originalName)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </button>

                  <button
                    onClick={() => deleteDocument(document.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          onClose={() => setShowUploadModal(false)}
          onSubmit={uploadDocument}
          loading={loading}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          employeeId={employeeId}
          onClose={closePreview}
          onDownload={() => downloadDocument(previewDocument.id, previewDocument.originalName)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareDocumentsModal
          selectedCount={selectedDocuments.size}
          documents={documents.filter(doc => selectedDocuments.has(doc.id))}
          onClose={() => setShowShareModal(false)}
          onShare={(method) => {
            console.log('Compartir por:', method);
            setShowShareModal(false);
            clearSelection();
          }}
        />
      )}
    </div>
  );
};

// Modal para subir documentos
interface DocumentUploadModalProps {
  onClose: () => void;
  onSubmit: (file: File, metadata: DocumentMetadata) => void;
  loading: boolean;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ onClose, onSubmit, loading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    category: 'other',
    description: '',
    tags: '',
    isConfidential: false
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    // Validar tamaño del archivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede ser mayor a 10MB');
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Formatos válidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF');
      return;
    }
    
    // Preparar metadata para el backend
    const metadataToSend = {
      ...metadata,
      isConfidential: metadata.isConfidential === true || metadata.isConfidential === 'true'
    };

    setUploadProgress(0);
    onSubmit(file, metadataToSend);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Subir Documento</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivo
              </label>
              <input
                type="file"
                required
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {file && (
                <p className="text-xs text-gray-500 mt-1">
                  Archivo seleccionado: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                required
                value={metadata.category}
                onChange={(e) => setMetadata({ ...metadata, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="contract">Contrato</option>
                <option value="id">Identificación</option>
                <option value="tax">Fiscal</option>
                <option value="certification">Certificación</option>
                <option value="other">Otro</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe el documento..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas (opcional)
              </label>
              <input
                type="text"
                value={metadata.tags}
                onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                placeholder="contrato, legal, 2024 (separadas por comas)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separa las etiquetas con comas
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isConfidential"
                checked={metadata.isConfidential === true || metadata.isConfidential === 'true'}
                onChange={(e) => setMetadata({ ...metadata, isConfidential: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isConfidential" className="text-sm text-gray-700">
                Documento confidencial
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para vista previa de documentos
interface DocumentPreviewModalProps {
  document: Document;
  employeeId: string;
  onClose: () => void;
  onDownload: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ document, employeeId, onClose, onDownload }) => {
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener el blob del documento
        const blob = await employeeService.downloadDocument(employeeId, document.id);
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch (err: any) {
        console.error('Error cargando vista previa:', err);
        setError('No se pudo cargar la vista previa del documento');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    // Cleanup: revocar URL al desmontar
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [document.id, employeeId]);

  const getPreviewContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando vista previa...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Descargar documento
            </button>
          </div>
        </div>
      );
    }

    // Determinar tipo de vista previa según el tipo de archivo
    const mimeType = document.mimeType.toLowerCase();

    // PDFs
    if (mimeType === 'application/pdf') {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          title={document.originalName}
        />
      );
    }

    // Imágenes
    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full p-4 bg-gray-100">
          <img
            src={previewUrl}
            alt={document.originalName}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    // Otros tipos de archivos
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Vista previa no disponible para este tipo de archivo</p>
          <p className="text-sm text-gray-500 mb-4">Tipo: {document.mimeType}</p>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Descargar documento
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{document.originalName}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                document.category === 'contract' ? 'bg-blue-100 text-blue-800' :
                document.category === 'identification' ? 'bg-green-100 text-green-800' :
                document.category === 'payroll' ? 'bg-purple-100 text-purple-800' :
                document.category === 'medical' ? 'bg-red-100 text-red-800' :
                document.category === 'training' ? 'bg-orange-100 text-orange-800' :
                document.category === 'performance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {document.category === 'contract' ? 'Contrato' :
                 document.category === 'identification' ? 'Identificación' :
                 document.category === 'payroll' ? 'Nómina' :
                 document.category === 'medical' ? 'Médico' :
                 document.category === 'training' ? 'Capacitación' :
                 document.category === 'performance' ? 'Rendimiento' :
                 'Otro'}
              </span>
              <span className="text-sm text-gray-500">
                {(document.fileSize / 1024).toFixed(2)} KB
              </span>
              {document.isConfidential && (
                <span className="inline-flex items-center gap-1 text-xs text-red-600">
                  <Lock className="w-3 h-3" />
                  Confidencial
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {getPreviewContent()}
        </div>

        {/* Footer with metadata */}
        {!loading && !error && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Subido por:</span> {document.uploadedBy}
              </div>
              <div>
                <span className="font-medium">Fecha:</span> {new Date(document.uploadedAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div>
                <span className="font-medium">Versión:</span> v{document.version}
              </div>
              {document.downloadCount > 0 && (
                <div>
                  <span className="font-medium">Descargas:</span> {document.downloadCount}
                </div>
              )}
            </div>
            {document.description && (
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium">Descripción:</span> {document.description}
              </p>
            )}
            {document.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {document.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 text-gray-700 rounded-md text-xs">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal para compartir documentos
interface ShareDocumentsModalProps {
  selectedCount: number;
  documents: Document[];
  onClose: () => void;
  onShare: (method: 'email' | 'link' | 'whatsapp' | 'teams') => void;
}

const ShareDocumentsModal: React.FC<ShareDocumentsModalProps> = ({ selectedCount, documents, onClose, onShare }) => {
  const [shareMethod, setShareMethod] = React.useState<'email' | 'link' | 'whatsapp' | 'teams'>('link');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [linkGenerated, setLinkGenerated] = React.useState(false);
  const [shareLink, setShareLink] = React.useState('');

  const generateShareLink = () => {
    // Generar un link compartible (en producción, esto debería llamar al backend)
    const documentIds = documents.map(doc => doc.id).join(',');
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/shared-documents?ids=${documentIds}&token=${btoa(new Date().getTime().toString())}`;
    setShareLink(link);
    setLinkGenerated(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('Link copiado al portapapeles');
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
    }
  };

  const handleShare = () => {
    if (shareMethod === 'email' && !email) {
      alert('Por favor ingresa un email');
      return;
    }

    if (shareMethod === 'link' && !linkGenerated) {
      generateShareLink();
      return;
    }

    if (shareMethod === 'whatsapp') {
      const text = `Te comparto ${selectedCount} documento${selectedCount > 1 ? 's' : ''}: ${documents.map(d => d.originalName).join(', ')}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
      onShare(shareMethod);
      return;
    }

    if (shareMethod === 'teams') {
      const text = `Documentos compartidos: ${documents.map(d => d.originalName).join(', ')}`;
      const teamsUrl = `https://teams.microsoft.com/share?msgText=${encodeURIComponent(text)}`;
      window.open(teamsUrl, '_blank');
      onShare(shareMethod);
      return;
    }

    onShare(shareMethod);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Compartir Documentos</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCount} documento{selectedCount > 1 ? 's' : ''} seleccionado{selectedCount > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Lista de documentos */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Documentos a compartir:</h4>
            <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
              <ul className="space-y-1">
                {documents.map((doc) => (
                  <li key={doc.id} className="text-sm text-gray-600 flex items-center gap-2">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{doc.originalName}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      ({(doc.fileSize / 1024).toFixed(2)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Métodos de compartir */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Método de compartir:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setShareMethod('email')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  shareMethod === 'email'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Mail className={`w-6 h-6 ${shareMethod === 'email' ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="text-sm font-medium">Email</span>
              </button>

              <button
                onClick={() => setShareMethod('link')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  shareMethod === 'link'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <LinkIcon className={`w-6 h-6 ${shareMethod === 'link' ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="text-sm font-medium">Link</span>
              </button>

              <button
                onClick={() => setShareMethod('whatsapp')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  shareMethod === 'whatsapp'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MessageSquare className={`w-6 h-6 ${shareMethod === 'whatsapp' ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>

              <button
                onClick={() => setShareMethod('teams')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  shareMethod === 'teams'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MessageSquare className={`w-6 h-6 ${shareMethod === 'teams' ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="text-sm font-medium">Teams</span>
              </button>
            </div>
          </div>

          {/* Campos específicos del método */}
          {shareMethod === 'email' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email del destinatario
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Agrega un mensaje..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {shareMethod === 'link' && linkGenerated && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link para compartir
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Este link expirará en 7 días
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleShare}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            {shareMethod === 'link' && !linkGenerated ? 'Generar Link' : 'Compartir'}
          </button>
        </div>
      </div>
    </div>
  );
};
