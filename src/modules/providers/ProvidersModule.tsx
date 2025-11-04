import React from 'react';
import { Building2, Menu, AlertCircle } from 'lucide-react';
import { useMobileMenuContext } from '../../contexts/MobileMenuContext';
import { useProviders } from './hooks/useProviders';
import { ProvidersTable } from './components/ProvidersTable';
import { ProvidersStats } from './components/ProvidersStats';
import { exportProvidersToCSV } from './utils/exportUtils';

const ProvidersModule: React.FC = () => {
  const { openMenu } = useMobileMenuContext();
  const { providers, loading, error, createProvider, updateProvider, deleteProvider } = useProviders();

  const handleExport = () => {
    exportProvidersToCSV(providers);
  };

  const handleCreate = async (provider: Omit<import('./types').Provider, 'id'>) => {
    await createProvider(provider);
  };

  const handleUpdate = async (id: string, updates: Partial<import('./types').Provider>) => {
    await updateProvider(id, updates);
  };

  const handleDelete = async (id: string) => {
    await deleteProvider(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil con menú */}
      <div className="absolute top-0 left-0 right-0 z-10 lg:hidden">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={openMenu}
                className="flex items-center justify-center p-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 rounded-xl shadow-sm hover:from-gray-100 hover:to-gray-200 hover:shadow-md transition-all duration-200 active:scale-95 active:shadow-lg"
                title="Abrir menú de módulos"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">Proveedores</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
              <p className="text-gray-600 mt-1">
                Administra y gestiona todos tus proveedores de manera eficiente
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="mb-6">
          <ProvidersStats providers={providers} />
        </div>

        {/* Tabla de proveedores */}
        <ProvidersTable
          providers={providers}
          loading={loading}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onExport={handleExport}
        />
      </div>
    </div>
  );
};

export default ProvidersModule;
