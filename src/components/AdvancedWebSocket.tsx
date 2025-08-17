import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocketContext } from '../contexts/useWebSocketContext';

interface WebSocketEvent {
  id: string;
  timestamp: Date;
  type: 'sent' | 'received' | 'error' | 'connection';
  event: string;
  data: unknown;
  size: number;
  latency?: number;
}

interface WebSocketMetrics {
  totalEvents: number;
  sentEvents: number;
  receivedEvents: number;
  errorEvents: number;
  averageLatency: number;
  totalDataTransferred: number;
  eventsPerMinute: number;
  connectionUptime: number;
}

export const AdvancedWebSocket: React.FC = () => {
  const { socket, isConnected, connectionError, emit } = useWebSocketContext();
  const [events, setEvents] = useState<WebSocketEvent[]>([]);
  const [metrics, setMetrics] = useState<WebSocketMetrics>({
    totalEvents: 0,
    sentEvents: 0,
    receivedEvents: 0,
    errorEvents: 0,
    averageLatency: 0,
    totalDataTransferred: 0,
    eventsPerMinute: 0,
    connectionUptime: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectionStartTime, setConnectionStartTime] = useState<Date | null>(null);
  const [pingResults, setPingResults] = useState<{ timestamp: Date; latency: number }[]>([]);

  // Función para agregar evento
  const addEvent = (type: WebSocketEvent['type'], event: string, data: unknown, latency?: number) => {
    const newEvent: WebSocketEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      event,
      data,
      size: JSON.stringify(data).length,
      latency
    };
    
    setEvents(prev => [...prev.slice(-99), newEvent]); // Mantener solo los últimos 100 eventos
  };

  // Función para calcular métricas
  const calculateMetrics = useCallback((eventList: WebSocketEvent[]): WebSocketMetrics => {
    const total = eventList.length;
    const sent = eventList.filter(e => e.type === 'sent').length;
    const received = eventList.filter(e => e.type === 'received').length;
    const errors = eventList.filter(e => e.type === 'error').length;
    
    const latencies = eventList.filter(e => e.latency !== undefined).map(e => e.latency!);
    const avgLatency = latencies.length > 0 ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length : 0;
    
    const totalData = eventList.reduce((sum, e) => sum + e.size, 0);
    
    // Calcular eventos por minuto (últimos 60 segundos)
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentEvents = eventList.filter(e => e.timestamp > oneMinuteAgo).length;
    
    // Calcular tiempo de conexión
    const uptime = connectionStartTime ? Date.now() - connectionStartTime.getTime() : 0;
    
    return {
      totalEvents: total,
      sentEvents: sent,
      receivedEvents: received,
      errorEvents: errors,
      averageLatency: Math.round(avgLatency),
      totalDataTransferred: totalData,
      eventsPerMinute: recentEvents,
      connectionUptime: uptime
    };
  }, [connectionStartTime]);

  // Función para realizar ping
  const performPing = async () => {
    if (!emit) return;
    
    const startTime = performance.now();
    const pingId = Date.now();
    
    try {
      emit('ping', { id: pingId, timestamp: startTime });
      
      // Simular respuesta (en un caso real, esto vendría del servidor)
      setTimeout(() => {
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        setPingResults(prev => [...prev.slice(-19), { timestamp: new Date(), latency }]);
        addEvent('received', 'pong', { id: pingId, latency }, latency);
      }, 100);
      
      addEvent('sent', 'ping', { id: pingId, timestamp: startTime });
    } catch (error) {
      addEvent('error', 'ping-failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  // Función para simular eventos de WebSocket
  const simulateEvents = () => {
    if (!emit) return;
    
    const eventTypes = ['test-message', 'user-typing', 'message-read', 'status-update'];
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const randomData = { 
      message: `Test message ${Date.now()}`,
      userId: 'test-user',
      timestamp: new Date().toISOString()
    };
    
    emit(randomEvent, randomData);
    addEvent('sent', randomEvent, randomData);
  };

  // Función para analizar patrones de eventos
  const analyzeEventPatterns = () => {
    const eventCounts = new Map<string, number>();
    const hourlyDistribution = new Array(24).fill(0);
    
    events.forEach(event => {
      // Contar tipos de eventos
      const key = `${event.type}-${event.event}`;
      eventCounts.set(key, (eventCounts.get(key) || 0) + 1);
      
      // Distribución por hora
      const hour = event.timestamp.getHours();
      hourlyDistribution[hour]++;
    });
    
    return {
      eventCounts: Array.from(eventCounts.entries()).sort((a, b) => b[1] - a[1]),
      hourlyDistribution
    };
  };

  // Configurar monitoreo
  useEffect(() => {
    if (isConnected && !connectionStartTime) {
      setConnectionStartTime(new Date());
    } else if (!isConnected) {
      setConnectionStartTime(null);
    }
  }, [isConnected, connectionStartTime]);

  // Calcular métricas cuando cambian los eventos
  useEffect(() => {
    setMetrics(calculateMetrics(events));
  }, [events, connectionStartTime, calculateMetrics]);

  // Actualizar tiempo de conexión cada segundo
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        connectionUptime: connectionStartTime ? Date.now() - connectionStartTime.getTime() : 0
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, connectionStartTime]);

  const handleClearEvents = () => {
    setEvents([]);
    setPingResults([]);
  };

  const handleExportData = () => {
    const analysis = analyzeEventPatterns();
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      events: events.map(e => ({
        ...e,
        timestamp: e.timestamp.toISOString()
      })),
      pingResults: pingResults.map(p => ({
        ...p,
        timestamp: p.timestamp.toISOString()
      })),
      analysis
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `websocket-analysis-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEventTypeColor = (type: WebSocketEvent['type']) => {
    switch (type) {
      case 'sent': return 'text-blue-600';
      case 'received': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'connection': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getEventTypeIcon = (type: WebSocketEvent['type']) => {
    switch (type) {
      case 'sent': return '📤';
      case 'received': return '📥';
      case 'error': return '❌';
      case 'connection': return '🔌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">🔧 Advanced WebSocket</h3>
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
            onClick={performPing}
            disabled={!isConnected}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-blue-600"
          >
            Ping Test
          </button>
          <button
            onClick={simulateEvents}
            disabled={!isConnected}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm disabled:bg-gray-300 hover:bg-purple-600"
          >
            Simulate Events
          </button>
          <button
            onClick={handleClearEvents}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear All
          </button>
          <button
            onClick={handleExportData}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Estado de Conexión */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <h4 className="font-semibold mb-2">🔌 Connection Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Status</div>
            <div className={isConnected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Socket ID</div>
            <div className="font-mono text-xs">{socket?.id || 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-600">Uptime</div>
            <div className="font-semibold">{formatUptime(metrics.connectionUptime)}</div>
          </div>
          <div>
            <div className="text-gray-600">Error</div>
            <div className="text-red-600 text-xs">{connectionError || 'None'}</div>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="text-2xl font-bold text-blue-600">{metrics.totalEvents}</div>
          <div className="text-sm text-blue-700">Total Events</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
          <div className="text-2xl font-bold text-green-600">{metrics.sentEvents}</div>
          <div className="text-sm text-green-700">Sent</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="text-2xl font-bold text-purple-600">{metrics.receivedEvents}</div>
          <div className="text-sm text-purple-700">Received</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-red-50 to-red-100">
          <div className="text-2xl font-bold text-red-600">{metrics.errorEvents}</div>
          <div className="text-sm text-red-700">Errors</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <div className="text-2xl font-bold text-yellow-600">{metrics.averageLatency}ms</div>
          <div className="text-sm text-yellow-700">Avg Latency</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <div className="text-2xl font-bold text-indigo-600">{formatBytes(metrics.totalDataTransferred)}</div>
          <div className="text-sm text-indigo-700">Data Transferred</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-pink-50 to-pink-100">
          <div className="text-2xl font-bold text-pink-600">{metrics.eventsPerMinute}</div>
          <div className="text-sm text-pink-700">Events/Min</div>
        </div>
        <div className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="text-2xl font-bold text-gray-600">{pingResults.length}</div>
          <div className="text-sm text-gray-700">Ping Tests</div>
        </div>
      </div>

      {/* Gráfico de Latencia */}
      {pingResults.length > 0 && (
        <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-green-100">
          <h4 className="font-semibold mb-2">📊 Latency History</h4>
          <div className="h-16 bg-white rounded flex items-end gap-px">
            {pingResults.map((ping, index) => (
              <div
                key={index}
                className={`flex-1 transition-all duration-300 ${
                  ping.latency > 100 ? 'bg-red-500' :
                  ping.latency > 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ height: `${Math.min((ping.latency / 200) * 100, 100)}%` }}
                title={`${ping.latency.toFixed(1)}ms at ${ping.timestamp.toLocaleTimeString()}`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Average: {pingResults.reduce((sum, p) => sum + p.latency, 0) / pingResults.length}ms
          </div>
        </div>
      )}

      {/* Análisis de Patrones */}
      {isMonitoring && (
        <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-purple-100">
          <h4 className="font-semibold mb-2">📈 Event Pattern Analysis</h4>
          <div className="space-y-2">
            {analyzeEventPatterns().eventCounts.slice(0, 5).map(([event, count]) => (
              <div key={event} className="flex justify-between items-center">
                <span className="text-sm font-mono">{event}</span>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Eventos */}
      <div className="space-y-4">
        <h4 className="font-semibold">📋 Recent Events ({events.length})</h4>
        <div className="max-h-96 overflow-y-auto space-y-2 no-scrollbar">
          {events.map(event => (
            <div key={event.id} className="border rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${getEventTypeColor(event.type)}`}>
                    {getEventTypeIcon(event.type)} {event.type.toUpperCase()}
                  </span>
                  <span className="text-sm font-mono">{event.event}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatBytes(event.size)}
                  {event.latency && <span className="ml-2">| {event.latency.toFixed(1)}ms</span>}
                </div>
              </div>
              <div className="mt-2">
                <div className="text-xs font-mono text-gray-700 truncate">
                  {JSON.stringify(event.data).substring(0, 100)}
                  {JSON.stringify(event.data).length > 100 && '...'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {event.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {events.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {isMonitoring ? 'No events tracked yet' : 'Event monitoring is disabled'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 