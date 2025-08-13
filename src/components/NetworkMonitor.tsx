import React, { useState, useEffect } from 'react';

interface NetworkRequest {
  id: string;
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
  totalDataTransferred: number;
  requestsPerMinute: number;
}

export const NetworkMonitor: React.FC = () => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    totalDataTransferred: 0,
    requestsPerMinute: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [filters, setFilters] = useState({
    method: 'all' as 'all' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    status: 'all' as 'all' | 'success' | 'error'
  });

  // Función para agregar request
  const addRequest = (request: Omit<NetworkRequest, 'id'>) => {
    const newRequest: NetworkRequest = {
      ...request,
      id: Date.now().toString()
    };
    
    setRequests(prev => [...prev.slice(-99), newRequest]); // Mantener solo los últimos 100 requests
  };

  // Función para calcular estadísticas
  const calculateStats = (requestList: NetworkRequest[]): NetworkStats => {
    const total = requestList.length;
    const successful = requestList.filter(r => r.success).length;
    const failed = total - successful;
    const avgResponseTime = total > 0 ? requestList.reduce((sum, r) => sum + r.responseTime, 0) / total : 0;
    const totalData = requestList.reduce((sum, r) => sum + r.size, 0);
    
    // Calcular requests por minuto (últimos 60 segundos)
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentRequests = requestList.filter(r => r.timestamp > oneMinuteAgo).length;
    
    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      averageResponseTime: Math.round(avgResponseTime),
      totalDataTransferred: totalData,
      requestsPerMinute: recentRequests
    };
  };



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

  // Calcular estadísticas cuando cambian los requests
  useEffect(() => {
    const filteredRequests = requests.filter(request => {
      if (filters.method !== 'all' && request.method !== filters.method) return false;
      if (filters.status === 'success' && !request.success) return false;
      if (filters.status === 'error' && request.success) return false;
      return true;
    });
    
    setStats(calculateStats(filteredRequests));
  }, [requests, filters]);

  const handleClearRequests = () => {
    setRequests([]);
  };

  const handleExportRequests = () => {
    const requestData = {
      timestamp: new Date().toISOString(),
      stats,
      requests: requests.map(r => ({
        ...r,
        timestamp: r.timestamp.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(requestData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `network-report-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">🌐 Network Monitor</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-3 py-1 rounded text-sm ${
              isMonitoring 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
          <button
            onClick={handleClearRequests}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear All
          </button>
          <button
            onClick={handleExportRequests}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Export
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium">Method:</label>
                      <select
              value={filters.method}
              onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value as 'all' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' }))}
              className="ml-2 px-2 py-1 border rounded text-sm"
            >
            <option value="all">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Status:</label>
                      <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'success' | 'error' }))}
              className="ml-2 px-2 py-1 border rounded text-sm"
            >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
          <div className="text-sm text-blue-700">Total Requests</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
          <div className="text-2xl font-bold text-green-600">{stats.successfulRequests}</div>
          <div className="text-sm text-green-700">Successful</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-red-100">
          <div className="text-2xl font-bold text-red-600">{stats.failedRequests}</div>
          <div className="text-sm text-red-700">Failed</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="text-2xl font-bold text-purple-600">{stats.averageResponseTime}ms</div>
          <div className="text-sm text-purple-700">Avg Response</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <div className="text-2xl font-bold text-yellow-600">{formatBytes(stats.totalDataTransferred)}</div>
          <div className="text-sm text-yellow-700">Data Transferred</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <div className="text-2xl font-bold text-indigo-600">{stats.requestsPerMinute}</div>
          <div className="text-sm text-indigo-700">Req/Min</div>
        </div>
      </div>

      {/* Lista de Requests */}
      <div className="space-y-4">
        <h4 className="font-semibold">📊 Recent Requests ({requests.length})</h4>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {requests.map(request => (
            <div key={request.id} className="border rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getMethodColor(request.method)}`}>
                    {request.method}
                  </span>
                  <span className={`font-semibold ${getStatusColor(request.status)}`}>
                    {request.status} {request.statusText}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {request.responseTime}ms | {formatBytes(request.size)}
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm font-mono text-gray-700 truncate" title={request.url}>
                  {request.url}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {request.timestamp.toLocaleTimeString()}
                  {request.error && (
                    <span className="text-red-600 ml-2">Error: {request.error}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {requests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {isMonitoring ? 'No requests tracked yet' : 'Network monitoring is disabled'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 