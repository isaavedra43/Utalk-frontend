import React, { useState } from 'react';
import { X, Package, Calendar, Layers, FileText } from 'lucide-react';

interface CreatePlatformModalProps {
  onClose: () => void;
  onCreate: (data: {
    platformNumber: string;
    materialType: string;
    notes?: string;
  }) => void;
}

export const CreatePlatformModal: React.FC<CreatePlatformModalProps> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    platformNumber: '',
    materialType: 'Mármol',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.platformNumber.trim()) {
      newErrors.platformNumber = 'El número de plataforma es requerido';
    }

    if (!formData.materialType.trim()) {
      newErrors.materialType = 'El tipo de material es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onCreate(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6" />
            Nueva Plataforma
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Platform Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              Número de Plataforma *
            </label>
            <input
              type="text"
              value={formData.platformNumber}
              onChange={(e) => setFormData({ ...formData, platformNumber: e.target.value })}
              placeholder="Ej: PLT-001, A-123"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.platformNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              autoFocus
            />
            {errors.platformNumber && (
              <p className="text-xs text-red-600 mt-1">{errors.platformNumber}</p>
            )}
          </div>

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-500" />
              Tipo de Material *
            </label>
            <select
              value={formData.materialType}
              onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.materialType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="Mármol">Mármol</option>
              <option value="Granito">Granito</option>
              <option value="Cuarzo">Cuarzo</option>
              <option value="Piedra Natural">Piedra Natural</option>
              <option value="Ónix">Ónix</option>
              <option value="Travertino">Travertino</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.materialType && (
              <p className="text-xs text-red-600 mt-1">{errors.materialType}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Observaciones (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre esta plataforma..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Una vez creada la plataforma, podrás comenzar a registrar las longitudes de las piezas de manera rápida e intuitiva.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Crear Plataforma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

