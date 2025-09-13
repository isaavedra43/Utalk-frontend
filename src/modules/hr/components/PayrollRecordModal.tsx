import React, { useState } from 'react';
import { 
  X, 
  DollarSign, 
  Calculator, 
  FileText, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface PayrollRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PayrollRecordData) => void;
  employeeId: string;
  baseSalary: number;
}

interface PayrollRecordData {
  periodStart: string;
  periodEnd: string;
  weekNumber: number;
  year: number;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  commissions: number;
  taxes: number;
  socialSecurity: number;
  healthInsurance: number;
  retirement: number;
  otherDeductions: number;
  notes: string;
  attachments: File[];
}

const PayrollRecordModal: React.FC<PayrollRecordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
  baseSalary
}) => {
  const [formData, setFormData] = useState<PayrollRecordData>({
    periodStart: '',
    periodEnd: '',
    weekNumber: 1,
    year: new Date().getFullYear(),
    baseSalary: baseSalary,
    overtime: 0,
    bonuses: 0,
    commissions: 0,
    taxes: 0,
    socialSecurity: 0,
    healthInsurance: 0,
    retirement: 0,
    otherDeductions: 0,
    notes: '',
    attachments: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PayrollRecordData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ 
      ...prev, 
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const grossSalary = formData.baseSalary + formData.overtime + formData.bonuses + formData.commissions;
    const totalDeductions = formData.taxes + formData.socialSecurity + formData.healthInsurance + formData.retirement + formData.otherDeductions;
    const netSalary = grossSalary - totalDeductions;
    
    return {
      grossSalary,
      totalDeductions,
      netSalary
    };
  };

  const calculateWeekNumber = (date: string) => {
    if (!date) return 1;
    
    const d = new Date(date);
    const start = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
    
    return weekNumber;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.periodStart) newErrors.periodStart = 'La fecha de inicio del período es requerida';
    if (!formData.periodEnd) newErrors.periodEnd = 'La fecha de fin del período es requerida';
    
    if (formData.periodStart && formData.periodEnd) {
      if (new Date(formData.periodStart) > new Date(formData.periodEnd)) {
        newErrors.periodEnd = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (formData.baseSalary < 0) newErrors.baseSalary = 'El salario base no puede ser negativo';
    if (formData.overtime < 0) newErrors.overtime = 'Las horas extra no pueden ser negativas';
    if (formData.bonuses < 0) newErrors.bonuses = 'Los bonos no pueden ser negativos';
    if (formData.commissions < 0) newErrors.commissions = 'Las comisiones no pueden ser negativas';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Calcular número de semana automáticamente
      const weekNumber = calculateWeekNumber(formData.periodStart);
      const dataWithWeek = { ...formData, weekNumber };
      
      onSubmit(dataWithWeek);
      onClose();
    }
  };

  if (!isOpen) return null;

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Agregar Registro de Nómina</h2>
              <p className="text-sm text-gray-600">Registra la nómina del período</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Período */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={formData.periodStart}
                onChange={(e) => handleInputChange('periodStart', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.periodStart ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.periodStart && (
                <p className="mt-1 text-sm text-red-600">{errors.periodStart}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin *
              </label>
              <input
                type="date"
                value={formData.periodEnd}
                onChange={(e) => handleInputChange('periodEnd', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.periodEnd ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.periodEnd && (
                <p className="mt-1 text-sm text-red-600">{errors.periodEnd}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min="2020"
                max="2030"
              />
            </div>
          </div>

          {/* Percepciones */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Percepciones
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salario Base
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.baseSalary}
                  onChange={(e) => handleInputChange('baseSalary', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.baseSalary ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.baseSalary && (
                  <p className="mt-1 text-sm text-red-600">{errors.baseSalary}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas Extra
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.overtime}
                  onChange={(e) => handleInputChange('overtime', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.overtime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.overtime && (
                  <p className="mt-1 text-sm text-red-600">{errors.overtime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bonos
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.bonuses}
                  onChange={(e) => handleInputChange('bonuses', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.bonuses ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.bonuses && (
                  <p className="mt-1 text-sm text-red-600">{errors.bonuses}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisiones
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.commissions}
                  onChange={(e) => handleInputChange('commissions', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.commissions ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.commissions && (
                  <p className="mt-1 text-sm text-red-600">{errors.commissions}</p>
                )}
              </div>
            </div>
          </div>

          {/* Deducciones */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              Deducciones
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISR (Impuesto Sobre la Renta)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.taxes}
                  onChange={(e) => handleInputChange('taxes', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IMSS (Seguridad Social)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.socialSecurity}
                  onChange={(e) => handleInputChange('socialSecurity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seguro de Salud
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.healthInsurance}
                  onChange={(e) => handleInputChange('healthInsurance', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ahorro para Retiro
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.retirement}
                  onChange={(e) => handleInputChange('retirement', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Otras Deducciones
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.otherDeductions}
                  onChange={(e) => handleInputChange('otherDeductions', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Resumen de cálculos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Resumen de Cálculos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Salario Bruto</p>
                <p className="text-xl font-bold text-green-600">
                  ${totals.grossSalary.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Deducciones</p>
                <p className="text-xl font-bold text-red-600">
                  ${totals.totalDeductions.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Salario Neto</p>
                <p className="text-xl font-bold text-blue-600">
                  ${totals.netSalary.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Cualquier información adicional sobre este período de nómina..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Archivos adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documentos de Soporte (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="payroll-file-upload"
              />
              <label
                htmlFor="payroll-file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Subir documentos de soporte
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG, DOC (máx. 10MB por archivo)
                </span>
              </label>
            </div>

            {/* Lista de archivos */}
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Verifica que todos los cálculos sean correctos antes de guardar</li>
                  <li>Los registros de nómina son auditados regularmente</li>
                  <li>Mantén documentación de soporte para todas las percepciones y deducciones</li>
                  <li>Los cambios posteriores requieren autorización del supervisor</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Guardar Nómina</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollRecordModal;
