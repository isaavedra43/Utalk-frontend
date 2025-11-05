// Hook de campos personalizados

import { useState, useCallback } from 'react';
import type { CustomField, CustomFieldValue } from '../types';

export const useCustomFields = (projectId: string) => {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [fieldValues, setFieldValues] = useState<{ [fieldId: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar campos personalizados
  const loadCustomFields = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar cuando el servicio esté disponible
      // const fields = await customFieldsService.getFields(projectId);
      // setCustomFields(fields);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar custom fields';
      setError(errorMessage);
      console.error('Error loading custom fields:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Crear campo personalizado
  const createField = useCallback(async (fieldData: Partial<CustomField>) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implementar cuando el servicio esté disponible
      // const newField = await customFieldsService.createField(projectId, fieldData);
      // setCustomFields(prev => [...prev, newField]);
      
      // return newField;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear custom field';
      setError(errorMessage);
      console.error('Error creating custom field:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Actualizar campo personalizado
  const updateField = useCallback(async (
    fieldId: string,
    updates: Partial<CustomField>
  ) => {
    try {
      // TODO: Implementar cuando el servicio esté disponible
      setCustomFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updates } : f));
    } catch (err) {
      console.error('Error updating custom field:', err);
      throw err;
    }
  }, []);

  // Eliminar campo personalizado
  const deleteField = useCallback(async (fieldId: string) => {
    try {
      // TODO: Implementar cuando el servicio esté disponible
      setCustomFields(prev => prev.filter(f => f.id !== fieldId));
      
      // Limpiar valores del campo
      setFieldValues(prev => {
        const newValues = { ...prev };
        delete newValues[fieldId];
        return newValues;
      });
    } catch (err) {
      console.error('Error deleting custom field:', err);
      throw err;
    }
  }, []);

  // Actualizar valor de campo
  const updateFieldValue = useCallback((fieldId: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  // Validar campo
  const validateField = useCallback((field: CustomField, value: any): {
    valid: boolean;
    error?: string;
  } => {
    if (field.required && (value === null || value === undefined || value === '')) {
      return { valid: false, error: 'Este campo es requerido' };
    }

    if (field.validation) {
      const validation = field.validation;
      
      if (validation.min !== undefined && value < validation.min) {
        return { valid: false, error: `El valor mínimo es ${validation.min}` };
      }
      
      if (validation.max !== undefined && value > validation.max) {
        return { valid: false, error: `El valor máximo es ${validation.max}` };
      }
      
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return { valid: false, error: validation.errorMessage || 'Formato inválido' };
        }
      }
    }

    return { valid: true };
  }, []);

  // Validar todos los campos
  const validateAllFields = useCallback((): {
    valid: boolean;
    errors: { [fieldId: string]: string };
  } => {
    const errors: { [fieldId: string]: string } = {};
    let allValid = true;

    customFields.forEach(field => {
      const value = fieldValues[field.id];
      const result = validateField(field, value);
      
      if (!result.valid) {
        errors[field.id] = result.error || 'Error de validación';
        allValid = false;
      }
    });

    return { valid: allValid, errors };
  }, [customFields, fieldValues, validateField]);

  return {
    // Estado
    customFields,
    fieldValues,
    loading,
    error,
    
    // Acciones
    loadCustomFields,
    createField,
    updateField,
    deleteField,
    updateFieldValue,
    validateField,
    validateAllFields,
  };
};

