import React, { useState, useEffect, useCallback } from 'react';
import type { CreateAgentRequest } from '../../../types/team';
import { TeamMember } from '../../../types/team';
import { infoLog } from '../../../config/logger';
import { modulePermissionsService, UserModulePermissions } from '../../../services/modulePermissions';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agent: TeamMember) => void;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'agent' as const,
    phone: ''
  });

  const [permissions, setPermissions] = useState({
    read: true,
    write: true,
    approve: false,
    configure: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'modulePermissions'>('profile');
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  // Inicializar permisos de módulos basados en el rol
  const initializeModulePermissions = useCallback(() => {
    if (!formData.role) return;

    const defaultPermissions: { [moduleId: string]: { read: boolean; write: boolean; configure: boolean } } = {};
    
    Object.keys(systemModules).forEach(moduleId => {
      const module = systemModules[moduleId as keyof typeof systemModules];
      const isBasicRole = formData.role === 'agent' || formData.role === 'viewer';
      const isAdvancedRole = formData.role === 'admin';
      const isSupervisor = formData.role === 'supervisor';
      
      if (isAdvancedRole) {
        // Admin: acceso completo a todos los módulos
        defaultPermissions[moduleId] = { read: true, write: true, configure: true };
      } else if (isSupervisor) {
        // Supervisor: acceso de lectura y escritura, configuración limitada
        defaultPermissions[moduleId] = { 
          read: true, 
          write: true, 
          configure: module.level !== 'advanced' 
        };
      } else if (isBasicRole) {
        // Roles básicos: acceso limitado según el tipo de módulo
        const allowedCategories = ['core', 'communication', 'support'];
        const hasAccess = allowedCategories.includes(module.category);
        
        defaultPermissions[moduleId] = { 
          read: hasAccess, 
          write: hasAccess && module.level === 'basic', 
          configure: false 
        };
      } else {
        // Rol desconocido: acceso básico solo a módulos core
        const isCore = module.category === 'core';
        defaultPermissions[moduleId] = { 
          read: isCore, 
          write: false, 
          configure: false 
        };
      }
    });

    const newModulePermissions: UserModulePermissions = {
      email: formData.email || 'nuevo@agente.com',
      role: formData.role,
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

    setModulePermissions(newModulePermissions);
    setAvailableModules(systemModules);
  }, [formData.role, formData.email, systemModules]);

  // Inicializar permisos cuando cambia el rol
  useEffect(() => {
    if (formData.role && isOpen) {
      initializeModulePermissions();
    }
  }, [formData.role, isOpen, initializeModulePermissions]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'El formato del teléfono no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && !isSubmitting) {
      setIsSubmitting(true);
      
      try {
        const agentData: CreateAgentRequest = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          phone: formData.phone.trim() || undefined,
          permissions,
          modulePermissions: modulePermissions?.permissions || undefined
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        onAgentCreated(agentData as TeamMember); // Assuming onAgentCreated handles the actual creation
        
        // Resetear formulario
        setFormData({
          name: '',
          email: '',
          role: 'agent',
          phone: ''
        });
        setPermissions({
          read: true,
          write: true,
          approve: false,
          configure: false
        });
        setModulePermissions(null);
        setAvailableModules({});
        setErrors({});
        setActiveTab('profile');
        onClose();
      } catch (error) {
        // El error se maneja en el componente padre
        console.error('Error creating agent:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        email: '',
        role: 'agent',
        phone: ''
      });
      setPermissions({
        read: true,
        write: true,
        approve: false,
        configure: false
      });
      setModulePermissions(null);
      setAvailableModules({});
      setErrors({});
      setActiveTab('profile');
      onClose();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'permissions', label: 'Permisos', icon: '🔐' },
    { id: 'modulePermissions', label: 'Módulos', icon: '📋' }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Crear Nuevo Agente
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar modal"
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
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      name="name"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : ''
                      }`}
                      placeholder="Ej: María García López"
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      name="email"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : ''
                      }`}
                      placeholder="maria.garcia@empresa.com"
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      value={formData.role}
                      onChange={handleInputChange}
                      name="role"
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
                      value={formData.phone}
                      onChange={handleInputChange}
                      name="phone"
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-300' : ''
                      }`}
                      placeholder="+52 1 477 123 4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Opcional. Formato internacional recomendado.</p>
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
                            checked={permissions[key as keyof typeof permissions]}
                            onChange={() => handlePermissionChange(key as keyof typeof permissions)}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Permisos de Módulos</h3>
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
                    <p>Selecciona un rol para ver los módulos disponibles.</p>
                  </div>
                )}
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creando...
                </>
              ) : (
                <>
                  ➕ Nuevo Agente
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAgentModal; 