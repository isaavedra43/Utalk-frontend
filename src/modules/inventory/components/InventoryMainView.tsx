import React, { useState } from 'react';
import { Plus, Package, Search, Filter, Calendar, Archive, Settings, Menu } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { useMobileMenuContext } from '../../../contexts/MobileMenuContext';
import type { Platform } from '../types';
import { PlatformCard } from './PlatformCard';
import { CreatePlatformModal } from './CreatePlatformModal';
import { PlatformDetailView } from './PlatformDetailView';
import { ConfigurationModal } from './ConfigurationModal';

export const InventoryMainView: React.FC = () => {
  const { platforms, loading, createPlatform } = useInventory();
  const { openMenu } = useMobileMenuContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Platform['status']>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  
  // Obtener la plataforma seleccionada actualizada desde el estado global
  const selectedPlatform = selectedPlatformId ? platforms.find(p => p.id === selectedPlatformId) : null;

  // Filtrar plataformas
  const filteredPlatforms = platforms.filter(platform => {
    const matchesSearch = 
      platform.platformNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (platform.materialTypes && platform.materialTypes.length > 0 && 
       platform.materialTypes.some(material => material.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === 'all' || platform.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: platforms?.length || 0,
    inProgress: platforms?.filter(p => p.status === 'in_progress').length || 0,
    completed: platforms?.filter(p => p.status === 'completed').length || 0,
    totalMeters: platforms?.reduce((sum, p) => sum + (p.totalLinearMeters || 0), 0) || 0
  };

  const handleCreatePlatform = async (data: {
    platformNumber: string;
    materialTypes: string[];
    provider: string;
    providerId?: string;
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

  if (selectedPlatform) {
    return (
      <PlatformDetailView
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
                Nueva Plataforma
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-blue-600 font-medium truncate">Total Plataformas</p>
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

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar plataforma..."
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
        {filteredPlatforms.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron plataformas' 
                : 'No hay plataformas registradas'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta con otros filtros de búsqueda'
                : 'Comienza creando una nueva plataforma para registrar metros lineales'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md active:scale-95 text-sm sm:text-base"
              >
                <Plus className="h-5 w-5" />
                Crear Primera Plataforma
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredPlatforms.map(platform => (
              <PlatformCard
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
        <CreatePlatformModal
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

