import React from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  UserPlus,
  Building2
} from 'lucide-react';
import type { Notification } from '../types/notification';
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

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'conversation':
        return <MessageSquare size={16} />;
      case 'meeting':
        return <Calendar size={16} />;
      case 'sla':
        return <Clock size={16} />;
      case 'churn':
        return <AlertTriangle size={16} />;
      case 'system':
        return <UserPlus size={16} />;
      case 'alert':
        return <Building2 size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  const getIconColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
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
      <div className={`notification-item-icon ${getIconColor()} text-white`}>
        {getNotificationIcon()}
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

        {/* Acciones rápidas */}
        {notification.quickActions.length > 0 && (
          <div className="notification-item-actions">
            {notification.quickActions.map((action) => (
              <button
                key={action.id}
                className={`notification-item-action ${action.color === 'primary' ? 'primary' : ''}`}
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
          <span className="notification-item-new-sparkle" title="Nueva">✨</span>
        )}
      </div>

      {/* Overlay de selección */}
      {isSelected && (
        <div className="notification-item-selection-overlay" />
      )}
    </div>
  );
}; 