import React, { useState, useEffect, useCallback } from 'react';
import type { CreateAgentRequest } from '../../../types/team';
import { TeamMember } from '../../../types/team';
import { modulePermissionsService, UserModulePermissions } from '../../../services/modulePermissions';
import { infoLog } from '../../../config/logger';

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

  // Estados para permisos de módulos
  const [availableModules, setAvailableModules] = useState<{ [moduleId: string]: unknown }>({});
  const [modulePermissions, setModulePermissions] = useState<{ [moduleId: string]: { read: boolean; write: boolean; configure: boolean } }>({});
  const [loadingModules, setLoadingModules] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'permissions' | 'modules' | 'notifications' | 'configuration'>('basic');

  // Estados para notificaciones
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true
  });

  // Estados para configuración
  const [configuration, setConfiguration] = useState({
    language: 'es',
    timezone: 'America/Mexico_City',
    theme: 'light' as const,
    autoLogout: true,
    twoFactor: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Manejar cambios en notificaciones
  const handleNotificationChange = (notification: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [notification]: value
    }));
  };

  // Manejar cambios en configuración
  const handleConfigurationChange = (config: keyof typeof configuration, value: string | boolean) => {
    setConfiguration(prev => ({
      ...prev,
      [config]: value
    }));
  };

  // Cargar módulos disponibles
  const loadAvailableModules = useCallback(async () => {
    setLoadingModules(true);
    try {
      const modules = await modulePermissionsService.getAvailableModules();
      setAvailableModules(modules);
      
      // Inicializar permisos de módulos con valores por defecto según el rol
      const defaultPermissions: { [moduleId: string]: { read: boolean; write: boolean; configure: boolean } } = {};
      Object.keys(modules).forEach(moduleId => {
        defaultPermissions[moduleId] = {
          read: false,
          write: false,
          configure: false
        };
      });
      setModulePermissions(defaultPermissions);
      
      infoLog('Módulos disponibles cargados', { totalModules: Object.keys(modules).length });
    } catch (error) {
      infoLog('Error cargando módulos disponibles:', error);
    } finally {
      setLoadingModules(false);
    }
  }, []);

  // Cargar módulos cuando se abre el modal
  useEffect(() => {
    if (isOpen && activeTab === 'modules') {
      loadAvailableModules();
    }
  }, [isOpen, activeTab, loadAvailableModules]);

  // Manejar cambios de permisos de módulos
  const handleModulePermissionChange = (moduleId: string, action: 'read' | 'write' | 'configure', value: boolean) => {
    setModulePermissions(prev => {
      const currentModulePerms = prev[moduleId] || {
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
      
      return {
        ...prev,
        [moduleId]: newModulePerms
      };
    });
  };

  const validateForm = async () => {
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
    } else {
      // Verificar si el email ya existe
      try {
        const { teamService } = await import('../services/teamService');
        const emailExists = await teamService.checkEmailExists(formData.email.trim());
        if (emailExists) {
          newErrors.email = 'Este email ya está registrado';
        }
      } catch (error) {
        // Si hay error en la verificación, continuar sin bloquear
        infoLog('Error verificando email, continuando con validación', { error });
      }
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'El formato del teléfono no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (isValid && !isSubmitting) {
      setIsSubmitting(true);
      
      try {
        // ✅ PREPARAR DATOS COMPLETOS PARA EL BACKEND
        const agentCompleteData = {
          // Información básica
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          phone: formData.phone.trim() || undefined,
          
          // Permisos básicos
          permissions: {
            read: permissions.read,
            write: permissions.write,
            approve: permissions.approve,
            configure: permissions.configure,
            modules: ensureAllModules(modulePermissions)
          },
          
          // Notificaciones del usuario
          notifications: notifications,
          
          // Configuración del usuario
          configuration: configuration
        };
        
        infoLog('Creando agente con datos completos', { email: agentCompleteData.email });
        
        // ✅ USAR TEAMSERVICE PARA CREAR AGENTE REAL
        const { teamService } = await import('../services/teamService');
        const result = await teamService.createAgentComplete(agentCompleteData);
        
        infoLog('Agente creado exitosamente', { 
          id: result.agent.id,
          email: result.agent.email,
          hasAccessInfo: !!result.accessInfo
        });
        
        // Mostrar información de acceso si está disponible
        if (result.accessInfo) {
          infoLog('Información de acceso temporal generada', {
            hasTemporaryPassword: !!result.accessInfo.temporaryPassword,
            mustChangePassword: result.accessInfo.mustChangePassword
          });
        }
        
        // ✅ MOSTRAR MENSAJE DE ÉXITO
        infoLog('✅ Agente creado exitosamente', { 
          name: result.agent.name,
          email: result.agent.email 
        });
        
        // ✅ MOSTRAR NOTIFICACIÓN DE ÉXITO AL USUARIO
        alert(`✅ Agente creado exitosamente!\n\nNombre: ${result.agent.name}\nEmail: ${result.agent.email}\nRol: ${result.agent.role}`);
        
        // Notificar al componente padre
        onAgentCreated(result.agent);
        
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
        setModulePermissions({});
        setNotifications({
          email: true,
          push: true,
          sms: false,
          desktop: true
        });
        setConfiguration({
          language: 'es',
          timezone: 'America/Mexico_City',
          theme: 'light',
          autoLogout: true,
          twoFactor: false
        });
        setActiveTab('basic');
        setErrors({});
        
        // ✅ CERRAR MODAL DESPUÉS DE ÉXITO
        onClose();
        
      } catch (error) {
        let errorMessage = 'Error al crear agente';
        
        // Manejar errores específicos del backend
        if (error instanceof Error) {
          const errorStr = error.message.toLowerCase();
          
          if (errorStr.includes('email') && errorStr.includes('already') || 
              errorStr.includes('duplicate') || 
              errorStr.includes('ya existe')) {
            errorMessage = 'Ya existe un agente con este email. Por favor, usa un email diferente.';
            setErrors({ email: 'Este email ya está registrado' });
          } else if (errorStr.includes('invalid') && errorStr.includes('email')) {
            errorMessage = 'El formato del email no es válido.';
            setErrors({ email: 'Formato de email inválido' });
          } else if (errorStr.includes('required') || errorStr.includes('requerido')) {
            errorMessage = 'Por favor, completa todos los campos obligatorios.';
          } else {
            errorMessage = error.message;
          }
        }
        
        infoLog('Error creando agente:', { error: errorMessage, originalError: error });
        setErrors(prev => ({ ...prev, submit: errorMessage }));
        
        // ✅ MOSTRAR NOTIFICACIÓN DE ERROR AL USUARIO
        alert(`❌ Error al crear agente:\n\n${errorMessage}`);
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
      setModulePermissions({});
      setAvailableModules({});
      setActiveTab('basic');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👤 Información Básica
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔒 Permisos Básicos
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🧩 Permisos de Módulos
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔔 Notificaciones
            </button>
            <button
              onClick={() => setActiveTab('configuration')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'configuration'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ Configuración
            </button>
          </nav>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Tab: Información básica */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
            
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: María García López"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="maria.garcia@empresa.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isSubmitting}
              >
                <option value="agent">Agente</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+52 1 477 123 4567"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Opcional. Formato internacional recomendado.</p>
            </div>
              </div>
            )}

            {/* Tab: Permisos Básicos */}
            {activeTab === 'permissions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Permisos Básicos</h3>
                <p className="text-sm text-gray-600">
                  Selecciona los permisos generales que tendrá el nuevo agente
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePermissionChange('read')}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      permissions.read
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="font-medium">Leer</span>
                    </div>
                    <p className="text-xs mt-1 opacity-75">Acceso de lectura</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePermissionChange('write')}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      permissions.write
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium">Escribir</span>
                    </div>
                    <p className="text-xs mt-1 opacity-75">Acceso de escritura</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePermissionChange('approve')}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      permissions.approve
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Aprobar</span>
                    </div>
                    <p className="text-xs mt-1 opacity-75">Permisos de aprobación</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePermissionChange('configure')}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      permissions.configure
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">Configurar</span>
                    </div>
                    <p className="text-xs mt-1 opacity-75">Permisos de configuración</p>
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Permisos de Módulos */}
            {activeTab === 'modules' && (
              <div className="space-y-6">
                {loadingModules ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Cargando módulos disponibles...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Permisos de Módulos</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Configura qué módulos podrá acceder el nuevo agente
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Habilitar todos los módulos con lectura
                            const newPermissions = { ...modulePermissions };
                            Object.keys(availableModules).forEach(moduleId => {
                              newPermissions[moduleId] = {
                                read: true,
                                write: false,
                                configure: false
                              };
                            });
                            setModulePermissions(newPermissions);
                          }}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                          Habilitar Todos
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Deshabilitar todos los módulos
                            const newPermissions = { ...modulePermissions };
                            Object.keys(availableModules).forEach(moduleId => {
                              newPermissions[moduleId] = {
                                read: false,
                                write: false,
                                configure: false
                              };
                            });
                            setModulePermissions(newPermissions);
                          }}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                          Deshabilitar Todos
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(availableModules).map(([moduleId, module]) => {
                        const currentModulePermissions = modulePermissions[moduleId] || {
                          read: false,
                          write: false,
                          configure: false
                        };
                        
                        const moduleData = module as { 
                          id: string;
                          name: string; 
                          description: string; 
                          level: 'basic' | 'intermediate' | 'advanced';
                        };
                        
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
          </div>
        </form>

        {/* Botones de acción */}
        <div className="flex items-center space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e as any);
            }}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </>
            ) : (
              '+ Nuevo Agente'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAgentModal; 