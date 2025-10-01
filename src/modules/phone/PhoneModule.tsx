import React from 'react';
import { Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, Mic, Headphones, Menu } from 'lucide-react';
import { useMobileMenuContext } from '../../contexts/MobileMenuContext';

const PhoneModule: React.FC = () => {
  const { openMenu } = useMobileMenuContext();

  return (
    <div className="min-h-screen bg-white">
      {/* Header móvil con menú */}
      <div className="absolute top-0 left-0 right-0 z-10 lg:hidden">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={openMenu}
                className="flex items-center justify-center p-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 rounded-xl shadow-sm hover:from-gray-100 hover:to-gray-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg"
                title="Abrir menú de módulos"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">Teléfono</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 pt-20 lg:pt-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Phone className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Módulo de Teléfono
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistema de llamadas integrado con grabación, transferencias y gestión de colas. 
            Mejora la experiencia de atención telefónica.
          </p>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <PhoneCall className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Próximamente
            </h2>
            
            <p className="text-gray-600 mb-6">
              Estamos trabajando en esta funcionalidad. Pronto podrás disfrutar de:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PhoneIncoming className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Llamadas Entrantes</h3>
                  <p className="text-sm text-gray-600">Gestión de llamadas recibidas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <PhoneOutgoing className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Llamadas Salientes</h3>
                  <p className="text-sm text-gray-600">Realizar llamadas a clientes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mic className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Grabación de Llamadas</h3>
                  <p className="text-sm text-gray-600">Registro automático de conversaciones</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cola de Llamadas</h3>
                  <p className="text-sm text-gray-600">Distribución automática de llamadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneModule;
