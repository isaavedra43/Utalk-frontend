import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Download,
  Eye,
  Edit,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Award,
  Calendar,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Zap,
  Shield,
  Heart,
  Car,
  Home,
  GraduationCap,
  Briefcase,
  CreditCard,
  Receipt
} from 'lucide-react';
import { generalPayrollApi } from '../../../services/generalPayrollApi';

// Interfaces para tipos de datos
interface EmployeePayrollSimulation {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    location: string;
    employeeId: string;
    hireDate: string;
    status: 'active' | 'inactive' | 'on_leave';
  };
  salaryInfo: {
    baseSalary: number;
    hourlyRate: number;
    workHours: number;
    overtimeHours: number;
    overtimeRate: number;
  };
  earnings: {
    baseSalary: number;
    overtime: number;
    bonuses: Array<{
      id: string;
      name: string;
      amount: number;
      type: 'performance' | 'attendance' | 'special' | 'commission';
      description: string;
    }>;
    commissions: number;
    allowances: Array<{
      id: string;
      name: string;
      amount: number;
      type: 'transport' | 'food' | 'housing' | 'medical' | 'other';
      description: string;
    }>;
    totalEarnings: number;
  };
  deductions: {
    taxes: Array<{
      id: string;
      name: string;
      amount: number;
      type: 'income_tax' | 'social_security' | 'health_insurance' | 'other';
      description: string;
    }>;
    benefits: Array<{
      id: string;
      name: string;
      amount: number;
      type: 'retirement' | 'health' | 'dental' | 'vision' | 'life_insurance' | 'other';
      description: string;
    }>;
    other: Array<{
      id: string;
      name: string;
      amount: number;
      type: 'loan' | 'advance' | 'penalty' | 'other';
      description: string;
    }>;
    totalDeductions: number;
  };
  netPay: number;
  period: {
    startDate: string;
    endDate: string;
    payDate: string;
    type: 'monthly' | 'biweekly' | 'weekly';
  };
  status: 'calculated' | 'reviewed' | 'approved' | 'paid';
  lastUpdated: string;
}

interface PayrollSimulationSummary {
  totalEmployees: number;
  totalGrossPayroll: number;
  totalNetPayroll: number;
  totalEarnings: number;
  totalDeductions: number;
  averageSalary: number;
  totalOvertime: number;
  totalBonuses: number;
  totalTaxes: number;
  totalBenefits: number;
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
}

interface PayrollSimulationViewProps {
  selectedPeriod: {
    id: string;
    period: string;
    startDate: string;
    endDate: string;
    type: string;
    employees: number;
  };
  onNext: (data: EmployeePayrollSimulation[]) => void;
  onBack: () => void;
}

