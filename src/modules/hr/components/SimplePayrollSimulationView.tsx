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
  ArrowLeft, 
  ArrowRight,
  BarChart3,
  PieChart,
  Target,
  Award,
  Calendar,
  Building,
  User,
  Star,
  Zap,
  Shield,
  Heart,
  Car,
  Home,
  GraduationCap,
  Briefcase,
  CreditCard,
  Receipt,
  Eye,
  Edit,
  Download,
  RefreshCw,
  Play,
  Pause,
  Stop,
  Settings,
  Wrench,
  Tool,
  Hammer,
  Cog,
  Gear,
  Lock,
  Unlock,
  Key,
  Database,
  HardDrive,
  Save,
  Upload,
  Printer,
  Share2,
  Bell,
  Mail,
  MessageSquare,
  ExternalLink,
  Link,
  Info,
  AlertTriangle,
  X,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  XCircle
} from 'lucide-react';
import { generalPayrollApi } from '../../../services/generalPayrollApi';

// Interfaces para tipos de datos
interface SimpleEmployeePayroll {
  id: string;
  name: string;
  position: string;
  department: string;
  employeeId: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  allowances: number;
  totalEarnings: number;
  taxes: number;
  benefits: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  status: 'calculated' | 'reviewed' | 'approved';
}

interface SimplePayrollSummary {
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
}

interface SimplePayrollSimulationViewProps {
  selectedPeriod: {
    id: string;
    period: string;
    startDate: string;
    endDate: string;
    type: string;
    employees: number;
  };
  onNext: (data: SimpleEmployeePayroll[]) => void;
  onBack: () => void;
}

