import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Download,
  Share,
  MoreHorizontal,
  User,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Award,
  BookOpen,
  History,
  Plus,
  Eye,
  Send
} from 'lucide-react';
import type { Employee } from '../../../types/hr';

interface EmployeeDetailProps {
  employee: Employee;
  onBack: () => void;
  onEdit: (employee: Employee) => void;
}

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({
  employee,
  onBack,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState('resumen');

  const tabs = [
    { id: 'resumen', name: 'Resumen', icon: User },
    { id: 'nomina', name: 'Nómina', icon: DollarSign },
    { id: 'asistencia', name: 'Asistencia', icon: Clock },
    { id: 'vacaciones', name: 'Vacaciones', icon: Calendar },
    { id: 'documentos', name: 'Documentos', icon: FileText },
    { id: 'incidentes', name: 'Incidentes', icon: AlertTriangle },
    { id: 'evaluaciones', name: 'Evaluaciones', icon: Star },
    { id: 'habilidades', name: 'Habilidades', icon: Award },
    { id: 'historial', name: 'Historial', icon: History },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumen':
        return <ResumenTab employee={employee} />;
      case 'nomina':
        return <NominaTab employee={employee} />;
      case 'asistencia':
        return <AsistenciaTab employee={employee} />;
      case 'vacaciones':
        return <VacacionesTab employee={employee} />;
      case 'documentos':
        return <DocumentosTab employee={employee} />;
      case 'incidentes':
        return <IncidentesTab employee={employee} />;
      case 'evaluaciones':
        return <EvaluacionesTab employee={employee} />;
      case 'habilidades':
        return <HabilidadesTab employee={employee} />;
      case 'historial':
        return <HistorialTab employee={employee} />;
      default:
        return <ResumenTab employee={employee} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del empleado */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
              </span>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-lg text-gray-600">{employee.position.title}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Building2 className="h-4 w-4" />
                  <span>{employee.position.department}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{employee.location.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Ingreso: {formatDate(employee.hireDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Share className="h-4 w-4" />
              <span>Compartir</span>
            </button>
            <button
              onClick={() => onEdit(employee)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegación de tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenido del tab activo */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Componentes de tabs
const ResumenTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Sueldo Base</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(employee.salary.baseSalary)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">SBC</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(employee.sbc)}</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Saldo Vacaciones</p>
              <p className="text-2xl font-bold text-purple-900">{employee.vacationBalance} días</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Score Desempeño</p>
              <p className="text-2xl font-bold text-yellow-900">{employee.metrics.performanceScore}/5</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Información detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">RFC:</span>
              <span className="text-sm font-medium text-gray-900">{employee.personalInfo.rfc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">CURP:</span>
              <span className="text-sm font-medium text-gray-900">{employee.personalInfo.curp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">NSS:</span>
              <span className="text-sm font-medium text-gray-900">{employee.personalInfo.nss}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fecha de nacimiento:</span>
              <span className="text-sm font-medium text-gray-900">
                {employee.personalInfo.birthDate.toLocaleDateString('es-MX')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Estado civil:</span>
              <span className="text-sm font-medium text-gray-900">
                {employee.personalInfo.maritalStatus === 'single' ? 'Soltero' : 
                 employee.personalInfo.maritalStatus === 'married' ? 'Casado' : 'Otro'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Puesto:</span>
              <span className="text-sm font-medium text-gray-900">{employee.position.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Departamento:</span>
              <span className="text-sm font-medium text-gray-900">{employee.position.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Nivel:</span>
              <span className="text-sm font-medium text-gray-900">{employee.position.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Reporta a:</span>
              <span className="text-sm font-medium text-gray-900">{employee.position.reportsTo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tipo de contrato:</span>
              <span className="text-sm font-medium text-gray-900">
                {employee.contract.type === 'permanent' ? 'Permanente' : 'Temporal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Plus className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Registrar Falta</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Clock className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Horas Extra</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <FileText className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">Subir Documento</span>
          </button>
          <button className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Star className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-900">Crear Evaluación</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const NominaTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Información de Nómina</h3>
        <p className="text-gray-600">Últimos periodos, percepciones, deducciones y recibos PDF</p>
      </div>
    </div>
  );
};

const AsistenciaTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Registro de Asistencia</h3>
        <p className="text-gray-600">Calendario mensual, faltas, retardos e incapacidades</p>
      </div>
    </div>
  );
};

const VacacionesTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Vacaciones</h3>
        <p className="text-gray-600">Saldo por antigüedad, historial y solicitudes</p>
      </div>
    </div>
  );
};

const DocumentosTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Documentos del Empleado</h3>
        <p className="text-gray-600">Tipos, folios, vencimientos y verificación OCR</p>
      </div>
    </div>
  );
};

const IncidentesTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Registro de Incidentes</h3>
        <p className="text-gray-600">Accidentes, amonestaciones y reconocimientos</p>
      </div>
    </div>
  );
};

const EvaluacionesTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluaciones de Desempeño</h3>
        <p className="text-gray-600">360°, OKR, 9-Box y planes de desarrollo</p>
      </div>
    </div>
  );
};

const HabilidadesTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Matriz de Habilidades</h3>
        <p className="text-gray-600">Skills vs puesto, gaps y cursos sugeridos</p>
      </div>
    </div>
  );
};

const HistorialTab: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Historial y Auditoría</h3>
        <p className="text-gray-600">Quién, qué, cuándo, antes/después, IP y timestamp</p>
      </div>
    </div>
  );
};
