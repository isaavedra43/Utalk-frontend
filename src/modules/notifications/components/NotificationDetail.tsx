import React, { useState } from 'react';
import type { Notification } from '../../../types/notification';
import { NotificationIcon } from './NotificationIcon';
import { NotificationStatusBadge } from './NotificationStatusBadge';
import { NotificationQuickActions } from './NotificationQuickActions';
import { NotificationTimeline } from './NotificationTimeline';
import { NotificationPlaceholder } from './NotificationPlaceholder';
import { NotificationAIRecommendationComponent } from './NotificationAIRecommendation';
import { NotificationRelatedLinks } from './NotificationRelatedLinks';

interface NotificationDetailProps {
  notification: Notification | null;
  onClose: () => void;
  onQuickAction: (notificationId: string, actionId: string) => void;
}

export const NotificationDetail: React.FC<NotificationDetailProps> = ({
  notification,
  onClose,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onQuickAction: _onQuickAction
}) => {
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  if (!notification) {
    return (
      <div className="notification-detail-panel">
        <NotificationPlaceholder
          icon="🔔"
          title="Selecciona una notificación"
          description="Haz clic en una notificación para ver los detalles y acciones disponibles."
        />
      </div>
    );
  }

  return (
    <div className="notification-detail-panel">
      <div className="notification-detail-header">
        <div className="notification-detail-title-section">
          <NotificationIcon type={notification.icon} size="lg" />
          <div>
            <h2 className="notification-detail-title">{notification.title}</h2>
            <div className="notification-detail-time">{notification.timestamp}</div>
          </div>
        </div>
        <button className="notification-detail-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="notification-detail-content">
        <div className="notification-detail-status">
          {notification.priority === 'high' && (
            <span className="notification-detail-status-tag high">Alta</span>
          )}
          {notification.priority === 'urgent' && (
            <span className="notification-detail-status-tag urgent">Urgente</span>
          )}
          {notification.status === 'unread' && (
            <span className="notification-detail-status-tag unread">No leída</span>
          )}
          <div className="notification-detail-media-controls">
            <button className="notification-detail-media-control">👁️</button>
            <button className="notification-detail-media-control">🔊</button>
          </div>
        </div>

        <div className="notification-detail-section">
          <div className="notification-detail-section-content">
            {notification.description}
          </div>
        </div>

        {notification.relatedTo && (
          <div className="notification-detail-section">
            <div className="notification-detail-section-title">RELACIONADO CON</div>
            <div className="notification-detail-section-content">
              <NotificationStatusBadge 
                tag={{ label: notification.relatedTo, type: 'contact', color: 'grey' }} 
                size="md" 
              />
            </div>
          </div>
        )}

        {notification.context && (
          <div className="notification-detail-section">
            <div 
              className="notification-detail-section-title"
              onClick={() => setIsContextExpanded(!isContextExpanded)}
              style={{ cursor: 'pointer' }}
            >
              Contexto {isContextExpanded ? '▼' : '▶'}
            </div>
            {isContextExpanded && (
              <div className="notification-detail-section-content">
                {notification.context.originalMessage && (
                  <div>
                    <strong>Mensaje original:</strong> "{notification.context.originalMessage}"
                  </div>
                )}
                {notification.context.slaExceededSince && (
                  <div>
                    <strong>SLA excedido desde:</strong> {notification.context.slaExceededSince}
                  </div>
                )}
                {notification.context.meetingTime && (
                  <div>
                    <strong>Hora de reunión:</strong> {notification.context.meetingTime}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {notification.aiRecommendation && (
          <NotificationAIRecommendationComponent
            recommendation={notification.aiRecommendation}
            className="mb-4"
          />
        )}

        <NotificationQuickActions
          notification={notification}
          onAction={(actionId) => {
            // TODO: Implementar acciones
            console.log('Acción ejecutada:', actionId);
          }}
          className="mb-4"
        />

        {notification.timeline && notification.timeline.length > 0 && (
          <NotificationTimeline 
            events={notification.timeline} 
            className="mb-4"
          />
        )}

        {notification.relatedLinks && notification.relatedLinks.length > 0 && (
          <NotificationRelatedLinks
            links={notification.relatedLinks}
            className="mb-4"
          />
        )}
      </div>
    </div>
  );
}; 