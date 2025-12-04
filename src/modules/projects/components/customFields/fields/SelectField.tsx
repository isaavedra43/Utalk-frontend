// Campo de selección personalizado

import React from 'react';
import type { CustomField } from '../../../types';
import { ChevronDown, X } from 'lucide-react';

interface SelectFieldProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const isMultiselect = field.type === 'multiselect';
  const options = field.options || [];

  const handleSingleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value || null);
  };

  const handleMultipleToggle = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    
    if (currentValues.includes(optionValue)) {
      onChange(currentValues.filter(v => v !== optionValue));
    } else {
      onChange([...currentValues, optionValue]);
    }
  };

  const removeValue = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    onChange(currentValues.filter(v => v !== optionValue));
  };

  if (isMultiselect) {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.name}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {/* Selected values */}
        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedValues.map((val) => {
              const option = options.find(o => o.value === val);
              return (
                <div
                  key={val}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                  style={option?.color ? { backgroundColor: `${option.color}20`, color: option.color } : {}}
                >
                  <span>{option?.label || val}</span>
                  {!disabled && (
                    <button
                      onClick={() => removeValue(val)}
                      className="hover:bg-black/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Options */}
        <div className="border border-gray-300 rounded-lg divide-y divide-gray-200 max-h-48 overflow-y-auto">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => !disabled && handleMultipleToggle(option.value)}
                disabled={disabled}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors disabled:cursor-not-allowed ${
                  isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>
                  <span>{option.label}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        
        {field.description && !error && (
          <p className="text-xs text-gray-500">{field.description}</p>
        )}
      </div>
    );
  }

  // Single select
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.name}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <select
          value={value || ''}
          onChange={handleSingleSelect}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Seleccionar...</option>
          {options.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
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

