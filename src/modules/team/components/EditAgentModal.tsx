import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { TeamMember } from '../../../types/team';
import { infoLog } from '../../../config/logger';
import { modulePermissionsService, UserModulePermissions } from '../../../services/modulePermissions';
import { teamService } from '../services/teamService';

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agentData: EditAgentData) => Promise<void>;
  member: TeamMember | null;
}

interface EditAgentData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'supervisor' | 'agent' | 'viewer';
  phone?: string;
  isActive?: boolean;
  permissions: {
    basic: {
      read: boolean;
      write: boolean;
      approve: boolean;
      configure: boolean;
    };
    modules: { [moduleId: string]: { read: boolean; write: boolean; configure: boolean } };
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  configuration: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    autoLogout: boolean;
    twoFactor: boolean;
  };
}

// ✅ ESTRUCTURAS DE DATOS POR DEFECTO
const getDefaultFormData = (): EditAgentData => ({
  name: '',
  email: '',
  password: '',
  role: 'agent',
  phone: '',
  isActive: true,
  permissions: {
    basic: {
      read: false,
      write: false,
      approve: false,
      configure: false
    },
    modules: {
      dashboard: { read: false, write: false, configure: false },
      contacts: { read: false, write: false, configure: false },
      campaigns: { read: false, write: false, configure: false },
      team: { read: false, write: false, configure: false },
      analytics: { read: false, write: false, configure: false },
      ai: { read: false, write: false, configure: false },
      settings: { read: false, write: false, configure: false },
      hr: { read: false, write: false, configure: false },
      clients: { read: false, write: false, configure: false },
      notifications: { read: false, write: false, configure: false },
      chat: { read: false, write: false, configure: false },
      'internal-chat': { read: false, write: false, configure: false },
      phone: { read: false, write: false, configure: false },
      'knowledge-base': { read: false, write: false, configure: false },
      supervision: { read: false, write: false, configure: false },
      copilot: { read: false, write: false, configure: false },
      providers: { read: false, write: false, configure: false },
      warehouse: { read: false, write: false, configure: false },
      shipping: { read: false, write: false, configure: false },
      services: { read: false, write: false, configure: false }
    }
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    desktop: true
  },
  configuration: {
    language: 'es',
    timezone: 'America/Mexico_City',
    theme: 'light',
    autoLogout: true,
    twoFactor: false
  }
});

// ✅ FUNCIÓN DE VALIDACIÓN DE DATOS
const validateFormData = (data: EditAgentData): boolean => {
  if (!data.name?.trim()) {
    infoLog('❌ Nombre es requerido');
    return false;
  }
  
  if (!data.email?.trim()) {
    infoLog('❌ Email es requerido');
    return false;
  }
  
  if (!data.permissions || !data.permissions.modules) {
    infoLog('❌ Permisos de módulos son requeridos');
    return false;
  }
  
  return true;
};

