import React from 'react';
import { Users, Clock, AlertTriangle, CheckCircle, Pause, Play } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Button } from '../../../components/ui/button';
import { Queue, Agent } from '../../../types/calls';

interface QueuesPanelProps {
  queues: Queue[];
  agents: Agent[];
  loading: boolean;
  onQueueUpdate: (queue: Queue) => void;
}

export const QueuesPanel: React.FC<QueuesPanelProps> = ({
  queues,
  agents,
  loading,
  onQueueUpdate
}) => {
  // Datos mock
  const mockQueues: Queue[] = [
    {
      id: '1',
      name: 'Ventas',
      description: 'Cola de ventas y prospección',
      skills: ['ventas', 'prospección'],
      priorities: [],
      hours: {} as any,
      holidays: [],
      maxWaitTime: 300,
      recordingEnabled: true,
      transcriptionEnabled: true,
      currentCalls: 8,
      agentsAvailable: 5,
      averageWaitTime: 45,
      serviceLevel: 85,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Soporte',
      description: 'Soporte técnico y atención al cliente',
      skills: ['soporte', 'técnico'],
      priorities: [],
      hours: {} as any,
      holidays: [],
      maxWaitTime: 600,
      recordingEnabled: true,
      transcriptionEnabled: true,
      currentCalls: 12,
      agentsAvailable: 8,
      averageWaitTime: 120,
      serviceLevel: 72,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const getStatusColor = (serviceLevel: number) => {
    if (serviceLevel >= 80) return 'text-green-600 bg-green-100';
    if (serviceLevel >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusText = (serviceLevel: number) => {
    if (serviceLevel >= 80) return 'Saludable';
    if (serviceLevel >= 60) return 'Advertencia';
    return 'Crítico';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Colas de Llamadas</h1>
        <p className="text-gray-600 mt-1">Gestión y monitoreo de colas en tiempo real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockQueues.map((queue) => (
          <Card key={queue.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{queue.name}</h3>
                  <p className="text-sm text-gray-600">{queue.description}</p>
                </div>
              </div>
              <Badge className={getStatusColor(queue.serviceLevel)}>
                {getStatusText(queue.serviceLevel)}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Llamadas activas</p>
                  <p className="text-2xl font-bold text-gray-900">{queue.currentCalls}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">En cola</p>
                  <p className="text-2xl font-bold text-gray-900">{queue.currentCalls - queue.agentsAvailable}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Nivel de servicio</span>
                  <span className="font-medium">{queue.serviceLevel}%</span>
                </div>
                <Progress value={queue.serviceLevel} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Agentes disponibles</p>
                  <p className="font-medium">{queue.agentsAvailable}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tiempo promedio</p>
                  <p className="font-medium">{queue.averageWaitTime}s</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Reanudar
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

