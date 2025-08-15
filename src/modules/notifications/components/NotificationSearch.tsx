import React, { useState, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { NotificationFilters } from '../types/notification';

interface NotificationSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: Partial<NotificationFilters>) => void;
  className?: string;
}

export const NotificationSearch: React.FC<NotificationSearchProps> = ({
  searchValue,
  onSearchChange,
  onFiltersChange,
  className = ''
}) => {
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    from: '',
    type: '',
    priority: ''
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleAdvancedFilterChange = useCallback((key: string, value: string) => {
    setAdvancedFilters(prev => ({ ...prev, [key]: value }));
    
    // Aplicar filtros inmediatamente
    const newFilters: Partial<NotificationFilters> = {};
    if (key === 'type' && value) newFilters.type = value as NotificationFilters['type'];
    if (key === 'priority' && value) newFilters.priority = value as NotificationFilters['priority'];
    
    onFiltersChange(newFilters);
  }, [onFiltersChange]);

  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({ from: '', type: '', priority: '' });
    onFiltersChange({ type: 'all', priority: 'all' });
  }, [onFiltersChange]);

  const hasAdvancedFilters = advancedFilters.from || advancedFilters.type || advancedFilters.priority;

  const searchPlaceholder = hasAdvancedFilters 
    ? `Búsqueda con filtros: ${[
        advancedFilters.from && `from:${advancedFilters.from}`,
        advancedFilters.type && `type:${advancedFilters.type}`,
        advancedFilters.priority && `priority:${advancedFilters.priority}`
      ].filter(Boolean).join(', ')}`
    : 'Buscar notificaciones... (from:, type:, priority:)';

  return (
    <div className={`notification-search ${className}`}>
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <Search className="notification-search-icon" />
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="notification-search-input"
        />
        
        {/* Botón de filtros avanzados */}
        <button
          onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors ${
            isAdvancedSearchOpen || hasAdvancedFilters
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title="Filtros avanzados"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Panel de filtros avanzados */}
      {isAdvancedSearchOpen && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Filtros avanzados</h4>
            <button
              onClick={() => setIsAdvancedSearchOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Filtro por remitente */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Remitente
              </label>
              <input
                type="text"
                value={advancedFilters.from}
                onChange={(e) => handleAdvancedFilterChange('from', e.target.value)}
                placeholder="Ej: Ana Martínez"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por tipo */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={advancedFilters.type}
                onChange={(e) => handleAdvancedFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los tipos</option>
                <option value="conversation">Conversación</option>
                <option value="meeting">Reunión</option>
                <option value="sla">SLA</option>
                <option value="churn">Churn</option>
                <option value="system">Sistema</option>
                <option value="alert">Alerta</option>
              </select>
            </div>

            {/* Filtro por prioridad */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                value={advancedFilters.priority}
                onChange={(e) => handleAdvancedFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las prioridades</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={clearAdvancedFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Limpiar filtros
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsAdvancedSearchOpen(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de filtros activos */}
      {hasAdvancedFilters && !isAdvancedSearchOpen && (
        <div className="mt-2 flex flex-wrap gap-1">
          {advancedFilters.from && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              from: {advancedFilters.from}
              <button
                onClick={() => handleAdvancedFilterChange('from', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {advancedFilters.type && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              type: {advancedFilters.type}
              <button
                onClick={() => handleAdvancedFilterChange('type', '')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {advancedFilters.priority && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              priority: {advancedFilters.priority}
              <button
                onClick={() => handleAdvancedFilterChange('priority', '')}
                className="ml-1 text-orange-600 hover:text-orange-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}; 