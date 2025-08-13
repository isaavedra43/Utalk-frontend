import React from 'react';
import { Search, User, Clock, Folder } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';

export const LeftSidebar: React.FC = () => {
  const { stats } = useConversations();
  
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

      {/* Filtros */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-2 mb-4">
          <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
            All
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300">
            New
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300">
            Asig
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full hover:bg-gray-300">
            Urg
          </button>
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
    </div>
  );
}; 