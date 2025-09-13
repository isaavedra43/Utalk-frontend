import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Receipt,
  Search,
  Share2,
  Plus,
  Settings,
  X,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { payrollApi, type PayrollPeriod, type PayrollConfig, type PayrollDetail } from '../../../services/payrollApi';
import { Employee } from '../../../services/employeesApi';

interface EmployeePayrollData {
  config: PayrollConfig | null;
  periods: PayrollPeriod[];
  summary: {
    totalPeriods: number;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    averageNet: number;
    byStatus: {
      calculated: number;
      approved: number;
      paid: number;
      cancelled?: number;
    };
  };
  hasData: boolean;
}

interface EmployeePayrollViewProps {
  employeeId: string;
  employee: Employee;
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
  const [pendingExtras, setPendingExtras] = useState<{ summary: { totalExtras: number; totalToAdd: number; totalToSubtract: number; netImpact: number } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [generatingPayroll, setGeneratingPayroll] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de nómina desde la API REAL
  useEffect(() => {
    const loadPayrollData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Cargando datos de nómina para empleado:', employeeId);
        
        // 1. Obtener configuración de nómina
        const config = await payrollApi.getPayrollConfig(employeeId);
        console.log('📋 Configuración obtenida:', config);
        
        // 2. Obtener períodos de nómina
        const periodsResponse = await payrollApi.getPayrollPeriods(employeeId, {
          limit: 50,
          year: new Date().getFullYear()
        });
        
        console.log('📊 Períodos obtenidos:', periodsResponse);
        
        // 3. Construir datos de nómina
        const payrollData: EmployeePayrollData = {
          config: config,
          periods: periodsResponse.periods || [],
          summary: {
            totalPeriods: periodsResponse.summary?.totalPeriods || 0,
            totalGross: periodsResponse.summary?.totalGross || 0,
            totalDeductions: periodsResponse.summary?.totalDeductions || 0,
            totalNet: periodsResponse.summary?.totalNet || 0,
            averageNet: periodsResponse.summary?.averageNet || 0,
            byStatus: {
              calculated: periodsResponse.periods?.filter(p => p.status === 'calculated').length || 0,
              approved: periodsResponse.periods?.filter(p => p.status === 'approved').length || 0,
              paid: periodsResponse.periods?.filter(p => p.status === 'paid').length || 0,
              cancelled: periodsResponse.periods?.filter(p => p.status === 'cancelled').length || 0
            }
          },
          hasData: config !== null || (periodsResponse.periods && periodsResponse.periods.length > 0)
        };
        
        console.log('✅ Datos de nómina procesados:', payrollData);
        
        setPayrollData(payrollData);
        
        // Configurar el período más reciente por defecto
        if (payrollData.periods.length > 0) {
          const latestPeriod = payrollData.periods[0];
          setSelectedPeriod(latestPeriod);
          await loadPeriodDetails(latestPeriod.id);
        }
        
        // 4. Cargar extras pendientes si hay configuración
        if (config) {
          try {
            const extras = await payrollApi.getPendingExtras(employeeId);
            console.log('📋 Extras pendientes obtenidos:', extras);
            setPendingExtras(extras);
          } catch (error) {
            console.error('❌ Error cargando extras pendientes:', error);
          }
        }
        
      } catch (error: unknown) {
        console.error('❌ Error cargando datos de nómina:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error cargando datos de nómina';
        setError(errorMessage);
        
        // Si no hay configuración, mostrar datos vacíos pero permitir configurar
        setPayrollData({
          config: null,
          periods: [],
          summary: {
            totalPeriods: 0,
            totalGross: 0,
            totalDeductions: 0,
            totalNet: 0,
            averageNet: 0,
            byStatus: {
              calculated: 0,
              approved: 0,
              paid: 0,
              cancelled: 0
            }
          },
          hasData: false
        });
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      loadPayrollData();
    }
  }, [employeeId]);

  // Función para cargar detalles de un período específico
  const loadPeriodDetails = async (payrollId: string) => {
    try {
      console.log('🔍 Cargando detalles del período:', payrollId);
      
      const details = await payrollApi.getPayrollDetails(payrollId);
      console.log('📋 Detalles obtenidos:', details);
      
      // Convertir los detalles al formato esperado por el componente
      const formattedDetails: PayrollDetail[] = [
        ...details.perceptions.map(p => ({ ...p, type: 'perception' as const })),
        ...details.deductions.map(d => ({ ...d, type: 'deduction' as const }))
      ];
      
      setPeriodDetails(formattedDetails);
      
    } catch (error: unknown) {
      console.error('❌ Error cargando detalles del período:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error cargando detalles';
      setError(errorMessage);
    }
  };


  // Función para generar nueva nómina
  const handleGeneratePayroll = async () => {
    try {
      setGeneratingPayroll(true);
      setError(null);
      
      console.log('🔄 Generando nueva nómina...');
      
      const result = await payrollApi.generatePayroll(employeeId, {
        forceRegenerate: false
      });
      
      console.log('✅ Nómina generada:', result);
      
      // Recargar datos después de generar nómina
      window.location.reload(); // Forzar recarga completa
      
    } catch (error: unknown) {
      console.error('❌ Error generando nómina:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error generando nómina';
      setError(errorMessage);
    } finally {
      setGeneratingPayroll(false);
    }
  };

  // Función para configurar período de nómina
  const handleConfigurePayroll = async (configData: Partial<PayrollConfig>) => {
    try {
      setConfigLoading(true);
      setError(null);
      
      console.log('🔧 Configurando nómina:', configData);
      
      const result = await payrollApi.configurePayroll(employeeId, configData);
      console.log('✅ Configuración guardada:', result);
      
      // Recargar datos después de configurar
      window.location.reload();
      
    } catch (error: unknown) {
      console.error('❌ Error configurando nómina:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error configurando nómina';
      setError(errorMessage);
    } finally {
      setConfigLoading(false);
    }
  };

  // Función para aprobar nómina
  const handleApprovePayroll = async (payrollId: string) => {
    try {
      console.log('✅ Aprobando nómina:', payrollId);
      
      await payrollApi.approvePayroll(payrollId);
      
      // Recargar datos
      window.location.reload();
      
    } catch (error: unknown) {
      console.error('❌ Error aprobando nómina:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error aprobando nómina';
      setError(errorMessage);
    }
  };

  // Función para marcar como pagado
  const handleMarkAsPaid = async (payrollId: string) => {
    try {
      console.log('💰 Marcando como pagado:', payrollId);
      
      await payrollApi.markAsPaid(payrollId, new Date().toISOString().split('T')[0]);
      
      // Recargar datos
      window.location.reload();
      
    } catch (error: unknown) {
      console.error('❌ Error marcando como pagado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error marcando como pagado';
      setError(errorMessage);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approved':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'calculated':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'calculated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (!payrollData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Error cargando nómina</h3>
        <p className="text-gray-600 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="payroll-view">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nómina</h2>
          <p className="text-gray-600">
            {employee.personalInfo?.firstName || ''} {employee.personalInfo?.lastName || ''} - {employee.position?.title || 'Empleado'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ← Regresar
          </button>
          
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
          
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configurar Período
          </button>
          
          <button
            onClick={handleGeneratePayroll}
            disabled={generatingPayroll || !payrollData.config}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPayroll ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Agregar Nómina
          </button>
          
          <button
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* No Configuration Warning */}
      {!payrollData.config && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>No hay configuración de nómina. Configura un período para comenzar a generar nóminas.</span>
          </div>
        </div>
      )}

      {/* Pending Extras Summary */}
      {pendingExtras && pendingExtras.summary.totalExtras > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">Extras Pendientes de Aplicar</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{pendingExtras.summary.totalExtras}</div>
              <div className="text-sm text-blue-700">Total Extras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{formatCurrency(pendingExtras.summary.totalToAdd)}</div>
              <div className="text-sm text-green-600">A Sumar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">-{formatCurrency(pendingExtras.summary.totalToSubtract)}</div>
              <div className="text-sm text-red-600">A Restar</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${pendingExtras.summary.netImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pendingExtras.summary.netImpact >= 0 ? '+' : ''}{formatCurrency(pendingExtras.summary.netImpact)}
              </div>
              <div className="text-sm text-gray-600">Impacto Neto</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {payrollData.hasData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Salario {payrollData.config ? payrollApi.getFrequencyLabel(payrollData.config.frequency) : 'Base'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {payrollData.config ? formatCurrency(payrollApi.calculateSalaryByFrequency(payrollData.config.baseSalary, payrollData.config.frequency)) : '--'}
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
                <p className="text-sm font-medium text-gray-600">Total Neto Pagado</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(payrollData.summary.totalNet)}</p>
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
                <p className="text-sm font-medium text-gray-600">Períodos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{payrollData.summary.totalPeriods}</p>
                <p className="text-xs text-gray-500">{payrollData.config ? payrollApi.getFrequencyLabel(payrollData.config.frequency) : ''}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CalendarDays className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Períodos de Pago */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Períodos de Pago</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">Todos</option>
                    <option value="calculated">Calculado</option>
                    <option value="approved">Aprobado</option>
                    <option value="paid">Pagado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar período..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {payrollData.periods.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay períodos de nómina</p>
                    {payrollData.config && (
                      <p className="text-sm text-gray-400 mt-2">Genera tu primer período usando el botón "Agregar Nómina"</p>
                    )}
                  </div>
                ) : (
                  payrollData.periods.map((period) => (
                    <div
                      key={period.id}
                      onClick={() => {
                        setSelectedPeriod(period);
                        loadPeriodDetails(period.id);
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPeriod?.id === period.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(period.periodStart)} - {formatDate(period.periodEnd)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Bruto: {formatCurrency(period.grossSalary)} | Neto: {formatCurrency(period.netSalary)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(period.status)}`}>
                          {payrollApi.getStatusLabel(period.status)}
                        </span>
                      </div>
                      
                      {period.status === 'calculated' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprovePayroll(period.id);
                            }}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            Aprobar
                          </button>
                        </div>
                      )}
                      
                      {period.status === 'approved' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsPaid(period.id);
                            }}
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            Marcar como Pagado
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detalles del Período Seleccionado */}
        <div className="lg:col-span-2">
          {selectedPeriod ? (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Período {payrollApi.getFrequencyLabel(selectedPeriod.frequency)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedPeriod.periodStart)} - {formatDate(selectedPeriod.periodEnd)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedPeriod.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPeriod.status)}`}>
                      {payrollApi.getStatusLabel(selectedPeriod.status)}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Resumen del Período */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Salario Bruto</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedPeriod.grossSalary)}</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">Deducciones</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedPeriod.totalDeductions)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Salario Neto</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedPeriod.netSalary)}</p>
                  </div>
                </div>

                {/* Botón Marcar como Pagado */}
                {selectedPeriod.status === 'approved' && (
                  <div className="text-center mb-6">
                    <button
                      onClick={() => handleMarkAsPaid(selectedPeriod.id)}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <DollarSign className="w-5 h-5" />
                      Marcar como Pagado
                    </button>
                  </div>
                )}

                {/* Desglose de Nómina */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Percepciones
                    </h4>
                    <div className="space-y-3">
                      {periodDetails.filter(detail => detail.type === 'perception').length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay percepciones registradas</p>
                      ) : (
                        periodDetails.filter(detail => detail.type === 'perception').map(detail => (
                          <div key={detail.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-medium text-green-800">{detail.concept}</p>
                              <p className="text-sm text-green-600">{detail.description}</p>
                            </div>
                            <p className="font-bold text-green-700">+{formatCurrency(detail.amount)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      Deducciones
                    </h4>
                    <div className="space-y-3">
                      {periodDetails.filter(detail => detail.type === 'deduction').length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay deducciones registradas</p>
                      ) : (
                        periodDetails.filter(detail => detail.type === 'deduction').map(detail => (
                          <div key={detail.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium text-red-800">{detail.concept}</p>
                              <p className="text-sm text-red-600">{detail.description}</p>
                            </div>
                            <p className="font-bold text-red-700">-{formatCurrency(detail.amount)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="text-center py-16">
                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecciona un Período
                </h3>
                <p className="text-gray-600">
                  Elige un período de la lista para ver su desglose detallado
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Configuración */}
      {isConfigModalOpen && (
        <PayrollConfigModal
          currentConfig={payrollData.config}
          onClose={() => setIsConfigModalOpen(false)}
          onSave={handleConfigurePayroll}
          loading={configLoading}
        />
      )}
    </div>
  );
};

// Modal de Configuración de Nómina
interface PayrollConfigModalProps {
  currentConfig: PayrollConfig | null;
  onClose: () => void;
  onSave: (config: Partial<PayrollConfig>) => void;
  loading: boolean;
}

const PayrollConfigModal: React.FC<PayrollConfigModalProps> = ({
  currentConfig,
  onClose,
  onSave,
  loading
}) => {
  const [config, setConfig] = useState({
    frequency: (currentConfig?.frequency || 'weekly') as 'daily' | 'weekly' | 'biweekly' | 'monthly',
    baseSalary: currentConfig?.baseSalary || 0,
    sbc: currentConfig?.sbc || 0,
    workingDaysPerWeek: currentConfig?.workingDaysPerWeek || 5,
    workingHoursPerDay: currentConfig?.workingHoursPerDay || 8,
    overtimeRate: currentConfig?.overtimeRate || 1.5,
    paymentMethod: (currentConfig?.paymentMethod || 'transfer') as 'transfer' | 'cash' | 'check',
    notes: currentConfig?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentConfig ? 'Actualizar Configuración de Nómina' : 'Configurar Período de Nómina'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Frecuencia de Pago */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Frecuencia de Pago
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { value: 'daily', label: 'Diario' },
                { value: 'weekly', label: 'Semanal' },
                { value: 'biweekly', label: 'Quincenal' },
                { value: 'monthly', label: 'Mensual' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, frequency: value as 'daily' | 'weekly' | 'biweekly' | 'monthly' }))}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    config.frequency === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Salarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salario Base Mensual
              </label>
              <input
                type="number"
                value={config.baseSalary}
                onChange={(e) => setConfig(prev => ({ ...prev, baseSalary: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salario Base de Cotización
              </label>
              <input
                type="number"
                value={config.sbc}
                onChange={(e) => setConfig(prev => ({ ...prev, sbc: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50000"
                required
              />
            </div>
          </div>

          {/* Configuración Laboral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días Laborales por Semana
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={config.workingDaysPerWeek}
                onChange={(e) => setConfig(prev => ({ ...prev, workingDaysPerWeek: parseInt(e.target.value) || 5 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas Laborales por Día
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={config.workingHoursPerDay}
                onChange={(e) => setConfig(prev => ({ ...prev, workingHoursPerDay: parseInt(e.target.value) || 8 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Multiplicador Horas Extra
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="3"
                value={config.overtimeRate}
                onChange={(e) => setConfig(prev => ({ ...prev, overtimeRate: parseFloat(e.target.value) || 1.5 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Método de Pago */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <select
              value={config.paymentMethod}
              onChange={(e) => setConfig(prev => ({ ...prev, paymentMethod: e.target.value as 'transfer' | 'cash' | 'check' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="transfer">Transferencia Bancaria</option>
              <option value="cash">Efectivo</option>
              <option value="check">Cheque</option>
            </select>
          </div>

          {/* Notas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={config.notes}
              onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Configuraciones adicionales o notas especiales..."
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {currentConfig ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  {currentConfig ? 'Actualizar Configuración' : 'Guardar Configuración'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeePayrollView;