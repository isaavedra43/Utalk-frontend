import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Activity, Wifi, WifiOff, AlertTriangle, Clock, Zap } from 'lucide-react';
import consoleExporter from '../utils/consoleExporter';

interface NetworkRequest {
  timestamp: Date;
  method: string;
  url: string;
  status: number;
  statusText: string;
  responseTime: number;
  size: number;
  success: boolean;
  error?: string;
}

interface NetworkStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsPerMinute: number;
  lastRequestTime: Date | null;
  rateLimitWarnings: number;
  duplicateRequests: number;
}

export const NetworkMonitor: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    requestsPerMinute: 0,
    lastRequestTime: null,
    rateLimitWarnings: 0,
    duplicateRequests: 0
  });
  const [showDetails, setShowDetails] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Función para agregar una nueva petición
  const addRequest = (request: NetworkRequest) => {
    setRequests(prev => {
      const newRequests = [...prev, request].slice(-100); // Mantener solo las últimas 100
      return newRequests;
    });
  };

  // Función para calcular estadísticas
  const calculateStats = useCallback(() => {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    const recentRequests = requests.filter(req => req.timestamp.getTime() > oneMinuteAgo);
    const successful = requests.filter(req => req.success);
    const failed = requests.filter(req => !req.success);
    
    const totalResponseTime = requests.reduce((sum, req) => sum + req.responseTime, 0);
    const averageResponseTime = requests.length > 0 ? totalResponseTime / requests.length : 0;
    
    // Detectar peticiones duplicadas (misma URL en menos de 5 segundos)
    const duplicateRequests = requests.filter((req, index) => {
      if (index === 0) return false;
      const prevRequest = requests[index - 1];
      const timeDiff = req.timestamp.getTime() - prevRequest.timestamp.getTime();
      return req.url === prevRequest.url && timeDiff < 5000;
    }).length;

    // Detectar posibles rate limit warnings
    const rateLimitWarnings = requests.filter(req => 
      req.status === 429 || 
      req.status === 503 || 
      req.responseTime > 10000
    ).length;

    setStats({
      totalRequests: requests.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageResponseTime: Math.round(averageResponseTime),
      requestsPerMinute: recentRequests.length,
      lastRequestTime: requests.length > 0 ? requests[requests.length - 1].timestamp : null,
      rateLimitWarnings,
      duplicateRequests
    });
  }, [requests]);

  // Iniciar/detener monitoring
  useEffect(() => {
    if (isMonitoring) {
      // Configurar interceptores de red
      const setupNetworkMonitoring = () => {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
          const startTime = performance.now();
          const [url, options] = args;
          const method = (options?.method || 'GET').toUpperCase();
          
          try {
            const response = await originalFetch(...args);
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            // Intentar obtener el tamaño de la respuesta
            let size = 0;
            try {
              const clone = response.clone();
              const text = await clone.text();
              size = new Blob([text]).size;
            } catch {
              // Si no se puede obtener el tamaño, usar 0
            }
            
            addRequest({
              timestamp: new Date(),
              method,
              url: typeof url === 'string' ? url : url.toString(),
              status: response.status,
              statusText: response.statusText,
              responseTime: Math.round(responseTime),
              size,
              success: response.ok
            });
            
            return response;
          } catch (error) {
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            addRequest({
              timestamp: new Date(),
              method,
              url: typeof url === 'string' ? url : url.toString(),
              status: 0,
              statusText: 'Network Error',
              responseTime: Math.round(responseTime),
              size: 0,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            
            throw error;
          }
        };

        return () => {
          window.fetch = originalFetch;
        };
      };

      const cleanup = setupNetworkMonitoring();
      return cleanup;
    }
  }, [isMonitoring]);

  // Actualizar estadísticas cuando cambian las peticiones
  useEffect(() => {
    calculateStats();
  }, [requests, calculateStats]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [requests, autoScroll]);

  // Obtener logs de consoleExporter
  const getConsoleExporterStats = () => {
    try {
      return consoleExporter.getStats();
    } catch {
      return { total: 0, byLevel: {}, httpRequests: 0, errors: 0 };
    }
  };

  const consoleStats = getConsoleExporterStats();

  const getStatusColor = () => {
    if (stats.rateLimitWarnings > 0) return 'text-red-500';
    if (stats.requestsPerMinute > 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (stats.rateLimitWarnings > 0) return <AlertTriangle className="w-4 h-4" />;
    if (stats.requestsPerMinute > 50) return <Clock className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Monitor de Red</h3>
          <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {stats.rateLimitWarnings > 0 ? 'Rate Limit Detectado' : 
               stats.requestsPerMinute > 50 ? 'Alto Tráfico' : 'Normal'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              isMonitoring 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isMonitoring ? 'Detener' : 'Iniciar'}
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            {showDetails ? 'Ocultar' : 'Detalles'}
          </button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Total Peticiones</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{stats.totalRequests}</p>
          <p className="text-xs text-blue-600">{stats.requestsPerMinute}/min</p>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Exitosas</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.successfulRequests}</p>
          <p className="text-xs text-green-600">
            {stats.totalRequests > 0 ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) : 0}%
          </p>
        </div>

        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Fallidas</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.failedRequests}</p>
          <p className="text-xs text-red-600">
            {stats.totalRequests > 0 ? Math.round((stats.failedRequests / stats.totalRequests) * 100) : 0}%
          </p>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">Tiempo Promedio</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.averageResponseTime}ms</p>
          <p className="text-xs text-yellow-600">Respuesta</p>
        </div>
      </div>

      {/* Alertas */}
      {(stats.rateLimitWarnings > 0 || stats.duplicateRequests > 0) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Alertas Detectadas</span>
          </div>
          <div className="space-y-1">
            {stats.rateLimitWarnings > 0 && (
              <p className="text-sm text-red-600">
                ⚠️ {stats.rateLimitWarnings} posibles rate limit warnings detectados
              </p>
            )}
            {stats.duplicateRequests > 0 && (
              <p className="text-sm text-red-600">
                🔄 {stats.duplicateRequests} peticiones duplicadas detectadas
              </p>
            )}
          </div>
        </div>
      )}

      {/* Estadísticas de ConsoleExporter */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">ConsoleExporter Stats</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Total Logs:</span>
            <span className="ml-1 font-medium">{consoleStats.total}</span>
          </div>
          <div>
            <span className="text-gray-600">HTTP Requests:</span>
            <span className="ml-1 font-medium">{consoleStats.httpRequests}</span>
          </div>
          <div>
            <span className="text-gray-600">Errores:</span>
            <span className="ml-1 font-medium">{consoleStats.errors}</span>
          </div>
          <div>
            <span className="text-gray-600">Última Petición:</span>
            <span className="ml-1 font-medium">
              {stats.lastRequestTime ? stats.lastRequestTime.toLocaleTimeString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Detalles de peticiones */}
      {showDetails && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Últimas Peticiones</h4>
            <label className="flex items-center space-x-2 text-xs">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              <span>Auto-scroll</span>
            </label>
          </div>
          
          <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-2 no-scrollbar">
            {requests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No hay peticiones registradas</p>
            ) : (
              <div className="space-y-1">
                {requests.slice().reverse().map((request, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-xs ${
                      request.success ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${
                        request.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {request.method} {request.status}
                      </span>
                      <span className="text-gray-600">{request.responseTime}ms</span>
                    </div>
                    <div className="text-gray-600 truncate">{request.url}</div>
                    {request.error && (
                      <div className="text-red-600 text-xs">{request.error}</div>
                    )}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 