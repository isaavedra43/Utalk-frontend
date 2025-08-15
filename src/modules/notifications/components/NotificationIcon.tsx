import React from 'react';
import type { NotificationIconType } from '../types/notification';

interface NotificationIconProps {
  type: NotificationIconType;
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ type, size = 'md' }) => {
  const getIconContent = () => {
    switch (type) {
      case 'conversation-assigned':
        return '👥';
      case 'meeting-reminder':
        return '📅';
      case 'sla-expired':
        return '⏰';
      case 'churn-risk':
        return '⚡';
      case 'system-alert':
        return '🔔';
      case 'urgent':
        return '🚨';
      default:
        return '📋';
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl'
  };

  return (
    <div className={`notification-icon ${type} ${sizeClasses[size]}`}>
      {getIconContent()}
    </div>
  );
}; 