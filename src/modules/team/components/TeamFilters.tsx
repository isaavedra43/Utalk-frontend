import React, { useState } from 'react';
import type { TeamFilters } from '../../../types/team';

interface TeamFiltersProps {
  filters: TeamFilters;
  onFiltersChange: (filters: Partial<TeamFilters>) => void;
}

const TeamFilters: React.FC<TeamFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleFilter = (role: string) => {
    onFiltersChange({ role: role === 'all' ? undefined : role });
  };

  const handlePermissionFilter = (permission: string) => {
    const currentPermissions = filters.permissions || [];
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    onFiltersChange({ permissions: newPermissions.length > 0 ? newPermissions : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: undefined,
      status: 'all',
      role: undefined,
      permissions: undefined
    });
  };

  const roles = [
    { id: 'all', name: 'Todos los roles' },
    { id: 'executive', name: 'Ejecutivo' },
    { id: 'supervisor', name: 'Supervisor' },
    { id: 'manager', name: 'Manager' },
    { id: 'agent', name: 'Agente' }
  ];

  const permissions = [
    { id: 'read', name: 'Lectura' },
    { id: 'write', name: 'Escritura' },
    { id: 'approve', name: 'Aprobación' },
    { id: 'configure', name: 'Configuración' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div 
        className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            <span className="font-medium text-gray-900">Filtros Avanzados</span>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Contenido */}
      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Filtro por rol */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Rol</h4>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleFilter(role.id)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    filters.role === role.id || (!filters.role && role.id === 'all')
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro por permisos */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Permisos</h4>
            <div className="grid grid-cols-2 gap-2">
              {permissions.map((permission) => (
                <button
                  key={permission.id}
                  onClick={() => handlePermissionFilter(permission.id)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    filters.permissions?.includes(permission.id)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {permission.name}
                </button>
              ))}
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamFilters; 