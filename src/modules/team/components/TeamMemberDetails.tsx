import React, { useState } from 'react';
import type { TeamMember } from '../../../types/team';
import { EditAgentModal } from './EditAgentModal';

interface TeamMemberDetailsProps {
  member: TeamMember;
  onRefresh: () => void;
}

const TeamMemberDetails: React.FC<TeamMemberDetailsProps> = ({
  member,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'kpis' | 'trends'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditAgent = async (agentData: {
    name: string;
    email: string;
    password: string;
    role: string;
    permissions: Record<string, boolean>;
    notifications: Record<string, boolean>;
    visualizations: Record<string, boolean>;
    settings: Record<string, string | boolean>;
  }) => {
    try {
      console.log('Actualizando agente:', agentData);
      // TODO: Implementar actualización del agente
      // Aquí se haría la llamada a la API para actualizar los datos
      
      // Simular actualización exitosa
      setTimeout(() => {
        console.log('Agente actualizado exitosamente');
        onRefresh(); // Refrescar la lista
      }, 1000);
    } catch (error) {
      console.error('Error al actualizar agente:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'kpis', label: 'KPIs' },
    { id: 'trends', label: 'Tendencias' }
  ] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Header con pestañas */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {member.initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{member.fullName}</h2>
                <p className="text-gray-600">{member.role}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">{member.email}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Editar Perfil</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reasignar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="px-6">
          <nav className="flex space-x-8" role="tablist" aria-label="Secciones de detalles del miembro">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div className="flex-1 p-6">
        {activeTab === 'overview' && (
          <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">KPIs de Rendimiento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tiempo Medio de Respuesta */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Tiempo Medio de Respuesta</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  2:15
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm text-green-600">Mejorando +5.2%</span>
                </div>
              </div>

              {/* Chats Cerrados sin Escalamiento */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Chats Cerrados sin Escalamiento</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  ---
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm text-green-600">Mejorando +15.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'kpis' && (
          <div role="tabpanel" id="panel-kpis" aria-labelledby="tab-kpis">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Métricas Detalladas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Chats Atendidos */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Chats Atendidos</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {member.performanceMetrics.chatsAttended}
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm text-green-600">+12.5%</span>
                  </div>
                </div>

                {/* Mensajes Respondidos */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Mensajes Respondidos</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ---
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm text-green-600">+8.3%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div role="tabpanel" id="panel-trends" aria-labelledby="tab-trends">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Gráficos de Tendencia</h3>
              <p className="text-sm text-gray-600 mb-4">Chats vs Ventas - últimos 30 días</p>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500">Gráfico de tendencia - últimos 30 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para editar agente */}
      <EditAgentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditAgent}
        member={member}
      />
    </div>
  );
};

export default TeamMemberDetails; 