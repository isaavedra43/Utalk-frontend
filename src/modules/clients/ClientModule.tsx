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
import { User, Activity, Briefcase, Brain } from 'lucide-react';
import type { Client } from '../../types/client';

export const ClientModule: React.FC = () => {
  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedClientState, setSelectedClient] = useState<Client | null>(null);
  const [currentViewState, setCurrentView] = useState<'list' | 'kanban' | 'cards'>('list');
  const [activeTab, setActiveTab] = useState<'perfil' | 'actividad' | 'deals' | 'ia'>('perfil');

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

  // Función para renderizar contenido según el tab activo
  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div className="space-y-4">
            {/* Información de contacto */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                Información de contacto
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">Email</span>
                  </div>
                  <span className="text-sm text-gray-900">{selectedClientState?.email || 'Sin email'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-gray-500">WhatsApp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{selectedClientState?.phone || selectedClientState?.name}</span>
                    <button className="text-blue-500 text-xs px-2 py-1 border border-blue-200 rounded">Copiar</button>
                  </div>
                </div>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Llamar</span>
                </button>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm text-gray-500">WhatsApp disponible</span>
                  </div>
                  <button className="text-green-500 text-xs px-2 py-1 border border-green-200 rounded">Chatear</button>
                </div>
              </div>
            </div>

            {/* Detalles comerciales */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Detalles comerciales
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Valor esperado:</span>
                  <span className="text-sm font-medium text-gray-900">USD {selectedClientState?.value || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fuente:</span>
                  <span className="text-sm text-gray-900">W website</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Probabilidad:</span>
                  <span className="text-sm font-medium text-orange-600">{selectedClientState?.probability || 70}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Segmento:</span>
                  <span className="text-sm text-gray-900">freelancer</span>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Información adicional
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Cliente desde:</span>
                  <span className="text-sm text-gray-900">10/09/2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Última actualización:</span>
                  <span className="text-sm text-gray-900">10/09/2025</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'actividad':
        return (
          <div className="space-y-4">
            {/* Resumen de actividad */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 text-gray-500 mr-2" />
                  Actividad reciente
                </h3>
                <button className="text-blue-500 text-sm">Ver todas</button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">5</p>
                  <p className="text-sm text-gray-500">Total actividades</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">5</p>
                  <p className="text-sm text-gray-500">Completadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">1</p>
                  <p className="text-sm text-gray-500">Llamadas</p>
                </div>
              </div>
            </div>

            {/* Lista de actividades */}
            <div className="space-y-3">
              {/* Actividad 1 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Mensaje WhatsApp</h4>
                      <p className="text-sm text-gray-600">Cliente pregunta sobre tiempo de implementación</p>
                      <p className="text-xs text-gray-500 mt-1">12/08/2025, 05:06 p.m.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-600 font-medium">Completed</span>
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Actividad 2 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Llamada comercial</h4>
                      <p className="text-sm text-gray-600">Demo del producto - 45 minutos. Cliente muy interesado.</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-gray-500">11/08/2025, 07:06 p.m.</p>
                        <div className="flex items-center space-x-1">
                          <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-gray-500">45 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-600 font-medium">Completed</span>
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Actividad 3 */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Demo técnica</h4>
                      <p className="text-sm text-gray-600">Presentación de funcionalidades avanzadas. Cliente solicitó propuesta.</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-gray-500">10/08/2025, 03:30 p.m.</p>
                        <div className="flex items-center space-x-1">
                          <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs text-gray-500">60 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-600 font-medium">Completed</span>
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón agregar actividad */}
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Agregar actividad</span>
            </button>

            {/* Filtros */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Filtrar por tipo</h4>
              <div className="flex flex-wrap gap-2">
                {['Todas', 'Llamadas', 'Emails', 'Demos', 'Reuniones', 'WhatsApp'].map((filter) => (
                  <button
                    key={filter}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filter === 'Todas'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'deals':
        return (
          <div className="space-y-4">
            {/* Resumen de oportunidades */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                Resumen de oportunidades
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-sm text-gray-500">Total deals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">USD 650,000</p>
                  <p className="text-sm text-gray-500">Valor total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">USD 480,000</p>
                  <p className="text-sm text-gray-500">Valor ponderado</p>
                </div>
              </div>
            </div>

            {/* Lista de deals */}
            <div className="space-y-3">
              {/* Deal 1 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Implementación CRM Enterprise</h4>
                    <p className="text-sm text-gray-600">Implementación completa del sistema CRM para empresa enterprise con 500+ usuarios.</p>
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Negociación</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-500">Valor:</span>
                    <p className="font-medium text-gray-900">USD 450,000</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Probabilidad:</span>
                    <p className="font-medium text-orange-600">75%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Cierre:</span>
                    <p className="text-sm text-gray-900">26/08/2025</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tiempo:</span>
                    <p className="text-sm text-red-600">Vencido</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {['Enterprise', 'CRM', 'Implementación'].map((tag) => (
                      <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Última actividad: N/A</span>
                    <div className="flex space-x-1">
                      <button className="text-blue-500 text-xs">Ver detalles</button>
                      <button className="text-gray-500 text-xs">Editar</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal 2 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Módulo Analytics Avanzado</h4>
                    <p className="text-sm text-gray-600">Módulo de análisis predictivo y reportes avanzados.</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Propuesta</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-500">Valor:</span>
                    <p className="font-medium text-gray-900">USD 125,000</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Probabilidad:</span>
                    <p className="font-medium text-orange-600">60%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Cierre:</span>
                    <p className="text-sm text-gray-900">14/09/2025</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tiempo:</span>
                    <p className="text-sm text-gray-900">5 días</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {['Analytics', 'Predictivo'].map((tag) => (
                      <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Última actividad: N/A</span>
                    <div className="flex space-x-1">
                      <button className="text-blue-500 text-xs">Ver detalles</button>
                      <button className="text-gray-500 text-xs">Editar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón crear oportunidad */}
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Crear nueva oportunidad</span>
            </button>

            {/* Filtros por etapa */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Filtrar por etapa</h4>
              <div className="flex flex-wrap gap-2">
                {['Todas', 'Lead', 'Prospecto', 'Demo', 'Propuesta', 'Negociación', 'Ganado', 'Perdido'].map((filter) => (
                  <button
                    key={filter}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filter === 'Todas'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ia':
        return (
          <div className="space-y-4">
            {/* Score de IA */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Brain className="h-5 w-5 text-gray-500 mr-2" />
                Score de IA
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">70%</p>
                  <p className="text-sm text-gray-500">Confianza en el análisis</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-600">0%</p>
                  <p className="text-sm text-gray-500">Win Rate</p>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">IA</span>
                </div>
              </div>
            </div>

            {/* Resumen ejecutivo */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Resumen ejecutivo
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Cliente enterprise con alto potencial. Ha participado en 2 demos y solicitó propuesta. Principales intereses: integración con sistemas existentes y ROI. Sin objeciones importantes identificadas.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Demos realizadas:</span>
                  <p className="text-lg font-semibold text-gray-900">2</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Valor potencial:</span>
                  <p className="text-lg font-semibold text-gray-900">USD 275,000</p>
                </div>
              </div>
            </div>

            {/* Próximas mejores acciones */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Próximas mejores acciones
                </h3>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">3 prioridad alta</span>
              </div>
              
              <div className="space-y-3">
                {/* Acción 1 */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Compartir caso de éxito de empresa similar</h4>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Alta</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Envía un caso de éxito similar para acelerar la decisión. El cliente muestra interés pero necesita validación.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>5 min</span>
                      <span>$ USD 50,000</span>
                      <span className="text-green-600">85% confianza</span>
                    </div>
                    <button className="text-blue-500 text-sm font-medium">Implementar →</button>
                  </div>
                </div>

                {/* Acción 2 */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Agendar demo personalizada</h4>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Alta</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Programa una demo específica para las necesidades del cliente basada en su perfil enterprise.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>30 min</span>
                      <span>$ USD 75,000</span>
                      <span className="text-orange-600">78% confianza</span>
                    </div>
                    <button className="text-blue-500 text-sm font-medium">Implementar →</button>
                  </div>
                </div>

                {/* Acción 3 */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Enviar ROI calculator</h4>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Media</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Proporciona una calculadora de ROI personalizada para demostrar el valor de la inversión.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>10 min</span>
                      <span>$ USD 25,000</span>
                      <span className="text-orange-600">72% confianza</span>
                    </div>
                    <button className="text-blue-500 text-sm font-medium">Implementar →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto">
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
      <div className="flex-1 flex flex-col min-h-0">
        {/* KPIs Cards */}
        <div className="px-4 lg:px-6 py-4 bg-white border-b border-gray-200">
          <ClientKPIs
            kpis={kpis}
            loading={metricsLoading}
            error={metricsError}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Lista de clientes */}
        <div className="flex-1 flex min-h-0">
          <div className={`flex-1 min-w-0 ${showDetailPanel ? 'lg:mr-0' : ''}`}>
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

          {/* Panel de detalles del cliente - Desktop */}
          {showDetailPanel && selectedClientState && (
            <div className="hidden lg:block flex-shrink-0">
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

      {/* Modal de detalles del cliente - Móvil */}
      {showDetailPanel && selectedClientState && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            {/* Header del modal móvil */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCloseDetailPanel}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Detalle del Cliente</h2>
                  <p className="text-sm text-gray-500">{selectedClientState.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <button
                  onClick={handleCloseDetailPanel}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-lg">
                    {selectedClientState.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{selectedClientState.name}</h3>
                  <p className="text-sm text-gray-500">{selectedClientState.company || 'Sin empresa'}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    selectedClientState.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedClientState.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Score: {selectedClientState.aiScore || 0}%</p>
                </div>
              </div>
            </div>

            {/* Tabs de navegación */}
            <div className="flex border-b border-gray-200 bg-white">
              {[
                { id: 'perfil', label: 'Perfil', icon: User },
                { id: 'actividad', label: 'Actividad', icon: Activity },
                { id: 'deals', label: 'Deals', icon: Briefcase },
                { id: 'ia', label: 'IA', icon: Brain }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Contenido del modal móvil */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="p-4">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      )}

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