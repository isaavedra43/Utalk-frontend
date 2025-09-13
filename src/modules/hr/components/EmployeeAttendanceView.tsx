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
  Plus
} from 'lucide-react';
import AttendanceChart from './AttendanceChart';
import EmployeeExtrasModal from './EmployeeExtrasModal';
import EmployeeMovementsTable from './EmployeeMovementsTable';

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: number;
  overtimeHours: number;
  status: 'present' | 'late' | 'absent' | 'half_day' | 'vacation' | 'sick_leave';
  notes?: string;
  location: 'office' | 'remote' | 'field';
}

interface OvertimeRecord {
  id: string;
  date: string;
  hours: number;
  type: 'regular' | 'double' | 'triple' | 'holiday';
  reason: string;
  approved: boolean;
  approvedBy?: string;
  approvedDate?: string;
}

interface AbsenceRecord {
  id: string;
  date: string;
  type: 'sick_leave' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
  reason: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: string;
  approvedBy?: string;
}

interface EmployeeAttendanceData {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  currentPeriod: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalHours: number;
    overtimeHours: number;
    averageHours: number;
  };
  attendance: AttendanceRecord[];
  overtime: OvertimeRecord[];
  absences: AbsenceRecord[];
  summary: {
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalOvertime: number;
    totalVacationDays: number;
    totalSickDays: number;
    punctualityScore: number;
    attendanceScore: number;
  };
}

interface EmployeeAttendanceViewProps {
  employeeId: string;
  employee: any; // Agregamos el empleado como prop
  onBack: () => void;
}

