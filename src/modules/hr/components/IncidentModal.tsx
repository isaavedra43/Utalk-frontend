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
  User,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  Minus
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { Incident, IncidentRequest } from '../../../services/incidentsService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incidentData: IncidentRequest, attachments: File[]) => Promise<void>;
  employeeId: string;
  employeeName: string;
  incident?: Incident | null; // Para edición
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
  supervisor: string;
  tags: string[];
  isConfidential: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cost: number;
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
  mode = 'create'
}) => {
  const { showSuccess, showError } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del formulario
  const [formData, setFormData] = useState<IncidentFormData>({
    type: 'administrative',
    severity: 'low',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    location: '',
    reportedBy: employeeId,
    involvedPersons: [employeeId],
    witnesses: [],
    actions: [],
    consequences: [],
    preventiveMeasures: [],
    supervisor: '',
    tags: [],
    isConfidential: false,
    priority: 'medium',
    cost: 0,
    insuranceClaim: false,
    policeReport: false,
    medicalReport: false,
    attachments: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newInvolvedPerson, setNewInvolvedPerson] = useState('');
  const [newWitness, setNewWitness] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newConsequence, setNewConsequence] = useState('');
  const [newPreventiveMeasure, setNewPreventiveMeasure] = useState('');
  const [newTag, setNewTag] = useState('');

  // Cargar datos si estamos en modo edición
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
        involvedPersons: incident.involvedPersons,
        witnesses: incident.witnesses || [],
        actions: incident.actions || [],
        consequences: incident.consequences || [],
        preventiveMeasures: incident.preventiveMeasures || [],
        supervisor: incident.supervisor || '',
        tags: incident.tags || [],
        isConfidential: incident.isConfidential,
        priority: incident.priority,
        cost: incident.cost || 0,
        insuranceClaim: incident.insuranceClaim || false,
        policeReport: incident.policeReport || false,
        medicalReport: incident.medicalReport || false,
        attachments: []
      });
    }
  }, [incident, mode]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (formData.cost < 0) {
      newErrors.cost = 'El costo no puede ser negativo';
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

      const incidentData: IncidentRequest = {
        type: formData.type,
        severity: formData.severity,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        reportedBy: formData.reportedBy,
        involvedPersons: formData.involvedPersons,
        witnesses: formData.witnesses,
        actions: formData.actions,
        consequences: formData.consequences,
        preventiveMeasures: formData.preventiveMeasures,
        supervisor: formData.supervisor || undefined,
        tags: formData.tags,
        isConfidential: formData.isConfidential,
        priority: formData.priority,
        cost: formData.cost > 0 ? formData.cost : undefined,
        insuranceClaim: formData.insuranceClaim,
        policeReport: formData.policeReport,
        medicalReport: formData.medicalReport
      };

      await onSubmit(incidentData, formData.attachments);
      
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
        type: 'administrative',
        severity: 'low',
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        location: '',
        reportedBy: employeeId,
        involvedPersons: [employeeId],
        witnesses: [],
        actions: [],
        consequences: [],
        preventiveMeasures: [],
        supervisor: '',
        tags: [],
        isConfidential: false,
        priority: 'medium',
        cost: 0,
        insuranceClaim: false,
        policeReport: false,
        medicalReport: false,
        attachments: []
      });
      setErrors({});
      onClose();
    }
  };

  // Manejar cambio de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  // Remover archivo
  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Agregar persona involucrada
  const addInvolvedPerson = () => {
    if (newInvolvedPerson.trim()) {
      setFormData(prev => ({
        ...prev,
        involvedPersons: [...prev.involvedPersons, newInvolvedPerson.trim()]
      }));
      setNewInvolvedPerson('');
    }
  };

  // Remover persona involucrada
  const removeInvolvedPerson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      involvedPersons: prev.involvedPersons.filter((_, i) => i !== index)
    }));
  };

  // Agregar testigo
  const addWitness = () => {
    if (newWitness.trim()) {
      setFormData(prev => ({
        ...prev,
        witnesses: [...prev.witnesses, newWitness.trim()]
      }));
      setNewWitness('');
    }
  };

  // Remover testigo
  const removeWitness = (index: number) => {
    setFormData(prev => ({
      ...prev,
      witnesses: prev.witnesses.filter((_, i) => i !== index)
    }));
  };

  // Agregar acción
  const addAction = () => {
    if (newAction.trim()) {
      setFormData(prev => ({
        ...prev,
        actions: [...prev.actions, newAction.trim()]
      }));
      setNewAction('');
    }
  };

  // Remover acción
  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  // Agregar consecuencia
  const addConsequence = () => {
    if (newConsequence.trim()) {
      setFormData(prev => ({
        ...prev,
        consequences: [...prev.consequences, newConsequence.trim()]
      }));
      setNewConsequence('');
    }
  };

  // Remover consecuencia
  const removeConsequence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      consequences: prev.consequences.filter((_, i) => i !== index)
    }));
  };

  // Agregar medida preventiva
  const addPreventiveMeasure = () => {
    if (newPreventiveMeasure.trim()) {
      setFormData(prev => ({
        ...prev,
        preventiveMeasures: [...prev.preventiveMeasures, newPreventiveMeasure.trim()]
      }));
      setNewPreventiveMeasure('');
    }
  };

  // Remover medida preventiva
  const removePreventiveMeasure = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preventiveMeasures: prev.preventiveMeasures.filter((_, i) => i !== index)
    }));
  };

  // Agregar tag
  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  // Remover tag
  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Obtener icono según tipo
  const getTypeIcon = () => {
    switch (formData.type) {
      case 'administrative': return <FileText className="h-5 w-5" />;
      case 'theft': return <Shield className="h-5 w-5" />;
      case 'accident': return <Car className="h-5 w-5" />;
      case 'injury': return <Heart className="h-5 w-5" />;
      case 'disciplinary': return <AlertTriangle className="h-5 w-5" />;
      case 'equipment': return <Briefcase className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {getTypeIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {mode === 'edit' ? 'Editar Incidencia' : 'Nueva Incidencia'}
                  </h3>
                  <p className="text-sm text-blue-100">{employeeName}</p>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white">
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {/* Información Básica */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Información Básica</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo de Incidencia */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Incidencia *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="administrative">Administrativa</option>
                        <option value="theft">Robo</option>
                        <option value="accident">Accidente</option>
                        <option value="injury">Lesión</option>
                        <option value="disciplinary">Disciplinaria</option>
                        <option value="security">Seguridad</option>
                        <option value="equipment">Equipo</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>

                    {/* Severidad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severidad *
                      </label>
                      <select
                        value={formData.severity}
                        onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                      </select>
                    </div>

                    {/* Prioridad */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridad *
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    {/* Confidencial */}
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="isConfidential"
                        checked={formData.isConfidential}
                        onChange={(e) => setFormData(prev => ({ ...prev, isConfidential: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={isLoading}
                      />
                      <label htmlFor="isConfidential" className="text-sm font-medium text-gray-700">
                        Confidencial
                      </label>
                    </div>
                  </div>

                  {/* Título */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej: Reporte de Robo - Equipo de cómputo"
                      disabled={isLoading}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows={4}
                      placeholder="Describe detalladamente lo ocurrido..."
                      disabled={isLoading}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Fecha, Hora y Ubicación */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Fecha *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Hora *
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        Ubicación *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: Oficina Principal - Piso 3"
                        disabled={isLoading}
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                      )}
                    </div>
                  </div>

                  {/* Supervisor */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="h-4 w-4 inline mr-1" />
                      Supervisor
                    </label>
                    <input
                      type="text"
                      value={formData.supervisor}
                      onChange={(e) => setFormData(prev => ({ ...prev, supervisor: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del supervisor"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Personas Involucradas */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Personas Involucradas</h4>
                  
                  <div className="space-y-2 mb-3">
                    {formData.involvedPersons.map((person, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-sm text-gray-700">{person}</span>
                        {formData.involvedPersons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInvolvedPerson(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newInvolvedPerson}
                      onChange={(e) => setNewInvolvedPerson(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInvolvedPerson())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Agregar persona involucrada"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={addInvolvedPerson}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Testigos */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Testigos</h4>
                  
                  {formData.witnesses.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formData.witnesses.map((witness, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="flex-1 text-sm text-gray-700">{witness}</span>
                          <button
                            type="button"
                            onClick={() => removeWitness(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newWitness}
                      onChange={(e) => setNewWitness(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWitness())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Agregar testigo"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={addWitness}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Acciones Tomadas */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Acciones Tomadas</h4>
                  
                  {formData.actions.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formData.actions.map((action, index) => (
                        <div key={index} className="flex items-start space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                          <span className="flex-1 text-sm text-gray-700">{action}</span>
                          <button
                            type="button"
                            onClick={() => removeAction(index)}
                            className="text-red-600 hover:text-red-800 mt-0.5"
                            disabled={isLoading}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newAction}
                      onChange={(e) => setNewAction(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Ej: Atención médica inmediata"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={addAction}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Consecuencias */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Consecuencias</h4>
                  
                  {formData.consequences.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formData.consequences.map((consequence, index) => (
                        <div key={index} className="flex items-start space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
                          <span className="flex-1 text-sm text-gray-700">{consequence}</span>
                          <button
                            type="button"
                            onClick={() => removeConsequence(index)}
                            className="text-red-600 hover:text-red-800 mt-0.5"
                            disabled={isLoading}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newConsequence}
                      onChange={(e) => setNewConsequence(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConsequence())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Ej: Advertencia por escrito"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={addConsequence}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Medidas Preventivas */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Medidas Preventivas</h4>
                  
                  {formData.preventiveMeasures.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {formData.preventiveMeasures.map((measure, index) => (
                        <div key={index} className="flex items-start space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                          <span className="flex-1 text-sm text-gray-700">{measure}</span>
                          <button
                            type="button"
                            onClick={() => removePreventiveMeasure(index)}
                            className="text-red-600 hover:text-red-800 mt-0.5"
                            disabled={isLoading}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newPreventiveMeasure}
                      onChange={(e) => setNewPreventiveMeasure(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreventiveMeasure())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Ej: Instalación de cámaras de seguridad"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={addPreventiveMeasure}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Información Adicional */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Información Adicional</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Costo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        Costo (MXN)
                      </label>
                      <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 pt-6">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="insuranceClaim"
                          checked={formData.insuranceClaim}
                          onChange={(e) => setFormData(prev => ({ ...prev, insuranceClaim: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <label htmlFor="insuranceClaim" className="text-sm text-gray-700">
                          Reclamación de seguro
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="policeReport"
                          checked={formData.policeReport}
                          onChange={(e) => setFormData(prev => ({ ...prev, policeReport: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <label htmlFor="policeReport" className="text-sm text-gray-700">
                          Reporte policial
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="medicalReport"
                          checked={formData.medicalReport}
                          onChange={(e) => setFormData(prev => ({ ...prev, medicalReport: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                        <label htmlFor="medicalReport" className="text-sm text-gray-700">
                          Reporte médico
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Etiquetas</h4>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-blue-600 hover:text-blue-800"
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Agregar etiqueta"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Archivos Adjuntos */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Archivos Adjuntos</h4>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Arrastra archivos aquí o haz clic para seleccionar
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      disabled={isLoading}
                    >
                      Seleccionar Archivos
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      Formatos permitidos: Imágenes, PDF, Word
                    </p>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