const SimplePayrollSimulationView: React.FC<SimplePayrollSimulationViewProps> = ({ 
  selectedPeriod, 
  onNext, 
  onBack 
}) => {
  // Estados principales
  const [employees, setEmployees] = useState<SimpleEmployeePayroll[]>([]);
  const [summary, setSummary] = useState<SimplePayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Datos mock para simulación simple
  const mockEmployees: SimpleEmployeePayroll[] = [
    {
      id: '1',
      name: 'Ana García López',
      position: 'Desarrolladora Senior',
      department: 'Tecnología',
      employeeId: 'EMP001',
      baseSalary: 45000,
      overtime: 4500,
      bonuses: 4000,
      allowances: 3500,
      totalEarnings: 55500,
      taxes: 9700,
      benefits: 1600,
      otherDeductions: 0,
      totalDeductions: 11300,
      netPay: 44200,
      status: 'calculated'
    },
    {
      id: '2',
      name: 'Carlos Mendoza Ruiz',
      position: 'Gerente de Ventas',
      department: 'Ventas',
      employeeId: 'EMP002',
      baseSalary: 55000,
      overtime: 3600,
      bonuses: 8000,
      allowances: 5000,
      totalEarnings: 71600,
      taxes: 13500,
      benefits: 1400,
      otherDeductions: 0,
      totalDeductions: 14900,
      netPay: 56700,
      status: 'calculated'
    },
    {
      id: '3',
      name: 'María Elena Torres',
      position: 'Analista de Recursos Humanos',
      department: 'Recursos Humanos',
      employeeId: 'EMP003',
      baseSalary: 35000,
      overtime: 1500,
      bonuses: 2000,
      allowances: 1500,
      totalEarnings: 40000,
      taxes: 6900,
      benefits: 800,
      otherDeductions: 0,
      totalDeductions: 7700,
      netPay: 32300,
      status: 'calculated'
    },
    {
      id: '4',
      name: 'Roberto Silva Martínez',
      position: 'Diseñador UX/UI',
      department: 'Tecnología',
      employeeId: 'EMP004',
      baseSalary: 40000,
      overtime: 2000,
      bonuses: 3000,
      allowances: 2000,
      totalEarnings: 47000,
      taxes: 8500,
      benefits: 1200,
      otherDeductions: 0,
      totalDeductions: 9700,
      netPay: 37300,
      status: 'calculated'
    },
    {
      id: '5',
      name: 'Laura González Pérez',
      position: 'Contadora',
      department: 'Finanzas',
      employeeId: 'EMP005',
      baseSalary: 42000,
      overtime: 1000,
      bonuses: 2500,
      allowances: 1800,
      totalEarnings: 47300,
      taxes: 8900,
      benefits: 1100,
      otherDeductions: 0,
      totalDeductions: 10000,
      netPay: 37300,
      status: 'calculated'
    }
  ];

  // Simular cálculo de nómina con progreso
  useEffect(() => {
    const simulateCalculation = async () => {
      setLoading(true);
      setIsCalculating(true);
      setProgress(0);
      
      try {
        console.log('🔄 Iniciando simulación de nómina...');
        
        // Simular progreso paso a paso
        const steps = [
          'Obteniendo datos de empleados...',
          'Calculando salarios base...',
          'Procesando horas extra...',
          'Aplicando bonos y prestaciones...',
          'Calculando deducciones...',
          'Generando nómina final...',
          'Validando cálculos...',
          'Finalizando simulación...'
        ];
        
        for (let i = 0; i < steps.length; i++) {
          console.log(`📊 ${steps[i]}`);
          setProgress(((i + 1) / steps.length) * 100);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        setEmployees(mockEmployees);
        
        // Calcular resumen
        const summaryData: SimplePayrollSummary = {
          totalEmployees: mockEmployees.length,
          totalGrossPayroll: mockEmployees.reduce((sum, emp) => sum + emp.totalEarnings, 0),
          totalNetPayroll: mockEmployees.reduce((sum, emp) => sum + emp.netPay, 0),
          totalEarnings: mockEmployees.reduce((sum, emp) => sum + emp.totalEarnings, 0),
          totalDeductions: mockEmployees.reduce((sum, emp) => sum + emp.totalDeductions, 0),
          averageSalary: mockEmployees.reduce((sum, emp) => sum + emp.totalEarnings, 0) / mockEmployees.length,
          totalOvertime: mockEmployees.reduce((sum, emp) => sum + emp.overtime, 0),
          totalBonuses: mockEmployees.reduce((sum, emp) => sum + emp.bonuses, 0),
          totalTaxes: mockEmployees.reduce((sum, emp) => sum + emp.taxes, 0),
          totalBenefits: mockEmployees.reduce((sum, emp) => sum + emp.benefits, 0)
        };
        
        setSummary(summaryData);
        console.log('✅ Simulación de nómina completada exitosamente');
        
      } catch (error) {
        console.error('❌ Error en simulación:', error);
        setError('Error al generar la simulación de nómina');
      } finally {
        setLoading(false);
        setIsCalculating(false);
      }
    };

    simulateCalculation();
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'calculated': return 'Calculado';
      case 'reviewed': return 'Revisado';
      case 'approved': return 'Aprobado';
      default: return status;
    }
  };

  // Funciones de acción
  const handleRecalculate = async () => {
    setIsCalculating(true);
    setProgress(0);
    try {
      console.log('🔄 Recalculando nómina...');
      
      // Simular recálculo rápido
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
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

  if (loading || isCalculating) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isCalculating ? 'Calculando Nómina...' : 'Cargando Simulación...'}
              </h3>
              <p className="text-gray-600 mb-4">
                Procesando datos para el período: {selectedPeriod.period}
              </p>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-500">
              {Math.round(progress)}% completado
            </p>
            
            {isCalculating && (
              <div className="mt-4 text-xs text-gray-400">
                <p>• Obteniendo datos de empleados</p>
                <p>• Calculando salarios y deducciones</p>
                <p>• Generando nómina final</p>
              </div>
            )}
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
            Recalcular
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

      {/* Detalles adicionales */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Salario Promedio</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.averageSalary)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Horas Extra</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalOvertime)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bonos</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalBonuses)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impuestos</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalTaxes)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de empleados */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Resumen de Nómina por Empleado
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.position}</div>
                        <div className="text-xs text-gray-400">{employee.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.baseSalary)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.overtime)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.bonuses)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(employee.totalEarnings)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">{formatCurrency(employee.totalDeductions)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">{formatCurrency(employee.netPay)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones finales */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-600">
          Simulación completada para {employees.length} empleados
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

export default SimplePayrollSimulationView;
