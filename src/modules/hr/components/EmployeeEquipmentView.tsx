import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  FileText,
  BarChart3,
  Shield,
  Wrench,
  AlertCircle,
  ChevronDown,
  Laptop,
  Car,
  Phone,
  ShirtIcon,
  Armchair,
  HardHat,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useEquipment } from '../../../hooks/useEquipment';
import { useNotifications } from '../../../contexts/NotificationContext';
import EquipmentModal from './EquipmentModal';
import EquipmentReviewModal from './EquipmentReviewModal';
import type { Equipment, CreateEquipmentRequest, CreateReviewRequest } from '../../../services/equipmentService';

interface EmployeeEquipmentViewProps {
  employeeId: string;
  employeeName?: string;
  onBack: () => void;
}

const EmployeeEquipmentView: React.FC<EmployeeEquipmentViewProps> = ({
  employeeId,
  employeeName = 'Empleado',
  onBack
}) => {
  const { showSuccess, showError } = useNotifications();

  const {
    equipment,
    summary,
    loading,
    error,
    assignEquipment,
    updateEquipment,
    returnEquipment,
    reportLost,
    reportDamage,
    deleteEquipment,
    createReview,
    uploadFiles,
    exportEquipment,
    generateReport,
    refreshData
  } = useEquipment({ employeeId });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'equipment' | 'reviews' | 'reports'>('overview');
  const [showNewEquipment, setShowNewEquipment] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Handlers
  const handleSubmitEquipment = async (
    equipmentData: CreateEquipmentRequest,
    files: { invoices: File[]; photos: File[]; document?: File }
  ) => {
    try {
      // Subir archivos primero
      let invoiceIds: string[] = [];
      let photoIds: string[] = [];
      let documentId: string | undefined;

      if (files.invoices.length > 0) {
        invoiceIds = await uploadFiles(files.invoices, 'invoice');
      }

      if (files.photos.length > 0) {
        photoIds = await uploadFiles(files.photos, 'photo');
      }

      if (files.document) {
        const docIds = await uploadFiles([files.document], 'document');
        documentId = docIds[0];
      }

      const finalData = {
        ...equipmentData,
        invoice: {
          ...equipmentData.invoice,
          attachments: invoiceIds
        },
        photos: photoIds,
        responsibilityDocument: documentId
      };

      if (selectedEquipment) {
        await updateEquipment(selectedEquipment.id, finalData);
        showSuccess('Equipo actualizado exitosamente');
      } else {
        await assignEquipment(finalData);
        showSuccess('Equipo asignado exitosamente');
      }

      setShowNewEquipment(false);
      setSelectedEquipment(null);
    } catch (error) {
      throw error;
    }
  };

  const handleSubmitReview = async (reviewData: CreateReviewRequest, photos: File[]) => {
    try {
      if (!selectedEquipment) return;

      let photoIds: string[] = [];
      if (photos.length > 0) {
        photoIds = await uploadFiles(photos, 'photo');
      }

      await createReview(selectedEquipment.id, {
        ...reviewData,
        photos: photoIds
      });

      showSuccess('Revisión registrada exitosamente');
      setShowReviewModal(false);
      setSelectedEquipment(null);
    } catch (error) {
      throw error;
    }
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowNewEquipment(true);
  };

  const handleReviewEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowReviewModal(true);
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este equipo?')) return;

    try {
      await deleteEquipment(equipmentId);
      showSuccess('Equipo eliminado exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error eliminando equipo');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportEquipment('excel');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `equipo_${employeeId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Equipo exportado exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error exportando equipo');
    }
  };

  const handleGenerateReport = async (reportType: 'inventory' | 'maintenance' | 'depreciation' | 'responsibility') => {
    try {
      const blob = await generateReport(reportType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Reporte generado exitosamente');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error generando reporte');
    }
  };

  // Filters
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || eq.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || eq.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Helpers
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'uniform': return <ShirtIcon className="h-5 w-5" />;
      case 'tools': return <Wrench className="h-5 w-5" />;
      case 'computer': return <Laptop className="h-5 w-5" />;
      case 'vehicle': return <Car className="h-5 w-5" />;
      case 'phone': return <Phone className="h-5 w-5" />;
      case 'furniture': return <Armchair className="h-5 w-5" />;
      case 'safety': return <HardHat className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'uniform': return 'Uniforme';
      case 'tools': return 'Herramientas';
      case 'computer': return 'Computadora';
      case 'vehicle': return 'Vehículo';
      case 'phone': return 'Teléfono';
      case 'furniture': return 'Mobiliario';
      case 'safety': return 'Seguridad';
      case 'other': return 'Otro';
      default: return 'Desconocido';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_use': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'damaged': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Asignado';
      case 'in_use': return 'En Uso';
      case 'maintenance': return 'Mantenimiento';
      case 'returned': return 'Devuelto';
      case 'lost': return 'Perdido';
      case 'damaged': return 'Dañado';
      default: return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando equipo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar equipo</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refreshData()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      <EquipmentModal
        isOpen={showNewEquipment}
        onClose={() => {
          setShowNewEquipment(false);
          setSelectedEquipment(null);
        }}
        onSubmit={handleSubmitEquipment}
        employeeId={employeeId}
        employeeName={employeeName}
        equipment={selectedEquipment}
        mode={selectedEquipment ? 'edit' : 'create'}
      />

      <EquipmentReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedEquipment(null);
        }}
        onSubmit={handleSubmitReview}
        equipmentName={selectedEquipment?.name || ''}
      />

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
                <h1 className="text-2xl font-bold text-gray-900">Equipo Asignado</h1>
                <p className="text-gray-600">{employeeName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setSelectedEquipment(null);
                  setShowNewEquipment(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Asignar Equipo</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Equipo</p>
                <p className="text-3xl font-bold text-blue-600">{summary?.totalEquipment || 0}</p>
                <p className="text-xs text-gray-500">{formatCurrency(summary?.totalValue || 0)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Uso</p>
                <p className="text-3xl font-bold text-green-600">{summary?.assignedEquipment || 0}</p>
                <p className="text-xs text-gray-500">Actualmente asignado</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mantenimiento</p>
                <p className="text-3xl font-bold text-yellow-600">{summary?.inMaintenanceEquipment || 0}</p>
                <p className="text-xs text-gray-500">{summary?.maintenanceDue || 0} pendientes</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Condición</p>
                <p className="text-3xl font-bold text-purple-600">{summary?.averageConditionScore || 0}%</p>
                <p className="text-xs text-gray-500">Score promedio</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'equipment', label: 'Equipo', icon: Package },
                { id: 'reviews', label: 'Revisiones', icon: CheckCircle },
                { id: 'reports', label: 'Reportes', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Distribución por Categoría</h4>
                  <div className="space-y-3">
                    {summary && Object.entries(summary.byCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span className="text-sm text-gray-600">{getCategoryText(category)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Estado del Equipo</h4>
                  <div className="space-y-3">
                    {summary && Object.entries(summary.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{getStatusText(status)}</span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(summary?.maintenanceDue ?? 0) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Mantenimiento Pendiente</p>
                      <p className="text-sm text-yellow-800 mt-1">
                        {summary?.maintenanceDue} equipos requieren mantenimiento
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(summary?.warrantyExpiringSoon ?? 0) > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">Garantías por Vencer</p>
                      <p className="text-sm text-orange-800 mt-1">
                        {summary?.warrantyExpiringSoon} garantías próximas a vencer
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(summary?.lostEquipment ?? 0) > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Equipo Perdido</p>
                      <p className="text-sm text-red-800 mt-1">
                        {summary?.lostEquipment} equipos reportados como perdidos
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Equipment */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Equipo Asignado</h3>
                  <button
                    onClick={() => {
                      setSelectedEquipment(null);
                      setShowNewEquipment(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Asignar Nuevo</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar equipo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="uniform">Uniformes</option>
                    <option value="tools">Herramientas</option>
                    <option value="computer">Computadoras</option>
                    <option value="vehicle">Vehículos</option>
                    <option value="phone">Teléfonos</option>
                    <option value="furniture">Mobiliario</option>
                    <option value="safety">Seguridad</option>
                    <option value="other">Otro</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="assigned">Asignado</option>
                    <option value="in_use">En Uso</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="returned">Devuelto</option>
                    <option value="lost">Perdido</option>
                    <option value="damaged">Dañado</option>
                  </select>
                </div>
              </div>

              <div className="p-6">
                {filteredEquipment.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No se encontró equipo</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {equipment.length === 0
                        ? 'Asigna el primer equipo haciendo clic en "Asignar Nuevo"'
                        : 'Intenta ajustar los filtros de búsqueda'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEquipment.map((eq) => (
                      <div key={eq.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(eq.category)}
                            <span className="font-medium text-gray-900">{eq.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleReviewEquipment(eq)}
                              className="p-1 hover:bg-purple-100 rounded text-purple-600"
                              title="Revisar"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditEquipment(eq)}
                              className="p-1 hover:bg-blue-100 rounded text-blue-600"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEquipment(eq.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {eq.photos && eq.photos.length > 0 && (
                          <img
                            src={eq.photos[0]}
                            alt={eq.name}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        )}

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{eq.description}</p>

                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-gray-500">{eq.brand} {eq.model}</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(eq.currentValue, eq.currency)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(eq.condition)}`}>
                            {eq.condition === 'excellent' ? 'Excelente' :
                             eq.condition === 'good' ? 'Bueno' :
                             eq.condition === 'fair' ? 'Regular' :
                             eq.condition === 'poor' ? 'Malo' : 'Dañado'}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(eq.status)}`}>
                            {getStatusText(eq.status)}
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                          <div className="flex items-center justify-between">
                            <span>Asignado: {formatDate(eq.assignedDate)}</span>
                            {eq.serialNumber && (
                              <span className="font-mono">{eq.serialNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Revisiones</h3>
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Historial de revisiones</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Las revisiones se mostrarán aquí
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reportes Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      type: 'inventory' as const,
                      title: 'Inventario Completo',
                      description: 'Listado detallado de todo el equipo asignado',
                      icon: Package,
                      color: 'blue'
                    },
                    {
                      type: 'maintenance' as const,
                      title: 'Mantenimiento',
                      description: 'Historial y programación de mantenimientos',
                      icon: Wrench,
                      color: 'yellow'
                    },
                    {
                      type: 'depreciation' as const,
                      title: 'Depreciación',
                      description: 'Análisis de depreciación de activos',
                      icon: TrendingDown,
                      color: 'red'
                    },
                    {
                      type: 'responsibility' as const,
                      title: 'Responsabilidad',
                      description: 'Carta responsiva de equipo asignado',
                      icon: FileText,
                      color: 'green'
                    }
                  ].map((report) => {
                    const Icon = report.icon;
                    return (
                      <button
                        key={report.type}
                        onClick={() => handleGenerateReport(report.type)}
                        className="flex items-start space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className={`p-3 bg-${report.color}-100 rounded-lg`}>
                          <Icon className={`h-6 w-6 text-${report.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{report.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                        </div>
                        <Download className="h-5 w-5 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { EmployeeEquipmentView };
export default EmployeeEquipmentView;

