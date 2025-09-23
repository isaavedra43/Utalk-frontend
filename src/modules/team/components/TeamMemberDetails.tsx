import React, { useState } from 'react';
import { X, ArrowLeft, User, BarChart3, TrendingUp, Edit, Shield, Users, Brain } from 'lucide-react';
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

      // Preparar datos para la API - Simplificados para debug
      const updateData: { name: string; email: string; role: 'admin' | 'supervisor' | 'agent' | 'viewer'; permissions?: { read: boolean; write: boolean; approve: boolean; configure: boolean }; password?: string } = {
        name: agentData.name,
        email: agentData.email,
        role: agentData.role as 'admin' | 'supervisor' | 'agent' | 'viewer'
      };

      // Solo enviar permisos si están definidos
      if (agentData.permissions) {
        updateData.permissions = agentData.permissions;
      }

      // Si hay contraseña, agregarla
      if (agentData.password.trim()) {
        updateData.password = agentData.password;
      }

      // Llamar API para actualizar agente
      // Intentar con el email como ID ya que parece ser el identificador principal
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  Información General
                </h3>
                <div className="space-y-3">
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
                    <span className="text-sm font-medium text-gray-500">Creado:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Chats atendidos:</span>
                    <span className="ml-2 text-sm text-gray-900">{member.performance?.totalChats || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 text-gray-500 mr-2" />
                  Permisos
                </h3>
                <div className="space-y-2">
                  {member.permissions && Object.entries(member.permissions).map(([key, isActive]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">
                        {key === 'read' ? 'Leer' : key === 'write' ? 'Escribir' : key === 'approve' ? 'Aprobar' : 'Configurar'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 text-gray-500 mr-2" />
                  Rendimiento
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tiempo de respuesta:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {member.performance?.responseTime?.average 
                        ? `${member.performance.responseTime.average}s` 
                        : member.performance?.averageResponseTime || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Satisfacción:</span>
                    <span className="ml-2 text-sm text-gray-900">{member.performance?.csat || 0}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Conversión:</span>
                    <span className="ml-2 text-sm text-gray-900">{member.performance?.conversionRate || 0}%</span>
                  </div>
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
                  {member.performance?.responseTime?.average 
                    ? `${member.performance.responseTime.average}s` 
                    : member.performance?.averageResponseTime || 'N/A'}
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