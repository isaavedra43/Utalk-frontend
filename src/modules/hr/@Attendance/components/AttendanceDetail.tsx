// ============================================================================
// DETALLE DE REPORTE DE ASISTENCIA
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Download,
  Printer,
  Share,
  Calendar
} from 'lucide-react';
import { attendanceService } from '../attendanceService';
import { AttendanceDetailResponse, EmployeeAttendance } from '../types';
import { ExportModal } from './ExportModal';

// Tipos temporales para manejar la respuesta del backend
interface BackendResponse {
  success: boolean;
  data: {
    report: unknown;
    records: unknown[];
    stats: unknown;
    movements?: unknown[];
    exceptions?: unknown[];
  };
}

interface EmployeeRecord {
  employeeId: string;
  status: string;
  clockIn?: string;
  clockOut?: string;
  totalHours?: number;
  overtimeHours?: number;
  breakHours?: number;
  notes?: string;
  employeeName?: string;
  employeeNumber?: string;
  department?: string;
  movements?: unknown[];
}

interface ExceptionRecord {
  id: string;
  description: string;
  time?: string;
  severity: string;
  resolved: boolean;
}
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceStatsComponent } from './AttendanceStats';
import { formatDate, formatTime, formatHours } from '@/utils/dateUtils';

interface AttendanceDetailProps {
  reportId: string;
  onBack: () => void;
}

