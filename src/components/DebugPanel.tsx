import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';
import { useAuthContext } from '../contexts/useAuthContext';
import { WebSocketTest } from './WebSocketTest';
import { RateLimitStats } from './RateLimitStats';
import { AuthDebug } from './AuthDebug';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorTracker } from './ErrorTracker';
import { NetworkMonitor } from './NetworkMonitor';
import { AdvancedWebSocket } from './AdvancedWebSocket';
import { ConsoleExporter } from './ConsoleExporter';
import '../styles/consoleExporter.css';

interface DebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  icon: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onClose }) => {
  const { isConnected, isSynced, connectionError, socket, emit, activeConversations, typingUsers, onlineUsers } = useWebSocketContext();
  const auth = useAuthContext();
  const [activeTab, setActiveTab] = useState<'estado' | 'websocket' | 'auth' | 'logs' | 'tools' | 'performance' | 'errors' | 'network' | 'advanced' | 'console'>('estado');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Función para agregar logs
  const addLog = useCallback((level: LogEntry['level'], message: string, icon: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      icon
    };
    setLogs(prev => [...prev.slice(-49), newLog]); // Mantener solo los últimos 50 logs
  }, []);

  // Auto-scroll para logs
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Interceptar console.log para capturar logs (SOLUCIONADO: Evitar bucle infinito)
  useEffect(() => {
    // Verificar si ya se interceptó para evitar re-intercepción
    if ((console as { _debugPanelIntercepted?: boolean })._debugPanelIntercepted) {
      return;
    }

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog.apply(console, args);
      // Solo agregar log si el panel está visible para evitar re-renders innecesarios
      if (isVisible) {
        // Usar setTimeout para evitar el bucle infinito
        setTimeout(() => {
          addLog('info', args.join(' '), '📝');
        }, 0);
      }
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      if (isVisible) {
        setTimeout(() => {
          addLog('warn', args.join(' '), '⚠️');
        }, 0);
      }
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      if (isVisible) {
        setTimeout(() => {
          addLog('error', args.join(' '), '❌');
        }, 0);
      }
    };

    // Marcar como interceptado
    (console as { _debugPanelIntercepted?: boolean })._debugPanelIntercepted = true;

    return () => {
      // Solo restaurar si el panel se desmonta completamente
      if (!isVisible) {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
        (console as { _debugPanelIntercepted?: boolean })._debugPanelIntercepted = false;
      }
    };
  }, [isVisible, addLog]); // Incluir addLog en las dependencias

  const handleTestConnection = () => {
    if (emit) {
      emit('test-connection', { timestamp: Date.now() });
      addLog('info', 'Test de conexión enviado', '🔌');
    }
  };

  const handleManualConnect = () => {
    const token = localStorage.getItem('access_token');
    if (token && socket) {
      console.log('🔌 Conectando manualmente...');
      socket.connect();
      addLog('info', 'Conexión manual iniciada', '🔌');
    } else {
      addLog('error', 'No hay token o socket disponible', '❌');
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs limpiados', '🧹');
  };

  const handleExportLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toLocaleTimeString()}] ${log.icon} ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('success', 'Logs exportados', '📤');
  };

  const handleRefreshState = () => {
    addLog('info', 'Estado refrescado', '🔄');
    window.location.reload();
  };

  // Función para obtener información de memoria
  const getMemoryInfo = () => {
    const perf = performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } };
    if (perf.memory) {
      return `${Math.round(perf.memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(perf.memory.totalJSHeapSize / 1024 / 1024)}MB`;
    }
    return 'N/A';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Debug Panel Pro</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4 overflow-x-auto">
          {[
            { id: 'estado', label: 'Estado', icon: '📊' },
            { id: 'websocket', label: 'WebSocket', icon: '🔌' },
            { id: 'auth', label: 'Auth', icon: '🔐' },
            { id: 'logs', label: 'Logs', icon: '📋' },
            { id: 'console', label: 'Console', icon: '🔍' },
            { id: 'performance', label: 'Performance', icon: '⚡' },
            { id: 'errors', label: 'Errors', icon: '🚨' },
            { id: 'network', label: 'Network', icon: '🌐' },
            { id: 'advanced', label: 'Advanced', icon: '🔧' },
            { id: 'tools', label: 'Tools', icon: '🛠️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'estado' | 'websocket' | 'auth' | 'logs' | 'console' | 'tools' | 'performance' | 'errors' | 'network' | 'advanced')}
              className={`px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'estado' && (
            <div className="space-y-4">
              {/* Estado General */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Estado de Autenticación */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                  <h3 className="font-semibold mb-2 flex items-center">
                    🔐 Estado de Autenticación
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${auth.isAuthenticated ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {auth.isAuthenticated ? 'AUTENTICADO' : 'NO AUTENTICADO'}
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Autenticado: <span className={auth.isAuthenticated ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{auth.isAuthenticated ? 'Sí' : 'No'}</span></div>
                    <div>Cargando: <span className={auth.loading ? 'text-yellow-600' : 'text-green-600'}>{auth.loading ? 'Sí' : 'No'}</span></div>
                    <div>Usuario Backend: <span className={auth.backendUser ? 'text-green-600' : 'text-red-600'}>{auth.backendUser ? 'Sí' : 'No'}</span></div>
                    <div>Token: <span className={localStorage.getItem('access_token') ? 'text-green-600' : 'text-red-600'}>{localStorage.getItem('access_token') ? 'Disponible' : 'No disponible'}</span></div>
                  </div>
                </div>

                {/* Estado del WebSocket */}
                <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
                  <h3 className="font-semibold mb-2 flex items-center">
                    🔌 Estado del WebSocket
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {isConnected ? 'CONECTADO' : 'DESCONECTADO'}
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Conectado: <span className={isConnected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{isConnected ? 'Sí' : 'No'}</span></div>
                    <div>Sincronizado: <span className={isSynced ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>{isSynced ? 'Sí' : 'No'}</span></div>
                    <div>Socket ID: <span className="text-gray-600 font-mono text-xs">{socket?.id || 'N/A'}</span></div>
                    <div>Error: <span className={connectionError ? 'text-red-600' : 'text-green-600'}>{connectionError || 'Ninguno'}</span></div>
                    <div>Conversaciones Activas: <span className="text-blue-600 font-semibold">{activeConversations.size}</span></div>
                    <div>Usuarios Online: <span className="text-green-600 font-semibold">{onlineUsers.size}</span></div>
                  </div>
                </div>
              </div>

              {/* Variables de Entorno */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100">
                <h3 className="font-semibold mb-2">⚙️ Variables de Entorno</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>VITE_WS_URL: <span className="text-gray-600 font-mono text-xs break-all">{import.meta.env.VITE_WS_URL || 'No definida'}</span></div>
                  <div>VITE_BACKEND_URL: <span className="text-gray-600 font-mono text-xs break-all">{import.meta.env.VITE_BACKEND_URL || 'No definida'}</span></div>
                  <div>VITE_API_URL: <span className="text-gray-600 font-mono text-xs break-all">{import.meta.env.VITE_API_URL || 'No definida'}</span></div>
                  <div>VITE_DEV_MODE: <span className="text-gray-600 font-mono text-xs">{import.meta.env.VITE_DEV_MODE || 'No definida'}</span></div>
                </div>
              </div>

              {/* Estadísticas de Rate Limiting */}
              <RateLimitStats />
            </div>
          )}

          {activeTab === 'websocket' && (
            <div className="space-y-4">
              <WebSocketTest />
              
              {/* Conversaciones Activas */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                <h3 className="font-semibold mb-2">💬 Conversaciones Activas ({activeConversations.size})</h3>
                <div className="space-y-2">
                  {Array.from(activeConversations).map(convId => (
                    <div key={convId} className="bg-white p-2 rounded border text-sm">
                      <span className="font-mono">{convId}</span>
                    </div>
                  ))}
                  {activeConversations.size === 0 && (
                    <div className="text-gray-500 text-sm">No hay conversaciones activas</div>
                  )}
                </div>
              </div>

              {/* Usuarios Escribiendo */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
                <h3 className="font-semibold mb-2">✍️ Usuarios Escribiendo</h3>
                <div className="space-y-2">
                  {Array.from(typingUsers.entries()).map(([convId, users]) => (
                    <div key={convId} className="bg-white p-2 rounded border text-sm">
                      <div className="font-semibold">{convId}</div>
                      <div className="text-gray-600">
                        {Array.from(users).join(', ') || 'Ninguno'}
                      </div>
                    </div>
                  ))}
                  {typingUsers.size === 0 && (
                    <div className="text-gray-500 text-sm">No hay usuarios escribiendo</div>
                  )}
                </div>
              </div>

              {/* Usuarios Online */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
                <h3 className="font-semibold mb-2">🟢 Usuarios Online ({onlineUsers.size})</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(onlineUsers).map(userId => (
                    <span key={userId} className="bg-white px-2 py-1 rounded border text-sm font-mono">
                      {userId}
                    </span>
                  ))}
                  {onlineUsers.size === 0 && (
                    <div className="text-gray-500 text-sm">No hay usuarios online</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auth' && (
            <AuthDebug />
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              {/* Controles de Logs */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">📋 Logs en Tiempo Real ({logs.length})</h3>
                <div className="flex gap-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="mr-2"
                    />
                    Auto-scroll
                  </label>
                  <button
                    onClick={handleClearLogs}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={handleExportLogs}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Exportar
                  </button>
                </div>
              </div>

              {/* Logs */}
              <div className="bg-gray-100 p-4 rounded text-xs font-mono h-96 overflow-y-auto">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className={`mb-1 ${
                      log.level === 'error' ? 'text-red-600' :
                      log.level === 'warn' ? 'text-yellow-600' :
                      log.level === 'success' ? 'text-green-600' :
                      'text-gray-700'
                    }`}
                  >
                    <span className="text-gray-500">[{log.timestamp.toLocaleTimeString()}]</span>
                    <span className="ml-2">{log.icon}</span>
                    <span className="ml-1">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <PerformanceMonitor />
          )}

          {activeTab === 'errors' && (
            <ErrorTracker />
          )}

          {activeTab === 'network' && (
            <NetworkMonitor />
          )}

          {activeTab === 'advanced' && (
            <AdvancedWebSocket />
          )}

          {activeTab === 'console' && (
            <div className="space-y-4">
              <h3 className="font-semibold">🔍 Console Exporter</h3>
              <ConsoleExporter />
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4">
              <h3 className="font-semibold">🛠️ Herramientas de Debug</h3>
              
              {/* Acciones de WebSocket */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
                <h4 className="font-semibold mb-2">🔌 Acciones de WebSocket</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={!isConnected}
                    className="px-3 py-2 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-blue-600"
                  >
                    Test Connection
                  </button>
                  <button
                    onClick={handleManualConnect}
                    disabled={isConnected}
                    className="px-3 py-2 bg-green-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-green-600"
                  >
                    Conectar Manualmente
                  </button>
                  <button
                    onClick={() => {
                      if (socket) {
                        socket.disconnect();
                        addLog('info', 'WebSocket desconectado manualmente', '🔌');
                      }
                    }}
                    disabled={!isConnected}
                    className="px-3 py-2 bg-red-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-red-600"
                  >
                    Desconectar
                  </button>
                </div>
              </div>

              {/* Acciones de Estado */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                <h4 className="font-semibold mb-2">🔄 Acciones de Estado</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleRefreshState}
                    className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                  >
                    Refrescar Estado
                  </button>
                  <button
                    onClick={() => {
                      addLog('info', 'Estado actual del sistema', '📊');
                      console.log('=== ESTADO COMPLETO DEL SISTEMA ===');
                      console.log('Auth:', auth);
                      console.log('WebSocket:', { isConnected, connectionError, socket: socket?.id });
                      console.log('LocalStorage:', {
                        accessToken: localStorage.getItem('access_token') ? 'Disponible' : 'No disponible',
                        refreshToken: localStorage.getItem('refresh_token') ? 'Disponible' : 'No disponible',
                        user: localStorage.getItem('user') ? 'Disponible' : 'No disponible'
                      });
                      console.log('Conversaciones activas:', Array.from(activeConversations));
                      console.log('Usuarios escribiendo:', Array.from(typingUsers.entries()));
                      console.log('Usuarios online:', Array.from(onlineUsers));
                      console.log('=====================================');
                    }}
                    className="px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                  >
                    Log Estado Completo
                  </button>
                </div>
              </div>

              {/* Información del Sistema */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                <h4 className="font-semibold mb-2">💻 Información del Sistema</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>User Agent: <span className="text-gray-600 font-mono text-xs break-all">{navigator.userAgent}</span></div>
                  <div>URL Actual: <span className="text-gray-600 font-mono text-xs break-all">{window.location.href}</span></div>
                  <div>Timestamp: <span className="text-gray-600 font-mono text-xs">{new Date().toISOString()}</span></div>
                  <div>Memoria: <span className="text-gray-600 font-mono text-xs">{getMemoryInfo()}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 