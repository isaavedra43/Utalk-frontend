import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Clock, 
  UserX, 
  DollarSign, 
  Minus, 
  Plus, 
  FileText, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Calculator,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Wrench
} from 'lucide-react';
import { extrasService, MovementRequest } from '../../../services/extrasService';
import { useNotifications } from '../../../contexts/NotificationContext';

interface EmployeeExtrasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExtrasRecordData) => void;
  employeeId: string;
  employeeSalary: number;
  employeeName: string;
}

interface ExtrasRecordData {
  id?: string;
  type: 'absence' | 'overtime' | 'loan' | 'discount' | 'bonus' | 'deduction' | 'damage';
  date: string;
  amount: number;
  hours?: number;
  reason: string;
  description: string;
  justification: string;
  attachments: File[];
  status: 'pending' | 'approved' | 'rejected';
  payrollPeriod?: string;
  autoCalculated: boolean;
  metadata?: {
    hourlyRate?: number;
    overtimeMultiplier?: number;
    loanTerms?: {
      installments: number;
      monthlyPayment: number;
      startDate: string;
      endDate: string;
    };
  };
}

const EmployeeExtrasModal: React.FC<EmployeeExtrasModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
  employeeSalary,
  employeeName
}) => {
  const { showSuccess, showError } = useNotifications();
  const [formData, setFormData] = useState<ExtrasRecordData>({
    type: 'absence',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    hours: 0,
    reason: '',
    description: '',
    justification: '',
    attachments: [],
    status: 'pending',
    autoCalculated: true,
    metadata: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Calcular monto automáticamente según el tipo
  const calculateAmount = useCallback(() => {
    try {
      // Usar el servicio de cálculo local como fallback
      const amount = extrasService.calculateLocalAmount(employeeSalary, {
        type: formData.type === 'absence' ? 'absence' : 
              formData.type === 'overtime' ? 'overtime' :
              formData.type === 'loan' ? 'loan' :
              formData.type === 'discount' ? 'deduction' :
              formData.type === 'bonus' ? 'bonus' :
              formData.type === 'deduction' ? 'deduction' : 'damage',
        hours: formData.hours,
        duration: 1, // Por defecto 1 día para ausencias
        overtimeType: 'regular',
        absenceType: 'other',
        totalAmount: formData.amount,
        amount: formData.amount
      });

      // Aplicar signo según el tipo (positivo = suma, negativo = resta)
      if (['absence', 'loan', 'discount', 'deduction', 'damage'].includes(formData.type)) {
        return -Math.abs(amount);
      } else {
        return Math.abs(amount);
      }
    } catch (error) {
      console.error('Error calculando monto:', error);
      return 0;
    }
  }, [employeeSalary, formData.type, formData.hours, formData.amount]);

  useEffect(() => {
    if (formData.autoCalculated) {
      const calculated = calculateAmount();
      setCalculatedAmount(calculated);
      setFormData(prev => ({ 
        ...prev, 
        amount: Math.abs(calculated),
        metadata: {
          ...prev.metadata,
          hourlyRate: employeeSalary / 30 / 8,
          overtimeMultiplier: 1.5
        }
      }));
    }
  }, [formData.type, formData.hours, formData.autoCalculated, employeeSalary, calculateAmount]);

  const handleInputChange = (field: keyof ExtrasRecordData, value: string | number | File[] | boolean) => {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.reason.trim()) newErrors.reason = 'La razón es requerida';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    
    if (formData.type === 'overtime' && (!formData.hours || formData.hours <= 0)) {
      newErrors.hours = 'Las horas extra son requeridas';
    }
    
    if (!formData.autoCalculated && (!formData.amount || formData.amount <= 0)) {
      newErrors.amount = 'El monto es requerido';
    }

    if (formData.type === 'loan' && formData.amount > employeeSalary * 3) {
      newErrors.amount = 'El préstamo no puede exceder 3 meses de salario';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Subir archivos primero si los hay
      let attachmentUrls: string[] = [];
      if (formData.attachments && formData.attachments.length > 0) {
        attachmentUrls = await extrasService.uploadFiles(
          formData.attachments, 
          employeeId, 
          formData.type
        );
      }

      // Preparar datos para la API
      const movementData: MovementRequest = {
        type: formData.type === 'absence' ? 'absence' : 
              formData.type === 'overtime' ? 'overtime' :
              formData.type === 'loan' ? 'loan' :
              formData.type === 'discount' ? 'deduction' :
              formData.type === 'bonus' ? 'bonus' :
              formData.type === 'deduction' ? 'deduction' : 'damage',
        date: formData.date,
        description: formData.description,
        reason: formData.reason,
        location: 'office',
        justification: formData.justification,
        attachments: attachmentUrls
      };

      // Agregar campos específicos según el tipo
      if (formData.type === 'overtime') {
        movementData.hours = formData.hours;
        movementData.overtimeType = 'regular';
      } else if (formData.type === 'absence') {
        movementData.duration = 1;
        movementData.absenceType = 'other';
      } else if (formData.type === 'loan') {
        movementData.totalAmount = Math.abs(calculatedAmount);
        movementData.totalInstallments = 12;
      } else if (['bonus', 'discount', 'deduction', 'damage'].includes(formData.type)) {
        movementData.amount = Math.abs(calculatedAmount);
      }

      // Registrar el movimiento
      const result = await extrasService.registerMovement(employeeId, movementData);
      
      console.log('✅ Extra registrado exitosamente:', result);
      
      // Mostrar notificación de éxito
      showSuccess(
        'Extra registrado exitosamente',
        `${getTypeLabel(formData.type)} registrado para ${employeeName}`
      );
      
      // Enviar datos al componente padre
      const finalAmount = formData.autoCalculated ? calculatedAmount : 
        (formData.type === 'absence' || formData.type === 'loan' || formData.type === 'discount' || formData.type === 'deduction' || formData.type === 'damage' ? -formData.amount : formData.amount);
      
      onSubmit({
        ...formData,
        amount: finalAmount,
        id: result.id
      });
      onClose();
    } catch (error) {
      console.error('Error registrando extra:', error);
      showError(
        'Error al registrar extra',
        'No se pudo registrar el extra. Por favor intenta de nuevo.'
      );
      setErrors({ submit: 'Error al registrar el extra. Por favor intenta de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'absence': return <UserX className="h-5 w-5 text-red-500" />;
      case 'overtime': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'loan': return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'discount': return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'bonus': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'deduction': return <Minus className="h-5 w-5 text-orange-500" />;
      case 'damage': return <Wrench className="h-5 w-5 text-red-600" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'absence': return 'Falta';
      case 'overtime': return 'Horas Extra';
      case 'loan': return 'Préstamo';
      case 'discount': return 'Descuento';
      case 'bonus': return 'Bono';
      case 'deduction': return 'Deducción';
      case 'damage': return 'Daño/Rotura';
      default: return 'Otro';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Plus className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registrar Extra</h2>
              <p className="text-sm text-gray-600">{employeeName}</p>
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
          {/* Tipo de Extra */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Registro *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'absence', label: 'Falta', color: 'red' },
                { value: 'overtime', label: 'Horas Extra', color: 'blue' },
                { value: 'loan', label: 'Préstamo', color: 'purple' },
                { value: 'discount', label: 'Descuento', color: 'orange' },
                { value: 'bonus', label: 'Bono', color: 'green' },
                { value: 'deduction', label: 'Deducción', color: 'red' },
                { value: 'damage', label: 'Daño/Rotura', color: 'red' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('type', type.value)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    formData.type === type.value
                      ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(type.value)}
                    <span>{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fecha y Cálculo Automático */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoCalculated"
                checked={formData.autoCalculated}
                onChange={(e) => handleInputChange('autoCalculated', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="autoCalculated" className="ml-2 block text-sm text-gray-900">
                Calcular monto automáticamente
              </label>
            </div>
          </div>

          {/* Campos específicos según el tipo */}
          {formData.type === 'overtime' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas Extra *
              </label>
              <input
                type="number"
                step="0.25"
                value={formData.hours || ''}
                onChange={(e) => handleInputChange('hours', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.hours ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: 2.5"
              />
              {errors.hours && (
                <p className="mt-1 text-sm text-red-600">{errors.hours}</p>
              )}
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.autoCalculated ? 'Monto Calculado' : 'Monto *'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                value={formData.autoCalculated ? Math.abs(calculatedAmount) : (formData.amount || '')}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                disabled={formData.autoCalculated}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  formData.autoCalculated ? 'bg-gray-50 text-gray-600' : ''
                } ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
              />
            </div>
            {formData.autoCalculated && (
              <p className="mt-1 text-sm text-gray-600">
                {calculatedAmount >= 0 ? '+ Se agregará a la nómina' : '- Se descontará de la nómina'}
              </p>
            )}
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Cálculo detallado para horas extra */}
          {formData.type === 'overtime' && formData.autoCalculated && formData.hours && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Cálculo de Horas Extra</span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>Salario mensual: ${employeeSalary.toLocaleString()}</p>
                <p>Salario por hora: ${(employeeSalary / 30 / 8).toFixed(2)}</p>
                <p>Multiplicador: 1.5x (hora extra normal)</p>
                <p>Horas: {formData.hours}</p>
                <p className="font-semibold">Total: ${Math.abs(calculatedAmount).toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={
                formData.type === 'absence' ? 'Ej: Enfermedad, cita médica' :
                formData.type === 'overtime' ? 'Ej: Proyecto urgente, reunión importante' :
                formData.type === 'loan' ? 'Ej: Emergencia médica, gastos familiares' :
                'Especifica la razón'
              }
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Detallada *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Proporciona más detalles sobre este registro..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Justificación (para faltas y préstamos) */}
          {(formData.type === 'absence' || formData.type === 'loan' || formData.type === 'damage') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificación
              </label>
              <textarea
                value={formData.justification}
                onChange={(e) => handleInputChange('justification', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder={
                  formData.type === 'absence' ? 'Explicación médica o personal...' :
                  formData.type === 'loan' ? 'Motivo del préstamo y plan de pago...' :
                  'Detalles del daño y responsabilidad...'
                }
              />
            </div>
          )}

          {/* Archivos adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidencia/Documentos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="extras-file-upload"
              />
              <label
                htmlFor="extras-file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {formData.type === 'absence' && 'Subir justificante médico, comprobantes...'}
                  {formData.type === 'loan' && 'Subir pagaré firmado, identificación...'}
                  {formData.type === 'overtime' && 'Subir autorización, reporte de actividades...'}
                  {formData.type === 'damage' && 'Subir fotos del daño, cotizaciones...'}
                  {!['absence', 'loan', 'overtime', 'damage'].includes(formData.type) && 'Subir documentos de soporte...'}
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
                  <li>Este registro se reflejará automáticamente en la siguiente nómina</li>
                  <li>Los préstamos requieren documentación y autorización del supervisor</li>
                  <li>Las faltas sin justificación afectan el salario mensual</li>
                  <li>Las horas extra deben estar pre-autorizadas por el supervisor</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Resumen del impacto */}
          {formData.autoCalculated && calculatedAmount !== 0 && (
            <div className={`border-2 rounded-lg p-4 ${
              calculatedAmount >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center space-x-2">
                {calculatedAmount >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  calculatedAmount >= 0 ? 'text-green-800' : 'text-red-800'
                }`}>
                  Impacto en Nómina: {calculatedAmount >= 0 ? '+' : ''}${Math.abs(calculatedAmount).toFixed(2)}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                calculatedAmount >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {calculatedAmount >= 0 
                  ? 'Se agregará como percepción adicional' 
                  : 'Se descontará del salario base'
                }
              </p>
            </div>
          )}

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
              disabled={isLoading}
              className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Registrar {getTypeLabel(formData.type)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeExtrasModal;
