import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Share2,
  MoreHorizontal,
  Timer,
  UserCheck,
  UserX,
  Coffee,
  Home,
  Car,
  Plane,
  Heart,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Building,
  Plus,
  Calendar,
  MapPin,
  Sun,
  Snowflake,
  Umbrella,
  Gift,
  Baby,
  User,
  FileText,
  Send,
  Edit,
  Trash2,
  Clock3,
  CheckSquare,
  Square
} from 'lucide-react';
import VacationsChart from './VacationsChart';

interface VacationRequest {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  type: 'vacation' | 'personal' | 'sick_leave' | 'maternity' | 'paternity' | 'unpaid' | 'compensatory';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
  attachments?: string[];
}

interface VacationBalance {
  total: number;
  used: number;
  available: number;
  pending: number;
  expired: number;
  nextExpiration?: string;
}

interface VacationPolicy {
  annualDays: number;
  accrualRate: number;
  maxCarryover: number;
  probationPeriod: number;
  advanceRequest: number;
  blackoutPeriods: Array<{
    startDate: string;
    endDate: string;
    reason: string;
  }>;
}

interface EmployeeVacationsData {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  hireDate: string;
  currentBalance: VacationBalance;
  policy: VacationPolicy;
  requests: VacationRequest[];
  history: VacationRequest[];
  summary: {
    totalRequests: number;
    approvedRequests: number;
    pendingRequests: number;
    rejectedRequests: number;
    totalDaysUsed: number;
    averageDaysPerRequest: number;
    mostUsedMonth: string;
    lastVacation: string;
  };
}

interface EmployeeVacationsViewProps {
  employeeId: string;
  onBack: () => void;
}

