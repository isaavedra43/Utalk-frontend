import React from 'react';
import { Search, Star, RefreshCw, Bell, User } from 'lucide-react';
import type { DashboardHeader as DashboardHeaderType } from '../../types/dashboard';

interface DashboardHeaderProps {
  header: DashboardHeaderType;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  onAIToggle?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  header,
  onSearch,
  onRefresh,
  onAIToggle
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo - Saludo y tiempo */}
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-gray-900">
            {header.greeting}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{header.currentTime}</span>
            <span>•</span>
            <span>{header.lastUpdated}</span>
          </div>
        </div>

        {/* Centro - Barra de búsqueda */}
        <div className="flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={header.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>

        {/* Lado derecho - Acciones */}
        <div className="flex items-center space-x-4">
          {/* Vista IA */}
          <button
            onClick={onAIToggle}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              header.actions.aiView 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Star className="h-4 w-4" />
            <span className="text-sm font-medium">Vista IA</span>
          </button>

          {/* Botón de actualizar */}
          <button
            onClick={onRefresh}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar dashboard"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          {/* Notificaciones */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* Avatar del usuario */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              {header.user.avatar ? (
                <img 
                  src={header.user.avatar} 
                  alt={header.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 