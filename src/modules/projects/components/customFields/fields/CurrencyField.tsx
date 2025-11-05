// Campo de moneda personalizado

import React from 'react';
import type { CustomField } from '../../../types';
import { DollarSign } from 'lucide-react';

interface CurrencyFieldProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

export const CurrencyField: React.FC<CurrencyFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? null : parseFloat(e.target.value);
    onChange(newValue);
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <DollarSign className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="number"
          value={value !== null && value !== undefined ? value : ''}
          onChange={handleChange}
          disabled={disabled}
          min={0}
          step="0.01"
          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0.00"
        />
      </div>
      
      {value !== null && value !== undefined && !error && (
        <p className="text-xs text-gray-600">
          {formatCurrency(value)}
        </p>
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

