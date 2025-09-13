import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Calculator,
  Info
} from 'lucide-react';

interface VacationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VacationRequestData) => void;
  employeeId: string;
  currentBalance: {
    available: number;
    total: number;
    used: number;
  };
}

interface VacationRequestData {
  startDate: string;
  endDate: string;
  days: number;
  type: 'vacation' | 'personal' | 'sick_leave' | 'maternity' | 'paternity';
  reason: string;
  description: string;
  attachments: File[];
  emergencyContact: string;
  emergencyPhone: string;
}

const VacationRequestModal: React.FC<VacationRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
  currentBalance
}) => {
  const [formData, setFormData] = useState<VacationRequestData>({
    startDate: '',
    endDate: '',
    days: 0,
    type: 'vacation',
    reason: '',
    description: '',
    attachments: [],
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [calculatedDays, setCalculatedDays] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular días automáticamente según la ley mexicana
  const calculateVacationDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return 0;
    
    // Calcular días hábiles (excluyendo fines de semana)
    let days = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // 1-5 son lunes a viernes (días hábiles)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Calcular días según años de antigüedad (Ley Federal del Trabajo)
  const calculateVacationDaysBySeniority = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    const yearsWorked = Math.floor((now.getTime() - hire.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    // Según la LFT:
    // 1 año: 6 días
    // 2 años: 8 días
    // 3 años: 10 días
    // 4 años: 12 días
    // 5-9 años: 14 días
    // 10-14 años: 16 días
    // 15-19 años: 18 días
    // 20+ años: 20 días
    
    if (yearsWorked < 1) return 0;
    if (yearsWorked === 1) return 6;
    if (yearsWorked === 2) return 8;
    if (yearsWorked === 3) return 10;
    if (yearsWorked === 4) return 12;
    if (yearsWorked >= 5 && yearsWorked <= 9) return 14;
    if (yearsWorked >= 10 && yearsWorked <= 14) return 16;
    if (yearsWorked >= 15 && yearsWorked <= 19) return 18;
    return 20;
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = calculateVacationDays(formData.startDate, formData.endDate);
      setCalculatedDays(days);
      setFormData(prev => ({ ...prev, days }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleInputChange = (field: keyof VacationRequestData, value: any) => {
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

    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
    if (!formData.endDate) newErrors.endDate = 'La fecha de fin es requerida';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    if (formData.days > currentBalance.available) {
      newErrors.days = `No tienes suficientes días disponibles. Disponibles: ${currentBalance.available}`;
    }
    if (!formData.reason.trim()) newErrors.reason = 'La razón es requerida';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'El contacto de emergencia es requerido';
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'El teléfono de emergencia es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Solicitar Vacaciones</h2>
              <p className="text-sm text-gray-600">Días disponibles: {currentBalance.available} de {currentBalance.total}</p>
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
          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Días calculados */}
          {calculatedDays > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Días hábiles calculados: {calculatedDays} días
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Se excluyen fines de semana automáticamente
              </p>
            </div>
          )}

          {/* Tipo de solicitud */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Solicitud *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="vacation">Vacaciones</option>
              <option value="personal">Asuntos Personales</option>
              <option value="sick_leave">Enfermedad</option>
              <option value="maternity">Maternidad</option>
              <option value="paternity">Paternidad</option>
            </select>
          </div>

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Ej: Vacaciones familiares, asuntos médicos, etc."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
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
              placeholder="Proporciona más detalles sobre tu solicitud..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Contacto de emergencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contacto de Emergencia *
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Nombre completo"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.emergencyContact && (
                <p className="mt-1 text-sm text-red-600">{errors.emergencyContact}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono de Emergencia *
              </label>
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                placeholder="+52 55 1234 5678"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.emergencyPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.emergencyPhone}</p>
              )}
            </div>
          </div>

          {/* Archivos adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivos Adjuntos (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Haz clic para subir archivos o arrastra aquí
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

          {/* Información legal */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Información Importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Las vacaciones deben solicitarse con al menos 30 días de anticipación</li>
                  <li>Los días se calculan automáticamente excluyendo fines de semana</li>
                  <li>Tu solicitud será revisada por tu supervisor</li>
                  <li>Recibirás una notificación del estado de tu solicitud</li>
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
              <span>Enviar Solicitud</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacationRequestModal;
