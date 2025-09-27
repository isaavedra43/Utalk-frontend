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
  role: 'admin' | 'supervisor' | 'agent' | 'viewer';
  phone?: string;
  isActive?: boolean;
  permissions: {
    read: boolean;
    write: boolean;
    approve: boolean;
    configure: boolean;
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

export const EditAgentModal: React.FC<EditAgentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  member
}) => {
  const [formData, setFormData] = useState<EditAgentData>({
    name: member?.name || '',
    email: member?.email || '',
    password: '',
    role: (member?.role as 'admin' | 'supervisor' | 'agent' | 'viewer') || 'agent',
    phone: member?.phone || '',
    isActive: member?.isActive !== false,
    permissions: {
      read: member?.permissions?.read || false,
      write: member?.permissions?.write || false,
      approve: member?.permissions?.approve || false,
      configure: member?.permissions?.configure || false,
      modules: member?.permissions?.modules || {}
    },
    notifications: {
      email: member?.notifications?.email !== false,
      push: member?.notifications?.push !== false,
      sms: member?.notifications?.sms === true,
      desktop: member?.notifications?.desktop !== false
    },
    configuration: {
      language: member?.configuration?.language || 'es',
      timezone: member?.configuration?.timezone || 'America/Mexico_City',
      theme: (member?.configuration?.theme as 'light' | 'dark' | 'auto') || 'light',
      autoLogout: member?.configuration?.autoLogout !== false,
      twoFactor: member?.configuration?.twoFactor === true
    }
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'notifications' | 'settings' | 'modulePermissions'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para permisos de módulos
  const [modulePermissions, setModulePermissions] = useState<UserModulePermissions | null>(null);
  const [availableModules, setAvailableModules] = useState<{ [moduleId: string]: unknown }>({});
  const [loadingModules, setLoadingModules] = useState(false);

  // Actualizar formData cuando cambie el member
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        password: '',
        role: (member.role as 'admin' | 'supervisor' | 'agent' | 'viewer') || 'agent',
        phone: member.phone || '',
        isActive: member.isActive !== false,
        permissions: {
          read: member.permissions?.read || false,
          write: member.permissions?.write || false,
          approve: member.permissions?.approve || false,
          configure: member.permissions?.configure || false,
          modules: member.permissions?.modules || {}
        },
        notifications: {
          email: member.notifications?.email !== false,
          push: member.notifications?.push !== false,
          sms: member.notifications?.sms === true,
          desktop: member.notifications?.desktop !== false
        },
        configuration: {
          language: member.configuration?.language || 'es',
          timezone: member.configuration?.timezone || 'America/Mexico_City',
          theme: (member.configuration?.theme as 'light' | 'dark' | 'auto') || 'light',
          autoLogout: member.configuration?.autoLogout !== false,
          twoFactor: member.configuration?.twoFactor === true
        }
      });
    }
  }, [member]);

  // Función para asegurar que todos los módulos estén incluidos
  const ensureAllModules = (modulePermissions: { [moduleId: string]: { read: boolean; write: boolean; configure: boolean } }) => {
    const allModules = [
      'dashboard', 'contacts', 'campaigns', 'team', 'analytics', 'ai', 'settings', 'hr',
      'clients', 'notifications', 'chat', 'internal-chat', 'phone', 'knowledge-base',
      'supervision', 'copilot', 'providers', 'warehouse', 'shipping', 'services'
    ];
    
    const completeModules: { [moduleId: string]: { read: boolean; write: boolean; configure: boolean } } = {};
    
    allModules.forEach(moduleId => {
      if (modulePermissions[moduleId]) {
        // Usar permisos proporcionados
        completeModules[moduleId] = modulePermissions[moduleId];
      } else {
        // Usar permisos por defecto (sin acceso)
        completeModules[moduleId] = {
          read: false,
          write: false,
          configure: false
        };
      }
    });
    
    return completeModules;
  };

  // Cargar datos del miembro cuando se abre el modal
  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        name: member.name || '',
        email: member.email || '',
        password: '',
        role: (member.role as 'admin' | 'supervisor' | 'agent' | 'viewer') || 'agent',
        phone: member.phone || '',
        isActive: member.isActive !== false,
        permissions: {
          read: member.permissions?.read || false,
          write: member.permissions?.write || false,
          approve: member.permissions?.approve || false,
          configure: member.permissions?.configure || false,
          modules: member.permissions?.modules || {}
        },
        notifications: {
          email: member.notifications?.email !== false,
          push: member.notifications?.push !== false,
          sms: member.notifications?.sms === true,
          desktop: member.notifications?.desktop !== false
        },
        configuration: {
          language: member.configuration?.language || 'es',
          timezone: member.configuration?.timezone || 'America/Mexico_City',
          theme: (member.configuration?.theme as 'light' | 'dark' | 'auto') || 'light',
          autoLogout: member.configuration?.autoLogout !== false,
          twoFactor: member.configuration?.twoFactor === true
        }
      });
      
      // Cargar permisos de módulos cuando se abre el modal
      loadModulePermissions();
    }
  }, [member, isOpen, loadModulePermissions]);

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
      
      // Log para debug
      console.log('🔍 Permisos cargados del backend:', {
        userPermissions,
        modules: userPermissions.permissions.modules,
        notifications: userPermissions.permissions.modules.notifications
      });
      
      // Actualizar formData con los permisos reales del backend
      setFormData(prev => ({
        ...prev,
        permissions: {
          read: userPermissions.permissions.read || false,
          write: userPermissions.permissions.write || false,
          approve: userPermissions.permissions.approve || false,
          configure: userPermissions.permissions.configure || false,
          modules: userPermissions.permissions.modules || {}
        }
      }));
      
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
      
      const currentModulePerms = prev.permissions.modules[moduleId] || {
        read: false,
        write: false,
        configure: false
      };
      
      let newModulePerms = { ...currentModulePerms };
      
      if (action === 'read') {
        newModulePerms.read = value;
        // Si se deshabilita lectura, también deshabilitar escritura y configuración
        if (!value) {
          newModulePerms.write = false;
          newModulePerms.configure = false;
        }
      } else if (action === 'write') {
        newModulePerms.write = value;
        // Si se habilita escritura, también habilitar lectura
        if (value) {
          newModulePerms.read = true;
        }
        // Si se deshabilita escritura, también deshabilitar configuración
        if (!value) {
          newModulePerms.configure = false;
        }
      } else if (action === 'configure') {
        newModulePerms.configure = value;
        // Si se habilita configuración, también habilitar lectura y escritura
        if (value) {
          newModulePerms.read = true;
          newModulePerms.write = true;
        }
      }
      
      // Actualizar formData con los nuevos permisos de módulos
      setFormData(prevFormData => ({
        ...prevFormData,
        permissions: {
          ...prevFormData.permissions,
          modules: {
            ...prevFormData.permissions.modules,
            [moduleId]: newModulePerms
          }
        }
      }));
      
      // También actualizar modulePermissions para mantener sincronización
      setModulePermissions(prevModulePerms => {
        if (!prevModulePerms) return prevModulePerms;
        return {
          ...prevModulePerms,
          permissions: {
            ...prevModulePerms.permissions,
            modules: {
              ...prevModulePerms.permissions.modules,
              [moduleId]: newModulePerms
            }
          }
        };
      });
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          modules: {
            ...prev.permissions.modules,
            [moduleId]: newModulePerms
          }
        }
      };
    });
  };

  const handleSaveModulePermissions = async () => {
    if (!member?.email || !modulePermissions) return;
    
    setIsLoading(true);
    try {
      // Usar los permisos actuales de modulePermissions que tienen la estructura correcta
      await modulePermissionsService.updateUserPermissions(member.email, modulePermissions.permissions);
      infoLog('Permisos de módulos actualizados exitosamente');
      
      // Recargar los permisos actualizados
      await loadModulePermissions();
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
      configuration: {
        ...prev.configuration,
        [setting]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Si estamos en la pestaña de permisos de módulos, usar el endpoint específico
      if (activeTab === 'modulePermissions' && modulePermissions) {
        await modulePermissionsService.updateUserPermissions(member?.email || '', modulePermissions.permissions);
        infoLog('Permisos de módulos actualizados exitosamente');
      } else {
        // Para otros campos, usar el endpoint de agentes
        const completeFormData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          isActive: formData.isActive,
          password: formData.password || undefined,
          notifications: formData.notifications,
          configuration: formData.configuration
        };
        
        await onSubmit(completeFormData);
      }
      
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
                      <option value="agent">Agente</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="admin">Administrador</option>
                      <option value="viewer">Visualizador</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+52 1 477 123 4567"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                      Usuario Activo
                    </label>
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
                            checked={formData.permissions.basic[key as keyof typeof formData.permissions.basic]}
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
                ) : !modulePermissions ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">⚠️</div>
                    <p className="text-gray-600">No se pudieron cargar los permisos de módulos</p>
                    <button
                      type="button"
                      onClick={loadModulePermissions}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Permisos de Módulos</h3>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Habilitar todos los módulos con lectura
                            if (modulePermissions && Object.keys(availableModules).length > 0) {
                              const newPermissions = { ...modulePermissions };
                              Object.keys(availableModules).forEach(moduleId => {
                                newPermissions.permissions.modules[moduleId] = {
                                  read: true,
                                  write: false,
                                  configure: false
                                };
                              });
                              setModulePermissions(newPermissions);
                              
                              // Actualizar también el formData
                              setFormData(prev => ({
                                ...prev,
                                permissions: {
                                  ...prev.permissions,
                                  modules: newPermissions.permissions.modules
                                }
                              }));
                            }
                          }}
                          disabled={!modulePermissions || Object.keys(availableModules).length === 0}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Habilitar Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Deshabilitar todos los módulos
                            if (modulePermissions && Object.keys(availableModules).length > 0) {
                              const newPermissions = { ...modulePermissions };
                              Object.keys(availableModules).forEach(moduleId => {
                                newPermissions.permissions.modules[moduleId] = {
                                  read: false,
                                  write: false,
                                  configure: false
                                };
                              });
                              setModulePermissions(newPermissions);
                              
                              // Actualizar también el formData
                              setFormData(prev => ({
                                ...prev,
                                permissions: {
                                  ...prev.permissions,
                                  modules: newPermissions.permissions.modules
                                }
                              }));
                            }
                          }}
                          disabled={!modulePermissions || Object.keys(availableModules).length === 0}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Deshabilitar Todos
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveModulePermissions}
                          disabled={isLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {Object.entries(availableModules).map(([moduleId, module]) => {
                        // Validar que los datos del módulo existan
                        if (!module || typeof module !== 'object') {
                          return null;
                        }
                        
                        // Usar los permisos reales del backend (modulePermissions) en lugar del formData
                        const currentModulePermissions = modulePermissions?.permissions?.modules?.[moduleId] || {
                          read: false,
                          write: false,
                          configure: false
                        };
                        
                        // Log para debug
                        if (moduleId === 'notifications') {
                          console.log('🔍 Renderizando módulo notifications:', {
                            moduleId,
                            currentModulePermissions,
                            modulePermissions: modulePermissions?.permissions?.modules,
                            allModules: modulePermissions?.permissions?.modules
                          });
                        }
                        
                        const moduleData = module as { 
                          id: string;
                          name: string; 
                          description: string; 
                          level: 'basic' | 'intermediate' | 'advanced';
                        };
                        
                        // Validar que los datos requeridos del módulo existan
                        if (!moduleData.id || !moduleData.name) {
                          return null;
                        }
                        
                        return (
                          <div key={moduleId} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                  {moduleData.name}
                                  {currentModulePermissions.read && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Activo
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">{moduleData.description}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                moduleData.level === 'advanced' ? 'bg-red-100 text-red-800' :
                                moduleData.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {moduleData.level}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`module-${moduleId}-read`}
                                  checked={currentModulePermissions.read}
                                  onChange={(e) => handleModulePermissionChange(moduleId, 'read', e.target.checked)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor={`module-${moduleId}-read`} className="text-sm text-gray-700 font-medium">
                                  📖 Leer
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`module-${moduleId}-write`}
                                  checked={currentModulePermissions.write}
                                  onChange={(e) => handleModulePermissionChange(moduleId, 'write', e.target.checked)}
                                  disabled={!currentModulePermissions.read}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <label htmlFor={`module-${moduleId}-write`} className={`text-sm font-medium ${
                                  !currentModulePermissions.read ? 'text-gray-400' : 'text-gray-700'
                                }`}>
                                  ✏️ Escribir
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`module-${moduleId}-configure`}
                                  checked={currentModulePermissions.configure}
                                  onChange={(e) => handleModulePermissionChange(moduleId, 'configure', e.target.checked)}
                                  disabled={!currentModulePermissions.write}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <label htmlFor={`module-${moduleId}-configure`} className={`text-sm font-medium ${
                                  !currentModulePermissions.write ? 'text-gray-400' : 'text-gray-700'
                                }`}>
                                  ⚙️ Configurar
                                </label>
                              </div>
                            </div>
                            
                            {/* Información adicional */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>ID: {moduleId}</span>
                                <span>
                                  {Object.values(currentModulePermissions).filter(Boolean).length}/3 permisos activos
                                </span>
                              </div>
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
                      value={formData.configuration.language}
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
                      value={formData.configuration.timezone}
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
                      value={formData.configuration.theme}
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
                      checked={formData.configuration.autoLogout}
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
                      checked={formData.configuration.twoFactor}
                      onChange={(e) => handleSettingChange('twoFactor', e.target.checked)}
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