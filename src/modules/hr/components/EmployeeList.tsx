import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  FileText,
  Clock,
  RefreshCw,
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
import * as XLSX from 'xlsx';
import { AddEmployeeModal } from './AddEmployeeModal';
import { ImportEmployeesModal } from './ImportEmployeesModal';
import EditEmployeeModal from './EditEmployeeModal';
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

  // Función para cargar empleados desde la API - MEMOIZADA para evitar llamadas duplicadas
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando empleados...', {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        department: filters.department,
        status: filters.status
      });

      const response = await employeesApi.getEmployees({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        department: filters.department || undefined,
        status: filters.status || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      console.log('📊 Respuesta del API:', response);

      // Manejar respuesta vacía correctamente
      if (response && response.employees) {
        console.log('✅ Empleados encontrados:', response.employees.length);
        console.log('📋 Datos de empleados:', response.employees);
        setEmployees(response.employees);
        setPagination(response.pagination);
        setSummary(response.summary);
      } else {
        console.log('⚠️ No hay empleados en la respuesta');
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
      console.error('❌ Error loading employees:', err);
      setError('Error al cargar los empleados. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, filters.department, filters.status]);

  // Debounce para evitar llamadas excesivas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEmployees();
    }, 300); // 300ms de debounce

    return () => clearTimeout(timeoutId);
  }, [pagination.page, pagination.limit, searchQuery, filters.department, filters.status]);

  // Función para refrescar datos y limpiar cache
  const handleRefresh = useCallback(() => {
    employeesApi.clearCache();
    loadEmployees();
  }, [loadEmployees]);

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
      // Solo cerrar el modal si no hay errores
      setIsAddModalOpen(false);
      loadEmployees(); // Recargar la lista
    } catch (error) {
      console.error('Error al agregar empleado:', error);
      // Re-lanzar el error para que el modal lo maneje
      throw error;
    }
  };

  // Función para manejar la importación de empleados
  const handleImportEmployees = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar tipo de archivo
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
        'application/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Formato de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)');
      }
      
      // Validar tamaño del archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. El tamaño máximo permitido es 10MB');
      }
      
      console.log('📤 Iniciando importación de empleados...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      const options = {
        updateExisting: true,
        skipErrors: false,
        validateData: true
      };
      
      const result = await employeesApi.importEmployees(file, options);
      
      console.log('✅ Importación completada:', result);
      
      // Mostrar resultado de la importación
      if (result.success) {
        console.log(`✅ Importación exitosa: ${result.imported} empleados importados, ${result.updated} actualizados`);
        
        if (result.errors && result.errors.length > 0) {
          console.warn('⚠️ Errores encontrados durante la importación:', result.errors);
        }
        
        setIsImportModalOpen(false);
        loadEmployees(); // Recargar la lista
        
        // Mostrar mensaje de éxito
        alert(`Importación exitosa!\n\n- Empleados importados: ${result.imported}\n- Empleados actualizados: ${result.updated}\n- Errores: ${result.errors?.length || 0}`);
      } else {
        throw new Error(result.message || 'Error durante la importación');
      }
    } catch (error) {
      console.error('❌ Error al importar empleados:', error);
      setError(error instanceof Error ? error.message : 'Error al importar empleados. Por favor, verifica el formato del archivo.');
    } finally {
      setLoading(false);
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
      setLoading(true);
      
      if (format === 'excel') {
        // Generar Excel real desde el frontend
        await generateExcelFile();
      } else {
        // Para CSV y PDF, usar el backend
        const blob = await employeesApi.exportEmployees({
          format: format,
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
      }
      
      console.log(`✅ Archivo exportado exitosamente: empleados_plantilla.${format === 'excel' ? 'xlsx' : format}`);
    } catch (error) {
      console.error('Error al exportar empleados:', error);
      setError('Error al exportar empleados. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar archivo Excel real
  const generateExcelFile = async () => {
    try {
      console.log('📊 Generando archivo Excel real...');
      
      // Crear datos de la plantilla con todas las columnas necesarias
      const plantillaData = [
        {
          'Número de Empleado': 'EMP001',
          'Nombre': 'Juan',
          'Apellido': 'Pérez',
          'Email': 'juan.perez@empresa.com',
          'Teléfono': '+52 55 1234 5678',
          'Fecha de Nacimiento': '1990-01-15',
          'Género': 'M',
          'Estado Civil': 'Soltero',
          'Nacionalidad': 'Mexicana',
          'RFC': 'PEPJ900115ABC',
          'CURP': 'PEPJ900115HDFRRN01',
          'Calle': 'Av. Reforma 123',
          'Ciudad': 'Ciudad de México',
          'Estado': 'CDMX',
          'País': 'México',
          'Código Postal': '06600',
          'Puesto': 'Desarrollador',
          'Departamento': 'Tecnología',
          'Nivel': 'Senior',
          'Supervisor': 'María García',
          'Descripción del Puesto': 'Desarrollo de aplicaciones web',
          'Fecha de Inicio': '2023-01-15',
          'Fecha de Fin': '',
          'Oficina': 'Oficina Central',
          'Dirección de Oficina': 'Av. Insurgentes 456',
          'Ciudad de Oficina': 'Ciudad de México',
          'Estado de Oficina': 'CDMX',
          'País de Oficina': 'México',
          'Código Postal de Oficina': '06700',
          'Zona Horaria': 'America/Mexico_City',
          'Tipo de Contrato': 'Permanente',
          'Fecha de Inicio de Contrato': '2023-01-15',
          'Fecha de Fin de Contrato': '',
          'Salario': '50000',
          'Moneda': 'MXN',
          'Días Laborales': 'Lunes a Viernes',
          'Horario de Trabajo': '09:00-18:00',
          'Beneficios': 'Seguro médico, vales de despensa',
          'Notas del Contrato': 'Contrato por tiempo indefinido',
          'Estado del Empleado': 'Activo',
          'Fecha de Creación': '2023-01-15',
          'Fecha de Actualización': '2023-01-15'
        }
      ];

      // Crear hoja de trabajo
      const ws = XLSX.utils.json_to_sheet(plantillaData);
      
      // Configurar ancho de columnas
      const colWidths = [
        { wch: 20 }, // Número de Empleado
        { wch: 15 }, // Nombre
        { wch: 15 }, // Apellido
        { wch: 25 }, // Email
        { wch: 18 }, // Teléfono
        { wch: 18 }, // Fecha de Nacimiento
        { wch: 8 },  // Género
        { wch: 12 }, // Estado Civil
        { wch: 12 }, // Nacionalidad
        { wch: 15 }, // RFC
        { wch: 18 }, // CURP
        { wch: 20 }, // Calle
        { wch: 15 }, // Ciudad
        { wch: 10 }, // Estado
        { wch: 10 }, // País
        { wch: 12 }, // Código Postal
        { wch: 20 }, // Puesto
        { wch: 15 }, // Departamento
        { wch: 10 }, // Nivel
        { wch: 20 }, // Supervisor
        { wch: 30 }, // Descripción del Puesto
        { wch: 15 }, // Fecha de Inicio
        { wch: 15 }, // Fecha de Fin
        { wch: 20 }, // Oficina
        { wch: 25 }, // Dirección de Oficina
        { wch: 15 }, // Ciudad de Oficina
        { wch: 10 }, // Estado de Oficina
        { wch: 10 }, // País de Oficina
        { wch: 12 }, // Código Postal de Oficina
        { wch: 20 }, // Zona Horaria
        { wch: 15 }, // Tipo de Contrato
        { wch: 20 }, // Fecha de Inicio de Contrato
        { wch: 20 }, // Fecha de Fin de Contrato
        { wch: 12 }, // Salario
        { wch: 8 },  // Moneda
        { wch: 15 }, // Días Laborales
        { wch: 15 }, // Horario de Trabajo
        { wch: 30 }, // Beneficios
        { wch: 30 }, // Notas del Contrato
        { wch: 15 }, // Estado del Empleado
        { wch: 15 }, // Fecha de Creación
        { wch: 15 }  // Fecha de Actualización
      ];
      
      ws['!cols'] = colWidths;

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Empleados');

      // Generar archivo Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Crear blob y descargar
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'empleados_plantilla.xlsx';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Archivo Excel generado exitosamente desde el frontend');
    } catch (error) {
      console.error('❌ Error generando archivo Excel:', error);
      throw error;
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
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refrescar datos"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refrescar</span>
            </button>
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
                  {(() => {
                    console.log('🎨 Renderizando empleados:', {
                      employeesLength: employees.length,
                      employees: employees,
                      loading: loading,
                      error: error
                    });
                    return employees.length === 0;
                  })() ? (
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
