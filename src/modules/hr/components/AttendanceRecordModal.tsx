import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Camera
} from 'lucide-react';

interface AttendanceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AttendanceRecordData) => void;
  employeeId: string;
}

interface AttendanceRecordData {
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'late' | 'absent' | 'half_day' | 'vacation' | 'sick_leave';
  location: 'office' | 'remote' | 'field';
  notes: string;
  attachments: File[];
  overtimeHours: number;
  overtimeReason: string;
}

const AttendanceRecordModal: React.FC<AttendanceRecordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId
}) => {
  const [formData, setFormData] = useState<AttendanceRecordData>({
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
    location: 'office',
    notes: '',
    attachments: [],
    overtimeHours: 0,
    overtimeReason: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof AttendanceRecordData, value: any) => {
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

  const calculateTotalHours = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    
    const checkInTime = new Date(`2000-01-01T${formData.checkIn}`);
    const checkOutTime = new Date(`2000-01-01T${formData.checkOut}`);
    
    if (checkOutTime <= checkInTime) return 0;
    
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return Math.round(diffHours * 100) / 100;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.checkIn) newErrors.checkIn = 'La hora de entrada es requerida';
    if (!formData.checkOut) newErrors.checkOut = 'La hora de salida es requerida';
    
    if (formData.checkIn && formData.checkOut) {
      const totalHours = calculateTotalHours();
      if (totalHours <= 0) {
        newErrors.checkOut = 'La hora de salida debe ser posterior a la hora de entrada';
      }
    }

    if (formData.overtimeHours > 0 && !formData.overtimeReason.trim()) {
      newErrors.overtimeReason = 'La razón de horas extra es requerida';
    }

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

  const totalHours = calculateTotalHours();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registrar Asistencia</h2>
              <p className="text-sm text-gray-600">Registra tu asistencia del día</p>
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
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Entrada *
              </label>
              <input
                type="time"
                value={formData.checkIn}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.checkIn ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.checkIn && (
                <p className="mt-1 text-sm text-red-600">{errors.checkIn}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Salida *
              </label>
              <input
                type="time"
                value={formData.checkOut}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.checkOut ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.checkOut && (
                <p className="mt-1 text-sm text-red-600">{errors.checkOut}</p>
              )}
            </div>
          </div>

          {/* Total de horas calculado */}
          {totalHours > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Total de horas: {totalHours} horas
                </span>
              </div>
              {totalHours > 8 && (
                <p className="text-xs text-blue-600 mt-1">
                  Horas extra detectadas: {totalHours - 8} horas
                </p>
              )}
            </div>
          )}

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="present">Presente</option>
              <option value="late">Tardanza</option>
              <option value="half_day">Medio día</option>
              <option value="vacation">Vacaciones</option>
              <option value="sick_leave">Enfermedad</option>
              <option value="absent">Ausente</option>
            </select>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación *
            </label>
            <select
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="office">Oficina</option>
              <option value="remote">Remoto</option>
              <option value="field">Campo</option>
            </select>
          </div>

          {/* Horas extra */}
          {totalHours > 8 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas Extra
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.overtimeHours}
                  onChange={(e) => handleInputChange('overtimeHours', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón de Horas Extra *
                </label>
                <textarea
                  value={formData.overtimeReason}
                  onChange={(e) => handleInputChange('overtimeReason', e.target.value)}
                  placeholder="Describe la razón de las horas extra..."
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.overtimeReason ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.overtimeReason && (
                  <p className="mt-1 text-sm text-red-600">{errors.overtimeReason}</p>
                )}
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Cualquier información adicional sobre tu asistencia..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Archivos adjuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidencia (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="attendance-file-upload"
              />
              <label
                htmlFor="attendance-file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Subir evidencia (fotos, documentos, etc.)
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
                  <li>Los registros de asistencia son verificados por tu supervisor</li>
                  <li>Las horas extra requieren autorización previa</li>
                  <li>Mantén evidencia de tu asistencia cuando sea posible</li>
                  <li>Los registros falsos pueden resultar en acciones disciplinarias</li>
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
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Registrar Asistencia</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceRecordModal;
