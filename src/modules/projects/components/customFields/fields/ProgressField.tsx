// Campo de progreso (barra de progreso)

import React from 'react';
import type { CustomField } from '../../../types';

interface ProgressFieldProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

export const ProgressField: React.FC<ProgressFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const numValue = typeof value === 'number' ? Math.min(100, Math.max(0, value)) : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    onChange(Math.min(100, Math.max(0, newValue)));
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {field.name}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-sm font-semibold text-gray-900">{numValue}%</span>
      </div>
      
      {/* Barra de progreso */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor(numValue)}`}
          style={{ width: `${numValue}%` }}
        />
      </div>
      
      {/* Slider para ajustar */}
      {!disabled && (
        <input
          type="range"
          min="0"
          max="100"
          value={numValue}
          onChange={handleChange}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, ${getProgressColor(numValue).replace('bg-', '')} ${numValue}%, #e5e7eb ${numValue}%)`
          }}
        />
      )}
      
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      
      {field.description && !error && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
    </div>
  );
};

