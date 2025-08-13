import React, { useState, useEffect } from 'react';
import { logger, LogLevel, LogCategory, type LogEntry } from '../utils/logger';

interface DebugPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible = false, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<LogCategory | 'ALL'>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Función para actualizar logs
    const updateLogs = () => {
      let filteredLogs = logger.getLogs();
      
      if (filterLevel !== 'ALL') {
        filteredLogs = filteredLogs.filter(log => log.level === filterLevel);
      }
      
      if (filterCategory !== 'ALL') {
        filteredLogs = filteredLogs.filter(log => log.category === filterCategory);
      }
      
      setLogs(filteredLogs);
    };

    // Actualizar logs cada segundo
    const interval = setInterval(updateLogs, 1000);
    
    return () => clearInterval(interval);
  }, [filterLevel, filterCategory]);

  // Auto-scroll al final
  useEffect(() => {
    if (autoScroll) {
      const logContainer = document.getElementById('debug-logs');
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }
  }, [logs, autoScroll]);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG: return 'text-gray-500';
      case LogLevel.INFO: return 'text-blue-600';
      case LogLevel.WARN: return 'text-yellow-600';
      case LogLevel.ERROR: return 'text-red-600';
      case LogLevel.CRITICAL: return 'text-red-800 font-bold';
      default: return 'text-gray-700';
    }
  };

  const getCategoryColor = (category: LogCategory) => {
    switch (category) {
      case LogCategory.AUTH: return 'bg-blue-100 text-blue-800';
      case LogCategory.FIREBASE: return 'bg-orange-100 text-orange-800';
      case LogCategory.BACKEND: return 'bg-green-100 text-green-800';
      case LogCategory.WEBSOCKET: return 'bg-purple-100 text-purple-800';
      case LogCategory.API: return 'bg-indigo-100 text-indigo-800';
      case LogCategory.CONFIG: return 'bg-gray-100 text-gray-800';
      case LogCategory.CHAT: return 'bg-pink-100 text-pink-800';
      case LogCategory.SYSTEM: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const exportLogs = () => {
    const logData = logger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utalk-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Debug Panel</h3>
        <div className="flex space-x-2">
          <button
            onClick={clearLogs}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear
          </button>
          <button
            onClick={exportLogs}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Export
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              title="Close Debug Panel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-3 border-b border-gray-200">
        <div className="flex space-x-2 mb-2">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'ALL')}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="ALL">All Levels</option>
            <option value={LogLevel.DEBUG}>Debug</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.WARN}>Warn</option>
            <option value={LogLevel.ERROR}>Error</option>
            <option value={LogLevel.CRITICAL}>Critical</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as LogCategory | 'ALL')}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="ALL">All Categories</option>
            <option value={LogCategory.AUTH}>Auth</option>
            <option value={LogCategory.FIREBASE}>Firebase</option>
            <option value={LogCategory.BACKEND}>Backend</option>
            <option value={LogCategory.WEBSOCKET}>WebSocket</option>
            <option value={LogCategory.API}>API</option>
            <option value={LogCategory.CONFIG}>Config</option>
            <option value={LogCategory.CHAT}>Chat</option>
            <option value={LogCategory.SYSTEM}>System</option>
          </select>
        </div>

        <label className="flex items-center text-xs">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="mr-1"
          />
          Auto-scroll
        </label>
      </div>

      <div
        id="debug-logs"
        className="h-64 overflow-y-auto p-2 bg-gray-50 text-xs font-mono"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No logs to display</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 p-1 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <span className={`${getLevelColor(log.level)} font-semibold`}>
                  {log.level}
                </span>
                <span className={`px-1 py-0.5 rounded text-xs ${getCategoryColor(log.category)}`}>
                  {log.category}
                </span>
                <span className="text-gray-500 text-xs">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 text-gray-700">{log.message}</div>
              {log.data && (
                <div className="mt-1 text-gray-600">
                  <details>
                    <summary className="cursor-pointer text-xs">Data</summary>
                    <pre className="text-xs mt-1 bg-gray-100 p-1 rounded overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
              {log.error && (
                <div className="mt-1 text-red-600">
                  <details>
                    <summary className="cursor-pointer text-xs">Error</summary>
                    <div className="text-xs mt-1 bg-red-50 p-1 rounded">
                      {log.error.message}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 