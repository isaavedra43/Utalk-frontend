import React, { useState } from 'react';
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
  LogOut
} from 'lucide-react';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeDetail } from './components/EmployeeDetail';
import { HRDashboard } from './components/HRDashboard';
import { PayrollModule } from './components/PayrollModule';
import { TalentModule } from './components/TalentModule';
import { RecruitmentModule } from './components/RecruitmentModule';
import { AnalyticsModule } from './components/AnalyticsModule';
import { ComplianceModule } from './components/ComplianceModule';
import { HRCopilot } from './components/HRCopilot';
import type { Employee } from '../../types/hr';

const HRModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', name: 'Panorama', icon: BarChart3 },
    { id: 'employees', name: 'Empleados', icon: Users },
    { id: 'payroll', name: 'Nómina', icon: DollarSign },
    { id: 'talent', name: 'Talento', icon: Target },
    { id: 'recruitment', name: 'Reclutamiento', icon: UserPlus },
    { id: 'analytics', name: 'Analítica', icon: TrendingUp },
    { id: 'compliance', name: 'Cumplimiento', icon: Shield },
    { id: 'copilot', name: 'Copiloto', icon: Bot },
  ];

  const renderTabContent = () => {
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
          <EmployeeList onSelectEmployee={setSelectedEmployee} />
        );
      case 'payroll':
        return <PayrollModule />;
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
        return <EmployeeList onSelectEmployee={setSelectedEmployee} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar izquierdo */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Recursos Humanos</h1>
              <p className="text-sm text-gray-500">Gestión Integral</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin RH</p>
              <p className="text-xs text-gray-500">admin@empresa.com</p>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header superior */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
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

      {/* Panel izquierdo del Copiloto */}
      {leftPanelOpen && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
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