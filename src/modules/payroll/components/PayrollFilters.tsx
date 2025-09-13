// ===================================================================
// COMPONENTE DE FILTROS PARA NÓMINA
// ===================================================================

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { PayrollFilters as PayrollFiltersType } from '../../../types/payroll';

interface PayrollFiltersProps {
  filters: PayrollFiltersType;
  onApplyFilters: (filters: PayrollFiltersType) => void;
  onClearFilters: () => void;
}

const PayrollFilters: React.FC<PayrollFiltersProps> = ({
  filters,
  onApplyFilters,
  onClearFilters
}) => {
  const [localFilters, setLocalFilters] = useState<PayrollFiltersType>(filters);

  // Departamentos disponibles (esto debería venir de una API o contexto)
  const departments = [
    'Administración',
    'Tecnología',
    'Ventas',
    'Marketing',
    'Recursos Humanos',
    'Finanzas',
    'Operaciones',
    'Legal'
  ];

  // Estados de nómina
  const payrollStatuses = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'calculated', label: 'Calculado' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'paid', label: 'Pagado' },
    { value: 'error', label: 'Error' }
  ];

  // Posiciones comunes
  const positions = [
    'Gerente',
    'Coordinador',
    'Analista',
    'Asistente',
    'Desarrollador',
    'Diseñador',
    'Vendedor',
    'Contador',
    'Abogado',
    'Especialista'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value || undefined
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const hasActiveFilters = Object.values(localFilters).some(value => value && value.trim() !== '');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar todo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda por nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar empleado
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              value={localFilters.search || ''}
              onChange={handleInputChange}
              placeholder="Nombre o número..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Departamento
          </label>
          <select
            name="department"
            value={localFilters.department || ''}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Todos los departamentos</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="status"
            value={localFilters.status || ''}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Todos los estados</option>
            {payrollStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Posición */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Posición
          </label>
          <select
            name="position"
            value={localFilters.position || ''}
            onChange={handleInputChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Todas las posiciones</option>
            {positions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleClear}
          disabled={!hasActiveFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Limpiar
        </button>
        
        <button
          onClick={handleApply}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Aplicar Filtros
        </button>
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Filtros activos:</span>
            
            {localFilters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Búsqueda: "{localFilters.search}"
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, search: undefined }))}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {localFilters.department && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Depto: {localFilters.department}
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, department: undefined }))}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {localFilters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Estado: {payrollStatuses.find(s => s.value === localFilters.status)?.label}
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, status: undefined }))}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {localFilters.position && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Posición: {localFilters.position}
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, position: undefined }))}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollFilters;
