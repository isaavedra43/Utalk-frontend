import React, { useState, useEffect } from 'react';
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
  Printer
} from 'lucide-react';
import { 
  PayrollPeriod, 
  EmployeePayrollData, 
  PayrollGeneralSummary, 
  PayrollGeneralFilters,
  PayrollVoucher 
} from '../../../types/payrollGeneral';
import { PayrollPeriodModal } from './PayrollPeriodModal';
import { PayrollVoucherModal } from './PayrollVoucherModal';
import { PayrollGeneralReport } from './PayrollGeneralReport';

export const PayrollGeneralModule: React.FC = () => {
  const [currentPeriod, setCurrentPeriod] = useState<PayrollPeriod | null>(null);
  const [employeePayrolls, setEmployeePayrolls] = useState<EmployeePayrollData[]>([]);
  const [summary, setSummary] = useState<PayrollGeneralSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modales
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePayrollData | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState<PayrollGeneralFilters>({
    department: 'all',
    status: 'all',
    search: '',
  });
  
  // Selección múltiple
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadPayrollData();
  }, [currentPeriod]);

  const loadPayrollData = async () => {
    if (!currentPeriod) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Conectar con API real
      // const response = await payrollGeneralService.getPayrollByPeriod(currentPeriod.id);
      // const extrasResponse = await payrollGeneralService.getAllExtrasForPeriod(currentPeriod.id);
      
      // Datos de ejemplo con extras reales del período
      const mockData: EmployeePayrollData[] = [
        {
          employeeId: '1',
          employeeNumber: 'EMP241001',
          fullName: 'Juan Pérez García',
          position: 'Desarrollador Senior',
          department: 'Tecnología',
          avatar: '/avatars/juan.jpg',
          baseSalary: 50000,
          dailySalary: 1666.67,
          hourlyRate: 208.33,
          workDays: 22,
          workedDays: 20,
          absentDays: 2,
          lateArrivals: 1,
          overtime: 1.5, // 1.5 horas extra del período
          basePay: 33333.33, // 20 días trabajados * 1666.67
          overtimePay: 312.50, // 1.5h * 208.33/h
          bonuses: 0,
          allowances: 0,
          totalPerceptions: 33645.83,
          // Deducciones basadas en extras reales (sin impuestos)
          loans: 83.33, // Pago mensual de préstamo
          advances: 0,
          absenceDeductions: 3333.34, // 2 días faltados * 1666.67
          otherDeductions: 0,
          totalDeductions: 3416.67,
          netPay: 30229.16,
          status: 'pending',
          extras: {
            overtime: [
              {
                id: '1',
                date: '2024-09-12',
                description: 'Trabajo extra en proyecto urgente',
                hours: 1.5,
                hourlyRate: 208.33,
                totalAmount: 312.50,
                status: 'approved',
                type: 'regular'
              }
            ],
            absences: [
              {
                id: '1',
                date: '2024-09-12',
                description: 'Falta sin justificar',
                days: 2,
                dailyRate: 1666.67,
                totalAmount: 3333.34,
                status: 'approved',
                type: 'unpaid'
              }
            ],
            loans: [
              {
                id: '1',
                date: '2024-09-12',
                description: 'Préstamo personal',
                monthlyPayment: 83.33,
                status: 'active',
                remainingAmount: 2000
              }
            ],
            advances: []
          }
        },
        {
          employeeId: '2',
          employeeNumber: 'EMP241002',
          fullName: 'María López Hernández',
          position: 'Contadora',
          department: 'Finanzas',
          baseSalary: 40000,
          dailySalary: 1333.33,
          hourlyRate: 166.67,
          workDays: 22,
          workedDays: 22,
          absentDays: 0,
          lateArrivals: 0,
          overtime: 0,
          basePay: 40000, // 22 días trabajados * 1333.33 (redondeado)
          overtimePay: 0,
          bonuses: 0,
          allowances: 0,
          totalPerceptions: 40000,
          // Sin deducciones por extras
          loans: 0,
          advances: 0,
          absenceDeductions: 0,
          otherDeductions: 0,
          totalDeductions: 0,
          netPay: 40000,
          status: 'approved',
          extras: {
            overtime: [],
            absences: [],
            loans: [],
            advances: []
          }
        }
      ];
      
      setEmployeePayrolls(mockData);
      
      // Calcular resumen
      const mockSummary: PayrollGeneralSummary = {
        totalEmployees: mockData.length,
        totalGrossPay: mockData.reduce((sum, emp) => sum + emp.totalPerceptions, 0),
        totalDeductions: mockData.reduce((sum, emp) => sum + emp.totalDeductions, 0),
        totalNetPay: mockData.reduce((sum, emp) => sum + emp.netPay, 0),
        totalAbsences: mockData.reduce((sum, emp) => sum + emp.absentDays, 0),
        totalLoans: mockData.reduce((sum, emp) => sum + emp.loans, 0),
        averageSalary: mockData.reduce((sum, emp) => sum + emp.netPay, 0) / mockData.length,
        departmentBreakdown: [
          { department: 'Tecnología', employees: 1, totalPay: 30229.16 },
          { department: 'Finanzas', employees: 1, totalPay: 40000 }
        ],
        statusBreakdown: {
          pending: mockData.filter(emp => emp.status === 'pending').length,
          approved: mockData.filter(emp => emp.status === 'approved').length,
          paid: mockData.filter(emp => emp.status === 'paid').length
        }
      };
      
      setSummary(mockSummary);
      
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos de nómina');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePeriod = async (periodData: Partial<PayrollPeriod>) => {
    try {
      setLoading(true);
      
      // TODO: Conectar con API
      // const response = await payrollGeneralService.createPeriod(periodData);
      
      // Mock de creación exitosa
      const newPeriod: PayrollPeriod = {
        id: Date.now().toString(),
        name: periodData.name!,
        startDate: periodData.startDate!,
        endDate: periodData.endDate!,
        frequency: periodData.frequency!,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setCurrentPeriod(newPeriod);
      setShowPeriodModal(false);
      
    } catch (err: any) {
      setError(err.message || 'Error al crear período');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    if (!currentPeriod) return;
    
    try {
      setLoading(true);
      
      // TODO: Conectar con API para procesar nómina
      // await payrollGeneralService.processPayroll(currentPeriod.id);
      
      // Mock de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentPeriod({
        ...currentPeriod,
        status: 'processing'
      });
      
    } catch (err: any) {
      setError(err.message || 'Error al procesar nómina');
    } finally {
      setLoading(false);
    }
  };

  const handleViewVoucher = (employee: EmployeePayrollData) => {
    setSelectedEmployee(employee);
    setShowVoucherModal(true);
  };

  const handleSelectEmployee = (employeeId: string, selected: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (selected) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
    setSelectAll(newSelected.size === employeePayrolls.length);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEmployees(new Set(employeePayrolls.map(emp => emp.employeeId)));
    } else {
      setSelectedEmployees(new Set());
    }
    setSelectAll(selected);
  };

  const getStatusIcon = (status: EmployeePayrollData['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approved':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: EmployeePayrollData['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const filteredEmployees = employeePayrolls.filter(employee => {
    const matchesSearch = !filters.search || 
      employee.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.employeeNumber.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDepartment = !filters.department || filters.department === 'all' || 
      employee.department === filters.department;
    
    const matchesStatus = !filters.status || filters.status === 'all' || 
      employee.status === filters.status;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  if (!currentPeriod) {
    return (
      <div className="payroll-general-module">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nómina General</h1>
            <p className="text-gray-600">Gestión completa de nómina para todos los empleados</p>
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
          <button
            onClick={() => setShowPeriodModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Configurar Período de Nómina
          </button>
        </div>

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

  return (
    <div className="payroll-general-module">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nómina General</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-gray-600">Período actual:</span>
            <span className="font-semibold text-blue-600">{currentPeriod.name}</span>
            <span className="text-sm text-gray-500">
              ({new Date(currentPeriod.startDate).toLocaleDateString('es-MX')} - {new Date(currentPeriod.endDate).toLocaleDateString('es-MX')})
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              currentPeriod.status === 'completed' ? 'bg-green-100 text-green-800' :
              currentPeriod.status === 'processing' ? 'bg-blue-100 text-blue-800' :
              currentPeriod.status === 'paid' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentPeriod.status === 'completed' ? 'Completado' :
               currentPeriod.status === 'processing' ? 'Procesando' :
               currentPeriod.status === 'paid' ? 'Pagado' :
               'Borrador'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPeriodModal(true)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configurar Período
          </button>
          
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Reporte General
          </button>
          
          <button
            onClick={handleProcessPayroll}
            disabled={loading || currentPeriod.status !== 'draft'}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <DollarSign className="w-4 h-4" />
            )}
            Procesar Nómina
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalEmployees}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nómina Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalNetPay)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deducciones</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalDeductions)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio Salarial</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.averageSalary)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar empleado o número..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los departamentos</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Ventas">Ventas</option>
                <option value="RRHH">RRHH</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="paid">Pagado</option>
              </select>
            </div>
          </div>
          
          {selectedEmployees.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedEmployees.size} empleado(s) seleccionado(s)
              </span>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                <Printer className="w-4 h-4" />
                Imprimir Vales
              </button>
              <button className="flex items-center gap-2 text-green-600 hover:text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                <CheckCircle className="w-4 h-4" />
                Aprobar Seleccionados
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Employee Payroll Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Nómina de Empleados ({filteredEmployees.length})
          </h3>
        </div>

        {loading && employeePayrolls.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando nómina...</p>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay empleados que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asistencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percepciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deducciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Neto a Pagar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.employeeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(employee.employeeId)}
                        onChange={(e) => handleSelectEmployee(employee.employeeId, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {employee.avatar ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={employee.avatar} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {employee.fullName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                          <div className="text-sm text-gray-500">{employee.employeeNumber}</div>
                          <div className="text-xs text-gray-400">{employee.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Trabajados: {employee.workedDays}/{employee.workDays}</div>
                        <div className="text-red-600">Faltas: {employee.absentDays}</div>
                        <div className="text-blue-600">Extras: {employee.overtime}h</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{formatCurrency(employee.totalPerceptions)}</div>
                        <div className="text-xs text-gray-500">
                          Base: {formatCurrency(employee.basePay)}
                        </div>
                        {employee.overtimePay > 0 && (
                          <div className="text-xs text-green-600">
                            +Extras: {formatCurrency(employee.overtimePay)}
                          </div>
                        )}
                        {employee.bonuses > 0 && (
                          <div className="text-xs text-green-600">
                            +Bonos: {formatCurrency(employee.bonuses)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium text-red-600">{formatCurrency(employee.totalDeductions)}</div>
                        {employee.absenceDeductions > 0 && (
                          <div className="text-xs text-red-600">
                            Faltas: {formatCurrency(employee.absenceDeductions)}
                          </div>
                        )}
                        {employee.loans > 0 && (
                          <div className="text-xs text-orange-600">
                            Préstamos: {formatCurrency(employee.loans)}
                          </div>
                        )}
                        {employee.advances > 0 && (
                          <div className="text-xs text-orange-600">
                            Adelantos: {formatCurrency(employee.advances)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(employee.netPay)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(employee.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                          {employee.status === 'paid' ? 'Pagado' : 
                           employee.status === 'approved' ? 'Aprobado' : 
                           'Pendiente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewVoucher(employee)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Ver Vale"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Imprimir Vale"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales */}
      {showPeriodModal && (
        <PayrollPeriodModal
          period={currentPeriod}
          onClose={() => setShowPeriodModal(false)}
          onSubmit={handleCreatePeriod}
          loading={loading}
        />
      )}

      {showVoucherModal && selectedEmployee && (
        <PayrollVoucherModal
          employee={selectedEmployee}
          period={currentPeriod}
          onClose={() => setShowVoucherModal(false)}
        />
      )}

      {showReportModal && summary && (
        <PayrollGeneralReport
          period={currentPeriod}
          employees={employeePayrolls}
          summary={summary}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
