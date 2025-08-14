import React from 'react';
import { 
  MessageCircle, 
  Phone, 
  Calendar, 
  TrendingUp,
  Users,
  MoreHorizontal,
  Star
} from 'lucide-react';
import type { Client } from '../../../../types/client';

interface ClientCardViewProps {
  clients: Client[];
  onClientSelect: (client: Client) => void;
  selectedClient?: Client;
}

export const ClientCardView: React.FC<ClientCardViewProps> = ({
  clients,
  onClientSelect,
  selectedClient
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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

  const getNextAction = (client: Client) => {
    // Lógica para determinar la próxima acción basada en el cliente
    const actions = [
      'Programar reunión',
      'Llamada de seguimiento',
      'Enviar propuesta técnica',
      'Revisar presupuesto',
      'Agendar demo producto',
      'Enviar caso de éxito',
      'Contactar para feedback',
      'Actualizar información'
    ];
    
    // Usar el ID del cliente para determinar una acción consistente
    const actionIndex = client.id.charCodeAt(0) % actions.length;
    return actions[actionIndex];
  };

  const getPriorityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            onClick={() => onClientSelect(client)}
            className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all duration-200 ${
              selectedClient?.id === client.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:border-gray-300'
            }`}
          >
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {client.initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {client.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {client.company}
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Estado y métricas */}
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                {client.status === 'won' ? 'won' : client.status}
              </span>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getPriorityColor(client.score)}`}>
                  {client.score}%
                </span>
                <span className="text-sm text-gray-500">
                  {client.winRate}%
                </span>
              </div>
            </div>

            {/* Información financiera */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Valor:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(client.expectedValue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Prob:</span>
                <span className="text-sm font-medium text-gray-900">
                  {client.probability}%
                </span>
              </div>
            </div>

            {/* Próxima acción */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="truncate">{getNextAction(client)}</span>
              </div>
            </div>

            {/* Tags */}
            {client.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
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

            {/* Botones de acción */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button 
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Enviar mensaje"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Llamar"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button 
                  className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Agendar reunión"
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </div>
              
              {/* Indicadores adicionales */}
              <div className="flex items-center space-x-1">
                {client.score >= 90 && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                )}
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>{client.score}%</span>
                </div>
              </div>
            </div>

            {/* Indicador de actividad reciente */}
            {client.lastContact && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Último contacto:</span>
                  <span>
                    {new Date(client.lastContact).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay clientes */}
      {clients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay clientes para mostrar
            </h3>
            <p className="text-gray-500">
              Los clientes aparecerán aquí cuando se agreguen al sistema.
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Agregar primer cliente
          </button>
        </div>
      )}
    </div>
  );
};

// Componente Plus para el botón
const Plus: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
); 