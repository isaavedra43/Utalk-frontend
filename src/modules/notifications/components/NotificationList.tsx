import React, { useState } from 'react';
import { 
  Bell, Search, Filter, Check, Pause, Settings, RotateCcw, Mail, Clock, User, 
  AlertTriangle, MessageSquare, Calendar, TrendingUp, TrendingDown, 
  BarChart3, Users, DollarSign, Award, Shield, Minus, X, AlertCircle, Info
} from 'lucide-react';
import { MobileMenuButton } from '../../../components/layout/MobileMenuButton';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'conversation' | 'meeting' | 'urgent' | 'update' | 'sale' | 'system' | 'reminder' | 'achievement' | 'alert' | 'info';
  source: string;
  isRead: boolean;
  actions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'customer' | 'sales' | 'system' | 'team' | 'marketing';
  metadata?: {
    clientId?: string;
    conversationId?: string;
    value?: number;
    deadline?: string;
    assignee?: string;
  };
}

interface NotificationListProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nueva conversación asignada',
    message: 'Te han asignado la conversación con Ana Martínez sobre consulta de precios',
    time: 'hace 10m',
    type: 'conversation',
    source: 'Ana Martínez (WhatsApp)',
    isRead: false,
    actions: ['Responder con Plantilla', 'Reasignar'],
    priority: 'high',
    category: 'customer',
    metadata: { clientId: 'CLI001', conversationId: 'CONV001' }
  },
  {
    id: '2',
    title: 'Reunión con cliente en 30 minutos',
    message: 'Reunión de seguimiento con Industrias López programada a las 14:30',
    time: 'hace 15m',
    type: 'meeting',
    source: 'Industrias López',
    isRead: false,
    actions: ['Unirse', 'Reprogramar'],
    priority: 'high',
    category: 'customer',
    metadata: { clientId: 'CLI002', deadline: '14:30' }
  },
  {
    id: '3',
    title: 'SLA de primera respuesta vencido',
    message: 'Carlos Ruiz lleva 2 horas esperando primera respuesta (SLA: 1 hora)',
    time: 'hace 30m',
    type: 'urgent',
    source: 'Carlos Ruiz (SMS)',
    isRead: false,
    actions: ['Responder', 'Escalar Ahora'],
    priority: 'critical',
    category: 'customer',
    metadata: { clientId: 'CLI003', conversationId: 'CONV003' }
  },
  {
    id: '4',
    title: 'Cliente actualizado',
    message: 'El cliente Isra ha sido actualizado con nueva información',
    time: 'hace 5m',
    type: 'update',
    source: 'Cliente',
    isRead: true,
    actions: ['Ver detalles'],
    priority: 'low',
    category: 'customer',
    metadata: { clientId: 'CLI004' }
  },
  {
    id: '5',
    title: 'Nueva oportunidad de venta',
    message: 'Se ha detectado una nueva oportunidad de venta con María González',
    time: 'hace 1h',
    type: 'sale',
    source: 'María González (Email)',
    isRead: false,
    actions: ['Ver oportunidad', 'Contactar'],
    priority: 'high',
    category: 'sales',
    metadata: { clientId: 'CLI005', value: 15000 }
  }
];

