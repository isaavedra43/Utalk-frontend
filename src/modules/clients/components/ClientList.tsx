import React from 'react';
import { infoLog } from '../../../config/logger';
import { 
  RefreshCw,
  XCircle
} from 'lucide-react';
import { ClientItem } from './ClientItem';
import { ClientKanbanView, ClientCardView } from './views';
import type { Client } from '../../../types/client';

interface ClientListProps {
  clients: Client[];
  loading: boolean;
  error: string | null;
  totalClients: number;
  currentView: 'list' | 'kanban' | 'cards';
  onClientSelect: (client: Client) => void;
  onPageChange: (page: number) => void;

  onSort: (field: string, order: 'asc' | 'desc') => void;
  selectedClient: Client | null;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  loading,
  error,
  totalClients,
  currentView,
  onClientSelect,
  selectedClient,
  hasFilters,
  onClearFilters
}) => {
  const handleClientAction = (action: string, client: Client) => {
    switch (action) {
      case 'chat':
        infoLog('Abrir chat con:', client.name);
        break;
      case 'more':
        infoLog('Mostrar opciones para:', client.name);
        break;
      default:
        infoLog('Acción no implementada:', action);
    }
  };

  const handleClientUpdate = (clientId: string, updates: Partial<Client>) => {
    // Implementar actualización de cliente
    infoLog('Actualizar cliente:', clientId, updates);
  };

  const handlePreviousPage = () => {
    // Implementar paginación
    infoLog('Página anterior');
  };

  const handleNextPage = () => {
    // Implementar paginación
    infoLog('Página siguiente');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Cargando clientes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <XCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar clientes
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron clientes
          </h3>
          <p className="text-gray-600 mb-4">
            {hasFilters 
              ? 'No hay clientes que coincidan con los filtros aplicados.'
              : 'No hay clientes disponibles en este momento.'
            }
          </p>
          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header de la lista */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {totalClients} clientes
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Mostrando {clients.length} de {totalClients}</span>
          </div>
        </div>
      </div>

      {/* Contenido de clientes */}
      {currentView === 'list' ? (
        /* Vista de tabla */
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <ClientItem
                  key={client.id}
                  client={client}
                  isSelected={selectedClient?.id === client.id}
                  onSelect={onClientSelect}
                  onAction={handleClientAction}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : currentView === 'cards' ? (
        /* Vista de tarjetas */
        <ClientCardView
          clients={clients}
          onClientSelect={onClientSelect}
          selectedClient={selectedClient || undefined}
        />
      ) : currentView === 'kanban' ? (
        /* Vista Kanban */
        <ClientKanbanView
          clients={clients}
          onClientSelect={onClientSelect}
          onClientUpdate={handleClientUpdate}
          selectedClient={selectedClient || undefined}
        />
      ) : null}

      {/* Paginación */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Mostrar
            </span>
            <select
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              onChange={(e) => infoLog('Page size changed to:', Number(e.target.value))}
              defaultValue="20"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-700">
              por página
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={true} // Paginación implementada
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página 1 de 1
            </span>
            <button
              onClick={handleNextPage}
              disabled={true} // Paginación implementada
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 