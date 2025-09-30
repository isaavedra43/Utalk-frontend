import { useState, useCallback } from 'react';
import { useToast } from './useToast';

interface ValidationError {
  field: string;
  code: string;
  message: string;
}

interface ValidationErrorResponse {
  success: false;
  error: string;
  message: string;
  details: ValidationError[];
}

export const useValidationErrors = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { showError } = useToast();

  const processValidationError = useCallback((errorResponse: ValidationErrorResponse) => {
    if (errorResponse.error === 'validation_error' && errorResponse.details) {
      const errors: Record<string, string> = {};
      
      errorResponse.details.forEach(error => {
        // Extraer el nombre del campo (remover 'body.' del prefijo)
        const fieldName = error.field.replace('body.', '');
        errors[fieldName] = error.message;
      });
      
      setFieldErrors(errors);
      
      // Mostrar mensaje general de error
      showError(
        'Error de Validación',
        'Por favor, corrige los errores en el formulario',
        5000
      );
      
      return errors;
    }
    
    return null;
  }, [showError]);

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const getFieldError = useCallback((fieldName: string) => {
    return fieldErrors[fieldName] || '';
  }, [fieldErrors]);

  const hasErrors = useCallback(() => {
    return Object.keys(fieldErrors).length > 0;
  }, [fieldErrors]);

  const highlightField = useCallback((fieldName: string) => {
    // Buscar el campo en el DOM y resaltarlo
    const field = document.querySelector(`[name="${fieldName}"]`) as HTMLElement;
    if (field) {
      field.classList.add('field-error');
      field.focus();
      
      // Remover la clase de error después de 3 segundos
      setTimeout(() => {
        field.classList.remove('field-error');
      }, 3000);
    }
  }, []);

  const highlightAllErrorFields = useCallback(() => {
    Object.keys(fieldErrors).forEach(fieldName => {
      highlightField(fieldName);
    });
  }, [fieldErrors, highlightField]);

  return {
    fieldErrors,
    processValidationError,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasErrors,
    highlightField,
    highlightAllErrorFields
  };
};
