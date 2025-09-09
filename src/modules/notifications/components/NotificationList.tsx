import React, { useState } from 'react';
import { Bell, Search, Filter, Check, Pause, Settings, RotateCcw, Mail, Clock, User, AlertTriangle, MessageSquare, Calendar, Eye } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'conversation' | 'meeting' | 'urgent' | 'update';
  source: string;
  isRead: boolean;
  actions: string[];
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
    actions: ['Responder con Plantilla', 'Reasignar']
  },
  {
    id: '2',
    title: 'Reunión con cliente en 30 minutos',
    message: 'Reunión de seguimiento con Industrias López programada a las 14:30',
    time: 'hace 15m',
    type: 'meeting',
    source: 'Industrias López',
    isRead: false,
    actions: ['Unirse', 'Reprogramar']
  },
  {
    id: '3',
    title: 'SLA de primera respuesta vencido',
    message: 'Carlos Ruiz lleva 2 horas esperando primera respuesta (SLA: 1 hora)',
    time: 'hace 30m',
    type: 'urgent',
    source: 'Carlos Ruiz (SMS)',
    isRead: false,
    actions: ['Responder', 'Escalar Ahora']
  },
  {
    id: '4',
    title: 'Cliente actualizado',
    message: 'El cliente Isra ha sido actualizado con nueva información',
    time: 'hace 5m',
    type: 'update',
    source: 'Cliente',
    isRead: true,
    actions: ['Ver detalles']
  },
  {
    id: '5',
    title: 'Nueva oportunidad de venta',
    message: 'Se ha detectado una nueva oportunidad de venta con María González',
    time: 'hace 1h',
    type: 'conversation',
    source: 'María González (Email)',
    isRead: false,
    actions: ['Ver oportunidad', 'Contactar']
  },
  {
    id: '6',
    title: 'Recordatorio de seguimiento',
    message: 'Es hora de hacer seguimiento con el cliente Juan Pérez',
    time: 'hace 2h',
    type: 'meeting',
    source: 'Juan Pérez',
    isRead: false,
    actions: ['Programar llamada', 'Enviar email']
  },
  {
    id: '7',
    title: 'Alerta de sistema',
    message: 'Se ha detectado un problema con la conexión de WhatsApp',
    time: 'hace 3h',
    type: 'urgent',
    source: 'Sistema',
    isRead: true,
    actions: ['Verificar', 'Reportar']
  },
  {
    id: '8',
    title: 'Cliente satisfecho',
    message: 'El cliente Laura Rodríguez ha calificado el servicio como excelente',
    time: 'hace 4h',
    type: 'update',
    source: 'Laura Rodríguez',
    isRead: true,
    actions: ['Ver reseña', 'Agradecer']
  },
  {
    id: '9',
    title: 'Nueva conversación asignada',
    message: 'Te han asignado la conversación con Roberto Silva sobre soporte técnico',
    time: 'hace 5h',
    type: 'conversation',
    source: 'Roberto Silva (Chat)',
    isRead: false,
    actions: ['Responder', 'Reasignar']
  },
  {
    id: '10',
    title: 'Reunión cancelada',
    message: 'La reunión con TechCorp ha sido cancelada por el cliente',
    time: 'hace 6h',
    type: 'meeting',
    source: 'TechCorp',
    isRead: true,
    actions: ['Reprogramar', 'Contactar']
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
                         (selectedFilter === 'urgent' && notification.type === 'urgent');
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
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'conversation': return 'border-l-orange-500 bg-orange-50';
      case 'meeting': return 'border-l-blue-500 bg-blue-50';
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'update': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'conversation': return 'text-orange-600';
      case 'meeting': return 'text-blue-600';
      case 'urgent': return 'text-red-600';
      case 'update': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Centro de Notificaciones</h1>
                <p className="text-gray-600 mt-1">Gestiona todas tus notificaciones desde un solo lugar</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200" title="Filtros">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200" title="Marcar todo leído" onClick={onMarkAllAsRead}>
                  <Check className="w-5 h-5" />
                </button>
                <button className="p-3 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200" title="Pausar">
                  <Pause className="w-5 h-5" />
                </button>
                <button className="p-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200" title="Configuración">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="p-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200" title="Actualizar">
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Hoy</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-orange-100 rounded-full">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-orange-700 font-semibold text-sm">{unreadCount} NUEVAS</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-700 font-semibold text-sm">{notifications.length} TOTAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex">
            <button 
              className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                selectedFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFilter('all')}
            >
              Todas ({notifications.length})
            </button>
            <button 
              className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                selectedFilter === 'unread' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFilter('unread')}
            >
              No leídas ({unreadCount})
            </button>
            <button 
              className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                selectedFilter === 'urgent' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFilter('urgent')}
            >
              Urgentes ({urgentCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
            <p className="text-gray-600">No se encontraron notificaciones con los filtros aplicados</p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-400px)] overflow-y-auto space-y-4 pr-2">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`bg-white rounded-2xl shadow-lg border-l-4 ${getNotificationColor(notification.type)} hover:shadow-xl transition-all duration-300 cursor-pointer group ${
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
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {notification.title}
                          </h3>
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
                          </div>
                        </div>
                        
                        {!notification.isRead && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex items-center space-x-3 mt-4">
                          {notification.actions.map((action, index) => (
                            <button 
                              key={index} 
                              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
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
  );
};

export default NotificationList;