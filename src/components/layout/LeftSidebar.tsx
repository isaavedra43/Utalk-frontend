import React from 'react';
import { Search, User, Clock, Folder, MessageSquare, Users, BarChart3, Settings, LayoutDashboard } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';
import { useAppStore } from '../../stores/useAppStore';

export const LeftSidebar: React.FC = () => {
  const { stats } = useConversations();
  const { currentModule, navigateToModule } = useAppStore();
  
  return (
    <div className="flex flex-col h-full">
      {/* Header - Canales */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Canales</h2>
        
        {/* Búsqueda - Q Filtrar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Q Filtrar"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navegación con Badges */}
      <div className="flex-1 p-4 space-y-2">
        {/* Asignados a ti */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Asignados a ti</span>
          </div>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {stats.assigned > 9 ? '9+' : stats.assigned}
          </span>
        </div>

        {/* Sin contestar */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Sin contestar</span>
          </div>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {stats.unread}
          </span>
        </div>

        {/* Abiertos */}
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
          <div className="flex items-center gap-3">
            <Folder className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700">Abiertos</span>
          </div>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {stats.open}
          </span>
        </div>
      </div>

      {/* NUEVO: Navegación entre módulos */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Módulos</h3>
        <div className="space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => navigateToModule('dashboard')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
              currentModule === 'dashboard' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          {/* Chat */}
          <button
            onClick={() => navigateToModule('chat')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
              currentModule === 'chat' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </button>

          {/* Contactos */}
          <button
            onClick={() => navigateToModule('contacts')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
              currentModule === 'contacts' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Contactos</span>
          </button>

          {/* Analytics */}
          <button
            onClick={() => navigateToModule('analytics')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
              currentModule === 'analytics' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </button>

          {/* Configuración */}
          <button
            onClick={() => navigateToModule('settings')}
            className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
              currentModule === 'settings' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 