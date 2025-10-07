import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Package, Search, Filter, Calendar, Archive, Settings, Menu, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useMobileMenuContext } from '../../../contexts/MobileMenuContext';
import type { Platform } from '../types';
import { CargaCard } from './CargaCard';
import { CreateCargaModal } from './CreateCargaModal';
import { CargaDetailView } from './CargaDetailView';
import { ConfigurationModal } from './ConfigurationModal';

export const InventoryMainView: React.FC = () => {
  const { cargas, loading, createPlatform, syncPendingPlatforms, syncStatus, refreshData } = useInventory();
  const { openMenu } = useMobileMenuContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Platform['status']>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showStats, setShowStats] = useState(true); // Mostrar estadísticas por defecto en web
  const lastRefreshTime = useRef<number>(0);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Obtener la plataforma seleccionada actualizada desde el estado global
  const selectedPlatform = selectedPlatformId ? cargas.find(p => p.id === selectedPlatformId) : null;

  // Filtrar cargas
  const filteredCargas = cargas.filter(platform => {
    const matchesSearch = 
      platform.platformNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (platform.materialTypes && platform.materialTypes.length > 0 && 
       platform.materialTypes.some(material => material.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === 'all' || platform.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: cargas?.length || 0,
    inProgress: cargas?.filter(p => p.status === 'in_progress').length || 0,
    completed: cargas?.filter(p => p.status === 'completed').length || 0,
    totalMeters: cargas?.reduce((sum, p) => sum + (p.totalLinearMeters || 0), 0) || 0
  };

  const handleCreatePlatform = async (data: {
    platformType: 'provider' | 'client';
    materialTypes: string[];
    provider: string;
    providerId?: string;
    ticketNumber?: string;
    driver: string;
    notes?: string;
  }) => {
    try {
      const newPlatform = await createPlatform(data);
      setShowCreateModal(false);
      setSelectedPlatformId(newPlatform.id);
    } catch (error) {
      console.error('Error creating platform:', error);
    }
  };

  const handleRefreshData = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime.current;
    const MIN_REFRESH_INTERVAL = 3000; // 3 segundos mínimo entre refrescos

    // Si ya está refrescando, no hacer nada
    if (isRefreshing) {
      console.log('⚠️ Refresh ya en progreso, ignorando solicitud');
      return;
    }

    // Si ha pasado menos del tiempo mínimo, programar para más tarde
    if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL) {
      const waitTime = MIN_REFRESH_INTERVAL - timeSinceLastRefresh;
      console.log(`⏳ Rate limit: esperando ${waitTime}ms antes del próximo refresh`);
      
      // Cancelar timeout anterior si existe
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      // Programar refresh para después del tiempo de espera
      refreshTimeoutRef.current = setTimeout(() => {
        handleRefreshData();
      }, waitTime);
      
      return;
    }

    // Limpiar timeout si existe
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }

    // Actualizar timestamp del último refresh
    lastRefreshTime.current = now;
    setIsRefreshing(true);

    try {
      console.log('🔄 Iniciando refresh de datos...');
      await refreshData();
      console.log('✅ Refresh completado exitosamente');
    } catch (error) {
      console.error('❌ Error al actualizar datos:', error);
      // En caso de error, permitir refresh más temprano
      lastRefreshTime.current = now - MIN_REFRESH_INTERVAL + 1000;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshData]);

  // Cleanup timeout al desmontar componente
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  if (selectedPlatform) {
    return (
        <CargaDetailView
          platform={selectedPlatform}
          onBack={() => setSelectedPlatformId(null)}
        />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto pb-20 sm:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-3">
              {/* Botón del menú de módulos - Solo visible en móvil */}
              <button
                onClick={openMenu}
                className="lg:hidden flex items-center justify-center p-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 rounded-xl shadow-sm hover:from-gray-100 hover:to-gray-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg"
                title="Abrir menú de módulos"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Archive className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600" />
                  <span className="truncate">Inventario de Materiales</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                  Gestión de cuantificación de metros lineales
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleRefreshData}
                disabled={isRefreshing || !syncStatus.isOnline}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md text-sm sm:text-base font-medium active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title={syncStatus.isOnline ? "Actualizar datos desde la base de datos" : "Sin conexión a internet"}
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                </span>
              </button>
              <button
                onClick={() => setShowConfigModal(true)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-3 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md text-sm sm:text-base font-medium active:scale-95"
                title="Configuración"
              >
                <Settings className="h-5 w-5" />
                <span className="hidden sm:inline">Configuración</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-4 sm:px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base font-medium active:scale-95"
              >
                <Plus className="h-5 w-5" />
                Nueva Carga
              </button>
            </div>
          </div>

          {/* Stats - Solo en web y cuando esté habilitado */}
          {showStats && (
            <div className="hidden sm:block">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-blue-600 font-medium truncate">Total Cargas</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 self-end sm:self-auto" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 sm:p-4 border border-yellow-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-yellow-600 font-medium truncate">En Proceso</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 self-end sm:self-auto" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-green-600 font-medium truncate">Completadas</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.completed}</p>
                </div>
                <Archive className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 self-end sm:self-auto" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-purple-600 font-medium truncate">Metros Totales</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-900">{stats.totalMeters.toFixed(2)}</p>
                </div>
                <Archive className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 self-end sm:self-auto" />
              </div>
            </div>
              </div>
            </div>
          )}

          {/* Botón para mostrar/ocultar estadísticas - Solo en web */}
          <div className="hidden sm:block mb-3 sm:mb-4">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showStats ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Ocultar estadísticas
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Mostrar estadísticas
                </>
              )}
            </button>
          </div>

          {/* Estado de Sincronización */}
          {syncStatus.needsSync && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm sm:text-base font-medium text-orange-800">
                      {syncStatus.pending} plataforma{syncStatus.pending !== 1 ? 's' : ''} pendiente{syncStatus.pending !== 1 ? 's' : ''} de sincronización
                    </span>
                  </div>
                  {!syncStatus.isOnline && (
                    <span className="text-xs text-orange-600 bg-orange-200 px-2 py-1 rounded-full">
                      Sin conexión
                    </span>
                  )}
                </div>
                {syncStatus.isOnline && (
                  <button
                    onClick={syncPendingPlatforms}
                    className="text-xs sm:text-sm text-orange-700 hover:text-orange-800 font-medium underline"
                  >
                    Sincronizar ahora
                  </button>
                )}
              </div>
              <p className="text-xs text-orange-600 mt-1">
                {syncStatus.isOnline 
                  ? 'Las plataformas se sincronizarán automáticamente cuando se complete la conexión.'
                  : 'Conecta a internet para sincronizar automáticamente.'
                }
              </p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar carga..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="in_progress">En Proceso</option>
                <option value="completed">Completadas</option>
                <option value="exported">Exportadas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {filteredCargas.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron cargas' 
                : 'No hay cargas registradas'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta con otros filtros de búsqueda'
                : 'Comienza creando una nueva carga para registrar metros lineales'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md active:scale-95 text-sm sm:text-base"
              >
                <Plus className="h-5 w-5" />
                Crear Primera Carga
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredCargas.map(platform => (
              <CargaCard
                key={platform.id}
                platform={platform}
                onClick={() => setSelectedPlatformId(platform.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCargaModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePlatform}
        />
      )}

      {showConfigModal && (
        <ConfigurationModal
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
};

