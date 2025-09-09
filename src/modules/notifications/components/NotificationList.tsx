import React, { useState } from 'react';
import { Bell, Search, Filter, Check, Pause, Settings, Refresh, Mail } from 'lucide-react';

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

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'unread' && !notification.isRead) ||
                         (selectedFilter === 'urgent' && notification.type === 'urgent');
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent').length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'conversation': return '💬';
      case 'meeting': return '📅';
      case 'urgent': return '⚠️';
      case 'update': return '👤';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'conversation': return 'border-l-orange-500';
      case 'meeting': return 'border-l-blue-500';
      case 'urgent': return 'border-l-red-500';
      case 'update': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="notification-center">
      {/* Header */}
      <div className="notification-header">
        <div className="header-content">
          <div className="header-title">
            <Bell className="header-icon" />
            <div>
              <h1>Centro de Notificaciones</h1>
              <p>Gestiona todas tus notificaciones desde un solo lugar</p>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="action-buttons">
              <button className="action-btn" title="Filtros">
                <Filter size={16} />
              </button>
              <button className="action-btn" title="Marcar todo leído" onClick={onMarkAllAsRead}>
                <Check size={16} />
              </button>
              <button className="action-btn" title="Pausar">
                <Pause size={16} />
              </button>
              <button className="action-btn" title="Configuración">
                <Settings size={16} />
              </button>
              <button className="action-btn" title="Actualizar">
                <Refresh size={16} />
              </button>
              <button className="email-btn">
                <Mail size={16} />
                Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stats-content">
          <div className="stats-label">
            <span>Hoy</span>
          </div>
          <div className="stats-badges">
            <span className="badge badge-new">{unreadCount} NUEVAS</span>
            <span className="badge badge-total">{notifications.length} TOTAL</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          Todas ({notifications.length})
        </button>
        <button 
          className={`filter-tab ${selectedFilter === 'unread' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('unread')}
        >
          No leídas ({unreadCount})
        </button>
        <button 
          className={`filter-tab ${selectedFilter === 'urgent' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('urgent')}
        >
          Urgentes ({urgentCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} className="empty-icon" />
            <h3>No hay notificaciones</h3>
            <p>No se encontraron notificaciones con los filtros aplicados</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${getNotificationColor(notification.type)} ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => onNotificationClick?.(notification)}
            >
              <div className="notification-content">
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-details">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-source">{notification.source}</div>
                  <div className="notification-actions">
                    {notification.actions.map((action, index) => (
                      <button key={index} className="action-button">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {!notification.isRead && <div className="unread-indicator" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
