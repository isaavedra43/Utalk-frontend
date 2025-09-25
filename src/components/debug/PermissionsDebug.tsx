import React, { useState } from 'react';
import { useModulePermissions } from '../../hooks/useModulePermissions';
import { useAuthContext } from '../../contexts/useAuthContext';
import { ChevronDown, ChevronUp, RefreshCw, Eye, Edit, Settings, User, Shield } from 'lucide-react';

export const PermissionsDebug: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { permissions, accessibleModules, loading, error, canAccessModule, hasPermission, refreshPermissions } = useModulePermissions();
  const { backendUser } = useAuthContext();

  const systemModules = [
    { id: 'dashboard', name: 'Dashboard', category: 'core' },
    { id: 'notifications', name: 'Notificaciones', category: 'core' },
    { id: 'chat', name: 'Chat', category: 'communication' },
    { id: 'phone', name: 'Teléfono', category: 'communication' },
    { id: 'internal-chat', name: 'Chat Interno', category: 'communication' },
    { id: 'clients', name: 'Clientes', category: 'crm' },
    { id: 'team', name: 'Equipo', category: 'management' },
    { id: 'hr', name: 'Recursos Humanos', category: 'management' },
    { id: 'supervision', name: 'Supervisión', category: 'management' },
    { id: 'campaigns', name: 'Campañas', category: 'marketing' },
    { id: 'providers', name: 'Proveedores', category: 'operations' },
    { id: 'warehouse', name: 'Almacén', category: 'operations' },
    { id: 'shipping', name: 'Envíos', category: 'operations' },
    { id: 'copilot', name: 'Copiloto IA', category: 'ai' },
    { id: 'knowledge-base', name: 'Base de Conocimiento', category: 'support' },
    { id: 'services', name: 'Servicios', category: 'configuration' }
  ];

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? '✅' : '❌';
  };

  const getStatusColor = (hasPermission: boolean) => {
    return hasPermission ? 'text-green-600' : 'text-red-600';
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
        >
          <Shield className="w-4 h-4" />
          <span className="text-sm">Debug Permisos</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-w-2xl max-h-96 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <h3 className="font-medium">Debug de Permisos</h3>
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshPermissions}
            className="p-1 hover:bg-blue-700 rounded"
            title="Recargar permisos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 max-h-80 overflow-y-auto">
        {/* Estado General */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Estado General
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Usuario:</span>
              <span className="font-mono">{backendUser?.email || 'No autenticado'}</span>
            </div>
            <div className="flex justify-between">
              <span>Rol:</span>
              <span className="font-mono">{backendUser?.role || permissions?.role || 'Desconocido'}</span>
            </div>
            <div className="flex justify-between">
              <span>Estado:</span>
              <span className={loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}>
                {loading ? 'Cargando...' : error ? 'Error' : 'Conectado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Módulos accesibles:</span>
              <span className="font-mono">{accessibleModules?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Error si existe */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Tabla de Permisos */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800 mb-3">Permisos por Módulo</h4>
          <div className="space-y-1">
            {systemModules.map((module) => {
              const hasAccess = canAccessModule(module.id);
              const canRead = hasPermission(module.id, 'read');
              const canWrite = hasPermission(module.id, 'write');
              const canConfigure = hasPermission(module.id, 'configure');

              return (
                <div
                  key={module.id}
                  className={`p-2 rounded border text-xs ${
                    hasAccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{module.name}</span>
                    <span className={`px-2 py-1 rounded ${hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {hasAccess ? 'ACCESO' : 'DENEGADO'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span className={getStatusColor(canRead)}>
                        {getPermissionIcon(canRead)} Leer
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Edit className="w-3 h-3" />
                      <span className={getStatusColor(canWrite)}>
                        {getPermissionIcon(canWrite)} Escribir
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-3 h-3" />
                      <span className={getStatusColor(canConfigure)}>
                        {getPermissionIcon(canConfigure)} Configurar
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Datos Raw del Backend */}
        {permissions && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Datos del Backend</h4>
            <details className="text-xs">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                Ver datos raw (JSON)
              </summary>
              <pre className="mt-2 p-2 bg-white border rounded text-xs overflow-x-auto">
                {JSON.stringify(permissions, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
