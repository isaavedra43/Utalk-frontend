// ============================================================================
// DASHBOARD DE ASISTENCIA
// ============================================================================

import React from 'react';
import { 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAttendanceDashboard } from '../hooks/useAttendanceDashboard';
import { formatDate } from '@/utils/dateUtils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface AlertCardProps {
  alert: {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
  };
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
      <div className="flex items-start">
        {getSeverityIcon(alert.severity)}
        <div className="ml-3">
          <p className="text-sm font-medium">{alert.message}</p>
        </div>
      </div>
    </div>
  );
};

const AttendanceDashboard: React.FC = () => {
  const { dashboardData, loading, error, refreshDashboard } = useAttendanceDashboard();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-800">Error cargando dashboard: {error}</p>
          </div>
          <Button 
            onClick={refreshDashboard} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  const { currentStats, generalStats, currentReport, alerts } = dashboardData;
  const totalEmployees = currentStats.presentCount + currentStats.absentCount + currentStats.lateCount;
  const attendanceRate = totalEmployees > 0 ? Math.round((currentStats.presentCount / totalEmployees) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Asistencia</h1>
          <p className="text-gray-600">
            {formatDate(dashboardData.date)}
          </p>
        </div>
        <Button onClick={refreshDashboard} variant="outline" size="sm">
          <TrendingUp className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Asistencia Hoy"
          value={`${currentStats.presentCount}/${totalEmployees}`}
          icon={Users}
          color="bg-blue-500"
          subtitle={`${attendanceRate}% de asistencia`}
        />
        
        <MetricCard
          title="Ausencias"
          value={currentStats.absentCount}
          icon={AlertCircle}
          color="bg-red-500"
          subtitle="Empleados ausentes"
        />
        
        <MetricCard
          title="Retrasos"
          value={currentStats.lateCount}
          icon={Clock}
          color="bg-yellow-500"
          subtitle="Llegadas tarde"
        />
        
        <MetricCard
          title="Horas Totales"
          value={`${generalStats.totalHours}h`}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle={`${generalStats.attendanceRate}% promedio`}
        />
      </div>

      {/* Estado del reporte actual */}
      {currentReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Reporte del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Reporte creado el {formatDate(currentReport.createdAt)}
                </p>
                <p className="text-sm text-gray-500">
                  Por: {currentReport.createdBy}
                </p>
              </div>
              <Badge 
                variant={
                  currentReport.status === 'approved' ? 'default' :
                  currentReport.status === 'completed' ? 'secondary' :
                  currentReport.status === 'rejected' ? 'destructive' : 'outline'
                }
              >
                {currentReport.status === 'approved' ? 'Aprobado' :
                 currentReport.status === 'completed' ? 'Completado' :
                 currentReport.status === 'rejected' ? 'Rechazado' : 'Borrador'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas y Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <AlertCard key={index} alert={alert} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reportes recientes */}
      {dashboardData.recentReports && dashboardData.recentReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reportes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentReports.slice(0, 5).map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{formatDate(report.date)}</p>
                    <p className="text-sm text-gray-600">
                      {report.presentCount} presentes, {report.absentCount} ausentes
                    </p>
                  </div>
                  <Badge 
                    variant={
                      report.status === 'approved' ? 'default' :
                      report.status === 'completed' ? 'secondary' :
                      report.status === 'rejected' ? 'destructive' : 'outline'
                    }
                  >
                    {report.status === 'approved' ? 'Aprobado' :
                     report.status === 'completed' ? 'Completado' :
                     report.status === 'rejected' ? 'Rechazado' : 'Borrador'}
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

export default AttendanceDashboard;
