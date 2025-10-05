import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock3,
  FileText,
  Upload as UploadIcon,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Send as SendIcon,
  Heart as HeartIcon,
  UserPlus as UserPlusIcon,
  Home as HomeIcon,
  Coffee as CoffeeIcon,
  DollarSign,
  User,
  XCircle
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { VacationRequest, CreateVacationRequest } from '../../../services/vacationsService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface VacationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: CreateVacationRequest, attachments: File[]) => Promise<void>;
  employeeId: string;
  employeeName: string;
  availableDays: number;
  request?: VacationRequest | null; // Para edición
  mode?: 'create' | 'edit';
  onCalculateDays?: (startDate: string, endDate: string) => Promise<number>;
  onCheckAvailability?: (startDate: string, endDate: string) => Promise<{ available: boolean; conflicts: string[] }>;
}

interface VacationFormData {
  startDate: string;
  endDate: string;
  type: 'vacation' | 'personal' | 'sick_leave' | 'maternity' | 'paternity' | 'unpaid' | 'compensatory';
  reason: string;
  comments: string;
  attachments: File[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const VacationRequestModal: React.FC<VacationRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeName,
  availableDays,
  request,
  mode = 'create',
  onCalculateDays,
  onCheckAvailability
}: VacationRequestModalProps) => {
  const { showSuccess, showError } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<VacationFormData>({
    startDate: '',
    endDate: '',
    type: 'vacation',
    reason: '',
    comments: '',
    attachments: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean; conflicts: string[] } | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (request && mode === 'edit') {
      setFormData({
        startDate: request.startDate,
        endDate: request.endDate,
        type: request.type,
        reason: request.reason,
        comments: request.comments || '',
        attachments: []
      });
      setCalculatedDays(request.days);
    }
  }, [request, mode]);

  // Calcular días automáticamente cuando cambian las fechas
  useEffect(() => {
    if (formData.startDate && formData.endDate && onCalculateDays) {
      const calculate = async () => {
        try {
          setIsCalculating(true);
          const days = await onCalculateDays(formData.startDate, formData.endDate);
          setCalculatedDays(days);
        } catch (error) {
          console.error('Error calculando días:', error);
          // Cálculo manual básico como fallback
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          setCalculatedDays(diffDays);
        } finally {
          setIsCalculating(false);
        }
      };
      calculate();
    } else if (formData.startDate && formData.endDate) {
      // Cálculo manual básico
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setCalculatedDays(diffDays);
    }
  }, [formData.startDate, formData.endDate, onCalculateDays]);

  // Verificar disponibilidad cuando cambian las fechas
  useEffect(() => {
    if (formData.startDate && formData.endDate && onCheckAvailability) {
      const check = async () => {
        try {
          setIsCheckingAvailability(true);
          const result = await onCheckAvailability(formData.startDate, formData.endDate);
          setAvailability(result);
        } catch (error) {
          console.error('Error verificando disponibilidad:', error);
          setAvailability(null);
        } finally {
          setIsCheckingAvailability(false);
        }
      };
      
      // Debounce para no hacer requests excesivos
      const timeout = setTimeout(check, 500);
      return () => clearTimeout(timeout);
    }
  }, [formData.startDate, formData.endDate, onCheckAvailability]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }

      // Verificar que no sea en el pasado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        newErrors.startDate = 'La fecha de inicio no puede ser en el pasado';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'El motivo es requerido';
    }

    if (calculatedDays > availableDays && formData.type === 'vacation') {
      newErrors.days = `No tienes suficientes días disponibles (${availableDays} disponibles)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setIsLoading(true);

      const requestData: CreateVacationRequest = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        type: formData.type,
        reason: formData.reason,
        comments: formData.comments || undefined
      };

      await onSubmit(requestData, formData.attachments);
      
      showSuccess(`Solicitud ${mode === 'edit' ? 'actualizada' : 'creada'} exitosamente`);
      handleClose();
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      showError(error instanceof Error ? error.message : 'Error procesando solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        startDate: '',
        endDate: '',
        type: 'vacation',
        reason: '',
        comments: '',
        attachments: []
      });
      setErrors({});
      setCalculatedDays(0);
      setAvailability(null);
      onClose();
    }
  };

  // Manejar cambio de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev: VacationFormData) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  // Remover archivo
  const removeFile = (index: number) => {
    setFormData((prev: VacationFormData) => ({
      ...prev,
      attachments: prev.attachments.filter((_: File, i: number) => i !== index)
    }));
  };

  // Obtener icono según tipo
  const getTypeIcon = () => {
    switch (formData.type) {
      case 'vacation': return <SendIcon className="h-5 w-5" />;
      case 'personal': return <User className="h-5 w-5" />;
      case 'sick_leave': return <HeartIcon className="h-5 w-5" />;
      case 'maternity': return <UserPlusIcon className="h-5 w-5" />;
      case 'paternity': return <HomeIcon className="h-5 w-5" />;
      case 'unpaid': return <DollarSign className="h-5 w-5" />;
      case 'compensatory': return <CoffeeIcon className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {getTypeIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {mode === 'edit' ? 'Editar Solicitud' : 'Nueva Solicitud de Vacaciones'}
                  </h3>
                  <p className="text-sm text-green-100">{employeeName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Balance Info */}
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Días disponibles: <span className="text-lg font-bold">{availableDays}</span>
                </span>
              </div>
              {calculatedDays > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-blue-700">
                    Solicitud: <span className="font-bold">{calculatedDays} días</span>
                  </span>
                  {calculatedDays > availableDays && formData.type === 'vacation' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                      Excede disponibles
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white">
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Tipo de Solicitud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Solicitud *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'vacation', label: 'Vacaciones', icon: SendIcon, color: 'blue' },
                      { value: 'personal', label: 'Personal', icon: User, color: 'purple' },
                      { value: 'sick_leave', label: 'Enfermedad', icon: HeartIcon, color: 'red' },
                      { value: 'maternity', label: 'Maternidad', icon: UserPlusIcon, color: 'pink' },
                      { value: 'paternity', label: 'Paternidad', icon: HomeIcon, color: 'indigo' },
                      { value: 'compensatory', label: 'Compensatorio', icon: CoffeeIcon, color: 'amber' },
                      { value: 'unpaid', label: 'Sin Goce', icon: DollarSign, color: 'gray' }
                    ].map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData((prev: VacationFormData) => ({ ...prev, type: value as VacationFormData['type'] }))}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          formData.type === value
                            ? `border-${color}-600 bg-${color}-50`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        disabled={isLoading}
                      >
                        <Icon className={`h-5 w-5 mx-auto mb-1 ${
                          formData.type === value ? `text-${color}-600` : 'text-gray-400'
                        }`} />
                        <span className={`text-xs font-medium ${
                          formData.type === value ? `text-${color}-900` : 'text-gray-600'
                        }`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: VacationFormData) => ({ ...prev, startDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Fin *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: VacationFormData) => ({ ...prev, endDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Días Calculados */}
                {(formData.startDate && formData.endDate) && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock3 className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Días solicitados:
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCalculating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        ) : (
                          <span className="text-2xl font-bold text-blue-600">{calculatedDays}</span>
                        )}
                        <span className="text-sm text-blue-700">días</span>
                      </div>
                    </div>
                    {errors.days && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{errors.days}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Disponibilidad */}
                {isCheckingAvailability && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent"></div>
                      <span className="text-sm text-yellow-800">Verificando disponibilidad...</span>
                    </div>
                  </div>
                )}

                {availability && !isCheckingAvailability && (
                  <div className={`border rounded-lg p-4 ${
                    availability.available 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {availability.available ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          availability.available ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {availability.available 
                            ? 'Fechas disponibles' 
                            : 'Conflicto de fechas detectado'
                          }
                        </p>
                        {availability.conflicts && availability.conflicts.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {availability.conflicts.map((conflict: string, index: number) => (
                              <li key={index} className="text-xs text-red-700">• {conflict}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo de la Solicitud *
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev: VacationFormData) => ({ ...prev, reason: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.reason ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    placeholder="Ej: Vacaciones familiares, Semana Santa, etc."
                    disabled={isLoading}
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                  )}
                </div>

                {/* Comentarios Adicionales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentarios Adicionales (Opcional)
                  </label>
                  <textarea
                    value={formData.comments}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev: VacationFormData) => ({ ...prev, comments: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                    placeholder="Información adicional relevante..."
                    disabled={isLoading}
                  />
                </div>

                {/* Archivos Adjuntos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivos Adjuntos (Opcional)
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <UploadIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Certificados médicos, justificantes, etc.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      disabled={isLoading}
                    >
                      Seleccionar Archivos
                    </button>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.attachments.map((file: File, index: number) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Información Importante */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900 mb-1">
                        Información Importante
                      </p>
                      <ul className="text-xs text-yellow-800 space-y-1">
                        <li>• Las solicitudes deben hacerse con al menos 30 días de anticipación</li>
                        <li>• Los días se contabilizan excluyendo fines de semana</li>
                        <li>• Las solicitudes pendientes pueden ser editadas o canceladas</li>
                        <li>• Una vez aprobadas, contacta a RH para cualquier cambio</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isLoading || (availability && !availability.available)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>{mode === 'edit' ? 'Actualizar Solicitud' : 'Enviar Solicitud'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VacationRequestModal;
