import React from 'react';
import { 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import type { Client } from '../../../types/client';

interface ClientItemProps {
  client: Client;
  isSelected: boolean;
  onSelect: (client: Client) => void;
  onAction: (action: string, client: Client) => void;
}

export const ClientItem: React.FC<ClientItemProps> = ({
  client,
  isSelected,
  onSelect,
  onAction
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusIcon = (client: Client) => {
    // Basado en las imágenes, algunos clientes tienen diferentes iconos
    const clientId = client.id;
    
    // Simular diferentes iconos basados en el ID del cliente
    if (clientId === '1' || clientId === '3') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (clientId === '2' || clientId === '7') {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
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

  // Función para obtener la siguiente acción (comentada ya que no se usa)
  // const getNextAction = (client: Client) => {
  //   // Simular diferentes acciones basadas en el cliente
  //   const actions = [
  //     'Programar reunión',
  //     'Llamada de seguimiento',
  //     'Enviar propuesta técnica',
  //     'Revisar presupuesto',
  //     'Agendar demo producto'
  //   ];
  //   
  //   const index = parseInt(client.id) % actions.length;
  //   return actions[index];
  // };

  return (
    <tr
      onClick={() => onSelect(client)}
      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      {/* Columna Cliente */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {client.initials}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {client.name}
            </div>
            <div className="text-sm text-gray-500">
              {client.company}
            </div>
            <div className="text-sm text-gray-400">
              {client.email.substring(0, 20)}...
            </div>
          </div>
        </div>
      </td>

      {/* Columna Estado */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
          {client.status}
        </span>
      </td>

      {/* Columna Score */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {client.score}%
      </td>

      {/* Columna Win Rate */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {client.winRate}%
      </td>

      {/* Columna Valor */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatCurrency(client.expectedValue)}
      </td>

      {/* Columna Estado (Icono) */}
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusIcon(client)}
      </td>

      {/* Columna Fecha */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(client.lastContact || client.createdAt)}
      </td>

      {/* Columna Acciones */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction('chat', client);
            }}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
            title="Chat"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction('more', client);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50"
            title="Más opciones"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Componente para vista de tarjetas (grid)
export const ClientCard: React.FC<ClientItemProps> = ({
  client,
  isSelected,
  onSelect,
  onAction
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
    const actions = [
      'Programar reunión',
      'Llamada de seguimiento',
      'Enviar propuesta técnica',
      'Revisar presupuesto',
      'Agendar demo producto'
    ];
    
    const index = parseInt(client.id) % actions.length;
    return actions[index];
  };

  return (
    <div
      onClick={() => onSelect(client)}
      className={`bg-white rounded-lg border p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200'
      }`}
    >
      {/* Header de la tarjeta */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {client.initials}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{client.name}</h3>
            <p className="text-sm text-gray-500">{client.company}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction('more', client);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Estado y porcentajes */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
          {client.status} {client.score}%
        </span>
        <span className="text-sm text-gray-500">
          {client.winRate}% win rate
        </span>
      </div>

      {/* Información financiera */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Valor:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(client.expectedValue)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Prob:</span>
          <span className="font-medium text-gray-900">{client.probability}%</span>
        </div>
      </div>

      {/* Próxima acción */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {getNextAction(client)}
        </p>
      </div>

      {/* Botón de chat */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction('chat', client);
        }}
        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Chat</span>
      </button>
    </div>
  );
}; 