const EmployeeVacationsView: React.FC<EmployeeVacationsViewProps> = ({ 
  employeeId, 
  onBack 
}) => {
  const [vacationsData, setVacationsData] = useState<EmployeeVacationsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'history' | 'calendar'>('overview');
  const [showNewRequest, setShowNewRequest] = useState(false);

  // Simular datos de vacaciones
  useEffect(() => {
    const mockVacationsData: EmployeeVacationsData = {
      employeeId: 'EMP241001',
      employeeName: 'Ana García',
      position: 'Gerente de Marketing',
      department: 'Marketing',
      hireDate: '2022-03-14',
      currentBalance: {
        total: 20,
        used: 8,
        available: 12,
        pending: 3,
        expired: 0,
        nextExpiration: '2024-12-31'
      },
      policy: {
        annualDays: 20,
        accrualRate: 1.67, // días por mes
        maxCarryover: 5,
        probationPeriod: 6,
        advanceRequest: 30,
        blackoutPeriods: [
          {
            startDate: '2024-12-15',
            endDate: '2024-12-31',
            reason: 'Temporada alta de fin de año'
          }
        ]
      },
      requests: [
        {
          id: '1',
          startDate: '2024-02-15',
          endDate: '2024-02-20',
          days: 4,
          type: 'vacation',
          reason: 'Vacaciones familiares',
          status: 'approved',
          requestedDate: '2024-01-15',
          approvedBy: 'Juan Pérez',
          approvedDate: '2024-01-16'
        },
        {
          id: '2',
          startDate: '2024-03-10',
          endDate: '2024-03-12',
          days: 3,
          type: 'personal',
          reason: 'Asuntos personales',
          status: 'pending',
          requestedDate: '2024-02-28'
        },
        {
          id: '3',
          startDate: '2024-04-01',
          endDate: '2024-04-05',
          days: 5,
          type: 'vacation',
          reason: 'Semana Santa',
          status: 'approved',
          requestedDate: '2024-02-15',
          approvedBy: 'Juan Pérez',
          approvedDate: '2024-02-16'
        }
      ],
      history: [
        {
          id: '1',
          startDate: '2023-12-20',
          endDate: '2023-12-27',
          days: 6,
          type: 'vacation',
          reason: 'Vacaciones de fin de año',
          status: 'approved',
          requestedDate: '2023-11-15',
          approvedBy: 'Juan Pérez',
          approvedDate: '2023-11-16'
        },
        {
          id: '2',
          startDate: '2023-08-15',
          endDate: '2023-08-18',
          days: 4,
          type: 'vacation',
          reason: 'Vacaciones de verano',
          status: 'approved',
          requestedDate: '2023-07-15',
          approvedBy: 'Juan Pérez',
          approvedDate: '2023-07-16'
        }
      ],
      summary: {
        totalRequests: 5,
        approvedRequests: 4,
        pendingRequests: 1,
        rejectedRequests: 0,
        totalDaysUsed: 8,
        averageDaysPerRequest: 3.2,
        mostUsedMonth: 'Diciembre',
        lastVacation: '2024-02-20'
      }
    };

    setTimeout(() => {
      setVacationsData(mockVacationsData);
      setLoading(false);
    }, 1000);
  }, [employeeId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock3 className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <Square className="h-4 w-4" />;
      default: return <Clock3 className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation': return <Plane className="h-4 w-4" />;
      case 'personal': return <User className="h-4 w-4" />;
      case 'sick_leave': return <Heart className="h-4 w-4" />;
      case 'maternity': return <Baby className="h-4 w-4" />;
      case 'paternity': return <Baby className="h-4 w-4" />;
      case 'unpaid': return <Clock className="h-4 w-4" />;
      case 'compensatory': return <Gift className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'vacation': return 'Vacaciones';
      case 'personal': return 'Personal';
      case 'sick_leave': return 'Incapacidad';
      case 'maternity': return 'Maternidad';
      case 'paternity': return 'Paternidad';
      case 'unpaid': return 'Sin goce';
      case 'compensatory': return 'Compensatorio';
      default: return 'Otro';
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

  const filteredRequests = vacationsData?.requests.filter(request => {
    const matchesSearch = request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.startDate.includes(searchTerm) ||
                         request.endDate.includes(searchTerm);
    const matchesFilter = filterType === 'all' || request.status === filterType;
    return matchesSearch && matchesFilter;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de vacaciones...</p>
        </div>
      </div>
    );
  }

  if (!vacationsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró información</h3>
          <p className="text-gray-600">No hay datos de vacaciones disponibles para este empleado.</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Vacaciones</h1>
                <p className="text-gray-600">{vacationsData.employeeName} - {vacationsData.position}</p>
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
                <p className="text-sm font-medium text-gray-600">Días Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{vacationsData.currentBalance.available}</p>
                <p className="text-xs text-gray-500">de {vacationsData.currentBalance.total} días</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Días Usados</p>
                <p className="text-2xl font-bold text-blue-600">{vacationsData.currentBalance.used}</p>
                <p className="text-xs text-gray-500">Este año</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plane className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{vacationsData.currentBalance.pending}</p>
                <p className="text-xs text-gray-500">Por aprobar</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Vacación</p>
                <p className="text-2xl font-bold text-purple-600">{formatDateShort(vacationsData.summary.lastVacation)}</p>
                <p className="text-xs text-gray-500">Fecha</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Sun className="h-6 w-6 text-purple-600" />
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
                { id: 'requests', label: 'Solicitudes', icon: FileText },
                { id: 'history', label: 'Historial', icon: Clock },
                { id: 'calendar', label: 'Calendario', icon: CalendarDays }
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
            {/* Gráficos de tendencias */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Uso de Vacaciones</h4>
                  <VacationsChart 
                    data={vacationsData.history.map(request => ({
                      date: request.startDate,
                      days: request.days,
                      type: request.type,
                      status: request.status
                    }))}
                    type="usage"
                    height={200}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Distribución por Tipo</h4>
                  <VacationsChart 
                    data={vacationsData.history.map(request => ({
                      date: request.startDate,
                      days: request.days,
                      type: request.type,
                      status: request.status
                    }))}
                    type="distribution"
                    height={200}
                  />
                </div>
              </div>
            </div>

            {/* Estadísticas detalladas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Estadísticas de Solicitudes</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Solicitudes</span>
                      <span className="font-medium text-blue-600">{vacationsData.summary.totalRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Aprobadas</span>
                      <span className="font-medium text-green-600">{vacationsData.summary.approvedRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pendientes</span>
                      <span className="font-medium text-yellow-600">{vacationsData.summary.pendingRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rechazadas</span>
                      <span className="font-medium text-red-600">{vacationsData.summary.rejectedRequests}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Política de Vacaciones</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días Anuales</span>
                      <span className="font-medium text-blue-600">{vacationsData.policy.annualDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Acumulación</span>
                      <span className="font-medium text-blue-600">{vacationsData.policy.accrualRate} días/mes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Máximo Acarreo</span>
                      <span className="font-medium text-blue-600">{vacationsData.policy.maxCarryover} días</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Anticipación</span>
                      <span className="font-medium text-blue-600">{vacationsData.policy.advanceRequest} días</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Períodos Restringidos</h4>
                  <div className="space-y-3">
                    {vacationsData.policy.blackoutPeriods.map((period, index) => (
                      <div key={index} className="border-l-4 border-red-200 pl-3">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(period.startDate)} - {formatDate(period.endDate)}
                        </p>
                        <p className="text-xs text-gray-600">{period.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Filtros y botón de nueva solicitud */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Solicitudes de Vacaciones</h3>
                  <button 
                    onClick={() => setShowNewRequest(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Solicitud</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por razón o fecha..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendientes</option>
                      <option value="approved">Aprobadas</option>
                      <option value="rejected">Rechazadas</option>
                      <option value="cancelled">Canceladas</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razón</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{formatDateShort(request.startDate)}</div>
                            <div className="text-gray-500">al {formatDateShort(request.endDate)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(request.type)}
                            <span className="text-sm text-gray-900">{getTypeText(request.type)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.days} día{request.days > 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {request.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateShort(request.requestedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button className="text-green-600 hover:text-green-900">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Vacaciones</h3>
                <div className="space-y-4">
                  {vacationsData.history.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </h4>
                          <p className="text-sm text-gray-600">{request.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{request.days} día{request.days > 1 ? 's' : ''}</p>
                          <p className="text-sm text-gray-500 capitalize">{getTypeText(request.type)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status)}
                          <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                        {request.approvedBy && (
                          <p className="text-sm text-gray-500">
                            Aprobado por: {request.approvedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendario de Vacaciones</h3>
                <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Calendario de vacaciones</p>
                    <p className="text-sm text-gray-500">Se mostrará aquí un calendario interactivo con las vacaciones programadas</p>
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

export { EmployeeVacationsView };
export default EmployeeVacationsView;
