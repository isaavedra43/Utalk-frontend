import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Calendar, 
  CheckCircle,
  AlertTriangle,
  Download,
  Search,
  Share2,
  Plus,
  X,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import EmployeeExtrasModal from './EmployeeExtrasModal';
import EmployeeMovementsTable from './EmployeeMovementsTable';
import OvertimeTable from './OvertimeTable';
import AbsencesTable from './AbsencesTable';
import LoansTable from './LoansTable';
import ErrorBoundary from './ErrorBoundary';
import { extrasService, MovementsSummary } from '../../../services/extrasService';
import employeeService from '../../../services/employeeService';
import { ExportService } from '../../../services/exportService';
import { useNotifications } from '../../../contexts/NotificationContext';

interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface EmployeeExtrasData {
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  currentPeriod: {
    totalDays: number;
    overtimeHours: number;
    averageHours: number;
  };
  overtime: any[];
  absences: any[];
  summary: {
    totalOvertime: number;
    totalVacationDays: number;
    totalSickDays: number;
  };
}

interface EmployeeExtrasViewProps {
  employeeId: string;
  employee: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
    };
    position?: {
      title?: string;
      department?: string;
    };
    contract?: {
      salary?: number;
    };
    salary?: {
      baseSalary?: number;
    };
  };
  onBack: () => void;
}