const NotificationList: React.FC<NotificationListProps> = ({
  notifications = mockNotifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredNotifications = (notifications || []).filter(notification => {
    if (!notification) return false;
    const matchesSearch = (notification.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && !notification.isRead) ||
                         (selectedFilter === 'urgent' && notification.type === 'urgent') ||
                         (selectedFilter === 'critical' && notification.priority === 'critical');
    return matchesSearch && matchesFilter;
  });

  const unreadCount = (notifications || []).filter(n => n && !n.isRead).length;
  const urgentCount = (notifications || []).filter(n => n && n.type === 'urgent').length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'conversation': return <MessageSquare className="w-5 h-5" />;
      case 'meeting': return <Calendar className="w-5 h-5" />;
      case 'urgent': return <AlertTriangle className="w-5 h-5" />;
      case 'update': return <User className="w-5 h-5" />;
      case 'sale': return <DollarSign className="w-5 h-5" />;
      case 'system': return <Shield className="w-5 h-5" />;
      case 'reminder': return <Clock className="w-5 h-5" />;
      case 'achievement': return <Award className="w-5 h-5" />;
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'conversation': return 'border-l-orange-500 bg-orange-50';
      case 'meeting': return 'border-l-blue-500 bg-blue-50';
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'update': return 'border-l-green-500 bg-green-50';
      case 'sale': return 'border-l-emerald-500 bg-emerald-50';
      case 'system': return 'border-l-purple-500 bg-purple-50';
      case 'reminder': return 'border-l-yellow-500 bg-yellow-50';
      case 'achievement': return 'border-l-indigo-500 bg-indigo-50';
      case 'alert': return 'border-l-pink-500 bg-pink-50';
      case 'info': return 'border-l-cyan-500 bg-cyan-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'conversation': return 'text-orange-600';
      case 'meeting': return 'text-blue-600';
      case 'urgent': return 'text-red-600';
      case 'update': return 'text-green-600';
      case 'sale': return 'text-emerald-600';
      case 'system': return 'text-purple-600';
      case 'reminder': return 'text-yellow-600';
      case 'achievement': return 'text-indigo-600';
      case 'alert': return 'text-pink-600';
      case 'info': return 'text-cyan-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calcular métricas del día
  const todayStats = {
    total: notifications.length,
    unread: unreadCount,
    urgent: urgentCount,
    critical: notifications.filter(n => n.priority === 'critical').length,
    high: notifications.filter(n => n.priority === 'high').length,
    sales: notifications.filter(n => n.category === 'sales').length,
    customer: notifications.filter(n => n.category === 'customer').length,
    system: notifications.filter(n => n.category === 'system').length,
    totalValue: notifications.reduce((sum, n) => sum + (n.metadata?.value || 0), 0),
    responseTime: '2.5 min',
    satisfaction: '4.8/5'
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Header móvil */}
            <div className="lg:hidden flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <MobileMenuButton />
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Notificaciones</h1>
                    <p className="text-sm text-gray-600">Centro de alertas</p>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Header desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Centro de Notificaciones</h1>
                <p className="text-gray-600 mt-1">Gestiona todas tus notificaciones desde un solo lugar</p>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full lg:w-auto">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full lg:w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Botones de acción */}
              <div className="flex items-center justify-between lg:justify-end space-x-2">
                <div className="flex items-center space-x-1">
                  <button className="p-2 lg:p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200" title="Filtros">
                    <Filter className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button className="p-2 lg:p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200" title="Marcar todo leído" onClick={onMarkAllAsRead}>
                    <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button className="p-2 lg:p-3 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200" title="Pausar">
                    <Pause className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button className="hidden lg:block p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200" title="Configuración">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="p-2 lg:p-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200" title="Actualizar">
                    <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
                <button className="flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
                  <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="font-medium text-sm lg:text-base">Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto">
        {/* Resumen Detallado del Día */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Resumen Principal */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Resumen del Día</h2>
                    <p className="text-gray-600">Hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">En tiempo real</span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{todayStats.total}</p>
                    </div>
                    <Bell className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+12% vs ayer</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">No leídas</p>
                      <p className="text-2xl font-bold text-orange-900">{todayStats.unread}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-xs text-red-600">-5% vs ayer</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Críticas</p>
                      <p className="text-2xl font-bold text-red-900">{todayStats.critical}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <Minus className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-600">Sin cambios</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">Ventas</p>
                      <p className="text-2xl font-bold text-emerald-900">{todayStats.sales}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+25% vs ayer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas de Rendimiento */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
                Rendimiento
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiempo de respuesta</span>
                  <span className="text-sm font-semibold text-green-600">{todayStats.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Satisfacción</span>
                  <span className="text-sm font-semibold text-blue-600">{todayStats.satisfaction}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Valor total</span>
                  <span className="text-sm font-semibold text-emerald-600">${todayStats.totalValue.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progreso del día</span>
                    <span className="text-sm font-semibold text-gray-900">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categorías */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clientes</p>
                  <p className="text-xl font-bold text-gray-900">{todayStats.customer}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ventas</p>
                  <p className="text-xl font-bold text-gray-900">{todayStats.sales}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sistema</p>
                  <p className="text-xl font-bold text-gray-900">{todayStats.system}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Logros</p>
                  <p className="text-xl font-bold text-gray-900">{notifications.filter(n => n.type === 'achievement').length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex flex-wrap">
              <button 
                className={`flex-1 min-w-[120px] px-4 lg:px-6 py-3 lg:py-4 text-center font-medium transition-all duration-200 ${
                  selectedFilter === 'all' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedFilter('all')}
              >
                Todas ({notifications.length})
              </button>
              <button 
                className={`flex-1 min-w-[120px] px-4 lg:px-6 py-3 lg:py-4 text-center font-medium transition-all duration-200 ${
                  selectedFilter === 'unread' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedFilter('unread')}
              >
                No leídas ({unreadCount})
              </button>
              <button 
                className={`flex-1 min-w-[120px] px-4 lg:px-6 py-3 lg:py-4 text-center font-medium transition-all duration-200 ${
                  selectedFilter === 'urgent' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedFilter('urgent')}
              >
                Urgentes ({urgentCount})
              </button>
              <button 
                className={`flex-1 min-w-[120px] px-4 lg:px-6 py-3 lg:py-4 text-center font-medium transition-all duration-200 ${
                  selectedFilter === 'critical' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedFilter('critical')}
              >
                Críticas ({todayStats.critical})
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-8">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
              <p className="text-gray-600">No se encontraron notificaciones con los filtros aplicados</p>
            </div>
          ) : (
            <div className="space-y-4 pr-2">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border-l-4 ${getNotificationColor(notification.type)} hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:scale-[1.02] ${
                    !notification.isRead ? 'ring-2 ring-blue-100' : ''
                  }`}
                  onClick={() => onNotificationClick?.(notification)}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${getNotificationColor(notification.type)} ${getNotificationIconColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                {notification.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-1 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 mt-3">
                              <span className="text-sm text-gray-500 font-medium">
                                {notification.source}
                              </span>
                              <span className="text-sm text-gray-400">
                                {notification.time}
                              </span>
                              {notification.metadata?.value && (
                                <span className="text-sm font-semibold text-emerald-600">
                                  ${notification.metadata.value.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
                            )}
                            <button 
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead?.(notification.id);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex items-center space-x-3 mt-4">
                            {notification.actions.map((action, index) => (
                              <button 
                                key={index} 
                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle action
                                }}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationList;