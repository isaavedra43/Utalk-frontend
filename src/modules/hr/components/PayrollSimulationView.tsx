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

  // Datos mock para simulación
  const mockEmployees: EmployeePayrollSimulation[] = [
    {
      id: '1',
      personalInfo: {
        name: 'Ana García López',
        email: 'ana.garcia@empresa.com',
        phone: '+52 55 1234 5678',
        position: 'Desarrolladora Senior',
        department: 'Tecnología',
        location: 'Ciudad de México',
        employeeId: 'EMP001',
        hireDate: '2022-03-15',
        status: 'active'
      },
      salaryInfo: {
        baseSalary: 45000,
        hourlyRate: 250,
        workHours: 160,
        overtimeHours: 12,
        overtimeRate: 375
      },
      earnings: {
        baseSalary: 45000,
        overtime: 4500,
        bonuses: [
          {
            id: 'bonus1',
            name: 'Bono de Rendimiento',
            amount: 3000,
            type: 'performance',
            description: 'Bono por excelente rendimiento en el proyecto Q1'
          },
          {
            id: 'bonus2',
            name: 'Bono de Asistencia',
            amount: 1000,
            type: 'attendance',
            description: 'Bono por asistencia perfecta'
          }
        ],
        commissions: 0,
        allowances: [
          {
            id: 'allowance1',
            name: 'Vale de Despensa',
            amount: 2000,
            type: 'food',
            description: 'Vale de despensa mensual'
          },
          {
            id: 'allowance2',
            name: 'Transporte',
            amount: 1500,
            type: 'transport',
            description: 'Apoyo para transporte'
          }
        ],
        totalEarnings: 55500
      },
      deductions: {
        taxes: [
          {
            id: 'tax1',
            name: 'ISR',
            amount: 8500,
            type: 'income_tax',
            description: 'Impuesto Sobre la Renta'
          },
          {
            id: 'tax2',
            name: 'IMSS',
            amount: 1200,
            type: 'social_security',
            description: 'Cuota obrero-patronal IMSS'
          }
        ],
        benefits: [
          {
            id: 'benefit1',
            name: 'Afore',
            amount: 1100,
            type: 'retirement',
            description: 'Aportación voluntaria Afore'
          },
          {
            id: 'benefit2',
            name: 'Seguro de Vida',
            amount: 500,
            type: 'life_insurance',
            description: 'Seguro de vida empresarial'
          }
        ],
        other: [],
        totalDeductions: 11300
      },
      netPay: 44200,
      period: {
        startDate: selectedPeriod.startDate,
        endDate: selectedPeriod.endDate,
        payDate: '2024-02-05',
        type: selectedPeriod.type.toLowerCase() as 'monthly' | 'biweekly' | 'weekly'
      },
      status: 'calculated',
      lastUpdated: new Date().toISOString()
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
        employeeId: 'EMP002',
        hireDate: '2021-08-20',
        status: 'active'
      },
      salaryInfo: {
        baseSalary: 55000,
        hourlyRate: 300,
        workHours: 160,
        overtimeHours: 8,
        overtimeRate: 450
      },
      earnings: {
        baseSalary: 55000,
        overtime: 3600,
        bonuses: [
          {
            id: 'bonus3',
            name: 'Bono de Ventas',
            amount: 8000,
            type: 'commission',
            description: 'Bono por superar metas de ventas'
          }
        ],
        commissions: 5000,
        allowances: [
          {
            id: 'allowance3',
            name: 'Vale de Despensa',
            amount: 2000,
            type: 'food',
            description: 'Vale de despensa mensual'
          },
          {
            id: 'allowance4',
            name: 'Gasolina',
            amount: 3000,
            type: 'transport',
            description: 'Apoyo para gasolina'
          }
        ],
        totalEarnings: 73600
      },
      deductions: {
        taxes: [
          {
            id: 'tax3',
            name: 'ISR',
            amount: 12000,
            type: 'income_tax',
            description: 'Impuesto Sobre la Renta'
          },
          {
            id: 'tax4',
            name: 'IMSS',
            amount: 1500,
            type: 'social_security',
            description: 'Cuota obrero-patronal IMSS'
          }
        ],
        benefits: [
          {
            id: 'benefit3',
            name: 'Afore',
            amount: 1400,
            type: 'retirement',
            description: 'Aportación voluntaria Afore'
          }
        ],
        other: [],
        totalDeductions: 14900
      },
      netPay: 58700,
      period: {
        startDate: selectedPeriod.startDate,
        endDate: selectedPeriod.endDate,
        payDate: '2024-02-05',
        type: selectedPeriod.type.toLowerCase() as 'monthly' | 'biweekly' | 'weekly'
      },
      status: 'calculated',
      lastUpdated: new Date().toISOString()
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
        employeeId: 'EMP003',
        hireDate: '2023-01-10',
        status: 'active'
      },
      salaryInfo: {
        baseSalary: 35000,
        hourlyRate: 200,
        workHours: 160,
        overtimeHours: 5,
        overtimeRate: 300
      },
      earnings: {
        baseSalary: 35000,
        overtime: 1500,
        bonuses: [
          {
            id: 'bonus4',
            name: 'Bono de Proyecto',
            amount: 2000,
            type: 'special',
            description: 'Bono por proyecto de implementación'
          }
        ],
        commissions: 0,
        allowances: [
          {
            id: 'allowance5',
            name: 'Vale de Despensa',
            amount: 1500,
            type: 'food',
            description: 'Vale de despensa mensual'
          }
        ],
        totalEarnings: 40000
      },
      deductions: {
        taxes: [
          {
            id: 'tax5',
            name: 'ISR',
            amount: 6000,
            type: 'income_tax',
            description: 'Impuesto Sobre la Renta'
          },
          {
            id: 'tax6',
            name: 'IMSS',
            amount: 900,
            type: 'social_security',
            description: 'Cuota obrero-patronal IMSS'
          }
        ],
        benefits: [
          {
            id: 'benefit4',
            name: 'Afore',
            amount: 800,
            type: 'retirement',
            description: 'Aportación voluntaria Afore'
          }
        ],
        other: [],
        totalDeductions: 7700
      },
      netPay: 32300,
      period: {
        startDate: selectedPeriod.startDate,
        endDate: selectedPeriod.endDate,
        payDate: '2024-02-05',
        type: selectedPeriod.type.toLowerCase() as 'monthly' | 'biweekly' | 'weekly'
      },
      status: 'calculated',
      lastUpdated: new Date().toISOString()
    }
  ];

  // Cargar datos de simulación
  useEffect(() => {
    const loadSimulationData = async () => {
      setLoading(true);
      try {
        console.log('🔄 Generando simulación de nómina para período:', selectedPeriod);
        
        // Simular cálculo de nómina
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setEmployees(mockEmployees);
        
        // Calcular resumen
        const summaryData: PayrollSimulationSummary = {
          totalEmployees: mockEmployees.length,
          totalGrossPayroll: mockEmployees.reduce((sum, emp) => sum + emp.earnings.totalEarnings, 0),
          totalNetPayroll: mockEmployees.reduce((sum, emp) => sum + emp.netPay, 0),
          totalEarnings: mockEmployees.reduce((sum, emp) => sum + emp.earnings.totalEarnings, 0),
          totalDeductions: mockEmployees.reduce((sum, emp) => sum + emp.deductions.totalDeductions, 0),
          averageSalary: mockEmployees.reduce((sum, emp) => sum + emp.earnings.totalEarnings, 0) / mockEmployees.length,
          totalOvertime: mockEmployees.reduce((sum, emp) => sum + emp.earnings.overtime, 0),
          totalBonuses: mockEmployees.reduce((sum, emp) => sum + emp.earnings.bonuses.reduce((bSum, bonus) => bSum + bonus.amount, 0), 0),
          totalTaxes: mockEmployees.reduce((sum, emp) => sum + emp.deductions.taxes.reduce((tSum, tax) => tSum + tax.amount, 0), 0),
          totalBenefits: mockEmployees.reduce((sum, emp) => sum + emp.deductions.benefits.reduce((bSum, benefit) => bSum + benefit.amount, 0), 0),
          period: {
            startDate: selectedPeriod.startDate,
            endDate: selectedPeriod.endDate,
            type: selectedPeriod.type
          }
        };
        
        setSummary(summaryData);
        console.log('✅ Simulación de nómina generada exitosamente');
        
      } catch (error) {
        console.error('❌ Error generando simulación:', error);
        setError('Error al generar la simulación de nómina');
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
