import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, Users } from 'lucide-react';
import { PayrollPeriod } from '../../../types/payrollGeneral';

interface PayrollPeriodModalProps {
  period?: PayrollPeriod | null;
  onClose: () => void;
  onSubmit: (data: Partial<PayrollPeriod>) => void;
  loading: boolean;
}

export const PayrollPeriodModal: React.FC<PayrollPeriodModalProps> = ({
  period,
  onClose,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    frequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewData, setPreviewData] = useState({
    workDays: 0,
    totalEmployees: 0,
    estimatedPayroll: 0
  });

  useEffect(() => {
    if (period) {
      setFormData({
        name: period.name,
        startDate: period.startDate.split('T')[0],
        endDate: period.endDate.split('T')[0],
        frequency: period.frequency
      });
    } else {
      // Auto-generar fechas basadas en la frecuencia
      generateDefaultDates('monthly');
    }
  }, [period]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      calculatePreview();
    }
  }, [formData.startDate, formData.endDate, formData.frequency]);

  const generateDefaultDates = (frequency: 'weekly' | 'biweekly' | 'monthly') => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (frequency) {
      case 'weekly':
        // Semana actual (lunes a domingo)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() + 1);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
        
      case 'biweekly':
        // Quincena actual
        if (today.getDate() <= 15) {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 15);
        } else {
          startDate = new Date(today.getFullYear(), today.getMonth(), 16);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }
        break;
        
      case 'monthly':
      default:
        // Mes actual
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      frequency,
      name: generatePeriodName(startDate, endDate, frequency)
    }));
  };

  const generatePeriodName = (startDate: Date, endDate: Date, frequency: string) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    switch (frequency) {
      case 'weekly':
        return `Semana del ${startDate.getDate()} al ${endDate.getDate()} de ${months[startDate.getMonth()]} ${startDate.getFullYear()}`;
      case 'biweekly':
        if (startDate.getDate() === 1) {
          return `Primera Quincena de ${months[startDate.getMonth()]} ${startDate.getFullYear()}`;
        } else {
          return `Segunda Quincena de ${months[startDate.getMonth()]} ${startDate.getFullYear()}`;
        }
      case 'monthly':
      default:
        return `${months[startDate.getMonth()]} ${startDate.getFullYear()}`;
    }
  };

  const calculatePreview = async () => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    // Calcular días laborales (excluyendo fines de semana)
    let workDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No domingo ni sábado
        workDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // TODO: Obtener datos reales del backend
    // const employeeCount = await payrollService.getEmployeeCount();
    // const averageSalary = await payrollService.getAverageSalary();
    
    // Mock data mientras se conecta con el backend
    const mockEmployeeCount = 25;
    const mockAverageSalary = 18000;
    
    setPreviewData({
      workDays,
      totalEmployees: mockEmployeeCount,
      estimatedPayroll: mockEmployeeCount * mockAverageSalary
    });
  };

  const handleFrequencyChange = (frequency: 'weekly' | 'biweekly' | 'monthly') => {
    setFormData(prev => ({ ...prev, frequency }));
    generateDefaultDates(frequency);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del período es obligatorio';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es obligatoria';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start >= end) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }

      // Validar que no se traslape con períodos existentes
      // TODO: Implementar validación con backend
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const periodData: Partial<PayrollPeriod> = {
      name: formData.name,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      frequency: formData.frequency
    };

    onSubmit(periodData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {period ? 'Editar Período de Nómina' : 'Configurar Nuevo Período de Nómina'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Frecuencia de Pago */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Frecuencia de Pago
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'weekly', label: 'Semanal', icon: Calendar },
                { value: 'biweekly', label: 'Quincenal', icon: Calendar },
                { value: 'monthly', label: 'Mensual', icon: Calendar }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleFrequencyChange(value as any)}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    formData.frequency === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre del Período */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Período
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Enero 2024, Primera Quincena Febrero, etc."
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Vista Previa */}
          {previewData.workDays > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa del Período</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Días Laborales</p>
                    <p className="font-semibold text-gray-900">{previewData.workDays} días</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Empleados</p>
                    <p className="font-semibold text-gray-900">{previewData.totalEmployees}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nómina Estimada</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(previewData.estimatedPayroll)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuraciones Adicionales */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-3">Configuraciones del Período</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-blue-800">Calcular automáticamente deducciones de impuestos</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-blue-800">Incluir cálculo de horas extra</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-blue-800">Aplicar deducciones por faltas</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-blue-800">Incluir préstamos y adelantos</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {period ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {period ? 'Actualizar Período' : 'Crear Período'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
