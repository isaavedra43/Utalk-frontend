import React, { useState } from 'react';
import { Search, User, Clock, Folder } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';

export const ChannelsColumn: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { stats } = useConversations();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - Canales */}
      <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Canales</h2>
        
        {/* Búsqueda - Filtrar */}
        <div className="relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
          <input
            type="text"
            placeholder="Filtrar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 sm:pl-8 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navegación con Badges */}
      <div className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto min-h-0">
        {/* Asignados a ti */}
        <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
            <span className="text-xs sm:text-sm text-gray-700">Asignados a ti</span>
          </div>
          <span className="bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[1.25rem] sm:min-w-[1.5rem] text-center font-medium">
            {stats.assigned > 9 ? '9+' : stats.assigned}
          </span>
        </div>

        {/* Sin contestar */}
        <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
            <span className="text-xs sm:text-sm text-gray-700">Sin contestar</span>
          </div>
          <span className="bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[1.25rem] sm:min-w-[1.5rem] text-center font-medium">
            {stats.unread}
          </span>
        </div>

        {/* Abiertos */}
        <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <Folder className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
            <span className="text-xs sm:text-sm text-gray-700">Abiertos</span>
          </div>
          <span className="bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[1.25rem] sm:min-w-[1.5rem] text-center font-medium">
            {stats.open}
          </span>
        </div>

        {/* Urgentes */}
        <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-3 w-3 sm:h-4 sm:w-4 bg-orange-500 rounded-full"></div>
            <span className="text-xs sm:text-sm text-gray-700">Urgentes</span>
          </div>
          <span className="bg-orange-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[1.25rem] sm:min-w-[1.5rem] text-center font-medium">
            {stats.urgent}
          </span>
        </div>
      </div>
    </div>
  );
}; 