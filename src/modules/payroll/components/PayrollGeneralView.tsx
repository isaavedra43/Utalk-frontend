// ===================================================================
// VISTA PRINCIPAL DEL MÓDULO DE NÓMINA GENERAL
// ===================================================================

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react';

// Hooks y servicios
import { usePayrollPeriods, usePayrollEmployees } from '../../../hooks/usePayroll';
import { formatCurrency, formatDate, getPeriodStatusLabel, getPeriodStatusColor } from '../../../utils/payrollUtils';

// Componentes
import PayrollPeriodCard from './PayrollPeriodCard';
import PayrollEmployeesTable from './PayrollEmployeesTable';
import CreatePeriodModal from './CreatePeriodModal';
import PayrollFilters from './PayrollFilters';
import PayrollStats from './PayrollStats';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const PayrollGeneralView: React.FC = () => {
  // Estados locales
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Hooks para gestión de datos
  const {
    periods,
    currentPeriod,
    loading: periodsLoading,
    error: periodsError,
    loadPeriods,
    createPeriod,
    processPeriod,
    approvePeriod,
    markAsPaid
  } = usePayrollPeriods();

  const {
    employees,
    period: selectedPeriod,
    loading: employeesLoading,
    error: employeesError,
    filters,
    applyFilters,
    clearFilters
  } = usePayrollEmployees(selectedPeriodId);

  // Seleccionar período actual por defecto
  useEffect(() => {
    if (currentPeriod && !selectedPeriodId) {
      setSelectedPeriodId(currentPeriod.id);
    }
  }, [currentPeriod, selectedPeriodId]);

  // Handlers
  const handleCreatePeriod = async (periodData: any) => {
    try {
      await createPeriod(periodData);
      setShowCreateModal(false);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleProcessPeriod = async (periodId: string) => {
    try {
      await processPeriod(periodId);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleApprovePeriod = async (periodId: string) => {
    try {
      await approvePeriod(periodId);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handleMarkAsPaid = async (periodId: string) => {
    try {
      await markAsPaid(periodId);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const handlePeriodSelect = (periodId: string) => {
    setSelectedPeriodId(periodId);
  };

  const handleApplyFilters = (newFilters: any) => {
    applyFilters(newFilters);
    setShowFilters(false);
  };

  // Calcular estadísticas rápidas
  const quickStats = React.useMemo(() => {
    if (!selectedPeriod) return null;

    const { summary } = selectedPeriod;
    return {
      totalEmployees: summary.totalEmployees,
      totalPayroll: summary.totalPayroll,
      averageSalary: summary.averageSalary,
      processedPercentage: summary.totalEmployees > 0 
        ? (summary.employeesProcessed / summary.totalEmployees) * 100 
        : 0
    };
  }, [selectedPeriod]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nómina General</h1>
              <p className="mt-2 text-gray-600">
                Gestiona períodos de nómina y procesa pagos para todos los empleados
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </button>
              
              <button
                onClick={() => loadPeriods()}
                disabled={periodsLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${periodsLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Período
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      {quickStats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Empleados</p>
                  <p className="text-2xl font-semibold text-gray-900">{quickStats.totalEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Nómina Total</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(quickStats.totalPayroll)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Salario Promedio</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(quickStats.averageSalary)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Progreso</p>
                  <p className="text-2xl font-semibold text-gray-900">{quickStats.processedPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Panel Izquierdo - Lista de Períodos */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Períodos de Nómina</h2>
                <p className="text-sm text-gray-600">Selecciona un período para ver los detalles</p>
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {periodsLoading ? (
                  <div className="p-8 flex justify-center">
                    <LoadingSpinner size="md" />
                  </div>
                ) : periodsError ? (
                  <div className="p-6">
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm">{periodsError}</span>
                    </div>
                  </div>
                ) : periods.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No hay períodos de nómina</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Crear el primer período
                    </button>
                  </div>
                ) : (
                  periods.map((period) => (
                    <PayrollPeriodCard
                      key={period.id}
                      period={period}
                      isSelected={selectedPeriodId === period.id}
                      onSelect={() => handlePeriodSelect(period.id)}
                      onProcess={() => handleProcessPeriod(period.id)}
                      onApprove={() => handleApprovePeriod(period.id)}
                      onMarkAsPaid={() => handleMarkAsPaid(period.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel Derecho - Detalles del Período Seleccionado */}
          <div className="lg:col-span-8">
            {selectedPeriod ? (
              <>
                {/* Información del Período */}
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{selectedPeriod.name}</h2>
                        <p className="text-sm text-gray-600">
                          {formatDate(selectedPeriod.startDate)} - {formatDate(selectedPeriod.endDate)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getPeriodStatusColor(selectedPeriod.status)}-100 text-${getPeriodStatusColor(selectedPeriod.status)}-800`}>
                          {selectedPeriod.status === 'draft' && <Clock className="w-4 h-4 mr-1" />}
                          {selectedPeriod.status === 'calculated' && <CheckCircle className="w-4 h-4 mr-1" />}
                          {selectedPeriod.status === 'approved' && <CheckCircle className="w-4 h-4 mr-1" />}
                          {selectedPeriod.status === 'paid' && <CreditCard className="w-4 h-4 mr-1" />}
                          {getPeriodStatusLabel(selectedPeriod.status)}
                        </span>
                        
                        <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          <Download className="w-4 h-4 mr-1" />
                          Exportar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas del Período */}
                  <PayrollStats period={selectedPeriod} />
                </div>

                {/* Filtros */}
                {showFilters && (
                  <div className="bg-white rounded-lg shadow mb-6">
                    <PayrollFilters
                      filters={filters}
                      onApplyFilters={handleApplyFilters}
                      onClearFilters={clearFilters}
                    />
                  </div>
                )}

                {/* Tabla de Empleados */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Empleados en Nómina</h3>
                    <p className="text-sm text-gray-600">
                      {employees.length} empleados encontrados
                    </p>
                  </div>

                  {employeesLoading ? (
                    <div className="p-8 flex justify-center">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : employeesError ? (
                    <div className="p-6">
                      <div className="flex items-center text-red-600">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span>{employeesError}</span>
                      </div>
                    </div>
                  ) : (
                    <PayrollEmployeesTable
                      employees={employees}
                      period={selectedPeriod}
                      loading={employeesLoading}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona un Período
                  </h3>
                  <p className="text-gray-600">
                    Elige un período de nómina de la lista para ver los empleados y sus cálculos
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Crear Período */}
      {showCreateModal && (
        <CreatePeriodModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePeriod}
        />
      )}
    </div>
  );
};

export default PayrollGeneralView;
