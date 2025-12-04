// Campo de texto personalizado

import React from 'react';
import type { CustomField } from '../../../types';

interface TextFieldProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const isTextarea = field.description && field.description.includes('textarea');
  const maxLength = field.validation?.max || undefined;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {isTextarea ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={field.description}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={field.description}
        />
      )}
      
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      
      {field.description && !error && (
        <p className="text-xs text-gray-500">{field.description}</p>
      )}
      
      {maxLength && (
        <p className="text-xs text-gray-400 text-right">
          {(value || '').length} / {maxLength}
        </p>
      )}
    </div>
  );
};

