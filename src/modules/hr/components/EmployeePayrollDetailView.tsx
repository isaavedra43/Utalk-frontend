import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  Share2, 
  Filter, 
  Search, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  FileText,
  Eye,
  Edit,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Star,
  Award,
  Target,
  BarChart3,
  PieChart,
  Settings,
  RefreshCw,
  Plus,
  Minus,
  X,
  Receipt,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';

// Interfaces para tipos de datos
interface PayrollAdjustment {
  id: string;
  type: 'increment' | 'decrement';
  name: string;
  amount: number;
  description: string;
  reason: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

interface EmployeePayrollDetail {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    location: string;
    avatar?: string;
    status: 'active' | 'inactive' | 'on_leave';
  };
  payrollInfo: {
    baseSalary: number;
    grossSalary: number;
    netSalary: number;
    overtime: number;
    bonuses: number;
    deductions: number;
    taxes: number;
    benefits: number;
    currency: string;
  };
  adjustments: {
    increments: PayrollAdjustment[];
    decrements: PayrollAdjustment[];
  };
  period: {
    startDate: string;
    endDate: string;
    type: 'monthly' | 'biweekly' | 'weekly';
    status: 'paid' | 'pending' | 'processing' | 'cancelled';
  };
  performance: {
    rating: number;
    attendance: number;
    productivity: number;
  };
  lastUpdated: string;
}

interface PayrollSummary {
  totalEmployees: number;
  totalGrossPayroll: number;
  totalNetPayroll: number;
  averageSalary: number;
  totalOvertime: number;
  totalBonuses: number;
  totalDeductions: number;
  totalTaxes: number;
}

