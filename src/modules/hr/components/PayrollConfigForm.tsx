import React, { useState } from 'react';
import { Employee } from '../../../services/employeesApi';

interface PayrollConfigFormProps {
  employee: Employee;
  onSave: (configData: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'hourly';
    baseSalary: number;
    sbc: number;
  }) => void;
  onCancel: () => void;
  loading: boolean;
}

const PayrollConfigForm: React.FC<PayrollConfigFormProps> = ({
  employee,
  onSave,
  onCancel,
  loading
}) => {
  const [formData, setFormData] = useState({
    frequency: 'monthly' as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'hourly',
    baseSalary: employee.contract?.salary || employee.salary?.baseSalary || 0,
    sbc: employee.sbc || employee.contract?.salary || employee.salary?.baseSalary || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.frequency) {
      newErrors.frequency = 'La frecuencia de pago es obligatoria';
    }

    if (!formData.baseSalary || formData.baseSalary <= 0) {
      newErrors.baseSalary = 'El salario base debe ser mayor a 0';
    }

    if (!formData.sbc || formData.sbc <= 0) {
      newErrors.sbc = 'El SBC debe ser mayor a 0';
    }

    if (formData.sbc < formData.baseSalary) {
      newErrors.sbc = 'El SBC no puede ser menor al salario base';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Diario', description: 'Pago diario' },
    { value: 'weekly', label: 'Semanal', description: 'Pago semanal (lunes a domingo)' },
    { value: 'biweekly', label: 'Quincenal', description: 'Pago cada 15 días' },
    { value: 'monthly', label: 'Mensual', description: 'Pago mensual completo' },
    { value: 'hourly', label: 'Por Hora', description: 'Pago por hora trabajada' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información del empleado */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Empleado</h4>
        <p className="text-sm text-gray-600">
          {employee.personalInfo?.firstName} {employee.personalInfo?.lastName}
        </p>
        <p className="text-sm text-gray-500">
          {employee.position?.title} - {employee.position?.department}
        </p>
      </div>

      {/* Frecuencia de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Frecuencia de Pago *
        </label>
        <div className="space-y-2">
          {frequencyOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.frequency === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={formData.frequency === option.value}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
              {formData.frequency === option.value && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </label>
          ))}
        </div>
        {errors.frequency && (
          <p className="text-sm text-red-600 mt-1">{errors.frequency}</p>
        )}
      </div>

      {/* Salario base */}
      <div>
        <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-700 mb-1">
          Salario Base Mensual *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            id="baseSalary"
            min="0"
            step="0.01"
            value={formData.baseSalary}
            onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
            className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.baseSalary ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="25000.00"
          />
        </div>
        {errors.baseSalary && (
          <p className="text-sm text-red-600 mt-1">{errors.baseSalary}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Salario base mensual antes de deducciones
        </p>
      </div>

      {/* SBC */}
      <div>
        <label htmlFor="sbc" className="block text-sm font-medium text-gray-700 mb-1">
          Salario Base de Cotización (SBC) *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            id="sbc"
            min="0"
            step="0.01"
            value={formData.sbc}
            onChange={(e) => setFormData({ ...formData, sbc: parseFloat(e.target.value) || 0 })}
            className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.sbc ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="25000.00"
          />
        </div>
        {errors.sbc && (
          <p className="text-sm text-red-600 mt-1">{errors.sbc}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Base para cálculo de prestaciones sociales (IMSS, INFONAVIT)
        </p>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Configurando...' : 'Configurar Nómina'}
        </button>
      </div>
    </form>
  );
};

export default PayrollConfigForm;
