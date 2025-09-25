import React, { useState, useEffect, useCallback } from 'react';
import type { TeamMember } from '../../../types/team';
import { infoLog } from '../../../config/logger';
import { modulePermissionsService, UserModulePermissions } from '../../../services/modulePermissions';
import { usePermissionNotification } from '../../../components/notifications/PermissionNotification';

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
  const { showSuccess, showError, showLoading, hideNotification, NotificationComponent } = usePermissionNotification();
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

  // Módulos predefinidos del sistema
  const systemModules = {
    dashboard: {
      name: 'Dashboard',
      description: 'Panel principal con métricas y estadísticas del sistema',
      level: 'basic',
      icon: '📊',
      category: 'core'
    },
    chat: {
      name: 'Chat',
      description: 'Mensajería y conversaciones con clientes',
      level: 'basic',
      icon: '💬',
      category: 'communication'
    },
    clients: {
      name: 'Clientes',
      description: 'Gestión de contactos y clientes',
      level: 'intermediate',
      icon: '👥',
      category: 'crm'
    },
    team: {
      name: 'Equipo',
      description: 'Gestión de agentes y equipos de trabajo',
      level: 'advanced',
      icon: '👨‍💼',
      category: 'management'
    },
    hr: {
      name: 'Recursos Humanos',
      description: 'Empleados, nóminas y gestión de RRHH',
      level: 'advanced',
      icon: '🏢',
      category: 'management'
    },
    campaigns: {
      name: 'Campañas',
      description: 'Campañas de marketing y envíos masivos',
      level: 'intermediate',
      icon: '📢',
      category: 'marketing'
    },
    phone: {
      name: 'Teléfono',
      description: 'Sistema de llamadas VoIP',
      level: 'basic',
      icon: '📞',
      category: 'communication'
    },
    'knowledge-base': {
      name: 'Base de Conocimiento',
      description: 'Documentación y recursos de ayuda',
      level: 'basic',
      icon: '📚',
      category: 'support'
    },
    supervision: {
      name: 'Supervisión',
      description: 'Monitoreo y supervisión de agentes',
      level: 'advanced',
      icon: '👁️',
      category: 'management'
    },
    copilot: {
      name: 'Copiloto IA',
      description: 'Asistente de inteligencia artificial',
      level: 'intermediate',
      icon: '🤖',
      category: 'ai'
    },
    providers: {
      name: 'Proveedores',
      description: 'Gestión de proveedores y servicios externos',
      level: 'advanced',
      icon: '🚚',
      category: 'operations'
    },
    warehouse: {
      name: 'Almacén',
      description: 'Gestión de inventario y almacén',
      level: 'intermediate',
      icon: '🏪',
      category: 'operations'
    },
    shipping: {
      name: 'Envíos',
      description: 'Logística y gestión de envíos',
      level: 'intermediate',
      icon: '📦',
      category: 'operations'
    },
    services: {
      name: 'Servicios',
      description: 'Configuración de servicios del sistema',
      level: 'advanced',
      icon: '⚙️',
      category: 'configuration'
    },
    notifications: {
      name: 'Notificaciones',
      description: 'Centro de notificaciones del sistema',
      level: 'basic',
      icon: '🔔',
      category: 'core'
    },
    'internal-chat': {
      name: 'Chat Interno',
      description: 'Comunicación interna entre agentes',
      level: 'basic',
      icon: '💭',
      category: 'communication'
    }
  };

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
      // Intentar cargar módulos disponibles del backend
      let modules = {};
      let userPermissions: UserModulePermissions | null = null;
      
      try {
        const [backendModules, backendUserPermissions] = await Promise.all([
        modulePermissionsService.getAvailableModules(),
        modulePermissionsService.getUserPermissions(member.email)
      ]);
        modules = backendModules;
        userPermissions = backendUserPermissions;
        infoLog('Módulos cargados desde backend:', { modules, userPermissions });
      } catch (backendError) {
        infoLog('Error cargando desde backend, usando módulos predefinidos:', backendError);
        // Usar módulos predefinidos como fallback
        modules = systemModules;
        
        // Intentar cargar permisos guardados localmente
        const localStorageKey = `modulePermissions_${member.email}`;
        const savedPermissions = localStorage.getItem(localStorageKey);
        if (savedPermissions) {
          try {
            const parsedPermissions = JSON.parse(savedPermissions);
            userPermissions = parsedPermissions;
            infoLog('Permisos cargados desde localStorage', { email: member.email });
          } catch (parseError) {
            infoLog('Error parseando permisos guardados:', parseError);
          }
        }
        
        // Crear permisos por defecto basados en el rol
        const defaultPermissions: { [moduleId: string]: { read: boolean; write: boolean; configure: boolean } } = {};
        
        Object.keys(systemModules).forEach(moduleId => {
          // Permisos por defecto basados en el rol del usuario
          const isBasicRole = member.role?.toLowerCase().includes('junior') || member.role?.toLowerCase().includes('ejecutivo');
          const isAdvancedRole = member.role?.toLowerCase().includes('admin') || member.role?.toLowerCase().includes('manager');
          const isSupervisor = member.role?.toLowerCase().includes('supervisor');
          
          if (isAdvancedRole) {
            // Admin/Manager: acceso completo a todos los módulos
            defaultPermissions[moduleId] = { read: true, write: true, configure: true };
          } else if (isSupervisor) {
            // Supervisor: acceso de lectura y escritura, configuración limitada
            const moduleInfo = systemModules[moduleId as keyof typeof systemModules];
            defaultPermissions[moduleId] = { 
              read: true, 
              write: true, 
              configure: moduleInfo.level !== 'advanced' 
            };
          } else if (isBasicRole) {
            // Roles básicos: acceso limitado según el tipo de módulo
            const moduleInfo = systemModules[moduleId as keyof typeof systemModules];
            const allowedCategories = ['core', 'communication', 'support'];
            const hasAccess = allowedCategories.includes(moduleInfo.category);
            
            defaultPermissions[moduleId] = { 
              read: hasAccess, 
              write: hasAccess && moduleInfo.level === 'basic', 
              configure: false 
            };
          } else {
            // Rol desconocido: acceso básico solo a módulos core
            const moduleInfo = systemModules[moduleId as keyof typeof systemModules];
            const isCore = moduleInfo.category === 'core';
            defaultPermissions[moduleId] = { 
              read: isCore, 
              write: false, 
              configure: false 
            };
          }
        });
        
        userPermissions = {
          email: member.email,
          role: member.role || 'unknown',
          accessibleModules: Object.entries(systemModules).map(([id, module]) => ({
            id,
            name: module.name,
            description: module.description,
            level: module.level as 'basic' | 'intermediate' | 'advanced',
            actions: defaultPermissions[id]
          })),
          permissions: {
            modules: defaultPermissions
          }
        };
      }
      
      setAvailableModules(modules);
      setModulePermissions(userPermissions);
      infoLog('Permisos de módulos cargados exitosamente', { 
        modulesCount: Object.keys(modules).length,
        userEmail: member.email,
        role: member.role
      });
      
    } catch (error) {
      infoLog('Error crítico cargando permisos de módulos:', error);
      // En caso de error crítico, usar módulos del sistema sin permisos
      setAvailableModules(systemModules);
      setModulePermissions(null);
    } finally {
      setLoadingModules(false);
    }
  }, [member?.email, member?.role, systemModules]);

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
    showLoading('Guardando permisos...', 'Actualizando configuración de módulos');
    
    try {
      // Intentar actualizar en el backend
      try {
        const updatedPermissions = await modulePermissionsService.updateUserPermissions(member.email, modulePermissions.permissions);
        infoLog('Permisos de módulos actualizados exitosamente en el backend', {
          email: member.email,
          modulesCount: Object.keys(modulePermissions.permissions.modules).length
        });
        
        // Actualizar el estado local con la respuesta del backend
        setModulePermissions(updatedPermissions);
        
        // Mostrar mensaje de éxito
        showSuccess('¡Permisos actualizados!', 'Los permisos de módulos se han guardado exitosamente');
        
      } catch (backendError) {
        infoLog('Error actualizando en backend, guardando localmente:', backendError);
        
        // Fallback: guardar en localStorage para demostración
        const localStorageKey = `modulePermissions_${member.email}`;
        localStorage.setItem(localStorageKey, JSON.stringify(modulePermissions));
        
        // Mostrar mensaje informativo
        showSuccess('Permisos guardados localmente', 'Los permisos se han guardado en el navegador (modo offline)');
      }
      
      // Actualizar el estado local independientemente del resultado del backend
      infoLog('Permisos actualizados en el estado local', {
        email: member.email,
        permissions: modulePermissions.permissions.modules
      });
      
    } catch (error) {
      infoLog('Error crítico actualizando permisos de módulos:', error);
      showError('Error al guardar permisos', 'Por favor, intenta de nuevo');
    } finally {
      setIsLoading(false);
      hideNotification();
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
    <>
      <NotificationComponent />
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
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Resumen:</span>
                          {modulePermissions && (
                            <>
                              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {Object.values(modulePermissions.permissions.modules).filter(p => p.read).length} con lectura
                              </span>
                              <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {Object.values(modulePermissions.permissions.modules).filter(p => p.write).length} con escritura
                              </span>
                              <span className="ml-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                {Object.values(modulePermissions.permissions.modules).filter(p => p.configure).length} con configuración
                              </span>
                            </>
                          )}
                        </div>
                      <button
                        type="button"
                        onClick={handleSaveModulePermissions}
                        disabled={isLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              💾 Guardar Cambios
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Filtros rápidos por rol */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-3">Configuración Rápida por Rol</h4>
                        <p className="text-xs text-blue-700 mb-3">Selecciona una plantilla predefinida de permisos según el rol del agente:</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!modulePermissions) return;
                              const newPermissions = { ...modulePermissions };
                              Object.keys(systemModules).forEach(moduleId => {
                                const module = systemModules[moduleId as keyof typeof systemModules];
                                const allowedCategories = ['core', 'communication', 'support'];
                                const hasAccess = allowedCategories.includes(module.category);
                                newPermissions.permissions.modules[moduleId] = {
                                  read: hasAccess,
                                  write: hasAccess && module.level === 'basic',
                                  configure: false
                                };
                              });
                              setModulePermissions(newPermissions);
                            }}
                            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                          >
                            🎯 Agente Básico (Chat + Dashboard)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!modulePermissions) return;
                              const newPermissions = { ...modulePermissions };
                              Object.keys(systemModules).forEach(moduleId => {
                                const module = systemModules[moduleId as keyof typeof systemModules];
                                const allowedCategories = ['core', 'communication', 'crm', 'marketing', 'support'];
                                const hasAccess = allowedCategories.includes(module.category);
                                newPermissions.permissions.modules[moduleId] = {
                                  read: hasAccess,
                                  write: hasAccess,
                                  configure: module.level === 'basic'
                                };
                              });
                              setModulePermissions(newPermissions);
                            }}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            💼 Vendedor (Chat + Clientes + Campañas)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!modulePermissions) return;
                              const newPermissions = { ...modulePermissions };
                              Object.keys(systemModules).forEach(moduleId => {
                                const module = systemModules[moduleId as keyof typeof systemModules];
                                const allowedCategories = ['core', 'management', 'support'];
                                const hasAccess = allowedCategories.includes(module.category);
                                newPermissions.permissions.modules[moduleId] = {
                                  read: hasAccess,
                                  write: hasAccess,
                                  configure: hasAccess && module.level !== 'advanced'
                                };
                              });
                              setModulePermissions(newPermissions);
                            }}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
                          >
                            🏢 RH/Admin (HR + Team + Dashboard)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!modulePermissions) return;
                              const newPermissions = { ...modulePermissions };
                              Object.keys(systemModules).forEach(moduleId => {
                                const module = systemModules[moduleId as keyof typeof systemModules];
                                // Contadores: acceso a HR, Dashboard, y módulos financieros
                                const allowedModules = ['hr', 'dashboard', 'team', 'notifications'];
                                const hasAccess = allowedModules.includes(moduleId);
                                newPermissions.permissions.modules[moduleId] = {
                                  read: hasAccess,
                                  write: hasAccess && (moduleId === 'hr' || moduleId === 'dashboard'),
                                  configure: hasAccess && moduleId === 'hr'
                                };
                              });
                              setModulePermissions(newPermissions);
                            }}
                            className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
                          >
                            🧮 Contador (HR + Finanzas)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!modulePermissions) return;
                              const newPermissions = { ...modulePermissions };
                              Object.keys(systemModules).forEach(moduleId => {
                                const module = systemModules[moduleId as keyof typeof systemModules];
                                // Supervisores: acceso amplio con configuración limitada
                                const restrictedModules = ['hr', 'services'];
                                const hasFullAccess = !restrictedModules.includes(moduleId);
                                newPermissions.permissions.modules[moduleId] = {
                                  read: true,
                                  write: hasFullAccess,
                                  configure: hasFullAccess && module.level !== 'advanced'
                                };
                              });
                              setModulePermissions(newPermissions);
                            }}
                            className="px-3 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200 transition-colors"
                          >
                            👁️ Supervisor (Monitoreo + Chat)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!modulePermissions) return;
                              const newPermissions = { ...modulePermissions };
                              Object.keys(systemModules).forEach(moduleId => {
                                newPermissions.permissions.modules[moduleId] = {
                                  read: true,
                                  write: true,
                                  configure: true
                                };
                              });
                              setModulePermissions(newPermissions);
                            }}
                            className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
                          >
                            👑 Acceso Completo
                      </button>
                        </div>
                      </div>

                      {/* Módulos organizados por categorías */}
                      {Object.entries({
                        'core': { name: 'Módulos Principales', icon: '🏠', color: 'blue' },
                        'communication': { name: 'Comunicación', icon: '💬', color: 'green' },
                        'crm': { name: 'CRM', icon: '👥', color: 'purple' },
                        'management': { name: 'Gestión', icon: '👨‍💼', color: 'red' },
                        'marketing': { name: 'Marketing', icon: '📢', color: 'yellow' },
                        'operations': { name: 'Operaciones', icon: '⚙️', color: 'gray' },
                        'ai': { name: 'Inteligencia Artificial', icon: '🤖', color: 'indigo' },
                        'support': { name: 'Soporte', icon: '📚', color: 'teal' },
                        'configuration': { name: 'Configuración', icon: '⚙️', color: 'orange' }
                      }).map(([category, categoryInfo]) => {
                        const categoryModules = Object.entries(availableModules).filter(([, module]) => {
                          const moduleData = module as { category: string };
                          return moduleData.category === category;
                        });

                        if (categoryModules.length === 0) return null;

                        return (
                          <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className={`bg-${categoryInfo.color}-50 border-b border-${categoryInfo.color}-200 px-4 py-3`}>
                              <h4 className={`text-sm font-medium text-${categoryInfo.color}-900 flex items-center gap-2`}>
                                <span>{categoryInfo.icon}</span>
                                {categoryInfo.name}
                                <span className={`text-xs px-2 py-1 bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800 rounded-full`}>
                                  {categoryModules.length} módulos
                                </span>
                              </h4>
                    </div>
                    
                            <div className="p-4 space-y-4">
                              {categoryModules.map(([moduleId, module]) => {
                        const currentModulePermissions = modulePermissions?.permissions?.modules?.[moduleId];
                                const moduleData = module as { name: string; description: string; level: string; icon: string };
                        
                        return (
                                  <div key={moduleId} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl">{moduleData.icon}</span>
                              <div>
                                          <h5 className="text-sm font-medium text-gray-900">{moduleData.name}</h5>
                                <p className="text-xs text-gray-600">{moduleData.description}</p>
                              </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                moduleData.level === 'advanced' ? 'bg-red-100 text-red-800' :
                                moduleData.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {moduleData.level}
                              </span>
                                      </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              {Object.entries({
                                        read: { label: '👁️ Leer', description: 'Ver información', color: 'green' },
                                        write: { label: '✏️ Escribir', description: 'Crear y editar', color: 'blue' },
                                        configure: { label: '⚙️ Configurar', description: 'Administrar', color: 'purple' }
                              }).map(([action, actionInfo]) => (
                                        <div key={action} className="flex flex-col items-center space-y-2">
                                          <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={currentModulePermissions?.[action as keyof typeof currentModulePermissions] || false}
                                    onChange={(e) => handleModulePermissionChange(moduleId, action as 'read' | 'write' | 'configure', e.target.checked)}
                                              className={`w-4 h-4 text-${actionInfo.color}-600 border-gray-300 rounded focus:ring-${actionInfo.color}-500`}
                                  />
                                            <span className="text-sm font-medium text-gray-700">{actionInfo.label}</span>
                                  </label>
                                          <p className="text-xs text-gray-500 text-center">{actionInfo.description}</p>
                                </div>
                              ))}
                                    </div>
                                  </div>
                                );
                              })}
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
    </>
  );
}; 