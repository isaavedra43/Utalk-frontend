import React, { useState } from 'react';
import { X, ArrowLeft, User, BarChart3, TrendingUp, Edit, Shield, Users, Brain, Bell } from 'lucide-react';
import type { TeamMember } from '../../../types/team';
import { EditAgentModal } from './EditAgentModal';
import { logger, LogCategory } from '../../../utils/logger';
import { teamService } from '../services/teamService';

interface TeamMemberDetailsProps {
  member: TeamMember;
  onRefresh: () => void;
  onClose?: () => void; // Para cerrar el modal móvil
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

export const TeamMemberDetails: React.FC<TeamMemberDetailsProps> = ({
  member,
  onRefresh,
  onClose
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'kpis' | 'trends'>('overview');

  const handleUpdateAgent = async (agentData: EditAgentData) => {
    try {
      logger.systemInfo('Iniciando actualización de agente', { 
        agentId: member.id,
        agentName: agentData.name 
      });

      // Preparar datos para la API según la estructura del backend (SOLO datos básicos del agente)
      const updateData = {
        name: agentData.name?.trim() || '',
        email: agentData.email?.trim() || '',
        role: agentData.role || 'agent',
        phone: agentData.phone?.trim() || null,
        isActive: agentData.isActive !== false,
        // NO enviar permissions aquí - se manejan por separado con modulePermissionsService
        notifications: {
          email: agentData.notifications?.email !== false,
          push: agentData.notifications?.push !== false,
          sms: agentData.notifications?.sms === true,
          desktop: agentData.notifications?.desktop !== false
        },
        configuration: {
          language: agentData.configuration?.language || 'es',
          timezone: agentData.configuration?.timezone || 'America/Mexico_City',
          theme: agentData.configuration?.theme || 'light',
          autoLogout: agentData.configuration?.autoLogout !== false,
          twoFactor: agentData.configuration?.twoFactor === true
        }
      };

      // Si hay contraseña, agregarla como newPassword
      if (agentData.password && agentData.password.trim()) {
        (updateData as any).newPassword = agentData.password.trim();
      }

      // Debug: Log del payload antes de enviar
      logger.systemInfo('Payload de actualización', { 
        updateData: JSON.stringify(updateData, null, 2)
      });

      // Llamar API para actualizar agente usando el email como ID
      await teamService.updateAgent(member.email, updateData);
      
      logger.systemInfo('Agente actualizado exitosamente', { 
        agentId: member.id,
        agentName: agentData.name 
      });

      // Refrescar la lista de agentes
      onRefresh();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar agente';
      logger.error(LogCategory.SYSTEM, 'Error updating agent', error as Error);
      
      // Mostrar error al usuario
      alert(`Error al actualizar agente: ${errorMessage}`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: User },
    { id: 'kpis', label: 'KPIs', icon: BarChart3 },
    { id: 'trends', label: 'Tendencias', icon: TrendingUp }
  ] as const;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header - Desktop */}
      <div className="hidden lg:block p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
              {member.avatar || member.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
              <p className="text-gray-600 capitalize">{member.role}</p>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Header - Mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{member.name}</h2>
            <p className="text-sm text-gray-500 capitalize">{member.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Edit className="h-5 w-5 text-gray-600" />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 lg:px-6 py-3 border-b border-gray-200">
        <nav className="flex space-x-4 lg:space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto scrollbar-medium">
        {activeTab === 'overview' && (
          <div className="space-y-4 lg:space-y-6">
            {/* Información Personal */}
            <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Nombre completo:</span>
                  <span className="ml-2 text-sm text-gray-900">{member.name}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Email:</span>
                  <span className="ml-2 text-sm text-gray-900">{member.email}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Rol:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    member.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    member.role === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                    member.role === 'agent' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role === 'admin' ? 'Administrador' :
                     member.role === 'supervisor' ? 'Supervisor' :
                     member.role === 'agent' ? 'Agente' : 'Visualizador'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Teléfono:</span>
                  <span className="ml-2 text-sm text-gray-900">{member.phone || 'No especificado'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Estado:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    member.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Fecha de creación:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'No disponible'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Última actualización:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {member.updatedAt ? new Date(member.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'No disponible'}
                  </span>
                </div>
              </div>
            </div>

            {/* Configuración */}
            {member.configuration && (
              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 text-gray-500 mr-2" />
                  Configuración
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Idioma:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {member.configuration.language === 'es' ? 'Español' : 
                       member.configuration.language === 'en' ? 'English' : member.configuration.language}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Zona horaria:</span>
                    <span className="ml-2 text-sm text-gray-900">{member.configuration.timezone}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tema:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {member.configuration.theme === 'light' ? 'Claro' :
                       member.configuration.theme === 'dark' ? 'Oscuro' : 'Automático'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Cierre automático:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.configuration.autoLogout 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.configuration.autoLogout ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Autenticación de dos factores:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.configuration.twoFactor 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.configuration.twoFactor ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notificaciones */}
            {member.notifications && (
              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Bell className="h-5 w-5 text-gray-500 mr-2" />
                  Notificaciones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.notifications.email 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.notifications.email ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Push:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.notifications.push 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.notifications.push ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">SMS:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.notifications.sms 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.notifications.sms ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Escritorio:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.notifications.desktop 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.notifications.desktop ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Permisos Básicos */}
            {member.permissions && (
              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 text-gray-500 mr-2" />
                  Permisos Básicos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Leer:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.permissions.read 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.permissions.read ? 'Permitido' : 'Denegado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Escribir:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.permissions.write 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.permissions.write ? 'Permitido' : 'Denegado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Aprobar:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.permissions.approve 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.permissions.approve ? 'Permitido' : 'Denegado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Configurar:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                      member.permissions.configure 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.permissions.configure ? 'Permitido' : 'Denegado'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Permisos de Módulos */}
            {member.permissions?.modules && (
              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  Permisos de Módulos
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(member.permissions.modules).map(([moduleId, permissions]) => {
                    const moduleNames: { [key: string]: string } = {
                      'dashboard': 'Dashboard',
                      'contacts': 'Clientes',
                      'campaigns': 'Campañas',
                      'team': 'Equipo',
                      'analytics': 'Analytics',
                      'ai': 'IA',
                      'settings': 'Configuración',
                      'hr': 'Recursos Humanos',
                      'clients': 'Customer Hub',
                      'notifications': 'Centro de Notificaciones',
                      'chat': 'Mensajes',
                      'internal-chat': 'Chat Interno',
                      'phone': 'Teléfono',
                      'knowledge-base': 'Base de Conocimiento',
                      'supervision': 'Supervisión',
                      'copilot': 'Copiloto IA',
                      'providers': 'Proveedores',
                      'warehouse': 'Almacén',
                      'shipping': 'Envíos',
                      'services': 'Servicios'
                    };

                    const activePermissions = Object.values(permissions).filter(Boolean).length;
                    const totalPermissions = Object.keys(permissions).length;

                    return (
                      <div key={moduleId} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {moduleNames[moduleId] || moduleId}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            activePermissions > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {activePermissions}/{totalPermissions} permisos
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(permissions).map(([permType, isActive]) => (
                            <span
                              key={permType}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                isActive 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {permType === 'read' ? 'Leer' :
                               permType === 'write' ? 'Escribir' :
                               permType === 'configure' ? 'Configurar' : permType}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Permisos de Módulos */}
            {member.permissions?.modules && (
              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  Permisos de Módulos
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(member.permissions.modules).map(([moduleId, permissions]) => {
                    const moduleNames: { [key: string]: string } = {
                      'dashboard': 'Dashboard',
                      'clients': 'Customer Hub',
                      'team': 'Equipo & Performance',
                      'notifications': 'Centro de Notificaciones',
                      'chat': 'Mensajes',
                      'internal-chat': 'Chat Interno',
                      'campaigns': 'Campañas',
                      'phone': 'Teléfono',
                      'knowledge-base': 'Base de Conocimiento',
                      'hr': 'Recursos Humanos',
                      'supervision': 'Supervisión',
                      'copilot': 'Copiloto IA',
                      'providers': 'Proveedores',
                      'warehouse': 'Almacén',
                      'shipping': 'Envíos',
                      'services': 'Servicios',
                      'analytics': 'Analytics',
                      'ai': 'IA',
                      'settings': 'Configuración',
                      'contacts': 'Contactos'
                    };

                    const moduleName = moduleNames[moduleId] || moduleId;
                    const hasAnyPermission = permissions.read || permissions.write || permissions.configure;

                    return (
                      <div key={moduleId} className={`p-4 rounded-lg border ${hasAnyPermission ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{moduleName}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${hasAnyPermission ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {hasAnyPermission ? 'Acceso Permitido' : 'Sin Acceso'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${permissions.read ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                            <span className={`text-sm ${permissions.read ? 'text-blue-700' : 'text-gray-500'}`}>
                              Leer {permissions.read ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${permissions.write ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span className={`text-sm ${permissions.write ? 'text-green-700' : 'text-gray-500'}`}>
                              Escribir {permissions.write ? '✓' : '✗'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${permissions.configure ? 'bg-purple-500' : 'bg-gray-300'}`}></span>
                            <span className={`text-sm ${permissions.configure ? 'text-purple-700' : 'text-gray-500'}`}>
                              Configurar {permissions.configure ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rendimiento */}
            <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 text-gray-500 mr-2" />
                Rendimiento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {typeof member.performance?.totalChats === 'number' ? member.performance.totalChats : 0}
                  </div>
                  <div className="text-sm text-gray-600">Chats Totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {(() => {
                      const responseTime = member.performance?.responseTime;
                      if (typeof responseTime === 'string') {
                        return responseTime;
                      } else if (typeof responseTime === 'object' && responseTime?.average) {
                        return `${responseTime.average}s`;
                      }
                      return 'N/A';
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">Tiempo de Respuesta</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    {typeof member.performance?.csat === 'number' ? member.performance.csat : 0}
                  </div>
                  <div className="text-sm text-gray-600">Satisfacción (CSAT)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {typeof member.performance?.conversionRate === 'number' ? member.performance.conversionRate : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Tasa de Conversión</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chats</h3>
                <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">
                  {member.performance?.totalChats || 0}
                </div>
                <p className="text-sm text-gray-600">Total atendidos</p>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiempo de Respuesta</h3>
                <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-2">
                  {(() => {
                    const responseTime = member.performance?.responseTime;
                    if (typeof responseTime === 'string') {
                      return responseTime;
                    } else if (typeof responseTime === 'object' && responseTime?.average) {
                      return `${responseTime.average}s`;
                    }
                    return 'N/A';
                  })()}
                </div>
                <p className="text-sm text-gray-600">Promedio</p>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Satisfacción</h3>
                <div className="text-2xl lg:text-3xl font-bold text-yellow-600 mb-2">
                  {member.performance?.csat || 0}
                </div>
                <p className="text-sm text-gray-600">CSAT Score</p>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversión</h3>
                <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-2">
                  {member.performance?.conversionRate || 0}%
                </div>
                <p className="text-sm text-gray-600">Tasa de conversión</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-4 lg:space-y-6">
            <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
                Tendencias de Actividad
              </h3>
              <div className="text-center text-gray-500 py-8">
                <p>Gráficos de tendencias se mostrarán aquí</p>
                <p className="text-sm">Implementación pendiente</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditAgentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateAgent}
        member={member}
      />
    </div>
  );
};

export default TeamMemberDetails; 