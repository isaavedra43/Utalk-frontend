// ============================================================================
// COMPONENTE DE ESTADÍSTICAS DE ASISTENCIA
// ============================================================================

import React from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { AttendanceStats } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

interface AttendanceStatsProps {
  stats: AttendanceStats;
  title?: string;
}

export const AttendanceStatsComponent: React.FC<AttendanceStatsProps> = ({
  stats,
  title = "Estadísticas de Asistencia"
}) => {
  const attendanceRate = stats.totalEmployees > 0 ?
    (stats.presentCount / stats.totalEmployees) * 100 : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Empleados Totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          </CardContent>
        </Card>

        {/* Tasa de Asistencia */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendanceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.presentCount} de {stats.totalEmployees} presentes
            </p>
          </CardContent>
        </Card>

        {/* Horas Extra Totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Extra</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalOvertime}h</div>
          </CardContent>
        </Card>

        {/* Movimientos Totales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalMovements}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detalle de Estados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm font-medium">Presentes</div>
                <div className="text-lg font-bold text-green-600">{stats.presentCount}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-sm font-medium">Ausentes</div>
                <div className="text-lg font-bold text-red-600">{stats.absentCount}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm font-medium">Tardes</div>
                <div className="text-lg font-bold text-orange-600">{stats.lateCount}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Vacaciones</div>
                <div className="text-lg font-bold text-blue-600">{stats.vacationCount}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Enfermedad</div>
                <div className="text-lg font-bold text-purple-600">{stats.sickLeaveCount}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Permisos</div>
                <div className="text-lg font-bold text-gray-600">{stats.personalLeaveCount}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
