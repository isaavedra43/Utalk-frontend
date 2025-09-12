import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  User,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

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
  status: string;
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
  
  // Validación básica
  if (!employee) {
    console.error('❌ No se recibió empleado');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertTriangle className="h-5 w-5 text-red-400 mx-auto mb-2" />
          <p className="text-red-700">Error: No se encontraron datos del empleado</p>
          <button onClick={onBack} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Fecha no válida';
      }
      return dateObj.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha no válida';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    try {
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    } catch (error) {
      console.error('Error obteniendo iniciales:', error);
      return 'NN';
    }
  };

  const tabs = [
    { id: 'summary' as TabType, label: 'Resumen', icon: User },
    { id: 'payroll' as TabType, label: 'Nómina', icon: DollarSign },
    { id: 'attendance' as TabType, label: 'Asistencia', icon: Calendar },
    { id: 'vacations' as TabType, label: 'Vacaciones', icon: Calendar },
    { id: 'documents' as TabType, label: 'Documentos', icon: User },
    { id: 'incidents' as TabType, label: 'Incidentes', icon: AlertTriangle },
    { id: 'evaluations' as TabType, label: 'Evaluaciones', icon: User },
    { id: 'skills' as TabType, label: 'Habilidades', icon: User },
    { id: 'history' as TabType, label: 'Historial', icon: User }
  ];

  const renderTabContent = () => {
    console.log('🎯 Renderizando contenido de tab:', activeTab);
    
    if (activeTab === 'summary') {
      return (
        <div className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.personalInfo?.firstName || 'N/A'} {employee.personalInfo?.lastName || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.personalInfo?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.personalInfo?.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Número de Empleado</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.employeeNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información Laboral */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Puesto</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.position?.title || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Departamento</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.position?.department || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nivel</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.position?.level || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Estado</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.status || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Contrato */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contrato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tipo de Contrato</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.contract?.type || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Fecha de Inicio</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.contract?.startDate ? formatDate(employee.contract.startDate) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Para otros tabs, mostrar mensaje temporal
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <User className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-blue-800">Módulo en Desarrollo</h3>
            <p className="text-blue-600 mt-1">
              El módulo de {tabs.find(tab => tab.id === activeTab)?.label} estará disponible próximamente.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {employee.personalInfo?.avatar ? (
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={employee.personalInfo.avatar}
                      alt={`${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-medium">
                      {getInitials(employee.personalInfo?.firstName || '', employee.personalInfo?.lastName || '')}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {employee.personalInfo?.firstName || 'N/A'} {employee.personalInfo?.lastName || 'N/A'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {employee.position?.title || 'N/A'} • {employee.position?.department || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Edit className="w-4 h-4 mr-2" />
                Editar
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
                    className={`
                      flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export { EmployeeDetailView };
export default EmployeeDetailView;