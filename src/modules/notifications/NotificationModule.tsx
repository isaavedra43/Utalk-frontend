import React, { useState } from 'react';
import { NotificationHeader } from './components/NotificationHeader';
import { NotificationList } from './components/NotificationList';
import { NotificationDetail } from './components/NotificationDetail';
import { NotificationPlaceholder } from './components/NotificationPlaceholder';

import { useNotifications } from './hooks/useNotifications';
import { useNotificationFilters } from './hooks/useNotificationFilters';
import { useNotificationActions } from './hooks/useNotificationActions';
import type { Notification } from './types/notification';
import './styles/notifications.css';

export const NotificationModule: React.FC = () => {
  // Estados del módulo
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  // Hooks personalizados
  const {
    notifications,
    loading,
    error,
    markAsRead,
    executeQuickAction
  } = useNotifications();

  const {
    filters,
    setCategory,
    setSearch
  } = useNotificationFilters();

  const {
    markAllAsRead,
    pauseNotifications,
    exportNotifications,
    refreshNotifications
  } = useNotificationActions();

  // Manejadores de eventos
  const handleNotificationSelect = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailPanelOpen(true);
    
    // Marcar como leída si no lo está
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailPanelOpen(false);
    setSelectedNotification(null);
  };

  const handleQuickAction = (notificationId: string, actionId: string) => {
    executeQuickAction(notificationId, actionId);
  };

  const handleCategoryChange = (category: string) => {
    setCategory(category as 'today' | 'unread' | 'actionable' | 'urgent' | 'all');
  };

  // Filtrar notificaciones según los filtros actuales
  const filteredNotifications = notifications.filter(notification => {
    // Filtro por categoría
    if (filters.category !== 'all' && notification.category !== filters.category) {
      return false;
    }
    
    // Filtro por prioridad
    if (filters.priority !== 'all' && notification.priority !== filters.priority) {
      return false;
    }
    
    // Filtro por tipo
    if (filters.type !== 'all' && notification.type !== filters.type) {
      return false;
    }
    
    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = notification.title.toLowerCase().includes(searchLower);
      const matchesDescription = notification.description.toLowerCase().includes(searchLower);
      const matchesTags = notification.tags.some(tag => 
        tag.label.toLowerCase().includes(searchLower)
      );
      
      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false;
      }
    }
    
    return true;
  });

  if (error) {
    return (
      <div className="notification-module error">
        <div className="notification-error">
          <h2>Error al cargar notificaciones</h2>
          <p>{error}</p>
          <button onClick={refreshNotifications}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-module">
      {/* Panel izquierdo - Lista de notificaciones */}
      <div className="notification-list-panel">
        <NotificationHeader
          title="Centro de Notificaciones"
          subtitle="Gestiona todas tus notificaciones desde un solo lugar"
          onSearch={setSearch}
          onFilters={() => console.log('Abrir filtros avanzados')}
          onMarkAllRead={markAllAsRead}
          onPause={pauseNotifications}
          onSettings={() => console.log('Configuración')}
          onExport={exportNotifications}
          onRefresh={refreshNotifications}
        />
        
        <NotificationList
          notifications={filteredNotifications}
          selectedNotification={selectedNotification}
          stats={{
            total: filteredNotifications.length,
            new: filteredNotifications.filter(n => n.isNew).length,
            unread: filteredNotifications.filter(n => n.status === 'unread').length,
            actionable: filteredNotifications.filter(n => n.quickActions.length > 0).length,
            urgent: filteredNotifications.filter(n => n.priority === 'urgent').length
          }}
          loading={loading}
          onSelectNotification={handleNotificationSelect}
          onQuickAction={handleQuickAction}
          onCategoryChange={handleCategoryChange}
          onSelectAll={() => console.log('Seleccionar todo')}
          filters={filters}
        />
      </div>

      {/* Panel derecho - Detalles de notificación */}
      <div className="notification-detail-panel">
        {isDetailPanelOpen && selectedNotification ? (
          <NotificationDetail
            notification={selectedNotification}
            onClose={handleCloseDetail}
            onQuickAction={handleQuickAction}
          />
        ) : (
          <NotificationPlaceholder
            icon="🔔"
            title="Selecciona una notificación"
            description="Haz clic en una notificación para ver los detalles y acciones disponibles."
          />
        )}
      </div>
    </div>
  );
}; 