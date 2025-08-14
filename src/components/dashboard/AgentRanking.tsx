import { memo } from 'react';
import { Crown, Star } from 'lucide-react';
import { AgentTooltip } from './Tooltip';
import type { AgentRanking as AgentRankingType } from '../../types/dashboard';

interface AgentRankingProps {
  data: AgentRankingType;
}

const AgentItem = memo<{
  agent: AgentRankingType['agents'][0];
}>(({ agent }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'absent':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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
      default:
        return 'Desconocido';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-50 text-yellow-800';
      case 'busy':
        return 'bg-orange-50 text-orange-800';
      case 'absent':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-gray-50 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'bg-yellow-500';
    if (performance >= 80) return 'bg-blue-500';
    if (performance >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <AgentTooltip
      name={agent.name}
      performance={agent.performance}
      status={getStatusText(agent.status)}
      lastActivity={agent.lastActivity}
    >
      <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 cursor-pointer">
        {/* Ranking */}
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            agent.rank === 1 ? 'bg-blue-500' : 'bg-gray-400'
          }`}>
            {agent.rank}
          </div>
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0 relative">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {agent.initials}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(agent.status)} rounded-full border-2 border-white`}></div>
        </div>

        {/* Información del agente */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {agent.name}
            </h4>
            {agent.crown && (
              <Crown className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-xs text-gray-500">💬 {agent.conversations}</span>
            <span className="text-xs text-gray-500">🕒 {agent.responseTime}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBgColor(agent.status)}`}>
              {getStatusText(agent.status)}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-xs text-gray-500">Resueltas: {agent.resolvedCount}</span>
            <span className="text-xs text-gray-500">Actividad: {agent.lastActivity}</span>
          </div>
        </div>

        {/* Rendimiento */}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center space-x-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-900">{agent.performance}%</span>
          </div>
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getPerformanceColor(agent.performance)} transition-all duration-300`}
              style={{ width: `${agent.performance}%` }}
            ></div>
          </div>
        </div>
      </div>
    </AgentTooltip>
  );
});

AgentItem.displayName = 'AgentItem';

export const AgentRanking = memo<AgentRankingProps>(({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{data.agents.length > 0 ? 'Ranking de Agentes' : 'Sin datos'}</h3>
          <p className="text-sm text-gray-600">Rendimiento del equipo hoy</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">{data.date}</div>
          <div className="text-xs text-gray-400">{data.totalAgents} agentes</div>
        </div>
      </div>

      {/* Lista de agentes */}
      <div className="space-y-2">
        {data.agents.length > 0 ? (
          data.agents.map((agent) => (
            <AgentItem key={agent.id} agent={agent} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <p>No hay agentes disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
});

AgentRanking.displayName = 'AgentRanking'; 