// Campo checkbox personalizado

import React from 'react';
import type { CustomField } from '../../../types';

interface CheckboxFieldProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const checked = Boolean(value);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
        />
        <span className="text-sm font-medium text-gray-700">
          {field.name}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      
      {error && (
        <p className="text-xs text-red-500 ml-7">{error}</p>
      )}
      
      {field.description && !error && (
        <p className="text-xs text-gray-500 ml-7">{field.description}</p>
      )}
    </div>
  );
};

