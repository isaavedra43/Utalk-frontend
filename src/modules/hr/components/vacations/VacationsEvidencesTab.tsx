import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Image,
  Video,
  File,
  User,
  Calendar,
  Tag,
  RefreshCw,
  AlertTriangle,
  Shield,
  ShieldCheck,
  MoreVertical,
  Plus
} from 'lucide-react';
import { useVacationsManagement } from '../../../../hooks/useVacationsManagement';
import { useNotifications } from '../../../../contexts/NotificationContext';
import {
  VacationEvidence,
  VacationEvidenceUpload,
  VacationFilters
} from '../../../../services/vacationsManagementService';

// ============================================================================
// TYPES
// ============================================================================

interface VacationsEvidencesTabProps {}

// ============================================================================
// EVIDENCE TYPE BADGE COMPONENT
// ============================================================================

interface EvidenceTypeBadgeProps {
  type: VacationEvidence['type'];
}

const EvidenceTypeBadge: React.FC<EvidenceTypeBadgeProps> = ({ type }) => {
  const typeConfig = {
    medical_certificate: { color: 'bg-red-100 text-red-800', icon: FileText, label: 'Certificado Médico' },
    travel_ticket: { color: 'bg-blue-100 text-blue-800', icon: FileText, label: 'Boleto de Viaje' },
    boarding_pass: { color: 'bg-green-100 text-green-800', icon: FileText, label: 'Pase de Abordar' },
    hotel_reservation: { color: 'bg-purple-100 text-purple-800', icon: FileText, label: 'Reservación Hotel' },
    other: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'Otro' }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  );
};

// ============================================================================
// VERIFICATION STATUS BADGE COMPONENT
// ============================================================================

interface VerificationStatusBadgeProps {
  isVerified: boolean;
  verifiedBy?: string;
  verifiedDate?: string;
}

