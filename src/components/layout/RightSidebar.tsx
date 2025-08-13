import React, { useState } from 'react';
import { Phone, Settings, Calendar, Copy, Plus, Bell, FileText, MoreVertical } from 'lucide-react';

export const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'copilot'>('details');

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'details'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'copilot'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Copilot
        </button>
      </div>

      {/* Contenido de tabs */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' ? (
          <DetailsPanel />
        ) : (
          <CopilotPanel />
        )}
      </div>
    </div>
  );
};

const DetailsPanel: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      {/* Perfil del Cliente */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Perfil del Cliente</h3>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
            MG
          </div>
          <div>
            <h4 className="font-medium text-gray-900">María González</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Activo</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">WhatsApp</span>
            </div>
          </div>
          <button className="ml-auto p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Información de Contacto</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Teléfono</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-900">+34612345678</span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Copy className="h-3 w-3 text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Canal</span>
            </div>
            <span className="text-sm text-gray-900">WhatsApp</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Último contacto</span>
            </div>
            <span className="text-sm text-gray-900">hace más de 1 año</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Cliente desde</span>
            </div>
            <span className="text-sm text-gray-900">hace más de 1 año</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">WhatsApp ID</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-900">34612345678</span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Copy className="h-3 w-3 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Etiquetas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Etiquetas</h4>
          <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
            <Plus className="h-4 w-4" />
            Añadir
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">VIP</span>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Premium</span>
        </div>
      </div>

      {/* Notificaciones y Configuración */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Notificaciones y Configuración</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-600" />
              <div>
                <span className="text-sm text-gray-700">Notificaciones</span>
                <p className="text-xs text-gray-500">Recibir notificaciones de esta conversación</p>
              </div>
            </div>
            <div className="w-10 h-6 bg-blue-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Reportes</span>
            </div>
            <div className="w-10 h-6 bg-gray-300 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CopilotPanel: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      {/* Header Copilot */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Copiloto IA</h3>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Mock Mode</span>
        </div>
        <p className="text-sm text-gray-600">Copilot is here to help. Just ask.</p>
      </div>

      {/* Tabs de Copilot */}
      <div className="flex border-b border-gray-200">
        <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
          Sugerencias
        </button>
        <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Chat IA
        </button>
      </div>

      {/* Sugerencias de IA */}
      <div className="space-y-4">
        {/* Sugerencia 1 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-green-800">Confirmar cambio de dirección</h4>
            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Alta confianza</span>
          </div>
          <p className="text-sm text-green-700 mb-3">
            Por supuesto, puedo ayudarte a cambiar la dirección de entrega. ¿Podrías proporcionarme la nueva dirección completa?
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">order_management</span>
              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">shipping_policy</span>
            </div>
            <div className="flex gap-2">
              <button className="text-xs text-green-700 hover:text-green-800">Copiar</button>
              <button className="text-xs text-green-700 hover:text-green-800">Mejorar</button>
            </div>
          </div>
        </div>

        {/* Sugerencia 2 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-yellow-800">Ofrecer tracking</h4>
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Confianza media</span>
          </div>
          <p className="text-sm text-yellow-700">
            Te envío el enlace de seguimiento para que puedas monitorear tu pedido en tiempo real:
          </p>
        </div>
      </div>

      {/* Input de chat */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <input
          type="text"
          placeholder="hola"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">Modo simulado - sin backend real</p>
      </div>
    </div>
  );
}; 