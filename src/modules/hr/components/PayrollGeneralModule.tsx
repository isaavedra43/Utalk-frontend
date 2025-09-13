import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Download, 
  Plus, 
  Search, 
  Filter,
  Settings,
  FileText,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Printer,
  History,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { payrollApi, PayrollPeriod, PayrollEmployee } from '../../../services/payrollApi';

export const PayrollGeneralModule: React.FC = () => {
  // Estados principales
  const [currentPeriod, setCurrentPeriod] = useState<PayrollPeriod | null>(null);
  const [employees, setEmployees] = useState<PayrollEmployee[]>([]);
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de vista
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Estados de modales
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [processingPayroll, setProcessingPayroll] = useState(false);
  
  // Estados de filtros y paginación
  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Cargar período actual al montar el componente
  useEffect(() => {
    loadCurrentPeriod();
    loadPeriods();
  }, []);

  // Cargar empleados cuando cambie el período actual o los filtros
  useEffect(() => {
    if (currentPeriod && viewMode === 'current') {
      loadPeriodEmployees();
    }
  }, [currentPeriod, filters, pagination.page]);

  // Función para cargar el período actual
  const loadCurrentPeriod = useCallback(async () => {
    try {
      setError(null);
      const period = await payrollApi.getCurrentPayrollPeriod();
      setCurrentPeriod(period);
    } catch (error) {
      console.error('Error cargando período actual:', error);
      // No mostrar error si no hay período actual
    }
  }, []);

  // Función para cargar todos los períodos
  const loadPeriods = useCallback(async () => {
    try {
      setError(null);
      const response = await payrollApi.getPayrollPeriods({
        page: 1,
        limit: 50
      });
      setPeriods(response.periods);
    } catch (error) {
      console.error('Error cargando períodos:', error);
      setError('Error cargando períodos de nómina');
    }
  }, []);

  // Función para cargar empleados del período
  const loadPeriodEmployees = useCallback(async () => {
    if (!currentPeriod) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await payrollApi.getPeriodEmployees(currentPeriod.id, {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        department: filters.department !== 'all' ? filters.department : undefined,
        status: filters.status !== 'all' ? filters.status : undefined
      });

      setEmployees(response.employees);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      }));

    } catch (error) {
      console.error('Error cargando empleados:', error);
      setError('Error cargando empleados del período');
    } finally {
      setLoading(false);
    }
  }, [currentPeriod, filters, pagination.page, pagination.limit]);

  // Función para crear nuevo período
  const handleCreatePeriod = async (periodData: {
    name: string;
    startDate: string;
    endDate: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    configurations: {
      calculateTaxes: boolean;
      includeOvertime: boolean;
      applyAbsenceDeductions: boolean;
      includeLoans: boolean;
    };
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const newPeriod = await payrollApi.createPayrollPeriod(periodData);
      setCurrentPeriod(newPeriod);
      setShowPeriodModal(false);
      setViewMode('current');
      
      // Recargar períodos
      await loadPeriods();
      
    } catch (error) {
      console.error('Error creando período:', error);
      setError('Error creando período de nómina');
    } finally {
      setLoading(false);
    }
  };

  // Función para procesar nómina masiva
  const handleProcessPayroll = async () => {
    if (!currentPeriod || !payrollApi.canProcessPeriod(currentPeriod.status)) return;

    try {
      setProcessingPayroll(true);
      setError(null);
      
      const result = await payrollApi.processMassPayroll(currentPeriod.id);
      
      if (result.success) {
        // Actualizar período actual
        setCurrentPeriod(result.period);
        // Recargar empleados
        await loadPeriodEmployees();
        
        if (result.errorsCount > 0) {
          setError(`Nómina procesada con ${result.errorsCount} errores. Revisa los empleados individualmente.`);
        }
      }
      
    } catch (error) {
      console.error('Error procesando nómina:', error);
      setError('Error procesando nómina masiva');
    } finally {
      setProcessingPayroll(false);
    }
  };

  // Funciones de utilidad
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  // Vista principal - sin período activo
  if (!currentPeriod) {
    return (
      <div className="payroll-general-module">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nómina General</h1>
            <p className="text-gray-600">Gestión completa de nómina para todos los empleados</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('history')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <History className="w-4 h-4" />
              Ver Historial
            </button>
          </div>
        </div>

        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            No hay período de nómina activo
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Para comenzar a gestionar la nómina, primero debes configurar un período de pago
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowPeriodModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Configurar Período de Nómina
            </button>
            <button
              onClick={() => setViewMode('history')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <History className="w-5 h-5" />
              Ver Nóminas Anteriores
            </button>
          </div>
        </div>

        {/* Modal de crear período */}
        {showPeriodModal && (
          <PayrollPeriodModal
            onClose={() => setShowPeriodModal(false)}
            onSubmit={handleCreatePeriod}
            loading={loading}
          />
        )}
      </div>
    );
  }

  return <div>Vista con período activo - En construcción</div>;
};

// Modal para configurar período de nómina
interface PayrollPeriodModalProps {
  period?: PayrollPeriod | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

const PayrollPeriodModal: React.FC<PayrollPeriodModalProps> = ({
  period,
  onClose,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: period?.name || '',
    startDate: period?.startDate || '',
    endDate: period?.endDate || '',
    frequency: period?.frequency || 'monthly' as 'weekly' | 'biweekly' | 'monthly',
    configurations: {
      calculateTaxes: period?.configurations?.calculateTaxes ?? true,
      includeOvertime: period?.configurations?.includeOvertime ?? true,
      applyAbsenceDeductions: period?.configurations?.applyAbsenceDeductions ?? true,
      includeLoans: period?.configurations?.includeLoans ?? true
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Configurar Nuevo Período de Nómina
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Frecuencia de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Frecuencia de Pago
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, frequency: freq }))}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    formData.frequency === freq
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Calendar className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">
                    {freq === 'weekly' ? 'Semanal' : freq === 'biweekly' ? 'Quincenal' : 'Mensual'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Nombre del Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Período
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Septiembre 2025"
              required
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Configuraciones del Período */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Configuraciones del Período</h4>
            <div className="space-y-3">
              {[
                { key: 'calculateTaxes', label: 'Calcular automáticamente deducciones de impuestos' },
                { key: 'includeOvertime', label: 'Incluir cálculo de horas extra' },
                { key: 'applyAbsenceDeductions', label: 'Aplicar deducciones por faltas' },
                { key: 'includeLoans', label: 'Incluir préstamos y adelantos' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.configurations[key as keyof typeof formData.configurations]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      configurations: {
                        ...prev.configurations,
                        [key]: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-blue-600">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Crear Período
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
