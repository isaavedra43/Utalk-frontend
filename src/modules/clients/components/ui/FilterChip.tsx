import React from 'react';
import { X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  value: string;
  removable?: boolean;
  onRemove?: (value: string) => void;
  className?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  value,
  removable = false,
  onRemove,
  className = '',
  color = 'blue'
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'gray':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const colorClasses = getColorClasses(color);

  const handleRemove = () => {
    if (onRemove) {
      onRemove(value);
    }
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
        ${colorClasses}
        ${removable ? 'pr-1' : ''}
        ${className}
      `}
    >
      {label}
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1 text-current hover:opacity-70 transition-opacity"
          title={`Eliminar filtro: ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}; 