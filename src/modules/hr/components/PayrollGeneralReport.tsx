import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  BarChart3, 
  PieChart, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { EmployeePayrollData, PayrollPeriod, PayrollGeneralSummary } from '../../../types/payrollGeneral';

interface PayrollGeneralReportProps {
  period: PayrollPeriod;
  employees: EmployeePayrollData[];
  summary: PayrollGeneralSummary;
  onClose: () => void;
}

export const PayrollGeneralReport: React.FC<PayrollGeneralReportProps> = ({
  period,
  employees,
  summary,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'analytics'>('summary');
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte General de Nómina - ${period.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
              font-size: 12px;
            }
            .report { 
              max-width: 1000px; 
              margin: 0 auto; 
              background: white;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 20px; 
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              color: #333; 
              margin-bottom: 5px; 
            }
            .report-title { 
              font-size: 18px; 
              color: #666; 
              margin-bottom: 10px;
            }
            .period-info { 
              font-size: 14px; 
              color: #888; 
            }
            .summary-grid { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 15px; 
              margin-bottom: 30px; 
            }
            .summary-card { 
              border: 1px solid #ddd; 
              border-radius: 8px; 
              padding: 15px; 
              text-align: center; 
            }
            .summary-value { 
              font-size: 20px; 
              font-weight: bold; 
              color: #333; 
              margin-bottom: 5px; 
            }
            .summary-label { 
              font-size: 12px; 
              color: #666; 
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            .table th, .table td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            .table th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
            }
            .table tbody tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .section-title { 
              font-size: 16px; 
              font-weight: bold; 
              color: #333; 
              margin: 20px 0 10px 0; 
              padding-bottom: 5px; 
              border-bottom: 1px solid #ddd; 
            }
            .department-summary { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 15px; 
              margin-bottom: 20px; 
            }
            .department-card { 
              border: 1px solid #ddd; 
              border-radius: 8px; 
              padding: 10px; 
            }
            .department-name { 
              font-weight: bold; 
              color: #333; 
              margin-bottom: 5px; 
            }
            .department-stats { 
              font-size: 11px; 
              color: #666; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd; 
              color: #666; 
              font-size: 10px; 
            }
            @media print {
              body { margin: 0; padding: 10px; font-size: 11px; }
              .report { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      // TODO: Implementar generación de PDF del reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('PDF del reporte generado exitosamente (funcionalidad en desarrollo)');
    } catch (error) {
      alert('Error al generar PDF del reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      // TODO: Implementar exportación a Excel
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Reporte exportado a Excel exitosamente (funcionalidad en desarrollo)');
    } catch (error) {
      alert('Error al exportar a Excel');
    } finally {
      setLoading(false);
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const tabs = [
    { id: 'summary', name: 'Resumen Ejecutivo', icon: BarChart3 },
    { id: 'detailed', name: 'Detalle por Empleado', icon: Users },
    { id: 'analytics', name: 'Análisis y Gráficos', icon: PieChart }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reporte General de Nómina</h3>
              <p className="text-sm text-gray-600">{period.name} • {summary.totalEmployees} empleados</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={loading}
              className="flex items-center gap-2 text-green-600 hover:text-green-800 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Excel
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido del Reporte */}
        <div ref={reportRef} className="report p-6">
          {/* Header del Reporte (solo visible en impresión) */}
          <div className="header hidden print:block mb-8">
            <div className="company-name">Tu Empresa S.A. de C.V.</div>
            <div className="report-title">REPORTE GENERAL DE NÓMINA</div>
            <div className="period-info">
              Período: {period.name} | {formatDate(period.startDate)} - {formatDate(period.endDate)}
            </div>
          </div>

          {activeTab === 'summary' && (
            <div className="summary-tab">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen Ejecutivo</h2>
              
              {/* Métricas Principales */}
              <div className="summary-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="summary-card bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="summary-value text-2xl font-bold text-blue-900">{summary.totalEmployees}</div>
                  <div className="summary-label text-blue-700">Total Empleados</div>
                </div>
                
                <div className="summary-card bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="summary-value text-2xl font-bold text-green-900">{formatCurrency(summary.totalNetPay)}</div>
                  <div className="summary-label text-green-700">Nómina Total</div>
                </div>
                
                <div className="summary-card bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-3" />
                  <div className="summary-value text-2xl font-bold text-red-900">{formatCurrency(summary.totalDeductions)}</div>
                  <div className="summary-label text-red-700">Total Deducciones</div>
                </div>
                
                <div className="summary-card bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="summary-value text-2xl font-bold text-purple-900">{formatCurrency(summary.averageSalary)}</div>
                  <div className="summary-label text-purple-700">Promedio Salarial</div>
                </div>
              </div>

              {/* Resumen por Departamento */}
              <div className="section-title text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                <Building className="w-5 h-5 inline-block mr-2" />
                Resumen por Departamento
              </div>
              <div className="department-summary grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {summary.departmentBreakdown.map((dept) => (
                  <div key={dept.department} className="department-card border border-gray-200 rounded-lg p-4">
                    <div className="department-name font-semibold text-gray-900 mb-2">{dept.department}</div>
                    <div className="department-stats space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Empleados:</span>
                        <span className="font-medium text-gray-900">{dept.employees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(dept.totalPay)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Promedio:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(dept.totalPay / dept.employees)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Estado de Pagos */}
              <div className="section-title text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                Estado de Pagos
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-yellow-900">{summary.statusBreakdown.pending}</div>
                  <div className="text-yellow-700">Pendientes</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-900">{summary.statusBreakdown.approved}</div>
                  <div className="text-blue-700">Aprobados</div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-900">{summary.statusBreakdown.paid}</div>
                  <div className="text-green-700">Pagados</div>
                </div>
              </div>

              {/* Información del Período */}
              <div className="section-title text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">
                <Calendar className="w-5 h-5 inline-block mr-2" />
                Información del Período
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Período</div>
                    <div className="font-semibold text-gray-900">{period.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Fecha Inicio</div>
                    <div className="font-semibold text-gray-900">{formatDate(period.startDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Fecha Fin</div>
                    <div className="font-semibold text-gray-900">{formatDate(period.endDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Estado</div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      period.status === 'completed' ? 'bg-green-100 text-green-800' :
                      period.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      period.status === 'paid' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {period.status === 'completed' ? 'Completado' :
                       period.status === 'processing' ? 'Procesando' :
                       period.status === 'paid' ? 'Pagado' :
                       'Borrador'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="detailed-tab">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalle por Empleado</h2>
              
              <div className="overflow-x-auto">
                <table className="table w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empleado
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Departamento
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Días Trab.
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percepciones
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deducciones
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Neto
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {employees.map((employee, index) => (
                      <tr key={employee.employeeId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                            <div className="text-xs text-gray-500">{employee.employeeNumber}</div>
                            <div className="text-xs text-gray-400">{employee.position}</div>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          {employee.department}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="text-sm text-gray-900">
                            <div>{employee.workedDays}/{employee.workDays}</div>
                            {employee.absentDays > 0 && (
                              <div className="text-xs text-red-600">Faltas: {employee.absentDays}</div>
                            )}
                            {employee.overtime > 0 && (
                              <div className="text-xs text-blue-600">Extras: {employee.overtime}h</div>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(employee.totalPerceptions)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Base: {formatCurrency(employee.basePay)}
                          </div>
                          {employee.overtimePay > 0 && (
                            <div className="text-xs text-green-600">
                              Extras: {formatCurrency(employee.overtimePay)}
                            </div>
                          )}
                          {employee.bonuses > 0 && (
                            <div className="text-xs text-green-600">
                              Bonos: {formatCurrency(employee.bonuses)}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="text-sm font-medium text-red-600">
                            {formatCurrency(employee.totalDeductions)}
                          </div>
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
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="text-sm font-bold text-blue-600">
                            {formatCurrency(employee.netPay)}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(employee.status)}
                            <span className="text-xs">
                              {employee.status === 'paid' ? 'Pagado' : 
                               employee.status === 'approved' ? 'Aprobado' : 
                               'Pendiente'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-gray-300 px-4 py-3" colSpan={3}>
                        TOTALES ({employees.length} empleados)
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-green-600">
                        {formatCurrency(employees.reduce((sum, emp) => sum + emp.totalPerceptions, 0))}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-red-600">
                        {formatCurrency(employees.reduce((sum, emp) => sum + emp.totalDeductions, 0))}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-blue-600">
                        {formatCurrency(employees.reduce((sum, emp) => sum + emp.netPay, 0))}
                      </td>
                      <td className="border border-gray-300 px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Análisis y Gráficos</h2>
              
              {/* Análisis de Distribución Salarial */}
              <div className="section-title text-lg font-bold text-gray-900 mb-4">
                Distribución Salarial por Departamento
              </div>
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="space-y-4">
                  {summary.departmentBreakdown.map((dept) => {
                    const percentage = (dept.totalPay / summary.totalNetPay) * 100;
                    return (
                      <div key={dept.department} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-gray-700">{dept.department}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-32 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(dept.totalPay)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Análisis de Asistencia */}
              <div className="section-title text-lg font-bold text-gray-900 mb-4">
                Análisis de Asistencia
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-lg font-bold text-green-900">
                    {employees.reduce((sum, emp) => sum + emp.workedDays, 0)}
                  </div>
                  <div className="text-green-700 text-sm">Total Días Trabajados</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="text-lg font-bold text-red-900">
                    {employees.reduce((sum, emp) => sum + emp.absentDays, 0)}
                  </div>
                  <div className="text-red-700 text-sm">Total Faltas</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-lg font-bold text-blue-900">
                    {employees.reduce((sum, emp) => sum + emp.overtime, 0)}h
                  </div>
                  <div className="text-blue-700 text-sm">Total Horas Extra</div>
                </div>
              </div>

              {/* Top 5 Salarios Más Altos */}
              <div className="section-title text-lg font-bold text-gray-900 mb-4">
                Top 5 Salarios Más Altos
              </div>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salario Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees
                      .sort((a, b) => b.netPay - a.netPay)
                      .slice(0, 5)
                      .map((employee, index) => (
                        <tr key={employee.employeeId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{employee.fullName}</div>
                            <div className="text-xs text-gray-500">{employee.position}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{employee.department}</td>
                          <td className="px-4 py-3 text-sm font-bold text-green-600">
                            {formatCurrency(employee.netPay)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer del Reporte (solo visible en impresión) */}
          <div className="footer hidden print:block mt-8 pt-4 border-t border-gray-200">
            <p>
              Reporte generado el {formatDate(new Date().toISOString())} | 
              Sistema de Gestión de Recursos Humanos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
