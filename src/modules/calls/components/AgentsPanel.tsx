import React from 'react';
import { User, Phone, Clock, Target, Award, Pause, Play } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Agent, Queue } from '../../../types/calls';

interface AgentsPanelProps {
  agents: Agent[];
  queues: Queue[];
  loading: boolean;
  onAgentUpdate: (agent: Agent) => void;
}

export const AgentsPanel: React.FC<AgentsPanelProps> = ({
  agents,
  queues,
  loading,
  onAgentUpdate
}) => {
  // Datos mock
  const mockAgents: Agent[] = [
    {
      id: '1',
      name: 'María González',
      email: 'maria@utalk.com',
      extension: '1001',
      presence: 'available',
      skills: ['ventas', 'soporte'],
      permissions: [],
      status: 'idle',
      aht: 180,
      callsPerHour: 8,
      slaPercentage: 95,
      qaScore: 88,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Carlos Ruiz',
      email: 'carlos@utalk.com',
      extension: '1002',
      presence: 'busy',
      skills: ['soporte', 'técnico'],
      permissions: [],
      status: 'in-call',
      aht: 240,
      callsPerHour: 6,
      slaPercentage: 92,
      qaScore: 85,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const getPresenceColor = (presence: string) => {
    switch (presence) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-red-600 bg-red-100';
      case 'away': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPresenceText = (presence: string) => {
    switch (presence) {
      case 'available': return 'Disponible';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      default: return 'Desconectado';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-green-600 bg-green-100';
      case 'in-call': return 'text-blue-600 bg-blue-100';
      case 'after-call-work': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle': return 'Libre';
      case 'in-call': return 'En llamada';
      case 'after-call-work': return 'ACW';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agentes</h1>
        <p className="text-gray-600 mt-1">Gestión y monitoreo de agentes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockAgents.map((agent) => (
          <Card key={agent.id} className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={`/avatars/${agent.name.toLowerCase().replace(' ', '-')}.jpg`} />
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-600">{agent.extension}</p>
              </div>
              <Badge className={getPresenceColor(agent.presence)}>
                {getPresenceText(agent.presence)}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado</span>
                <Badge className={getStatusColor(agent.status)}>
                  {getStatusText(agent.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">AHT</p>
                  <p className="font-medium">{Math.floor(agent.aht / 60)}:{(agent.aht % 60).toString().padStart(2, '0')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Llamadas/hora</p>
                  <p className="font-medium">{agent.callsPerHour}</p>
                </div>
                <div>
                  <p className="text-gray-600">SLA</p>
                  <p className="font-medium">{agent.slaPercentage}%</p>
                </div>
                <div>
                  <p className="text-gray-600">QA Score</p>
                  <p className="font-medium">{agent.qaScore}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Habilidades</p>
                <div className="flex flex-wrap gap-1">
                  {agent.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
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

