import React, { useState, useEffect } from 'react';
import { employeesApi } from '../../../services/employeesApi';
import { 
  User, 
  Calendar, 
  Search, 
  Download, 
  Share2,
  Edit,
  FileText,
  Award,
  AlertTriangle,
  Star,
  Users,
  Settings
} from 'lucide-react';

interface HistoryEvent {
  id: string;
  type: 'profile_update' | 'position_change' | 'salary_change' | 'evaluation' | 'skill_update' | 
        'certification' | 'incident' | 'vacation' | 'document' | 'note' | 'system';
  category: 'personal' | 'work' | 'performance' | 'development' | 'administrative' | 'system';
  title: string;
  description: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  isSystem: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  relatedModule: string;
  metadata: Record<string, any>;
}

interface EmployeeHistoryData {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  totalEvents: number;
  recentEvents: number;
  events: HistoryEvent[];
  summary: {
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    byUser: Record<string, number>;
    timeline: Array<{ date: string; count: number }>;
  };
}

interface EmployeeHistoryViewProps {
  employeeId: string;
  onBack: () => void;
}

const EmployeeHistoryView: React.FC<EmployeeHistoryViewProps> = ({ 
  employeeId, 
  onBack 
}: EmployeeHistoryViewProps) => {
  const [historyData, setHistoryData] = useState<EmployeeHistoryData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'timeline' | 'table' | 'summary'>('timeline');

  // Cargar datos reales de historial
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const response = await employeesApi.getEmployeeHistory(employeeId, {
          page: 1,
          limit: 100
        });
        
        // Transformar datos del backend al formato esperado por el componente
        const transformedData: EmployeeHistoryData = {
          employeeId: employeeId,
          employeeName: 'Empleado', // Se puede obtener del contexto o props
          position: 'Puesto',
          department: 'Departamento',
          totalEvents: response.summary.totalEvents,
          recentEvents: response.summary.recentEvents,
          events: response.history.map(event => ({
            id: event.id,
            type: event.type as any,
            category: getCategoryFromType(event.type),
            title: event.description,
            description: event.description,
            details: event.details?.description || event.description,
            oldValue: event.oldValue,
            newValue: event.newValue,
            timestamp: event.changedAt,
            userId: event.changedBy,
            userName: event.changedBy, // El backend no devuelve nombre de usuario
            userRole: 'Usuario',
            isSystem: event.changedBy === 'SYSTEM',
            severity: getSeverityFromType(event.type),
            tags: [event.type, event.module],
            relatedModule: event.module,
            metadata: event.details
          })),
          summary: {
            byType: {},
            byCategory: {},
            byUser: {},
            timeline: []
          }
        };

        // Calcular resúmenes
        transformedData.events.forEach(event => {
          // Por tipo
          transformedData.summary.byType[event.type] = 
            (transformedData.summary.byType[event.type] || 0) + 1;
          
          // Por categoría
          transformedData.summary.byCategory[event.category] = 
            (transformedData.summary.byCategory[event.category] || 0) + 1;
          
          // Por usuario
          transformedData.summary.byUser[event.userName] = 
            (transformedData.summary.byUser[event.userName] || 0) + 1;
        });

        setHistoryData(transformedData);
      } catch (error) {
        console.error('Error al cargar historial:', error);
        
        // Crear datos vacíos en caso de error para mostrar el estado correcto
        const emptyData: EmployeeHistoryData = {
          employeeId: employeeId,
          employeeName: 'Empleado',
          position: 'Puesto',
          department: 'Departamento',
          totalEvents: 0,
          recentEvents: 0,
          events: [],
          summary: {
            byType: {},
            byCategory: {},
            byUser: {},
            timeline: []
          }
        };
        
        setHistoryData(emptyData);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [employeeId]);

  // Función helper para determinar categoría desde tipo
  const getCategoryFromType = (type: string): HistoryEvent['category'] => {
    if (type.includes('profile') || type.includes('personal')) return 'personal';
    if (type.includes('salary') || type.includes('payroll')) return 'work';
    if (type.includes('evaluation') || type.includes('performance')) return 'performance';
    if (type.includes('skill') || type.includes('certification')) return 'development';
    if (type.includes('incident') || type.includes('vacation')) return 'administrative';
    return 'system';
  };

  // Función helper para determinar severidad desde tipo
  const getSeverityFromType = (type: string): HistoryEvent['severity'] => {
    if (type.includes('salary') || type.includes('incident')) return 'high';
    if (type.includes('evaluation') || type.includes('skill')) return 'medium';
    return 'low';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'profile_update': return <User className="h-4 w-4" />;
      case 'position_change': return <Award className="h-4 w-4" />;
      case 'salary_change': return <Star className="h-4 w-4" />;
      case 'evaluation': return <Star className="h-4 w-4" />;
      case 'skill_update': return <Award className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'incident': return <AlertTriangle className="h-4 w-4" />;
      case 'vacation': return <Calendar className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'note': return <Edit className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'profile_update': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'position_change': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'salary_change': return 'bg-green-100 text-green-800 border-green-200';
      case 'evaluation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'skill_update': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'certification': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'incident': return 'bg-red-100 text-red-800 border-red-200';
      case 'vacation': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'document': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'note': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'system': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
    return `Hace ${Math.floor(diffInDays / 365)} años`;
  };

  const filteredEvents = historyData?.events.filter((event: HistoryEvent) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesUser = filterUser === 'all' || event.userName === filterUser;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const eventDate = new Date(event.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case 'today': matchesDate = daysDiff === 0; break;
        case 'week': matchesDate = daysDiff <= 7; break;
        case 'month': matchesDate = daysDiff <= 30; break;
        case 'quarter': matchesDate = daysDiff <= 90; break;
        case 'year': matchesDate = daysDiff <= 365; break;
      }
    }
    
    return matchesSearch && matchesType && matchesCategory && matchesUser && matchesDate;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró historial</h3>
          <p className="text-gray-600">No hay datos de historial disponibles para este empleado.</p>
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
                <AlertTriangle className="h-5 w-5 text-gray-600 rotate-90" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Historial</h1>
                <p className="text-gray-600">{historyData.employeeName} - {historyData.position}</p>
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
        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-2xl font-bold text-blue-600">{historyData.totalEvents}</p>
                <p className="text-xs text-gray-500">registrados</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos Recientes</p>
                <p className="text-2xl font-bold text-green-600">{historyData.recentEvents}</p>
                <p className="text-xs text-gray-500">último mes</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(historyData.summary.byUser).length}</p>
                <p className="text-xs text-gray-500">han hecho cambios</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Módulos Afectados</p>
                <p className="text-2xl font-bold text-orange-600">{Object.keys(historyData.summary.byCategory).length}</p>
                <p className="text-xs text-gray-500">categorías</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros y Vista</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveView('timeline')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    activeView === 'timeline' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Línea de Tiempo
                </button>
                <button
                  onClick={() => setActiveView('table')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    activeView === 'table' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Tabla
                </button>
                <button
                  onClick={() => setActiveView('summary')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    activeView === 'summary' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Resumen
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="profile_update">Actualización de Perfil</option>
                <option value="evaluation">Evaluaciones</option>
                <option value="salary_change">Cambios Salariales</option>
                <option value="skill_update">Habilidades</option>
                <option value="certification">Certificaciones</option>
                <option value="incident">Incidencias</option>
                <option value="vacation">Vacaciones</option>
                <option value="system">Sistema</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                <option value="personal">Personal</option>
                <option value="work">Trabajo</option>
                <option value="performance">Rendimiento</option>
                <option value="development">Desarrollo</option>
                <option value="administrative">Administrativo</option>
                <option value="system">Sistema</option>
              </select>

              <select
                value={filterUser}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterUser(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los usuarios</option>
                {Object.keys(historyData.summary.byUser).map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>

              <select
                value={dateRange}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateRange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último año</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenido según la vista activa */}
        {activeView === 'timeline' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Línea de Tiempo de Eventos</h3>
              <div className="space-y-6">
                {filteredEvents.map((event: HistoryEvent, index: number) => (
                  <div key={event.id} className="relative">
                    {/* Línea vertical */}
                    {index < filteredEvents.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                    )}
                    
                    <div className="flex items-start space-x-4">
                      {/* Icono del evento */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      
                      {/* Contenido del evento */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                              {event.details && (
                                <p className="text-sm text-gray-500 mt-2">{event.details}</p>
                              )}
                              
                              {/* Cambios de valor */}
                              {(event.oldValue || event.newValue) && (
                                <div className="mt-3 p-3 bg-white rounded border">
                                  <div className="text-xs font-medium text-gray-500 mb-2">Cambios:</div>
                                  {event.oldValue && (
                                    <div className="text-sm">
                                      <span className="text-red-600">- {event.oldValue}</span>
                                    </div>
                                  )}
                                  {event.newValue && (
                                    <div className="text-sm">
                                      <span className="text-green-600">+ {event.newValue}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Tags */}
                              {event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {event.tags.map((tag: string, tagIndex: number) => (
                                    <span
                                      key={tagIndex}
                                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Severidad */}
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                              {event.severity === 'low' ? 'Baja' : 
                               event.severity === 'medium' ? 'Media' : 
                               event.severity === 'high' ? 'Alta' : 'Crítica'}
                            </span>
                          </div>
                          
                          {/* Información del usuario y fecha */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <User className="h-4 w-4" />
                              <span>{event.userName}</span>
                              <span>•</span>
                              <span>{event.userRole}</span>
                              {event.isSystem && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600">Sistema</span>
                                </>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              <span title={formatDate(event.timestamp)}>
                                {getRelativeTime(event.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'table' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cambios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severidad
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event: HistoryEvent) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ${getEventColor(event.type)}`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.userName}</div>
                        <div className="text-sm text-gray-500">{event.userRole}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(event.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        {(event.oldValue || event.newValue) && (
                          <div className="text-sm">
                            {event.oldValue && (
                              <div className="text-red-600">- {event.oldValue}</div>
                            )}
                            {event.newValue && (
                              <div className="text-green-600">+ {event.newValue}</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                          {event.severity === 'low' ? 'Baja' : 
                           event.severity === 'medium' ? 'Media' : 
                           event.severity === 'high' ? 'Alta' : 'Crítica'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Eventos por Tipo</h4>
                <div className="space-y-3">
                  {Object.entries(historyData.summary.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getEventIcon(type)}
                        <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Actividad por Usuario</h4>
                <div className="space-y-3">
                  {Object.entries(historyData.summary.byUser).map(([user, count]) => (
                    <div key={user} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user}</span>
                      </div>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { EmployeeHistoryView };
export default EmployeeHistoryView;
