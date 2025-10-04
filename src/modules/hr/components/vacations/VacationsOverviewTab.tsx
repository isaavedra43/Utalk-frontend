import React from 'react';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Activity,
  Target,
  Award,
  Zap
} from 'lucide-react';
import {
  VacationDashboard,
  VacationSummary,
  VacationAlert
} from '../../../../services/vacationsManagementService';

// ============================================================================
// TYPES
// ============================================================================

interface VacationsOverviewTabProps {
  dashboard: VacationDashboard | null;
  summary: VacationSummary | null;
  alerts: VacationAlert[];
  loading: {
    dashboard: boolean;
    summary: boolean;
    alerts: boolean;
  };
  errors: {
    dashboard: string | null;
    summary: string | null;
    alerts: string | null;
  };
}

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray';
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  loading = false
}) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700'
  };

  const iconColors = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
    gray: 'text-gray-600 bg-gray-100'
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} ${loading ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-1">
            {loading ? '...' : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center space-x-1 mt-2 text-xs ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{trend.value}% {trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconColors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// RECENT ACTIVITY COMPONENT
// ============================================================================

interface RecentActivityProps {
  activities: VacationDashboard['recentActivity'];
  loading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading = false }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'request_created': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'request_approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'request_rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'payment_processed': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'conflict_resolved': return <CheckCircle className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'request_created': return 'bg-blue-50 border-blue-200';
      case 'request_approved': return 'bg-green-50 border-green-200';
      case 'request_rejected': return 'bg-red-50 border-red-200';
      case 'payment_processed': return 'bg-emerald-50 border-emerald-200';
      case 'conflict_resolved': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
        <p className="text-sm text-gray-600">Últimas acciones en el sistema</p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-600">
                    {activity.employeeName} • {new Date(activity.timestamp).toLocaleString('es-MX')}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  activity.type.includes('approved') || activity.type.includes('processed')
                    ? 'bg-green-100 text-green-800'
                    : activity.type.includes('rejected')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {activity.type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// UPCOMING DEADLINES COMPONENT
// ============================================================================

interface UpcomingDeadlinesProps {
  deadlines: VacationDashboard['upcomingDeadlines'];
  loading?: boolean;
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ deadlines, loading = false }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Calendar className="h-4 w-4 text-blue-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Próximos Vencimientos</h3>
        <p className="text-sm text-gray-600">Fechas límite importantes</p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : deadlines.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay vencimientos próximos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((deadline, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg border ${getPriorityColor(deadline.priority)}`}>
                {getPriorityIcon(deadline.priority)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                  <p className="text-xs text-gray-600">{deadline.employeeName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(deadline.dueDate).toLocaleDateString('es-MX')}
                  </p>
                  <p className={`text-xs ${
                    deadline.priority === 'high' ? 'text-red-600' :
                    deadline.priority === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {deadline.priority}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// DEPARTMENT STATS COMPONENT
// ============================================================================

interface DepartmentStatsProps {
  stats: VacationDashboard['departmentStats'];
  loading?: boolean;
}

const DepartmentStats: React.FC<DepartmentStatsProps> = ({ stats, loading = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Estadísticas por Departamento</h3>
        <p className="text-sm text-gray-600">Comparativa de uso de vacaciones</p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay datos de departamentos</p>
          </div>
        ) : (
          <div className="space-y-6">
            {stats.map((stat, index) => (
              <div key={stat.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{stat.department}</span>
                  <span className="text-sm text-gray-600">
                    {stat.utilizationRate.toFixed(1)}% utilizado
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      stat.utilizationRate > 80 ? 'bg-red-500' :
                      stat.utilizationRate > 60 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${stat.utilizationRate}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{stat.onVacation}</p>
                    <p>En vacaciones</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{stat.pendingRequests}</p>
                    <p>Pendientes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{stat.averageDaysPerRequest.toFixed(1)}</p>
                    <p>Promedio días</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// ACTIVE ALERTS COMPONENT
// ============================================================================

interface ActiveAlertsProps {
  alerts: VacationAlert[];
  loading?: boolean;
}

const ActiveAlerts: React.FC<ActiveAlertsProps> = ({ alerts, loading = false }) => {
  const getAlertIcon = (type: string, priority: string) => {
    const iconClass = priority === 'critical' ? 'text-red-600' :
                     priority === 'high' ? 'text-red-500' :
                     priority === 'medium' ? 'text-yellow-600' : 'text-blue-600';

    switch (type) {
      case 'conflict': return <AlertTriangle className={`h-4 w-4 ${iconClass}`} />;
      case 'policy_violation': return <XCircle className={`h-4 w-4 ${iconClass}`} />;
      case 'payment_due': return <Clock className={`h-4 w-4 ${iconClass}`} />;
      case 'approval_required': return <CheckCircle className={`h-4 w-4 ${iconClass}`} />;
      default: return <AlertCircle className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority as keyof typeof colors]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Alertas Activas</h3>
        <p className="text-sm text-gray-600">Notificaciones que requieren atención</p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay alertas activas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                {getAlertIcon(alert.type, alert.priority)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                  <p className="text-xs text-gray-600 truncate">{alert.message}</p>
                  {alert.employeeName && (
                    <p className="text-xs text-gray-500">Empleado: {alert.employeeName}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(alert.priority)}
                  <span className="text-xs text-gray-500">
                    {new Date(alert.createdAt).toLocaleDateString('es-MX')}
                  </span>
                </div>
              </div>
            ))}
            {alerts.length > 5 && (
              <div className="text-center pt-4">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Ver todas las alertas ({alerts.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VacationsOverviewTab: React.FC<VacationsOverviewTabProps> = ({
  dashboard,
  summary,
  alerts,
  loading,
  errors
}) => {
  // Calculate trends (mock data for now)
  const trends = {
    requests: { value: 12, isPositive: true, label: 'vs mes anterior' },
    utilization: { value: 5, isPositive: false, label: 'vs mes anterior' },
    payments: { value: 8, isPositive: true, label: 'vs mes anterior' }
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Empleados Totales"
          value={dashboard?.summary.totalEmployees || 0}
          subtitle="En el sistema"
          icon={Users}
          color="blue"
          loading={loading.dashboard}
        />

        <MetricCard
          title="En Vacaciones"
          value={dashboard?.summary.employeesOnVacation || 0}
          subtitle="Actualmente"
          icon={Calendar}
          color="green"
          loading={loading.dashboard}
        />

        <MetricCard
          title="Solicitudes Pendientes"
          value={dashboard?.summary.pendingRequests || 0}
          subtitle="Por aprobar"
          icon={Clock}
          color="yellow"
          loading={loading.dashboard}
        />

        <MetricCard
          title="Próximas Vacaciones"
          value={dashboard?.summary.upcomingVacations || 0}
          subtitle="En 30 días"
          icon={TrendingUp}
          color="purple"
          loading={loading.dashboard}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Días Totales Este Mes"
          value={dashboard?.summary.totalDaysThisMonth || 0}
          subtitle="Días utilizados"
          icon={Calendar}
          color="green"
          trend={trends.requests}
          loading={loading.dashboard}
        />

        <MetricCard
          title="Tasa de Utilización"
          value={`${dashboard?.summary.averageUtilization?.toFixed(1) || '0'}%`}
          subtitle="Promedio empresa"
          icon={Target}
          color="blue"
          loading={loading.dashboard}
        />

        <MetricCard
          title="Conflictos Hoy"
          value={dashboard?.summary.conflictsToday || 0}
          subtitle="Requieren atención"
          icon={AlertTriangle}
          color={dashboard?.summary.conflictsToday ? 'red' : 'green'}
          loading={loading.dashboard}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <RecentActivity
          activities={dashboard?.recentActivity || []}
          loading={loading.dashboard}
        />

        {/* Upcoming Deadlines */}
        <UpcomingDeadlines
          deadlines={dashboard?.upcomingDeadlines || []}
          loading={loading.dashboard}
        />
      </div>

      {/* Department Stats and Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DepartmentStats
          stats={dashboard?.departmentStats || []}
          loading={loading.dashboard}
        />

        <ActiveAlerts
          alerts={alerts.filter(a => !a.isResolved)}
          loading={loading.alerts}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
          <p className="text-sm text-gray-600">Operaciones frecuentes del sistema</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-green-900">Aprobar Solicitudes</p>
                <p className="text-xs text-green-700">Procesar pendientes</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900">Ver Calendario</p>
                <p className="text-xs text-blue-700">Planificación general</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-purple-900">Procesar Pagos</p>
                <p className="text-xs text-purple-700">Pagos pendientes</p>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-orange-900">Generar Reporte</p>
                <p className="text-xs text-orange-700">Análisis rápido</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationsOverviewTab;
