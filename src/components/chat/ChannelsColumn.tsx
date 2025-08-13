import React, { useState } from 'react';
import { Search, User, Clock, Folder } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';

export const ChannelsColumn: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { stats } = useConversations();

  return (
    <div className="flex flex-col h-full">
      {/* Header - Canales */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Canales</h2>
        
        {/* Búsqueda - Q Filtrar */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
          <input
            type="text"
            placeholder="Filtrar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navegación con Badges */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Asignados a ti */}
        <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-gray-600" />
            <span className="text-xs text-gray-700">Asignados a ti</span>
          </div>
          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
            {stats.assigned > 9 ? '9+' : stats.assigned}
          </span>
        </div>

        {/* Sin contestar */}
        <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-gray-600" />
            <span className="text-xs text-gray-700">Sin contestar</span>
          </div>
          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
            {stats.unread}
          </span>
        </div>

        {/* Abiertos */}
        <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
          <div className="flex items-center gap-2">
            <Folder className="h-3 w-3 text-gray-600" />
            <span className="text-xs text-gray-700">Abiertos</span>
          </div>
          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
            {stats.open}
          </span>
        </div>
      </div>
    </div>
  );
}; 