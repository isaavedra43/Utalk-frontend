import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Plus, Users } from 'lucide-react';
import { MobileMenuButton } from '../../../components/layout/MobileMenuButton';
import type { TeamFilters } from '../../../types/team';

interface TeamHeaderProps {
  filters: TeamFilters;
  onFiltersChange: (filters: Partial<TeamFilters>) => void;
  onRefresh: () => void;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  onCreateAgent?: () => void;
  onSearchChange?: (term: string) => void;
  isRefreshing?: boolean;
}

const TeamHeader: React.FC<TeamHeaderProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  inactiveMembers,
  onCreateAgent,
  onSearchChange,
  isRefreshing = false
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onFiltersChange({ search: value });
    onSearchChange?.(value);
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive') => {
    onFiltersChange({ status });
  };

  return (
    <div className="w-full">
      {/* Header móvil */}
      <div className="lg:hidden px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <MobileMenuButton />
            <h1 className="text-lg font-semibold text-gray-900">Equipo & Performance</h1>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg border border-gray-300 transition-colors ${
              isRefreshing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Búsqueda móvil */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por nombre, rol o email..."
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors bg-white"
          />
        </div>

        {/* Filtros y botones móvil */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Users className="h-3 w-3" />
              <span>{inactiveMembers} inactivos</span>
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => handleStatusFilter('all')}
                className={`px-2 py-1 text-xs transition-colors ${
                  filters.status === 'all' || !filters.status
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => handleStatusFilter('active')}
                className={`px-2 py-1 text-xs transition-colors ${
                  filters.status === 'active'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                Activos
              </button>
              <button
                onClick={() => handleStatusFilter('inactive')}
                className={`px-2 py-1 text-xs transition-colors ${
                  filters.status === 'inactive'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                Inactivos
              </button>
            </div>
          </div>
          <button
            onClick={onCreateAgent}
            className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      {/* Header desktop */}
      <div className="hidden lg:block">
        {/* Título y subtítulo */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Equipo & Performance
          </h1>
          <p className="text-xs text-gray-600">
            Gestiona tu equipo de ventas y analiza su rendimiento
          </p>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col space-y-3">
          {/* Barra de búsqueda */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, rol o email..."
              value={searchValue}
              onChange={handleSearchChange}
              className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              aria-label="Buscar miembros del equipo"
              aria-describedby="search-description"
            />
            <div id="search-description" className="sr-only">
              Busca miembros del equipo por nombre, rol o dirección de correo electrónico
            </div>
          </div>

          {/* Filtros y botones de acción */}
          <div className="flex flex-col space-y-3">
            {/* Filtros de estado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <Users className="w-3 h-3" />
                  <span>{inactiveMembers} inactivos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleStatusFilter('all')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      filters.status === 'all' || !filters.status
                        ? 'bg-gray-100 text-gray-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="Mostrar todos los miembros"
                    aria-pressed={filters.status === 'all' || !filters.status}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => handleStatusFilter('active')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      filters.status === 'active'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="Mostrar solo miembros activos"
                    aria-pressed={filters.status === 'active'}
                  >
                    Activos
                  </button>
                  <button
                    onClick={() => handleStatusFilter('inactive')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      filters.status === 'inactive'
                        ? 'bg-red-100 text-red-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="Mostrar solo miembros inactivos"
                    aria-pressed={filters.status === 'inactive'}
                  >
                    Inactivos
                  </button>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`flex-1 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 text-xs font-medium ${
                  isRefreshing
                    ? 'bg-blue-400 text-white cursor-not-allowed shadow-inner'
                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md active:bg-blue-700'
                }`}
                aria-label="Actualizar datos del equipo"
                title={isRefreshing ? 'Actualizando datos...' : 'Actualizar lista de agentes'}
              >
                <RefreshCw 
                  className={`h-3 w-3 transition-transform duration-200 ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}`} 
                />
                <span className="transition-opacity duration-200">
                  {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </span>
              </button>
              <button
                onClick={onCreateAgent}
                className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-1 text-xs"
                aria-label="Crear nuevo agente"
              >
                <Plus className="h-3 w-3" />
                <span>Nuevo Agente</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHeader; 