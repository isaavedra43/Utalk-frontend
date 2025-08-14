import React from 'react';

interface ClientAvatarProps {
  initials: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  className?: string;
  onClick?: () => void;
}

export const ClientAvatar: React.FC<ClientAvatarProps> = ({
  initials,
  size = 'medium',
  color = 'blue',
  className = '',
  onClick
}) => {
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'h-8 w-8 text-sm';
      case 'large':
        return 'h-12 w-12 text-lg';
      case 'xl':
        return 'h-16 w-16 text-xl';
      default:
        return 'h-10 w-10 text-base';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'purple':
        return 'bg-purple-500';
      case 'orange':
        return 'bg-orange-500';
      case 'red':
        return 'bg-red-500';
      case 'gray':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const sizeClasses = getSizeClasses(size);
  const colorClasses = getColorClasses(color);

  return (
    <div
      className={`
        rounded-full flex items-center justify-center text-white font-medium
        ${sizeClasses}
        ${colorClasses}
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      onClick={onClick}
      title={initials}
    >
      {initials}
    </div>
  );
}; 