const EmployeeExtrasView: React.FC<EmployeeExtrasViewProps> = ({ 
    employeeId, 
    employee,
    onBack 
}: EmployeeExtrasViewProps) => {
  const { showSuccess, showError } = useNotifications();
  const [extrasData, setExtrasData] = useState<EmployeeExtrasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'extras' | 'overtime' | 'absences' | 'loans'>('overview');
  const [isExtrasModalOpen, setIsExtrasModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    startDate: string;
    endDate: string;
    label: string;
    type: 'current_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';
  }>({
    startDate: '',
    endDate: '',
    label: 'Esta semana',
    type: 'current_week'
  });

  // Función para obtener el lunes de una semana
  const getMondayOfWeek = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
    return new Date(date.setDate(diff));
  };

  // Función para obtener el domingo de una semana
  const getSundayOfWeek = (monday: Date): Date => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return sunday;
  };

  // Función para formatear fecha a YYYY-MM-DD
  const formatDateToISO = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Función para obtener rangos de fecha predefinidos
  const getDateRanges = useCallback(() => {
    const today = new Date();
    const currentMonday = getMondayOfWeek(new Date(today));
    const currentSunday = getSundayOfWeek(new Date(currentMonday));
    
    const lastMonday = new Date(currentMonday);
    lastMonday.setDate(currentMonday.getDate() - 7);
    const lastSunday = getSundayOfWeek(new Date(lastMonday));

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const thisYearStart = new Date(today.getFullYear(), 0, 1);
    const thisYearEnd = new Date(today.getFullYear(), 11, 31);
    
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);

    return {
      current_week: {
        startDate: formatDateToISO(currentMonday),
        endDate: formatDateToISO(currentSunday),
        label: 'Esta semana (Lun-Dom)'
      },
      last_week: {
        startDate: formatDateToISO(lastMonday),
        endDate: formatDateToISO(lastSunday),
        label: 'Semana pasada (Lun-Dom)'
      },
      this_month: {
        startDate: formatDateToISO(thisMonthStart),
        endDate: formatDateToISO(thisMonthEnd),
        label: 'Este mes'
      },
      last_month: {
        startDate: formatDateToISO(lastMonthStart),
        endDate: formatDateToISO(lastMonthEnd),
        label: 'Mes pasado'
      },
      this_year: {
        startDate: formatDateToISO(thisYearStart),
        endDate: formatDateToISO(thisYearEnd),
        label: 'Este año'
      },
      last_year: {
        startDate: formatDateToISO(lastYearStart),
        endDate: formatDateToISO(lastYearEnd),
        label: 'Año pasado'
      }
    };
  }, []);

  // Función para manejar el registro de extras
  const handleExtrasSubmit = async (data: {
    id?: string;
    type: string;
    date: string;
    amount: number;
    hours?: number;
    reason?: string;
    description?: string;
    justification?: string;
    attachments?: File[];
    status?: string;
    autoCalculated?: boolean;
    metadata?: Record<string, unknown>;
  }) => {
    console.log('📝 Registrando extra:', data);
    
    try {
      // Recargar datos para obtener información actualizada
      await loadAllData();
      
      // Forzar actualización de todas las tablas
      setRefreshKey((prev: number) => prev + 1);
      
      console.log('✅ Extra registrado exitosamente');
    } catch (error) {
      console.error('Error procesando extra:', error);
    }
  };

  // Función para cargar todos los datos
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Usar las fechas seleccionadas o calcular por defecto
      let startDate: string;
      let endDate: string;
      
      if (selectedDateRange.startDate && selectedDateRange.endDate) {
        startDate = selectedDateRange.startDate;
        endDate = selectedDateRange.endDate;
        console.log(`📅 Cargando datos para: ${selectedDateRange.label} (${startDate} - ${endDate})`);
      } else {
        // Fallback: últimos 30 días
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        endDate = today.toISOString().split('T')[0];
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
        console.log(`📅 Cargando datos por defecto: últimos 30 días (${startDate} - ${endDate})`);
      }

      console.log(`🔄 Cargando datos reales del backend para empleado: ${employeeId}`);

      // Cargar resumen de movimientos (datos reales confirmados por el monitoreo)
      const summaryResponse = await extrasService.getMovementsSummary(employeeId, startDate, endDate);
      console.log('📊 Resumen de movimientos cargado:', summaryResponse);
      
      // Extraer datos del response real según el formato del monitoreo
      // La API puede devolver datos en formato {data: {summary, employee}} o directamente {summary}
      interface ApiResponse {
        data?: {
          summary: MovementsSummary;
          employee: { id: string; name: string; baseSalary: number };
        };
      }
      
      const responseWithData = summaryResponse as MovementsSummary & ApiResponse;
      const summary = responseWithData.data?.summary || summaryResponse;
      const employeeInfo = responseWithData.data?.employee || {};

      // Crear datos de extras combinados usando datos reales
      const combinedExtrasData: EmployeeExtrasData = {
        employeeId: employeeId || 'EMP001',
        employeeName: (employeeInfo as { name?: string }).name || 
          (employee?.personalInfo?.firstName && employee?.personalInfo?.lastName 
            ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`.trim()
            : 'Empleado'),
        position: employee?.position?.title || 'Sin Puesto',
        department: employee?.position?.department || 'Sin Departamento',
        currentPeriod: {
          totalDays: 30,
          overtimeHours: summary.byType?.overtime?.hours || 0,
          averageHours: summary.byType?.overtime?.hours ? summary.byType.overtime.hours / 30 : 0
        },
        overtime: summary.byType?.overtime?.count > 0 ? [{
          id: 'ot-summary',
          date: new Date().toISOString().split('T')[0],
          hours: summary.byType.overtime.hours || 0,
          type: 'regular',
          reason: `${summary.byType.overtime.count} registros de horas extra`,
          approved: true,
          approvedBy: 'Sistema',
          approvedDate: new Date().toISOString().split('T')[0]
        }] : [],
        absences: summary.byType?.absence?.count > 0 ? [{
          id: 'abs-summary',
          date: new Date().toISOString().split('T')[0],
          type: 'sick_leave',
          reason: `${summary.byType.absence.count} ausencias registradas`,
          days: summary.byType.absence.days || 0,
          status: 'approved',
          requestedDate: new Date().toISOString().split('T')[0],
          approvedBy: 'Sistema'
        }] : [],
        summary: {
          totalOvertime: summary.byType?.overtime?.hours || 0,
          totalVacationDays: 0,
          totalSickDays: summary.byType?.absence?.days || 0
        }
      };

      console.log('✅ Datos de extras creados:', combinedExtrasData);

      setExtrasData(combinedExtrasData);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      
      // Intentar crear datos mínimos usando solo los datos del empleado que sí tenemos
      if (employee) {
        console.log('🔄 Creando datos mínimos usando información del empleado...');
        
        const minimalData: EmployeeExtrasData = {
          employeeId: employeeId || 'EMP001',
          employeeName: employee.personalInfo?.firstName && employee.personalInfo?.lastName 
            ? `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`.trim()
            : 'Empleado',
          position: employee.position?.title || 'Sin Puesto',
          department: employee.position?.department || 'Sin Departamento',
          currentPeriod: {
            totalDays: 0,
            overtimeHours: 0,
            averageHours: 0
          },
          overtime: [],
          absences: [],
          summary: {
            totalOvertime: 0,
            totalVacationDays: 0,
            totalSickDays: 0
          }
        };
        
        console.log('⚠️ Usando datos mínimos del empleado:', minimalData);
        setExtrasData(minimalData);
      } else {
        console.error('❌ No hay datos del empleado disponibles');
      }
    } finally {
      setLoading(false);
    }
  }, [employeeId, employee, selectedDateRange.startDate, selectedDateRange.endDate, selectedDateRange.label]);

  // Inicializar fechas al montar el componente
  useEffect(() => {
    const dateRanges = getDateRanges();
    setSelectedDateRange({
      startDate: dateRanges.current_week.startDate,
      endDate: dateRanges.current_week.endDate,
      label: dateRanges.current_week.label,
      type: 'current_week'
    });
  }, [getDateRanges]);

  // Cargar datos cuando cambien las fechas o el empleado
  useEffect(() => {
    if (employeeId && selectedDateRange.startDate && selectedDateRange.endDate) {
      loadAllData();
    }
  }, [employeeId, selectedDateRange.startDate, selectedDateRange.endDate, selectedDateRange.label, loadAllData]);

  // Efecto para cerrar el menú de exportación al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Función para exportar datos
  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);

      // Preparar datos para exportación basados en el tab activo
      let exportData: (string | number)[][] = [];
      let title = '';
      let filename = '';

      switch (activeTab) {
        case 'overtime':
          // Los datos de horas extra se manejan en OvertimeTable
          showError('Exportación', 'Use el botón de exportar en la tabla de horas extra');
          return;
        case 'absences':
          // Los datos de ausencias se manejan en AbsencesTable
          showError('Exportación', 'Use el botón de exportar en la tabla de ausencias');
          return;
        case 'loans':
          // Los datos de préstamos se manejan en LoansTable
          showError('Exportación', 'Use el botón de exportar en la tabla de préstamos');
          return;
        default:
          // Exportar resumen general
          exportData = [
            ['Métrica', 'Valor'],
            ['Total Horas Extra', extrasData?.summary?.totalOvertime || 0],
            ['Días de Vacaciones', extrasData?.summary?.totalVacationDays || 0],
            ['Días de Enfermedad', extrasData?.summary?.totalSickDays || 0]
          ];
          title = 'Resumen de Extras';
          filename = `resumen-extras-${new Date().toISOString().split('T')[0]}`;
      }

      const exportOptions = {
        filename,
        title,
        headers: ['Métrica', 'Valor'],
        data: exportData,
        format: format
      };

      await ExportService.export(exportOptions);
      
      showSuccess(
        'Exportación exitosa',
        `Datos de extras exportados en formato ${format.toUpperCase()}`
      );

    } catch (error) {
      console.error('Error exportando datos:', error);
      showError(
        'Error en exportación',
        'No se pudo exportar los datos de extras. Inténtalo de nuevo.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de extras...</p>
        </div>
      </div>
    );
  }

  if (!extrasData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró información</h3>
          <p className="text-gray-600">No hay datos de extras disponibles para este empleado.</p>
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
                <AlertTriangle className="h-5 w-5 text-gray-600 rotate-90" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Extras y Asistencia</h1>
                <p className="text-gray-600">{extrasData.employeeName} - {extrasData.position}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Compartir</span>
              </button>
              <button 
                onClick={() => setIsDateRangeModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>{selectedDateRange.label}</span>
                <AlertTriangle className="h-3 w-3" />
              </button>
              <button 
                onClick={() => setIsExtrasModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Registrar Extra</span>
              </button>
              <div className="relative" ref={exportMenuRef}>
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                  className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
                </button>
                
                {/* Menú desplegable de exportación */}
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span>Exportar Excel</span>
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FileText className="h-4 w-4 text-red-600" />
                      <span>Exportar PDF</span>
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>Exportar CSV</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Totales</p>
                <p className="text-2xl font-bold text-blue-600">{extrasData?.currentPeriod?.overtimeHours || 0}h</p>
                <p className="text-xs text-gray-500">Promedio: {(extrasData?.currentPeriod?.averageHours || 0).toFixed(1)}h/día</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Extra</p>
                <p className="text-2xl font-bold text-orange-600">{extrasData?.summary?.totalOvertime || 0}h</p>
                <p className="text-xs text-gray-500">Este período</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ausencias</p>
                <p className="text-2xl font-bold text-red-600">{extrasData?.summary?.totalSickDays || 0}</p>
                <p className="text-xs text-gray-500">Días registrados</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Resumen', icon: Calendar },
                { id: 'extras', label: 'Extras', icon: Plus },
                { id: 'overtime', label: 'Horas Extra', icon: Calendar },
                { id: 'absences', label: 'Ausencias', icon: AlertTriangle },
                { id: 'loans', label: 'Préstamos', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'extras' | 'overtime' | 'absences' | 'loans')}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estadísticas detalladas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Horas Extra</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Horas Extra</span>
                      <span className="font-medium text-orange-600">{extrasData.summary.totalOvertime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Promedio por Día</span>
                      <span className="font-medium text-orange-600">
                        {(() => {
                          try {
                            const totalDays = extrasData?.currentPeriod?.totalDays || 1;
                            const totalOvertime = extrasData?.summary?.totalOvertime || 0;
                            return (totalOvertime / totalDays).toFixed(1);
                          } catch {
                            return '0.0';
                          }
                        })()}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días con Extra</span>
                      <span className="font-medium text-orange-600">
                        {(() => {
                          try {
                            return extrasData?.overtime?.length || 0;
                          } catch {
                            return 0;
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Ausencias</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días de Vacaciones</span>
                      <span className="font-medium text-purple-600">{extrasData.summary.totalVacationDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días de Enfermedad</span>
                      <span className="font-medium text-orange-600">{extrasData.summary.totalSickDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Ausencias</span>
                      <span className="font-medium text-red-600">{extrasData.summary.totalSickDays}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Resumen General</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Período Actual</span>
                      <span className="font-medium text-blue-600">{selectedDateRange.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días Totales</span>
                      <span className="font-medium text-blue-600">{extrasData.currentPeriod.totalDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Promedio Horas</span>
                      <span className="font-medium text-blue-600">{extrasData.currentPeriod.averageHours.toFixed(1)}h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña de Horas Extra - Nueva Tabla */}
        {activeTab === 'overtime' && (
          <ErrorBoundary>
            <OvertimeTable
              key={`overtime-${refreshKey}`}
              employeeId={employeeId}
              employee={employee}
              onAddOvertime={() => setIsExtrasModalOpen(true)}
            />
          </ErrorBoundary>
        )}

        {/* Pestaña de Ausencias - Nueva Tabla */}
        {activeTab === 'absences' && (
          <ErrorBoundary>
            <AbsencesTable
              key={`absences-${refreshKey}`}
              employeeId={employeeId}
              employee={employee}
              onAddAbsence={() => setIsExtrasModalOpen(true)}
            />
          </ErrorBoundary>
        )}

        {/* Pestaña de Préstamos - Nueva Tabla */}
        {activeTab === 'loans' && (
          <ErrorBoundary>
            <LoansTable
              key={`loans-${refreshKey}`}
              employeeId={employeeId}
              employee={employee}
              onAddLoan={() => setIsExtrasModalOpen(true)}
            />
          </ErrorBoundary>
        )}

        {/* Pestaña de Extras - Tabla General de Movimientos */}
        {activeTab === 'extras' && (
          <ErrorBoundary>
            <EmployeeMovementsTable
              key={`movements-${refreshKey}`}
              employeeId={employeeId}
              employee={employee}
              onAddMovement={() => setIsExtrasModalOpen(true)}
            />
          </ErrorBoundary>
        )}
      </div>

      {/* Modal de Extras */}
      <EmployeeExtrasModal
        isOpen={isExtrasModalOpen}
        onClose={() => setIsExtrasModalOpen(false)}
        onSubmit={handleExtrasSubmit}
        employeeId={employeeId}
        employeeSalary={(() => {
          try {
            return employee?.contract?.salary || employee?.salary?.baseSalary || 25000;
          } catch {
            return 25000;
          }
        })()}
        employeeName={(() => {
          try {
            if (extrasData?.employeeName) return extrasData.employeeName;
            if (employee?.personalInfo?.firstName && employee?.personalInfo?.lastName) {
              return `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`.trim();
            }
            return 'Empleado';
          } catch {
            return 'Empleado';
          }
        })()}
      />
    </div>
  );
};

export { EmployeeExtrasView };
export default EmployeeExtrasView;
