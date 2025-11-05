// Campo de calificación (estrellas)

import React from 'react';
import type { CustomField } from '../../../types';
import { Star } from 'lucide-react';

interface RatingFieldProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

export const RatingField: React.FC<RatingFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const maxRating = field.validation?.max || 5;
  const numValue = typeof value === 'number' ? Math.min(maxRating, Math.max(0, value)) : 0;
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="flex items-center gap-1">
        {[...Array(maxRating)].map((_, index) => {
          const rating = index + 1;
          const isFilled = rating <= (hoverRating || numValue);
          
          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => !disabled && setHoverRating(rating)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={disabled}
              className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
            >
              <Star
                className={`w-6 h-6 ${
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
        {numValue > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {numValue} de {maxRating}
          </span>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      
      {field.description && !error && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
    </div>
  );
};

