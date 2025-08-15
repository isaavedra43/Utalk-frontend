import React from 'react';

interface NotificationPlaceholderProps {
  icon?: string;
  title: string;
  description: string;
}

export const NotificationPlaceholder: React.FC<NotificationPlaceholderProps> = ({
  icon = '🔔',
  title,
  description
}) => {
  return (
    <div className="notification-placeholder">
      <div className="notification-placeholder-icon">{icon}</div>
      <div className="notification-placeholder-title">{title}</div>
      <div className="notification-placeholder-description">{description}</div>
    </div>
  );
};