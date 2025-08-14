import React from 'react';
import type { AgentPerformance } from '../../types/dashboard';

interface ProgressBarsProps {
  agents: AgentPerformance[];
  maxAgents?: number;
  showDetails?: boolean;
}

export const ProgressBars: React.FC<ProgressBarsProps> = ({
  agents,
  maxAgents = 5,
  showDetails = true
}) => {
  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'bg-green-500';
    if (performance >= 80) return 'bg-blue-500';
    if (performance >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceTextColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 80) return 'text-blue-600';
    if (performance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-orange-100 text-orange-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'busy':
        return 'Ocupado';
      case 'absent':
        return 'Ausente';
      case 'offline':
        return 'Desconectado';
      default:
        return 'Desconocido';
    }
  };

  const displayedAgents = agents.slice(0, maxAgents);

  return (
    <div className="space-y-4">
      {displayedAgents.map((agent) => (
        <div key={agent.id} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            {/* Información del agente */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                {agent.rank}
              </div>
              
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {agent.avatar ? (
                  <img 
                    src={agent.avatar} 
                    alt={agent.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  agent.initials
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">{agent.name}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>{agent.conversations} conversaciones</span>
                  <span>•</span>
                  <span>{agent.responseTime}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {getStatusText(agent.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rendimiento */}
            <div className="text-right">
              <div className={`text-lg font-bold ${getPerformanceTextColor(agent.performance)}`}>
                {agent.performance}%
              </div>
              <div className="text-xs text-gray-500">Rendimiento</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progreso</span>
              <span className="text-gray-900 font-medium">{agent.performance}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getPerformanceColor(agent.performance)}`}
                style={{ width: `${agent.performance}%` }}
              />
            </div>
          </div>

          {/* Detalles adicionales */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Resueltas: {agent.resolvedCount}</span>
                <span>Actividad: {agent.lastActivity}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 