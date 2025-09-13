import React, { useState, useCallback, useRef } from 'react';
import { 
  X, 
  Clock, 
  UserX, 
  Minus, 
  FileText, 
  Upload, 
  CheckCircle,
  CreditCard,
  TrendingUp,
  Wrench,
  Trash2
} from 'lucide-react';
import { extrasService } from '../../../services/extrasService';
import { useNotifications } from '../../../contexts/NotificationContext';

interface ExtrasFormData {
  id?: string;
  type: string;
  date: string;
  amount: number;
  hours?: number;
  reason?: string;
  description?: string;
  justification?: string;
  attachments?: File[];
  status?: string;
  autoCalculated?: boolean;
  metadata?: Record<string, unknown>;
}

interface EmployeeExtrasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExtrasFormData) => void;
  employeeId: string;
  employeeSalary: number;
  employeeName: string;
}

interface MovementFormData {
  type: 'absence' | 'overtime' | 'loan' | 'bonus' | 'deduction' | 'damage';
  date: string;
  description: string;
  reason: string;
  location: 'office' | 'remote' | 'field';
  justification: string;
  
  // Campos específicos por tipo
  hours?: number;
  hourlyRate?: number;
  duration?: number;
  totalAmount?: number;
  totalInstallments?: number;
  amount?: number;
  
  // Tipos específicos
  absenceType?: 'sick_leave' | 'personal_leave' | 'vacation' | 'emergency' | 'medical_appointment' | 'other';
  overtimeType?: 'regular' | 'weekend' | 'holiday';
  bonusType?: 'performance' | 'attendance' | 'special' | 'holiday';
  deductionType?: 'voluntary' | 'disciplinary' | 'equipment' | 'other';
  // discountType?: 'early_payment' | 'loyalty' | 'volume' | 'special' | 'other';
  damageType?: 'equipment' | 'property' | 'vehicle' | 'other';
  
