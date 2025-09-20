import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  Play,
  Pause,
  BarChart3,
  PieChart,
  FileText,
  Calendar,
  Building,
  Star,
  Award,
  Target,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';

// Interfaces para tipos de datos
interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: 'monthly' | 'biweekly' | 'weekly';
  status: 'open' | 'processing' | 'simulated' | 'adjusted' | 'approved' | 'closed';
}

interface EmployeeSimulation {
  id: string;
  personalInfo: {
    name: string;
    position: string;
    department: string;
    employeeId: string;
    hireDate: string;
  };
  payrollData: {
    baseSalary: number;
    hoursWorked: number;
    overtimeHours: number;
    overtimeRate: number;
    bonuses: Array<{
      type: string;
      amount: number;
      reason: string;
    }>;
    deductions: Array<{
      type: string;
      amount: number;
      reason: string;
    }>;
    benefits: Array<{
      type: string;
      amount: number;
      description: string;
    }>;
  };
  calculatedPayroll: {
    grossSalary: number;
    overtimePay: number;
    totalBonuses: number;
    totalDeductions: number;
    totalBenefits: number;
    taxableIncome: number;
    taxes: number;
    netSalary: number;
  };
  performance: {
    attendance: number;
    productivity: number;
    rating: number;
  };
  simulationStatus: 'pending' | 'calculated' | 'error';
  lastCalculated: string;
}

interface SimulationSummary {
  totalEmployees: number;
  totalGrossPayroll: number;
  totalNetPayroll: number;
  totalOvertime: number;
  totalBonuses: number;
  totalDeductions: number;
  totalTaxes: number;
  averageSalary: number;
  processingTime: number;
  errors: number;
  warnings: number;
}

interface PayrollSimulationViewProps {
  selectedPeriod: PayrollPeriod;
  onNext: (simulationData: EmployeeSimulation[]) => void;
  onBack: () => void;
}

