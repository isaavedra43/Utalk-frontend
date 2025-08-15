import React from 'react';
import type { Notification, NotificationFilters } from '../types/notification';
import { NotificationItem } from './NotificationItem';
import { NotificationPlaceholder } from './NotificationPlaceholder';

interface NotificationListProps {
  notifications: Notification[];
  selectedNotification: Notification | null;
  stats: {
    total: number;
    new: number;
    unread: number;
    actionable: number;
    urgent: number;
  };
  loading: boolean;
  onSelectNotification: (notification: Notification) => void;
  onQuickAction: (notificationId: string, actionId: string) => void;
  onCategoryChange: (category: string) => void;
  onSelectAll: () => void;
  filters: NotificationFilters;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  selectedNotification,
  stats,
  loading,
  onSelectNotification,
  onQuickAction,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCategoryChange: _onCategoryChange,
  onSelectAll,
  filters
}) => {
  if (loading) {
    return (
      <div className="notification-list-container">
        <div className="notification-loading">
          <div className="notification-loading-spinner" />
          <span>Cargando notificaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-list-container">
      {/* Header de la lista */}
      <div className="notification-list-header">
        <div className="notification-list-title">
          <h2>Notificaciones ({stats.total})</h2>
        </div>
        <button 
          className="notification-select-all-btn"
          onClick={onSelectAll}
          title="Seleccionar todas las notificaciones"
        >
          Seleccionar todo
        </button>
      </div>

      {/* Resumen de estadísticas */}
      <div className="notification-stats-summary">
        <div className="notification-stats-item">
          <span className="notification-stats-label">Hoy</span>
        </div>
        <div className="notification-stats-badges">
          <span className="notification-stats-badge new">
            {stats.new} nuevas
          </span>
          <span className="notification-stats-badge total">
            {stats.total} total
          </span>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="notification-list-content">
        {notifications.length === 0 ? (
          <NotificationPlaceholder
            icon="📭"
            title="No hay notificaciones"
            description="No tienes notificaciones para mostrar en este momento."
          />
        ) : (
          <div className="notification-items-container">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isSelected={selectedNotification?.id === notification.id}
                onSelect={onSelectNotification}
                onQuickAction={onQuickAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer con información adicional */}
      {notifications.length > 0 && (
        <div className="notification-list-footer">
          <div className="notification-list-info">
            <span>Mostrando {notifications.length} de {stats.total} notificaciones</span>
          </div>
          {filters.search && (
            <div className="notification-search-info">
              <span>Filtrado por: "{filters.search}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 