export const EditAgentModal: React.FC<EditAgentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  member
}) => {
  // ✅ ESTADOS PRINCIPALES CON VALORES POR DEFECTO
  const [formData, setFormData] = useState<EditAgentData>(getDefaultFormData());
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'notifications' | 'settings' | 'modulePermissions'>('profile');
  
  // ✅ ESTADOS DE CARGA Y ERROR
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ ESTADOS PARA PERMISOS DE MÓDULOS
  const [modulePermissions, setModulePermissions] = useState<UserModulePermissions | null>(null);
  const [availableModules, setAvailableModules] = useState<{ [moduleId: string]: unknown }>({});
  const [loadingModules, setLoadingModules] = useState(false);

  // ✅ FUNCIÓN PARA CARGAR DATOS DEL AGENTE
  const loadAgentData = useCallback(async () => {
    if (!member?.email) {
      infoLog('❌ No hay email de miembro para cargar datos');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      infoLog('🔍 Cargando datos del agente:', { email: member.email });
      
      // Cargar datos básicos del agente
      const agentData = await teamService.getAgent(member.id);
      
      // Cargar permisos de módulos
      const modulePerms = await teamService.getUserModulePermissions(member.email);
      
      // Cargar módulos disponibles
      const modules = await modulePermissionsService.getAvailableModules();
      
      infoLog('📥 Datos recibidos del backend', { 
        agentData, 
        modulePerms, 
        modulesCount: Object.keys(modules).length 
      });
      
      // ✅ NORMALIZAR Y VALIDAR DATOS
      const normalizedFormData: EditAgentData = {
        name: agentData.name || '',
        email: agentData.email || '',
        password: '',
        role: agentData.role as any || 'agent',
        phone: agentData.phone || '',
        isActive: agentData.isActive !== false,
        permissions: {
          basic: {
            read: agentData.permissions?.read || false,
            write: agentData.permissions?.write || false,
            approve: agentData.permissions?.approve || false,
            configure: agentData.permissions?.configure || false
          },
          modules: {
            ...getDefaultFormData().permissions.modules,
            ...(agentData.permissions?.modules || {}),
            ...(modulePerms?.permissions?.modules || {})
          }
        },
        notifications: {
          email: agentData.settings?.notifications !== false,
          push: true,
          sms: false,
          desktop: true
        },
        configuration: {
          language: agentData.settings?.language || 'es',
          timezone: agentData.settings?.timezone || 'America/Mexico_City',
          theme: 'light',
          autoLogout: true,
          twoFactor: false
        }
      };
      
      setFormData(normalizedFormData);
      setModulePermissions(modulePerms);
      setAvailableModules(modules);
      
      infoLog('✅ Datos del agente cargados y normalizados exitosamente');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      infoLog('❌ Error cargando datos del agente:', err);
      setError(errorMessage);
      
      // Usar datos por defecto en caso de error
      setFormData(getDefaultFormData());
      setModulePermissions(null);
      setAvailableModules({});
    } finally {
      setLoading(false);
    }
  }, [member?.id, member?.email]);

  // ✅ EFECTO PARA CARGAR DATOS AL ABRIR EL MODAL
  useEffect(() => {
    if (isOpen && member) {
      loadAgentData();
    }
  }, [isOpen, member, loadAgentData]);

  // ✅ MEMOIZAR DATOS PARA EVITAR RE-RENDERIZADOS
  const memoizedFormData = useMemo(() => {
    return {
      ...formData,
      permissions: {
        ...formData.permissions,
        modules: { ...formData.permissions.modules }
      }
    };
  }, [formData]);

  const memoizedModulePermissions = useMemo(() => {
    if (!modulePermissions) return null;
    
    return {
      ...modulePermissions,
      permissions: {
        ...modulePermissions.permissions,
        modules: { ...modulePermissions.permissions.modules }
      }
    };
  }, [modulePermissions]);

  // ✅ FUNCIONES DE MANEJO DE CAMBIOS CON VALIDACIÓN
  const handleInputChange = useCallback((name: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error si hay cambios
    if (error) {
      setError(null);
    }
  }, [error]);

  const handlePermissionChange = useCallback((moduleId: string, permission: string, value: boolean) => {
    // ✅ VALIDAR CAMBIO ANTES DE APLICAR
    if (!memoizedFormData.permissions?.modules?.[moduleId]) {
      infoLog(`❌ Módulo ${moduleId} no existe en los permisos`);
      return;
    }
    
    if (typeof value !== 'boolean') {
      infoLog(`❌ Valor de permiso inválido: ${value}`);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        modules: {
          ...prev.permissions.modules,
          [moduleId]: {
            ...prev.permissions.modules[moduleId],
            [permission]: value
          }
        }
      }
    }));
  }, [memoizedFormData]);

  const handleBasicPermissionChange = useCallback((permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        basic: {
          ...prev.permissions.basic,
          [permission]: value
        }
      }
    }));
  }, []);

  const handleNotificationChange = useCallback((notification: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notification]: value
      }
    }));
  }, []);

  const handleConfigurationChange = useCallback((config: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [config]: value
      }
    }));
  }, []);

  // ✅ FUNCIONES DE ACCIÓN MASIVA
  const enableAllPermissions = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        modules: Object.keys(prev.permissions.modules).reduce((acc, moduleId) => {
          acc[moduleId] = { read: true, write: true, configure: true };
          return acc;
        }, {} as { [key: string]: { read: boolean; write: boolean; configure: boolean } })
      }
    }));
  }, []);

  const disableAllPermissions = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        modules: Object.keys(prev.permissions.modules).reduce((acc, moduleId) => {
          acc[moduleId] = { read: false, write: false, configure: false };
          return acc;
        }, {} as { [key: string]: { read: boolean; write: boolean; configure: boolean } })
      }
    }));
  }, []);

  // ✅ MANEJO DE ENVÍO CON VALIDACIÓN
  const handleSubmit = useCallback(async () => {
    if (!validateFormData(memoizedFormData)) {
      setError('Por favor, complete todos los campos requeridos');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      infoLog('🚀 Enviando datos del agente:', { 
        email: memoizedFormData.email,
        modulesCount: Object.keys(memoizedFormData.permissions.modules).length
      });
      
      await onSubmit(memoizedFormData);
      
      infoLog('✅ Agente actualizado exitosamente');
      onClose();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar agente';
      infoLog('❌ Error actualizando agente:', err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [memoizedFormData, onSubmit, onClose]);

  // ✅ RENDERIZADO CONDICIONAL PARA ESTADOS DE CARGA Y ERROR
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando datos del agente...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !memoizedFormData.name) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Editar Agente: {memoizedFormData.name || member?.name || 'Usuario'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Perfil', icon: '👤' },
              { id: 'permissions', label: 'Permisos', icon: '🔒' },
              { id: 'modulePermissions', label: 'Permisos de Módulos', icon: '📄' },
              { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
              { id: 'settings', label: 'Configuración', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  value={memoizedFormData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={memoizedFormData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña (dejar vacío para mantener la actual)</label>
                <input
                  type="password"
                  value={memoizedFormData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select
                  value={memoizedFormData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="agent">Agente</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                  <option value="viewer">Solo Lectura</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  value={memoizedFormData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={memoizedFormData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Usuario activo</label>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Permisos Básicos</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'read', label: 'Leer', description: 'Puede ver información' },
                  { key: 'write', label: 'Escribir', description: 'Puede crear y modificar' },
                  { key: 'approve', label: 'Aprobar', description: 'Puede aprobar cambios' },
                  { key: 'configure', label: 'Configurar', description: 'Puede modificar configuración' }
                ].map((perm) => (
                  <div key={perm.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memoizedFormData.permissions.basic[perm.key as keyof typeof memoizedFormData.permissions.basic]}
                      onChange={(e) => handleBasicPermissionChange(perm.key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <label className="text-sm font-medium text-gray-900">{perm.label}</label>
                      <p className="text-xs text-gray-500">{perm.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'modulePermissions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Permisos de Módulos</h3>
                <div className="space-x-2">
                  <button
                    onClick={enableAllPermissions}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                  >
                    Habilitar Todos
                  </button>
                  <button
                    onClick={disableAllPermissions}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Deshabilitar Todos
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(memoizedFormData.permissions.modules).map(([moduleId, permissions]) => (
                  <div key={moduleId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 capitalize">{moduleId}</h4>
                      <span className="text-sm text-gray-500">
                        {Object.values(permissions).filter(Boolean).length}/3 permisos activos
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'read', label: 'Leer', icon: '📖' },
                        { key: 'write', label: 'Escribir', icon: '✏️' },
                        { key: 'configure', label: 'Configurar', icon: '⚙️' }
                      ].map((perm) => (
                        <div key={perm.key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={permissions[perm.key as keyof typeof permissions]}
                            onChange={(e) => handlePermissionChange(moduleId, perm.key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-900">
                            <span className="mr-1">{perm.icon}</span>
                            {perm.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Configuración de Notificaciones</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'email', label: 'Email', description: 'Recibir notificaciones por correo' },
                  { key: 'push', label: 'Push', description: 'Notificaciones push en el navegador' },
                  { key: 'sms', label: 'SMS', description: 'Notificaciones por mensaje de texto' },
                  { key: 'desktop', label: 'Escritorio', description: 'Notificaciones del sistema' }
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memoizedFormData.notifications[notif.key as keyof typeof memoizedFormData.notifications]}
                      onChange={(e) => handleNotificationChange(notif.key, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <label className="text-sm font-medium text-gray-900">{notif.label}</label>
                      <p className="text-xs text-gray-500">{notif.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Configuración del Sistema</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Idioma</label>
                <select
                  value={memoizedFormData.configuration.language}
                  onChange={(e) => handleConfigurationChange('language', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Zona Horaria</label>
                <select
                  value={memoizedFormData.configuration.timezone}
                  onChange={(e) => handleConfigurationChange('timezone', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="America/Mexico_City">México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tema</label>
                <select
                  value={memoizedFormData.configuration.theme}
                  onChange={(e) => handleConfigurationChange('theme', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={memoizedFormData.configuration.autoLogout}
                  onChange={(e) => handleConfigurationChange('autoLogout', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Cierre automático de sesión</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={memoizedFormData.configuration.twoFactor}
                  onChange={(e) => handleConfigurationChange('twoFactor', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Autenticación de dos factores</label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};