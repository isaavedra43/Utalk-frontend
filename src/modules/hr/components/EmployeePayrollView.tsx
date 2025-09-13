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
  MoreHorizontal
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
  onBack: () => void;
}

const EmployeePayrollView: React.FC<EmployeePayrollViewProps> = ({ 
  employeeId, 
  onBack 
}) => {
  const [payrollData, setPayrollData] = useState<EmployeePayrollData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [periodDetails, setPeriodDetails] = useState<PayrollDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
        
        // Usar datos mock temporalmente
        const mockPayrollData: EmployeePayrollData = {
      employeeId: 'EMP241001',
      employeeName: 'Ana García',
      position: 'Gerente de Marketing',
      department: 'Marketing',
      baseSalary: 25000,
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
                <p className="text-sm font-medium text-gray-600">Salario Base</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(payrollData.baseSalary)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio Neto</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(payrollData.summary.averageNet)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deducciones</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(payrollData.summary.totalDeductions)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Períodos</p>
                <p className="text-2xl font-bold text-gray-900">{payrollData.summary.periodsCount}</p>
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
    </div>
  );
};

export { EmployeePayrollView };
export default EmployeePayrollView;
