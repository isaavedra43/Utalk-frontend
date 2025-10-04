import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Building,
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
  Activity,
  Zap,
  Award,
  Lightbulb
} from 'lucide-react';
import { useVacationsManagement } from '../../../../hooks/useVacationsManagement';
import { useNotifications } from '../../../../contexts/NotificationContext';
import {
  VacationAnalytics,
  VacationFilters
} from '../../../../services/vacationsManagementService';

// ============================================================================
// TYPES
// ============================================================================

interface VacationsAnalyticsTabProps {}

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
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
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700'
  };

  const iconColors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
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
// DEPARTMENT CHART COMPONENT
// ============================================================================

interface DepartmentChartProps {
  data: VacationAnalytics['byDepartment'];
  loading?: boolean;
}

const DepartmentChart: React.FC<DepartmentChartProps> = ({ data, loading = false }) => {
  const maxValue = Math.max(...data.map(d => d.totalDays));

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Uso por Departamento</h3>
        <p className="text-sm text-gray-600">Días de vacaciones utilizados</p>
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
        ) : (
          <div className="space-y-4">
            {data.map((dept, index) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{dept.department}</span>
                  <span className="text-sm text-gray-600">
                    {dept.totalDays} días • {dept.utilizationRate.toFixed(1)}% uso
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      dept.utilizationRate > 80 ? 'bg-red-500' :
                      dept.utilizationRate > 60 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(dept.totalDays / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{dept.totalRequests}</p>
                    <p>Solicitudes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{dept.averageDaysPerRequest.toFixed(1)}</p>
                    <p>Promedio días</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{dept.employees}</p>
                    <p>Empleados</p>
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
// TYPE DISTRIBUTION CHART COMPONENT
// ============================================================================

interface TypeDistributionChartProps {
  data: VacationAnalytics['byType'];
  loading?: boolean;
}

const TypeDistributionChart: React.FC<TypeDistributionChartProps> = ({ data, loading = false }) => {
  const total = Object.values(data).reduce((sum, type) => sum + type.count, 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return '#3B82F6'; // blue
      case 'personal': return '#8B5CF6'; // purple
      case 'sick_leave': return '#EF4444'; // red
      case 'maternity': return '#F59E0B'; // yellow
      case 'paternity': return '#10B981'; // green
      case 'unpaid': return '#6B7280'; // gray
      case 'compensatory': return '#F97316'; // orange
      default: return '#6B7280'; // gray
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'Vacaciones';
      case 'personal': return 'Personal';
      case 'sick_leave': return 'Enfermedad';
      case 'maternity': return 'Maternidad';
      case 'paternity': return 'Paternidad';
      case 'unpaid': return 'Sin Goce';
      case 'compensatory': return 'Compensatorio';
      default: return 'Otro';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Distribución por Tipo</h3>
        <p className="text-sm text-gray-600">Tipos de vacaciones más utilizados</p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Donut Chart (simplified as we don't have a charting library) */}
            <div className="relative w-48 h-48 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {Object.entries(data).map(([type, typeData], index) => {
                  const percentage = (typeData.count / total) * 100;
                  const startAngle = Object.values(data).slice(0, index).reduce((sum, prev) => sum + (prev.count / total) * 360, 0);
                  const endAngle = startAngle + (typeData.count / total) * 360;

                  const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                  const largeArcFlag = percentage > 50 ? 1 : 0;

                  return (
                    <path
                      key={type}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={getTypeColor(type)}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
                <circle cx="50" cy="50" r="15" fill="white" />
              </svg>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data).map(([type, typeData]) => (
                <div key={type} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getTypeColor(type) }}
                  ></div>
                  <span className="text-sm text-gray-600">{getTypeLabel(type)}</span>
                  <span className="text-sm font-medium text-gray-900">({typeData.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TRENDS CHART COMPONENT
// ============================================================================

interface TrendsChartProps {
  data: VacationAnalytics['trends'];
  loading?: boolean;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data, loading = false }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.totalRequests, d.totalDays)));

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Tendencias Históricas</h3>
        <p className="text-sm text-gray-600">Evolución de solicitudes y días utilizados</p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="relative h-64">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Area for total requests */}
              <path
                d={`M 0 200 ${data.map((d, i) => `L ${(i / (data.length - 1)) * 400} ${200 - (d.totalRequests / maxValue) * 180}`).join(' ')} L 400 200 Z`}
                fill="#3B82F6"
                fillOpacity="0.1"
              />

              {/* Line for total requests */}
              <path
                d={`M 0 ${200 - (data[0]?.totalRequests || 0 / maxValue) * 180} ${data.map((d, i) => `L ${(i / (data.length - 1)) * 400} ${200 - (d.totalRequests / maxValue) * 180}`).join(' ')}`}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points for total requests */}
              {data.map((d, i) => (
                <circle
                  key={`requests-${i}`}
                  cx={(i / (data.length - 1)) * 400}
                  cy={200 - (d.totalRequests / maxValue) * 180}
                  r="3"
                  fill="#3B82F6"
                />
              ))}

              {/* Area for total days */}
              <path
                d={`M 0 200 ${data.map((d, i) => `L ${(i / (data.length - 1)) * 400} ${200 - (d.totalDays / maxValue) * 180}`).join(' ')} L 400 200 Z`}
                fill="#10B981"
                fillOpacity="0.1"
              />

              {/* Line for total days */}
              <path
                d={`M 0 ${200 - (data[0]?.totalDays || 0 / maxValue) * 180} ${data.map((d, i) => `L ${(i / (data.length - 1)) * 400} ${200 - (d.totalDays / maxValue) * 180}`).join(' ')}`}
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points for total days */}
              {data.map((d, i) => (
                <circle
                  key={`days-${i}`}
                  cx={(i / (data.length - 1)) * 400}
                  cy={200 - (d.totalDays / maxValue) * 180}
                  r="3"
                  fill="#10B981"
                />
              ))}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-2 right-2 flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Solicitudes</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Días</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CONFLICTS HEATMAP COMPONENT
// ============================================================================

interface ConflictsHeatmapProps {
  data: VacationAnalytics['conflicts'];
  loading?: boolean;
}

const ConflictsHeatmap: React.FC<ConflictsHeatmapProps> = ({ data, loading = false }) => {
  const getIntensityColor = (employeeCount: number) => {
    if (employeeCount <= 2) return 'bg-green-100 border-green-300';
    if (employeeCount <= 5) return 'bg-yellow-100 border-yellow-300';
    if (employeeCount <= 10) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const getIntensityText = (employeeCount: number) => {
    if (employeeCount <= 2) return 'text-green-800';
    if (employeeCount <= 5) return 'text-yellow-800';
    if (employeeCount <= 10) return 'text-orange-800';
    return 'text-red-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Mapa de Conflictos</h3>
        <p className="text-sm text-gray-600">Días con mayor concentración de vacaciones</p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay conflictos detectados</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {data.slice(0, 21).map((conflict, index) => (
              <div
                key={conflict.date}
                className={`p-3 rounded-lg border text-center cursor-pointer hover:shadow-md transition-shadow ${getIntensityColor(conflict.employeeCount)}`}
                title={`${new Date(conflict.date).toLocaleDateString('es-MX')}: ${conflict.employeeCount} empleados`}
              >
                <div className={`text-sm font-medium ${getIntensityText(conflict.employeeCount)}`}>
                  {new Date(conflict.date).getDate()}
                </div>
                <div className={`text-xs ${getIntensityText(conflict.employeeCount)}`}>
                  {conflict.employeeCount}
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
// INSIGHTS PANEL COMPONENT
// ============================================================================

interface InsightsPanelProps {
  analytics: VacationAnalytics | null;
  loading?: boolean;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ analytics, loading = false }) => {
  const insights = useMemo(() => {
    if (!analytics) return [];

    const insights = [];

    // Peak usage insight
    if (analytics.overview.mostUsedMonth) {
      insights.push({
        type: 'peak',
        icon: TrendingUp,
        color: 'blue',
        title: 'Mes de Mayor Uso',
        description: `El mes de ${analytics.overview.mostUsedMonth} tiene el mayor número de solicitudes`,
        actionable: false
      });
    }

    // High utilization insight
    if (analytics.utilization.overall > 80) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        color: 'red',
        title: 'Alta Utilización',
        description: 'La utilización general está por encima del 80%',
        actionable: true
      });
    }

    // Cost projection insight
    if (analytics.costs.projections.nextMonth > 0) {
      insights.push({
        type: 'cost',
        icon: DollarSign,
        color: 'green',
        title: 'Proyección de Costos',
        description: `Se proyectan $${analytics.costs.projections.nextMonth.toLocaleString()} en pagos para el próximo mes`,
        actionable: false
      });
    }

    // Department imbalance insight
    const maxUtilization = Math.max(...Object.values(analytics.utilization.byDepartment));
    const minUtilization = Math.min(...Object.values(analytics.utilization.byDepartment));

    if (maxUtilization - minUtilization > 50) {
      insights.push({
        type: 'imbalance',
        icon: BarChart3,
        color: 'yellow',
        title: 'Desbalance por Departamento',
        description: 'Existe una diferencia significativa en la utilización entre departamentos',
        actionable: true
      });
    }

    return insights;
  }, [analytics]);

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Insights Inteligentes</h3>
        <p className="text-sm text-gray-600">Análisis automatizado del sistema</p>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay insights disponibles</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              const colorClasses = {
                blue: 'bg-blue-50 border-blue-200',
                green: 'bg-green-50 border-green-200',
                yellow: 'bg-yellow-50 border-yellow-200',
                red: 'bg-red-50 border-red-200'
              };

              return (
                <div key={index} className={`p-4 rounded-lg border ${colorClasses[insight.color]}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      insight.color === 'blue' ? 'bg-blue-100' :
                      insight.color === 'green' ? 'bg-green-100' :
                      insight.color === 'yellow' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        insight.color === 'blue' ? 'text-blue-600' :
                        insight.color === 'green' ? 'text-green-600' :
                        insight.color === 'yellow' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        insight.color === 'blue' ? 'text-blue-900' :
                        insight.color === 'green' ? 'text-green-900' :
                        insight.color === 'yellow' ? 'text-yellow-900' :
                        'text-red-900'
                      }`}>
                        {insight.title}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        insight.color === 'blue' ? 'text-blue-700' :
                        insight.color === 'green' ? 'text-green-700' :
                        insight.color === 'yellow' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {insight.description}
                      </p>
                      {insight.actionable && (
                        <button className={`mt-2 text-xs font-medium ${
                          insight.color === 'blue' ? 'text-blue-600 hover:text-blue-800' :
                          insight.color === 'green' ? 'text-green-600 hover:text-green-800' :
                          insight.color === 'yellow' ? 'text-yellow-600 hover:text-yellow-800' :
                          'text-red-600 hover:text-red-800'
                        }`}>
                          Ver recomendaciones →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VacationsAnalyticsTab: React.FC<VacationsAnalyticsTabProps> = () => {
  const { showSuccess, showError } = useNotifications();

  const {
    analytics,
    loading,
    loadAnalytics,
    generateReport,
    downloadReport
  } = useVacationsManagement();

  // Local state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Load analytics data
  React.useEffect(() => {
    loadAnalytics({}, dateRange);
  }, [loadAnalytics, dateRange]);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  const handleExportAnalytics = async () => {
    try {
      const report = await generateReport('analytics', {
        format: 'pdf',
        include: {
          requests: true,
          payments: true,
          evidences: true,
          analytics: true,
          policies: false
        },
        filters: {},
        dateRange,
        includeInactive: false
      });

      const blob = await downloadReport(report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analisis_vacaciones_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess('Reporte de análisis exportado correctamente');
    } catch (error) {
      showError('Error al exportar el análisis');
    }
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Desde:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange(e.target.value, dateRange.endDate)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Hasta:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange(dateRange.startDate, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadAnalytics({}, dateRange)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className={`h-5 w-5 ${loading.analytics ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportAnalytics}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Análisis</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Solicitudes Totales"
          value={analytics?.overview.totalRequests || 0}
          subtitle="En el período seleccionado"
          icon={BarChart3}
          color="blue"
          loading={loading.analytics}
        />

        <MetricCard
          title="Días Utilizados"
          value={analytics?.overview.totalDays || 0}
          subtitle="Total acumulado"
          icon={Calendar}
          color="green"
          loading={loading.analytics}
        />

        <MetricCard
          title="Promedio por Solicitud"
          value={`${analytics?.overview.averageDaysPerRequest.toFixed(1) || '0'}`}
          subtitle="Días por solicitud"
          icon={Target}
          color="purple"
          loading={loading.analytics}
        />

        <MetricCard
          title="Costo Total"
          value={`$${(analytics?.costs.totalPayments || 0).toLocaleString()}`}
          subtitle="Pagos procesados"
          icon={DollarSign}
          color="green"
          loading={loading.analytics}
        />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Chart */}
        <DepartmentChart
          data={analytics?.byDepartment || []}
          loading={loading.analytics}
        />

        {/* Type Distribution */}
        <TypeDistributionChart
          data={analytics?.byType || {}}
          loading={loading.analytics}
        />
      </div>

      {/* Trends and Conflicts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendsChart
          data={analytics?.trends || []}
          loading={loading.analytics}
        />

        <ConflictsHeatmap
          data={analytics?.conflicts || []}
          loading={loading.analytics}
        />
      </div>

      {/* Insights Panel */}
      <InsightsPanel
        analytics={analytics}
        loading={loading.analytics}
      />

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Utilización General</h3>
            <Activity className="h-6 w-6 text-blue-600" />
          </div>

          {loading.analytics ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics?.utilization.overall.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    analytics?.utilization.overall > 80 ? 'bg-red-500' :
                    analytics?.utilization.overall > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${analytics?.utilization.overall}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {analytics?.utilization.overall > 80 ? 'Utilización alta - considere ajustes' :
                 analytics?.utilization.overall > 60 ? 'Utilización moderada' :
                 'Utilización baja - buen balance'}
              </p>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Próxima Proyección</h3>
            <Zap className="h-6 w-6 text-purple-600" />
          </div>

          {loading.analytics ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ${analytics?.costs.projections.nextMonth.toLocaleString() || '0'}
              </div>
              <p className="text-sm text-gray-600 mb-2">Costo proyectado próximo mes</p>
              <div className="flex items-center space-x-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">
                  {analytics?.costs.projections.nextQuarter ? `+$${(analytics.costs.projections.nextQuarter / 3).toLocaleString()} trimestral` : ''}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Eficiencia</h3>
            <Award className="h-6 w-6 text-yellow-600" />
          </div>

          {loading.analytics ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {analytics?.overview.totalRequests && analytics?.overview.totalDays
                  ? (analytics.overview.totalDays / analytics.overview.totalRequests).toFixed(1)
                  : '0'
                }
              </div>
              <p className="text-sm text-gray-600 mb-2">Días promedio por solicitud</p>
              <div className="text-xs text-gray-500">
                Óptimo: 5-10 días por solicitud
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VacationsAnalyticsTab;
