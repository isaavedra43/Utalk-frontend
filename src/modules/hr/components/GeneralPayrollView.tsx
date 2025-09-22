import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  AlertCircle, 
  Play, 
  Download,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Pause,
  Eye,
  List,
  FileText,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Hammer,
  X,
  Plus
} from 'lucide-react';
import { generalPayrollApi, type PayrollPeriod, type PayrollMetrics } from '../../../services/generalPayrollApi';
import EmployeePayrollDetailView from './EmployeePayrollDetailView';
import PayrollSimulationView from './PayrollSimulationView';
import SimplePayrollSimulationView from './SimplePayrollSimulationView';
import PayrollApprovalView from './PayrollApprovalView';
import PayrollClosureView from './PayrollClosureView';

// Interfaces para tipos de datos (ya importadas desde el servicio)

interface PayrollRunStep {
  id: number;
  name: string;
  status: 'current' | 'completed' | 'pending';
}

interface PayrollPeriodType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface CustomPeriodData {
  startDate: string;
  endDate: string;
  name: string;
  description?: string;
}

const GeneralPayrollView: React.FC = () => {
  // Estados para métricas
  const [metrics, setMetrics] = useState<PayrollMetrics>({
    pendingOvertimeHours: 125,
    periodIncidents: 18
  });

  // Estados para períodos de nómina
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  // Estados para el proceso de payroll run
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showSimulationView, setShowSimulationView] = useState(false);
  const [showApprovalView, setShowApprovalView] = useState(false);
  const [showClosureView, setShowClosureView] = useState(false);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [approvedData, setApprovedData] = useState<any[]>([]);
  
  // Estados para el modal de detalle de nómina
  
  // Estados para el selector de período
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [selectedPeriodType, setSelectedPeriodType] = useState<string>('');
  const [customPeriodData, setCustomPeriodData] = useState<CustomPeriodData>({
    startDate: '',
    endDate: '',
    name: '',
    description: ''
  });

  // Opciones de período de nómina
  const periodTypes: PayrollPeriodType[] = [
    {
      id: 'custom',
      name: 'Día Personalizado',
      description: 'Selecciona fechas específicas para el período de nómina',
      icon: <CalendarDays className="h-6 w-6" />,
      color: 'blue'
    },
    {
      id: 'week',
      name: 'Semana Actual',
      description: 'Nómina para la semana actual (lunes a domingo)',
      icon: <CalendarRange className="h-6 w-6" />,
      color: 'green'
    },
    {
      id: 'month',
      name: 'Mes',
      description: 'Nómina mensual completa',
      icon: <CalendarCheck className="h-6 w-6" />,
      color: 'purple'
    },
    {
      id: 'piecework',
      name: 'Destajo',
      description: 'Nómina por trabajo realizado o proyectos específicos',
      icon: <Hammer className="h-6 w-6" />,
      color: 'orange'
    }
  ];

  // Pasos del proceso de payroll run - dinámicos
  const getPayrollSteps = (): PayrollRunStep[] => {
    const steps = [
      { id: 1, name: 'Selección', status: 'pending' as const },
      { id: 2, name: 'Simulación', status: 'pending' as const },
      { id: 3, name: 'Ajustes y Aprobación', status: 'pending' as const },
      { id: 4, name: 'Cierre', status: 'pending' as const }
    ];

    // Actualizar estado basado en el paso actual
    for (let i = 0; i < steps.length; i++) {
      if (i < currentStep - 1) {
        steps[i].status = 'completed';
      } else if (i === currentStep - 1) {
        steps[i].status = 'current';
      } else {
        steps[i].status = 'pending';
      }
    }

    return steps;
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cerrado':
        return 'bg-green-100 text-green-800';
      case 'aprobado':
        return 'bg-blue-100 text-blue-800';
      case 'calculado':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendiente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'cerrado':
        return 'Cerrado';
      case 'aprobado':
        return 'Aprobado';
      case 'calculado':
        return 'Calculado';
      case 'pendiente':
        return 'Pendiente';
      default:
        return status;
    }
  };

  // Función para manejar la selección de período
  const handlePeriodSelect = (period: PayrollPeriod) => {
    setSelectedPeriod(period);
    console.log('📅 Período seleccionado:', period);
  };

  // Función para abrir el selector de período
  const handleOpenPeriodSelector = () => {
    setShowPeriodSelector(true);
    setSelectedPeriodType('');
    setCustomPeriodData({
      startDate: '',
      endDate: '',
      name: '',
      description: ''
    });
  };

  // Función para cerrar el selector de período
  const handleClosePeriodSelector = () => {
    setShowPeriodSelector(false);
    setSelectedPeriodType('');
    setCustomPeriodData({
      startDate: '',
      endDate: '',
      name: '',
      description: ''
    });
  };

  // Función para seleccionar tipo de período
  const handleSelectPeriodType = (typeId: string) => {
    setSelectedPeriodType(typeId);
    
    // Auto-llenar datos según el tipo
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajustar para lunes
    startOfWeek.setDate(diff);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    switch (typeId) {
      case 'week':
        setCustomPeriodData({
          startDate: startOfWeek.toISOString().split('T')[0],
          endDate: new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          name: `Semana del ${startOfWeek.toLocaleDateString('es-MX')}`,
          description: 'Nómina semanal'
        });
        break;
      case 'month':
        setCustomPeriodData({
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0],
          name: `${today.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`,
          description: 'Nómina mensual'
        });
        break;
      case 'piecework':
        setCustomPeriodData({
          startDate: today.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
          name: `Destajo - ${today.toLocaleDateString('es-MX')}`,
          description: 'Nómina por destajo'
        });
        break;
      default:
        setCustomPeriodData({
          startDate: '',
          endDate: '',
          name: '',
          description: ''
        });
    }
  };

  // Función para crear período personalizado
  const handleCreateCustomPeriod = () => {
    if (!selectedPeriodType || !customPeriodData.startDate || !customPeriodData.endDate || !customPeriodData.name) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const newPeriod: PayrollPeriod = {
      id: `custom_${Date.now()}`,
      period: customPeriodData.name,
      type: periodTypes.find(t => t.id === selectedPeriodType)?.name || 'Personalizado',
      startDate: customPeriodData.startDate,
      endDate: customPeriodData.endDate,
      status: 'pendiente',
      totalEmployees: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      createdBy: 'Usuario Actual'
    };

    setSelectedPeriod(newPeriod);
    setShowPeriodSelector(false);
    console.log('📅 Nuevo período creado:', newPeriod);
  };

  // Función para iniciar nuevo payroll run
  const handleStartPayrollRun = async () => {
    if (!selectedPeriod) {
      alert('Por favor selecciona un período antes de iniciar el payroll run');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 Iniciando payroll run para período:', selectedPeriod);
      
      // Simular conexión con el backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Payroll run iniciado exitosamente');
      
      // Ir a la vista de simulación
      setShowSimulationView(true);
      setCurrentStep(2);
      
    } catch (error) {
      console.error('❌ Error iniciando payroll run:', error);
      setError('Error al iniciar el proceso de nómina');
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para demo completa del proceso
  const handleDemoComplete = () => {
    console.log('🎬 Iniciando demo completo del proceso...');
    
    // Crear período demo si no existe
    const demoPeriod: PayrollPeriod = {
      id: 'demo-1',
      period: 'Enero 2024',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      type: 'Mensual',
      status: 'pendiente',
      employees: 5,
      estimatedCost: 250000,
      realCost: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSelectedPeriod(demoPeriod);
    setShowSimulationView(true);
    setCurrentStep(2);
  };

  // Funciones de navegación entre vistas
  const handleSimulationNext = (data: any[]) => {
    setSimulationData(data);
    setShowSimulationView(false);
    setShowApprovalView(true);
    setCurrentStep(3);
  };

  const handleApprovalNext = (data: any[]) => {
    setApprovedData(data);
    setShowApprovalView(false);
    setShowClosureView(true);
    setCurrentStep(4);
  };

  const handleClosureComplete = () => {
    setShowClosureView(false);
    setCurrentStep(1);
    setSelectedPeriod(null);
    setSimulationData([]);
    setApprovedData([]);
  };

  const handleBackToGeneral = () => {
    setShowSimulationView(false);
    setShowApprovalView(false);
    setShowClosureView(false);
    setCurrentStep(1);
  };

  const handleResetProcess = () => {
    setShowSimulationView(false);
    setShowApprovalView(false);
    setShowClosureView(false);
    setCurrentStep(1);
    setSelectedPeriod(null);
    setSimulationData([]);
    setApprovedData([]);
    setError(null);
    console.log('🔄 Proceso de nómina reseteado');
  };

  // Función para descargar reporte
  const handleDownloadReport = async (period: PayrollPeriod) => {
    try {
      console.log('📥 Generando reporte para período:', period);
      
      // Generar reporte
      const report = await generalPayrollApi.generatePayrollReport(period.id, {
        type: 'summary',
        format: 'pdf'
      });
      
      // Descargar reporte
      const blob = await generalPayrollApi.downloadPayrollReport(report.id);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-nomina-${period.period}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Reporte descargado exitosamente');
    } catch (error) {
      console.error('❌ Error descargando reporte:', error);
      setError('Error al descargar el reporte');
    }
  };

  // Función para ver detalle de nómina - redirige a la vista correcta
  const handleViewPayrollDetail = (period: PayrollPeriod) => {
    console.log('📊 Redirigiendo a detalle de nómina para período:', period.period);
    // Aquí se redirigiría a la vista correcta de EmployeePayrollDetailView
    // Por ahora simulamos la redirección
    alert(`Redirigiendo a la vista detallada de nómina para el período: ${period.period}`);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadPayrollData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Cargando datos de nómina general...');
        
        // Preparar parámetros de filtro
        const filterParams: any = {
          page: currentPage,
          limit: itemsPerPage
        };
        
        if (statusFilter !== 'all') {
          filterParams.status = statusFilter;
        }
        
        if (typeFilter !== 'all') {
          filterParams.type = typeFilter;
        }
        
        if (yearFilter !== 'all') {
          filterParams.year = parseInt(yearFilter);
        }
        
        // Cargar métricas y períodos en paralelo
        const [metricsData, periodsData] = await Promise.all([
          generalPayrollApi.getGeneralMetrics(),
          generalPayrollApi.getPayrollPeriods(filterParams)
        ]);
        
        setMetrics(metricsData);
        setPayrollPeriods(periodsData.periods);
        setTotalPages(periodsData.pagination.totalPages);
        setTotalItems(periodsData.pagination.total);
        
        console.log('✅ Datos de nómina general cargados');
      } catch (error) {
        console.error('❌ Error cargando datos de nómina general:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar los datos de nómina general';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPayrollData();
  }, [currentPage, itemsPerPage, statusFilter, typeFilter, yearFilter]);

  // Funciones para manejar paginación y filtros
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset a la primera página
  };
  
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset a la primera página
  };
  
  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value);
        break;
      case 'type':
        setTypeFilter(value);
        break;
      case 'year':
        setYearFilter(value);
        break;
    }
    setCurrentPage(1); // Reset a la primera página
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setYearFilter('all');
    setCurrentPage(1);
  };

  // Mostrar vistas específicas del proceso
  if (showDetailView) {
    return (
      <div>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowDetailView(false)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Volver a Vista General
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Detalle de Nómina General</h1>
            </div>
          </div>
        </div>
        <EmployeePayrollDetailView />
      </div>
    );
  }

  if (showSimulationView && selectedPeriod) {
    return (
      <SimplePayrollSimulationView
        selectedPeriod={selectedPeriod}
        onNext={handleSimulationNext}
        onBack={handleBackToGeneral}
      />
    );
  }

  if (showApprovalView) {
    return (
      <PayrollApprovalView
        adjustedData={simulationData}
        selectedPeriod={selectedPeriod}
        onNext={handleApprovalNext}
        onBack={() => {
          setShowApprovalView(false);
          setShowSimulationView(true);
          setCurrentStep(2);
        }}
      />
    );
  }

  if (showClosureView) {
    return (
      <PayrollClosureView
        approvedData={approvedData}
        onComplete={handleClosureComplete}
        onBack={() => {
          setShowClosureView(false);
          setShowApprovalView(true);
          setCurrentStep(3);
        }}
      />
    );
  }

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de nómina...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Indicador de estado del proceso */}
      {(showSimulationView || showApprovalView || showClosureView) && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
              <span className="font-medium">
                Proceso de Nómina en Curso - Paso {currentStep} de 4
              </span>
            </div>
            <button
              onClick={handleResetProcess}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Cancelar y Volver al Inicio
            </button>
          </div>
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Horas Extra Pendientes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Extra Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.pendingOvertimeHours}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Incidencias del Período */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Incidencias del Período</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.periodIncidents}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Ejecución de Nómina */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ejecución de Nómina (Payroll Run)</h2>
          <p className="text-gray-600">
            Inicia y gestiona el proceso de cálculo de nómina para un periodo.
          </p>
        </div>

        {/* Pasos del proceso - Diseño mejorado en secuencia */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {getPayrollSteps().map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                {/* Círculo del paso */}
                <div className={`flex items-center justify-center w-14 h-14 rounded-full border-3 ${
                  step.status === 'current' 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg ring-4 ring-blue-100' 
                    : step.status === 'completed'
                    ? 'bg-green-600 border-green-600 text-white shadow-lg ring-4 ring-green-100'
                    : 'bg-white border-gray-300 text-gray-500 shadow-sm'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-7 w-7" />
                  ) : (
                    <span className="text-xl font-bold">{step.id}</span>
                  )}
                </div>
                
                {/* Etiqueta del paso */}
                <div className="mt-3">
                  <p className={`text-sm font-semibold whitespace-nowrap ${
                    step.status === 'current' ? 'text-blue-600' : 
                    step.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                </div>
                
                {/* Línea conectora */}
                {index < getPayrollSteps().length - 1 && (
                  <div className={`absolute top-7 left-full w-16 h-0.5 ${
                    step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            {selectedPeriod 
              ? `Período seleccionado: ${selectedPeriod.period} (${selectedPeriod.type})`
              : 'Selecciona un período para iniciar la simulación.'
            }
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleOpenPeriodSelector}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Seleccionar Período
            </button>
            
            <button
              onClick={handleStartPayrollRun}
              disabled={!selectedPeriod || isGenerating}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Nuevo Payroll Run
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowDetailView(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <List className="h-4 w-4 mr-2" />
              Ver Detalle de Empleados
            </button>
            
            <button
              onClick={handleDemoComplete}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Demo Completo
            </button>
            
            <button
              onClick={handleResetProcess}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Resetear Proceso
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Períodos de Nómina */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h2 className="text-2xl font-bold text-gray-900">Periodos de Nómina</h2>
            
            {/* Controles de búsqueda y filtros */}
            <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
              {/* Buscador */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar período..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-64"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Filtros */}
              <div className="flex space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="calculado">Calculado</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="cerrado">Cerrado</option>
                </select>
                
                <select
                  value={typeFilter}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="Mensual">Mensual</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Quincenal">Quincenal</option>
                </select>
                
                <select
                  value={yearFilter}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los años</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
                
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
          
          {/* Información de paginación */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div>
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} períodos
            </div>
            <div className="flex items-center space-x-2">
              <span>Elementos por página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periodo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo Estimado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo Real
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollPeriods.map((period) => (
                <tr 
                  key={period.id}
                  className={`hover:bg-gray-50 cursor-pointer ${
                    selectedPeriod?.id === period.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handlePeriodSelect(period)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {period.period}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{period.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(period.status)}`}>
                      {getStatusText(period.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{period.employees}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(period.estimatedCost)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {period.realCost ? formatCurrency(period.realCost) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {period.createdBy.avatar || period.createdBy.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {period.createdBy.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {period.createdBy.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Botón para ver detalle de nómina */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPayrollDetail(period);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Ver detalle de nómina"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      
                      {/* Botón para descargar reporte */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadReport(period);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Descargar reporte"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {/* Números de página */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Modal para seleccionar período */}
      {showPeriodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Seleccionar Período de Nómina</h3>
                <p className="text-gray-600 mt-1">
                  Elige el tipo de período para generar la nómina
                </p>
              </div>
              <button
                onClick={handleClosePeriodSelector}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Opciones de tipo de período */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Período</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {periodTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleSelectPeriodType(type.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedPeriodType === type.id
                          ? `border-${type.color}-500 bg-${type.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedPeriodType === type.id
                            ? `bg-${type.color}-100 text-${type.color}-600`
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {type.icon}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{type.name}</h5>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulario de período personalizado */}
              {selectedPeriodType && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Período</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        value={customPeriodData.startDate}
                        onChange={(e) => setCustomPeriodData({
                          ...customPeriodData,
                          startDate: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Fin
                      </label>
                      <input
                        type="date"
                        value={customPeriodData.endDate}
                        onChange={(e) => setCustomPeriodData({
                          ...customPeriodData,
                          endDate: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Período
                      </label>
                      <input
                        type="text"
                        value={customPeriodData.name}
                        onChange={(e) => setCustomPeriodData({
                          ...customPeriodData,
                          name: e.target.value
                        })}
                        placeholder="Ej: Enero 2024, Semana 1, Proyecto Alpha..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción (Opcional)
                      </label>
                      <textarea
                        value={customPeriodData.description}
                        onChange={(e) => setCustomPeriodData({
                          ...customPeriodData,
                          description: e.target.value
                        })}
                        placeholder="Descripción adicional del período..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Resumen del período */}
              {selectedPeriodType && customPeriodData.startDate && customPeriodData.endDate && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-2">Resumen del Período</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700"><strong>Tipo:</strong> {periodTypes.find(t => t.id === selectedPeriodType)?.name}</p>
                    </div>
                    <div>
                      <p className="text-blue-700"><strong>Inicio:</strong> {new Date(customPeriodData.startDate).toLocaleDateString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-blue-700"><strong>Fin:</strong> {new Date(customPeriodData.endDate).toLocaleDateString('es-MX')}</p>
                    </div>
                  </div>
                  {customPeriodData.name && (
                    <div className="mt-2">
                      <p className="text-blue-700"><strong>Nombre:</strong> {customPeriodData.name}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Acciones del modal */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  onClick={handleClosePeriodSelector}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCustomPeriod}
                  disabled={!selectedPeriodType || !customPeriodData.startDate || !customPeriodData.endDate || !customPeriodData.name}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Crear Período
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralPayrollView;
