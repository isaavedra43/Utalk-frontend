// Renderizador universal de custom fields

import React from 'react';
import type { CustomField, CustomFieldValue } from '../../types';
import { TextField } from './fields/TextField';
import { NumberField } from './fields/NumberField';
import { CurrencyField } from './fields/CurrencyField';
import { DateField } from './fields/DateField';
import { SelectField } from './fields/SelectField';
import { CheckboxField } from './fields/CheckboxField';
import { ProgressField } from './fields/ProgressField';
import { RatingField } from './fields/RatingField';

interface CustomFieldRendererProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  error?: string;
}

export const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  // Renderizar el campo según su tipo
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
        );
      
      case 'number':
        return (
          <NumberField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
        );
      
      case 'currency':
        return (
          <CurrencyField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
        );
      
      case 'date':
      case 'datetime':
        return (
          <DateField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
        );
      
      case 'select':
      case 'multiselect':
        return (
          <SelectField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
        );
      
      case 'checkbox':
        return (
          <CheckboxField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
        );
      
      case 'progress':
        return (
          <ProgressField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
        );
      
      case 'rating':
        return (
          <RatingField
            field={field}
            value={value}
            onChange={onChange}
            disabled={disabled}
            error={error}
          />
        );
      
      case 'formula':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono">
              {value !== null && value !== undefined ? value.toString() : '-'}
            </div>
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
            {field.formula && (
              <p className="text-xs text-gray-400 font-mono">= {field.formula}</p>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.name}
            </label>
            <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Tipo de campo no implementado: {field.type}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`custom-field-${field.type}`}>
      {renderField()}
    </div>
  );
};