export const AttendanceDetail: React.FC<AttendanceDetailProps> = ({
  reportId,
  onBack
}: AttendanceDetailProps) => {
  console.log('🔍 AttendanceDetail - Iniciando componente con reportId:', reportId);
  
  const [data, setData] = useState<AttendanceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  useEffect(() => {
    loadReportDetail();
  }, [reportId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReportDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 AttendanceDetail - Cargando detalle para reportId:', reportId);
      
      // 1. Obtener el detalle del reporte
      const response = await attendanceService.getReportDetail(reportId);
      console.log('✅ AttendanceDetail - Respuesta recibida:', response);
      
      // El backend ya devuelve los datos completos con nombres de empleados
      // Según los logs: { success: true, data: { report: {...}, records: [...], stats: {...} } }
      if (response && (response as unknown as BackendResponse).data) {
        const backendData = (response as unknown as BackendResponse).data;
        
        console.log('🔍 AttendanceDetail - Usando datos directos del backend (ya incluyen nombres completos)');
        
        const transformedData = {
          report: backendData.report,
          employees: backendData.records || [], // Los records ya vienen con employeeName completo
          stats: backendData.stats || {},
          movements: backendData.movements || [],
          exceptions: backendData.exceptions || []
        };
        console.log('🔄 AttendanceDetail - Datos del backend (nombres completos incluidos):', transformedData);
        setData(transformedData);
      } else if (response && response.report) {
        // Si la respuesta ya tiene la estructura esperada
        console.log('🔄 AttendanceDetail - Usando datos directos:', response);
        setData(response);
      } else {
        console.warn('⚠️ AttendanceDetail - Respuesta inválida:', response);
        setError('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('❌ AttendanceDetail - Error cargando detalle:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar detalle';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===== FUNCIONES DE MANEJO DE BOTONES =====

  const handleShare = () => {
    console.log('🔗 Compartir reporte:', reportId);
    try {
      // Crear URL para compartir
      const shareUrl = `${window.location.origin}/hr/attendance/reports/${reportId}`;
      
      // Copiar URL al portapapeles
      navigator.clipboard.writeText(shareUrl).then(() => {
        console.log('✅ URL copiada al portapapeles:', shareUrl);
        // Aquí podrías mostrar un toast de confirmación
      }).catch((err) => {
        console.error('❌ Error copiando URL:', err);
      });
    } catch (error) {
      console.error('❌ Error en handleShare:', error);
    }
  };

  // Función utilitaria para descargar archivos
  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    console.log('📄 Exportando reporte como PDF:', reportId);
    try {
      const blob = await attendanceService.exportReportAsPdf(reportId, {
        creator: data?.report.createdBy || 'Sistema',
        approver: data?.report.approvedBy || 'Pendiente',
        mobileOptimized: true
      });
      
      const filename = `reporte-asistencia-${data?.report.date || reportId}.pdf`;
      downloadFile(blob, filename);
      console.log('✅ PDF exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando PDF:', error);
      throw error;
    }
  };

  const handleExportExcel = async () => {
    console.log('📊 Exportando reporte como Excel:', reportId);
    try {
      const blob = await attendanceService.exportReportAsExcel(reportId, {
        creator: data?.report.createdBy || 'Sistema',
        approver: data?.report.approvedBy || 'Pendiente'
      });
      
      const filename = `reporte-asistencia-${data?.report.date || reportId}.xlsx`;
      downloadFile(blob, filename);
      console.log('✅ Excel exportado exitosamente');
    } catch (error) {
      console.error('❌ Error exportando Excel:', error);
      throw error;
    }
  };

  const handleExportImage = async () => {
    console.log('🖼️ Exportando reporte como imagen:', reportId);
    try {
      const blob = await attendanceService.exportReportAsImage(reportId, {
        creator: data?.report.createdBy || 'Sistema',
        approver: data?.report.approvedBy || 'Pendiente',
        format: 'png'
      });
      
      const filename = `reporte-asistencia-${data?.report.date || reportId}.png`;
      downloadFile(blob, filename);
      console.log('✅ Imagen exportada exitosamente');
    } catch (error) {
      console.error('❌ Error exportando imagen:', error);
      throw error;
    }
  };

  const handlePrint = () => {
    console.log('🖨️ Imprimir reporte:', reportId);
    try {
      // Usar la API nativa de impresión del navegador
      window.print();
    } catch (error) {
      console.error('❌ Error imprimiendo reporte:', error);
    }
  };

  const handleApprove = async () => {
    console.log('✅ Aprobar reporte:', reportId);
    try {
      if (report.status === 'approved') {
        console.log('⚠️ El reporte ya está aprobado');
        return;
      }

      // Llamar al servicio de aprobación
      const approvalData = await attendanceService.approveReport({
        reportId: reportId,
        action: 'approve',
        reason: 'Aprobado desde la vista de detalle',
        approvedBy: 'admin@company.com' // TODO: Obtener del contexto de usuario
      });
      console.log('✅ Reporte aprobado:', approvalData);
      
      // Recargar los datos del reporte para actualizar el estado
      await loadReportDetail();
      
      // Aquí podrías mostrar un toast de confirmación
    } catch (error) {
      console.error('❌ Error aprobando reporte:', error);
    }
  };

  const getStatusBadge = (status: EmployeeAttendance['status']) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Presente</Badge>;
      case 'absent':
        return <Badge variant="destructive">Ausente</Badge>;
      case 'late':
        return <Badge className="bg-orange-100 text-orange-800">Tarde</Badge>;
      case 'vacation':
        return <Badge className="bg-blue-100 text-blue-800">Vacaciones</Badge>;
      case 'sick_leave':
        return <Badge className="bg-purple-100 text-purple-800">Enfermedad</Badge>;
      case 'personal_leave':
        return <Badge className="bg-gray-100 text-gray-800">Permiso</Badge>;
      case 'maternity_leave':
        return <Badge className="bg-pink-100 text-pink-800">Maternidad</Badge>;
      case 'paternity_leave':
        return <Badge className="bg-indigo-100 text-indigo-800">Paternidad</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'overtime':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'loan':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'bonus':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'deduction':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'vacation':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'incident':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar detalle</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={loadReportDetail} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!data || !data.report) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Datos no disponibles</h3>
          <p className="text-gray-600">No se pudieron cargar los datos del reporte</p>
          <Button onClick={loadReportDetail} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const { report, employees, stats } = data;
  console.log('🔍 AttendanceDetail - Renderizando con datos:', { report: report.id, employeesCount: employees?.length || 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Reporte de Asistencia - {formatDate(report.date)}
            </h1>
            <p className="text-gray-600">
              Creado el {formatDate(report.createdAt)} • {report.status === 'approved' ? 'Aprobado' : report.status === 'completed' ? 'Completado' : 'Borrador'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleShare}
            className="hover:bg-blue-50 hover:border-blue-300"
          >
            <Share className="h-4 w-4 mr-2" />
            Compartir
          </Button>
                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={() => setExportModalOpen(true)}
                   className="hover:bg-green-50 hover:border-green-300"
                 >
                   <Download className="h-4 w-4 mr-2" />
                   Exportar
                 </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrint}
            className="hover:bg-gray-50 hover:border-gray-300"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleApprove}
            className="hover:bg-purple-50 hover:border-purple-300"
            disabled={report.status === 'approved'}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprobar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && Object.keys(stats).length > 0 && (
        <AttendanceStatsComponent stats={stats} title={`Estadísticas del ${formatDate(report.date)}`} />
      )}

      {/* Report Info */}
      {report.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notas del Reporte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{report.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalle de Empleados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Movimientos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees && employees.length > 0 ? employees.map((employee: EmployeeRecord) => (
                  <tr key={employee.employeeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.employeeName || `Empleado ${employee.employeeId.slice(0, 8)}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.employeeNumber || employee.employeeId.slice(0, 8)} • {employee.department || 'Sin departamento'}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(employee.status as EmployeeAttendance['status'])}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.clockIn && employee.clockOut ? (
                        <div>
                          <div>Entrada: {formatTime(employee.clockIn)}</div>
                          <div>Salida: {formatTime(employee.clockOut)}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {employee.totalHours ? formatHours(employee.totalHours) : '-'}
                        {employee.overtimeHours ? (
                          <div className="text-blue-600 text-xs">
                            +{formatHours(employee.overtimeHours)} extra
                          </div>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {employee.movements && employee.movements.length > 0 ? (
                          employee.movements.map((movement: unknown) => {
                            const movementData = movement as { id: string; type: string };
                            return (
                            <div
                              key={movementData.id}
                              className="flex items-center space-x-1 text-xs bg-gray-100 rounded-full px-2 py-1"
                            >
                              {getMovementIcon(movementData.type)}
                              <span>{movementData.type}</span>
                            </div>
                            );
                          })
                        ) : (
                          <span className="text-gray-500 text-sm">Sin movimientos</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No hay empleados registrados para este reporte
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Exceptions */}
      {report.exceptions && report.exceptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-orange-600">Excepciones Reportadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.exceptions.map((exception: ExceptionRecord) => (
                <div key={exception.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-gray-900">{exception.description}</p>
                      <p className="text-sm text-gray-600">
                        {exception.time && `Hora: ${exception.time}`} • Severidad: {exception.severity}
                      </p>
                    </div>
                  </div>
                  <Badge variant={exception.resolved ? 'default' : 'outline'}>
                    {exception.resolved ? 'Resuelta' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
             )}

           {/* Modal de Exportación */}
           <ExportModal
             isOpen={exportModalOpen}
             onClose={() => setExportModalOpen(false)}
             onExportPdf={handleExportPdf}
             onExportExcel={handleExportExcel}
             onExportImage={handleExportImage}
             reportData={data ? {
               date: formatDate(report.date),
               totalEmployees: employees?.length || 0,
               creator: report.createdBy,
               approver: report.approvedBy,
               status: report.status
             } : undefined}
           />
           </div>
         );
       };
