import React, { useEffect, lazy, Suspense, useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { useTeam } from './hooks/useTeam';
import { logger } from '../../utils/logger';
import type { CreateAgentRequest } from '../../types/team';

// Componente de loading simple
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Lazy loading de componentes
const TeamHeader = lazy(() => import('./components/TeamHeader'));
const TeamList = lazy(() => import('./components/TeamList'));
const TeamMemberDetails = lazy(() => import('./components/TeamMemberDetails'));
const PermissionsPanel = lazy(() => import('./components/PermissionsPanel'));
const CoachingPanel = lazy(() => import('./components/CoachingPanel'));
const SuggestedPlan = lazy(() => import('./components/SuggestedPlan'));
const CreateAgentModal = lazy(() => import('./components/CreateAgentModal'));

const TeamModule: React.FC = () => {
  const { setCurrentModule } = useUIStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<any>(null);
  
  const { 
    members, 
    selectedMember, 
    filters,
    loading, 
    error,
    totalMembers,
    activeMembers,
    inactiveMembers,
    selectMember,
    refreshTeam,
    applyFilters,
    createAgent,
    deleteAgent
  } = useTeam();

  useEffect(() => {
    setCurrentModule('team');
    logger.systemInfo('Team module loaded', { 
      timestamp: new Date().toISOString(),
      totalMembers,
      activeMembers,
      inactiveMembers
    });
  }, [setCurrentModule, totalMembers, activeMembers, inactiveMembers]);

  const handleCreateAgent = async (agentData: CreateAgentRequest) => {
    try {
      await createAgent(agentData);
      logger.systemInfo('Agente creado exitosamente', { name: agentData.name, email: agentData.email });
      
      // ✅ ACTUALIZAR LA LISTA DE AGENTES DESPUÉS DE CREAR
      await refreshTeam();
      
      // ✅ CERRAR EL MODAL
      setIsCreateModalOpen(false);
      
    } catch (error) {
      logger.systemInfo('Error creando agente', { error, agentData });
      // El error se maneja en el hook, aquí solo log
    }
  };

  const handleDeleteAgent = (member: any) => {
    // Mostrar modal de confirmación personalizado
    setAgentToDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDeleteAgent = async () => {
    if (!agentToDelete) return;
    
    try {
      await deleteAgent(agentToDelete.id);
      logger.systemInfo('Agent deleted successfully', { agentId: agentToDelete.id });
      
      // Cerrar modal y limpiar estado
      setShowDeleteModal(false);
      setAgentToDelete(null);
      
      // Refrescar la lista
      await refreshTeam();
      
    } catch (error) {
      logger.systemInfo('Error deleting agent in TeamModule', { error });
      // Cerrar modal incluso si hay error
      setShowDeleteModal(false);
      setAgentToDelete(null);
    }
  };

  const cancelDeleteAgent = () => {
    setShowDeleteModal(false);
    setAgentToDelete(null);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };



  if (loading) {
    return (
      <div className="flex h-screen w-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando equipo...
          </h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar el equipo
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refreshTeam}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Layout principal con header integrado */}
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* Panel izquierdo - Lista de vendedores */}
        <div className="w-full lg:w-80 xl:w-96 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Header del módulo con búsqueda y filtros */}
          <div className="p-4 lg:p-6 border-b border-gray-200 bg-white">
            <Suspense fallback={<LoadingSpinner />}>
              <TeamHeader 
                filters={filters}
                onFiltersChange={applyFilters}
                onRefresh={refreshTeam}
                totalMembers={totalMembers}
                activeMembers={activeMembers}
                inactiveMembers={inactiveMembers}
                onCreateAgent={() => setIsCreateModalOpen(true)}
                onSearchChange={handleSearchChange}
                isRefreshing={loading}
              />
            </Suspense>
          </div>
          
          <div className="flex-1 min-h-0">
            <Suspense fallback={<LoadingSpinner />}>
              <TeamList 
                members={members}
                selectedMember={selectedMember}
                onSelectMember={selectMember}
                onDeleteMember={handleDeleteAgent}
                totalMembers={totalMembers}
                activeMembers={activeMembers}
                inactiveMembers={inactiveMembers}
                searchTerm={searchTerm}
              />
            </Suspense>
          </div>
        </div>

        {/* Panel central - Detalles del miembro seleccionado - Solo Desktop */}
        <div className="hidden lg:flex flex-1 bg-white flex-col min-w-0">
          {selectedMember ? (
            <Suspense fallback={<LoadingSpinner />}>
              <TeamMemberDetails 
                member={selectedMember}
                onRefresh={refreshTeam}
              />
            </Suspense>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un miembro del equipo
                </h3>
                <p className="text-gray-600">
                  Haz clic en un miembro de la lista para ver sus detalles
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Panel derecho - Permisos y Coaching - Solo Desktop */}
        <div className="hidden lg:flex w-96 xl:w-[420px] bg-white border-l border-gray-200 flex-col flex-shrink-0">
          {selectedMember ? (
            <div className="flex-1 overflow-y-auto scrollbar-medium">
              <Suspense fallback={<LoadingSpinner />}>
                <PermissionsPanel member={selectedMember} />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <CoachingPanel member={selectedMember} />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <SuggestedPlan member={selectedMember} />
              </Suspense>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">
                  Permisos y coaching aparecerán aquí
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal móvil para detalles del miembro */}
      {selectedMember && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <Suspense fallback={<LoadingSpinner />}>
              <TeamMemberDetails 
                member={selectedMember}
                onRefresh={refreshTeam}
                onClose={() => selectMember(null)}
              />
            </Suspense>
            
            {/* Paneles de permisos y coaching en móvil */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <Suspense fallback={<LoadingSpinner />}>
                <PermissionsPanel member={selectedMember} />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <CoachingPanel member={selectedMember} />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <SuggestedPlan member={selectedMember} />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nuevo agente */}
      <Suspense fallback={<LoadingSpinner />}>
        <CreateAgentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onAgentCreated={handleCreateAgent}
        />
      </Suspense>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && agentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header con gradiente rojo */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-t-2xl p-6 text-white">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-center">Eliminar Agente</h3>
              <p className="text-red-100 text-center mt-2">Esta acción no se puede deshacer</p>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Información del agente a eliminar */}
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {agentToDelete.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{agentToDelete.name}</h4>
                      <p className="text-sm text-gray-600">{agentToDelete.email}</p>
                      <p className="text-xs text-red-600 font-medium">Rol: {agentToDelete.role}</p>
                    </div>
                  </div>
                </div>

                {/* Advertencia */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h5 className="font-medium text-yellow-800">Advertencia</h5>
                      <p className="text-sm text-yellow-700 mt-1">
                        Al eliminar este agente, se perderá toda su información, historial y configuraciones. 
                        Esta acción es permanente y no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mensaje de confirmación */}
                <div className="text-center py-4">
                  <p className="text-gray-700 font-medium">
                    ¿Estás seguro de que quieres eliminar a <span className="text-red-600 font-bold">{agentToDelete.name}</span>?
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="px-6 pb-6">
              <div className="flex space-x-3">
                <button
                  onClick={cancelDeleteAgent}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteAgent}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamModule; 