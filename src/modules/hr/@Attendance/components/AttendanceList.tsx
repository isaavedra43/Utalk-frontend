// ============================================================================
// LISTA DE REPORTES DE ASISTENCIA
// ============================================================================

import React from 'react';
import {
  Edit,
  Trash2,
  CheckCircle,
  Users,
  AlertCircle,
  Clock,
  Calendar,
  Eye,
  XCircle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { AttendanceReport, AttendancePermissions } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatHours } from '@/utils/dateUtils';

interface AttendanceListProps {
  reports: AttendanceReport[];
  permissions?: AttendancePermissions | null;
  onView: (report: AttendanceReport) => void;
  onEdit: (report: AttendanceReport) => void;
  onDelete: (reportId: string) => void;
  onApprove: (reportId: string) => void;
  onReject: (reportId: string, reason?: string) => void;
}

export const AttendanceList: React.FC<AttendanceListProps> = ({
  reports,
  permissions,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject
}: AttendanceListProps) => {
  console.log('🔍 AttendanceList - Renderizando con:', {
    reportsCount: reports?.length || 0,
    hasPermissions: !!permissions,
    reports: reports
  });

  const getStatusBadge = (status: AttendanceReport['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Borrador</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Completado</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: AttendanceReport['status']) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!reports || reports.length === 0) {
    console.log('📋 AttendanceList - Sin reportes para mostrar');
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay reportes de asistencia</h3>
        <p className="text-gray-600">
          Crea tu primer reporte de asistencia para comenzar a llevar el control.
        </p>
      </div>
    );
  }

  console.log('📋 AttendanceList - Renderizando tabla con', reports.length, 'reportes');

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Empleados
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asistencia
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Horas Extra
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Movimientos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reports.map((report: AttendanceReport) => {
            try {
              if (!report || !report.id) {
                console.warn('⚠️ AttendanceList - Reporte inválido:', report);
                return null;
              }
              
              return (
            <tr key={report.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(report.date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Creado: {formatDate(report.createdAt)}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getStatusIcon(report.status)}
                  <span className="ml-2">{getStatusBadge(report.status)}</span>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{report.totalEmployees}</span>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-600">{report.presentCount} presentes</span>
                  </div>
                  {report.absentCount > 0 && (
                    <div className="flex items-center text-sm">
                      <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                      <span className="text-red-600">{report.absentCount} ausentes</span>
                    </div>
                  )}
                  {report.lateCount > 0 && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 text-orange-500 mr-1" />
                      <span className="text-orange-600">{report.lateCount} tardes</span>
                    </div>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatHours(report.overtimeHours)}
                </div>
                {report.totalHours > 0 && (
                  <div className="text-xs text-gray-500">
                    Total: {formatHours(report.totalHours)}
                  </div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-1">
                  {report.exceptions && report.exceptions.length > 0 && (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      {report.exceptions.length} excepciones
                    </Badge>
                  )}
                  {report.movements && report.movements.length > 0 && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {report.movements.length} movimientos
                    </Badge>
                  )}
                  {(!report.exceptions || report.exceptions.length === 0) && 
                   (!report.movements || report.movements.length === 0) && (
                    <span className="text-sm text-gray-400">Sin movimientos</span>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  {/* Botón Ver - Siempre visible */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(report)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {/* Botón Editar - Siempre visible si tiene permisos */}
                  {permissions?.canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(report)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Editar reporte"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Botones de Aprobación - Solo para reportes completados */}
                  {report.status === 'completed' && permissions?.canApprove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onApprove(report.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Aprobar reporte"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Botón Rechazar - Solo para reportes completados */}
                  {report.status === 'completed' && permissions?.canReject && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReject(report.id)}
                      className="text-orange-600 hover:text-orange-900"
                      title="Rechazar reporte"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Botón Eliminar - Solo para administradores */}
                  {permissions?.canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(report.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar reporte"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
              );
            } catch (rowError) {
              console.error('❌ AttendanceList - Error al renderizar fila:', report, rowError);
              return null;
            }
          })}
        </tbody>
      </table>
    </div>
  );
};
