import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  DollarSign, 
  Target, 
  UserPlus, 
  TrendingUp, 
  Shield, 
  Bot,
  Search,
  Calendar,
  Download,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeDetail } from './components/EmployeeDetail';
import { EmployeeDetailView } from './components/EmployeeDetailView';
import { HRDashboard } from './components/HRDashboard';
import { PayrollModule } from './components/PayrollModule';
import { AttendanceModule } from './components/AttendanceModule';
import { VacationModule } from './components/VacationModule';
import { DocumentModule } from './components/DocumentModule';
import { EmployeeSearchModule } from './components/EmployeeSearchModule';
import { OrgChartModule } from './components/OrgChartModule';
import { TalentModule } from './components/TalentModule';
import { RecruitmentModule } from './components/RecruitmentModule';
import { AnalyticsModule } from './components/AnalyticsModule';
import { ComplianceModule } from './components/ComplianceModule';
import { HRCopilot } from './components/HRCopilot';
import { MobileMenuButton } from '../../components/layout/MobileMenuButton';
import { Button } from '../../components/ui/button';
import type { Employee } from '../../types/employee';

const HRModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetail(true);
  };

  const handleBackToEmployeeList = () => {
    setShowEmployeeDetail(false);
    setSelectedEmployee(null);
  };

  const tabs = [
    { id: 'dashboard', name: 'Panorama', icon: BarChart3 },
    { id: 'employees', name: 'Empleados', icon: Users },
    { id: 'search', name: 'Búsqueda', icon: Search },
    { id: 'orgchart', name: 'Organigrama', icon: BarChart3 },
    { id: 'payroll', name: 'Nómina', icon: DollarSign },
    { id: 'attendance', name: 'Asistencia', icon: Calendar },
    { id: 'vacations', name: 'Vacaciones', icon: Calendar },
    { id: 'documents', name: 'Documentos', icon: FileText },
    { id: 'talent', name: 'Talento', icon: Target },
    { id: 'recruitment', name: 'Reclutamiento', icon: UserPlus },
    { id: 'analytics', name: 'Analítica', icon: TrendingUp },
    { id: 'compliance', name: 'Cumplimiento', icon: Shield },
    { id: 'copilot', name: 'Copiloto', icon: Bot },
  ];

  // Manejar resize de ventana
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setSidebarOpen(isDesktop ? sidebarOpen : false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const renderTabContent = () => {
    // Si estamos mostrando la vista de detalle del empleado
    if (showEmployeeDetail && selectedEmployee) {
      return (
        <EmployeeDetailView 
          employee={{
            id: selectedEmployee.id,
            employeeNumber: selectedEmployee.employeeNumber,
            personalInfo: {
              firstName: selectedEmployee.firstName,
              lastName: selectedEmployee.lastName,
              email: selectedEmployee.email,
              phone: selectedEmployee.phone,
              avatar: selectedEmployee.avatar
            },
            position: {
              id: selectedEmployee.position?.id || '',
              title: selectedEmployee.position?.title || '',
              department: selectedEmployee.position?.department || selectedEmployee.department || '',
              level: selectedEmployee.position?.level || selectedEmployee.level || '',
              reportsTo: selectedEmployee.position?.reportsTo || selectedEmployee.reportsTo,
              jobDescription: selectedEmployee.position?.jobDescription || '',
              requirements: selectedEmployee.position?.requirements || [],
              skills: selectedEmployee.position?.skills || [],
              salaryRange: selectedEmployee.position?.salaryRange || { min: 0, max: 0 }
            },
            location: {
              id: selectedEmployee.location?.id || '',
              name: selectedEmployee.location?.name || '',
              address: selectedEmployee.location?.address?.street 
                ? `${selectedEmployee.location.address.street} ${selectedEmployee.location.address.number}, ${selectedEmployee.location.address.neighborhood}, ${selectedEmployee.location.address.city}`
                : '',
              city: selectedEmployee.location?.address?.city || '',
              state: selectedEmployee.location?.address?.state || '',
              country: selectedEmployee.location?.address?.country || '',
              postalCode: selectedEmployee.location?.address?.zipCode || '',
              timezone: selectedEmployee.location?.timezone || '',
              isRemote: selectedEmployee.location?.isRemote || false
            },
            contract: {
              id: selectedEmployee.contract?.id || '',
              type: selectedEmployee.contract?.type || selectedEmployee.contractType || '',
              startDate: new Date(selectedEmployee.contract?.startDate || selectedEmployee.hireDate),
              endDate: selectedEmployee.contract?.endDate,
              workingHours: selectedEmployee.contract?.workingHours || 40,
              workingDays: selectedEmployee.contract?.workingDays || '',
              workingHoursRange: selectedEmployee.contract?.workingHoursRange || '',
              customSchedule: selectedEmployee.contract?.customSchedule || {
                enabled: false,
                days: {
                  lunes: { enabled: true, startTime: '09:00', endTime: '18:00' },
                  martes: { enabled: true, startTime: '09:00', endTime: '18:00' },
                  miercoles: { enabled: true, startTime: '09:00', endTime: '18:00' },
                  jueves: { enabled: true, startTime: '09:00', endTime: '18:00' },
                  viernes: { enabled: true, startTime: '09:00', endTime: '18:00' },
                  sabado: { enabled: false, startTime: '09:00', endTime: '14:00' },
                  domingo: { enabled: false, startTime: '09:00', endTime: '18:00' }
                }
              },
              benefits: selectedEmployee.contract?.benefits || [],
              clauses: selectedEmployee.contract?.clauses || []
            }
          }}
          onBack={handleBackToEmployeeList}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <HRDashboard />;
      case 'employees':
        return selectedEmployee ? (
          <EmployeeDetail 
            employee={selectedEmployee} 
            onBack={() => setSelectedEmployee(null)}
            onEdit={(employee) => setSelectedEmployee(employee)}
          />
        ) : (
          <EmployeeList onSelectEmployee={handleEmployeeSelect} />
        );
      case 'search':
        return <EmployeeSearchModule onEmployeeSelect={(employeeId) => {
          // Cargar empleado y mostrar detalles
          console.log('Empleado seleccionado:', employeeId);
        }} />;
      case 'orgchart':
        return <OrgChartModule onEmployeeSelect={(employeeId) => {
          // Cargar empleado y mostrar detalles
          console.log('Empleado seleccionado desde organigrama:', employeeId);
        }} />;
      case 'payroll':
        return selectedEmployee ? (
          <PayrollModule 
            employeeId={selectedEmployee.id} 
            employeeName={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`} 
          />
        ) : (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Selecciona un empleado para ver su nómina</p>
          </div>
        );
      case 'attendance':
        return selectedEmployee ? (
          <AttendanceModule 
            employeeId={selectedEmployee.id} 
            employeeName={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`} 
          />
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Selecciona un empleado para ver su asistencia</p>
          </div>
        );
      case 'vacations':
        return selectedEmployee ? (
          <VacationModule 
            employeeId={selectedEmployee.id} 
            employeeName={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`} 
          />
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Selecciona un empleado para ver sus vacaciones</p>
          </div>
        );
      case 'documents':
        return selectedEmployee ? (
          <DocumentModule 
            employeeId={selectedEmployee.id} 
            employeeName={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`} 
          />
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Selecciona un empleado para ver sus documentos</p>
          </div>
        );
      case 'talent':
        return <TalentModule />;
      case 'recruitment':
        return <RecruitmentModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'compliance':
        return <ComplianceModule />;
      case 'copilot':
        return <HRCopilot />;
      default:
        return <EmployeeList onSelectEmployee={handleEmployeeSelect} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar izquierdo */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col ${!sidebarOpen ? 'lg:flex' : 'flex'} ${sidebarOpen ? 'fixed lg:relative z-50 lg:z-auto h-full' : 'hidden lg:flex'}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Recursos Humanos</h1>
                <p className="text-sm text-gray-500">Gestión Integral</p>
              </div>
            )}
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Cerrar sidebar en móvil después de seleccionar
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'space-x-3 px-3' : 'justify-center px-2'} py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={!sidebarOpen ? tab.name : undefined}
              >
                <IconComponent className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="flex-1 truncate">{tab.name}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'} p-2`}>
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Admin RH</p>
                  <p className="text-xs text-gray-500">admin@empresa.com</p>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header móvil */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MobileMenuButton />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button
                onClick={() => setLeftPanelOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Bot className="h-4 w-4" />
                <span>Copiloto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Header superior */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              {activeTab === 'employees' && !selectedEmployee && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">247 activos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">3 pendientes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">1 vencido</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Filtros rápidos */}
              {activeTab === 'dashboard' && (
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <Calendar className="h-4 w-4" />
                    <span>Últimos 30 días</span>
                  </button>
                </div>
              )}

              {/* Búsqueda global */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar empleados, nómina, documentos..."
                  className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* Acciones rápidas */}
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                </button>
                <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setLeftPanelOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Bot className="h-4 w-4" />
                  <span>Copiloto IA</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del tab activo */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-4 md:p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Overlay para el panel del copiloto en móvil */}
      {leftPanelOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setLeftPanelOpen(false)}
        />
      )}

      {/* Panel izquierdo del Copiloto */}
      {leftPanelOpen && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full fixed lg:relative right-0 top-0 z-50 lg:z-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Copiloto RH</h2>
            <button
              onClick={() => setLeftPanelOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <HRCopilot />
          </div>
        </div>
      )}
    </div>
  );
};

export default HRModule;