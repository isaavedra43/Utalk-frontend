import React from 'react';
import type { ClientStatus } from '../../../../types/client';

interface StatusBadgeProps {
  status: ClientStatus;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  className = ''
}) => {
  const getStatusConfig = (status: ClientStatus) => {
    switch (status) {
      case 'won':
        return {
          label: 'Ganado',
          classes: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'lost':
        return {
          label: 'Perdido',
          classes: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'pending':
        return {
          label: 'Pendiente',
          classes: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      default:
        return {
          label: status,
          classes: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'px-1.5 py-0.5 text-xs';
      case 'large':
        return 'px-3 py-1 text-sm';
      default:
        return 'px-2.5 py-0.5 text-xs';
    }
  };

  const statusConfig = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${statusConfig.classes}
        ${sizeClasses}
        ${className}
      `}
    >
      {statusConfig.label}
    </span>
  );
}; 