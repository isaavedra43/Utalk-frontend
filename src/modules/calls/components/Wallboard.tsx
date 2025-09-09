import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Phone, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

export const Wallboard: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Datos mock para demostración
  const [wallboardData, setWallboardData] = useState({
    queues: [
      {
        id: 'queue_1',
        name: 'Soporte',
        callsInQueue: 5,
        callsWaiting: 3,
        averageWaitTime: 120,
        serviceLevel: 85,
        abandonmentRate: 12,
        occupancyRate: 78,
        agentCount: 8,
        availableAgents: 3,
        busyAgents: 5,
      },
      {
        id: 'queue_2',
        name: 'Ventas',
        callsInQueue: 2,
        callsWaiting: 1,
        averageWaitTime: 45,
        serviceLevel: 95,
        abandonmentRate: 5,
        occupancyRate: 65,
        agentCount: 6,
        availableAgents: 4,
        busyAgents: 2,
      },
      {
        id: 'queue_3',
        name: 'VIP',
        callsInQueue: 0,
        callsWaiting: 0,
        averageWaitTime: 0,
        serviceLevel: 100,
        abandonmentRate: 0,
        occupancyRate: 45,
        agentCount: 3,
        availableAgents: 2,
        busyAgents: 1,
      }
    ],
    agents: [
      {
        id: 'agent_1',
        name: 'Ana García',
        status: 'busy',
        queue: 'Soporte',
        callsToday: 15,
        averageHandleTime: 480,
        serviceLevel: 90,
        lastCallTime: new Date('2024-11-22T14:30:00'),
      },
      {
        id: 'agent_2',
        name: 'Carlos Rodríguez',
        status: 'available',
        queue: 'Ventas',
        callsToday: 12,
        averageHandleTime: 360,
        serviceLevel: 95,
        lastCallTime: new Date('2024-11-22T14:15:00'),
      },
      {
        id: 'agent_3',
        name: 'María López',
        status: 'acw',
        queue: 'Soporte',
        callsToday: 18,
        averageHandleTime: 420,
        serviceLevel: 88,
        lastCallTime: new Date('2024-11-22T14:45:00'),
      }
    ],
    metrics: {
      totalCalls: 156,
      answeredCalls: 142,
      missedCalls: 14,
      averageWaitTime: 95,
      serviceLevel: 91,
      abandonmentRate: 9,
      occupancyRate: 72,
      averageHandleTime: 420,
      firstCallResolution: 85,
      customerSatisfaction: 4.2,
    }
  });

  // Simular actualización de datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setWallboardData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          totalCalls: prev.metrics.totalCalls + Math.floor(Math.random() * 3),
          answeredCalls: prev.metrics.answeredCalls + Math.floor(Math.random() * 2),
          averageWaitTime: Math.max(30, prev.metrics.averageWaitTime + Math.floor(Math.random() * 20) - 10),
          serviceLevel: Math.min(100, Math.max(70, prev.metrics.serviceLevel + Math.floor(Math.random() * 6) - 3)),
        }
      }));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'acw':
        return 'bg-yellow-500';
      case 'break':
        return 'bg-blue-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'busy':
        return 'Ocupado';
      case 'acw':
        return 'ACW';
      case 'break':
        return 'Pausa';
      case 'offline':
        return 'Desconectado';
      default:
        return 'Desconocido';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeDate = (date: Date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <div className={`${isFullscreen ? 'h-full overflow-hidden' : 'space-y-6'}`}>
        {/* Header del wallboard */}
        <div className={`${isFullscreen ? 'bg-black text-white p-4' : 'bg-white p-4 rounded-lg border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                Wallboard en Tiempo Real
              </h2>
              <p className={`text-sm ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                Monitoreo de colas y agentes - Actualizado cada {refreshInterval}s
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className={`px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isFullscreen ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                }`}
              >
                <option value={10}>10 segundos</option>
                <option value={30}>30 segundos</option>
                <option value={60}>1 minuto</option>
                <option value={300}>5 minutos</option>
              </select>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`p-2 rounded-lg transition-colors ${
                  isFullscreen ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isFullscreen ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isFullscreen ? 'p-4' : ''}`}>
          <div className={`p-6 rounded-lg border ${isFullscreen ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                  Llamadas Totales
                </p>
                <p className={`text-2xl font-bold ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                  {wallboardData.metrics.totalCalls}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isFullscreen ? 'bg-blue-800' : 'bg-blue-100'
              }`}>
                <Phone className={`h-6 w-6 ${isFullscreen ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${isFullscreen ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                  Nivel de Servicio
                </p>
                <p className={`text-2xl font-bold ${wallboardData.metrics.serviceLevel >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {wallboardData.metrics.serviceLevel}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isFullscreen ? 'bg-green-800' : 'bg-green-100'
              }`}>
                <CheckCircle className={`h-6 w-6 ${isFullscreen ? 'text-green-400' : 'text-green-600'}`} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${isFullscreen ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                  Tiempo Promedio de Espera
                </p>
                <p className={`text-2xl font-bold ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(wallboardData.metrics.averageWaitTime)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isFullscreen ? 'bg-yellow-800' : 'bg-yellow-100'
              }`}>
                <Clock className={`h-6 w-6 ${isFullscreen ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${isFullscreen ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                  Tasa de Abandono
                </p>
                <p className={`text-2xl font-bold ${wallboardData.metrics.abandonmentRate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {wallboardData.metrics.abandonmentRate}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isFullscreen ? 'bg-red-800' : 'bg-red-100'
              }`}>
                <XCircle className={`h-6 w-6 ${isFullscreen ? 'text-red-400' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Colas */}
        <div className={`${isFullscreen ? 'p-4' : ''}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
            Estado de las Colas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wallboardData.queues.map((queue) => (
              <div key={queue.id} className={`p-6 rounded-lg border ${
                isFullscreen ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-semibold ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                    {queue.name}
                  </h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    queue.callsInQueue > 5 ? 'bg-red-100 text-red-800' :
                    queue.callsInQueue > 2 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {queue.callsInQueue} en cola
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                      Llamadas esperando:
                    </span>
                    <span className={`text-sm font-medium ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                      {queue.callsWaiting}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                      Tiempo promedio:
                    </span>
                    <span className={`text-sm font-medium ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(queue.averageWaitTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                      Nivel de servicio:
                    </span>
                    <span className={`text-sm font-medium ${
                      queue.serviceLevel >= 90 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {queue.serviceLevel}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                      Agentes disponibles:
                    </span>
                    <span className={`text-sm font-medium ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                      {queue.availableAgents}/{queue.agentCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agentes */}
        <div className={`${isFullscreen ? 'p-4' : ''}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
            Estado de los Agentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallboardData.agents.map((agent) => (
              <div key={agent.id} className={`p-4 rounded-lg border ${
                isFullscreen ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-semibold ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                    {agent.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                    <span className={`text-xs ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                      {getStatusText(agent.status)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                      Cola:
                    </span>
                    <span className={`text-xs font-medium ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                      {agent.queue}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                      Llamadas hoy:
                    </span>
                    <span className={`text-xs font-medium ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                      {agent.callsToday}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                      AHT:
                    </span>
                    <span className={`text-xs font-medium ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(agent.averageHandleTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isFullscreen ? 'text-gray-300' : 'text-gray-600'}`}>
                      SL:
                    </span>
                    <span className={`text-xs font-medium ${
                      agent.serviceLevel >= 90 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {agent.serviceLevel}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
