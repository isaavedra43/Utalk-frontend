import React from 'react';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Clock, 
  Star,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import type { Client } from '../../../../types/client';

interface AIRecommendation {
  id: string;
  type: 'action' | 'insight' | 'prediction' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedValue?: number;
  timeToImplement?: string;
}

interface ClientAITabProps {
  client: Client;
  recommendations?: AIRecommendation[];
}

export const ClientAITab: React.FC<ClientAITabProps> = ({
  client,
  recommendations = []
}) => {
  // Mock recomendaciones basadas en las imágenes
  const mockRecommendations: AIRecommendation[] = [
    {
      id: '1',
      type: 'action',
      title: 'Compartir caso de éxito de empresa similar',
      description: 'Envía un caso de éxito similar para acelerar la decisión. El cliente muestra interés pero necesita validación.',
      confidence: 85,
      priority: 'high',
      category: 'Comunicación',
      estimatedValue: 50000,
      timeToImplement: '5 min'
    },
    {
      id: '2',
      type: 'action',
      title: 'Agendar demo personalizada',
      description: 'Programa una demo específica para las necesidades del cliente basada en su perfil enterprise.',
      confidence: 78,
      priority: 'high',
      category: 'Ventas',
      estimatedValue: 75000,
      timeToImplement: '30 min'
    },
    {
      id: '3',
      type: 'action',
      title: 'Enviar ROI calculator',
      description: 'Proporciona una calculadora de ROI personalizada para demostrar el valor de la inversión.',
      confidence: 72,
      priority: 'medium',
      category: 'Herramientas',
      estimatedValue: 25000,
      timeToImplement: '10 min'
    },
    {
      id: '4',
      type: 'insight',
      title: 'Módulo Analytics Avanzado',
      description: 'Basado en su perfil enterprise, este módulo le permitiría análisis predictivos de ventas.',
      confidence: 78,
      priority: 'medium',
      category: 'Producto',
      estimatedValue: 125000,
      timeToImplement: '45 min'
    },
    {
      id: '5',
      type: 'prediction',
      title: 'Probabilidad de cierre aumentará 15%',
      description: 'Si se implementan las acciones sugeridas, la probabilidad de cierre aumentará significativamente.',
      confidence: 82,
      priority: 'high',
      category: 'Predicción'
    }
  ];

  const allRecommendations = recommendations.length > 0 ? recommendations : mockRecommendations;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityColor = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: AIRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  const getTypeIcon = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'action':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'insight':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'prediction':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'opportunity':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: AIRecommendation['type']) => {
    switch (type) {
      case 'action':
        return 'bg-blue-50 border-blue-200';
      case 'insight':
        return 'bg-purple-50 border-purple-200';
      case 'prediction':
        return 'bg-green-50 border-green-200';
      case 'opportunity':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const highPriorityRecommendations = allRecommendations.filter(r => r.priority === 'high');
  const totalEstimatedValue = allRecommendations
    .filter(r => r.estimatedValue)
    .reduce((sum, r) => sum + (r.estimatedValue || 0), 0);

  return (
    <div className="space-y-4">
      {/* Score de IA */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            Score de IA
          </h4>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">IA</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">{client.score}%</div>
            <div className="text-xs text-gray-500">Confianza en el análisis</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">Win Rate: {client.winRate}%</div>
            <div className="text-xs text-gray-500">Basado en datos históricos</div>
          </div>
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          Resumen ejecutivo
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Cliente enterprise con alto potencial. Ha participado en 2 demos y solicitó propuesta. 
          Principales intereses: integración con sistemas existentes y ROI. Sin objeciones importantes identificadas.
        </p>
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-500">Demos realizadas:</span>
            <p className="text-sm font-medium text-gray-900">2</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Valor potencial:</span>
            <p className="text-sm font-medium text-gray-900">{formatCurrency(totalEstimatedValue)}</p>
          </div>
        </div>
      </div>

      {/* Próximas mejores acciones */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Próximas mejores acciones
          </h4>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {highPriorityRecommendations.length} prioridad alta
          </span>
        </div>
        <div className="space-y-3">
          {highPriorityRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`p-3 rounded-lg border ${getTypeColor(recommendation.type)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(recommendation.type)}
                  <h5 className="text-sm font-medium text-gray-900">
                    {recommendation.title}
                  </h5>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                  {getPriorityLabel(recommendation.priority)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {recommendation.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{recommendation.timeToImplement}</span>
                  </div>
                  {recommendation.estimatedValue && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{formatCurrency(recommendation.estimatedValue)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span className={getConfidenceColor(recommendation.confidence)}>
                      {recommendation.confidence}% confianza
                    </span>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center space-x-1">
                  <span>Implementar</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Módulo Analytics Avanzado */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            Módulo Analytics Avanzado
          </h4>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">78%</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Basado en su perfil enterprise, este módulo le permitiría análisis predictivos de ventas.
        </p>
        <div className="space-y-2">
          <button className="w-full text-left p-3 text-sm bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
            Mostrar demo del módulo analytics
          </button>
          <button className="w-full text-left p-3 text-sm bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
            Compartir caso de éxito con métricas
          </button>
        </div>
      </div>

      {/* Todas las recomendaciones */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Todas las recomendaciones</h4>
        <div className="space-y-3">
          {allRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getTypeIcon(recommendation.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h5 className="text-sm font-medium text-gray-900">
                    {recommendation.title}
                  </h5>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                    {getPriorityLabel(recommendation.priority)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {recommendation.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className={getConfidenceColor(recommendation.confidence)}>
                      {recommendation.confidence}% confianza
                    </span>
                    {recommendation.estimatedValue && (
                      <span>{formatCurrency(recommendation.estimatedValue)}</span>
                    )}
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 