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
  List
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

  // Estados para el proceso de payroll run
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showSimulationView, setShowSimulationView] = useState(false);
  const [showAdjustmentsView, setShowAdjustmentsView] = useState(false);
  const [showApprovalView, setShowApprovalView] = useState(false);
  const [showClosureView, setShowClosureView] = useState(false);
  const [simulationData, setSimulationData] = useState<any[]>([]);
  const [adjustedData, setAdjustedData] = useState<any[]>([]);
  const [approvedData, setApprovedData] = useState<any[]>([]);

  // Pasos del proceso de payroll run
  const payrollSteps: PayrollRunStep[] = [
    { id: 1, name: 'Selección', status: 'current' },
    { id: 2, name: 'Simulación', status: 'pending' },
    { id: 3, name: 'Ajustes y Aprobación', status: 'pending' },
    { id: 4, name: 'Cierre', status: 'pending' }
  ];

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

  // Función para iniciar nuevo payroll run
  const handleStartPayrollRun = async () => {
    // Para demo, usar el primer período disponible si no hay uno seleccionado
    const periodToUse = selectedPeriod || payrollPeriods[0];
    
    if (!periodToUse) {
      alert('No hay períodos disponibles para iniciar el payroll run');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 Iniciando payroll run para período:', periodToUse);
      
      // Simular conexión con el backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Payroll run iniciado exitosamente');
      
      // Ir a la vista de simulación
      setSelectedPeriod(periodToUse);
      setShowSimulationView(true);
      setCurrentStep(2);
      
    } catch (error) {
      console.error('❌ Error iniciando payroll run:', error);
      setError('Error al iniciar el proceso de nómina');
    } finally {
      setIsGenerating(false);
    }
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
  };

  const handleClosureComplete = () => {
    setShowClosureView(false);
    setCurrentStep(1);
    setSelectedPeriod(null);
    setSimulationData([]);
    setAdjustedData([]);
    setApprovedData([]);
  };

  const handleBackToGeneral = () => {
    setShowSimulationView(false);
    setShowApprovalView(false);
    setShowClosureView(false);
    setCurrentStep(1);
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

  // Función para ver detalle de período específico
  const handleViewPeriodDetail = (period: PayrollPeriod) => {
    console.log('👁️ Viendo detalle del período:', period);
    setSelectedPeriod(period);
    setShowDetailView(true);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadPayrollData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Cargando datos de nómina general...');
        
        // Cargar métricas y períodos en paralelo
        const [metricsData, periodsData] = await Promise.all([
          generalPayrollApi.getGeneralMetrics(),
          generalPayrollApi.getPayrollPeriods()
        ]);
        
        setMetrics(metricsData);
        setPayrollPeriods(periodsData.periods);
        
        console.log('✅ Datos de nómina general cargados');
      } catch (error) {
        console.error('❌ Error cargando datos de nómina general:', error);
        setError('Error al cargar los datos de nómina');
        
        // Datos de ejemplo en caso de error
        setPayrollPeriods([
          {
            id: '1',
            period: '30/4/2024 - 30/5/2024',
            type: 'Mensual',
            status: 'cerrado',
            employees: 40,
            estimatedCost: 1850000.00,
            realCost: 1852340.50,
            startDate: '2024-04-30',
            endDate: '2024-05-30',
            createdAt: '2024-04-30T00:00:00Z',
            updatedAt: '2024-05-30T00:00:00Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadPayrollData();
  }, []);

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
    console.log('🎯 Renderizando SimplePayrollSimulationView con período:', selectedPeriod);
    try {
      return (
        <SimplePayrollSimulationView
          selectedPeriod={selectedPeriod}
          onNext={handleSimulationNext}
          onBack={handleBackToGeneral}
        />
      );
    } catch (error) {
      console.error('❌ Error en SimplePayrollSimulationView:', error);
      return (
        <div className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-bold">Error en la Vista de Simulación</h2>
            <p className="text-gray-600 mt-2">Ha ocurrido un error al cargar la simulación.</p>
            <p className="text-sm text-gray-500 mt-2">Error: {error instanceof Error ? error.message : 'Error desconocido'}</p>
          </div>
          <button
            onClick={handleBackToGeneral}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Inicio
          </button>
        </div>
      );
    }
  }


  if (showApprovalView) {
    return (
      <PayrollApprovalView
        adjustedData={adjustedData}
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
            {payrollSteps.map((step, index) => (
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
                {index < payrollSteps.length - 1 && (
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
            Selecciona un periodo de la tabla de abajo para iniciar la simulación.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleStartPayrollRun}
              disabled={isGenerating}
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
              onClick={() => {
                // Demo: ir directamente a simulación
                if (payrollPeriods.length > 0) {
                  setSelectedPeriod(payrollPeriods[0]);
                  setShowSimulationView(true);
                  setCurrentStep(2);
                } else {
                  // Si no hay períodos, crear uno demo
                  const demoPeriod: PayrollPeriod = {
                    id: 'demo-1',
                    period: 'Enero 2024',
                    startDate: '2024-01-01',
                    endDate: '2024-01-31',
                    type: 'Mensual',
                    status: 'pendiente',
                    employees: 40,
                    estimatedCost: 1850000,
                    realCost: 1852340.50,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  setSelectedPeriod(demoPeriod);
                  setShowSimulationView(true);
                  setCurrentStep(2);
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Demo Completo
            </button>
            
          </div>
        </div>
      </div>

      {/* Tabla de Períodos de Nómina */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Periodos de Nómina</h2>
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
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
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPeriodDetail(period);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Ver detalle de nómina"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeneralPayrollView;
