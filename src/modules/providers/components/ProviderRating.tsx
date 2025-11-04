import React, { useState } from 'react';
import { Star, TrendingUp, TrendingDown, Clock, Package, DollarSign, ThumbsUp } from 'lucide-react';

interface ProviderRatingProps {
  providerId: string;
  rating?: {
    overall: number; // 1-5
    quality: number; // 1-5
    delivery: number; // 1-5
    price: number; // 1-5
    communication: number; // 1-5
    totalReviews: number;
  };
  onUpdateRating?: (rating: {
    overall: number;
    quality: number;
    delivery: number;
    price: number;
    communication: number;
    notes?: string;
  }) => Promise<void>;
}

export const ProviderRating: React.FC<ProviderRatingProps> = ({
  providerId,
  rating,
  onUpdateRating,
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [formData, setFormData] = useState({
    quality: rating?.quality || 0,
    delivery: rating?.delivery || 0,
    price: rating?.price || 0,
    communication: rating?.communication || 0,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const categories = [
    {
      key: 'quality' as const,
      label: 'Calidad del Producto',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      key: 'delivery' as const,
      label: 'Tiempo de Entrega',
      icon: Clock,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      key: 'price' as const,
      label: 'Relación Precio-Valor',
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      key: 'communication' as const,
      label: 'Comunicación',
      icon: ThumbsUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  const renderStars = (value: number, onRateChange?: (value: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRateChange?.(star)}
            disabled={!onRateChange}
            className={`transition-colors ${onRateChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRecommendationText = (score: number): { text: string; color: string } => {
    if (score >= 4.5) return { text: 'Excelente', color: 'text-green-600' };
    if (score >= 4.0) return { text: 'Muy Bueno', color: 'text-blue-600' };
    if (score >= 3.5) return { text: 'Bueno', color: 'text-yellow-600' };
    if (score >= 3.0) return { text: 'Regular', color: 'text-orange-600' };
    return { text: 'Necesita Mejorar', color: 'text-red-600' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onUpdateRating) return;
    
    setSaving(true);
    try {
      const overall = (formData.quality + formData.delivery + formData.price + formData.communication) / 4;
      
      await onUpdateRating({
        overall,
        quality: formData.quality,
        delivery: formData.delivery,
        price: formData.price,
        communication: formData.communication,
        notes: formData.notes,
      });

      setShowRatingModal(false);
    } catch (error) {
      console.error('Error guardando calificación:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating Card */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Calificación General</h3>
          {onUpdateRating && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Calificar
            </button>
          )}
        </div>

        {rating && rating.overall > 0 ? (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">{rating.overall.toFixed(1)}</div>
              <div className="flex items-center justify-center mt-2">
                {renderStars(Math.round(rating.overall))}
              </div>
              <p className={`text-sm font-medium mt-2 ${getRecommendationText(rating.overall).color}`}>
                {getRecommendationText(rating.overall).text}
              </p>
            </div>

            <div className="flex-1 border-l border-yellow-300 pl-6">
              <p className="text-sm text-gray-600">
                Basado en <span className="font-semibold">{rating.totalReviews}</span> {rating.totalReviews === 1 ? 'evaluación' : 'evaluaciones'}
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Calidad</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{rating.quality.toFixed(1)}</span>
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Entrega</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{rating.delivery.toFixed(1)}</span>
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Precio</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{rating.price.toFixed(1)}</span>
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <p className="text-xs text-gray-600">Comunicación</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{rating.communication.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Este proveedor aún no ha sido calificado</p>
            {onUpdateRating && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Agregar Calificación
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detailed Rating Cards */}
      {rating && rating.overall > 0 && (
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-4">Evaluación por Categoría</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const value = rating[category.key];
              const Icon = category.icon;
              
              return (
                <div
                  key={category.key}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${category.bg}`}>
                      <Icon className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{category.label}</h5>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {renderStars(Math.round(value))}
                    <span className="text-lg font-semibold text-gray-900">{value.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Calificar Proveedor</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {categories.map((category) => {
                const Icon = category.icon;
                
                return (
                  <div key={category.key} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.bg}`}>
                        <Icon className={`w-5 h-5 ${category.color}`} />
                      </div>
                      <label className="text-sm font-medium text-gray-700">
                        {category.label}
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderStars(formData[category.key], (value) => 
                        setFormData({ ...formData, [category.key]: value })
                      )}
                      <span className="text-sm text-gray-600">
                        {formData[category.key] === 0 ? 'Sin calificar' : `${formData[category.key]} estrellas`}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comentarios (Opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Agrega comentarios sobre tu experiencia con este proveedor..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || Object.values(formData).slice(0, 4).some(v => v === 0)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar Calificación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