  // Archivos
  attachments: File[];
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<MovementFormData>({
    type: 'absence',
    date: new Date().toISOString().split('T')[0],
    description: '',
    reason: '',
    location: 'office',
    justification: '',
    attachments: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Resetear formulario cuando cambia el tipo
  const resetFormForType = useCallback((type: MovementFormData['type']) => {
    setFormData(prev => ({
      type,
      date: prev.date,
      description: '',
      reason: '',
      location: 'office',
      justification: '',
      attachments: [],
      // Campos específicos por defecto
      ...(type === 'overtime' && {
        hours: 1,
        hourlyRate: (employeeSalary / 30) / 8,
        overtimeType: 'regular' as const
      }),
      ...(type === 'absence' && {
        duration: 1,
        absenceType: 'other' as const
      }),
      ...(type === 'loan' && {
        totalAmount: 1000,
        totalInstallments: 12
      }),
      ...(type === 'bonus' && {
        amount: 500,
        bonusType: 'performance' as const
      }),
      ...(type === 'deduction' && {
        amount: 100,
        deductionType: 'voluntary' as const
      }),
      // Discount no está en el backend, se mapea a deduction
      ...(type === 'damage' && {
        amount: 500,
        damageType: 'equipment' as const
      })
    }));
    setErrors({});
  }, [employeeSalary]);

  // Subir archivos al servidor usando el servicio de extras
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    
    try {
      setUploadProgress(25);
      console.log('Subiendo archivos usando extrasService...');
      
      // Usar el método del servicio de extras que ya está implementado
      const fileUrls = await extrasService.uploadFiles(files, employeeId, formData.type);
      
      setUploadProgress(100);
      console.log('Archivos subidos exitosamente:', fileUrls);
      
      // El servicio devuelve URLs, pero necesitamos extraer los IDs si es posible
      // Por ahora devolvemos las URLs como están
      return fileUrls;
      
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadProgress(0);
      throw error;
    }
  };

  // Obtener campos específicos según el tipo
  const getTypeSpecificFields = (data: MovementFormData) => {
    switch (data.type) {
      case 'loan':
        return {
          totalAmount: parseFloat(data.totalAmount?.toString() || '0') || 0,
          totalInstallments: parseInt(data.totalInstallments?.toString() || '1') || 1
        };
        
      case 'overtime':
        return {
          hours: parseFloat(data.hours?.toString() || '0') || 0,
          hourlyRate: parseFloat(data.hourlyRate?.toString() || '0') || 0,
          overtimeType: data.overtimeType || 'regular'
        };
        
      case 'absence':
        return {
          duration: parseFloat(data.duration?.toString() || '1') || 1,
          absenceType: data.absenceType || 'other'
        };
        
      case 'bonus':
        return {
          amount: parseFloat(data.amount?.toString() || '0') || 0,
          bonusType: data.bonusType || 'performance'
        };
        
      case 'deduction':
        return {
          amount: parseFloat(data.amount?.toString() || '0') || 0,
          deductionType: data.deductionType || 'voluntary'
        };
        
        // discount se mapea a deduction en el backend
        
      case 'damage':
        return {
          amount: parseFloat(data.amount?.toString() || '0') || 0,
          damageType: data.damageType || 'equipment'
        };
        
      default:
        return {};
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validaciones base
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.reason.trim()) newErrors.reason = 'La razón es requerida';

    // Validar fecha no futura
    const movementDate = new Date(formData.date);
    const today = new Date();
    if (movementDate > today) {
      newErrors.date = 'La fecha no puede ser futura';
    }

    // Validaciones específicas por tipo
    switch (formData.type) {
      case 'loan':
        if (!formData.totalAmount || formData.totalAmount <= 0) {
          newErrors.totalAmount = 'El monto total debe ser mayor a 0';
        }
        if (!formData.totalInstallments || formData.totalInstallments <= 0) {
          newErrors.totalInstallments = 'El número de cuotas debe ser mayor a 0';
        }
        if (!formData.attachments || formData.attachments.length === 0) {
          newErrors.attachments = 'Los documentos son requeridos para préstamos';
        }
        break;
        
      case 'overtime':
        if (!formData.hours || formData.hours <= 0) {
          newErrors.hours = 'Las horas trabajadas deben ser mayor a 0';
        }
        break;
        
      case 'absence':
        if (!formData.duration || formData.duration <= 0) {
          newErrors.duration = 'La duración debe ser mayor a 0';
        }
        if (!formData.absenceType) {
          newErrors.absenceType = 'El tipo de ausencia es requerido';
        }
        break;
        
      case 'bonus':
        if (!formData.amount || formData.amount <= 0) {
          newErrors.amount = 'El monto del bono debe ser mayor a 0';
        }
        if (!formData.bonusType) {
          newErrors.bonusType = 'El tipo de bono es requerido';
        }
        break;
        
      case 'deduction':
        if (!formData.amount || formData.amount <= 0) {
          newErrors.amount = 'El monto de deducción debe ser mayor a 0';
        }
        if (!formData.deductionType) {
          newErrors.deductionType = 'El tipo de deducción es requerido';
        }
        break;
        
        // discount se maneja como deduction
        
      case 'damage':
        if (!formData.amount || formData.amount <= 0) {
          newErrors.amount = 'El monto del daño debe ser mayor a 0';
        }
        if (!formData.damageType) {
          newErrors.damageType = 'El tipo de daño es requerido';
        }
        if (!formData.attachments || formData.attachments.length === 0) {
          newErrors.attachments = 'La evidencia fotográfica es requerida para daños';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // PASO 1: Subir archivos si existen
      let attachmentIds: string[] = [];
      if (formData.attachments && formData.attachments.length > 0) {
        console.log('Subiendo archivos...');
        try {
          attachmentIds = await uploadFiles(formData.attachments);
          console.log('Archivos subidos exitosamente:', attachmentIds);
        } catch (uploadError) {
          console.error('Error en la subida de archivos:', uploadError);
          throw new Error(`Error subiendo archivos: ${uploadError instanceof Error ? uploadError.message : 'Error desconocido'}`);
        }
      }

      // PASO 2: Preparar datos del movimiento
      const movementData = {
        type: formData.type,
        date: formData.date,
        description: formData.description,
        reason: formData.reason,
        location: formData.location,
        justification: formData.justification || '',
        attachments: attachmentIds,
        // Campos específicos por tipo
        ...getTypeSpecificFields(formData)
      };

      console.log('Registrando movimiento:', movementData);

      // PASO 3: Registrar movimiento
      const result = await extrasService.registerMovement(employeeId, movementData);

      if (result) {
        console.log('✅ Movimiento registrado exitosamente:', result);
        
        showSuccess(
          'Movimiento registrado exitosamente',
          `${getTypeLabel(formData.type)} registrado para ${employeeName}`
        );
        
        // Enviar los datos del formulario en lugar del resultado del backend
        const formDataToSubmit: ExtrasFormData = {
          id: result.id,
          type: formData.type,
          date: formData.date,
          amount: formData.amount || formData.totalAmount || 0,
          hours: formData.hours,
          reason: formData.reason,
          description: formData.description,
          justification: formData.justification,
          attachments: formData.attachments, // Mantener los archivos originales
          status: 'pending',
          autoCalculated: false,
          metadata: getTypeSpecificFields(formData)
        };
        
        onSubmit(formDataToSubmit);
        onClose();
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }

    } catch (error) {
      console.error('Error registrando movimiento:', error);
      showError(
        'Error al registrar movimiento',
        error instanceof Error ? error.message : 'Error desconocido'
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Manejar cambio de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
    
    if (errors.attachments) {
      setErrors(prev => ({ ...prev, attachments: '' }));
    }
  };

  // Remover archivo
  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Manejar cambio de campos
  const handleFieldChange = (field: string, value: string | number | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Obtener icono del tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'absence': return <UserX className="h-5 w-5 text-red-500" />;
      case 'overtime': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'loan': return <CreditCard className="h-5 w-5 text-purple-500" />;
      // discount no disponible
      case 'bonus': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'deduction': return <Minus className="h-5 w-5 text-orange-500" />;
      case 'damage': return <Wrench className="h-5 w-5 text-red-600" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Obtener etiqueta del tipo
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'absence': return 'Falta';
      case 'overtime': return 'Horas Extra';
      case 'loan': return 'Préstamo';
      // discount no disponible
      case 'bonus': return 'Bono';
      case 'deduction': return 'Deducción';
      case 'damage': return 'Daño/Rotura';
      default: return 'Otro';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getTypeIcon(formData.type)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Registrar {getTypeLabel(formData.type)}
              </h2>
              <p className="text-sm text-gray-600">
                Empleado: {employeeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selector de tipo */}
          <div className="grid grid-cols-7 gap-3">
          {[  
            { value: 'absence', label: 'Falta', icon: UserX, color: 'red' },
            { value: 'overtime', label: 'Horas Extra', icon: Clock, color: 'blue' },
            { value: 'loan', label: 'Préstamo', icon: CreditCard, color: 'purple' },
            { value: 'bonus', label: 'Bono', icon: TrendingUp, color: 'green' },
            { value: 'deduction', label: 'Deducción', icon: Minus, color: 'orange' },
            { value: 'damage', label: 'Daño', icon: Wrench, color: 'red' }
          ].map((type) => {
              const Icon = type.icon;
              const isSelected = formData.type === type.value;
              
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => resetFormForType(type.value as MovementFormData['type'])}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Campos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="office">Oficina</option>
                <option value="remote">Remoto</option>
                <option value="field">Campo</option>
              </select>
            </div>
          </div>

          {/* Campos específicos por tipo */}
          {formData.type === 'overtime' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas trabajadas *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.hours || ''}
                  onChange={(e) => handleFieldChange('hours', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.hours ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hours && (
                  <p className="mt-1 text-sm text-red-600">{errors.hours}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de horas extra
                </label>
                <select
                  value={formData.overtimeType || 'regular'}
                  onChange={(e) => handleFieldChange('overtimeType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="regular">Regular (1.5x)</option>
                  <option value="weekend">Fin de semana (2x)</option>
                  <option value="holiday">Festivo (3x)</option>
                </select>
              </div>
            </div>
          )}

          {formData.type === 'absence' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (días) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.duration || ''}
                  onChange={(e) => handleFieldChange('duration', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de ausencia *
                </label>
                <select
                  value={formData.absenceType || 'other'}
                  onChange={(e) => handleFieldChange('absenceType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.absenceType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="sick_leave">Enfermedad</option>
                  <option value="personal_leave">Asunto personal</option>
                  <option value="vacation">Vacaciones</option>
                  <option value="emergency">Emergencia</option>
                  <option value="medical_appointment">Cita médica</option>
                  <option value="other">Otro</option>
                </select>
                {errors.absenceType && (
                  <p className="mt-1 text-sm text-red-600">{errors.absenceType}</p>
                )}
              </div>
            </div>
          )}

          {formData.type === 'loan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto total *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalAmount || ''}
                  onChange={(e) => handleFieldChange('totalAmount', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.totalAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalAmount}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de cuotas *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalInstallments || ''}
                  onChange={(e) => handleFieldChange('totalInstallments', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.totalInstallments ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.totalInstallments && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalInstallments}</p>
                )}
              </div>
            </div>
          )}

          {(['bonus', 'deduction', 'damage'].includes(formData.type)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={
                    formData.type === 'bonus' ? formData.bonusType :
                    formData.type === 'deduction' ? formData.deductionType :
                    formData.type === 'damage' ? formData.damageType : ''
                  }
                  onChange={(e) => {
                    const field = 
                      formData.type === 'bonus' ? 'bonusType' :
                      formData.type === 'deduction' ? 'deductionType' :
                      formData.type === 'damage' ? 'damageType' : '';
                    handleFieldChange(field, e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[formData.type + 'Type'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {formData.type === 'bonus' && (
                    <>
                      <option value="performance">Desempeño</option>
                      <option value="attendance">Asistencia</option>
                      <option value="special">Especial</option>
                      <option value="holiday">Festivo</option>
                    </>
                  )}
                  {formData.type === 'deduction' && (
                    <>
                      <option value="voluntary">Voluntaria</option>
                      <option value="disciplinary">Disciplinaria</option>
                      <option value="equipment">Equipo</option>
                      <option value="other">Otra</option>
                    </>
                  )}
                  {formData.type === 'damage' && (
                    <>
                      <option value="equipment">Equipo</option>
                      <option value="property">Propiedad</option>
                      <option value="vehicle">Vehículo</option>
                      <option value="other">Otro</option>
                    </>
                  )}
                </select>
                {errors[formData.type + 'Type'] && (
                  <p className="mt-1 text-sm text-red-600">{errors[formData.type + 'Type']}</p>
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descripción detallada del movimiento..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleFieldChange('reason', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Razón del movimiento..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Justificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justificación
            </label>
            <textarea
              value={formData.justification}
              onChange={(e) => handleFieldChange('justification', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Justificación adicional..."
            />
          </div>

          {/* Archivos adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivos adjuntos
              {(['loan', 'damage'].includes(formData.type)) && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Arrastra archivos aquí o 
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 ml-1"
                >
                  selecciona archivos
                </button>
              </p>
              <p className="text-xs text-gray-500">
                Formatos permitidos: PDF, imágenes, documentos
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Lista de archivos */}
            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.attachments && (
              <p className="mt-1 text-sm text-red-600">{errors.attachments}</p>
            )}
          </div>

          {/* Progress bar para subida */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

          {errors.submit && (
            <p className="text-sm text-red-600 text-center">{errors.submit}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default EmployeeExtrasModal;