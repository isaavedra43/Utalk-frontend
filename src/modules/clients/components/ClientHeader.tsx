import React from 'react';
import { Search, Filter, Download, RefreshCw, Grid3X3, List, MapPin, X } from 'lucide-react';
// import { ClientSearch } from './ClientSearch'; // ❌ TEMPORALMENTE DESHABILITADO

interface ClientHeaderProps {
  searchValue: string;
  onSearch: (searchTerm: string) => void;
  onToggleFilters: () => void;
  onExport: () => void;
  onViewChange: (view: 'list' | 'kanban' | 'cards') => void;
  currentView: 'list' | 'kanban' | 'cards';
  hasFilters: boolean;
  filtersCount: number;
  onRefresh: () => void;
  loading: boolean;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  searchValue,
  onSearch,
  onToggleFilters,
  onExport,
  onViewChange,
  currentView,
  hasFilters,
  filtersCount,
  onRefresh,
  loading,
}) => {

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Lado izquierdo - Título y búsqueda */}
        <div className="flex items-center space-x-6 flex-1">
          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Hub
          </h1>

          {/* Barra de búsqueda - TEMPORALMENTE SIMPLIFICADA */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar clientes, empresas..."
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors bg-white"
              />
              {searchValue && (
                <button
                  onClick={() => onSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lado derecho - Botones de acción */}
        <div className="flex items-center space-x-3">
          {/* Botón de filtros */}
          <button
            onClick={onToggleFilters}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              hasFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            {hasFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {filtersCount}
              </span>
            )}
          </button>

          {/* Botón de exportar */}
          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>

          {/* Botones de vista */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewChange('list')}
              className={`p-2 transition-colors ${
                currentView === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Vista de lista"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewChange('kanban')}
              className={`p-2 transition-colors ${
                currentView === 'kanban'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Vista Kanban"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewChange('cards')}
              className={`p-2 transition-colors ${
                currentView === 'cards'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Vista de tarjetas"
            >
              <MapPin className="h-4 w-4" />
            </button>
          </div>

          {/* Botón de refrescar */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 rounded-lg border border-gray-300 transition-colors ${
              loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            title="Refrescar datos"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasFilters && (
        <div className="mt-3 flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Filtros activos:
          </span>
          <div className="flex flex-wrap gap-2">
            {filtersCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filtersCount} filtro{filtersCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 