const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({
  isVerified,
  verifiedBy,
  verifiedDate
}) => {
  if (isVerified) {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <ShieldCheck className="h-3 w-3" />
        <span>Verificado</span>
        {verifiedBy && (
          <span className="text-xs opacity-75">por {verifiedBy}</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
      <Shield className="h-3 w-3" />
      <span>Pendiente</span>
    </span>
  );
};

// ============================================================================
// EVIDENCE CARD COMPONENT
// ============================================================================

interface EvidenceCardProps {
  evidence: VacationEvidence;
  onView: (evidence: VacationEvidence) => void;
  onVerify: (evidence: VacationEvidence) => void;
  onReject: (evidence: VacationEvidence) => void;
  onDelete: (evidence: VacationEvidence) => void;
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({
  evidence,
  onView,
  onVerify,
  onReject,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-600" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-purple-600" />;
    if (mimeType === 'application/pdf') return <FileText className="h-5 w-5 text-red-600" />;
    return <File className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {getFileIcon(evidence.mimeType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{evidence.fileName}</p>
            <p className="text-sm text-gray-600">{formatFileSize(evidence.fileSize)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <EvidenceTypeBadge type={evidence.type} />
          <VerificationStatusBadge
            isVerified={evidence.isVerified}
            verifiedBy={evidence.verifiedBy}
            verifiedDate={evidence.verifiedDate}
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {evidence.description && (
          <p className="text-sm text-gray-700 line-clamp-2">{evidence.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{evidence.uploadedByName}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(evidence.uploadDate)}</span>
            </span>
          </div>
        </div>

        {evidence.tags && evidence.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {evidence.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(evidence)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Ver archivo"
          >
            <Eye className="h-4 w-4" />
          </button>

          {!evidence.isVerified && (
            <>
              <button
                onClick={() => onVerify(evidence)}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                title="Verificar"
              >
                <CheckCircle className="h-4 w-4" />
              </button>

              <button
                onClick={() => onReject(evidence)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Rechazar"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={() => onDelete(evidence)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Descargar archivo
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Ver detalles completos
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Agregar etiqueta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EVIDENCE UPLOAD MODAL COMPONENT
// ============================================================================

interface EvidenceUploadModalProps {
  isOpen: boolean;
  vacationRequestId?: string;
  onClose: () => void;
  onSubmit: (evidenceData: VacationEvidenceUpload) => Promise<void>;
}

const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  vacationRequestId,
  onClose,
  onSubmit
}) => {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<VacationEvidenceUpload>({
    vacationRequestId: vacationRequestId || '',
    type: 'other',
    files: [],
    description: '',
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vacationRequestId) {
      newErrors.vacationRequestId = 'La solicitud de vacaciones es requerida';
    }

    if (formData.files.length === 0) {
      newErrors.files = 'Debes seleccionar al menos un archivo';
    }

    if (!formData.type) {
      newErrors.type = 'El tipo de evidencia es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      showSuccess('Evidencia subida exitosamente');
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error subiendo evidencia');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: Array.from(e.target.files || [])
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Subir Evidencia de Vacaciones
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Vacation Request ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solicitud de Vacaciones *
              </label>
              <input
                type="text"
                value={formData.vacationRequestId}
                onChange={(e) => setFormData(prev => ({ ...prev, vacationRequestId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.vacationRequestId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ID de la solicitud de vacaciones"
                disabled={loading}
              />
              {errors.vacationRequestId && (
                <p className="mt-1 text-sm text-red-600">{errors.vacationRequestId}</p>
              )}
            </div>

            {/* Evidence Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Evidencia *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as VacationEvidence['type'] }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="medical_certificate">Certificado Médico</option>
                <option value="travel_ticket">Boleto de Viaje</option>
                <option value="boarding_pass">Pase de Abordar</option>
                <option value="hotel_reservation">Reservación de Hotel</option>
                <option value="other">Otro</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Archivos *
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Formatos aceptados: PDF, JPG, PNG, DOC, DOCX (máx. 10MB cada uno)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  Seleccionar Archivos
                </label>
              </div>

              {errors.files && (
                <p className="mt-1 text-sm text-red-600">{errors.files}</p>
              )}

              {formData.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (Opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Descripción de la evidencia..."
                disabled={loading}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Etiquetas (Opcional)
              </label>

              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Agregar etiqueta..."
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading || !newTag.trim()}
                >
                  Agregar
                </button>
              </div>

              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={loading}
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Subiendo...</span>
              </>
            ) : (
              <span>Subir Evidencia</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VacationsEvidencesTab: React.FC<VacationsEvidencesTabProps> = () => {
  const { showSuccess, showError } = useNotifications();

  const {
    evidences,
    loading,
    uploadEvidence,
    verifyEvidence,
    deleteEvidence,
    evidencesPagination,
    goToEvidencesPage,
    changeEvidencesPageSize
  } = useVacationsManagement();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVacationRequestId, setSelectedVacationRequestId] = useState<string>('');

  // Filter evidences
  const filteredEvidences = useMemo(() => {
    if (!searchQuery) return evidences;

    return evidences.filter(evidence =>
      evidence.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evidence.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evidence.uploadedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evidence.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [evidences, searchQuery]);

  // Handlers
  const handleUploadEvidence = () => {
    setShowUploadModal(true);
  };

  const handleViewEvidence = (evidence: VacationEvidence) => {
    window.open(evidence.fileUrl, '_blank');
  };

  const handleVerifyEvidence = async (evidence: VacationEvidence) => {
    try {
      await verifyEvidence(evidence.id, true, 'Verificado por agente de RH');
      showSuccess(`Evidencia "${evidence.fileName}" verificada`);
    } catch (error) {
      showError('Error al verificar la evidencia');
    }
  };

  const handleRejectEvidence = async (evidence: VacationEvidence) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      await verifyEvidence(evidence.id, false, reason);
      showSuccess(`Evidencia "${evidence.fileName}" rechazada`);
    } catch (error) {
      showError('Error al rechazar la evidencia');
    }
  };

  const handleDeleteEvidence = async (evidence: VacationEvidence) => {
    if (!confirm(`¿Estás seguro de eliminar la evidencia "${evidence.fileName}"?`)) return;

    try {
      await deleteEvidence(evidence.id);
      showSuccess('Evidencia eliminada correctamente');
    } catch (error) {
      showError('Error al eliminar la evidencia');
    }
  };

  const handleSubmitUpload = async (evidenceData: VacationEvidenceUpload) => {
    await uploadEvidence(evidenceData);
  };

  // Calculate stats
  const stats = {
    total: evidences.length,
    verified: evidences.filter(e => e.isVerified).length,
    pending: evidences.filter(e => !e.isVerified).length,
    rejected: evidences.filter(e => e.isVerified === false).length,
    totalSize: evidences.reduce((sum, e) => sum + e.fileSize, 0)
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Evidencias</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <FolderOpen className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verificadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rechazadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamaño Total</p>
              <p className="text-lg font-bold text-purple-600">
                {(stats.totalSize / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <File className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por archivo, descripción, empleado o etiqueta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Subir Evidencia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Evidences List */}
      <div className="space-y-4">
        {loading.evidences ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvidences.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron evidencias</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Intenta ajustar los términos de búsqueda'
                : 'Sube la primera evidencia haciendo clic en "Subir Evidencia"'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {filteredEvidences.map((evidence) => (
                <EvidenceCard
                  key={evidence.id}
                  evidence={evidence}
                  onView={handleViewEvidence}
                  onVerify={handleVerifyEvidence}
                  onReject={handleRejectEvidence}
                  onDelete={handleDeleteEvidence}
                />
              ))}
            </div>

            {/* Pagination */}
            {evidencesPagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Mostrando {((evidencesPagination.page - 1) * evidencesPagination.limit) + 1} a{' '}
                    {Math.min(evidencesPagination.page * evidencesPagination.limit, evidencesPagination.total)} de{' '}
                    {evidencesPagination.total} resultados
                  </span>
                  <select
                    value={evidencesPagination.limit}
                    onChange={(e) => changeEvidencesPageSize(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToEvidencesPage(evidencesPagination.page - 1)}
                    disabled={evidencesPagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  <span className="px-3 py-1 text-sm text-gray-700">
                    Página {evidencesPagination.page} de {evidencesPagination.totalPages}
                  </span>

                  <button
                    onClick={() => goToEvidencesPage(evidencesPagination.page + 1)}
                    disabled={evidencesPagination.page >= evidencesPagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Evidence Upload Modal */}
      <EvidenceUploadModal
        isOpen={showUploadModal}
        vacationRequestId={selectedVacationRequestId}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleSubmitUpload}
      />
    </div>
  );
};

export default VacationsEvidencesTab;
