import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  User,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  TrendingUp,
  Shield,
  Upload,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { AddEmployeeModal } from './AddEmployeeModal';
import { ImportEmployeesModal } from './ImportEmployeesModal';
import { EditEmployeeModal } from './EditEmployeeModal';
import { employeesApi, type Employee, type GetEmployeesResponse } from '../../../services/employeesApi';

interface EmployeeListProps {
  onSelectEmployee: (employee: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ onSelectEmployee }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  
  // Estados para los modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);

  // Estados para los datos de la API
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    expired: 0
  });

  // Función para cargar empleados desde la API
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getEmployees({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        department: filters.department || undefined,
        status: filters.status || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      // Manejar respuesta vacía correctamente
      if (response && response.employees) {
        setEmployees(response.employees);
        setPagination(response.pagination);
        setSummary(response.summary);
      } else {
        // Si no hay respuesta o employees es null/undefined, establecer arrays vacíos
        setEmployees([]);
        setPagination({
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        });
        setSummary({
          total: 0,
          active: 0,
          inactive: 0,
          pending: 0,
          expired: 0
        });
      }
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Error al cargar los empleados. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar empleados al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadEmployees();
  }, [pagination.page, pagination.limit]);

  // Función para buscar empleados con debounce
  const handleSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (query: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearchQuery(query);
        setPagination(prev => ({ ...prev, page: 1 }));
        loadEmployees();
      }, 300);
    };
  }, []);

  // Función para manejar el cambio de filtros
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    loadEmployees();
  };

  // Función para manejar la adición de empleados
  const handleAddEmployee = async (employeeData: Partial<Employee>) => {
    try {
      await employeesApi.createEmployee(employeeData);
      setIsAddModalOpen(false);
      loadEmployees(); // Recargar la lista
    } catch (error) {
      console.error('Error al agregar empleado:', error);
    }
  };

  // Función para manejar la importación de empleados
  const handleImportEmployees = async (file: File) => {
    try {
      const options = {
        updateExisting: true,
        skipErrors: false,
        validateData: true
      };
      
      await employeesApi.importEmployees(file, options);
      setIsImportModalOpen(false);
      loadEmployees(); // Recargar la lista
    } catch (error) {
      console.error('Error al importar empleados:', error);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployeeForEdit(employee);
    setIsEditModalOpen(true);
  };

  const handleSaveEmployee = async (updatedEmployee: Employee) => {
    try {
      await employeesApi.updateEmployee(updatedEmployee.id, updatedEmployee);
      setIsEditModalOpen(false);
      setSelectedEmployeeForEdit(null);
      loadEmployees(); // Recargar la lista
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
    }
  };

  // Función para exportar empleados
  const handleExportEmployees = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const blob = await employeesApi.exportEmployees({
        format,
        filters,
        fields: ['personalInfo', 'position', 'location', 'contract', 'status']
      });

      // Crear URL para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `empleados.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar empleados:', error);
    }
  };

  // Función para cambiar página
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Función para obtener las iniciales del empleado
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'terminated':
        return 'Terminado';
      case 'on_leave':
        return 'En Licencia';
      default:
        return 'Desconocido';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar empleados</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadEmployees}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título de la vista */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
            <p className="text-gray-600 mt-1">
              Gestiona y administra la información de todos los empleados de la empresa
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                {summary.active} activos
              </span>
              <span className="flex items-center text-sm text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                {summary.pending} pendientes
              </span>
              <span className="flex items-center text-sm text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                {summary.expired} vencidos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y controles */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empleados..."
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ ...filters, status: e.target.value || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="terminated">Terminados</option>
              <option value="on_leave">En Licencia</option>
            </select>

            <select
              value={filters.department || ''}
              onChange={(e) => handleFilterChange({ ...filters, department: e.target.value || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los departamentos</option>
              <option value="Marketing">Marketing</option>
              <option value="Ventas">Ventas</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Finanzas">Finanzas</option>
              <option value="Operaciones">Operaciones</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleExportEmployees('excel')}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Importar</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Empleado</span>
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Cargando empleados...
            </div>
          ) : (
            `${pagination.total} empleados encontrados`
          )}
        </div>
      </div>

      {/* Lista de empleados */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span className="text-gray-600">Cargando empleados...</span>
          </div>
        </div>
      ) : employees.length > 0 ? (
        <>
          {/* Vista de tabla */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees(employees.map(emp => emp.id));
                          } else {
                            setSelectedEmployees([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sueldo Base
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SBC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Ingreso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Vacaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Incidencias 30d
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cumplimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay empleados</h3>
                            <p className="text-sm text-gray-500">
                              {searchQuery ? 'No se encontraron empleados que coincidan con tu búsqueda' : 'Aún no hay empleados registrados en el sistema'}
                            </p>
                          </div>
                          {!searchQuery && (
                            <button
                              onClick={() => setIsAddModalOpen(true)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Agregar primer empleado
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees([...selectedEmployees, employee.id]);
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(id => id !== employee.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {employee.personalInfo.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={employee.personalInfo.avatar}
                                alt={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                {getInitials(employee.personalInfo.firstName, employee.personalInfo.lastName)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.position.title} • {employee.position.department}
                            </div>
                            <div className="text-xs text-gray-400">
                              {employee.employeeNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                          {getStatusText(employee.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${employee.contract.salary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${employee.contract.salary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(employee.contract.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        15 días
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          0
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">100%</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onSelectEmployee(employee)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditEmployee(employee)}
                            className="text-gray-600 hover:text-gray-900" 
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900" title="Documentos">
                            <FileText className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900" title="Más opciones">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg border border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
                    a{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{pagination.total}</span>{' '}
                    empleados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay empleados</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.keys(filters).length > 0
                ? 'No se encontraron empleados que coincidan con los criterios de búsqueda.'
                : 'Aún no hay empleados registrados en el sistema.'}
            </p>
            {!searchQuery && Object.keys(filters).length === 0 && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar primer empleado
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modales */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddEmployee}
      />

      <ImportEmployeesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportEmployees}
      />

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployeeForEdit(null);
        }}
        employee={selectedEmployeeForEdit}
        onSave={handleSaveEmployee}
      />
    </div>
  );
};
