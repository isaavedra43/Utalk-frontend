import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Star,
  Upload
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { CreateReviewRequest, EquipmentReview } from '../../../services/equipmentService';

interface EquipmentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: CreateReviewRequest, photos: File[]) => Promise<void>;
  equipmentName: string;
}

const EquipmentReviewModal: React.FC<EquipmentReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipmentName
}) => {
  const { showSuccess, showError } = useNotifications();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateReviewRequest>({
    reviewType: 'daily',
    condition: 'excellent',
    cleanliness: 'excellent',
    functionality: 'excellent',
    damages: [],
    maintenanceRequired: false,
    replacementRequired: false,
    photos: []
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [currentDamage, setCurrentDamage] = useState({
    type: '',
    description: '',
    severity: 'minor' as 'minor' | 'moderate' | 'severe'
  });
  const [isLoading, setIsLoading] = useState(false);

  const reviewTypes = [
    { value: 'daily', label: 'Diaria' },
    { value: 'third_day', label: 'Tercer Día' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'annual', label: 'Anual' }
  ];

  const conditions = [
    { value: 'excellent', label: 'Excelente', color: 'green', stars: 5 },
    { value: 'good', label: 'Bueno', color: 'blue', stars: 4 },
    { value: 'fair', label: 'Regular', color: 'yellow', stars: 3 },
    { value: 'poor', label: 'Malo', color: 'orange', stars: 2 }
  ];

  const functionality = [
    { value: 'excellent', label: 'Excelente' },
    { value: 'good', label: 'Bueno' },
    { value: 'fair', label: 'Regular' },
    { value: 'poor', label: 'Malo' },
    { value: 'not_working', label: 'No Funciona' }
  ];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addDamage = () => {
    if (currentDamage.type && currentDamage.description) {
      setFormData(prev => ({
        ...prev,
        damages: [...(prev.damages || []), { ...currentDamage, photos: [] }]
      }));
      setCurrentDamage({ type: '', description: '', severity: 'minor' });
    }
  };

  const removeDamage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      damages: prev.damages?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await onSubmit(formData, photos);
      showSuccess('Revisión registrada exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      showError(error instanceof Error ? error.message : 'Error registrando revisión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        reviewType: 'daily',
        condition: 'excellent',
        cleanliness: 'excellent',
        functionality: 'excellent',
        damages: [],
        maintenanceRequired: false,
        replacementRequired: false
      });
      setPhotos([]);
      setCurrentDamage({ type: '', description: '', severity: 'minor' });
      onClose();
    }
  };

  if (!isOpen) return null;

  const getStars = (rating: string) => {
    const condition = conditions.find(c => c.value === rating);
    return condition?.stars || 0;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Revisión de Equipo</h3>
                <p className="text-sm text-purple-100">{equipmentName}</p>
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
              <div className="space-y-6">
                {/* Tipo de Revisión */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Revisión
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {reviewTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, reviewType: type.value as any }))}
                        className={`px-3 py-2 border-2 rounded-lg text-sm transition-all ${
                          formData.reviewType === type.value
                            ? 'border-purple-600 bg-purple-50 text-purple-900 font-medium'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condición */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condición General
                  </label>
                  <div className="space-y-2">
                    {conditions.map(condition => (
                      <button
                        key={condition.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, condition: condition.value as any }))}
                        className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg transition-all ${
                          formData.condition === condition.value
                            ? `border-${condition.color}-600 bg-${condition.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`font-medium ${
                          formData.condition === condition.value ? `text-${condition.color}-900` : 'text-gray-700'
                        }`}>
                          {condition.label}
                        </span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < condition.stars
                                  ? `text-${condition.color}-500 fill-current`
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limpieza y Funcionalidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limpieza
                    </label>
                    <select
                      value={formData.cleanliness}
                      onChange={(e) => setFormData(prev => ({ ...prev, cleanliness: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {conditions.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Funcionalidad
                    </label>
                    <select
                      value={formData.functionality}
                      onChange={(e) => setFormData(prev => ({ ...prev, functionality: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {functionality.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Daños */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span>Daños Detectados</span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={currentDamage.type}
                        onChange={(e) => setCurrentDamage(prev => ({ ...prev, type: e.target.value }))}
                        placeholder="Tipo de daño"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={currentDamage.description}
                        onChange={(e) => setCurrentDamage(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descripción"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <select
                        value={currentDamage.severity}
                        onChange={(e) => setCurrentDamage(prev => ({ ...prev, severity: e.target.value as any }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="minor">Menor</option>
                        <option value="moderate">Moderado</option>
                        <option value="severe">Severo</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={addDamage}
                      className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Agregar Daño
                    </button>
                  </div>

                  {formData.damages && formData.damages.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.damages.map((damage, index) => (
                        <div key={index} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-red-200">
                          <div className="flex-1">
                            <span className="font-medium text-sm">{damage.type}</span>
                            <span className="text-gray-600 text-sm"> - {damage.description}</span>
                            <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                              damage.severity === 'severe' ? 'bg-red-100 text-red-800' :
                              damage.severity === 'moderate' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {damage.severity === 'severe' ? 'Severo' : 
                               damage.severity === 'moderate' ? 'Moderado' : 'Menor'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDamage(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mantenimiento y Reemplazo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.maintenanceRequired}
                        onChange={(e) => setFormData(prev => ({ ...prev, maintenanceRequired: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="font-medium text-gray-900">Requiere Mantenimiento</span>
                    </label>
                    {formData.maintenanceRequired && (
                      <textarea
                        value={formData.maintenanceDescription || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, maintenanceDescription: e.target.value }))}
                        placeholder="Descripción del mantenimiento requerido..."
                        className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={3}
                      />
                    )}
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.replacementRequired}
                        onChange={(e) => setFormData(prev => ({ ...prev, replacementRequired: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="font-medium text-gray-900">Requiere Reemplazo</span>
                    </label>
                    {formData.replacementRequired && (
                      <p className="mt-2 text-sm text-orange-800">
                        El equipo necesita ser reemplazado. Se generará una solicitud automática.
                      </p>
                    )}
                  </div>
                </div>

                {/* Comentarios del Empleado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentarios del Empleado
                  </label>
                  <textarea
                    value={formData.employeeComments || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeComments: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                {/* Fotos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fotos de la Revisión
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      ref={photoInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Camera className="h-5 w-5" />
                      <span>Tomar/Agregar Fotos</span>
                    </button>
                    
                    {photos.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Registrar Revisión</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentReviewModal;

