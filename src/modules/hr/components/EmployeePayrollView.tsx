import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  Receipt,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Share2,
  MoreHorizontal,
  Plus,
  Settings,
  Calendar,
  X
} from 'lucide-react';
import PayrollChart from './PayrollChart';
import { employeesApi, type PayrollPeriod } from '../../../services/employeesApi';

interface PayrollDetail {
  type: 'perception' | 'deduction';
  concept: string;
  amount: number;
  description: string;
}

interface EmployeePayrollData {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  baseSalary: number;
  currency: string;
  paymentFrequency: 'weekly' | 'biweekly' | 'monthly';
  currentPeriod: PayrollPeriod;
  periods: PayrollPeriod[];
  summary: {
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    averageNet: number;
    periodsCount: number;
  };
}

interface EmployeePayrollViewProps {
  employeeId: string;
  employee: any; // Agregamos el empleado como prop
  onBack: () => void;
}

const EmployeePayrollView: React.FC<EmployeePayrollViewProps> = ({ 
  employeeId, 
  employee,
  onBack 
}) => {
  const [payrollData, setPayrollData] = useState<EmployeePayrollData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [periodDetails, setPeriodDetails] = useState<PayrollDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPayPeriodModalOpen, setIsPayPeriodModalOpen] = useState(false);
  const [payPeriodConfig, setPayPeriodConfig] = useState<{
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'hourly';
    startDate: string;
    endDate: string;
    label: string;
    calculatedSalary: number;
    totalDeductions: number;
    totalToPay: number;
  }>({
    frequency: 'monthly',
    startDate: '',
    endDate: '',
    label: 'Mensual',
    calculatedSalary: 0,
    totalDeductions: 0,
    totalToPay: 0
  });

  // Función para calcular salario según frecuencia
  const calculateSalaryByFrequency = (baseSalary: number, frequency: string): number => {
    switch (frequency) {
      case 'daily':
        return baseSalary / 30; // Asumiendo 30 días por mes
      case 'weekly':
        return baseSalary / 4; // 4 semanas por mes
      case 'biweekly':
        return baseSalary / 2; // 2 quincenas por mes
      case 'monthly':
        return baseSalary;
      case 'hourly':
        return baseSalary / 160; // Asumiendo 160 horas por mes (8h x 20 días)
      default:
        return baseSalary;
    }
  };

  // Función para obtener etiquetas de frecuencia
  const getFrequencyLabel = (frequency: string): string => {
    switch (frequency) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'biweekly': return 'Quincenal';
      case 'monthly': return 'Mensual';
      case 'hourly': return 'Por Hora';
      default: return 'Mensual';
    }
  };

  // Función para calcular fechas según frecuencia
  const calculateDatesByFrequency = (frequency: string, baseDate?: Date) => {
    const today = baseDate || new Date();
    let startDate: Date;
    let endDate: Date;

    switch (frequency) {
      case 'daily':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'weekly':
        const dayOfWeek = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek + 1); // Lunes
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Domingo
        break;
      case 'biweekly':
        const dayOfMonth = today.getDate();
        if (dayOfMonth <= 15) {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 15);
        } else {
          startDate = new Date(today.getFullYear(), today.getMonth(), 16);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }
        break;
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'hourly':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Función para manejar cambio de frecuencia de pago
  const handleFrequencyChange = async (frequency: string) => {
    if (!employee?.contract?.salary) return;

    const dates = calculateDatesByFrequency(frequency);
    const calculatedSalary = calculateSalaryByFrequency(employee.contract.salary, frequency);
    
    // Aquí deberías llamar a la API para obtener las deducciones del período
    // Por ahora usamos datos mock
    const totalDeductions = 1750; // Esto vendría de los extras del período
    const totalToPay = calculatedSalary - totalDeductions;

    setPayPeriodConfig({
      frequency: frequency as any,
      startDate: dates.startDate,
      endDate: dates.endDate,
      label: getFrequencyLabel(frequency),
      calculatedSalary,
      totalDeductions,
      totalToPay
    });
  };

  // Cargar datos de nómina desde la API
  useEffect(() => {
    const loadPayrollData = async () => {
      try {
        setLoading(true);
        
        // Por ahora usar datos mock directamente para mostrar la estructura
        // TODO: Implementar llamada real a la API
        // const response = await employeesApi.getEmployeePayroll(employeeId, {
        //   year: new Date().getFullYear()
        // });
        
        // Simular delay de carga
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Usar datos reales del empleado
        const employeeName = employee ? `${employee.personalInfo?.firstName || ''} ${employee.personalInfo?.lastName || ''}`.trim() : 'Empleado';
        const baseSalary = employee?.contract?.salary || employee?.salary?.baseSalary || 0;
        
        const mockPayrollData: EmployeePayrollData = {
      employeeId: employeeId,
      employeeName: employeeName,
      position: employee?.position?.title || 'Sin Puesto',
      department: employee?.position?.department || 'Sin Departamento',
      baseSalary: baseSalary,
      currency: 'MXN',
      paymentFrequency: 'monthly',
      currentPeriod: {
        id: 'PER202401',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        weekNumber: 1,
        year: 2024,
        grossSalary: 25000,
        deductions: 3750,
        netSalary: 21250,
        status: 'paid',
        paymentDate: '2024-02-05',
        pdfUrl: '/receipts/EMP241001_PER202401.pdf'
      },
      periods: [
        {
          id: 'PER202401',
          periodStart: '2024-01-01',
          periodEnd: '2024-01-31',
          weekNumber: 1,
          year: 2024,
          grossSalary: 25000,
          deductions: 3750,
          netSalary: 21250,
          status: 'paid',
          paymentDate: '2024-02-05',
          pdfUrl: '/receipts/EMP241001_PER202401.pdf'
        },
        {
          id: 'PER202312',
          periodStart: '2023-12-01',
          periodEnd: '2023-12-31',
          weekNumber: 52,
          year: 2023,
          grossSalary: 25000,
          deductions: 3750,
          netSalary: 21250,
          status: 'paid',
          paymentDate: '2024-01-05'
        },
        {
          id: 'PER202311',
          periodStart: '2023-11-01',
          periodEnd: '2023-11-30',
          weekNumber: 48,
          year: 2023,
          grossSalary: 25000,
          deductions: 3750,
          netSalary: 21250,
          status: 'paid',
          paymentDate: '2023-12-05'
        }
      ],
      summary: {
        totalGross: 75000,
        totalDeductions: 11250,
        totalNet: 63750,
        averageNet: 21250,
        periodsCount: 3
      }
    };

    const mockPeriodDetails: PayrollDetail[] = [
      {
        type: 'perception',
        concept: 'Sueldo Base',
        amount: 25000,
        description: 'Salario mensual base'
      },
      {
        type: 'perception',
        concept: 'Bono de Productividad',
        amount: 2000,
        description: 'Bono por cumplimiento de objetivos'
      },
      {
        type: 'perception',
        concept: 'Vales de Despensa',
        amount: 1000,
        description: 'Vales de despensa mensuales'
      },
      {
        type: 'deduction',
        concept: 'ISR',
        amount: 2500,
        description: 'Impuesto Sobre la Renta'
      },
      {
        type: 'deduction',
        concept: 'IMSS',
        amount: 750,
        description: 'Cuotas del IMSS'
      },
      {
        type: 'deduction',
        concept: 'Ahorro Voluntario',
        amount: 500,
        description: 'Ahorro voluntario para retiro'
      }
    ];

        setPayrollData(mockPayrollData);
        setSelectedPeriod(mockPayrollData.currentPeriod);
        setPeriodDetails(mockPeriodDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error loading payroll data:', error);
        setError('Error al cargar los datos de nómina.');
        setLoading(false);
      }
    };

    loadPayrollData();
  }, [employeeId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      default: return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredPeriods = payrollData?.periods.filter(period => {
    const periodString = `${period.periodStart} - ${period.periodEnd}`;
    const matchesSearch = periodString.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPeriod === 'all' || period.status === filterPeriod;
    return matchesSearch && matchesFilter;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de nómina...</p>
        </div>
      </div>
    );
  }

  if (!payrollData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró información</h3>
          <p className="text-gray-600">No hay datos de nómina disponibles para este empleado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown className="h-5 w-5 text-gray-600 rotate-90" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nómina</h1>
                <p className="text-gray-600">{payrollData.employeeName} - {payrollData.position}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Compartir</span>
              </button>
              <button 
                onClick={() => setIsPayPeriodModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Configurar Período</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Agregar Nómina</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Salario {payPeriodConfig.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payPeriodConfig.calculatedSalary > 0 
                    ? formatCurrency(payPeriodConfig.calculatedSalary) 
                    : formatCurrency(payrollData.baseSalary)
                  }
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total por Pagar</p>
                <p className="text-2xl font-bold text-green-600">
                  {payPeriodConfig.totalToPay !== 0 
                    ? formatCurrency(payPeriodConfig.totalToPay) 
                    : formatCurrency(payrollData.summary.averageNet)
                  }
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deducciones del Período</p>
                <p className="text-2xl font-bold text-red-600">
                  {payPeriodConfig.totalDeductions > 0 
                    ? formatCurrency(payPeriodConfig.totalDeductions) 
                    : formatCurrency(payrollData.summary.totalDeductions)
                  }
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Período Actual</p>
                <p className="text-lg font-bold text-gray-900">
                  {payPeriodConfig.startDate && payPeriodConfig.endDate 
                    ? `${new Date(payPeriodConfig.startDate).toLocaleDateString('es-ES')} - ${new Date(payPeriodConfig.endDate).toLocaleDateString('es-ES')}`
                    : 'No configurado'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">{payPeriodConfig.label}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CalendarDays className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Períodos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Períodos de Pago</h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value)}
                        className="pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todos</option>
                        <option value="paid">Pagados</option>
                        <option value="pending">Pendientes</option>
                        <option value="processing">Procesando</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar período..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredPeriods.map((period) => (
                  <div
                    key={period.id}
                    onClick={() => setSelectedPeriod(period)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedPeriod?.id === period.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{period.period}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(period.status)}`}>
                        {getStatusText(period.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Bruto: {formatCurrency(period.grossSalary)}</p>
                      <p>Neto: <span className="font-medium text-gray-900">{formatCurrency(period.netSalary)}</span></p>
                      {period.paymentDate && (
                        <p className="text-xs">Pagado: {formatDate(period.paymentDate)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detalles del Período Seleccionado */}
          <div className="lg:col-span-2">
            {selectedPeriod ? (
              <div className="space-y-6">
                {/* Información del Período */}
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedPeriod.period}</h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(selectedPeriod.startDate)} - {formatDate(selectedPeriod.endDate)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {selectedPeriod.pdfUrl && (
                          <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            <Eye className="h-4 w-4" />
                            <span>Ver Recibo</span>
                          </button>
                        )}
                        <button className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                          <Download className="h-4 w-4" />
                          <span>Descargar PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Salario Bruto</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedPeriod.grossSalary)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Deducciones</p>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedPeriod.deductions)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Salario Neto</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedPeriod.netSalary)}</p>
                      </div>
                    </div>

                    {/* Desglose de Percepciones y Deducciones */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Desglose de Nómina</h4>
                      
                      {/* Percepciones */}
                      <div>
                        <h5 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Percepciones
                        </h5>
                        <div className="space-y-2">
                          {periodDetails.filter(detail => detail.type === 'perception').map((detail, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{detail.concept}</p>
                                <p className="text-sm text-gray-600">{detail.description}</p>
                              </div>
                              <p className="font-medium text-green-600">+{formatCurrency(detail.amount)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deducciones */}
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          Deducciones
                        </h5>
                        <div className="space-y-2">
                          {periodDetails.filter(detail => detail.type === 'deduction').map((detail, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{detail.concept}</p>
                                <p className="text-sm text-gray-600">{detail.description}</p>
                              </div>
                              <p className="font-medium text-red-600">-{formatCurrency(detail.amount)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gráficos de Tendencias */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-6">
                      <PayrollChart 
                        data={payrollData.periods.map(period => ({
                          period: `${period.periodStart} - ${period.periodEnd}`,
                          grossSalary: period.grossSalary,
                          netSalary: period.netSalary,
                          deductions: period.deductions,
                          date: period.startDate
                        }))}
                        type="comparison"
                        height={200}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-6">
                      <PayrollChart 
                        data={payrollData.periods.map(period => ({
                          period: `${period.periodStart} - ${period.periodEnd}`,
                          grossSalary: period.grossSalary,
                          netSalary: period.netSalary,
                          deductions: period.deductions,
                          date: period.startDate
                        }))}
                        type="net"
                        height={200}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-12 text-center">
                  <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un período</h3>
                  <p className="text-gray-600">Elige un período de la lista para ver los detalles de nómina.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Configuración de Período de Pago */}
      {isPayPeriodModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Configurar Período de Pago</h3>
              <button
                onClick={() => setIsPayPeriodModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona la frecuencia de pago para calcular automáticamente el salario y deducciones del período.
                </p>
                
                {[
                  { value: 'daily', label: 'Diario', desc: 'Pago por día trabajado' },
                  { value: 'weekly', label: 'Semanal', desc: 'Pago semanal (Lunes a Domingo)' },
                  { value: 'biweekly', label: 'Quincenal', desc: 'Pago cada 15 días' },
                  { value: 'monthly', label: 'Mensual', desc: 'Pago mensual completo' },
                  { value: 'hourly', label: 'Por Hora', desc: 'Pago por hora trabajada' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFrequencyChange(option.value)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      payPeriodConfig.frequency === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{option.desc}</div>
                  </button>
                ))}
                
                {payPeriodConfig.frequency && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Resumen del Período</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Período:</span>
                        <span className="font-medium">
                          {new Date(payPeriodConfig.startDate).toLocaleDateString('es-ES')} - {new Date(payPeriodConfig.endDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Salario {payPeriodConfig.label}:</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(payPeriodConfig.calculatedSalary)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deducciones:</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(payPeriodConfig.totalDeductions)}
                        </span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-900">Total a Pagar:</span>
                        <span className="text-green-600">
                          {formatCurrency(payPeriodConfig.totalToPay)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsPayPeriodModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Aquí podrías guardar la configuración
                  console.log('Configuración aplicada:', payPeriodConfig);
                  setIsPayPeriodModalOpen(false);
                }}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { EmployeePayrollView };
export default EmployeePayrollView;
