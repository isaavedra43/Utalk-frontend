import React from 'react';
import type { Notification } from '../types/notification';
import { NotificationIcon } from './NotificationIcon';
import { NotificationStatusBadge } from './NotificationStatusBadge';

interface NotificationItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (notification: Notification) => void;
  onQuickAction: (notificationId: string, actionId: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  isSelected,
  onSelect,
  onQuickAction
}) => {
  const handleSelect = () => {
    onSelect(notification);
  };

  const handleQuickAction = (actionId: string) => {
    onQuickAction(notification.id, actionId);
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  };

  const getStatusClass = () => {
    if (notification.status === 'unread') return 'unread';
    if (notification.status === 'archived') return 'archived';
    return 'read';
  };

  return (
    <div 
      className={`notification-item ${isSelected ? 'selected' : ''} ${getStatusClass()} priority-${getPriorityColor()}`}
      onClick={handleSelect}
    >
      {/* Radio button de selección */}
      <div className="notification-item-radio-container">
        <input
          type="radio"
          checked={isSelected}
          onChange={handleSelect}
          className="notification-item-radio"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Icono circular con color según tipo */}
      <div className="notification-item-icon">
        <NotificationIcon 
          type={notification.icon} 
          size="md"
        />
      </div>

      {/* Contenido principal */}
      <div className="notification-item-content">
        {/* Header con título y tiempo */}
        <div className="notification-item-header">
          <h3 className="notification-item-title">{notification.title}</h3>
          <div className="notification-item-meta">
            <span className="notification-item-time">{notification.timestamp}</span>
            {notification.isNew && (
              <span className="notification-item-new-indicator" title="Nueva notificación" />
            )}
            {notification.priority === 'urgent' && (
              <span className="notification-item-urgent-indicator" title="Urgente" />
            )}
          </div>
        </div>

        {/* Descripción */}
        <p className="notification-item-description">{notification.description}</p>

        {/* Tags contextuales */}
        {notification.tags.length > 0 && (
          <div className="notification-item-tags">
            {notification.tags.map((tag, index) => (
              <NotificationStatusBadge 
                key={`${tag.label}-${index}`} 
                tag={tag} 
                size="sm"
              />
            ))}
          </div>
        )}

        {/* Botones de acción rápida */}
        {notification.quickActions.length > 0 && (
          <div className="notification-item-actions">
            {notification.quickActions.map((action) => (
              <button
                key={action.id}
                className={`notification-item-action ${action.color}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction(action.id);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Indicadores de estado */}
      <div className="notification-item-indicators">
        {notification.status === 'unread' && (
          <div className="notification-item-unread-dot" title="No leída" />
        )}
        {notification.isNew && (
          <div className="notification-item-new-sparkle" title="Nueva" />
        )}
      </div>

      {/* Overlay de selección */}
      {isSelected && (
        <div className="notification-item-selection-overlay" />
      )}
    </div>
  );
}; 