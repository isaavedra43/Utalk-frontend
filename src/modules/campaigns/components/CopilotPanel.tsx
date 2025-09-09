import React from 'react';
import { Bot, Lightbulb, TrendingUp, Zap, Users, Target, MessageSquare, Send } from 'lucide-react';

export const CopilotPanel: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Copiloto de Campañas</h2>
          <p className="text-gray-600">IA para optimizar, redactar y predecir resultados</p>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Generar Contenido</h3>
                <p className="text-sm text-gray-600">Crea asuntos, copys y variantes A/B</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Optimizar Timing</h3>
                <p className="text-sm text-gray-600">Encuentra el mejor momento para enviar</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sugerir Audiencias</h3>
                <p className="text-sm text-gray-600">Recomendaciones de segmentación</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Predecir Resultados</h3>
                <p className="text-sm text-gray-600">Estimación de métricas y ROI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat del copiloto */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Conversación con IA</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">
                    ¡Hola! Soy tu copiloto de campañas. Puedo ayudarte a:
                  </p>
                  <ul className="text-sm text-gray-700 mt-2 space-y-1">
                    <li>• Redactar asuntos y copys optimizados</li>
                    <li>• Sugerir el mejor canal según tu objetivo</li>
                    <li>• Predecir resultados basado en históricos</li>
                    <li>• Optimizar timing y frecuencia</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Pregunta algo sobre tus campañas..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sugerencias recientes */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Sugerencias Recientes</h3>
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Optimizar Black Friday Email</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Cambiar el asunto de "¡Descuento del 50%!" a "¡Solo por hoy! 50% OFF - No te lo pierdas" 
                    podría aumentar la tasa de apertura en un 12%
                  </p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Aplicada</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Mejorar Timing SMS</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Enviar SMS promocionales entre 10:00-12:00 y 15:00-17:00 podría mejorar 
                    la tasa de clics en un 8%
                  </p>
                </div>
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pendiente</span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Segmentar Audiencia</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Crear segmento de "usuarios activos últimos 30 días" para la campaña 
                    de re-engagement podría mejorar conversión en un 15%
                  </p>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Nueva</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
