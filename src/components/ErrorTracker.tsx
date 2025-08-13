import React, { useState, useEffect, useCallback } from 'react';

interface ErrorEntry {
  id: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'unhandled';
  message: string;
  stack?: string;
  source: string;
  count: number;
  lastOccurrence: Date;
  context?: Record<string, unknown>;
}

interface ErrorGroup {
  key: string;
  errors: ErrorEntry[];
  totalCount: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
}

export const ErrorTracker: React.FC = () => {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [errorGroups, setErrorGroups] = useState<ErrorGroup[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'error' | 'warning' | 'unhandled',
    source: 'all' as 'all' | 'console' | 'network' | 'react' | 'websocket'
  });

  // Función para agregar error
  const addError = useCallback((type: ErrorEntry['type'], message: string, source: string, stack?: string, context?: Record<string, unknown>) => {
    const existingError = errors.find(e => 
      e.type === type && e.message === message && e.source === source
    );

    if (existingError) {
      // Incrementar contador de error existente
      setErrors(prev => prev.map(e => 
        e.id === existingError.id 
          ? { ...e, count: e.count + 1, lastOccurrence: new Date() }
          : e
      ));
    } else {
      // Agregar nuevo error
      const newError: ErrorEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type,
        message,
        stack,
        source,
        count: 1,
        lastOccurrence: new Date(),
        context
      };
      setErrors(prev => [...prev, newError]);
    }
  }, [errors]);

  // Función para agrupar errores
  const groupErrors = (errorList: ErrorEntry[]): ErrorGroup[] => {
    const groups = new Map<string, ErrorEntry[]>();
    
    errorList.forEach(error => {
      const key = `${error.type}-${error.source}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(error);
    });

    return Array.from(groups.entries()).map(([key, groupErrors]) => ({
      key,
      errors: groupErrors,
      totalCount: groupErrors.reduce((sum, e) => sum + e.count, 0),
      firstOccurrence: new Date(Math.min(...groupErrors.map(e => e.timestamp.getTime()))),
      lastOccurrence: new Date(Math.max(...groupErrors.map(e => e.lastOccurrence.getTime())))
    }));
  };

  // Iniciar/detener tracking
  useEffect(() => {
    if (isTracking) {
      // Configurar interceptores de errores
      const setupErrorTracking = () => {
        // Interceptar console.error
        const originalConsoleError = console.error;
        console.error = (...args) => {
          originalConsoleError.apply(console, args);
          const message = args.join(' ');
          addError('error', message, 'console', undefined, { args });
        };

        // Interceptar console.warn
        const originalConsoleWarn = console.warn;
        console.warn = (...args) => {
          originalConsoleWarn.apply(console, args);
          const message = args.join(' ');
          addError('warning', message, 'console', undefined, { args });
        };

        // Interceptar errores no manejados
        const handleUnhandledError = (event: ErrorEvent) => {
          addError('unhandled', event.message, 'react', event.error?.stack, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
          const message = event.reason?.message || event.reason || 'Unhandled Promise Rejection';
          addError('unhandled', message, 'react', event.reason?.stack, {
            reason: event.reason
          });
        };

        // Interceptar errores de red
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
          try {
            const response = await originalFetch(...args);
            if (!response.ok) {
              addError('error', `HTTP ${response.status}: ${response.statusText}`, 'network', undefined, {
                url: args[0],
                status: response.status,
                statusText: response.statusText
              });
            }
            return response;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Network Error';
            addError('error', errorMessage, 'network', error instanceof Error ? error.stack : undefined, {
              url: args[0],
              error
            });
            throw error;
          }
        };

        // Agregar event listeners
        window.addEventListener('error', handleUnhandledError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
          console.error = originalConsoleError;
          console.warn = originalConsoleWarn;
          window.fetch = originalFetch;
          window.removeEventListener('error', handleUnhandledError);
          window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
      };

      const cleanup = setupErrorTracking();
      return cleanup;
    }
  }, [isTracking, addError]);

  // Agrupar errores cuando cambian
  useEffect(() => {
    const filteredErrors = errors.filter(error => {
      if (filters.type !== 'all' && error.type !== filters.type) return false;
      if (filters.source !== 'all' && error.source !== filters.source) return false;
      return true;
    });
    setErrorGroups(groupErrors(filteredErrors));
  }, [errors, filters]);

  const handleClearErrors = () => {
    setErrors([]);
    setErrorGroups([]);
  };

  const handleExportErrors = () => {
    const errorData = {
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      errors: errors.map(e => ({
        ...e,
        timestamp: e.timestamp.toISOString(),
        lastOccurrence: e.lastOccurrence.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getErrorTypeColor = (type: ErrorEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'unhandled': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getErrorTypeIcon = (type: ErrorEntry['type']) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'unhandled': return '💥';
      default: return '❓';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'console': return 'bg-blue-100 text-blue-800';
      case 'network': return 'bg-green-100 text-green-800';
      case 'react': return 'bg-purple-100 text-purple-800';
      case 'websocket': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">🚨 Error Tracker</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTracking(!isTracking)}
            className={`px-3 py-1 rounded text-sm ${
              isTracking 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </button>
          <button
            onClick={handleClearErrors}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear All
          </button>
          <button
            onClick={handleExportErrors}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Export
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div>
          <label className="text-sm font-medium">Type:</label>
                      <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as 'all' | 'error' | 'warning' | 'unhandled' }))}
              className="ml-2 px-2 py-1 border rounded text-sm"
            >
            <option value="all">All Types</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="unhandled">Unhandled</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Source:</label>
                      <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value as 'all' | 'console' | 'network' | 'react' | 'websocket' }))}
              className="ml-2 px-2 py-1 border rounded text-sm"
            >
            <option value="all">All Sources</option>
            <option value="console">Console</option>
            <option value="network">Network</option>
            <option value="react">React</option>
            <option value="websocket">WebSocket</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-red-100">
          <div className="text-2xl font-bold text-red-600">{errors.filter(e => e.type === 'error').length}</div>
          <div className="text-sm text-red-700">Errors</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <div className="text-2xl font-bold text-yellow-600">{errors.filter(e => e.type === 'warning').length}</div>
          <div className="text-sm text-yellow-700">Warnings</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="text-2xl font-bold text-purple-600">{errors.filter(e => e.type === 'unhandled').length}</div>
          <div className="text-sm text-purple-700">Unhandled</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="text-2xl font-bold text-blue-600">{errorGroups.length}</div>
          <div className="text-sm text-blue-700">Groups</div>
        </div>
      </div>

      {/* Grupos de Errores */}
      <div className="space-y-4">
        <h4 className="font-semibold">📊 Error Groups ({errorGroups.length})</h4>
        {errorGroups.map(group => (
          <div key={group.key} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${getSourceColor(group.errors[0].source)}`}>
                  {group.errors[0].source}
                </span>
                <span className={`font-semibold ${getErrorTypeColor(group.errors[0].type)}`}>
                  {getErrorTypeIcon(group.errors[0].type)} {group.errors[0].type.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {group.totalCount} occurrences
              </div>
            </div>
            
            <div className="space-y-2">
              {group.errors.map(error => (
                <div key={error.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{error.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Count: {error.count} | Last: {error.lastOccurrence.toLocaleTimeString()}
                      </div>
                      {error.stack && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">Show Stack Trace</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {errorGroups.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {isTracking ? 'No errors tracked yet' : 'Error tracking is disabled'}
          </div>
        )}
      </div>
    </div>
  );
}; 