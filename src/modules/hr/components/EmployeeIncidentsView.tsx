import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Share2, 
  Printer, 
  Signature, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  MapPin, 
  Shield, 
  Car, 
  Heart, 
  DollarSign, 
  Briefcase, 
  Users, 
  Building, 
  ChevronDown, 
  MoreHorizontal, 
  Send, 
  Save, 
  Archive, 
  Flag, 
  AlertCircle, 
  Zap, 
  Target, 
  BarChart3, 
  PieChart, 
  Activity,
  FileCheck,
  FileX,
  FileClock
} from 'lucide-react';

interface Incident {
  id: string;
  type: 'administrative' | 'theft' | 'accident' | 'injury' | 'disciplinary' | 'security' | 'equipment' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected' | 'closed';
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  reportedBy: string;
  reportedDate: string;
  involvedPersons: string[];
  witnesses: string[];
  evidence: string[];
  actions: string[];
  consequences: string[];
  preventiveMeasures: string[];
  supervisor: string;
  hrReviewer: string;
  legalReviewer?: string;
  signedBy: string[];
  printedDate?: string;
  uploadedDocuments: string[];
  followUpDate?: string;
  resolution?: string;
  cost?: number;
  insuranceClaim?: boolean;
  policeReport?: boolean;
  medicalReport?: boolean;
  tags: string[];
  isConfidential: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface EmployeeIncidentsData {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  totalIncidents: number;
  openIncidents: number;
  closedIncidents: number;
  incidents: Incident[];
  summary: {
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    byMonth: Record<string, number>;
  };
  recentIncidents: Incident[];
  criticalIncidents: Incident[];
}

interface EmployeeIncidentsViewProps {
  employeeId: string;
  onBack: () => void;
}

const EmployeeIncidentsView: React.FC<EmployeeIncidentsViewProps> = ({ 
  employeeId, 
  onBack 
}) => {
  const [incidentsData, setIncidentsData] = useState<EmployeeIncidentsData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'incidents' | 'reports' | 'analytics'>('overview');
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Simular datos de incidencias
  useEffect(() => {
    const mockIncidentsData: EmployeeIncidentsData = {
      employeeId: 'EMP241001',
      employeeName: 'Ana García',
      position: 'Gerente de Marketing',
      department: 'Marketing',
      totalIncidents: 8,
      openIncidents: 3,
      closedIncidents: 5,
      incidents: [
        {
          id: '1',
          type: 'administrative',
          severity: 'medium',
          status: 'approved',
          title: 'Acta Administrativa - Retraso en entrega de reportes',
          description: 'El empleado presentó retrasos en la entrega de reportes mensuales durante dos meses consecutivos.',
          date: '2024-01-15',
          time: '14:30',
          location: 'Oficina Principal - Piso 3',
          reportedBy: 'Juan Pérez',
          reportedDate: '2024-01-15',
          involvedPersons: ['Ana García'],
          witnesses: ['María López', 'Carlos Ruiz'],
          evidence: ['reporte_retraso.pdf', 'email_evidencia.pdf'],
          actions: ['Llamada de atención verbal', 'Plan de mejora'],
          consequences: ['Advertencia por escrito'],
          preventiveMeasures: ['Establecer recordatorios automáticos', 'Reunión semanal de seguimiento'],
          supervisor: 'Juan Pérez',
          hrReviewer: 'Laura Martínez',
          signedBy: ['Ana García', 'Juan Pérez', 'Laura Martínez'],
          printedDate: '2024-01-16',
          uploadedDocuments: ['acta_administrativa_001.pdf'],
          followUpDate: '2024-02-15',
          resolution: 'Empleado se comprometió a cumplir con los plazos establecidos',
          tags: ['administrativo', 'retraso', 'reportes'],
          isConfidential: false,
          priority: 'medium'
        },
        {
          id: '2',
          type: 'theft',
          severity: 'high',
          status: 'in_review',
          title: 'Reporte de Robo - Equipo de cómputo',
          description: 'Se reportó el robo de una laptop de la empresa durante el horario laboral.',
          date: '2024-02-10',
          time: '16:45',
          location: 'Oficina Principal - Piso 3 - Cubículo 15',
          reportedBy: 'Ana García',
          reportedDate: '2024-02-10',
          involvedPersons: ['Ana García'],
          witnesses: ['Roberto Silva', 'Patricia González'],
          evidence: ['foto_cubículo.pdf', 'inventario_equipos.pdf'],
          actions: ['Reporte a seguridad', 'Notificación a RRHH', 'Reporte policial'],
          consequences: ['Investigación interna', 'Revisión de protocolos de seguridad'],
          preventiveMeasures: ['Instalación de cámaras', 'Control de acceso mejorado'],
          supervisor: 'Juan Pérez',
          hrReviewer: 'Laura Martínez',
          legalReviewer: 'Dr. Carlos Legal',
          policeReport: true,
          tags: ['robo', 'equipo', 'seguridad'],
          isConfidential: true,
          priority: 'urgent'
        },
        {
          id: '3',
          type: 'accident',
          severity: 'medium',
          status: 'closed',
          title: 'Accidente Laboral - Caída en escaleras',
          description: 'El empleado sufrió una caída en las escaleras del edificio durante el horario laboral.',
          date: '2024-01-28',
          time: '09:15',
          location: 'Escaleras principales - Piso 2 a 3',
          reportedBy: 'Ana García',
          reportedDate: '2024-01-28',
          involvedPersons: ['Ana García'],
          witnesses: ['Luis Mendoza', 'Carmen Vega'],
          evidence: ['foto_escaleras.pdf', 'reporte_médico.pdf'],
          actions: ['Atención médica inmediata', 'Reporte a IMSS', 'Investigación del área'],
          consequences: ['Ausencia laboral de 2 días', 'Revisión médica'],
          preventiveMeasures: ['Instalación de barandales', 'Señalización de seguridad'],
          supervisor: 'Juan Pérez',
          hrReviewer: 'Laura Martínez',
          signedBy: ['Ana García', 'Juan Pérez', 'Laura Martínez'],
          printedDate: '2024-01-29',
          uploadedDocuments: ['reporte_accidente_001.pdf', 'certificado_médico.pdf'],
          followUpDate: '2024-02-28',
          resolution: 'Empleado se recuperó completamente, medidas preventivas implementadas',
          cost: 2500,
          insuranceClaim: true,
          medicalReport: true,
          tags: ['accidente', 'caída', 'escaleras'],
          isConfidential: false,
          priority: 'high'
        },
        {
          id: '4',
          type: 'injury',
          severity: 'low',
          status: 'approved',
          title: 'Lesión Menor - Cortada en dedo',
          description: 'El empleado sufrió una cortada menor en el dedo índice mientras manipulaba documentos.',
          date: '2024-02-05',
          time: '11:30',
          location: 'Oficina Principal - Piso 3 - Cubículo 12',
          reportedBy: 'Ana García',
          reportedDate: '2024-02-05',
          involvedPersons: ['Ana García'],
          witnesses: ['Elena Torres'],
          evidence: ['foto_lesión.pdf'],
          actions: ['Primeros auxilios', 'Curación en enfermería'],
          consequences: ['Tiempo de trabajo perdido: 15 minutos'],
          preventiveMeasures: ['Capacitación en manipulación de documentos', 'Guantes de protección'],
          supervisor: 'Juan Pérez',
          hrReviewer: 'Laura Martínez',
          signedBy: ['Ana García', 'Juan Pérez'],
          printedDate: '2024-02-06',
          uploadedDocuments: ['reporte_lesión_001.pdf'],
          followUpDate: '2024-02-12',
          resolution: 'Lesión curada, empleado regresó a sus actividades normales',
          tags: ['lesión', 'cortada', 'documentos'],
          isConfidential: false,
          priority: 'low'
        }
      ],
      summary: {
        byType: {
          administrative: 2,
          theft: 1,
          accident: 2,
          injury: 2,
          disciplinary: 1
        },
        bySeverity: {
          low: 2,
          medium: 4,
          high: 2,
          critical: 0
        },
        byStatus: {
          draft: 0,
          pending: 1,
          in_review: 1,
          approved: 3,
          rejected: 0,
          closed: 3
        },
        byMonth: {
          '2024-01': 2,
          '2024-02': 2
        }
      },
      recentIncidents: [],
      criticalIncidents: []
    };

    // Calcular incidencias recientes y críticas
    mockIncidentsData.recentIncidents = mockIncidentsData.incidents
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    mockIncidentsData.criticalIncidents = mockIncidentsData.incidents
      .filter(incident => incident.severity === 'high' || incident.severity === 'critical')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTimeout(() => {
      setIncidentsData(mockIncidentsData);
      setLoading(false);
    }, 1000);
  }, [employeeId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'administrative': return <FileText className="h-4 w-4" />;
      case 'theft': return <Shield className="h-4 w-4" />;
      case 'accident': return <Car className="h-4 w-4" />;
      case 'injury': return <Heart className="h-4 w-4" />;
      case 'disciplinary': return <AlertTriangle className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'equipment': return <Briefcase className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'administrative': return 'Administrativa';
      case 'theft': return 'Robo';
      case 'accident': return 'Accidente';
      case 'injury': return 'Lesión';
      case 'disciplinary': return 'Disciplinaria';
      case 'security': return 'Seguridad';
      case 'equipment': return 'Equipo';
      default: return 'Otro';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return 'Desconocida';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'closed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'pending': return 'Pendiente';
      case 'in_review': return 'En Revisión';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'closed': return 'Cerrado';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileClock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_review': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'closed': return <Archive className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredIncidents = incidentsData?.incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || incident.type === filterType;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    return matchesSearch && matchesType && matchesStatus && matchesSeverity;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de incidencias...</p>
        </div>
      </div>
    );
  }

  if (!incidentsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró información</h3>
          <p className="text-gray-600">No hay datos de incidencias disponibles para este empleado.</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
                <p className="text-gray-600">{incidentsData.employeeName} - {incidentsData.position}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Incidencias</p>
                <p className="text-2xl font-bold text-blue-600">{incidentsData.totalIncidents}</p>
                <p className="text-xs text-gray-500">registradas</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abiertas</p>
                <p className="text-2xl font-bold text-orange-600">{incidentsData.openIncidents}</p>
                <p className="text-xs text-gray-500">pendientes</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cerradas</p>
                <p className="text-2xl font-bold text-green-600">{incidentsData.closedIncidents}</p>
                <p className="text-xs text-gray-500">resueltas</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{incidentsData.criticalIncidents.length}</p>
                <p className="text-xs text-gray-500">alta prioridad</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Resumen', icon: BarChart3 },
                { id: 'incidents', label: 'Incidencias', icon: AlertTriangle },
                { id: 'reports', label: 'Reportes', icon: FileText },
                { id: 'analytics', label: 'Análisis', icon: Activity }
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

        {/* Contenido de las pestañas */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estadísticas por tipo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Incidencias por Tipo</h4>
                  <div className="space-y-3">
                    {Object.entries(incidentsData.summary.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(type)}
                          <span className="text-sm text-gray-600">{getTypeText(type)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Incidencias por Severidad</h4>
                  <div className="space-y-3">
                    {Object.entries(incidentsData.summary.bySeverity).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(severity)}`}>
                          {getSeverityText(severity)}
                        </span>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Incidencias críticas */}
            {incidentsData.criticalIncidents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Incidencias Críticas</h4>
                  <div className="space-y-4">
                    {incidentsData.criticalIncidents.map((incident) => (
                      <div key={incident.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-red-900">{incident.title}</h5>
                            <p className="text-sm text-red-700 mt-1">{incident.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-red-600">
                                {formatDate(incident.date)} a las {incident.time}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                                {getStatusText(incident.status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-red-100 rounded text-red-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 hover:bg-red-100 rounded text-red-600">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-6">
            {/* Filtros y botón de nueva incidencia */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Incidencias Registradas</h3>
                  <button 
                    onClick={() => setShowNewIncident(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Incidencia</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar incidencias..."
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
                      <option value="administrative">Administrativa</option>
                      <option value="theft">Robo</option>
                      <option value="accident">Accidente</option>
                      <option value="injury">Lesión</option>
                      <option value="disciplinary">Disciplinaria</option>
                      <option value="security">Seguridad</option>
                      <option value="equipment">Equipo</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="draft">Borrador</option>
                      <option value="pending">Pendiente</option>
                      <option value="in_review">En Revisión</option>
                      <option value="approved">Aprobado</option>
                      <option value="rejected">Rechazado</option>
                      <option value="closed">Cerrado</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="pl-4 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas las severidades</option>
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista de incidencias */}
              <div className="p-6">
                <div className="space-y-4">
                  {filteredIncidents.map((incident) => (
                    <div key={incident.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(incident.type)}
                            <h4 className="font-medium text-gray-900">{incident.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                              {getSeverityText(incident.severity)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                              {getStatusText(incident.status)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(incident.date)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{incident.location}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>Reportado por: {incident.reportedBy}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <Printer className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generar Reportes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Acta Administrativa</span>
                    </div>
                    <p className="text-sm text-gray-600">Generar acta administrativa formal</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-gray-900">Reporte de Robo</span>
                    </div>
                    <p className="text-sm text-gray-600">Reporte de robo o hurto</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <Car className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-900">Reporte de Accidente</span>
                    </div>
                    <p className="text-sm text-gray-600">Accidente laboral o de trabajo</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <Heart className="h-5 w-5 text-pink-600" />
                      <span className="font-medium text-gray-900">Reporte de Lesión</span>
                    </div>
                    <p className="text-sm text-gray-600">Lesión o herida en el trabajo</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">Reporte Disciplinario</span>
                    </div>
                    <p className="text-sm text-gray-600">Falta disciplinaria</p>
                  </button>
                  
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-3 mb-2">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-900">Reporte de Equipo</span>
                    </div>
                    <p className="text-sm text-gray-600">Daño o pérdida de equipo</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Incidencias</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Gráficos de análisis</p>
                    <p className="text-sm text-gray-500">Se mostrarán aquí gráficos de tendencias y análisis de incidencias</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { EmployeeIncidentsView };
export default EmployeeIncidentsView;
