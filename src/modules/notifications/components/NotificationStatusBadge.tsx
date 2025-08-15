import React from 'react';
import type { NotificationTag } from '../types/notification';

interface NotificationStatusBadgeProps {
  tag: NotificationTag;
  size?: 'sm' | 'md' | 'lg';
}

export const NotificationStatusBadge: React.FC<NotificationStatusBadgeProps> = ({ 
  tag, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-1 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span className={`notification-tag ${tag.color || 'grey'} ${sizeClasses[size]}`}>
      {tag.label}
    </span>
  );
}; 