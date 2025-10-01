import React from 'react';
import { Bell, Search, Filter, Settings, Mail, AlertTriangle, CheckCircle, Clock, Menu } from 'lucide-react';
import { useMobileMenuContext } from '../../contexts/MobileMenuContext';

const NotificationsModule = () => {
  const { openMenu } = useMobileMenuContext();

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
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
              <h1 className="text-lg font-bold text-gray-900">Notificaciones</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto text-center pt-20 lg:pt-0">
        {/* Icono principal */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bell className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Centro de Notificaciones
        </h1>
        
        {/* Subtítulo */}
        <p className="text-lg text-gray-600 mb-8">
          Próximamente
        </p>

        {/* Descripción */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <p className="text-gray-700 mb-4">
            Estamos desarrollando un centro de notificaciones completo para gestionar todas tus alertas y comunicaciones desde un solo lugar.
          </p>
          
          {/* Características futuras */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Alertas críticas en tiempo real</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Gestión de tareas y recordatorios</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>Notificaciones por email</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Filter className="w-4 h-4 text-purple-500" />
              <span>Filtros y categorización</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Search className="w-4 h-4 text-indigo-500" />
              <span>Búsqueda avanzada</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Configuración personalizada</span>
            </div>
          </div>
        </div>

        {/* Estado de desarrollo */}
        <div className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
          En desarrollo
        </div>
      </div>
    </div>
  );
};

export { NotificationsModule };
export default NotificationsModule;