import React, { useState } from 'react';
import { infoLog } from '../../config/logger';
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
  const [selectedClientState, setSelectedClient] = useState<Client | null>(null);
  const [currentViewState, setCurrentView] = useState<'list' | 'kanban' | 'cards'>('list');

  // Hooks personalizados - HABILITADOS
  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    totalClients,
    changePage,
    hasFilters,
    clearFilters,
    updateClient,
    loadClients
  } = useClients();

  const {
    kpis,
    loading: metricsLoading,
    error: metricsError
  } = useClientMetrics({
    autoLoad: false, // ❌ TEMPORALMENTE DESHABILITADO PARA EVITAR BUCLES
    refreshInterval: 0 // ❌ TEMPORALMENTE DESHABILITADO PARA EVITAR BUCLES
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
    onFiltersChange: loadClients // ✅ HABILITADO - Recargar clientes cuando cambien filtros
  });

  // Manejadores de eventos
  const handleSearch = (searchTerm: string) => {
    updateSearch(searchTerm);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleExport = () => {
    // Exportación deshabilitada temporalmente
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

  const handleRefresh = async () => {
    try {
      // Solo refrescar clientes por ahora - métricas temporalmente deshabilitadas
      await loadClients();
      // refreshMetrics() - TEMPORALMENTE DESHABILITADO
      infoLog('Datos de clientes refrescados (métricas temporalmente deshabilitadas)');
    } catch (error) {
      infoLog('Error al refrescar datos:', error);
    }
  };

  // Manejador de ordenamiento compatible con ClientList
  const handleSort = () => {
    // Función placeholder - implementar cuando sea necesario
  };

  // Manejador de ordenamiento compatible con ClientFilters
  const handleSortingChange = () => {
    // Función placeholder - implementar cuando sea necesario
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
        currentView={currentViewState}
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
            onRefresh={handleRefresh}
          />
        </div>

        {/* Lista de clientes */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <div className={`flex-1 min-w-0 ${showDetailPanel ? 'mr-0' : ''}`}>
            <ClientList
              clients={clients}
              loading={clientsLoading}
              error={clientsError || null}
              totalClients={totalClients}
              currentView={currentViewState}
              onClientSelect={handleClientSelect}
              onPageChange={changePage}
              onSort={handleSort}
              selectedClient={selectedClientState}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Panel de detalles del cliente */}
          {showDetailPanel && selectedClientState && (
            <div className="flex-shrink-0">
              <ClientDetailPanel
                client={selectedClientState}
                onClose={handleCloseDetailPanel}
                onUpdate={async (updates) => {
                  try {
                    if (selectedClientState) {
                      const updatedClient = await updateClient(selectedClientState.id, updates);
                      setSelectedClient(updatedClient);
                      infoLog('Cliente actualizado exitosamente:', updatedClient);
                    }
                  } catch (error) {
                    infoLog('Error actualizando cliente:', error);
                  }
                }}
              />
            </div>
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