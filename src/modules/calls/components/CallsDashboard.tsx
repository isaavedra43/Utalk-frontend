import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Headphones,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  Target,
  Award,
  Globe,
  Wifi,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  SignalZero
} from 'lucide-react';

import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Button } from '../../../components/ui/button';
import { Avatar } from '../../../components/ui/avatar';

import { CallAnalytics, CallsView } from '../../../types/calls';

interface CallsDashboardProps {
  analytics: CallAnalytics;
  realTimeMetrics: {
    totalCalls: number;
    activeCalls: number;
    queuedCalls: number;
    availableAgents: number;
    serviceLevel: number;
  };
  onViewChange: (view: CallsView) => void;
}

export const CallsDashboard: React.FC<CallsDashboardProps> = ({
  analytics,
  realTimeMetrics,
  onViewChange
}) => {
  // Datos mock para el dashboard
  const mockData = {
    kpis: [
      {
        title: 'Llamadas Totales',
        value: 1247,
        change: '+12.5%',
        trend: 'up',
        icon: PhoneCall,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        title: 'Llamadas Activas',
        value: realTimeMetrics.activeCalls,
        change: '+3',
        trend: 'up',
        icon: Activity,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        title: 'Agentes Disponibles',
        value: realTimeMetrics.availableAgents,
        change: '-2',
        trend: 'down',
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        title: 'Nivel de Servicio',
        value: `${realTimeMetrics.serviceLevel}%`,
        change: '+5.2%',
        trend: 'up',
        icon: Target,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      }
    ],
    queues: [
      {
        id: '1',
        name: 'Ventas',
        activeCalls: 8,
        queuedCalls: 3,
        agentsAvailable: 5,
        averageWaitTime: 45,
        serviceLevel: 85,
        status: 'healthy'
      },
      {
        id: '2',
        name: 'Soporte',
        activeCalls: 12,
        queuedCalls: 7,
        agentsAvailable: 8,
        averageWaitTime: 120,
        serviceLevel: 72,
        status: 'warning'
      },
      {
        id: '3',
        name: 'VIP',
        activeCalls: 2,
        queuedCalls: 0,
        agentsAvailable: 3,
        averageWaitTime: 15,
        serviceLevel: 98,
        status: 'healthy'
      },
      {
        id: '4',
        name: 'Español',
        activeCalls: 5,
        queuedCalls: 2,
        agentsAvailable: 4,
        averageWaitTime: 60,
        serviceLevel: 78,
        status: 'healthy'
      }
    ],
    recentCalls: [
      {
        id: '1',
        direction: 'inbound',
        from: '+52 55 1234 5678',
        to: '+1 555 0123',
        agent: 'María González',
        duration: '00:03:45',
        status: 'completed',
        queue: 'Ventas',
        sentiment: 'positive',
        recording: true
      },
      {
        id: '2',
        direction: 'outbound',
        from: '+1 555 0123',
        to: '+52 55 9876 5432',
        agent: 'Carlos Ruiz',
        duration: '00:02:15',
        status: 'completed',
        queue: 'Soporte',
        sentiment: 'neutral',
        recording: true
      },
      {
        id: '3',
        direction: 'inbound',
        from: '+52 55 1111 2222',
        to: '+1 555 0123',
        agent: 'Ana Martínez',
        duration: '00:01:30',
        status: 'completed',
        queue: 'VIP',
        sentiment: 'positive',
        recording: true
      }
    ],
    alerts: [
      {
        id: '1',
        type: 'sla',
        severity: 'high',
        message: 'Cola de Soporte: SLA por debajo del 80%',
        queue: 'Soporte',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: '2',
        type: 'abandon',
        severity: 'medium',
        message: 'Tasa de abandono alta en Cola de Ventas',
        queue: 'Ventas',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard de Llamadas</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">Vista general del sistema de llamadas en tiempo real</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Sistema activo</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewChange('analytics')}
            className="w-full sm:w-auto"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Ver Analítica</span>
            <span className="sm:hidden">Analítica</span>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {mockData.kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                    <div className="flex items-center mt-2">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg ${kpi.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${kpi.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Estado de Colas */}
        <div className="lg:col-span-2">
          <Card className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">Estado de Colas</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewChange('queues')}
                className="w-full sm:w-auto"
              >
                Ver todas
              </Button>
            </div>
            <div className="space-y-4">
              {mockData.queues.map((queue, index) => (
                <motion.div
                  key={queue.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{queue.name}</h3>
                      <p className="text-sm text-gray-600">
                        {queue.activeCalls} activas • {queue.queuedCalls} en cola
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Tiempo promedio</p>
                      <p className="font-medium text-gray-900">{queue.averageWaitTime}s</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Nivel de servicio</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={queue.serviceLevel} className="w-16" />
                        <span className="text-sm font-medium text-gray-900">{queue.serviceLevel}%</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(queue.status)}>
                      {queue.status === 'healthy' ? 'Saludable' : 
                       queue.status === 'warning' ? 'Advertencia' : 'Crítico'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Llamadas Recientes */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Llamadas Recientes</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewChange('calls')}
              >
                Ver todas
              </Button>
            </div>
            <div className="space-y-4">
              {mockData.recentCalls.map((call, index) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    {call.direction === 'inbound' ? (
                      <PhoneIncoming className="w-4 h-4 text-blue-600" />
                    ) : (
                      <PhoneOutgoing className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {call.from}
                    </p>
                    <p className="text-xs text-gray-600">
                      {call.agent} • {call.duration}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSentimentColor(call.sentiment)}>
                      {call.sentiment === 'positive' ? 'Positivo' : 
                       call.sentiment === 'negative' ? 'Negativo' : 'Neutral'}
                    </Badge>
                    {call.recording && (
                      <Mic className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Alertas */}
      {mockData.alerts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Alertas del Sistema</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewChange('supervisor')}
            >
              Ver Supervisor
            </Button>
          </div>
          <div className="space-y-4">
            {mockData.alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-600">
                    {alert.queue} • {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity === 'high' ? 'Alta' : 
                   alert.severity === 'medium' ? 'Media' : 'Baja'}
                </Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