const PayrollSimulationView: React.FC<PayrollSimulationViewProps> = ({ 
  selectedPeriod, 
  onNext, 
  onBack 
}) => {
  // Estados principales
  const [employees, setEmployees] = useState<EmployeeSimulation[]>([]);
  const [summary, setSummary] = useState<SimulationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'summary'>('summary');

  // Datos mock para simulación
  const mockEmployees: EmployeeSimulation[] = [
    {
      id: '1',
      personalInfo: {
        name: 'Ana García López',
        position: 'Desarrolladora Senior',
        department: 'Tecnología',
        employeeId: 'EMP001',
        hireDate: '2022-03-15'
      },
      payrollData: {
        baseSalary: 45000,
        hoursWorked: 160,
        overtimeHours: 8,
        overtimeRate: 1.5,
        bonuses: [
          { type: 'Rendimiento', amount: 3000, reason: 'Cumplimiento de objetivos Q1' },
          { type: 'Proyecto', amount: 2000, reason: 'Entrega exitosa del proyecto Alpha' }
        ],
        deductions: [
          { type: 'ISR', amount: 4500, reason: 'Impuesto sobre la renta' },
          { type: 'IMSS', amount: 1800, reason: 'Seguro social' },
          { type: 'Fonacot', amount: 1200, reason: 'Préstamo personal' }
        ],
        benefits: [
          { type: 'Vales de despensa', amount: 2000, reason: 'Beneficio mensual' },
          { type: 'Seguro de gastos médicos', amount: 1500, reason: 'Cobertura familiar' }
        ]
      },
      calculatedPayroll: {
        grossSalary: 45000,
        overtimePay: 3375,
        totalBonuses: 5000,
        totalDeductions: 7500,
        totalBenefits: 3500,
        taxableIncome: 53375,
        taxes: 5337.5,
        netSalary: 45837.5
      },
      performance: {
        attendance: 98,
        productivity: 95,
        rating: 4.8
      },
      simulationStatus: 'calculated',
      lastCalculated: '2024-01-31T10:30:00Z'
    },
    {
      id: '2',
      personalInfo: {
        name: 'Carlos Mendoza Ruiz',
        position: 'Gerente de Ventas',
        department: 'Ventas',
        employeeId: 'EMP002',
        hireDate: '2021-08-20'
      },
      payrollData: {
        baseSalary: 55000,
        hoursWorked: 160,
        overtimeHours: 4,
        overtimeRate: 1.5,
        bonuses: [
          { type: 'Comisión', amount: 8000, reason: 'Ventas del mes' },
          { type: 'Meta', amount: 3000, reason: 'Cumplimiento de meta mensual' }
        ],
        deductions: [
          { type: 'ISR', amount: 5500, reason: 'Impuesto sobre la renta' },
          { type: 'IMSS', amount: 2200, reason: 'Seguro social' }
        ],
        benefits: [
          { type: 'Vales de despensa', amount: 2000, reason: 'Beneficio mensual' },
          { type: 'Auto de empresa', amount: 3000, reason: 'Uso de vehículo' }
        ]
      },
      calculatedPayroll: {
        grossSalary: 55000,
        overtimePay: 2062.5,
        totalBonuses: 11000,
        totalDeductions: 7700,
        totalBenefits: 5000,
        taxableIncome: 68062.5,
        taxes: 6806.25,
        netSalary: 61256.25
      },
      performance: {
        attendance: 100,
        productivity: 88,
        rating: 4.5
      },
      simulationStatus: 'calculated',
      lastCalculated: '2024-01-31T10:30:00Z'
    },
    {
      id: '3',
      personalInfo: {
        name: 'María Elena Torres',
        position: 'Analista de Recursos Humanos',
        department: 'Recursos Humanos',
        employeeId: 'EMP003',
        hireDate: '2023-01-10'
      },
      payrollData: {
        baseSalary: 35000,
        hoursWorked: 160,
        overtimeHours: 2,
        overtimeRate: 1.5,
        bonuses: [
          { type: 'Reconocimiento', amount: 1500, reason: 'Excelente trabajo en reclutamiento' }
        ],
        deductions: [
          { type: 'ISR', amount: 3500, reason: 'Impuesto sobre la renta' },
          { type: 'IMSS', amount: 1400, reason: 'Seguro social' }
        ],
        benefits: [
          { type: 'Vales de despensa', amount: 2000, reason: 'Beneficio mensual' }
        ]
      },
      calculatedPayroll: {
        grossSalary: 35000,
        overtimePay: 656.25,
        totalBonuses: 1500,
        totalDeductions: 4900,
        totalBenefits: 2000,
        taxableIncome: 37156.25,
        taxes: 3715.63,
        netSalary: 33440.62
      },
      performance: {
        attendance: 96,
        productivity: 92,
        rating: 4.2
      },
      simulationStatus: 'calculated',
      lastCalculated: '2024-01-31T10:30:00Z'
    }
  ];

  // Cargar datos mock
  useEffect(() => {
    const loadSimulationData = async () => {
      setLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setEmployees(mockEmployees);
        
        // Calcular resumen
        const summaryData: SimulationSummary = {
          totalEmployees: mockEmployees.length,
          totalGrossPayroll: mockEmployees.reduce((sum, emp) => sum + emp.calculatedPayroll.grossSalary, 0),
          totalNetPayroll: mockEmployees.reduce((sum, emp) => sum + emp.calculatedPayroll.netSalary, 0),
          totalOvertime: mockEmployees.reduce((sum, emp) => sum + emp.calculatedPayroll.overtimePay, 0),
          totalBonuses: mockEmployees.reduce((sum, emp) => sum + emp.calculatedPayroll.totalBonuses, 0),
          totalDeductions: mockEmployees.reduce((sum, emp) => sum + emp.calculatedPayroll.totalDeductions, 0),
          totalTaxes: mockEmployees.reduce((sum, emp) => sum + emp.calculatedPayroll.taxes, 0),
          averageSalary: mockEmployees.reduce((sum, emp) => sum + emp.calculatedPayroll.grossSalary, 0) / mockEmployees.length,
          processingTime: 2.3,
          errors: 0,
          warnings: 1
        };
        
        setSummary(summaryData);
      } catch (error) {
        setError('Error al cargar los datos de simulación');
      } finally {
        setLoading(false);
      }
    };

    loadSimulationData();
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

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      // Simular proceso de cálculo
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Simulación completada');
    } catch (error) {
      setError('Error durante la simulación');
    } finally {
      setSimulating(false);
    }
  };

  const handleNext = () => {
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
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de simulación...</p>
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
            Período: {selectedPeriod.name} ({formatDate(selectedPeriod.startDate)} - {formatDate(selectedPeriod.endDate)})
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'summary' : 'table')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {viewMode === 'summary' ? <BarChart3 className="h-4 w-4 mr-2" /> : <PieChart className="h-4 w-4 mr-2" />}
            {viewMode === 'summary' ? 'Vista Resumen' : 'Vista Detalle'}
          </button>
          
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {simulating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Simulando...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Recalcular
              </>
            )}
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
                <DollarSign className="h-6 w-6 text-green-600" />
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
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo de Proceso</p>
                <p className="text-2xl font-bold text-gray-900">{summary.processingTime}s</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detalles de la simulación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desglose de costos */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose de Costos</h3>
          
          {summary && (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Salarios Base</span>
                <span className="font-medium">{formatCurrency(summary.totalGrossPayroll)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Horas Extra</span>
                <span className="font-medium text-blue-600">{formatCurrency(summary.totalOvertime)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Bonos</span>
                <span className="font-medium text-green-600">{formatCurrency(summary.totalBonuses)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Deducciones</span>
                <span className="font-medium text-red-600">-{formatCurrency(summary.totalDeductions)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Impuestos</span>
                <span className="font-medium text-red-600">-{formatCurrency(summary.totalTaxes)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t-2 border-gray-200 pt-2">
                <span className="text-lg font-semibold text-gray-900">Total Neto</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(summary.totalNetPayroll)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Estado de la simulación */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Simulación</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Cálculos completados</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Validaciones pasadas</span>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600">{summary?.warnings} advertencias</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Listo para ajustes</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                La simulación se completó exitosamente. Puedes proceder a la fase de ajustes.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de empleados */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Detalle por Empleado ({employees.length})
            </h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedEmployees.length === employees.length && employees.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Seleccionar todos</span>
            </div>
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
                    Deducciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Neto
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
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => handleSelectEmployee(employee.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.personalInfo.name}</div>
                          <div className="text-sm text-gray-500">{employee.personalInfo.position}</div>
                          <div className="text-xs text-gray-400">{employee.personalInfo.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(employee.calculatedPayroll.grossSalary)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(employee.calculatedPayroll.overtimePay)}</div>
                      <div className="text-xs text-gray-500">{employee.payrollData.overtimeHours}h</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(employee.calculatedPayroll.totalBonuses)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(employee.calculatedPayroll.totalDeductions)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.calculatedPayroll.netSalary)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Calculado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
          Volver
        </button>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Exportar Simulación
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continuar a Ajustes
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollSimulationView;
