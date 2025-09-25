import React, { useState, useEffect, useMemo } from 'react';
import { useMonitoring } from './MonitoringContext';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  XCircle,
  Gauge
} from 'lucide-react';

interface MetricTrend {
  current: number;
  previous: number;
  change: number;
  direction: 'up' | 'down' | 'stable';
}

interface PerformanceInsights {
  averageResponseTime: MetricTrend;
  errorRate: MetricTrend;
  throughput: MetricTrend;
  availability: MetricTrend;
  memoryUsage: MetricTrend;
  cacheHitRate: MetricTrend;
}

export const AdvancedMetrics: React.FC = () => {
  const { apis, websockets, errors, performance } = useMonitoring();
  const [timeRange, setTimeRange] = useState<'5m' | '15m' | '1h' | '6h' | '24h'>('15m');
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);

  // Calcular métricas avanzadas
  const calculateInsights = useMemo(() => {
    const now = Date.now();
    const timeRanges = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    };

    const currentPeriod = timeRanges[timeRange];
    const previousPeriod = currentPeriod * 2;

    // Filtrar datos por períodos
    const currentApis = apis.filter(api => now - api.timestamp <= currentPeriod);
    const previousApis = apis.filter(api => 
      now - api.timestamp > currentPeriod && 
      now - api.timestamp <= previousPeriod
    );

    const currentErrors = errors.filter(error => now - error.timestamp <= currentPeriod);
    const previousErrors = errors.filter(error => 
      now - error.timestamp > currentPeriod && 
      now - error.timestamp <= previousPeriod
    );

    // Calcular métricas actuales vs anteriores
    const calculateTrend = (current: number, previous: number): MetricTrend => {
      const change = previous === 0 ? 0 : ((current - previous) / previous) * 100;
      return {
        current,
        previous,
        change,
        direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
      };
    };

    // Tiempo de respuesta promedio
    const currentAvgResponse = currentApis.length > 0 
      ? currentApis.reduce((sum, api) => sum + (api.duration || 0), 0) / currentApis.length 
      : 0;
    const previousAvgResponse = previousApis.length > 0 
      ? previousApis.reduce((sum, api) => sum + (api.duration || 0), 0) / previousApis.length 
      : 0;

    // Tasa de error
    const currentErrorRate = currentApis.length > 0 
      ? (currentApis.filter(api => api.error || (api.status && api.status >= 400)).length / currentApis.length) * 100 
      : 0;
    const previousErrorRate = previousApis.length > 0 
      ? (previousApis.filter(api => api.error || (api.status && api.status >= 400)).length / previousApis.length) * 100 
      : 0;

    // Throughput (requests por minuto)
    const currentThroughput = (currentApis.length / (currentPeriod / 60000));
    const previousThroughput = (previousApis.length / (currentPeriod / 60000));

    // Disponibilidad
    const currentSuccessRate = currentApis.length > 0 
      ? (currentApis.filter(api => api.status && api.status >= 200 && api.status < 400).length / currentApis.length) * 100 
      : 100;
    const previousSuccessRate = previousApis.length > 0 
      ? (previousApis.filter(api => api.status && api.status >= 200 && api.status < 400).length / previousApis.length) * 100 
      : 100;

    // Uso de memoria (simulado basado en performance)
    const memoryMetrics = performance.filter(p => p.type === 'memory');
    const currentMemory = memoryMetrics.length > 0 ? memoryMetrics[memoryMetrics.length - 1].value : 0;
    const previousMemory = memoryMetrics.length > 1 ? memoryMetrics[memoryMetrics.length - 2].value : currentMemory;

    // Cache hit rate (simulado)
    const currentCacheHitRate = Math.random() * 20 + 80; // 80-100%
    const previousCacheHitRate = Math.random() * 20 + 80;

    return {
      averageResponseTime: calculateTrend(currentAvgResponse, previousAvgResponse),
      errorRate: calculateTrend(currentErrorRate, previousErrorRate),
      throughput: calculateTrend(currentThroughput, previousThroughput),
      availability: calculateTrend(currentSuccessRate, previousSuccessRate),
      memoryUsage: calculateTrend(currentMemory, previousMemory),
      cacheHitRate: calculateTrend(currentCacheHitRate, previousCacheHitRate)
    };
  }, [apis, errors, performance, timeRange]);

  useEffect(() => {
    setInsights(calculateInsights);
  }, [calculateInsights]);

  // Análisis de patrones de error
  const errorAnalysis = useMemo(() => {
    const now = Date.now();
    const timeRanges = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    };

    const recentErrors = errors.filter(error => now - error.timestamp <= timeRanges[timeRange]);
    const recentApiErrors = apis.filter(api => 
      (api.error || (api.status && api.status >= 400)) && 
      now - api.timestamp <= timeRanges[timeRange]
    );

    // Agrupar errores por tipo
    const errorTypes = recentErrors.reduce((acc, error) => {
      acc[error.name] = (acc[error.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Agrupar errores de API por código de estado
    const statusCodes = recentApiErrors.reduce((acc, api) => {
      const status = api.status?.toString() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // URLs más problemáticas
    const problematicUrls = recentApiErrors.reduce((acc, api) => {
      const url = api.url.split('?')[0]; // Remove query params
      acc[url] = (acc[url] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: recentErrors.length + recentApiErrors.length,
      errorTypes: Object.entries(errorTypes).sort(([,a], [,b]) => b - a).slice(0, 5),
      statusCodes: Object.entries(statusCodes).sort(([,a], [,b]) => b - a).slice(0, 5),
      problematicUrls: Object.entries(problematicUrls).sort(([,a], [,b]) => b - a).slice(0, 5)
    };
  }, [errors, apis, timeRange]);

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable', isGoodWhenUp: boolean = true) => {
    if (direction === 'stable') return 'text-gray-600';
    if (isGoodWhenUp) {
      return direction === 'up' ? 'text-green-600' : 'text-red-600';
    } else {
      return direction === 'up' ? 'text-red-600' : 'text-green-600';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'ms') return `${value.toFixed(0)}ms`;
    if (unit === 'req/min') return `${value.toFixed(1)} req/min`;
    if (unit === 'MB') return `${(value / 1024 / 1024).toFixed(1)}MB`;
    return value.toFixed(2);
  };

  if (!insights) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Calculando métricas avanzadas...</span>
      </div>
    );
  }

  return (
    <div className="advanced-metrics-container">
      {/* Time Range Selector */}
      <div className="time-range-selector">
        <label className="time-range-label">Período de análisis:</label>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="time-range-select"
        >
          <option value="5m">Últimos 5 minutos</option>
          <option value="15m">Últimos 15 minutos</option>
          <option value="1h">Última hora</option>
          <option value="6h">Últimas 6 horas</option>
          <option value="24h">Últimas 24 horas</option>
        </select>
      </div>

      {/* Performance Metrics Grid */}
      <div className="performance-metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>Tiempo de Respuesta</span>
          </div>
          <div className="metric-value">
            {formatValue(insights.averageResponseTime.current, 'ms')}
          </div>
          <div className={`metric-trend ${getTrendColor(insights.averageResponseTime.direction, false)}`}>
            {getTrendIcon(insights.averageResponseTime.direction)}
            <span>{Math.abs(insights.averageResponseTime.change).toFixed(1)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Tasa de Error</span>
          </div>
          <div className="metric-value">
            {formatValue(insights.errorRate.current, '%')}
          </div>
          <div className={`metric-trend ${getTrendColor(insights.errorRate.direction, false)}`}>
            {getTrendIcon(insights.errorRate.direction)}
            <span>{Math.abs(insights.errorRate.change).toFixed(1)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>Throughput</span>
          </div>
          <div className="metric-value">
            {formatValue(insights.throughput.current, 'req/min')}
          </div>
          <div className={`metric-trend ${getTrendColor(insights.throughput.direction, true)}`}>
            {getTrendIcon(insights.throughput.direction)}
            <span>{Math.abs(insights.throughput.change).toFixed(1)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Target className="w-5 h-5 text-green-500" />
            <span>Disponibilidad</span>
          </div>
          <div className="metric-value">
            {formatValue(insights.availability.current, '%')}
          </div>
          <div className={`metric-trend ${getTrendColor(insights.availability.direction, true)}`}>
            {getTrendIcon(insights.availability.direction)}
            <span>{Math.abs(insights.availability.change).toFixed(1)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <span>Uso de Memoria</span>
          </div>
          <div className="metric-value">
            {formatValue(insights.memoryUsage.current, 'MB')}
          </div>
          <div className={`metric-trend ${getTrendColor(insights.memoryUsage.direction, false)}`}>
            {getTrendIcon(insights.memoryUsage.direction)}
            <span>{Math.abs(insights.memoryUsage.change).toFixed(1)}%</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Gauge className="w-5 h-5 text-indigo-500" />
            <span>Cache Hit Rate</span>
          </div>
          <div className="metric-value">
            {formatValue(insights.cacheHitRate.current, '%')}
          </div>
          <div className={`metric-trend ${getTrendColor(insights.cacheHitRate.direction, true)}`}>
            {getTrendIcon(insights.cacheHitRate.direction)}
            <span>{Math.abs(insights.cacheHitRate.change).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Error Analysis Section */}
      <div className="error-analysis-section">
        <h3 className="section-title">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Análisis de Errores ({errorAnalysis.totalErrors} total)
        </h3>

        <div className="error-analysis-grid">
          {/* Error Types */}
          <div className="analysis-card">
            <h4>Tipos de Error Más Frecuentes</h4>
            <div className="error-list">
              {errorAnalysis.errorTypes.length > 0 ? (
                errorAnalysis.errorTypes.map(([type, count]) => (
                  <div key={type} className="error-item">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="error-name">{type}</span>
                    <span className="error-count">{count}</span>
                  </div>
                ))
              ) : (
                <div className="no-errors">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span>No hay errores en este período</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Codes */}
          <div className="analysis-card">
            <h4>Códigos de Estado HTTP</h4>
            <div className="error-list">
              {errorAnalysis.statusCodes.length > 0 ? (
                errorAnalysis.statusCodes.map(([code, count]) => (
                  <div key={code} className="error-item">
                    <div className={`status-indicator status-${code}`}>
                      {code}
                    </div>
                    <span className="error-count">{count}</span>
                  </div>
                ))
              ) : (
                <div className="no-errors">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span>Todas las respuestas exitosas</span>
                </div>
              )}
            </div>
          </div>

          {/* Problematic URLs */}
          <div className="analysis-card">
            <h4>URLs Más Problemáticas</h4>
            <div className="error-list">
              {errorAnalysis.problematicUrls.length > 0 ? (
                errorAnalysis.problematicUrls.map(([url, count]) => (
                  <div key={url} className="error-item">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="error-url">{url.split('/').pop() || url}</span>
                    <span className="error-count">{count}</span>
                  </div>
                ))
              ) : (
                <div className="no-errors">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span>No hay URLs problemáticas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="health-score-section">
        <h3 className="section-title">
          <Activity className="w-5 h-5 text-blue-500" />
          Puntuación de Salud del Sistema
        </h3>
        
        <div className="health-score-card">
          {(() => {
            // Calcular puntuación de salud basada en métricas
            const responseScore = Math.max(0, 100 - (insights.averageResponseTime.current / 10)); // 0-100 based on response time
            const errorScore = Math.max(0, 100 - (insights.errorRate.current * 2)); // 0-100 based on error rate
            const availabilityScore = insights.availability.current; // Already 0-100
            const memoryScore = Math.max(0, 100 - (insights.memoryUsage.current / 1024 / 1024 * 10)); // Based on memory usage
            
            const overallScore = (responseScore + errorScore + availabilityScore + memoryScore) / 4;
            
            const getScoreColor = (score: number) => {
              if (score >= 90) return 'text-green-500';
              if (score >= 70) return 'text-yellow-500';
              return 'text-red-500';
            };

            const getScoreLabel = (score: number) => {
              if (score >= 90) return 'Excelente';
              if (score >= 70) return 'Bueno';
              if (score >= 50) return 'Regular';
              return 'Crítico';
            };

            return (
              <>
                <div className={`health-score ${getScoreColor(overallScore)}`}>
                  {overallScore.toFixed(0)}
                </div>
                <div className={`health-label ${getScoreColor(overallScore)}`}>
                  {getScoreLabel(overallScore)}
                </div>
                <div className="health-breakdown">
                  <div className="breakdown-item">
                    <span>Respuesta:</span>
                    <span className={getScoreColor(responseScore)}>{responseScore.toFixed(0)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Errores:</span>
                    <span className={getScoreColor(errorScore)}>{errorScore.toFixed(0)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Disponibilidad:</span>
                    <span className={getScoreColor(availabilityScore)}>{availabilityScore.toFixed(0)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Memoria:</span>
                    <span className={getScoreColor(memoryScore)}>{memoryScore.toFixed(0)}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
