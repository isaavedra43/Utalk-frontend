import React, { memo } from 'react';
import { AlertTriangle, Lightbulb, RefreshCw, Copy, ArrowRight } from 'lucide-react';

interface Insight {
  id: string;
  type: 'alert' | 'recommendation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  tags: string[];
}

interface AIInsightsProps {
  dailySummary: string;
  summaryConfidence: number;
  summaryTimestamp: string;
  insights: Insight[];
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getIcon = (type: string) => {
  switch (type) {
    case 'alert':
      return <AlertTriangle className="w-5 h-5" />;
    case 'recommendation':
      return <Lightbulb className="w-5 h-5" />;
    default:
      return <AlertTriangle className="w-5 h-5" />;
  }
};

export const AIInsights = memo<AIInsightsProps>(({ 
  dailySummary, 
  summaryConfidence, 
  summaryTimestamp, 
  insights 
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Insights de IA</h2>
        <p className="text-gray-600">Análisis y recomendaciones automáticas</p>
      </div>

      {/* Resumen del día */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del día</h3>
        <p className="text-gray-700 leading-relaxed mb-4">{dailySummary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              Confianza: {summaryConfidence}%
            </span>
            <span className="text-xs text-gray-500">{summaryTimestamp}</span>
          </div>
        </div>
      </div>

      {/* Recomendaciones y Alertas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recomendaciones y Alertas ({insights.length})
          </h3>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    insight.type === 'alert' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {getIcon(insight.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{insight.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-3">{insight.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{insight.confidence}% confianza</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{insight.timestamp}</span>
                </div>
                <div className="flex space-x-1">
                  {insight.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

AIInsights.displayName = 'AIInsights'; 