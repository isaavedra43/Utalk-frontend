// Campo de fecha personalizado

import React from 'react';
import type { CustomField } from '../../../types';
import { Calendar } from 'lucide-react';

interface DateFieldProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const isDateTime = field.type === 'datetime';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value ? new Date(e.target.value) : null);
  };

  const formatValue = (val: any) => {
    if (!val) return '';
    const date = new Date(val);
    
    if (isDateTime) {
      return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    } else {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type={isDateTime ? 'datetime-local' : 'date'}
          value={formatValue(value)}
          onChange={handleChange}
          disabled={disabled}
          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
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

