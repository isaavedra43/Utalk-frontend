import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  CheckCircle,
  User,
  Users,
  Target,
  TrendingUp,
  Star,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { SkillEvaluation, CreateSkillEvaluationRequest } from '../../../services/skillsService';

interface SkillEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (evaluationData: CreateSkillEvaluationRequest, files: File[]) => Promise<void>;
  employeeId: string;
  employeeName: string;
  evaluation?: SkillEvaluation | null;
  mode?: 'create' | 'edit';
}

const SkillEvaluationModal: React.FC<SkillEvaluationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
  employeeName,
  evaluation,
  mode = 'create'
}) => {
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<CreateSkillEvaluationRequest>({
    skillId: '',
    skillName: '',
    evaluationType: 'self',
    level: 'beginner',
    score: 3,
    feedback: '',
    strengths: [],
    improvements: [],
    developmentSuggestions: [],
    evidence: []
  });

  const [files, setFiles] = useState<File[]>([]);
  const [currentStrength, setCurrentStrength] = useState('');
  const [currentImprovement, setCurrentImprovement] = useState('');
  const [currentSuggestion, setCurrentSuggestion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (evaluation && mode === 'edit') {
      setFormData({
        skillId: evaluation.skillId,
        skillName: evaluation.skillName,
        evaluationType: evaluation.evaluationType,
        level: evaluation.level,
        score: evaluation.score,
        feedback: evaluation.feedback || '',
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        developmentSuggestions: evaluation.developmentSuggestions || [],
        evidence: evaluation.evidence || []
      });
    } else {
      setFormData({
        skillId: '',
        skillName: '',
        evaluationType: 'self',
        level: 'beginner',
        score: 3,
        feedback: '',
        strengths: [],
        improvements: [],
        developmentSuggestions: [],
        evidence: []
      });
      setFiles([]);
    }
  }, [evaluation, mode]);

  const evaluationTypes = [
    { value: 'self', label: 'Auto-evaluación', icon: User, color: 'blue' },
    { value: 'supervisor', label: 'Por Supervisor', icon: Users, color: 'green' },
    { value: 'peer', label: 'Por Pares', icon: Users, color: 'purple' },
    { value: '360', label: 'Evaluación 360°', icon: Target, color: 'orange' },
    { value: 'objective', label: 'Por Objetivos', icon: TrendingUp, color: 'red' }
  ];

  const levels = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' },
    { value: 'expert', label: 'Experto' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.skillName.trim()) newErrors.skillName = 'El nombre de la habilidad es requerido';
    if (formData.score < 1 || formData.score > 5) newErrors.score = 'La puntuación debe estar entre 1 y 5';

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
        skillId: '',
        skillName: '',
        evaluationType: 'self',
        level: 'beginner',
        score: 3,
        feedback: '',
        strengths: [],
        improvements: [],
        developmentSuggestions: [],
        evidence: []
      });
      setFiles([]);
      setCurrentStrength('');
      setCurrentImprovement('');
      setCurrentSuggestion('');
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

  const addStrength = () => {
    if (currentStrength.trim()) {
      setFormData(prev => ({
        ...prev,
        strengths: [...prev.strengths!, currentStrength.trim()]
      }));
      setCurrentStrength('');
    }
  };

  const removeStrength = (index: number) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths!.filter((_, i) => i !== index)
    }));
  };

  const addImprovement = () => {
    if (currentImprovement.trim()) {
      setFormData(prev => ({
        ...prev,
        improvements: [...prev.improvements!, currentImprovement.trim()]
      }));
      setCurrentImprovement('');
    }
  };

  const removeImprovement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      improvements: prev.improvements!.filter((_, i) => i !== index)
    }));
  };

  const addSuggestion = () => {
    if (currentSuggestion.trim()) {
      setFormData(prev => ({
        ...prev,
        developmentSuggestions: [...prev.developmentSuggestions!, currentSuggestion.trim()]
      }));
      setCurrentSuggestion('');
    }
  };

  const removeSuggestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      developmentSuggestions: prev.developmentSuggestions!.filter((_, i) => i !== index)
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
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {mode === 'edit' ? 'Editar Evaluación' : 'Nueva Evaluación de Habilidad'}
                </h3>
                <p className="text-sm text-orange-100">{employeeName}</p>
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
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Información de la Evaluación</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Habilidad a Evaluar *
                        </label>
                        <input
                          type="text"
                          value={formData.skillName}
                          onChange={(e) => setFormData(prev => ({ ...prev, skillName: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                            errors.skillName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Marketing Digital"
                        />
                        {errors.skillName && <p className="text-red-600 text-sm mt-1">{errors.skillName}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Evaluación
                          </label>
                          <select
                            value={formData.evaluationType}
                            onChange={(e) => setFormData(prev => ({ ...prev, evaluationType: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          >
                            {evaluationTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nivel Evaluado
                          </label>
                          <select
                            value={formData.level}
                            onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          >
                            {levels.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Puntuación (1-5) *
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
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${star <= formData.score ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-gray-900 min-w-[3rem] text-center">
                            {formData.score}/5
                          </span>
                        </div>
                        {errors.score && <p className="text-red-600 text-sm mt-1">{errors.score}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Comentarios y Feedback</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comentarios Generales
                        </label>
                        <textarea
                          value={formData.feedback}
                          onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="Comentarios generales sobre el desempeño en esta habilidad..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className="space-y-6">
                  {/* Fortalezas */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Fortalezas</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agregar Fortaleza
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={currentStrength}
                            onChange={(e) => setCurrentStrength(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder="Ej: Excelente comunicación verbal"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                          />
                          <button
                            type="button"
                            onClick={addStrength}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>

                      {formData.strengths && formData.strengths.length > 0 && (
                        <div className="space-y-2">
                          {formData.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                              <span className="text-sm text-green-800">{strength}</span>
                              <button
                                type="button"
                                onClick={() => removeStrength(index)}
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

                  {/* Áreas de Mejora */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Áreas de Mejora</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agregar Área de Mejora
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={currentImprovement}
                            onChange={(e) => setCurrentImprovement(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            placeholder="Ej: Mejorar habilidades técnicas"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImprovement())}
                          />
                          <button
                            type="button"
                            onClick={addImprovement}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>

                      {formData.improvements && formData.improvements.length > 0 && (
                        <div className="space-y-2">
                          {formData.improvements.map((improvement, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded border border-orange-200">
                              <span className="text-sm text-orange-800">{improvement}</span>
                              <button
                                type="button"
                                onClick={() => removeImprovement(index)}
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

                  {/* Sugerencias de Desarrollo */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Sugerencias de Desarrollo</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agregar Sugerencia
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={currentSuggestion}
                            onChange={(e) => setCurrentSuggestion(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Tomar curso de especialización"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSuggestion())}
                          />
                          <button
                            type="button"
                            onClick={addSuggestion}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Agregar
                          </button>
                        </div>
                      </div>

                      {formData.developmentSuggestions && formData.developmentSuggestions.length > 0 && (
                        <div className="space-y-2">
                          {formData.developmentSuggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                              <span className="text-sm text-blue-800">{suggestion}</span>
                              <button
                                type="button"
                                onClick={() => removeSuggestion(index)}
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
                              id="eval-file-upload"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <label
                              htmlFor="eval-file-upload"
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
                className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{mode === 'edit' ? 'Actualizar' : 'Crear'} Evaluación</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SkillEvaluationModal;
