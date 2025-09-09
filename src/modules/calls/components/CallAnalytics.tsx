import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Phone, Clock, Users, Target, AlertTriangle, Download, Filter, Calendar } from 'lucide-react';

export const CallAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('calls');

  // Datos mock para demostración
  const analyticsData = {
    overview: {
      totalCalls: 1247,
      inboundCalls: 892,
      outboundCalls: 355,
      answeredCalls: 1156,
      missedCalls: 91,
      averageCallDuration: 420,
      averageWaitTime: 95,
      serviceLevel: 91,
      abandonmentRate: 9,
      firstCallResolution: 85,
      customerSatisfaction: 4.2,
      totalCost: 187.50,
      averageCost: 0.15,
    },
    trends: {
      callsByHour: [
        { hour: '08:00', calls: 45, answered: 42, missed: 3 },
        { hour: '09:00', calls: 67, answered: 61, missed: 6 },
        { hour: '10:00', calls: 89, answered: 82, missed: 7 },
        { hour: '11:00', calls: 95, answered: 88, missed: 7 },
        { hour: '12:00', calls: 78, answered: 72, missed: 6 },
        { hour: '13:00', calls: 65, answered: 58, missed: 7 },
        { hour: '14:00', calls: 82, answered: 76, missed: 6 },
        { hour: '15:00', calls: 91, answered: 85, missed: 6 },
        { hour: '16:00', calls: 88, answered: 81, missed: 7 },
        { hour: '17:00', calls: 76, answered: 69, missed: 7 },
        { hour: '18:00', calls: 54, answered: 48, missed: 6 },
        { hour: '19:00', calls: 32, answered: 28, missed: 4 },
      ],
      callsByDay: [
        { day: 'Lun', calls: 156, answered: 142, missed: 14 },
        { day: 'Mar', calls: 178, answered: 165, missed: 13 },
        { day: 'Mié', calls: 189, answered: 172, missed: 17 },
        { day: 'Jue', calls: 201, answered: 185, missed: 16 },
        { day: 'Vie', calls: 195, answered: 178, missed: 17 },
        { day: 'Sáb', calls: 98, answered: 89, missed: 9 },
        { day: 'Dom', calls: 67, answered: 58, missed: 9 },
      ],
      serviceLevelByHour: [
        { hour: '08:00', serviceLevel: 93 },
        { hour: '09:00', serviceLevel: 91 },
        { hour: '10:00', serviceLevel: 92 },
        { hour: '11:00', serviceLevel: 93 },
        { hour: '12:00', serviceLevel: 92 },
        { hour: '13:00', serviceLevel: 89 },
        { hour: '14:00', serviceLevel: 93 },
        { hour: '15:00', serviceLevel: 93 },
        { hour: '16:00', serviceLevel: 92 },
        { hour: '17:00', serviceLevel: 91 },
        { hour: '18:00', serviceLevel: 89 },
        { hour: '19:00', serviceLevel: 88 },
      ],
    },
    breakdowns: {
      byQueue: [
        { queue: 'Soporte', calls: 567, percentage: 45.5, serviceLevel: 89, averageWait: 120 },
        { queue: 'Ventas', calls: 423, percentage: 33.9, serviceLevel: 95, averageWait: 45 },
        { queue: 'VIP', calls: 189, percentage: 15.2, serviceLevel: 98, averageWait: 15 },
        { queue: 'Facturación', calls: 68, percentage: 5.4, serviceLevel: 92, averageWait: 90 },
      ],
      byAgent: [
        { agent: 'Ana García', calls: 156, averageHandleTime: 420, serviceLevel: 94, satisfaction: 4.5 },
        { agent: 'Carlos Rodríguez', calls: 142, averageHandleTime: 380, serviceLevel: 96, satisfaction: 4.3 },
        { agent: 'María López', calls: 138, averageHandleTime: 450, serviceLevel: 92, satisfaction: 4.2 },
        { agent: 'Roberto Díaz', calls: 125, averageHandleTime: 400, serviceLevel: 93, satisfaction: 4.4 },
      ],
      byHour: [
        { hour: '08:00-09:00', calls: 45, peak: false },
        { hour: '09:00-10:00', calls: 67, peak: false },
        { hour: '10:00-11:00', calls: 89, peak: true },
        { hour: '11:00-12:00', calls: 95, peak: true },
        { hour: '12:00-13:00', calls: 78, peak: false },
        { hour: '13:00-14:00', calls: 65, peak: false },
        { hour: '14:00-15:00', calls: 82, peak: false },
        { hour: '15:00-16:00', calls: 91, peak: true },
        { hour: '16:00-17:00', calls: 88, peak: false },
        { hour: '17:00-18:00', calls: 76, peak: false },
        { hour: '18:00-19:00', calls: 54, peak: false },
        { hour: '19:00-20:00', calls: 32, peak: false },
      ],
    },
    insights: {
      topPerformingAgents: [
        { name: 'Carlos Rodríguez', metric: 'Service Level', value: 96, trend: 'up' },
        { name: 'Ana García', metric: 'Customer Satisfaction', value: 4.5, trend: 'up' },
        { name: 'Roberto Díaz', metric: 'First Call Resolution', value: 92, trend: 'stable' },
      ],
      peakHours: [
        { hour: '11:00-12:00', calls: 95, recommendation: 'Aumentar agentes' },
        { hour: '15:00-16:00', calls: 91, recommendation: 'Mantener nivel actual' },
        { hour: '10:00-11:00', calls: 89, recommendation: 'Monitorear cola' },
      ],
      qualityIssues: [
        { issue: 'Alto tiempo de espera en Soporte', impact: 'high', recommendation: 'Aumentar agentes o mejorar procesos' },
        { issue: 'Tasa de abandono en horas pico', impact: 'medium', recommendation: 'Implementar callback automático' },
        { issue: 'Bajo FCR en consultas complejas', impact: 'medium', recommendation: 'Mejorar capacitación' },
      ],
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analítica de Llamadas</h2>
          <p className="text-gray-600">Métricas y análisis de rendimiento del centro de llamadas</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Llamadas</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalCalls}</p>
              <p className="text-sm text-green-600">+12% vs mes anterior</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nivel de Servicio</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.serviceLevel}%</p>
              <p className="text-sm text-green-600">+3% vs mes anterior</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(analyticsData.overview.averageCallDuration)}</p>
              <p className="text-sm text-red-600">+5% vs mes anterior</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Costo Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.totalCost)}</p>
              <p className="text-sm text-green-600">-2% vs mes anterior</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Llamadas por Hora</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de barras - Llamadas por hora</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nivel de Servicio por Hora</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de líneas - Nivel de servicio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desgloses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Llamadas por Cola</h3>
          <div className="space-y-4">
            {analyticsData.breakdowns.byQueue.map((queue, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{queue.queue}</span>
                    <span className="text-sm text-gray-500">{queue.calls} llamadas</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${queue.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                    <span>SL: {queue.serviceLevel}%</span>
                    <span>Tiempo: {formatDuration(queue.averageWait * 60)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Agente</h3>
          <div className="space-y-4">
            {analyticsData.breakdowns.byAgent.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{agent.agent}</div>
                  <div className="text-xs text-gray-500">{agent.calls} llamadas</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">SL: {agent.serviceLevel}%</div>
                  <div className="text-xs text-gray-500">AHT: {formatDuration(agent.averageHandleTime)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights y recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agentes Destacados</h3>
          <div className="space-y-3">
            {analyticsData.insights.topPerformingAgents.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                  <div className="text-xs text-gray-500">{agent.metric}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{agent.value}</span>
                  {getTrendIcon(agent.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Horas Pico</h3>
          <div className="space-y-3">
            {analyticsData.insights.peakHours.map((hour, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{hour.hour}</div>
                  <div className="text-xs text-gray-500">{hour.calls} llamadas</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{hour.recommendation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Problemas de Calidad</h3>
          <div className="space-y-3">
            {analyticsData.insights.qualityIssues.map((issue, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{issue.issue}</div>
                  <div className="text-xs text-gray-500 mt-1">{issue.recommendation}</div>
                </div>
                <div className="ml-2">
                  <AlertTriangle className={`h-4 w-4 ${getImpactColor(issue.impact)}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
