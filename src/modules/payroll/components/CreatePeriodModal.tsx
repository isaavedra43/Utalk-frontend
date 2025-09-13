// ===================================================================
// MODAL PARA CREAR NUEVO PERÍODO DE NÓMINA
// ===================================================================

import React, { useState } from 'react';
import { X, Calendar, Settings, AlertCircle } from 'lucide-react';

interface CreatePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (periodData: any) => Promise<void>;
}

const CreatePeriodModal: React.FC<CreatePeriodModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    frequency: 'monthly',
    configurations: {
      calculateTaxes: true,
      includeOvertime: true,
      applyAbsenceDeductions: true,
      includeLoans: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start >= end) {
        newErrors.dateRange = 'La fecha de inicio debe ser anterior a la fecha de fin';
      }

      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 31) {
        newErrors.dateRange = 'El período no puede ser mayor a 31 días';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name.startsWith('configurations.')) {
        const configKey = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          configurations: {
            ...prev.configurations,
            [configKey]: checkbox.checked
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Generar nombre automático basado en fechas
  const generateName = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        // Mismo mes
        const monthName = monthNames[start.getMonth()];
        const year = start.getFullYear();
        return `${monthName} ${year}`;
      } else {
        // Diferentes meses
        const startMonth = monthNames[start.getMonth()];
        const endMonth = monthNames[end.getMonth()];
        const year = end.getFullYear();
        return `${startMonth} - ${endMonth} ${year}`;
      }
    }
    return '';
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      
      // Resetear formulario
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        frequency: 'monthly',
        configurations: {
          calculateTaxes: true,
          includeOvertime: true,
          applyAbsenceDeductions: true,
          includeLoans: true
        }
      });
      setErrors({});
    } catch (error) {
      // Error manejado por el componente padre
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Nuevo Período de Nómina
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Período
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Septiembre 2025"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, name: generateName() }))}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Auto
                </button>
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Error de rango de fechas */}
            {errors.dateRange && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.dateRange}
              </div>
            )}

            {/* Frecuencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            {/* Configuraciones */}
            <div>
              <div className="flex items-center mb-3">
                <Settings className="w-5 h-5 text-gray-600 mr-2" />
                <label className="text-sm font-medium text-gray-700">
                  Configuraciones
                </label>
              </div>
              
              <div className="space-y-3 pl-7">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="configurations.calculateTaxes"
                    checked={formData.configurations.calculateTaxes}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Calcular impuestos automáticamente
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="configurations.includeOvertime"
                    checked={formData.configurations.includeOvertime}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Incluir horas extras
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="configurations.applyAbsenceDeductions"
                    checked={formData.configurations.applyAbsenceDeductions}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Aplicar deducciones por faltas
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="configurations.includeLoans"
                    checked={formData.configurations.includeLoans}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Incluir préstamos y adelantos
                  </span>
                </label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Período'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePeriodModal;
