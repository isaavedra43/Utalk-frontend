import React, { useState, useEffect, useCallback } from 'react';
import type { TeamMember } from '../../../types/team';
import { infoLog } from '../../../config/logger';
import { modulePermissionsService, UserModulePermissions } from '../../../services/modulePermissions';

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
  role: string;
  permissions: {
    read: boolean;
    write: boolean;
    approve: boolean;
    configure: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    desktop: boolean;
  };
  visualizations: {
    dashboard: boolean;
    reports: boolean;
    analytics: boolean;
    teamView: boolean;
  };
  settings: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    autoLogout: boolean;
    twoFactorAuth: boolean;
  };
}

export const EditAgentModal: React.FC<EditAgentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  member
}) => {
  const [formData, setFormData] = useState<EditAgentData>({
    name: '',
    email: '',
    password: '',
    role: '',
    permissions: {
      read: false,
      write: false,
      approve: false,
      configure: false
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      desktop: true
    },
    visualizations: {
      dashboard: true,
      reports: true,
      analytics: false,
      teamView: true
    },
    settings: {
      language: 'es',
      timezone: 'America/Mexico_City',
      theme: 'light',
      autoLogout: true,
      twoFactorAuth: false
    }
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'notifications' | 'settings' | 'modulePermissions'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para permisos de módulos
  const [modulePermissions, setModulePermissions] = useState<UserModulePermissions | null>(null);
  const [availableModules, setAvailableModules] = useState<{ [moduleId: string]: unknown }>({});
  const [loadingModules, setLoadingModules] = useState(false);

  // Cargar datos del miembro cuando se abre el modal
  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        password: '',
        role: member.role || '',
        permissions: {
          read: member.permissions?.read || false,
          write: member.permissions?.write || false,
          approve: member.permissions?.approve || false,
          configure: member.permissions?.configure || false
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
          desktop: true
        },
        visualizations: {
          dashboard: true,
          reports: true,
          analytics: false,
          teamView: true
        },
        settings: {
          language: 'es',
          timezone: 'America/Mexico_City',
          theme: 'light',
          autoLogout: true,
          twoFactorAuth: false
        }
      });
    }
  }, [member, isOpen]);

  const loadModulePermissions = useCallback(async () => {
    if (!member?.email) return;
    
    setLoadingModules(true);
    try {
      // Cargar módulos disponibles y permisos del usuario
      const [modules, userPermissions] = await Promise.all([
        modulePermissionsService.getAvailableModules(),
        modulePermissionsService.getUserPermissions(member.email)
      ]);
      
      setAvailableModules(modules);
      setModulePermissions(userPermissions);
    } catch (error) {
      infoLog('Error cargando permisos de módulos:', error);
    } finally {
      setLoadingModules(false);
    }
  }, [member?.email]);

  // Cargar permisos de módulos cuando se abre la pestaña
  useEffect(() => {
    if (isOpen && activeTab === 'modulePermissions' && member?.email) {
      loadModulePermissions();
    }
  }, [isOpen, activeTab, member?.email, loadModulePermissions]);

  const handleModulePermissionChange = (moduleId: string, action: 'read' | 'write' | 'configure', value: boolean) => {
    if (!modulePermissions) return;
    
    setModulePermissions(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          modules: {
            ...prev.permissions.modules,
            [moduleId]: {
              ...prev.permissions.modules[moduleId],
              [action]: value
            }
          }
        }
      };
    });
  };

  const handleSaveModulePermissions = async () => {
    if (!modulePermissions || !member?.email) return;
    
    setIsLoading(true);
    try {
      await modulePermissionsService.updateUserPermissions(member.email, modulePermissions.permissions);
      infoLog('Permisos de módulos actualizados exitosamente');
    } catch (error) {
      infoLog('Error actualizando permisos de módulos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value
      }
    }));
  };

  const handleNotificationChange = (notification: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notification]: value
      }
    }));
  };



  const handleSettingChange = (setting: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      infoLog('Error al actualizar agente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'permissions', label: 'Permisos', icon: '🔐' },
    { id: 'modulePermissions', label: 'Permisos de Módulos', icon: '📋' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' }
  ] as const;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Editar Agente: {member?.name}
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
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-medium">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tab: Perfil */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Dejar en blanco para no cambiar"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="Ejecutivo WhatsApp Senior">Ejecutivo WhatsApp Senior</option>
                      <option value="Ejecutivo WhatsApp Junior">Ejecutivo WhatsApp Junior</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Manager">Manager</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Permisos */}
            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries({
                    read: { label: 'Leer', description: 'Ver conversaciones y datos de clientes', level: 'advanced' },
                    write: { label: 'Escribir', description: 'Enviar mensajes y responder a clientes', level: 'advanced' },
                    approve: { label: 'Aprobar', description: 'Aprobar campañas y decisiones importantes', level: 'intermediate' },
                    configure: { label: 'Configurar', description: 'Acceso a configuración del sistema', level: 'basic' }
                  }).map(([key, permission]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`permission-${key}`}
                            checked={formData.permissions[key as keyof typeof formData.permissions]}
                            onChange={(e) => handlePermissionChange(key, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`permission-${key}`} className="text-sm font-medium text-gray-900">
                            {permission.label}
                          </label>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          permission.level === 'advanced' ? 'bg-red-100 text-red-800' :
                          permission.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {permission.level}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{permission.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Permisos de Módulos */}
            {activeTab === 'modulePermissions' && (
              <div className="space-y-6 max-h-96 overflow-y-auto scrollbar-medium">
                {loadingModules ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Cargando permisos de módulos...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Permisos de Módulos</h3>
                      <button
                        type="button"
                        onClick={handleSaveModulePermissions}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {Object.entries(availableModules).map(([moduleId, module]) => {
                        const currentModulePermissions = modulePermissions?.permissions?.modules?.[moduleId];
                        
                        const moduleData = module as { name: string; description: string; level: string };
                        return (
                          <div key={moduleId} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{moduleData.name}</h4>
                                <p className="text-xs text-gray-600">{moduleData.description}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                moduleData.level === 'advanced' ? 'bg-red-100 text-red-800' :
                                moduleData.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {moduleData.level}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              {Object.entries({
                                read: { label: 'Leer', description: 'Acceso de lectura' },
                                write: { label: 'Escribir', description: 'Acceso de escritura' },
                                configure: { label: 'Configurar', description: 'Acceso de configuración' }
                              }).map(([action, actionInfo]) => (
                                <div key={action} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`module-${moduleId}-${action}`}
                                    checked={currentModulePermissions?.[action as keyof typeof currentModulePermissions] || false}
                                    onChange={(e) => handleModulePermissionChange(moduleId, action as 'read' | 'write' | 'configure', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <label htmlFor={`module-${moduleId}-${action}`} className="text-sm text-gray-700">
                                    {actionInfo.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {Object.keys(availableModules).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hay módulos disponibles para configurar.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Tab: Notificaciones */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries({
                    email: { label: 'Notificaciones por Email', description: 'Recibir alertas por correo electrónico' },
                    push: { label: 'Notificaciones Push', description: 'Alertas en tiempo real en el navegador' },
                    sms: { label: 'Notificaciones SMS', description: 'Mensajes de texto para alertas críticas' },
                    desktop: { label: 'Notificaciones de Escritorio', description: 'Alertas del sistema operativo' }
                  }).map(([key, notification]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`notification-${key}`}
                            checked={formData.notifications[key as keyof typeof formData.notifications]}
                            onChange={(e) => handleNotificationChange(key, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`notification-${key}`} className="text-sm font-medium text-gray-900">
                            {notification.label}
                          </label>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Configuración */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      value={formData.settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona Horaria
                    </label>
                    <select
                      value={formData.settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="America/Mexico_City">México (GMT-6)</option>
                      <option value="America/New_York">Nueva York (GMT-5)</option>
                      <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tema
                    </label>
                    <select
                      value={formData.settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Cerrar sesión automáticamente</h4>
                      <p className="text-xs text-gray-600">Cerrar sesión después de 30 minutos de inactividad</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.settings.autoLogout}
                      onChange={(e) => handleSettingChange('autoLogout', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Autenticación de dos factores</h4>
                      <p className="text-xs text-gray-600">Requerir código adicional para iniciar sesión</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 