import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit, 
  MoreHorizontal,
  User,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  AlertTriangle,
  Star,
  Award,
  History
} from 'lucide-react';
import EmployeePayrollView from './EmployeePayrollView';
import EmployeeAttendanceView from './EmployeeAttendanceView';
import EmployeeVacationsView from './EmployeeVacationsView';
import EmployeeDocumentsView from './EmployeeDocumentsView';
import EmployeeIncidentsView from './EmployeeIncidentsView';
import EmployeeEvaluationsView from './EmployeeEvaluationsView';
import EmployeeSkillsView from './EmployeeSkillsView';
import EmployeeHistoryView from './EmployeeHistoryView';
// import EditEmployeeModal from './EditEmployeeModal'; // Temporalmente comentado

// Error Boundary para manejar errores en componentes
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('❌ ErrorBoundary capturó error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error completo capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <User className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-blue-800 mb-1">Módulo en Desarrollo</h3>
            <p className="text-blue-600 text-sm">
              Esta sección estará disponible próximamente. Actualmente no hay datos para mostrar.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface Employee {
  id: string;
  employeeNumber: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    avatar?: string;
  };
  position: {
    title: string;
    department: string;
    level: string;
    reportsTo?: string;
  };
  location: {
    office: string;
    address: string;
  };
  contract: {
    startDate: string | Date;
    type: string;
  };
}

interface EmployeeDetailViewProps {
  employee: Employee;
  onBack: () => void;
}

type TabType = 'summary' | 'payroll' | 'attendance' | 'vacations' | 'documents' | 'incidents' | 'evaluations' | 'skills' | 'history';

