import React, { useState } from 'react';
import { Plus, Package, Search, Filter, Calendar, Archive } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import type { Platform } from '../types';
import { PlatformCard } from './PlatformCard';
import { CreatePlatformModal } from './CreatePlatformModal';
import { PlatformDetailView } from './PlatformDetailView';

export const InventoryMainView: React.FC = () => {
  const { platforms, loading, createPlatform } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Platform['status']>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  // Filtrar plataformas
  const filteredPlatforms = platforms.filter(platform => {
    const matchesSearch = 
      platform.platformNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      platform.materialType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || platform.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: platforms.length,
    inProgress: platforms.filter(p => p.status === 'in_progress').length,
    completed: platforms.filter(p => p.status === 'completed').length,
    totalMeters: platforms.reduce((sum, p) => sum + p.totalLinearMeters, 0)
  };

  const handleCreatePlatform = (data: {
    platformNumber: string;
    materialType: string;
    notes?: string;
  }) => {
    const newPlatform = createPlatform(data);
    setShowCreateModal(false);
    setSelectedPlatform(newPlatform);
  };

  if (selectedPlatform) {
    return (
      <PlatformDetailView
        platform={selectedPlatform}
        onBack={() => setSelectedPlatform(null)}
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Archive className="h-7 w-7 text-blue-600" />
                Inventario de Materiales
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestión de cuantificación de metros lineales
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Nueva Plataforma
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Plataformas</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">En Proceso</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Completadas</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                </div>
                <Archive className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Metros Totales</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalMeters.toFixed(2)}</p>
                </div>
                <Archive className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número de plataforma o material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="in_progress">En Proceso</option>
                <option value="completed">Completadas</option>
                <option value="exported">Exportadas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredPlatforms.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron plataformas' 
                : 'No hay plataformas registradas'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta con otros filtros de búsqueda'
                : 'Comienza creando una nueva plataforma para registrar metros lineales'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Crear Primera Plataforma
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlatforms.map(platform => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                onClick={() => setSelectedPlatform(platform)}
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
    </div>
  );
};

