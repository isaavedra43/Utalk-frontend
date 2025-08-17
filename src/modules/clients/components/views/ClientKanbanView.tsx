import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  DollarSign, 
  Users, 
  TrendingUp
} from 'lucide-react';
import type { Client } from '../../../../types/client';

interface KanbanColumn {
  id: string;
  title: string;
  stage: string;
  clients: Client[];
  color: string;
  bgColor: string;
}

interface ClientKanbanViewProps {
  clients: Client[];
  onClientSelect: (client: Client) => void;
  onClientUpdate: (clientId: string, updates: Partial<Client>) => void;
  selectedClient?: Client;
}

export const ClientKanbanView: React.FC<ClientKanbanViewProps> = ({
  clients,
  onClientSelect,
  onClientUpdate,
  selectedClient
}) => {
  const [draggedClient, setDraggedClient] = useState<Client | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead':
        return { color: 'text-gray-600', bgColor: 'bg-gray-50' };
      case 'prospect':
        return { color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'demo':
        return { color: 'text-purple-600', bgColor: 'bg-purple-50' };
      case 'proposal':
        return { color: 'text-orange-600', bgColor: 'bg-orange-50' };
      case 'negotiation':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      case 'won':
        return { color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'lost':
        return { color: 'text-red-600', bgColor: 'bg-red-50' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Organizar clientes por etapa
  const columns: KanbanColumn[] = [
    {
      id: 'lead',
      title: 'Lead',
      stage: 'lead',
      clients: clients.filter(c => c.stage === 'lead'),
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      id: 'prospect',
      title: 'Prospect',
      stage: 'prospect',
      clients: clients.filter(c => c.stage === 'prospect'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'demo',
      title: 'Demo',
      stage: 'demo',
      clients: clients.filter(c => c.stage === 'demo'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'proposal',
      title: 'Propuesta',
      stage: 'proposal',
      clients: clients.filter(c => c.stage === 'propuesta'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'negotiation',
      title: 'Negociación',
      stage: 'negotiation',
      clients: clients.filter(c => c.stage === 'negociacion'),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'won',
      title: 'Ganado',
      stage: 'won',
      clients: clients.filter(c => c.stage === 'ganado'),
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'lost',
      title: 'Perdido',
      stage: 'lost',
      clients: clients.filter(c => c.stage === 'perdido'),
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const calculateColumnStats = (column: KanbanColumn) => {
    const totalClients = column.clients.length;
    const totalValue = column.clients.reduce((sum, client) => sum + client.expectedValue, 0);
    const avgProbability = totalClients > 0 
      ? Math.round(column.clients.reduce((sum, client) => sum + client.probability, 0) / totalClients)
      : 0;

    return {
      totalClients,
      totalValue,
      avgProbability
    };
  };

  const handleDragStart = (e: React.DragEvent, client: Client) => {
    setDraggedClient(client);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (draggedClient && draggedClient.stage !== targetStage) {
      onClientUpdate(draggedClient.id, { stage: targetStage as 'lead' | 'prospect' | 'demo' | 'propuesta' | 'negociacion' | 'ganado' | 'perdido' });
    }
    setDraggedClient(null);
  };

  const handleDragEnd = () => {
    setDraggedClient(null);
  };

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex space-x-4 p-4 min-w-max">
        {columns.map((column) => {
          const stats = calculateColumnStats(column);
          const stageColors = getStageColor(column.stage);
          
          return (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 ${column.bgColor} rounded-lg border border-gray-200`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.stage)}
            >
              {/* Header de la columna */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${stageColors.color}`}>
                    {column.title}
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Estadísticas de la columna */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{stats.totalClients}</div>
                    <div className="text-gray-500">clientes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(stats.totalValue)}
                    </div>
                    <div className="text-gray-500">valor</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{stats.avgProbability}%</div>
                    <div className="text-gray-500">prob. media</div>
                  </div>
                </div>
              </div>

              {/* Lista de clientes */}
              <div className="p-2 space-y-2 max-h-96 overflow-y-auto no-scrollbar">
                {column.clients.map((client) => (
                  <div
                    key={client.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, client)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onClientSelect(client)}
                    className={`bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow ${
                      selectedClient?.id === client.id ? 'ring-2 ring-blue-500' : ''
                    } ${draggedClient?.id === client.id ? 'opacity-50' : ''}`}
                  >
                    {/* Header de la tarjeta */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {client.initials}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {client.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {client.company}
                          </p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Información del cliente */}
                    <div className="space-y-2">
                      {/* Valor y probabilidad */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(client.expectedValue)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {client.probability}%
                        </span>
                      </div>

                      {/* Tags */}
                      {client.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {client.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {client.tags.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{client.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Score y win rate */}
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">Score: {client.score}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-600">Win: {client.winRate}%</span>
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="flex justify-between items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                        <div className="flex items-center text-gray-400">
                          <div className="h-3 w-3 flex items-center justify-center">
                  <div className="w-2 h-2 flex flex-col space-y-0.5">
                    <div className="w-full h-0.5 bg-gray-400 rounded"></div>
                    <div className="w-full h-0.5 bg-gray-400 rounded"></div>
                  </div>
                </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mensaje cuando no hay clientes */}
                {column.clients.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">No hay clientes en esta etapa</div>
                    <button className="mt-2 text-blue-600 hover:text-blue-800 text-xs font-medium">
                      Agregar cliente
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 