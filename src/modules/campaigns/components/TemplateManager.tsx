import React from 'react';
import { FileText, Mail, MessageSquare, Smartphone, Plus, Edit, Trash2, Eye } from 'lucide-react';

export const TemplateManager: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestor de Plantillas</h2>
            <p className="text-gray-600">Crea y gestiona plantillas para todos los canales</p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Nueva Plantilla</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Plantilla Email */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Black Friday Email</h3>
                  <p className="text-sm text-gray-500">Email promocional</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Aprobada</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Plantilla para campañas promocionales de Black Friday con descuentos especiales
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>v2.1</span>
                <span>•</span>
                <span>3 variables</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Plantilla SMS */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">SMS Promocional</h3>
                  <p className="text-sm text-gray-500">Mensaje de texto</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Aprobada</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Plantilla para mensajes SMS promocionales con enlaces cortos
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>v1.3</span>
                <span>•</span>
                <span>2 variables</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Plantilla WhatsApp */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">WhatsApp Marketing</h3>
                  <p className="text-sm text-gray-500">Template HSM</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pendiente</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Plantilla HSM para WhatsApp con botones interactivos y media
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>v1.0</span>
                <span>•</span>
                <span>4 variables</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
