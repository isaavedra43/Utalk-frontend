import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { NotificationAIRecommendation } from '../../../types/notification';

interface NotificationAIRecommendationProps {
  recommendation: NotificationAIRecommendation;
  className?: string;
}

export const NotificationAIRecommendationComponent: React.FC<NotificationAIRecommendationProps> = ({
  recommendation,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4" />;
      case 'low':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };



  return (
    <div className={`notification-ai-recommendation ${className}`}>
      {/* Header colapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            IA Next Best Action
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Badge de confianza */}
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(recommendation.confidence)}`}>
            {getConfidenceIcon(recommendation.confidence)}
            Confianza: {recommendation.confidence}
          </span>
          
          {/* Icono de expandir/colapsar */}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg">
          {/* Recomendación principal */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recomendación</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {recommendation.recommendation}
            </p>
          </div>

          {/* Pasos sugeridos */}
          {recommendation.suggestedSteps && recommendation.suggestedSteps.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Pasos sugeridos</h4>
              <div className="space-y-2">
                {recommendation.suggestedSteps.map((step, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* Número del paso */}
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      
                      {/* Contenido del paso */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {step}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones rápidas de IA */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Aplicar Recomendación
              </button>
              <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
                Más Opciones
              </button>
              <button className="px-3 py-1 text-xs bg-transparent text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Ignorar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 