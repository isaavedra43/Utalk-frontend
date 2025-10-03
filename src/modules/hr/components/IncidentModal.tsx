import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  FileText,
  Shield,
  Car,
  Heart,
  Briefcase,
  Upload,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { Incident, IncidentRequest } from '../../../services/incidentsService';

// ============================================================================
// TYPES
// ============================================================================

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incidentData: IncidentRequest, attachments: File[]) => Promise<void>;
  employeeId: string;
  employeeName: string;
  incident?: Incident | null;
  mode?: 'create' | 'edit';
}

interface IncidentFormData {
  type: 'administrative' | 'theft' | 'accident' | 'injury' | 'disciplinary' | 'security' | 'equipment' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  reportedBy: string;
  involvedPersons: string[];
  witnesses: string[];
  actions: string[];
  consequences: string[];
  preventiveMeasures: string[];
  supervisor?: string;
  tags: string[];
  isConfidential: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cost?: number;
  insuranceClaim: boolean;
  policeReport: boolean;
  medicalReport: boolean;
  attachments: File[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const IncidentModal: React.FC<IncidentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
  employeeName,
  incident,
  mode = 'create',
}) => {
  const { showSuccess, showError } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<IncidentFormData>({
    type: 'other',
    severity: 'low',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    reportedBy: employeeId,
    involvedPersons: [],
    witnesses: [],
    actions: [],
    consequences: [],
    preventiveMeasures: [],
    tags: [],
    isConfidential: false,
    priority: 'medium',
    cost: undefined,
    insuranceClaim: false,
    policeReport: false,
    medicalReport: false,
    attachments: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Campos temporales para agregar elementos
  const [newInvolvedPerson, setNewInvolvedPerson] = useState('');
  const [newWitness, setNewWitness] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newConsequence, setNewConsequence] = useState('');
  const [newPreventiveMeasure, setNewPreventiveMeasure] = useState('');
  const [newTag, setNewTag] = useState('');

  // Inicializar formulario
  useEffect(() => {
    if (incident && mode === 'edit') {
      setFormData({
        type: incident.type,
        severity: incident.severity,
        title: incident.title,
        description: incident.description,
        date: incident.date,
        time: incident.time,
        location: incident.location,
        reportedBy: incident.reportedBy,
        involvedPersons: incident.involvedPersons || [],
        witnesses: incident.witnesses || [],
        actions: incident.actions || [],
        consequences: incident.consequences || [],
        preventiveMeasures: incident.preventiveMeasures || [],
        supervisor: incident.supervisor || '',
        tags: incident.tags || [],
        isConfidential: incident.isConfidential || false,
        priority: incident.priority || 'medium',
        cost: incident.cost || undefined,
        insuranceClaim: incident.insuranceClaim || false,
        policeReport: incident.policeReport || false,
        medicalReport: incident.medicalReport || false,
        attachments: [],
      });
    } else {
      setFormData(prev => ({ ...prev, reportedBy: employeeId }));
    }
  }, [incident, mode, employeeId]);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.date) newErrors.date = 'La fecha es requerida';
    if (!formData.time) newErrors.time = 'La hora es requerida';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es requerida';
    if (!formData.reportedBy.trim()) newErrors.reportedBy = 'Quien reporta es requerido';
    if (formData.involvedPersons.length === 0) newErrors.involvedPersons = 'Debe haber al menos una persona involucrada';
    if (formData.cost && formData.cost < 0) newErrors.cost = 'El costo no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setIsLoading(true);
      const incidentRequest: IncidentRequest = {
        type: formData.type,
        severity: formData.severity,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        reportedBy: formData.reportedBy,
        involvedPersons: formData.involvedPersons,
        witnesses: formData.witnesses.length > 0 ? formData.witnesses : undefined,
        actions: formData.actions.length > 0 ? formData.actions : undefined,
        consequences: formData.consequences.length > 0 ? formData.consequences : undefined,
        preventiveMeasures: formData.preventiveMeasures.length > 0 ? formData.preventiveMeasures : undefined,
        supervisor: formData.supervisor || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isConfidential: formData.isConfidential,
        priority: formData.priority,
        cost: formData.cost,
        insuranceClaim: formData.insuranceClaim,
        policeReport: formData.policeReport,
        medicalReport: formData.medicalReport,
      };

      await onSubmit(incidentRequest, formData.attachments);
      showSuccess(`Incidencia ${mode === 'edit' ? 'actualizada' : 'creada'} exitosamente`);
      handleClose();
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      showError(error instanceof Error ? error.message : 'Error procesando incidencia');
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        type: 'other',
        severity: 'low',
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        reportedBy: employeeId,
        involvedPersons: [],
        witnesses: [],
        actions: [],
        consequences: [],
        preventiveMeasures: [],
        tags: [],
        isConfidential: false,
        priority: 'medium',
        cost: undefined,
        insuranceClaim: false,
        policeReport: false,
        medicalReport: false,
        attachments: [],
      });
      setErrors({});
      setNewInvolvedPerson('');
      setNewWitness('');
      setNewAction('');
      setNewConsequence('');
      setNewPreventiveMeasure('');
      setNewTag('');
      onClose();
    }
  };

  // Manejo de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev: IncidentFormData) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev: IncidentFormData) => ({
      ...prev,
      attachments: prev.attachments.filter((_: File, i: number) => i !== index)
    }));
  };

  // Funciones para agregar/remover elementos
  const addInvolvedPerson = () => {
    if (newInvolvedPerson.trim() && !formData.involvedPersons.includes(newInvolvedPerson.trim())) {
      setFormData(prev => ({ ...prev, involvedPersons: [...prev.involvedPersons, newInvolvedPerson.trim()] }));
      setNewInvolvedPerson('');
    }
  };

  const removeInvolvedPerson = (person: string) => {
    setFormData(prev => ({ ...prev, involvedPersons: prev.involvedPersons.filter(p => p !== person) }));
  };

  const addWitness = () => {
    if (newWitness.trim() && !formData.witnesses.includes(newWitness.trim())) {
      setFormData(prev => ({ ...prev, witnesses: [...prev.witnesses, newWitness.trim()] }));
      setNewWitness('');
    }
  };

  const removeWitness = (witness: string) => {
    setFormData(prev => ({ ...prev, witnesses: prev.witnesses.filter(w => w !== witness) }));
  };

  const addAction = () => {
    if (newAction.trim() && !formData.actions.includes(newAction.trim())) {
      setFormData(prev => ({ ...prev, actions: [...prev.actions, newAction.trim()] }));
      setNewAction('');
    }
  };

  const removeAction = (action: string) => {
    setFormData(prev => ({ ...prev, actions: prev.actions.filter(a => a !== action) }));
  };

  const addConsequence = () => {
    if (newConsequence.trim() && !formData.consequences.includes(newConsequence.trim())) {
      setFormData(prev => ({ ...prev, consequences: [...prev.consequences, newConsequence.trim()] }));
      setNewConsequence('');
    }
  };

  const removeConsequence = (consequence: string) => {
    setFormData(prev => ({ ...prev, consequences: prev.consequences.filter(c => c !== consequence) }));
  };

  const addPreventiveMeasure = () => {
    if (newPreventiveMeasure.trim() && !formData.preventiveMeasures.includes(newPreventiveMeasure.trim())) {
      setFormData(prev => ({ ...prev, preventiveMeasures: [...prev.preventiveMeasures, newPreventiveMeasure.trim()] }));
      setNewPreventiveMeasure('');
    }
  };

  const removePreventiveMeasure = (measure: string) => {
    setFormData(prev => ({ ...prev, preventiveMeasures: prev.preventiveMeasures.filter(m => m !== measure) }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // Icono por tipo
  const getTypeIcon = (type: IncidentFormData['type']) => {
    switch (type) {
      case 'administrative': return <FileText className="h-5 w-5" />;
      case 'theft': return <Shield className="h-5 w-5" />;
      case 'accident': return <Car className="h-5 w-5" />;
      case 'injury': return <Heart className="h-5 w-5" />;
      case 'disciplinary': return <AlertTriangle className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      case 'equipment': return <Briefcase className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {getTypeIcon(formData.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {mode === 'edit' ? 'Editar Incidencia' : 'Nueva Incidencia'}
                  </h3>
                  <p className="text-sm text-red-100">{employeeName}</p>
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

          <form onSubmit={handleSubmit} className="bg-white">
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Tipo de Incidencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Incidencia *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: 'administrative', label: 'Administrativa', icon: FileText, color: 'blue' },
                      { value: 'theft', label: 'Robo', icon: Shield, color: 'purple' },
                      { value: 'accident', label: 'Accidente', icon: Car, color: 'orange' },
                      { value: 'injury', label: 'Lesión', icon: Heart, color: 'pink' },
                      { value: 'disciplinary', label: 'Disciplinaria', icon: AlertTriangle, color: 'yellow' },
                      { value: 'security', label: 'Seguridad', icon: Shield, color: 'indigo' },
                      { value: 'equipment', label: 'Equipo', icon: Briefcase, color: 'green' },
                      { value: 'other', label: 'Otro', icon: AlertTriangle, color: 'gray' }
                    ].map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: value as IncidentFormData['type'] }))}
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

                {/* Título y Severidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Título breve de la incidencia"
                      disabled={isLoading}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severidad *
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as IncidentFormData['severity'] }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.severity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    placeholder="Detalles completos de la incidencia"
                    disabled={isLoading}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Fecha, Hora y Ubicación */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.time ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.time && (
                      <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Oficina principal, Almacén 3"
                      disabled={isLoading}
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>
                </div>

                {/* Personas Involucradas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personas Involucradas *
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newInvolvedPerson}
                      onChange={(e) => setNewInvolvedPerson(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInvolvedPerson(); } }}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.involvedPersons ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nombre o ID de persona"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={addInvolvedPerson}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {errors.involvedPersons && (
                    <p className="mt-1 text-sm text-red-600">{errors.involvedPersons}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.involvedPersons.map((person, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {person}
                        <button
                          type="button"
                          onClick={() => removeInvolvedPerson(person)}
                          className="ml-2 -mr-0.5 h-4 w-4 text-red-600 hover:text-red-900"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Archivos Adjuntos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivos Adjuntos (Opcional)
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Adjunta documentos, fotos o videos relacionados con la incidencia.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.mp4,.mov,.avi,.mp3,.wav"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
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
                disabled={isLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>{mode === 'edit' ? 'Actualizar Incidencia' : 'Crear Incidencia'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncidentModal;