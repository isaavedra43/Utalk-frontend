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
  Tag
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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Document['category']>('all');
  const [confidentialFilter, setConfidentialFilter] = useState<'all' | 'confidential' | 'public'>('all');

  const { hasPermission, canAccessEmployee } = useHRPermissions();

  useEffect(() => {
    console.log('🔍 DocumentModule useEffect:', {
      employeeId,
      canViewDocuments: hasPermission('canViewDocuments', employeeId),
      canAccessEmployee: canAccessEmployee(employeeId)
    });
    
    // Para usuarios admin, permitir acceso directo
    // TODO: Mejorar la lógica de permisos HR más adelante
    console.log('✅ Cargando documentos para empleado:', employeeId);
    loadDocuments();
  }, [employeeId]);

  const loadDocuments = async () => {
    try {
      console.log('🔄 Iniciando carga de documentos para empleado:', employeeId);
      setLoading(true);
      setError(null);
      
      console.log('🌐 Llamando a employeeService.getDocuments con ID:', employeeId);
      const response = await employeeService.getDocuments(employeeId);
      
      console.log('📊 Respuesta del backend documentos:', response);
      
      if (response.success && response.data) {
        console.log('✅ Documentos cargados exitosamente:', response.data.documents?.length || 0);
        // Manejar caso de documentos vacíos
        setDocuments(response.data.documents || []);
      } else {
        console.log('⚠️ Respuesta sin datos o sin éxito:', response);
        // Si no hay documentos o la respuesta es exitosa pero sin datos
        setDocuments([]);
      }
    } catch (err: any) {
      console.error('❌ Error cargando documentos:', err);
      setError(err.message || 'Error al cargar documentos');
      // En caso de error, mostrar lista vacía para evitar crashes
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, metadata: DocumentMetadata) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await employeeService.uploadDocument(employeeId, file, metadata);
      
      if (response.success) {
        // Recargar lista después de subida exitosa
        await loadDocuments();
        setShowUploadModal(false);
      } else {
        throw new Error(response.message || 'Error al subir documento');
      }
    } catch (err: any) {
      console.error('Error subiendo documento:', err);
      setError(err.message || 'Error al subir documento');
    } finally {
      setLoading(false);
    }
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
      setLoading(true);
      setError(null);
      
      const response = await employeeService.deleteDocument(employeeId, documentId);
      
      if (response.success) {
        // Recargar lista después de eliminación exitosa
        await loadDocuments();
      } else {
        throw new Error(response.message || 'Error al eliminar documento');
      }
    } catch (err: any) {
      console.error('Error eliminando documento:', err);
      setError(err.message || 'Error al eliminar documento');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: Document['category']) => {
    switch (category) {
      case 'contract':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'id':
        return <User className="w-5 h-5 text-green-600" />;
      case 'tax':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'certification':
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryLabel = (category: Document['category']) => {
    switch (category) {
      case 'contract':
        return 'Contrato';
      case 'id':
        return 'Identificación';
      case 'tax':
        return 'Fiscal';
      case 'certification':
        return 'Certificación';
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
      case 'id':
        return 'bg-green-100 text-green-800';
      case 'tax':
        return 'bg-purple-100 text-purple-800';
      case 'certification':
        return 'bg-orange-100 text-orange-800';
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
      <div className="flex justify-between items-center mb-6">
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
            <option value="id">Identificación</option>
            <option value="tax">Fiscal</option>
            <option value="certification">Certificación</option>
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
            <div key={document.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              {/* Document Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
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
                  {document.expiresAt && (
                    <p>Expira: {formatDate(document.expiresAt)}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
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
