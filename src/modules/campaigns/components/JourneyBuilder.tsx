import React from 'react';
import { Zap, Send, Clock, GitBranch, Webhook, Settings, Target } from 'lucide-react';

export const JourneyBuilder: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Journey Builder</h2>
          <p className="text-gray-600">Crea flujos automatizados con nodos visuales y lógica condicional</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Canvas Visual</h3>
              <p className="text-gray-600 mb-6">Arrastra y conecta nodos para crear journeys automatizados</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <Send className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Enviar</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Esperar</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <GitBranch className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Condición</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-white">
                  <Webhook className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Webhook</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ejemplos de journeys */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Welcome Series</h3>
                <p className="text-sm text-gray-500">Onboarding automático</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Serie de 5 emails de bienvenida con intervalos de 1, 3, 7, 14 y 30 días
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">2,450 usuarios activos</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Activo</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Abandoned Cart</h3>
                <p className="text-sm text-gray-500">Recuperación de carrito</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Recuperación automática con email + SMS + WhatsApp en 1h, 24h y 72h
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">1,230 usuarios activos</span>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Activo</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Re-engagement</h3>
                <p className="text-sm text-gray-500">Reactivación de usuarios</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Campaña de reactivación para usuarios inactivos por más de 30 días
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">890 usuarios activos</span>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pausado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
