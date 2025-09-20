import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Clock, Users, DollarSign, TrendingUp, TrendingDown, Download, Filter, Search } from 'lucide-react';
import { extrasService, MovementsSummary } from '../../../services/extrasService';
import { ExportService } from '../../../services/exportService';
import { useNotifications } from '../../../contexts/NotificationContext';
import EmployeeExtrasModal from './EmployeeExtrasModal';
import EmployeeMovementsTable from './EmployeeMovementsTable';

interface EmployeeExtrasViewProps {
  employeeId: string;
  employee?: any;
  onBack: () => void;
}

const EmployeeExtrasView: React.FC<EmployeeExtrasViewProps> = ({ 
  employeeId, 
  employee,
  onBack 
}) => {
  const [loading, setLoading] = useState(true);
  const [movementsData, setMovementsData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<MovementsSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: '',
    label: 'Esta semana (Lun-Dom)'
  });
  const { showNotification } = useNotifications();

  // Cargar datos de movimientos y resumen
  const loadExtrasData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos de extras para empleado:', employeeId);

      // Obtener resumen de movimientos
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const startDate = selectedDateRange.startDate || thirtyDaysAgo.toISOString().split('T')[0];
      const endDate = selectedDateRange.endDate || today.toISOString().split('T')[0];

      const summary = await extrasService.getMovementsSummary(employeeId, startDate, endDate);
      console.log('📊 Resumen de movimientos cargado:', summary);

      // Obtener movimientos individuales
      const movements = await extrasService.getMovements(employeeId, {
        startDate,
        endDate,
        limit: 100
      });
      console.log('📋 Movimientos cargados:', movements);

      setSummaryData(summary);
      setMovementsData(movements);
    } catch (error) {
      console.error('❌ Error cargando datos de extras:', error);
      showNotification('Error cargando datos de extras', 'error');
    } finally {
      setLoading(false);
    }
  }, [employeeId, selectedDateRange, showNotification]);

  useEffect(() => {
    loadExtrasData();
  }, [loadExtrasData]);

  const handleNewMovement = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Recargar datos después de cerrar el modal
    loadExtrasData();
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      await ExportService.export(movementsData, format, {
        filename: `movimientos_${employee?.personalInfo?.firstName || 'empleado'}_${new Date().toISOString().split('T')[0]}`,
        title: 'Movimientos de Empleado'
      });
      showNotification(`Datos exportados exitosamente en formato ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('❌ Error exportando datos:', error);
      showNotification('Error al exportar datos', 'error');
    }
  };

  // Calcular métricas para las tarjetas
  const calculateMetrics = () => {
    if (!summaryData) {
      return {
        totalOvertimeHours: 0,
        totalOvertimeAmount: 0,
        totalMovements: 0,
        pendingMovements: 0
      };
    }

    const overtime = summaryData.byType?.overtime || { count: 0, total: 0, hours: 0 };
    const totalMovements = Object.values(summaryData.byType || {}).reduce((sum: number, type: any) => sum + (type.count || 0), 0);
    
    return {
      totalOvertimeHours: overtime.hours || 0,
      totalOvertimeAmount: overtime.total || 0,
      totalMovements,
      pendingMovements: movementsData.filter(m => m.status === 'pending').length
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de extras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del empleado */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Extras y Asistencia
            </h2>
            <p className="text-gray-600">
              {employee?.personalInfo?.firstName} {employee?.personalInfo?.lastName} - {employee?.position?.title}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Compartir</span>
            </button>
            <select 
              value={selectedDateRange.label}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'Esta semana (Lun-Dom)') {
                  const today = new Date();
                  const monday = new Date(today);
                  monday.setDate(today.getDate() - today.getDay() + 1);
                  const sunday = new Date(monday);
                  sunday.setDate(monday.getDate() + 6);
                  
                  setSelectedDateRange({
                    startDate: monday.toISOString().split('T')[0],
                    endDate: sunday.toISOString().split('T')[0],
                    label: value
                  });
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Esta semana (Lun-Dom)">Esta semana (Lun-Dom)</option>
              <option value="Este mes">Este mes</option>
              <option value="Últimos 30 días">Últimos 30 días</option>
            </select>
            <button 
              onClick={handleNewMovement}
              className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Extra</span>
            </button>
            <button 
              onClick={() => handleExport('excel')}
              className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Días Presentes */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Días Presentes</p>
                <p className="text-2xl font-bold text-green-600">{metrics.totalMovements}</p>
                <p className="text-xs text-gray-500">movimientos registrados</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Horas Totales */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Extra</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.totalOvertimeHours}h</p>
                <p className="text-xs text-gray-500">Este período</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Horas Extra */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Extra</p>
                <p className="text-2xl font-bold text-orange-600">${metrics.totalOvertimeAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Total acumulado</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Puntualidad */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.pendingMovements}</p>
                <p className="text-xs text-gray-500">Por aprobar</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de movimientos */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Registro de Movimientos</h3>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <span>Salario base: ${employee?.salary?.baseSalary?.toLocaleString() || '0.00'}</span>
            <span>|</span>
            <span>Por día: ${((employee?.salary?.baseSalary || 0) / 30).toFixed(2)}</span>
            <span>|</span>
            <span>Por hora: ${((employee?.salary?.baseSalary || 0) / (30 * 8)).toFixed(2)}</span>
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Total a Sumar</p>
                <p className="text-lg font-bold text-green-600">${(summaryData?.totalToAdd || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Total a Restar</p>
                <p className="text-lg font-bold text-red-600">${(summaryData?.totalToSubtract || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Salario Neto</p>
                <p className="text-lg font-bold text-blue-600">${(summaryData?.netImpact || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar movimientos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Todos los tipos</span>
            </button>
            <button 
              onClick={() => handleExport('excel')}
              className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Tabla */}
        <EmployeeMovementsTable 
          movements={movementsData}
          onRefresh={loadExtrasData}
        />
      </div>

      {/* Modal para registrar nuevo movimiento */}
      <EmployeeExtrasModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        employeeId={employeeId}
        employee={employee}
      />
    </div>
  );
};

export default EmployeeExtrasView;
