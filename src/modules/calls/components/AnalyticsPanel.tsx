import React from 'react';
import { TrendingUp, BarChart3, PieChart, Activity, Target, Award } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { CallAnalytics } from '../../../types/calls';

interface AnalyticsPanelProps {
  analytics: CallAnalytics;
  loading: boolean;
  onAnalyticsUpdate: (analytics: CallAnalytics) => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  analytics,
  loading,
  onAnalyticsUpdate
}) => {
  const mockAnalytics = {
    period: 'today' as const,
    metrics: {
      totalCalls: 1247,
      answeredCalls: 1156,
      abandonedCalls: 91,
      averageWaitTime: 45,
      averageHandleTime: 180,
      serviceLevel: 85,
      occupancy: 78,
      transferRate: 12,
      firstCallResolution: 88,
      recordingRate: 95,
      transcriptionRate: 90,
      sentimentScore: 82,
      qaScore: 87
    },
    byQueue: [
      { queueId: '1', queueName: 'Ventas', metrics: { totalCalls: 456, answeredCalls: 420, abandonedCalls: 36, averageWaitTime: 35, averageHandleTime: 165, serviceLevel: 92, occupancy: 85 } },
      { queueId: '2', queueName: 'Soporte', metrics: { totalCalls: 523, answeredCalls: 478, abandonedCalls: 45, averageWaitTime: 65, averageHandleTime: 195, serviceLevel: 78, occupancy: 72 } }
    ],
    byAgent: [
      { agentId: '1', agentName: 'María González', metrics: { totalCalls: 45, averageHandleTime: 165, callsPerHour: 8, slaPercentage: 95, qaScore: 88 } },
      { agentId: '2', agentName: 'Carlos Ruiz', metrics: { totalCalls: 38, averageHandleTime: 195, callsPerHour: 6, slaPercentage: 92, qaScore: 85 } }
    ],
    byHour: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      calls: Math.floor(Math.random() * 50) + 10,
      answered: Math.floor(Math.random() * 45) + 8,
      abandoned: Math.floor(Math.random() * 10) + 1,
      averageWaitTime: Math.floor(Math.random() * 60) + 20
    })),
    voiceQuality: {
      averageLatency: 25,
      averageJitter: 2.5,
      packetLoss: 0.1,
      pdd: 1.2,
      codecDistribution: { 'G.722': 60, 'PCMU': 30, 'PCMA': 10 },
      networkDistribution: { 'WiFi': 70, '4G': 25, 'Ethernet': 5 }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analítica de Llamadas</h1>
        <p className="text-gray-600 mt-1">Métricas y análisis de rendimiento</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Llamadas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.metrics.totalCalls}</p>
              <p className="text-sm text-green-600">+12.5% vs ayer</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nivel de Servicio</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.metrics.serviceLevel}%</p>
              <p className="text-sm text-green-600">+5.2% vs ayer</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-gray-900">{Math.floor(mockAnalytics.metrics.averageHandleTime / 60)}:{(mockAnalytics.metrics.averageHandleTime % 60).toString().padStart(2, '0')}</p>
              <p className="text-sm text-red-600">-2.1% vs ayer</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Puntuación QA</p>
              <p className="text-2xl font-bold text-gray-900">{mockAnalytics.metrics.qaScore}</p>
              <p className="text-sm text-green-600">+3.1% vs ayer</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Métricas por cola */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Cola</h2>
        <div className="space-y-4">
          {mockAnalytics.byQueue.map((queue) => (
            <div key={queue.queueId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{queue.queueName}</h3>
                <p className="text-sm text-gray-600">
                  {queue.metrics.totalCalls} llamadas • {queue.metrics.answeredCalls} respondidas
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Nivel de servicio</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={queue.metrics.serviceLevel} className="w-20" />
                    <span className="text-sm font-medium">{queue.metrics.serviceLevel}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Ocupación</p>
                  <span className="text-sm font-medium">{queue.metrics.occupancy}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Calidad de voz */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Calidad de Voz</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Latencia promedio</h3>
            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.voiceQuality.averageLatency}ms</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Jitter promedio</h3>
            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.voiceQuality.averageJitter}ms</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pérdida de paquetes</h3>
            <p className="text-2xl font-bold text-gray-900">{mockAnalytics.voiceQuality.packetLoss}%</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

