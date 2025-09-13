import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Receipt,
  Filter,
  Search,
  ChevronDown,
  Eye,
  Plus,
  Settings,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import PayrollChart from './PayrollChart';
import PayrollConfigForm from './PayrollConfigForm';
import TaxConfigurationModal from './TaxConfigurationModal';
import { payrollApi, type PayrollPeriod, type PayrollConfig, type PayrollDetail } from '../../../services/payrollApi';
import { Employee } from '../../../services/employeesApi';
import { TaxSettingsConfig } from '../../../types/hr';

// PayrollDetail ahora viene del payrollApi
// interface PayrollDetail se importa desde payrollApi

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
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [generatingPayroll, setGeneratingPayroll] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPayPeriodModalOpen, setIsPayPeriodModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isTaxConfigModalOpen, setIsTaxConfigModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Nuevos estados para funcionalidades avanzadas
  const [payrollPreview, setPayrollPreview] = useState<any>(null);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
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

  // Las funciones de cálculo ahora se usan desde payrollApi

  // Función para manejar cambio de frecuencia de pago
  const handleFrequencyChange = async (frequency: string) => {
    if (!payrollData?.config?.baseSalary) return;

    const dates = payrollApi.calculateDatesByFrequency(frequency);
    const calculatedSalary = payrollApi.calculateSalaryByFrequency(payrollData.config.baseSalary, frequency);
    
    // TODO: Aquí deberías llamar a la API para obtener las deducciones del período
    // Por ahora usamos estimación básica
    const totalDeductions = calculatedSalary * 0.15; // Estimación del 15%
    const totalToPay = calculatedSalary - totalDeductions;

    setPayPeriodConfig({
      frequency: frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'hourly',
      startDate: dates.startDate,
      endDate: dates.endDate,
      label: payrollApi.getFrequencyLabel(frequency),
      calculatedSalary,
      totalDeductions,
      totalToPay
    });
  };

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
        
        console.log('📊 Períodos obtenidos:', periodsResponse.data);
        
        // 3. Construir datos de nómina
        const payrollData: EmployeePayrollData = {
          config: config,
          periods: periodsResponse.data.periods || [],
          summary: periodsResponse.data.summary || {
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
          hasData: config !== null || (periodsResponse.data.periods && periodsResponse.data.periods.length > 0)
        };
        
        console.log('✅ Datos de nómina procesados:', payrollData);
        
        setPayrollData(payrollData);
        
        // Configurar el período más reciente por defecto
        if (payrollData.periods.length > 0) {
          const latestPeriod = payrollData.periods[0]; // Los períodos vienen ordenados por fecha
          setSelectedPeriod(latestPeriod);
          
          // Cargar detalles del período más reciente
          await loadPeriodDetails(latestPeriod.id);
        }
        
        // Si hay configuración, actualizar el estado del modal de período
        if (config) {
          const dates = payrollApi.calculateDatesByFrequency(config.frequency);
          const calculatedSalary = payrollApi.calculateSalaryByFrequency(config.baseSalary, config.frequency);
          
          setPayPeriodConfig({
            frequency: config.frequency,
            startDate: dates.startDate,
            endDate: dates.endDate,
            label: payrollApi.getFrequencyLabel(config.frequency),
            calculatedSalary,
            totalDeductions: 0, // Se calculará dinámicamente
            totalToPay: calculatedSalary
          });
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

    if (employeeId && employee) {
      loadPayrollData();
    }
  }, [employeeId, employee]);

  // Función para cargar detalles de un período específico
  const loadPeriodDetails = async (payrollId: string) => {
    try {
      console.log('📋 Cargando detalles del período:', payrollId);
      
      const detailsResponse = await payrollApi.getPayrollDetails(payrollId);
      console.log('✅ Detalles obtenidos:', detailsResponse.data);
      
      // Combinar percepciones y deducciones
      const allDetails = [
        ...detailsResponse.data.perceptions,
        ...detailsResponse.data.deductions
      ];
      
      setPeriodDetails(allDetails);
      
    } catch (error: unknown) {
      console.error('❌ Error cargando detalles del período:', error);
      setPeriodDetails([]);
    }
  };

  // Función para configurar nómina inicial
  const handleConfigurePayroll = async (configData: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'hourly';
    baseSalary: number;
    sbc: number;
  }) => {
    try {
      setConfigLoading(true);
      console.log('🔧 Configurando nómina:', configData);
      
      const response = await payrollApi.createPayrollConfig(employeeId, {
        ...configData,
        workingDaysPerWeek: 5,
        workingHoursPerDay: 8,
        overtimeRate: 1.5,
        currency: 'MXN',
        paymentMethod: 'transfer',
        taxRegime: 'general'
      });
      
      console.log('✅ Configuración creada:', response);
      
      // Recargar datos
      window.location.reload(); // Temporal, luego optimizaremos
      
    } catch (error: unknown) {
        console.error('❌ Error configurando nómina:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error configurando nómina';
        setError(errorMessage);
    } finally {
      setConfigLoading(false);
    }
  };

  // Función para generar período de nómina (mejorada)
  const handleGeneratePayroll = async () => {
    try {
      setGeneratingPayroll(true);
      console.log('💰 Generando período de nómina avanzada para:', employeeId);
      
      // Usar el nuevo endpoint avanzado
      const response = await payrollApi.generateAdvancedPayroll(employeeId, {
        periodDate: new Date().toISOString().split('T')[0],
        forceRegenerate: false,
        ignoreDuplicates: false
      });
      
      console.log('✅ Período avanzado generado:', response);
      
      // Mostrar información sobre extras y duplicados aplicados
      console.log('Extras aplicados:', response.data.summary.extrasApplied);
      console.log('Impuestos aplicados:', response.data.summary.taxesApplied);
      console.log('Duplicados encontrados:', response.data.summary.duplicatesFound);
      
      // Recargar datos
      window.location.reload(); // Temporal, luego optimizaremos
      
    } catch (error: unknown) {
        console.error('❌ Error generando nómina avanzada:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error generando nómina avanzada';
        setError(errorMessage);
    } finally {
      setGeneratingPayroll(false);
    }
  };

  // Nueva función para vista previa de nómina
  const handlePreviewPayroll = async () => {
    try {
      setPreviewLoading(true);
      setError(null);
      
      console.log('👁️ Generando vista previa de nómina para:', employeeId);
      
      const response = await payrollApi.previewPayroll(employeeId, new Date().toISOString().split('T')[0]);
      
      console.log('✅ Vista previa generada:', response);
      setPayrollPreview(response.data);
      setIsPreviewModalOpen(true);
      
    } catch (error: unknown) {
      console.error('❌ Error generando vista previa:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error generando vista previa';
      setError(errorMessage);
    } finally {
      setPreviewLoading(false);
    }
  };


  // Nueva función para guardar configuración de impuestos
  const handleSaveTaxConfiguration = async (settings: TaxSettingsConfig) => {
    try {
      console.log('💾 Guardando configuración de impuestos:', settings);
      
      // La configuración ya se guarda en el modal, solo cerramos
      setIsTaxConfigModalOpen(false);
      
      // Opcional: recargar datos para reflejar cambios
      // await loadPayrollData();
      
    } catch (error: unknown) {
      console.error('❌ Error guardando configuración de impuestos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error guardando configuración de impuestos';
      setError(errorMessage);
    }
  };

  // Función para aprobar período
  const handleApprovePayroll = async (payrollId: string) => {
    try {
      console.log('✅ Aprobando período:', payrollId);
      
      const response = await payrollApi.approvePayroll(payrollId);
      console.log('✅ Período aprobado:', response);
      
      // Actualizar el período en el estado local
      if (selectedPeriod && selectedPeriod.id === payrollId) {
        setSelectedPeriod({
          ...selectedPeriod,
          status: 'approved'
        });
      }
      
      // Actualizar la lista de períodos
      if (payrollData) {
        const updatedPeriods = payrollData.periods.map(period => 
          period.id === payrollId ? { ...period, status: 'approved' as const } : period
        );
        setPayrollData({
          ...payrollData,
          periods: updatedPeriods
        });
      }
      
    } catch (error: unknown) {
        console.error('❌ Error aprobando período:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error aprobando período';
        setError(errorMessage);
    }
  };

  // Función para marcar como pagado
  const handleMarkAsPaid = async (payrollId: string) => {
    try {
      console.log('💰 Marcando como pagado:', payrollId);
      
      const response = await payrollApi.markAsPaid(payrollId, new Date().toISOString().split('T')[0]);
      console.log('✅ Período marcado como pagado:', response);
      
      // Actualizar el período en el estado local
      if (selectedPeriod && selectedPeriod.id === payrollId) {
        setSelectedPeriod({
          ...selectedPeriod,
          status: 'paid'
        });
      }
      
      // Actualizar la lista de períodos
      if (payrollData) {
        const updatedPeriods = payrollData.periods.map(period => 
          period.id === payrollId ? { ...period, status: 'paid' as const } : period
        );
        setPayrollData({
          ...payrollData,
          periods: updatedPeriods
        });
      }
      
    } catch (error: unknown) {
        console.error('❌ Error marcando como pagado:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error marcando como pagado';
        setError(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'calculated': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'approved': return 'Aprobado';
      case 'calculated': return 'Calculado';
      case 'cancelled': return 'Cancelado';
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
                <p className="text-gray-600">
                  {employee.personalInfo?.firstName} {employee.personalInfo?.lastName} - {employee.position?.title || 'Sin Puesto'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showAdvancedFeatures 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Avanzado</span>
              </button>
              
              <button 
                onClick={handlePreviewPayroll}
                disabled={previewLoading}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Eye className="h-4 w-4" />
                <span>{previewLoading ? 'Cargando...' : 'Vista Previa'}</span>
              </button>
              
              <button 
                onClick={() => setIsTaxConfigModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Configurar Impuestos</span>
              </button>
              
              <button 
                onClick={() => setIsPayPeriodModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Configurar Período</span>
              </button>
              
              <button 
                onClick={handleGeneratePayroll}
                disabled={generatingPayroll}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{generatingPayroll ? 'Generando...' : 'Generar Nómina'}</span>
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
                <p className="text-sm font-medium text-gray-600">
                  Salario {payrollData.config ? payrollApi.getFrequencyLabel(payrollData.config.frequency) : 'Base'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {payrollData.config 
                    ? formatCurrency(payrollApi.calculateSalaryByFrequency(payrollData.config.baseSalary, payrollData.config.frequency))
                    : formatCurrency(employee.contract?.salary || employee.salary?.baseSalary || 0)
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
                <p className="text-sm font-medium text-gray-600">Total Neto Pagado</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(payrollData.summary.totalNet)}
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
                <p className="text-sm font-medium text-gray-600">Total Deducciones</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(payrollData.summary.totalDeductions)}
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
                <p className="text-sm font-medium text-gray-600">Períodos Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payrollData.summary.totalPeriods}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {payrollData.config ? payrollApi.getFrequencyLabel(payrollData.config.frequency) : 'Sin configurar'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CalendarDays className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Mostrar configuración inicial si no hay datos */}
        {!payrollData.hasData && (
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configurar Nómina</h3>
              <p className="text-gray-600 mb-6">
                Este empleado no tiene configuración de nómina. Configura la frecuencia de pago y el salario base para comenzar a generar períodos.
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  disabled={configLoading}
                  className="flex items-center space-x-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Settings className="h-4 w-4" />
                  <span>{configLoading ? 'Configurando...' : 'Configurar Nómina'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar botón para generar nómina si hay configuración pero no períodos */}
        {payrollData.hasData && payrollData.config && payrollData.periods.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border mb-8">
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <Plus className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generar Primer Período</h3>
              <p className="text-gray-600 mb-6">
                La configuración de nómina está lista. Genera el primer período de pago para comenzar.
              </p>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleGeneratePayroll}
                  disabled={generatingPayroll}
                  className="flex items-center space-x-2 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  <span>{generatingPayroll ? 'Generando...' : 'Generar Período'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar error si hay alguno */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

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
                        <option value="approved">Aprobados</option>
                        <option value="calculated">Calculados</option>
                        <option value="cancelled">Cancelados</option>
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
                      <h4 className="font-medium text-gray-900">
                        {formatDate(period.periodStart)} - {formatDate(period.periodEnd)}
                      </h4>
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
                        <h3 className="text-lg font-semibold text-gray-900">
                          Período {payrollData.config ? payrollApi.getFrequencyLabel(payrollData.config.frequency) : ''}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(selectedPeriod.periodStart)} - {formatDate(selectedPeriod.periodEnd)}
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
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedPeriod.totalDeductions)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Salario Neto</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedPeriod.netSalary)}</p>
                      </div>
                    </div>

                    {/* Botones de acción según el estado */}
                    {selectedPeriod.status === 'calculated' && (
                      <div className="flex items-center justify-center space-x-4 mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <button
                          onClick={() => handleApprovePayroll(selectedPeriod.id)}
                          className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <span>✓</span>
                          <span>Aprobar Período</span>
                        </button>
                      </div>
                    )}

                    {selectedPeriod.status === 'approved' && (
                      <div className="flex items-center justify-center space-x-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <button
                          onClick={() => handleMarkAsPaid(selectedPeriod.id)}
                          className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <span>💰</span>
                          <span>Marcar como Pagado</span>
                        </button>
                      </div>
                    )}

                    {selectedPeriod.status === 'paid' && (
                      <div className="flex items-center justify-center space-x-4 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 text-green-700">
                          <span>✅</span>
                          <span className="font-medium">Período Pagado</span>
                          {selectedPeriod.paymentDate && (
                            <span className="text-sm">- {formatDate(selectedPeriod.paymentDate)}</span>
                          )}
                        </div>
                      </div>
                    )}

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
                          deductions: period.totalDeductions,
                          date: period.periodStart
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
                          deductions: period.totalDeductions,
                          date: period.periodStart
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
      {/* Modal de Configuración Inicial de Nómina */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Configurar Nómina</h3>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <PayrollConfigForm
                employee={employee}
                onSave={handleConfigurePayroll}
                onCancel={() => setIsConfigModalOpen(false)}
                loading={configLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Impuestos */}
      {isTaxConfigModalOpen && (
        <TaxConfigurationModal
          isOpen={isTaxConfigModalOpen}
          onClose={() => setIsTaxConfigModalOpen(false)}
          employeeId={employeeId}
          employeeName={`${employee.personalInfo?.firstName} ${employee.personalInfo?.lastName}`}
          onSave={handleSaveTaxConfiguration}
          loading={configLoading}
        />
      )}

      {/* Modal de Vista Previa */}
      {isPreviewModalOpen && payrollPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Vista Previa de Nómina</h3>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Información del período */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Información del Período</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Empleado:</span>
                      <span className="ml-2 font-medium">{payrollPreview.employee.name}</span>
                    </div>
                    <div>
                      <span className="text-blue-700">Período:</span>
                      <span className="ml-2 font-medium">
                        {formatDate(payrollPreview.period.startDate)} - {formatDate(payrollPreview.period.endDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-green-600 mb-1">Salario Bruto</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(payrollPreview.preview.grossSalary)}
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-red-600 mb-1">Total Deducciones</p>
                    <p className="text-2xl font-bold text-red-800">
                      {formatCurrency(payrollPreview.preview.totalDeductions)}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-600 mb-1">Salario Neto</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {formatCurrency(payrollPreview.preview.netSalary)}
                    </p>
                  </div>
                </div>

                {/* Percepciones */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                    Percepciones
                  </h4>
                  <div className="space-y-2">
                    {payrollPreview.preview.perceptions.details.map((detail, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{detail.concept}</p>
                          {detail.description && (
                            <p className="text-sm text-gray-600">{detail.description}</p>
                          )}
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            {detail.source}
                          </span>
                        </div>
                        <p className="font-medium text-green-600">
                          +{formatCurrency(detail.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deducciones */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                    Deducciones
                  </h4>
                  <div className="space-y-2">
                    {payrollPreview.preview.deductions.details.map((detail, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{detail.concept}</p>
                          {detail.description && (
                            <p className="text-sm text-gray-600">{detail.description}</p>
                          )}
                          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            {detail.source}
                          </span>
                        </div>
                        <p className="font-medium text-red-600">
                          -{formatCurrency(detail.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advertencias */}
                {payrollPreview.preview.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Advertencias
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {payrollPreview.preview.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recomendaciones */}
                {payrollPreview.preview.recommendations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Recomendaciones
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {payrollPreview.preview.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Esta es una simulación. Los valores reales pueden variar.
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setIsPreviewModalOpen(false);
                      handleGeneratePayroll();
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generar Nómina
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
