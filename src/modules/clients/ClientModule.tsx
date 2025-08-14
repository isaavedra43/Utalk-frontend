import React, { useState } from 'react';
import { ClientHeader } from './components/ClientHeader';
import { ClientKPIs } from './components/ClientKPIs';
import { ClientList } from './components/ClientList';
import { ClientDetailPanel } from './components/ClientDetailPanel';
import { ClientFiltersComponent } from './components/ClientFilters';
import { useClients } from './hooks/useClients';
import { useClientMetrics } from './hooks/useClientMetrics';
import { useClientFilters } from './hooks/useClientFilters';
import type { Client } from '../../types/client';

export const ClientModule: React.FC = () => {
  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'kanban' | 'cards'>('list');

  // Hooks personalizados
  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    loadClients,
    updateFilters,
    changePage,
    sort,
    clearFilters,
    totalClients,
    hasFilters
  } = useClients({
    autoLoad: true,
    pageSize: 20
  });

  const {
    kpis,
    loading: metricsLoading,
    error: metricsError,
    loadMetrics,
    refreshMetrics
  } = useClientMetrics({
    autoLoad: true,
    refreshInterval: 30000
  });

  const {
    filters,
    filterOptions,
    updateSearch,
    updateStageFilters,
    updateAgentFilters,
    updateAIScoreFilters,
    updateValueFilters,
    updateProbabilityFilters,
    updateStatusFilters,
    updateTagFilters,
    updateSourceFilters,
    updateSegmentFilters,
    updateDateFilters,
    clearFilters: clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
    activeFiltersSummary
  } = useClientFilters({
    onFiltersChange: (newFilters) => {
      updateFilters(newFilters);
    }
  });

  // Manejadores de eventos
  const handleSearch = (searchTerm: string) => {
    updateSearch(searchTerm);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleExport = () => {
    // TODO: Implementar exportación
    console.log('Exportando clientes...');
  };

  const handleViewChange = (view: 'list' | 'kanban' | 'cards') => {
    setCurrentView(view);
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowDetailPanel(true);
  };

  const handleCloseDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedClient(null);
  };

  const handleRefresh = () => {
    loadClients();
    loadMetrics();
  };

  // Manejador de ordenamiento compatible con ClientList
  const handleSort = (field: string, order: 'asc' | 'desc') => {
    sort(field as 'name' | 'company' | 'value' | 'probability' | 'score' | 'createdAt' | 'lastContact', order);
  };

  // Manejador de ordenamiento compatible con ClientFilters
  const handleSortingChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    sort(sortBy as 'name' | 'company' | 'value' | 'probability' | 'score' | 'createdAt' | 'lastContact', sortOrder);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header del módulo */}
      <ClientHeader
        searchValue={filters.search || ''}
        onSearch={handleSearch}
        onToggleFilters={handleToggleFilters}
        onExport={handleExport}
        onViewChange={handleViewChange}
        currentView={currentView}
        hasFilters={hasActiveFilters}
        filtersCount={activeFiltersCount}
        onRefresh={handleRefresh}
        loading={clientsLoading || metricsLoading}
      />

      {/* Panel de filtros */}
      {showFilters && (
        <ClientFiltersComponent
          filters={filters}
          filterOptions={filterOptions}
          onStageChange={updateStageFilters}
          onAgentChange={updateAgentFilters}
          onAIScoreChange={updateAIScoreFilters}
          onValueChange={updateValueFilters}
          onProbabilityChange={updateProbabilityFilters}
          onStatusChange={updateStatusFilters}
          onTagChange={updateTagFilters}
          onSourceChange={updateSourceFilters}
          onSegmentChange={updateSegmentFilters}
          onDateChange={updateDateFilters}
          onSortingChange={handleSortingChange}
          onClearFilters={clearAllFilters}
          onClose={() => setShowFilters(false)}
          activeFiltersSummary={activeFiltersSummary}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* KPIs Cards */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <ClientKPIs
            kpis={kpis}
            loading={metricsLoading}
            error={metricsError}
            onRefresh={refreshMetrics}
          />
        </div>

        {/* Lista de clientes */}
        <div className="flex-1 flex min-h-0">
          <div className={`flex-1 ${showDetailPanel ? 'mr-80' : ''}`}>
            <ClientList
              clients={clients}
              loading={clientsLoading}
              error={clientsError || null}
              totalClients={totalClients}
              currentView={currentView}
              onClientSelect={handleClientSelect}
              onPageChange={changePage}

              onSort={handleSort}
              selectedClient={selectedClient}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Panel de detalles del cliente */}
          {showDetailPanel && selectedClient && (
            <ClientDetailPanel
              client={selectedClient}
              onClose={handleCloseDetailPanel}
              onUpdate={(updates) => {
                // TODO: Implementar actualización del cliente
                console.log('Actualizando cliente:', updates);
              }}
            />
          )}
        </div>
      </div>

      {/* Overlay para filtros en móvil */}
      {showFilters && (
        <div 
          className="fixed inset-y-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}; 