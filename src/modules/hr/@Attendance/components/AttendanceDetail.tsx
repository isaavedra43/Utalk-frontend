// ============================================================================
// DETALLE DE REPORTE DE ASISTENCIA
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Eye,
  Download,
  Printer,
  Mail
} from 'lucide-react';
import { attendanceService } from '../attendanceService';
import { AttendanceDetailResponse, EmployeeAttendance } from '../types';
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
}) => {
  const [data, setData] = useState<AttendanceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReportDetail();
  }, [reportId]);

  const loadReportDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceService.getReportDetail(reportId);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar detalle';
      setError(errorMessage);
      console.error('Error cargando detalle:', err);
    } finally {
      setLoading(false);
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
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'loan':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'bonus':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'deduction':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
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

  const { report, employees, stats } = data;

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
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Vista previa
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <AttendanceStatsComponent stats={stats} title={`Estadísticas del ${formatDate(report.date)}`} />

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
                {employees.map((employee) => (
                  <tr key={employee.employeeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.employeeNumber} • {employee.department}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(employee.status)}
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
                        {employee.movements.map((movement) => (
                          <div
                            key={movement.id}
                            className="flex items-center space-x-1 text-xs bg-gray-100 rounded-full px-2 py-1"
                          >
                            {getMovementIcon(movement.type)}
                            <span>{movement.type}</span>
                          </div>
                        ))}
                        {employee.movements.length === 0 && (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Exceptions */}
      {report.exceptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-orange-600">Excepciones Reportadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.exceptions.map((exception) => (
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
    </div>
  );
};
