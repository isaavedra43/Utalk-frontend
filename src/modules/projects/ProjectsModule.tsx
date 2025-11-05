import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search,
  Filter,
  Settings,
  Calendar,
  Users,
  Target,
  Menu,
  LayoutDashboard,
  ListTodo,
  GanttChart,
  DollarSign,
  Package,
  FileText,
  ShieldCheck,
  AlertTriangle,
  BarChart3,
  Layers
} from 'lucide-react';
import { useMobileMenuContext } from '../../contexts/MobileMenuContext';

type TabType = 
  | 'dashboard'
  | 'tasks'
  | 'timeline'
  | 'budget'
  | 'team'
  | 'materials'
  | 'documents'
  | 'quality'
  | 'risks'
  | 'reports';

const ProjectsModule = () => {
  const { openMenu } = useMobileMenuContext();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showProjectsList, setShowProjectsList] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as TabType, label: 'Tareas', icon: ListTodo },
    { id: 'timeline' as TabType, label: 'Timeline', icon: GanttChart },
    { id: 'budget' as TabType, label: 'Presupuesto', icon: DollarSign },
    { id: 'team' as TabType, label: 'Equipo', icon: Users },
    { id: 'materials' as TabType, label: 'Materiales', icon: Package },
    { id: 'documents' as TabType, label: 'Documentos', icon: FileText },
    { id: 'quality' as TabType, label: 'Calidad', icon: ShieldCheck },
    { id: 'risks' as TabType, label: 'Riesgos', icon: AlertTriangle },
    { id: 'reports' as TabType, label: 'Reportes', icon: BarChart3 },
  ];

  const renderTabContent = () => {
    // Contenido placeholder para cada tab
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              {tabs.find(t => t.id === activeTab)?.icon && 
                React.createElement(tabs.find(t => t.id === activeTab)!.icon, { 
                  className: "w-10 h-10 text-white" 
                })
              }
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          
          <p className="text-gray-600 mb-6">
            Esta sección está en desarrollo. Incluirá todas las funcionalidades avanzadas de gestión de proyectos.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">Características planificadas:</p>
            <ul className="text-left space-y-1">
              {activeTab === 'dashboard' && (
                <>
                  <li>• KPIs del proyecto en tiempo real</li>
                  <li>• Timeline Gantt compacto</li>
                  <li>• Gráficos de presupuesto y progreso</li>
                  <li>• Alertas y tareas críticas</li>
                </>
              )}
              {activeTab === 'tasks' && (
                <>
                  <li>• Múltiples vistas (Tabla, Kanban, Lista, Calendario)</li>
                  <li>• Dependencias entre tareas</li>
                  <li>• Asignaciones y seguimiento</li>
                  <li>• Ruta crítica automática</li>
                </>
              )}
              {activeTab === 'timeline' && (
                <>
                  <li>• Diagrama de Gantt interactivo</li>
                  <li>• Gestión de fases y milestones</li>
                  <li>• Baseline y varianza</li>
                  <li>• Predicción de fechas con IA</li>
                </>
              )}
              {activeTab === 'budget' && (
                <>
                  <li>• Presupuesto multi-nivel</li>
                  <li>• Control de gastos en tiempo real</li>
                  <li>• Proyecciones y forecast</li>
                  <li>• Facturación integrada</li>
                </>
              )}
              {activeTab === 'team' && (
                <>
                  <li>• Integración con módulo HR</li>
                  <li>• Disponibilidad y workload</li>
                  <li>• Time tracking</li>
                  <li>• Sugerencias de asignación (IA)</li>
                </>
              )}
              {activeTab === 'materials' && (
                <>
                  <li>• Integración con inventario y proveedores</li>
                  <li>• Solicitudes y órdenes de compra</li>
                  <li>• Control de entregas</li>
                  <li>• Tracking de desperdicios</li>
                </>
              )}
              {activeTab === 'documents' && (
                <>
                  <li>• Gestión documental completa</li>
                  <li>• Versionamiento automático</li>
                  <li>• Colaboración y comentarios</li>
                  <li>• Flujos de aprobación</li>
                </>
              )}
              {activeTab === 'quality' && (
                <>
                  <li>• Programación de inspecciones</li>
                  <li>• No conformidades</li>
                  <li>• Acciones correctivas</li>
                  <li>• Auditorías y estándares</li>
                </>
              )}
              {activeTab === 'risks' && (
                <>
                  <li>• Matriz de riesgos</li>
                  <li>• Planes de mitigación</li>
                  <li>• Análisis y tendencias</li>
                  <li>• Predicciones con IA</li>
                </>
              )}
              {activeTab === 'reports' && (
                <>
                  <li>• Dashboards personalizables</li>
                  <li>• Reportes automáticos</li>
                  <li>• Exportación múltiples formatos</li>
                  <li>• Analíticas predictivas</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar de proyectos - Desktop */}
      {showProjectsList && (
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Proyectos</h2>
                </div>
                <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                  <Plus className="w-5 h-5 text-blue-600" />
                </button>
              </div>
              
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Lista de proyectos placeholder */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="text-center py-12">
                <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No hay proyectos aún</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Crear Primer Proyecto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header móvil */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={openMenu}
              className="flex items-center justify-center p-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 rounded-xl shadow-sm hover:from-gray-100 hover:to-gray-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg"
              title="Abrir menú de módulos"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Proyectos</h1>
          </div>
        </div>

        {selectedProjectId ? (
          <>
            {/* Tabs de navegación */}
            <div className="bg-white border-b border-gray-200 px-4">
              <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido del tab */}
            <div className="flex-1 overflow-hidden">
              {renderTabContent()}
            </div>
          </>
        ) : (
          // Sin proyecto seleccionado
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FolderKanban className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Gestión de Proyectos Ultra Versátil
              </h2>
              
              <p className="text-gray-600 mb-6">
                El sistema más completo para gestionar proyectos de construcción, software, manufactura y más.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                  <Target className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Tareas Avanzadas</p>
                  <p className="text-xs text-gray-600">Dependencias y ruta crítica</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-left">
                  <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Timeline Gantt</p>
                  <p className="text-xs text-gray-600">Cronograma interactivo</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-left">
                  <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Control Total</p>
                  <p className="text-xs text-gray-600">Presupuesto y gastos</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-left">
                  <Users className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Equipo HR</p>
                  <p className="text-xs text-gray-600">Integración completa</p>
                </div>
              </div>
              
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md">
                <Plus className="w-5 h-5 inline mr-2" />
                Crear Nuevo Proyecto
              </button>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Módulo en construcción</strong> - Implementando todas las funcionalidades avanzadas de gestión de proyectos.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { ProjectsModule };
export default ProjectsModule;

