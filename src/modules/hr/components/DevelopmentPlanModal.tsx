import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  User,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { DevelopmentPlan, DevelopmentActivity, CreateDevelopmentPlanRequest } from '../../../services/skillsService';

interface DevelopmentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (planData: CreateDevelopmentPlanRequest) => Promise<void>;
  employeeId: string;
  employeeName: string;
  developmentPlan?: DevelopmentPlan | null;
  mode?: 'create' | 'edit';
}

const DevelopmentPlanModal: React.FC<DevelopmentPlanModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
  employeeName,
  developmentPlan,
  mode = 'create'
}) => {
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<CreateDevelopmentPlanRequest>({
    skillId: '',
    skillName: '',
    currentLevel: 'beginner',
    targetLevel: 'intermediate',
    activities: [],
    startDate: '',
    targetDate: '',
    mentor: '',
    notes: ''
  });

  const [currentActivity, setCurrentActivity] = useState({
    name: '',
    description: '',
    type: 'course' as DevelopmentActivity['type'],
    startDate: '',
    endDate: '',
    duration: 0,
    cost: 0,
    provider: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (developmentPlan && mode === 'edit') {
      setFormData({
        skillId: developmentPlan.skillId,
        skillName: developmentPlan.skillName,
        currentLevel: developmentPlan.currentLevel,
        targetLevel: developmentPlan.targetLevel,
        activities: developmentPlan.activities.map(activity => ({
          name: activity.name,
          description: activity.description,
          type: activity.type,
          startDate: activity.startDate || '',
          endDate: activity.endDate || '',
          duration: activity.duration || 0,
          cost: activity.cost || 0,
          provider: activity.provider || '',
          notes: activity.notes || ''
        })),
        startDate: developmentPlan.startDate,
        targetDate: developmentPlan.targetDate,
        mentor: developmentPlan.mentor || '',
        notes: developmentPlan.notes || ''
      });
    } else {
      setFormData({
        skillId: '',
        skillName: '',
        currentLevel: 'beginner',
        targetLevel: 'intermediate',
        activities: [],
        startDate: '',
        targetDate: '',
        mentor: '',
        notes: ''
      });
      setCurrentActivity({
        name: '',
        description: '',
        type: 'course',
        startDate: '',
        endDate: '',
        duration: 0,
        cost: 0,
        provider: '',
        notes: ''
      });
    }
  }, [developmentPlan, mode]);

  const levels = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' },
    { value: 'expert', label: 'Experto' }
  ];

  const activityTypes = [
    { value: 'course', label: 'Curso' },
    { value: 'workshop', label: 'Taller' },
    { value: 'reading', label: 'Lectura' },
    { value: 'practice', label: 'Práctica' },
    { value: 'project', label: 'Proyecto' },
    { value: 'mentoring', label: 'Mentoría' },
    { value: 'certification', label: 'Certificación' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.skillName.trim()) newErrors.skillName = 'El nombre de la habilidad es requerido';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
    if (!formData.targetDate) newErrors.targetDate = 'La fecha objetivo es requerida';
    if (new Date(formData.targetDate) <= new Date(formData.startDate)) {
      newErrors.targetDate = 'La fecha objetivo debe ser posterior a la fecha de inicio';
    }
    if (formData.activities.length === 0) newErrors.activities = 'Debe agregar al menos una actividad';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error en handleSubmit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        skillId: '',
        skillName: '',
        currentLevel: 'beginner',
        targetLevel: 'intermediate',
        activities: [],
        startDate: '',
        targetDate: '',
        mentor: '',
        notes: ''
      });
      setCurrentActivity({
        name: '',
        description: '',
        type: 'course',
        startDate: '',
        endDate: '',
        duration: 0,
        cost: 0,
        provider: '',
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  const addActivity = () => {
    if (currentActivity.name.trim() && currentActivity.description.trim()) {
      setFormData(prev => ({
        ...prev,
        activities: [...prev.activities, { ...currentActivity }]
      }));
      setCurrentActivity({
        name: '',
        description: '',
        type: 'course',
        startDate: '',
        endDate: '',
        duration: 0,
        cost: 0,
        provider: '',
        notes: ''
      });
    }
  };

  const removeActivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {mode === 'edit' ? 'Editar Plan de Desarrollo' : 'Nuevo Plan de Desarrollo'}
                </h3>
                <p className="text-sm text-green-100">{employeeName}</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna 1 */}
                <div className="space-y-6">
                  {/* Información del Plan */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Información del Plan</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Habilidad a Desarrollar *
                        </label>
                        <input
                          type="text"
                          value={formData.skillName}
                          onChange={(e) => setFormData(prev => ({ ...prev, skillName: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors.skillName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Marketing Digital"
                        />
                        {errors.skillName && <p className="text-red-600 text-sm mt-1">{errors.skillName}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nivel Actual
                          </label>
                          <select
                            value={formData.currentLevel}
                            onChange={(e) => setFormData(prev => ({ ...prev, currentLevel: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            {levels.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nivel Objetivo
                          </label>
                          <select
                            value={formData.targetLevel}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetLevel: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            {levels.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Inicio *
                          </label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                              errors.startDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Objetivo *
                          </label>
                          <input
                            type="date"
                            value={formData.targetDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                              errors.targetDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.targetDate && <p className="text-red-600 text-sm mt-1">{errors.targetDate}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mentor
                        </label>
                        <input
                          type="text"
                          value={formData.mentor}
                          onChange={(e) => setFormData(prev => ({ ...prev, mentor: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Nombre del mentor o supervisor"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notas Adicionales
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Notas adicionales sobre el plan de desarrollo..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className="space-y-6">
                  {/* Actividades */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Actividades de Desarrollo</h4>

                    <div className="space-y-4">
                      {/* Formulario para nueva actividad */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h5 className="font-medium text-gray-900 mb-3">Nueva Actividad</h5>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={currentActivity.name}
                              onChange={(e) => setCurrentActivity(prev => ({ ...prev, name: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                              placeholder="Nombre de actividad"
                            />
                            <select
                              value={currentActivity.type}
                              onChange={(e) => setCurrentActivity(prev => ({ ...prev, type: e.target.value as any }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                            >
                              {activityTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>

                          <textarea
                            value={currentActivity.description}
                            onChange={(e) => setCurrentActivity(prev => ({ ...prev, description: e.target.value }))}
                            rows={2}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                            placeholder="Descripción de la actividad"
                          />

                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="date"
                              value={currentActivity.startDate}
                              onChange={(e) => setCurrentActivity(prev => ({ ...prev, startDate: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                              placeholder="Fecha inicio"
                            />
                            <input
                              type="number"
                              value={currentActivity.duration || ''}
                              onChange={(e) => setCurrentActivity(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                              placeholder="Horas"
                            />
                            <input
                              type="number"
                              value={currentActivity.cost || ''}
                              onChange={(e) => setCurrentActivity(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                              placeholder="Costo"
                            />
                          </div>

                          <input
                            type="text"
                            value={currentActivity.provider}
                            onChange={(e) => setCurrentActivity(prev => ({ ...prev, provider: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                            placeholder="Proveedor o instructor"
                          />

                          <button
                            type="button"
                            onClick={addActivity}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            <Plus className="h-4 w-4 inline mr-2" />
                            Agregar Actividad
                          </button>
                        </div>
                      </div>

                      {/* Lista de actividades */}
                      {formData.activities.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900">Actividades Agregadas</h5>
                          {formData.activities.map((activity, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h6 className="font-medium text-gray-900">{activity.name}</h6>
                                  <p className="text-sm text-gray-600">{activity.description}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeActivity(index)}
                                  className="text-red-600 hover:text-red-800 ml-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                                <span>Tipo: {activityTypes.find(t => t.value === activity.type)?.label}</span>
                                {activity.duration > 0 && <span>{activity.duration}h</span>}
                                {activity.cost > 0 && <span>${activity.cost}</span>}
                                {activity.provider && <span>{activity.provider}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {errors.activities && <p className="text-red-600 text-sm">{errors.activities}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{mode === 'edit' ? 'Actualizar' : 'Crear'} Plan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentPlanModal;
