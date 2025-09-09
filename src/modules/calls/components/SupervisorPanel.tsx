import React from 'react';
import { Eye, EyeOff, Mic, MicOff, Users, Phone, AlertTriangle, Activity } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { SupervisorState } from '../../../types/calls';

interface SupervisorPanelProps {
  state: SupervisorState;
  onStateChange: (state: SupervisorState) => void;
  realTimeMetrics: any;
  wallboardData: any;
}

export const SupervisorPanel: React.FC<SupervisorPanelProps> = ({
  state,
  onStateChange,
  realTimeMetrics,
  wallboardData
}) => {
  const mockAlerts = [
    {
      id: '1',
      type: 'sla',
      severity: 'high',
      message: 'Cola de Soporte: SLA por debajo del 80%',
      queueId: '2',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      acknowledged: false
    },
    {
      id: '2',
      type: 'abandon',
      severity: 'medium',
      message: 'Tasa de abandono alta en Cola de Ventas',
      queueId: '1',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      acknowledged: false
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleMonitoringToggle = (type: 'listen' | 'whisper' | 'barge') => {
    onStateChange({
      ...state,
      isMonitoring: !state.isMonitoring,
      monitoringType: state.isMonitoring ? undefined : type,
      monitoredCallId: state.isMonitoring ? undefined : '1'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Supervisor</h1>
        <p className="text-gray-600 mt-1">Monitoreo y control en tiempo real</p>
      </div>

      {/* Métricas en tiempo real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Llamadas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.totalCalls}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Llamadas Activas</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.activeCalls}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Cola</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.queuedCalls}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agentes Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{realTimeMetrics.availableAgents}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Controles de monitoreo */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Controles de Monitoreo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant={state.monitoringType === 'listen' ? "default" : "outline"}
            size="lg"
            onClick={() => handleMonitoringToggle('listen')}
          >
            {state.monitoringType === 'listen' ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
            {state.monitoringType === 'listen' ? 'Dejar de Escuchar' : 'Escuchar'}
          </Button>

          <Button
            variant={state.monitoringType === 'whisper' ? "default" : "outline"}
            size="lg"
            onClick={() => handleMonitoringToggle('whisper')}
          >
            {state.monitoringType === 'whisper' ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
            {state.monitoringType === 'whisper' ? 'Dejar de Susurrar' : 'Susurrar'}
          </Button>

          <Button
            variant={state.monitoringType === 'barge' ? "default" : "outline"}
            size="lg"
            onClick={() => handleMonitoringToggle('barge')}
          >
            {state.monitoringType === 'barge' ? <Users className="w-5 h-5 mr-2" /> : <Users className="w-5 h-5 mr-2" />}
            {state.monitoringType === 'barge' ? 'Salir de Llamada' : 'Unirse a Llamada'}
          </Button>
        </div>

        {state.isMonitoring && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">
                Monitoreando llamada #{state.monitoredCallId} - Modo: {state.monitoringType}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Alertas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas del Sistema</h2>
        <div className="space-y-3">
          {mockAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-600">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity === 'high' ? 'Alta' : 
                   alert.severity === 'medium' ? 'Media' : 'Baja'}
                </Badge>
                <Button variant="outline" size="sm">
                  Reconocer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Estado de colas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de Colas</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Ventas</h3>
              <p className="text-sm text-gray-600">8 activas • 3 en cola • 5 agentes disponibles</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Nivel de servicio</p>
              <div className="flex items-center space-x-2">
                <Progress value={85} className="w-20" />
                <span className="text-sm font-medium">85%</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Soporte</h3>
              <p className="text-sm text-gray-600">12 activas • 7 en cola • 8 agentes disponibles</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Nivel de servicio</p>
              <div className="flex items-center space-x-2">
                <Progress value={72} className="w-20" />
                <span className="text-sm font-medium">72%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