const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({ 
  employee, 
  onBack 
}) => {
  console.log('🚀 EmployeeDetailView iniciando con empleado:', employee);
  
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(employee);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const tabs = [
    { id: 'summary' as TabType, label: 'Resumen', icon: User },
    { id: 'payroll' as TabType, label: 'Nómina', icon: DollarSign },
    { id: 'attendance' as TabType, label: 'Asistencia', icon: Clock },
    { id: 'vacations' as TabType, label: 'Vacaciones', icon: Calendar },
    { id: 'documents' as TabType, label: 'Documentos', icon: FileText },
    { id: 'incidents' as TabType, label: 'Incidentes', icon: AlertTriangle },
    { id: 'evaluations' as TabType, label: 'Evaluaciones', icon: Star },
    { id: 'skills' as TabType, label: 'Habilidades', icon: Award },
    { id: 'history' as TabType, label: 'Historial', icon: History }
  ];

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Fecha no válida';
    }
    return dateObj.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Validar datos del empleado
  if (!currentEmployee || !currentEmployee.id) {
    console.error('❌ Datos del empleado inválidos:', currentEmployee);
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-lg font-medium text-red-800">Datos del empleado no válidos</h3>
            </div>
            <p className="mt-2 text-sm text-red-700">
              No se pudieron cargar los datos del empleado correctamente.
            </p>
            <div className="mt-4">
              <button
                onClick={onBack}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Volver a la lista
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    console.log('🎯 Renderizando contenido de tab:', activeTab);
    console.log('👤 Datos del empleado:', currentEmployee);
    
    switch (activeTab) {
      case 'payroll':
        return (
          <ErrorBoundary fallback={
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <DollarSign className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-blue-800 mb-1">Nómina</h3>
                <p className="text-blue-600 text-sm">No hay información de nómina disponible para este empleado.</p>
              </div>
            </div>
          }>
            <EmployeePayrollView employeeId={currentEmployee.id} onBack={onBack} />
          </ErrorBoundary>
        );
      case 'attendance':
        return (
          <ErrorBoundary fallback={
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-blue-800 mb-1">Asistencia</h3>
                <p className="text-blue-600 text-sm">No hay información de asistencia disponible para este empleado.</p>
              </div>
            </div>
          }>
            <EmployeeAttendanceView employeeId={currentEmployee.id} onBack={onBack} />
          </ErrorBoundary>
        );
      case 'vacations':
        return (
          <ErrorBoundary fallback={
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-blue-800 mb-1">Vacaciones</h3>
                <p className="text-blue-600 text-sm">No hay información de vacaciones disponible para este empleado.</p>
              </div>
            </div>
          }>
            <EmployeeVacationsView employeeId={currentEmployee.id} onBack={onBack} />
          </ErrorBoundary>
        );
      case 'documents':
        return (
          <ErrorBoundary fallback={
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-blue-800 mb-1">Documentos</h3>
                <p className="text-blue-600 text-sm">No hay documentos disponibles para este empleado.</p>
              </div>
            </div>
          }>
            <EmployeeDocumentsView employeeId={currentEmployee.id} onBack={onBack} />
          </ErrorBoundary>
        );
      case 'incidents':
        return (
          <ErrorBoundary fallback={
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-blue-800 mb-1">Incidentes</h3>
                <p className="text-blue-600 text-sm">No hay incidentes registrados para este empleado.</p>
              </div>
            </div>
          }>
            <EmployeeIncidentsView employeeId={currentEmployee.id} onBack={onBack} />
          </ErrorBoundary>
        );
      case 'evaluations':
        return (
          <ErrorBoundary fallback={
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Star className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-blue-800 mb-1">Evaluaciones</h3>
                <p className="text-blue-600 text-sm">No hay evaluaciones disponibles para este empleado.</p>
              </div>
            </div>
          }>
            <EmployeeEvaluationsView employeeId={currentEmployee.id} onBack={onBack} />
          </ErrorBoundary>
        );
      case 'skills':
        return (
          <ErrorBoundary fallback={
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Award className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-blue-800 mb-1">Habilidades</h3>
                <p className="text-blue-600 text-sm">No hay habilidades registradas para este empleado.</p>
              </div>
            </div>
          }>
            <EmployeeSkillsView employeeId={currentEmployee.id} onBack={onBack} />
          </ErrorBoundary>
        );
      case 'history':
        return (
          <ErrorBoundary fallback={
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <History className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-blue-800 mb-1">Historial</h3>
                <p className="text-blue-600 text-sm">No hay historial disponible para este empleado.</p>
              </div>
            </div>
          }>
            <EmployeeHistoryView employeeId={currentEmployee.id} onBack={onBack} />
          </ErrorBoundary>
        );
      case 'summary':
      default:
        return (
          <div className="space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
                    <p className="text-gray-900">{currentEmployee.personalInfo.firstName} {currentEmployee.personalInfo.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Número de Empleado</label>
                    <p className="text-gray-900">{currentEmployee.employeeNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                    <p className="text-gray-900">{currentEmployee.personalInfo.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <p className="text-gray-900">{currentEmployee.personalInfo.email || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Laboral */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Puesto</label>
                    <p className="text-gray-900">{currentEmployee.position.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Departamento</label>
                    <p className="text-gray-900">{currentEmployee.position.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nivel</label>
                    <p className="text-gray-900">{currentEmployee.position.level}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Reporta a</label>
                    <p className="text-gray-900">{currentEmployee.position.reportsTo || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Ubicación */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Oficina</label>
                    <p className="text-gray-900">{currentEmployee.location.office}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Dirección</label>
                    <p className="text-gray-900">{currentEmployee.location.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Contrato */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contrato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Ingreso</label>
                    <p className="text-gray-900">{formatDate(currentEmployee.contract.startDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Contrato</label>
                    <p className="text-gray-900">{currentEmployee.contract.type}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Employee Profile Card */}
            <div className="flex items-center space-x-6 mb-6">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {currentEmployee.personalInfo.avatar ? (
                    <img
                      src={currentEmployee.personalInfo.avatar}
                      alt={`${currentEmployee.personalInfo.firstName} ${currentEmployee.personalInfo.lastName}`}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {getInitials(currentEmployee.personalInfo.firstName, currentEmployee.personalInfo.lastName)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentEmployee.personalInfo.firstName} {currentEmployee.personalInfo.lastName}
                  </h1>
                  <p className="text-lg text-gray-600">{currentEmployee.position.title}</p>
                  
                  <div className="flex items-center space-x-6 mt-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>{currentEmployee.position.department}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{currentEmployee.location.office}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Ingreso: {formatDate(currentEmployee.contract.startDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 ml-auto">
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>Compartir</span>
                </button>
                <button 
                  onClick={handleEditClick}
                  className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent(        )}
      </div>

      {/* Modal de Edición */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Empleado</h3>
            <p className="text-gray-600 mb-4">Esta funcionalidad estará disponible próximamente.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { EmployeeDetailView };
export default EmployeeDetailView;
