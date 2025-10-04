import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  Code,
  Heart,
  Users,
  Globe,
  Brain,
  Star,
  Target,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { Skill, CreateSkillRequest } from '../../../services/skillsService';

interface SkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (skillData: CreateSkillRequest, files: File[]) => Promise<void>;
  employeeId: string;
  employeeName: string;
  skill?: Skill | null;
  mode?: 'create' | 'edit';
}

const SkillModal: React.FC<SkillModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
  employeeName,
  skill,
  mode = 'create'
}) => {
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<CreateSkillRequest>({
    name: '',
    category: 'technical',
    level: 'beginner',
    score: 1,
    evidence: '',
    isRequired: false,
    developmentPlan: '',
    resources: [],
    targetLevel: 'intermediate',
    targetDate: ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const [currentResource, setCurrentResource] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (skill && mode === 'edit') {
      setFormData({
        name: skill.name,
        category: skill.category,
        level: skill.level,
        score: skill.score,
        evidence: skill.evidence || '',
        isRequired: skill.isRequired,
        developmentPlan: skill.developmentPlan,
        resources: skill.resources || [],
        targetLevel: skill.targetLevel,
        targetDate: skill.targetDate || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'technical',
        level: 'beginner',
        score: 1,
        evidence: '',
        isRequired: false,
        developmentPlan: '',
        resources: [],
        targetLevel: 'intermediate',
        targetDate: ''
      });
      setFiles([]);
    }
  }, [skill, mode]);

  const categories = [
    { value: 'technical', label: 'Técnicas', icon: Code },
    { value: 'soft', label: 'Blandas', icon: Heart },
    { value: 'leadership', label: 'Liderazgo', icon: Users },
    { value: 'language', label: 'Idiomas', icon: Globe },
    { value: 'other', label: 'Otras', icon: Brain }
  ];

  const levels = [
    { value: 'beginner', label: 'Principiante', color: 'red' },
    { value: 'intermediate', label: 'Intermedio', color: 'yellow' },
    { value: 'advanced', label: 'Avanzado', color: 'blue' },
    { value: 'expert', label: 'Experto', color: 'green' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (formData.score < 1 || formData.score > 5) newErrors.score = 'La puntuación debe estar entre 1 y 5';
    if (!formData.developmentPlan.trim()) newErrors.developmentPlan = 'El plan de desarrollo es requerido';
    if (formData.targetDate && new Date(formData.targetDate) <= new Date()) {
      newErrors.targetDate = 'La fecha objetivo debe ser futura';
    }

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
      await onSubmit(formData, files);
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
        name: '',
        category: 'technical',
        level: 'beginner',
        score: 1,
        evidence: '',
        isRequired: false,
        developmentPlan: '',
        resources: [],
        targetLevel: 'intermediate',
        targetDate: ''
      });
      setFiles([]);
      setCurrentResource('');
      setErrors({});
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addResource = () => {
    if (currentResource.trim()) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources!, currentResource.trim()]
      }));
      setCurrentResource('');
    }
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources!.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {mode === 'edit' ? 'Editar Habilidad' : 'Nueva Habilidad'}
                </h3>
                <p className="text-sm text-blue-100">{employeeName}</p>
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
                  {/* Información Básica */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Habilidad *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Marketing Digital"
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoría *
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {categories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nivel Actual *
                          </label>
                          <select
                            value={formData.level}
                            onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {levels.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Puntuación Actual (1-5) *
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="0.1"
                            value={formData.score}
                            onChange={(e) => setFormData(prev => ({ ...prev, score: parseFloat(e.target.value) }))}
                            className="flex-1"
                          />
                          <span className="font-medium text-gray-900 min-w-[3rem] text-center">
                            {formData.score}/5
                          </span>
                        </div>
                        {errors.score && <p className="text-red-600 text-sm mt-1">{errors.score}</p>}
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isRequired"
                          checked={formData.isRequired}
                          onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isRequired" className="ml-2 text-sm text-gray-700">
                          Habilidad requerida para el puesto
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Plan de Desarrollo */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Plan de Desarrollo</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plan de Desarrollo *
                        </label>
                        <textarea
                          value={formData.developmentPlan}
                          onChange={(e) => setFormData(prev => ({ ...prev, developmentPlan: e.target.value }))}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.developmentPlan ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Describe el plan para desarrollar esta habilidad..."
                        />
                        {errors.developmentPlan && <p className="text-red-600 text-sm mt-1">{errors.developmentPlan}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nivel Objetivo
                          </label>
                          <select
                            value={formData.targetLevel}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetLevel: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {levels.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Objetivo
                          </label>
                          <input
                            type="date"
                            value={formData.targetDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              errors.targetDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.targetDate && <p className="text-red-600 text-sm mt-1">{errors.targetDate}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className="space-y-6">
                  {/* Recursos */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Recursos</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recursos de Aprendizaje
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={currentResource}
                            onChange={(e) => setCurrentResource(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Curso de Excel avanzado"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                          />
                          <button
                            type="button"
                            onClick={addResource}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>

                      {formData.resources && formData.resources.length > 0 && (
                        <div className="space-y-2">
                          {formData.resources.map((resource, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm text-gray-700">{resource}</span>
                              <button
                                type="button"
                                onClick={() => removeResource(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Evidencia */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Evidencia</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción de Evidencia
                        </label>
                        <textarea
                          value={formData.evidence}
                          onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Describe la evidencia de esta habilidad..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Archivos de Evidencia
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Arrastra archivos aquí o haz clic para seleccionar
                            </p>
                            <input
                              type="file"
                              multiple
                              onChange={handleFileChange}
                              className="hidden"
                              id="file-upload"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <label
                              htmlFor="file-upload"
                              className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                              Seleccionar Archivos
                            </label>
                          </div>
                        </div>

                        {files.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">{file.name}</span>
                                  <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="text-red-600 hover:text-red-800"
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
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{mode === 'edit' ? 'Actualizar' : 'Crear'} Habilidad</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SkillModal;
