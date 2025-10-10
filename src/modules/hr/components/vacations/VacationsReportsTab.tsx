import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings,
  Target
} from 'lucide-react';
import { useVacationsManagement } from '../../../../hooks/useVacationsManagement';
import { useNotifications } from '../../../../contexts/NotificationContext';
import {
  VacationReport,
  VacationExportOptions,
  VacationFilters
} from '../../../../services/vacationsManagementService';

// ============================================================================
// TYPES
// ============================================================================

interface VacationsReportsTabProps {
  onBack?: () => void;
}

// ============================================================================
// REPORT TYPE CARD COMPONENT
// ============================================================================

interface ReportTypeCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onGenerate: () => void;
  loading?: boolean;
}

const ReportTypeCard: React.FC<ReportTypeCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  onGenerate,
  loading = false
}: ReportTypeCardProps) => {
  return (
    <div className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${loading ? 'animate-pulse' : ''}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <button
            onClick={onGenerate}
            disabled={loading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// GENERATED REPORTS LIST COMPONENT
// ============================================================================

interface GeneratedReportsListProps {
  reports: VacationReport[];
  onView: (report: VacationReport) => void;
  onDownload: (report: VacationReport) => void;
  onDelete: (report: VacationReport) => void;
  loading?: boolean;
}

const GeneratedReportsList: React.FC<GeneratedReportsListProps> = ({
  reports,
  onView,
  onDownload,
  onDelete,
  loading = false
}: GeneratedReportsListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'generating': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'failed': return 'Fallido';
      case 'generating': return 'Generando...';
      default: return 'Pendiente';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'csv': return <FileText className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Reportes Generados</h3>
        <p className="text-sm text-gray-600">Historial de reportes generados</p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between p-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay reportes generados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report: VacationReport) => (
              <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  {getFormatIcon(report.format)}
                  <div>
                    <p className="font-medium text-gray-900">{report.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{getStatusText(report.status)}</span>
                      <span>•</span>
                      <span>{formatDate(report.generatedAt)}</span>
                      <span>•</span>
                      <span>{report.generatedByName}</span>
                    </div>
                    {report.fileSize && (
                      <p className="text-xs text-gray-500">{formatFileSize(report.fileSize)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {report.status === 'completed' && (
                    <>
                      <button
                        onClick={() => onView(report)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver reporte"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDownload(report)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Descargar"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => onDelete(report)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// REPORT GENERATION FORM COMPONENT
// ============================================================================

interface ReportGenerationFormProps {
  isOpen: boolean;
  reportType: VacationReport['type'];
  onClose: () => void;
  onSubmit: (options: VacationExportOptions) => Promise<void>;
}

const ReportGenerationForm: React.FC<ReportGenerationFormProps> = ({
  isOpen,
  reportType,
  onClose,
  onSubmit
}: ReportGenerationFormProps) => {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<VacationExportOptions>({
    format: 'excel',
    include: {
      requests: true,
      payments: true,
      evidences: true,
      analytics: true,
      policies: true
    },
    filters: {},
    dateRange: {
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    includeInactive: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dateRange.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.dateRange.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (formData.dateRange.startDate && formData.dateRange.endDate) {
      if (new Date(formData.dateRange.endDate) < new Date(formData.dateRange.startDate)) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
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
      showSuccess('Reporte generado exitosamente');
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error generando reporte');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Configurar Reporte - {reportType}
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
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Período del Reporte
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.dateRange.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: VacationExportOptions) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, startDate: e.target.value }
                    }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin *
                  </label>
                  <input
                    type="date"
                    value={formData.dateRange.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: VacationExportOptions) => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, endDate: e.target.value }
                    }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Formato del Archivo
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'excel', label: 'Excel', icon: FileSpreadsheet, color: 'bg-green-100 text-green-800' },
                  { value: 'pdf', label: 'PDF', icon: FileText, color: 'bg-red-100 text-red-800' },
                  { value: 'csv', label: 'CSV', icon: FileText, color: 'bg-blue-100 text-blue-800' }
                ].map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((prev: VacationExportOptions) => ({ ...prev, format: value as 'excel' | 'pdf' | 'csv' }))}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      formData.format === value
                        ? `${color} border-current`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    disabled={loading}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Data to Include */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Datos a Incluir
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'requests', label: 'Solicitudes', icon: Calendar },
                  { key: 'payments', label: 'Pagos', icon: DollarSign },
                  { key: 'evidences', label: 'Evidencias', icon: FileText },
                  { key: 'analytics', label: 'Análisis', icon: BarChart3 },
                  { key: 'policies', label: 'Políticas', icon: Settings }
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.include[key as keyof typeof formData.include]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: VacationExportOptions) => ({
                        ...prev,
                        include: { ...prev.include, [key]: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.includeInactive}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: VacationExportOptions) => ({ ...prev, includeInactive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">Incluir datos inactivos</span>
              </label>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Generar Reporte</span>
              </>
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

const VacationsReportsTab: React.FC<VacationsReportsTabProps> = () => {
  const { showSuccess, showError } = useNotifications();

  const {
    generateReport,
    downloadReport,
    loading
  } = useVacationsManagement();

  // Local state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<VacationReport['type']>('summary');
  const [generatedReports, setGeneratedReports] = useState<VacationReport[]>([]);

  // Report types configuration
  const reportTypes = [
    {
      type: 'summary' as const,
      title: 'Reporte Resumen',
      description: 'Resumen ejecutivo del sistema de vacaciones con métricas principales',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      type: 'detailed' as const,
      title: 'Reporte Detallado',
      description: 'Reporte completo con todos los datos de solicitudes, pagos y evidencias',
      icon: FileSpreadsheet,
      color: 'bg-green-500'
    },
    {
      type: 'analytics' as const,
      title: 'Reporte de Análisis',
      description: 'Análisis profundo con tendencias, patrones y proyecciones',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      type: 'payments' as const,
      title: 'Reporte de Pagos',
      description: 'Información detallada sobre pagos de vacaciones procesados',
      icon: DollarSign,
      color: 'bg-yellow-500'
    },
    {
      type: 'conflicts' as const,
      title: 'Reporte de Conflictos',
      description: 'Análisis de conflictos de fechas y sugerencias de resolución',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      type: 'utilization' as const,
      title: 'Reporte de Utilización',
      description: 'Análisis de uso de vacaciones por departamento y posición',
      icon: Target,
      color: 'bg-indigo-500'
    }
  ];

  // Handlers
  const handleGenerateReport = (reportType: VacationReport['type']) => {
    setSelectedReportType(reportType);
    setShowReportModal(true);
  };

  const handleSubmitReport = async (options: VacationExportOptions) => {
    try {
      const report = await generateReport(selectedReportType, options);

      // Add to generated reports list
      setGeneratedReports((prev: VacationReport[]) => [report, ...prev]);

      // Auto-download if completed
      if (report.status === 'completed' && report.fileUrl) {
        const blob = await downloadReport(report.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.name}_${new Date().toISOString().split('T')[0]}.${options.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleViewReport = (report: VacationReport) => {
    if (report.fileUrl) {
      window.open(report.fileUrl, '_blank');
    }
  };

  const handleDownloadReport = async (report: VacationReport) => {
    try {
      const blob = await downloadReport(report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name}_${new Date().toISOString().split('T')[0]}.${report.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess('Reporte descargado correctamente');
    } catch (error) {
      showError('Error al descargar el reporte');
    }
  };

  const handleDeleteReport = async (report: VacationReport) => {
    if (!confirm(`¿Estás seguro de eliminar el reporte "${report.name}"?`)) return;

    // Remove from local state (in real implementation, this would call an API)
    setGeneratedReports((prev: VacationReport[]) => prev.filter((r: VacationReport) => r.id !== report.id));
    showSuccess('Reporte eliminado correctamente');
  };

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: generatedReports.length,
      completed: generatedReports.filter((r: VacationReport) => r.status === 'completed').length,
      failed: generatedReports.filter((r: VacationReport) => r.status === 'failed').length,
      totalSize: generatedReports
        .filter((r: VacationReport) => r.fileSize)
        .reduce((sum: number, r: VacationReport) => sum + (r.fileSize || 0), 0)
    };
  }, [generatedReports]);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reportes</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fallidos</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
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
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Tipos de Reporte</h2>
        <div className="grid gap-6">
          {reportTypes.map((reportType) => (
            <ReportTypeCard
              key={reportType.type}
              title={reportType.title}
              description={reportType.description}
              icon={reportType.icon}
              color={reportType.color}
              onGenerate={() => handleGenerateReport(reportType.type)}
              loading={loading.analytics}
            />
          ))}
        </div>
      </div>

      {/* Generated Reports */}
      <GeneratedReportsList
        reports={generatedReports}
        onView={handleViewReport}
        onDownload={handleDownloadReport}
        onDelete={handleDeleteReport}
        loading={loading.analytics}
      />

      {/* Quick Export Options */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Exportación Rápida</h3>
          <p className="text-sm text-gray-600">Exportaciones preconfiguradas para uso frecuente</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900">Solicitudes del Mes</p>
                <p className="text-xs text-blue-700">Excel con solicitudes actuales</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-green-900">Pagos Procesados</p>
                <p className="text-xs text-green-700">PDF con pagos completados</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-purple-900">Análisis Trimestral</p>
                <p className="text-xs text-purple-700">Reporte de tendencias</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-orange-900">Conflictos Activos</p>
                <p className="text-xs text-orange-700">Reporte de problemas</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      <ReportGenerationForm
        isOpen={showReportModal}
        reportType={selectedReportType}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
};

export default VacationsReportsTab;
