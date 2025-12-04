import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Building2,
  Plus,
  Download,
  Filter,
  MoreVertical,
  FileText
} from 'lucide-react';
import type { Provider } from '../types';
import { ProviderFormModal } from './ProviderFormModal';
import { ProviderDetailModal } from './ProviderDetailModal';

interface ProvidersTableProps {
  providers: Provider[];
  loading: boolean;
  onCreate: (provider: Omit<Provider, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Provider>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onExport: () => void;
  onViewDetails?: (provider: Provider) => void;
}

export const ProvidersTable: React.FC<ProvidersTableProps> = ({
  providers,
  loading,
  onCreate,
  onUpdate,
  onDelete,
  onExport,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [detailProvider, setDetailProvider] = useState<Provider | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Filtrar proveedores
  const filteredProviders = useMemo(() => {
    let filtered = providers;

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.contact?.toLowerCase().includes(term) ||
        p.phone?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term)
      );
    }

    // Filtrar por estado activo
    if (filterActive !== 'all') {
      filtered = filtered.filter(p => {
        if (filterActive === 'active') return p.isActive !== false;
        return p.isActive === false;
      });
    }

    return filtered;
  }, [providers, searchTerm, filterActive]);

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setShowFormModal(true);
  };

  const handleDelete = async (provider: Provider) => {
    if (window.confirm(`¿Estás seguro de eliminar el proveedor "${provider.name}"?`)) {
      try {
        await onDelete(provider.id);
      } catch (error) {
        console.error('Error deleting provider:', error);
        alert('Error al eliminar el proveedor');
      }
    }
  };

  const handleCreate = async (provider: Omit<Provider, 'id'>) => {
    await onCreate(provider);
  };

  const handleUpdate = async (provider: Omit<Provider, 'id'> | Partial<Provider>) => {
    if (editingProvider) {
      await onUpdate(editingProvider.id, provider);
      setEditingProvider(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header con búsqueda y acciones */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtro de estado */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                className="bg-transparent border-0 text-sm focus:ring-0 cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>

            <button
              onClick={() => {
                setEditingProvider(null);
                setShowFormModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo Proveedor
            </button>
          </div>
        </div>

        {/* Tabla de proveedores */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Comienza agregando tu primer proveedor'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowFormModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Proveedor
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                            {provider.address && (
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {provider.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{provider.contact || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {provider.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          {provider.email ? (
                            <>
                              <Mail className="h-4 w-4 text-gray-400" />
                              {provider.email}
                            </>
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          provider.isActive !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {provider.isActive !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {onViewDetails && (
                            <button
                              onClick={() => onViewDetails(provider)}
                              className="text-purple-600 hover:text-purple-900 transition-colors"
                              title="Ver detalle completo"
                            >
                              <FileText className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => setDetailProvider(provider)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Vista rápida"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(provider)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(provider)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer con contador */}
          {filteredProviders.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Mostrando {filteredProviders.length} de {providers.length} proveedores
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <ProviderFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingProvider(null);
        }}
        onSave={editingProvider ? handleUpdate : handleCreate}
        editingProvider={editingProvider}
      />

      {detailProvider && (
        <ProviderDetailModal
          provider={detailProvider}
          isOpen={!!detailProvider}
          onClose={() => setDetailProvider(null)}
          onEdit={() => {
            setDetailProvider(null);
            handleEdit(detailProvider);
          }}
        />
      )}
    </>
  );
};
