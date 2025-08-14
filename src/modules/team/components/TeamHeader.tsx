import React, { useState } from 'react';
import type { TeamFilters } from '../../../types/team';

interface TeamHeaderProps {
  filters: TeamFilters;
  onFiltersChange: (filters: Partial<TeamFilters>) => void;
  onRefresh: () => void;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
}

const TeamHeader: React.FC<TeamHeaderProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  inactiveMembers
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onFiltersChange({ search: value });
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive') => {
    onFiltersChange({ status });
  };

    return (
    <div className="w-full">
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
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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

        {/* Filtros y botón actualizar */}
        <div className="flex items-center justify-between">
          {/* Filtros de estado */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
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

          {/* Botón actualizar */}
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1 text-xs"
            aria-label="Actualizar datos del equipo"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamHeader; 