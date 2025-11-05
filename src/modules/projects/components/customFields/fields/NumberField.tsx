// Campo numérico personalizado

import React from 'react';
import type { CustomField } from '../../../types';

interface NumberFieldProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const min = field.validation?.min;
  const max = field.validation?.max;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? null : parseFloat(e.target.value);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        type="number"
        value={value !== null && value !== undefined ? value : ''}
        onChange={handleChange}
        disabled={disabled}
        min={min}
        max={max}
        step="any"
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={field.description}
      />
      
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      
      {field.description && !error && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
      
      {(min !== undefined || max !== undefined) && (
        <p className="text-xs text-gray-400">
          {min !== undefined && max !== undefined
            ? `Rango: ${min} - ${max}`
            : min !== undefined
            ? `Mínimo: ${min}`
            : `Máximo: ${max}`}
        </p>
      )}
    </div>
  );
};

