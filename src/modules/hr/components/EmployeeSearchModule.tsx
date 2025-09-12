import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Users, TrendingUp, Building, Award } from 'lucide-react';
import { Employee, EmployeeSearchResponse, EmployeeStatsResponse } from '../../../types/employee';
import employeeService from '../../../services/employeeService';
import { useHRPermissions } from '../../../hooks/useHRPermissions';

interface EmployeeSearchModuleProps {
  onEmployeeSelect?: (employee: Employee) => void;
}

export const EmployeeSearchModule: React.FC<EmployeeSearchModuleProps> = ({ onEmployeeSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { hasPermission, isHRAdmin, isHRManager } = useHRPermissions();

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    if (hasPermission('canRead')) {
      loadStats();
    }
  }, [hasPermission]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      
      const response = await employeeService.searchEmployees(query, 20);
      
      if (response.success && response.data) {
        setSearchResults(response.data.employees);
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error en la búsqueda');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleEmployeeClick = (employee: Employee) => {
    if (onEmployeeSelect) {
      onEmployeeSelect(employee);
    }
  };

  const formatEmployeeName = (employee: Employee) => {
    return `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Tecnología': 'bg-blue-100 text-blue-800',
      'Diseño': 'bg-purple-100 text-purple-800',
      'Ventas': 'bg-green-100 text-green-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Atención al Cliente': 'bg-yellow-100 text-yellow-800',
      'Recursos Humanos': 'bg-indigo-100 text-indigo-800',
      'Finanzas': 'bg-red-100 text-red-800',
      'Operaciones': 'bg-gray-100 text-gray-800'
    };
    
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'Junior': 'bg-green-100 text-green-800',
      'Mid': 'bg-blue-100 text-blue-800',
      'Senior': 'bg-purple-100 text-purple-800',
      'Lead': 'bg-orange-100 text-orange-800',
      'Manager': 'bg-red-100 text-red-800'
    };
    
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!hasPermission('canRead')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes permisos para ver empleados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-search-module">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Búsqueda de Empleados</h2>
        <p className="text-gray-600">Encuentra empleados rápidamente y accede a su información</p>
      </div>

      {/* Stats Cards */}
      {stats && (isHRAdmin || isHRManager) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.summary.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.summary.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departamentos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.byDepartment).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Licencia</p>
                <p className="text-2xl font-bold text-orange-600">{stats.summary.on_leave}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar empleados por nombre, email, departamento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Resultados de Búsqueda
              {searchResults.length > 0 && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  ({searchResults.length} encontrados)
                </span>
              )}
            </h3>
          </div>

          {searchResults.length === 0 && !isSearching ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'No se encontraron empleados' : 'Escribe para buscar empleados'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {searchResults.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleEmployeeClick(employee)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {employee.personalInfo.avatar ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={employee.personalInfo.avatar}
                            alt={formatEmployeeName(employee)}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatEmployeeName(employee)}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {employee.status === 'active' ? 'Activo' : 
                             employee.status === 'inactive' ? 'Inactivo' :
                             employee.status === 'on_leave' ? 'En Licencia' : 
                             'Terminado'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-gray-600">{employee.personalInfo.email}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getDepartmentColor(employee.position.department)}`}>
                            {employee.position.department}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getLevelColor(employee.position.level)}`}>
                            {employee.position.level}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          {employee.position.title} • {employee.employeeNumber}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Inicio: {new Date(employee.position.startDate).toLocaleDateString('es-MX')}
                      </p>
                      {hasPermission('canViewPayroll', employee.id) && (
                        <p className="text-sm font-medium text-gray-900">
                          ${employee.contract.salary.toLocaleString('es-MX')} {employee.contract.currency}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Department Stats */}
      {stats && (isHRAdmin || isHRManager) && !searchQuery && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Empleados por Departamento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byDepartment).map(([department, count]) => (
              <div key={department} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{department}</p>
                    <p className="text-xl font-bold text-gray-900">{count} empleados</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / stats.summary.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((count / stats.summary.total) * 100)}% del total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level Stats */}
      {stats && (isHRAdmin || isHRManager) && !searchQuery && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Empleados por Nivel</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(stats.byLevel).map(([level, count]) => (
              <div key={level} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-center">
                  <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">{level}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">
                    {Math.round((count / stats.summary.total) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!searchQuery && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setSearchQuery('Tecnología')}
              className="p-4 text-left bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ver Tecnología</p>
                  <p className="text-sm text-gray-600">Empleados del área técnica</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSearchQuery('Manager')}
              className="p-4 text-left bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ver Managers</p>
                  <p className="text-sm text-gray-600">Personal de liderazgo</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSearchQuery('Junior')}
              className="p-4 text-left bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ver Juniors</p>
                  <p className="text-sm text-gray-600">Empleados nivel inicial</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