const EmployeePayrollDetailView: React.FC = () => {
  // Estados principales
  const [employees, setEmployees] = useState<EmployeePayrollDetail[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [salaryRange, setSalaryRange] = useState<{min: number, max: number}>({min: 0, max: 100000});
  
  // Estados de UI
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof EmployeePayrollDetail>('personalInfo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para modales de incrementos y decrementos
  const [showIncrementsModal, setShowIncrementsModal] = useState(false);
  const [showDecrementsModal, setShowDecrementsModal] = useState(false);
  const [selectedEmployeeForAdjustments, setSelectedEmployeeForAdjustments] = useState<EmployeePayrollDetail | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Datos mock para desarrollo
  const mockEmployees: EmployeePayrollDetail[] = [
    {
      id: '1',
      personalInfo: {
        name: 'Ana García López',
        email: 'ana.garcia@empresa.com',
        phone: '+52 55 1234 5678',
        position: 'Desarrolladora Senior',
        department: 'Tecnología',
        location: 'Ciudad de México',
        status: 'active'
      },
      payrollInfo: {
        baseSalary: 45000,
        grossSalary: 52000,
        netSalary: 41600,
        overtime: 3000,
        bonuses: 4000,
        deductions: 8400,
        taxes: 2000,
        benefits: 5000,
        currency: 'MXN'
      },
      adjustments: {
        increments: [
          {
            id: 'inc1',
            type: 'increment',
            name: 'Bono de Proyecto Especial',
            amount: 2000,
            description: 'Bono por completar proyecto crítico antes del plazo',
            reason: 'Proyecto completado exitosamente',
            approved: true,
            approvedBy: 'Gerente de Proyecto',
            approvedAt: '2024-01-25T14:00:00Z',
            createdAt: '2024-01-25T10:00:00Z'
          },
          {
            id: 'inc2',
            type: 'increment',
            name: 'Horas Extra',
            amount: 3000,
            description: 'Horas extra trabajadas en el proyecto',
            reason: 'Trabajo adicional requerido',
            approved: true,
            approvedBy: 'Supervisor',
            approvedAt: '2024-01-28T16:00:00Z',
            createdAt: '2024-01-28T12:00:00Z'
          }
        ],
        decrements: [
          {
            id: 'dec1',
            type: 'decrement',
            name: 'Préstamo Personal',
            amount: 1500,
            description: 'Deducción por préstamo personal autorizado',
            reason: 'Préstamo autorizado por RH',
            approved: true,
            approvedBy: 'RH Manager',
            approvedAt: '2024-01-20T09:00:00Z',
            createdAt: '2024-01-20T09:00:00Z'
          }
        ]
      },
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: 'monthly',
        status: 'paid'
      },
      performance: {
        rating: 4.8,
        attendance: 98,
        productivity: 95
      },
      lastUpdated: '2024-01-31T10:30:00Z'
    },
    {
      id: '2',
      personalInfo: {
        name: 'Carlos Mendoza Ruiz',
        email: 'carlos.mendoza@empresa.com',
        phone: '+52 55 2345 6789',
        position: 'Gerente de Ventas',
        department: 'Ventas',
        location: 'Guadalajara',
        status: 'active'
      },
      payrollInfo: {
        baseSalary: 55000,
        grossSalary: 62000,
        netSalary: 49600,
        overtime: 2000,
        bonuses: 5000,
        deductions: 12400,
        taxes: 0,
        benefits: 6000,
        currency: 'MXN'
      },
      adjustments: {
        increments: [
          {
            id: 'inc3',
            type: 'increment',
            name: 'Bono de Ventas Excepcionales',
            amount: 5000,
            description: 'Bono por superar metas de ventas en 150%',
            reason: 'Excelente desempeño en ventas del mes',
            approved: true,
            approvedBy: 'Director de Ventas',
            approvedAt: '2024-01-30T15:00:00Z',
            createdAt: '2024-01-30T11:00:00Z'
          }
        ],
        decrements: [
          {
            id: 'dec2',
            type: 'decrement',
            name: 'Falta de Asistencia',
            amount: 800,
            description: 'Deducción por falta de asistencia',
            reason: 'Falta justificada pero con deducción',
            approved: true,
            approvedBy: 'Supervisor',
            approvedAt: '2024-01-15T10:00:00Z',
            createdAt: '2024-01-15T10:00:00Z'
          }
        ]
      },
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: 'monthly',
        status: 'paid'
      },
      performance: {
        rating: 4.5,
        attendance: 100,
        productivity: 88
      },
      lastUpdated: '2024-01-31T10:30:00Z'
    },
    {
      id: '3',
      personalInfo: {
        name: 'María Elena Torres',
        email: 'maria.torres@empresa.com',
        phone: '+52 55 3456 7890',
        position: 'Analista de Recursos Humanos',
        department: 'Recursos Humanos',
        location: 'Monterrey',
        status: 'active'
      },
      payrollInfo: {
        baseSalary: 35000,
        grossSalary: 38000,
        netSalary: 30400,
        overtime: 1000,
        bonuses: 2000,
        deductions: 7600,
        taxes: 0,
        benefits: 3000,
        currency: 'MXN'
      },
      adjustments: {
        increments: [],
        decrements: []
      },
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        type: 'monthly',
        status: 'paid'
      },
      performance: {
        rating: 4.2,
        attendance: 96,
        productivity: 92
      },
      lastUpdated: '2024-01-31T10:30:00Z'
    }
  ];

  // Cargar datos mock
  useEffect(() => {
    const loadMockData = async () => {
      setLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setEmployees(mockEmployees);
        
        // Calcular resumen
        const summaryData: PayrollSummary = {
          totalEmployees: mockEmployees.length,
          totalGrossPayroll: mockEmployees.reduce((sum, emp) => sum + emp.payrollInfo.grossSalary, 0),
          totalNetPayroll: mockEmployees.reduce((sum, emp) => sum + emp.payrollInfo.netSalary, 0),
          averageSalary: mockEmployees.reduce((sum, emp) => sum + emp.payrollInfo.grossSalary, 0) / mockEmployees.length,
          totalOvertime: mockEmployees.reduce((sum, emp) => sum + emp.payrollInfo.overtime, 0),
          totalBonuses: mockEmployees.reduce((sum, emp) => sum + emp.payrollInfo.bonuses, 0),
          totalDeductions: mockEmployees.reduce((sum, emp) => sum + emp.payrollInfo.deductions, 0),
          totalTaxes: mockEmployees.reduce((sum, emp) => sum + emp.payrollInfo.taxes, 0)
        };
        
        setSummary(summaryData);
      } catch (error) {
        setError('Error al cargar los datos de nómina');
      } finally {
        setLoading(false);
      }
    };

    loadMockData();
  }, []);

  // Funciones de utilidad
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Filtros y búsqueda
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = searchTerm === '' || 
        employee.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.personalInfo.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || employee.period.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || employee.personalInfo.department === departmentFilter;
      const matchesSalary = employee.payrollInfo.grossSalary >= salaryRange.min && employee.payrollInfo.grossSalary <= salaryRange.max;
      
      return matchesSearch && matchesStatus && matchesDepartment && matchesSalary;
    });
  }, [employees, searchTerm, statusFilter, departmentFilter, salaryRange]);

  // Ordenamiento
  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortField === 'personalInfo') {
        aValue = a.personalInfo.name;
        bValue = b.personalInfo.name;
      } else if (sortField === 'payrollInfo') {
        aValue = a.payrollInfo.grossSalary;
        bValue = b.payrollInfo.grossSalary;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredEmployees, sortField, sortDirection]);

  // Paginación
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);

  // Funciones de acción
  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === paginatedEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(paginatedEmployees.map(emp => emp.id));
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      console.log(`Exportando en formato ${format}...`);
      // Aquí iría la lógica de exportación
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const handleShare = async () => {
    try {
      console.log('Compartiendo lista de empleados...');
      // Aquí iría la lógica de compartir
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  // Función para ver el recibo del empleado
  const handleViewReceipt = (employee: EmployeePayrollDetail) => {
    try {
      console.log('Ver recibo de:', employee.personalInfo.name);
      // Simular apertura del recibo
      const receiptUrl = `/receipts/${employee.id}_${employee.period.startDate}.pdf`;
      window.open(receiptUrl, '_blank');
    } catch (error) {
      console.error('Error al abrir recibo:', error);
      alert('No se pudo abrir el recibo del empleado');
    }
  };

  // Función para ver el detalle de nómina del empleado
  const handleViewPayrollDetail = (employee: EmployeePayrollDetail) => {
    try {
      console.log('Ver detalle de nómina de:', employee.personalInfo.name);
      // Aquí se abriría un modal o navegaría a la vista de detalle
      alert(`Abriendo detalle de nómina para ${employee.personalInfo.name}`);
    } catch (error) {
      console.error('Error al abrir detalle:', error);
      alert('No se pudo abrir el detalle de nómina');
    }
  };

  // Función para ver incrementos del empleado
  const handleViewIncrements = (employee: EmployeePayrollDetail) => {
    setSelectedEmployeeForAdjustments(employee);
    setShowIncrementsModal(true);
  };

  // Función para ver decrementos del empleado
  const handleViewDecrements = (employee: EmployeePayrollDetail) => {
    setSelectedEmployeeForAdjustments(employee);
    setShowDecrementsModal(true);
  };

  // Función para cerrar modales
  const handleCloseModals = () => {
    setShowIncrementsModal(false);
    setShowDecrementsModal(false);
    setSelectedEmployeeForAdjustments(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de nómina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header con título y acciones */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalle de Nómina General</h1>
          <p className="text-gray-600 mt-1">Gestión completa de nómina de empleados</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </button>
          
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              <Users className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={() => handleShare()}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </button>
          
          <div className="relative">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden">
              <button
                onClick={() => handleExport('excel')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Excel (.xlsx)
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                PDF
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de métricas */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalEmployees}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nómina Bruta Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalGrossPayroll)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nómina Neta Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalNetPayroll)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Salario Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.averageSalary)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre, email, puesto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="paid">Pagado</option>
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los departamentos</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Ventas">Ventas</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Marketing">Marketing</option>
                <option value="Finanzas">Finanzas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Salario</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={salaryRange.min}
                  onChange={(e) => setSalaryRange(prev => ({...prev, min: Number(e.target.value)}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={salaryRange.max}
                  onChange={(e) => setSalaryRange(prev => ({...prev, max: Number(e.target.value)}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de empleados */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Empleados ({filteredEmployees.length})
          </h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            {selectedEmployees.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedEmployees.length} seleccionados</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Acciones masivas</button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === paginatedEmployees.length && paginatedEmployees.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salario Bruto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salario Neto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rendimiento
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incrementos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Decrementos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleSelectEmployee(employee.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.personalInfo.name}</div>
                        <div className="text-sm text-gray-500">{employee.personalInfo.position}</div>
                        <div className="text-xs text-gray-400">{employee.personalInfo.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.personalInfo.department}</div>
                    <div className="text-xs text-gray-500">{employee.personalInfo.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.payrollInfo.grossSalary)}</div>
                    <div className="text-xs text-gray-500">
                      Base: {formatCurrency(employee.payrollInfo.baseSalary)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.payrollInfo.netSalary)}</div>
                    <div className="text-xs text-gray-500">
                      Deducciones: {formatCurrency(employee.payrollInfo.deductions)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.period.status)}`}>
                      {getStatusText(employee.period.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{employee.performance.rating}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {employee.performance.attendance}% asistencia
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        <ArrowUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {employee.adjustments.increments.length}
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewIncrements(employee)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                        title="Ver detalles de incrementos"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        <ArrowDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">
                          {employee.adjustments.decrements.length}
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewDecrements(employee)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                        title="Ver detalles de decrementos"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewReceipt(employee)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver recibo de nómina"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleViewPayrollDetail(employee)}
                        className="text-green-600 hover:text-green-900"
                        title="Ver detalle de nómina"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, sortedEmployees.length)} de {sortedEmployees.length} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded text-sm ${
                    page === currentPage 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Modal para ver incrementos */}
      {showIncrementsModal && selectedEmployeeForAdjustments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Incrementos de Nómina</h3>
                <p className="text-gray-600 mt-1">
                  {selectedEmployeeForAdjustments.personalInfo.name} - {selectedEmployeeForAdjustments.personalInfo.position}
                </p>
              </div>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedEmployeeForAdjustments.adjustments.increments.length > 0 ? (
                selectedEmployeeForAdjustments.adjustments.increments.map((increment) => (
                  <div key={increment.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-green-800">{increment.name}</h4>
                        <p className="text-sm text-green-700">{increment.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">
                          +{formatCurrency(increment.amount)}
                        </span>
                        <div className="flex items-center mt-1">
                          {increment.approved ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                          )}
                          <span className={`text-xs ${increment.approved ? 'text-green-600' : 'text-yellow-600'}`}>
                            {increment.approved ? 'Aprobado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-green-600 space-y-1">
                      <p><strong>Razón:</strong> {increment.reason}</p>
                      {increment.approvedBy && (
                        <p><strong>Aprobado por:</strong> {increment.approvedBy}</p>
                      )}
                      {increment.approvedAt && (
                        <p><strong>Fecha de aprobación:</strong> {formatDate(increment.approvedAt)}</p>
                      )}
                      <p><strong>Creado:</strong> {formatDate(increment.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ArrowUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay incrementos registrados para este empleado</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 pt-6 border-t">
              <button
                onClick={handleCloseModals}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver decrementos */}
      {showDecrementsModal && selectedEmployeeForAdjustments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Decrementos de Nómina</h3>
                <p className="text-gray-600 mt-1">
                  {selectedEmployeeForAdjustments.personalInfo.name} - {selectedEmployeeForAdjustments.personalInfo.position}
                </p>
              </div>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedEmployeeForAdjustments.adjustments.decrements.length > 0 ? (
                selectedEmployeeForAdjustments.adjustments.decrements.map((decrement) => (
                  <div key={decrement.id} className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-red-800">{decrement.name}</h4>
                        <p className="text-sm text-red-700">{decrement.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-red-600">
                          -{formatCurrency(decrement.amount)}
                        </span>
                        <div className="flex items-center mt-1">
                          {decrement.approved ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                          )}
                          <span className={`text-xs ${decrement.approved ? 'text-green-600' : 'text-yellow-600'}`}>
                            {decrement.approved ? 'Aprobado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-red-600 space-y-1">
                      <p><strong>Razón:</strong> {decrement.reason}</p>
                      {decrement.approvedBy && (
                        <p><strong>Aprobado por:</strong> {decrement.approvedBy}</p>
                      )}
                      {decrement.approvedAt && (
                        <p><strong>Fecha de aprobación:</strong> {formatDate(decrement.approvedAt)}</p>
                      )}
                      <p><strong>Creado:</strong> {formatDate(decrement.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ArrowDown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay decrementos registrados para este empleado</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6 pt-6 border-t">
              <button
                onClick={handleCloseModals}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayrollDetailView;