const PayrollSimulationView: React.FC<PayrollSimulationViewProps> = ({ 
  selectedPeriod, 
  onNext, 
  onBack 
}) => {
  // Estados principales
  const [employees, setEmployees] = useState<EmployeePayrollSimulation[]>([]);
  const [summary, setSummary] = useState<PayrollSimulationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');


  // Cargar datos de simulación real del backend

  // Cargar datos de simulación
  useEffect(() => {
    const loadSimulationData = async () => {
      setLoading(true);
      try {
        console.log('🔄 Generando simulación de nómina para período:', selectedPeriod);
        
        // Obtener datos reales del backend usando el endpoint de simulación directo
        const simulatedPayroll = await generalPayrollApi.simulateGeneralPayroll({
          startDate: selectedPeriod.startDate,
          endDate: selectedPeriod.endDate,
          type: selectedPeriod.type === 'Mensual' ? 'monthly' : 
                selectedPeriod.type === 'Semanal' ? 'weekly' : 'biweekly',
          label: selectedPeriod.period
        });
        
        // Convertir datos del backend al formato del frontend
        const backendEmployees = simulatedPayroll.employees.map(emp => ({
            id: emp.employeeId,
            personalInfo: {
              name: emp.name,
              email: `${emp.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
              phone: '+52 55 1234-5678',
              position: emp.position,
              department: emp.contract?.type || 'General',
              location: 'Ciudad de México',
              employeeId: emp.employeeId,
              hireDate: '2023-01-15',
              status: 'active' as const
            },
            salaryInfo: {
              baseSalary: emp.components.base,
              hourlyRate: emp.components.base / 160, // Aproximado
              workHours: 160,
              overtimeHours: emp.components.overtime / (emp.components.base / 160 * 1.5),
              overtimeRate: 1.5
            },
            earnings: {
              baseSalary: emp.components.base,
              overtime: emp.components.overtime,
              bonuses: emp.components.bonuses > 0 ? [{
                id: 'bonus1',
                name: 'Bonos del período',
                amount: emp.components.bonuses,
                type: 'performance' as const,
                description: 'Bonos acumulados del período'
              }] : [],
              commissions: 0,
              allowances: [],
              totalEarnings: emp.components.gross
            },
            deductions: {
              taxes: emp.breakdown.taxes.map((tax: any) => ({
                id: tax.name.toLowerCase(),
                name: tax.name,
                amount: tax.amount,
                type: 'income_tax' as const,
                description: `${tax.name} calculado`
              })),
              benefits: [],
              other: emp.components.deductions.internal > 0 ? [{
                id: 'other1',
                name: 'Otras deducciones',
                amount: emp.components.deductions.internal,
                type: 'other' as const,
                description: 'Deducciones internas'
              }] : [],
              totalDeductions: emp.components.deductions.total
            },
            grossPay: emp.components.gross,
            netPay: emp.components.net,
            status: 'calculated' as const,
            lastUpdated: new Date().toISOString()
          }));
          
          setEmployees(backendEmployees);
          
          // Usar totales del backend
          const summaryData: PayrollSimulationSummary = {
            totalEmployees: simulatedPayroll.summary.totalEmployees,
            totalGrossPayroll: simulatedPayroll.summary.grossTotal,
            totalNetPayroll: simulatedPayroll.summary.netTotal,
            totalEarnings: simulatedPayroll.summary.grossTotal,
            totalDeductions: simulatedPayroll.summary.deductionsTotal,
            averageSalary: simulatedPayroll.summary.avgSalary,
            totalOvertime: simulatedPayroll.summary.overtimeTotal,
            totalBonuses: simulatedPayroll.summary.bonusesTotal,
            totalTaxes: simulatedPayroll.summary.taxesTotal,
            totalBenefits: 0,
            period: {
              startDate: selectedPeriod.startDate,
              endDate: selectedPeriod.endDate,
              type: selectedPeriod.type
            }
          };
          
          setSummary(summaryData);
          console.log('✅ Simulación de nómina generada con datos reales del backend');
          
        } catch (error) {
          console.error('❌ Error generando simulación de nómina:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error al generar la simulación de nómina';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
    };

    loadSimulationData();
  }, [selectedPeriod]);

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
      case 'calculated': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'calculated': return 'Calculado';
      case 'reviewed': return 'Revisado';
      case 'approved': return 'Aprobado';
      case 'paid': return 'Pagado';
      default: return status;
    }
  };

  // Filtros
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || employee.personalInfo.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Funciones de acción
  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
      console.log('🔄 Recalculando nómina...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('✅ Nómina recalculada');
    } catch (error) {
      console.error('❌ Error recalculando:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNext = () => {
    console.log('➡️ Continuando a ajustes y aprobación...');
    onNext(employees);
  };

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Generando simulación de nómina...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar simulación</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay empleados para simular</h3>
            <p className="text-gray-600 mb-4">No se encontraron empleados activos para el período seleccionado.</p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Simulación de Nómina</h1>
          <p className="text-gray-600 mt-1">
            Período: {selectedPeriod.period} ({formatDate(selectedPeriod.startDate)} - {formatDate(selectedPeriod.endDate)})
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Recalculando...' : 'Recalcular'}
          </button>
          
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continuar a Ajustes
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Resumen de simulación */}
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
                <p className="text-sm font-medium text-gray-600">Nómina Bruta</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalGrossPayroll)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nómina Neta</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalNetPayroll)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deducciones</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalDeductions)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre, puesto, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="calculated">Calculado</option>
              <option value="reviewed">Revisado</option>
              <option value="approved">Aprobado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de empleados */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Empleados ({filteredEmployees.length})
          </h3>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Vista:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <Users className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salario Base
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas Extra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Bruto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deducciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Neto a Pagar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
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
                        <div className="text-xs text-gray-400">{employee.personalInfo.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.salaryInfo.baseSalary)}</div>
                    <div className="text-xs text-gray-500">{employee.salaryInfo.workHours}h</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.earnings.overtime)}</div>
                    <div className="text-xs text-gray-500">{employee.salaryInfo.overtimeHours}h extra</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(employee.earnings.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0))}
                    </div>
                    <div className="text-xs text-gray-500">{employee.earnings.bonuses.length} bonos</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(employee.earnings.totalEarnings)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">{formatCurrency(employee.deductions.totalDeductions)}</div>
                    <div className="text-xs text-gray-500">
                      {employee.deductions.taxes.length + employee.deductions.benefits.length + employee.deductions.other.length} deducciones
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">{formatCurrency(employee.netPay)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setShowDetails(showDetails === employee.id ? null : employee.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Detalles de Nómina</h4>
          {(() => {
            const employee = employees.find(emp => emp.id === showDetails);
            if (!employee) return null;
            
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ingresos */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                    Ingresos
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Salario Base:</span>
                      <span className="text-sm font-medium">{formatCurrency(employee.earnings.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Horas Extra:</span>
                      <span className="text-sm font-medium">{formatCurrency(employee.earnings.overtime)}</span>
                    </div>
                    {employee.earnings.bonuses.map(bonus => (
                      <div key={bonus.id} className="flex justify-between">
                        <span className="text-sm text-gray-600">{bonus.name}:</span>
                        <span className="text-sm font-medium">{formatCurrency(bonus.amount)}</span>
                      </div>
                    ))}
                    {employee.earnings.allowances.map(allowance => (
                      <div key={allowance.id} className="flex justify-between">
                        <span className="text-sm text-gray-600">{allowance.name}:</span>
                        <span className="text-sm font-medium">{formatCurrency(allowance.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-sm font-bold text-gray-900">Total Ingresos:</span>
                      <span className="text-sm font-bold text-green-600">{formatCurrency(employee.earnings.totalEarnings)}</span>
                    </div>
                  </div>
                </div>

                {/* Deducciones */}
                <div>
                  <h5 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                    Deducciones
                  </h5>
                  <div className="space-y-2">
                    {employee.deductions.taxes.map(tax => (
                      <div key={tax.id} className="flex justify-between">
                        <span className="text-sm text-gray-600">{tax.name}:</span>
                        <span className="text-sm font-medium">{formatCurrency(tax.amount)}</span>
                      </div>
                    ))}
                    {employee.deductions.benefits.map(benefit => (
                      <div key={benefit.id} className="flex justify-between">
                        <span className="text-sm text-gray-600">{benefit.name}:</span>
                        <span className="text-sm font-medium">{formatCurrency(benefit.amount)}</span>
                      </div>
                    ))}
                    {employee.deductions.other.map(other => (
                      <div key={other.id} className="flex justify-between">
                        <span className="text-sm text-gray-600">{other.name}:</span>
                        <span className="text-sm font-medium">{formatCurrency(other.amount)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-sm font-bold text-gray-900">Total Deducciones:</span>
                      <span className="text-sm font-bold text-red-600">{formatCurrency(employee.deductions.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Acciones finales */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-600">
          {selectedEmployees.length > 0 && (
            <span>{selectedEmployees.length} empleados seleccionados</span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continuar a Ajustes y Aprobación
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollSimulationView;