const EmployeeAttendanceView: React.FC<EmployeeAttendanceViewProps> = ({ 
  employeeId, 
  employee,
  onBack 
}) => {
  const [attendanceData, setAttendanceData] = useState<EmployeeAttendanceData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'overtime' | 'absences' | 'extras'>('overview');
  const [isExtrasModalOpen, setIsExtrasModalOpen] = useState(false);
  const [extrasData, setExtrasData] = useState<any[]>([]);

  // Función para manejar el registro de extras
  const handleExtrasSubmit = (data: any) => {
    console.log('📝 Registrando extra:', data);
    
    // Generar ID único
    const newExtra = {
      ...data,
      id: `EXT-${Date.now()}`,
      employeeId: employeeId,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user' // Aquí iría el usuario actual
    };
    
    // Agregar a la lista de extras
    setExtrasData(prev => [newExtra, ...prev]);
    
    // Aquí harías la llamada al API para guardar
    // await saveEmployeeExtra(employeeId, newExtra);
    
    console.log('✅ Extra registrado exitosamente');
  };

  // Simular datos de asistencia
  useEffect(() => {
    const mockAttendanceData: EmployeeAttendanceData = {
      employeeId: 'EMP241001',
      employeeName: 'Ana García',
      position: 'Gerente de Marketing',
      department: 'Marketing',
      currentPeriod: {
        totalDays: 22,
        presentDays: 20,
        absentDays: 1,
        lateDays: 1,
        totalHours: 160,
        overtimeHours: 12,
        averageHours: 8.0
      },
      attendance: [
        {
          id: '1',
          date: '2024-01-15',
          checkIn: '09:00',
          checkOut: '18:30',
          totalHours: 8.5,
          overtimeHours: 0.5,
          status: 'present',
          location: 'office'
        },
        {
          id: '2',
          date: '2024-01-16',
          checkIn: '09:15',
          checkOut: '18:00',
          totalHours: 8.0,
          overtimeHours: 0,
          status: 'late',
          notes: 'Tráfico pesado',
          location: 'office'
        },
        {
          id: '3',
          date: '2024-01-17',
          checkIn: '08:45',
          checkOut: '19:00',
          totalHours: 9.25,
          overtimeHours: 1.25,
          status: 'present',
          location: 'office'
        },
        {
          id: '4',
          date: '2024-01-18',
          checkIn: '09:00',
          checkOut: '18:00',
          totalHours: 8.0,
          overtimeHours: 0,
          status: 'present',
          location: 'remote'
        },
        {
          id: '5',
          date: '2024-01-19',
          checkIn: '09:00',
          checkOut: '18:00',
          totalHours: 8.0,
          overtimeHours: 0,
          status: 'present',
          location: 'office'
        }
      ],
      overtime: [
        {
          id: '1',
          date: '2024-01-15',
          hours: 0.5,
          type: 'regular',
          reason: 'Reunión con cliente',
          approved: true,
          approvedBy: 'Juan Pérez',
          approvedDate: '2024-01-16'
        },
        {
          id: '2',
          date: '2024-01-17',
          hours: 1.25,
          type: 'regular',
          reason: 'Finalización de proyecto',
          approved: true,
          approvedBy: 'Juan Pérez',
          approvedDate: '2024-01-18'
        }
      ],
      absences: [
        {
          id: '1',
          date: '2024-01-20',
          type: 'sick_leave',
          reason: 'Gripe',
          days: 1,
          status: 'approved',
          requestedDate: '2024-01-19',
          approvedBy: 'Juan Pérez'
        }
      ],
      summary: {
        totalPresent: 20,
        totalAbsent: 1,
        totalLate: 1,
        totalOvertime: 12,
        totalVacationDays: 0,
        totalSickDays: 1,
        punctualityScore: 95,
        attendanceScore: 91
      }
    };

    setTimeout(() => {
      setAttendanceData(mockAttendanceData);
      setLoading(false);
    }, 1000);
  }, [employeeId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'half_day': return 'bg-blue-100 text-blue-800';
      case 'vacation': return 'bg-purple-100 text-purple-800';
      case 'sick_leave': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'Presente';
      case 'late': return 'Tardanza';
      case 'absent': return 'Ausente';
      case 'half_day': return 'Medio día';
      case 'vacation': return 'Vacaciones';
      case 'sick_leave': return 'Incapacidad';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'late': return <AlertTriangle className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      case 'half_day': return <Clock className="h-4 w-4" />;
      case 'vacation': return <Plane className="h-4 w-4" />;
      case 'sick_leave': return <Heart className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'office': return <Building className="h-4 w-4" />;
      case 'remote': return <Home className="h-4 w-4" />;
      case 'field': return <Car className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const filteredAttendance = attendanceData?.attendance.filter(record => {
    const matchesSearch = record.date.includes(searchTerm) || 
                         record.status.includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || record.status === filterType;
    return matchesSearch && matchesFilter;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de asistencia...</p>
        </div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró información</h3>
          <p className="text-gray-600">No hay datos de asistencia disponibles para este empleado.</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Extras y Asistencia</h1>
                <p className="text-gray-600">{attendanceData.employeeName} - {attendanceData.position}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Compartir</span>
              </button>
              <button 
                onClick={() => setIsExtrasModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Registrar Extra</span>
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
                <p className="text-sm font-medium text-gray-600">Días Presentes</p>
                <p className="text-2xl font-bold text-green-600">{attendanceData.currentPeriod.presentDays}</p>
                <p className="text-xs text-gray-500">de {attendanceData.currentPeriod.totalDays} días</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Totales</p>
                <p className="text-2xl font-bold text-blue-600">{attendanceData.currentPeriod.totalHours}h</p>
                <p className="text-xs text-gray-500">Promedio: {attendanceData.currentPeriod.averageHours}h/día</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Timer className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Extra</p>
                <p className="text-2xl font-bold text-orange-600">{attendanceData.currentPeriod.overtimeHours}h</p>
                <p className="text-xs text-gray-500">Este período</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Puntualidad</p>
                <p className="text-2xl font-bold text-purple-600">{attendanceData.summary.punctualityScore}%</p>
                <p className="text-xs text-gray-500">Score general</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
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
                { id: 'attendance', label: 'Asistencia', icon: CalendarDays },
                { id: 'overtime', label: 'Horas Extra', icon: Zap },
                { id: 'absences', label: 'Ausencias', icon: UserX },
                { id: 'extras', label: 'Extras', icon: Plus }
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
                  <h4 className="font-medium text-gray-900 mb-4">Tendencia de Asistencia</h4>
                  <AttendanceChart 
                    data={attendanceData.attendance.map(record => ({
                      date: record.date,
                      present: record.status === 'present' ? 1 : 0,
                      late: record.status === 'late' ? 1 : 0,
                      absent: record.status === 'absent' ? 1 : 0,
                      hours: record.totalHours
                    }))}
                    type="attendance"
                    height={200}
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Distribución de Horas</h4>
                  <AttendanceChart 
                    data={attendanceData.attendance.map(record => ({
                      date: record.date,
                      regular: record.totalHours - record.overtimeHours,
                      overtime: record.overtimeHours
                    }))}
                    type="hours"
                    height={200}
                  />
                </div>
              </div>
            </div>

            {/* Estadísticas detalladas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Estadísticas de Asistencia</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días Presentes</span>
                      <span className="font-medium text-green-600">{attendanceData.summary.totalPresent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días Ausentes</span>
                      <span className="font-medium text-red-600">{attendanceData.summary.totalAbsent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tardanzas</span>
                      <span className="font-medium text-yellow-600">{attendanceData.summary.totalLate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Score de Asistencia</span>
                      <span className="font-medium text-blue-600">{attendanceData.summary.attendanceScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Horas Extra</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Horas Extra</span>
                      <span className="font-medium text-orange-600">{attendanceData.summary.totalOvertime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Promedio por Día</span>
                      <span className="font-medium text-orange-600">{(attendanceData.summary.totalOvertime / attendanceData.currentPeriod.totalDays).toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días con Extra</span>
                      <span className="font-medium text-orange-600">{attendanceData.overtime.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Ausencias</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días de Vacaciones</span>
                      <span className="font-medium text-purple-600">{attendanceData.summary.totalVacationDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días de Enfermedad</span>
                      <span className="font-medium text-orange-600">{attendanceData.summary.totalSickDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Ausencias</span>
                      <span className="font-medium text-red-600">{attendanceData.summary.totalAbsent}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Registro de Asistencia</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por fecha..."
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
                        <option value="present">Presente</option>
                        <option value="late">Tardanza</option>
                        <option value="absent">Ausente</option>
                        <option value="half_day">Medio día</option>
                        <option value="vacation">Vacaciones</option>
                        <option value="sick_leave">Incapacidad</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAttendance.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(record.status)}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                              {getStatusText(record.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.checkIn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.checkOut}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.totalHours}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.overtimeHours > 0 ? (
                            <span className="text-orange-600 font-medium">+{record.overtimeHours}h</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {getLocationIcon(record.location)}
                            <span className="text-sm text-gray-600 capitalize">{record.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overtime' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro de Horas Extra</h3>
                <div className="space-y-4">
                  {attendanceData.overtime.map((overtime) => (
                    <div key={overtime.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{formatDate(overtime.date)}</h4>
                          <p className="text-sm text-gray-600">{overtime.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">+{overtime.hours}h</p>
                          <p className="text-sm text-gray-500 capitalize">{overtime.type}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {overtime.approved ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            overtime.approved ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {overtime.approved ? 'Aprobado' : 'Pendiente'}
                          </span>
                        </div>
                        {overtime.approvedBy && (
                          <p className="text-sm text-gray-500">
                            Por: {overtime.approvedBy}
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

        {activeTab === 'absences' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro de Ausencias</h3>
                <div className="space-y-4">
                  {attendanceData.absences.map((absence) => (
                    <div key={absence.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{formatDate(absence.date)}</h4>
                          <p className="text-sm text-gray-600">{absence.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{absence.days} día{absence.days > 1 ? 's' : ''}</p>
                          <p className="text-sm text-gray-500 capitalize">{absence.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {absence.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {absence.status === 'pending' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          {absence.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                          <span className={`text-sm font-medium ${
                            absence.status === 'approved' ? 'text-green-600' :
                            absence.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {absence.status === 'approved' ? 'Aprobado' :
                             absence.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                          </span>
                        </div>
                        {absence.approvedBy && (
                          <p className="text-sm text-gray-500">
                            Por: {absence.approvedBy}
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

        {/* Pestaña de Extras - Tabla General de Movimientos */}
        {activeTab === 'extras' && (
          <EmployeeMovementsTable
            employeeId={employeeId}
            employee={employee}
            onAddMovement={() => setIsExtrasModalOpen(true)}
          />
        )}
      </div>

      {/* Modal de Extras */}
      <EmployeeExtrasModal
        isOpen={isExtrasModalOpen}
        onClose={() => setIsExtrasModalOpen(false)}
        onSubmit={handleExtrasSubmit}
        employeeId={employeeId}
        employeeSalary={25000} // Aquí iría el salario real del empleado
        employeeName={attendanceData?.employeeName || 'Empleado'}
      />
    </div>
  );
};

export { EmployeeAttendanceView };
export default EmployeeAttendanceView;
